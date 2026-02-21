/**
 * Timeline Builder for WOD Timer
 * Transforms workout JSON into a flat timeline of segments with checkpoints
 */

const TimelineBuilder = {
  // Default duration per rep (seconds) for rep-based exercises
  DEFAULT_REP_DURATION: 3,

  /**
   * Estimate duration for rep-based exercises
   * @param {string|number} reps - Rep count (e.g., "10-12", 10, "8")
   * @returns {number} Estimated duration in seconds
   */
  estimateRepDuration(reps) {
    if (!reps) return 30; // Default fallback

    // Parse rep ranges like "10-12" -> use higher number
    const repStr = String(reps);
    const match = repStr.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      const repCount = match[2] ? parseInt(match[2]) : parseInt(match[1]);
      return repCount * this.DEFAULT_REP_DURATION;
    }

    return 30; // Fallback
  },

  /**
   * Build a flat timeline from a workout
   * @param {Object} workout - Generated workout with sets and exercises
   * @returns {Object} Timeline with segments and checkpoints
   */
  buildTimeline(workout) {
    const segments = [];
    let currentTime = 0;

    if (!workout || !workout.sets) {
      return { segments: [], totalDuration: 0, checkpoints: [] };
    }

    for (const set of workout.sets) {
      const rounds = set.rounds || 1;
      const setStartTime = currentTime;

      // Mark the first segment of this set as a checkpoint
      let isFirstSegmentOfSet = true;

      for (let round = 1; round <= rounds; round++) {
        // Handle different set types
        if (set.type === 'exercises' || set.type === 'superset' || !set.type) {
          const exercises = set.generatedExercises || set.exercises || [];

          for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];
            const hasExplicitDuration = typeof ex.duration === 'number';
            const duration = hasExplicitDuration
              ? ex.duration
              : this.estimateRepDuration(ex.reps);

            segments.push({
              id: `${set.id}-r${round}-ex${i}`,
              type: 'exercise',
              startTime: currentTime,
              endTime: currentTime + duration,
              duration,
              setId: set.id,
              setName: set.name,
              roundNumber: round,
              totalRounds: rounds,
              exerciseIndex: i,
              totalExercises: exercises.length,
              exerciseName: ex.name || ex.id || 'Exercise',
              exerciseId: ex.id,
              reps: ex.reps,
              notes: ex.notes,
              media: ex.media,
              isCheckpoint: isFirstSegmentOfSet,
              checkpointLabel: isFirstSegmentOfSet ? set.name : null,
              isUserControlled: !hasExplicitDuration && !!ex.reps,
            });

            isFirstSegmentOfSet = false;
            currentTime += duration;

            // Rest between exercises (not after last exercise in round)
            if (i < exercises.length - 1 && set.restBetween) {
              segments.push({
                id: `${set.id}-r${round}-rest-ex${i}`,
                type: 'rest-between',
                startTime: currentTime,
                endTime: currentTime + set.restBetween,
                duration: set.restBetween,
                setId: set.id,
                setName: set.name,
                exerciseName: 'Rest',
                roundNumber: round,
                isCheckpoint: false,
              });
              currentTime += set.restBetween;
            }
          }

          // Rest between rounds (not after last round)
          if (round < rounds && set.restBetween) {
            segments.push({
              id: `${set.id}-r${round}-round-rest`,
              type: 'rest-between',
              startTime: currentTime,
              endTime: currentTime + set.restBetween,
              duration: set.restBetween,
              setId: set.id,
              setName: set.name,
              exerciseName: 'Rest',
              roundNumber: round,
              isCheckpoint: false,
            });
            currentTime += set.restBetween;
          }
        } else if (set.type === 'activity') {
          // Activity type (like rowing intervals, running)
          const durationMinutes = set.activity?.duration || 5;
          const duration = durationMinutes * 60; // Convert to seconds

          segments.push({
            id: `${set.id}-r${round}-activity`,
            type: 'activity',
            startTime: currentTime,
            endTime: currentTime + duration,
            duration,
            setId: set.id,
            setName: set.name || set.activity?.name || 'Activity',
            exerciseName: set.activity?.name || 'Activity',
            roundNumber: round,
            totalRounds: rounds,
            notes: set.activity?.notes,
            intensity: set.activity?.intensity,
            isCheckpoint: isFirstSegmentOfSet,
            checkpointLabel: isFirstSegmentOfSet ? (set.name || set.activity?.name) : null,
            isUserControlled: false,
          });

          isFirstSegmentOfSet = false;
          currentTime += duration;
        } else if (set.type === 'rest') {
          // Dedicated rest set
          const duration = set.restDuration || 60;

          segments.push({
            id: `${set.id}-rest`,
            type: 'rest-after',
            startTime: currentTime,
            endTime: currentTime + duration,
            duration,
            setId: set.id,
            setName: set.name || 'Rest',
            exerciseName: 'Rest',
            isCheckpoint: isFirstSegmentOfSet,
            checkpointLabel: isFirstSegmentOfSet ? (set.name || 'Rest') : null,
          });

          isFirstSegmentOfSet = false;
          currentTime += duration;
        }
      }

      // Rest after set (if specified)
      if (set.restAfter && set.restAfter > 0) {
        segments.push({
          id: `${set.id}-rest-after`,
          type: 'rest-after',
          startTime: currentTime,
          endTime: currentTime + set.restAfter,
          duration: set.restAfter,
          setId: set.id,
          setName: 'Rest',
          exerciseName: 'Rest',
          isCheckpoint: true,
          checkpointLabel: 'Rest',
        });
        currentTime += set.restAfter;
      }
    }

    const checkpoints = this.extractCheckpoints(segments);

    return {
      workoutId: workout.id,
      workoutName: workout.name,
      totalDuration: currentTime,
      segments,
      checkpoints,
    };
  },

  /**
   * Extract set-level checkpoints from segments
   * @param {Array} segments - Timeline segments
   * @returns {Array} Checkpoints with time and percent positions
   */
  extractCheckpoints(segments) {
    if (!segments.length) return [];

    const totalDuration = segments[segments.length - 1].endTime;
    const checkpoints = [];

    for (const segment of segments) {
      if (segment.isCheckpoint) {
        checkpoints.push({
          id: segment.id,
          time: segment.startTime,
          percent: totalDuration > 0 ? (segment.startTime / totalDuration) * 100 : 0,
          label: segment.checkpointLabel || segment.setName,
          segmentId: segment.id,
          setId: segment.setId,
          type: segment.type,
        });
      }
    }

    return checkpoints;
  },

  /**
   * Find the segment at a given time
   * @param {Object} timeline - Timeline object
   * @param {number} time - Time in seconds
   * @returns {Object|null} Segment at that time
   */
  getSegmentAtTime(timeline, time) {
    if (!timeline || !timeline.segments) return null;

    for (let i = 0; i < timeline.segments.length; i++) {
      const segment = timeline.segments[i];
      if (time >= segment.startTime && time < segment.endTime) {
        return { segment, index: i };
      }
    }

    // Return last segment if time exceeds total
    if (timeline.segments.length > 0) {
      const lastIndex = timeline.segments.length - 1;
      return { segment: timeline.segments[lastIndex], index: lastIndex };
    }

    return null;
  },

  /**
   * Find nearest checkpoint for magnetization
   * @param {Array} checkpoints - Checkpoint array
   * @param {number} percent - Current scrub position (0-100)
   * @param {number} threshold - Snap threshold in percent (default 3%)
   * @returns {Object|null} Nearest checkpoint within threshold, or null
   */
  findNearestCheckpoint(checkpoints, percent, threshold = 3) {
    if (!checkpoints || !checkpoints.length) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const cp of checkpoints) {
      // Skip rest checkpoints — only snap to exercise checkpoints
      if (cp.type === 'rest-after' || cp.type === 'rest-between') continue;

      const distance = Math.abs(cp.percent - percent);
      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        nearest = cp;
      }
    }

    return nearest;
  },

  /**
   * Magnetize a scrub position to nearby checkpoint
   * @param {number} percent - Current scrub position (0-100)
   * @param {Array} checkpoints - Checkpoint array
   * @param {number} threshold - Snap threshold in percent
   * @returns {number} Magnetized position (snapped or original)
   */
  magnetize(percent, checkpoints, threshold = 3) {
    const nearest = this.findNearestCheckpoint(checkpoints, percent, threshold);
    return nearest ? nearest.percent : percent;
  },

  /**
   * Format seconds to MM:SS or HH:MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    if (seconds < 0) seconds = 0;

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.TimelineBuilder = TimelineBuilder;
}
