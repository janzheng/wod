/**
 * Workout Timer Alpine.js Component
 * Provides countdown/countup timer functionality with scrubber control
 */

function workoutTimer() {
  return {
    // Core state
    isActive: false,
    isPaused: true,
    currentTime: 0,           // Current position in workout (seconds)
    elapsedTime: 0,           // Elapsed time in current segment (for rep-based)

    // Timeline data
    timeline: null,
    currentSegmentIndex: 0,

    // UI state
    isScrubbing: false,
    scrubPosition: 0,
    showCountdown: false,
    countdownValue: 3,

    // Settings
    audioEnabled: true,
    vibrationEnabled: true,
    countdownDuration: 3,      // Countdown seconds (0, 3, 6, 9)
    magnetizationThreshold: 3, // Percent threshold for checkpoint snapping

    // Skip countdown state
    _skipCountdownInterval: null,
    isSkipCountdown: false,

    // Audio elements (will be initialized)
    sounds: {
      transition: null,
      beep: null,
      complete: null,
    },

    // Timer interval reference
    _tickInterval: null,

    // ==================== Computed Properties ====================

    get currentSegment() {
      if (!this.timeline || !this.timeline.segments.length) return null;
      return this.timeline.segments[this.currentSegmentIndex] || null;
    },

    get nextSegment() {
      if (!this.timeline) return null;
      const nextIndex = this.currentSegmentIndex + 1;
      if (nextIndex >= this.timeline.segments.length) return null;
      return this.timeline.segments[nextIndex];
    },

    get previousSegment() {
      if (!this.timeline || this.currentSegmentIndex <= 0) return null;
      return this.timeline.segments[this.currentSegmentIndex - 1];
    },

    get progress() {
      if (!this.timeline || this.timeline.totalDuration === 0) return 0;
      return (this.currentTime / this.timeline.totalDuration) * 100;
    },

    get segmentProgress() {
      const segment = this.currentSegment;
      if (!segment || segment.duration === 0) return 0;
      const timeInSegment = this.currentTime - segment.startTime;
      return (timeInSegment / segment.duration) * 100;
    },

    get segmentTimeRemaining() {
      const segment = this.currentSegment;
      if (!segment) return 0;
      return Math.max(0, segment.endTime - this.currentTime);
    },

    get totalTimeRemaining() {
      if (!this.timeline) return 0;
      return Math.max(0, this.timeline.totalDuration - this.currentTime);
    },

    get currentCheckpointId() {
      if (!this.timeline || !this.timeline.checkpoints.length) return null;
      // Find the most recent checkpoint (highest percent <= current progress)
      const passedCheckpoints = this.timeline.checkpoints.filter(cp => cp.percent <= this.progress + 0.1);
      if (passedCheckpoints.length === 0) return this.timeline.checkpoints[0].id;
      return passedCheckpoints[passedCheckpoints.length - 1].id;
    },

    get formattedSegmentTime() {
      const segment = this.currentSegment;
      if (!segment) return '0:00';

      // For user-controlled segments, show elapsed time (counting up)
      if (segment.isUserControlled) {
        return TimelineBuilder.formatTime(this.elapsedTime);
      }

      // For timed segments, show remaining time (counting down)
      return TimelineBuilder.formatTime(this.segmentTimeRemaining);
    },

    get formattedTotalRemaining() {
      return TimelineBuilder.formatTime(this.totalTimeRemaining);
    },

    get formattedCurrentTime() {
      return TimelineBuilder.formatTime(this.currentTime);
    },

    get isWorkoutComplete() {
      if (!this.timeline) return false;
      return this.currentSegmentIndex >= this.timeline.segments.length - 1 &&
        this.currentTime >= this.timeline.totalDuration;
    },

    get isRestSegment() {
      const segment = this.currentSegment;
      return segment && (segment.type === 'rest-between' || segment.type === 'rest-after');
    },

    // ==================== Initialization ====================

    init(workout) {
      if (!workout) {
        console.warn('No workout provided to timer');
        return;
      }

      // Build timeline from workout
      this.timeline = TimelineBuilder.buildTimeline(workout);
      this.currentTime = 0;
      this.currentSegmentIndex = 0;
      this.elapsedTime = 0;
      this.isPaused = true;
      this.isActive = true;

      // Initialize audio
      this.initAudio();

      console.log('Timer initialized:', {
        workout: workout.name,
        totalDuration: TimelineBuilder.formatTime(this.timeline.totalDuration),
        segments: this.timeline.segments.length,
        checkpoints: this.timeline.checkpoints.length,
      });
    },

    initAudio() {
      // Create audio elements for chimes
      // Note: These would need actual audio files
      try {
        this.sounds.transition = new Audio('./static/sounds/transition.mp3');
        this.sounds.beep = new Audio('./static/sounds/beep.mp3');
        this.sounds.complete = new Audio('./static/sounds/complete.mp3');

        // Preload
        Object.values(this.sounds).forEach(sound => {
          if (sound) {
            sound.load();
            sound.volume = 0.7;
          }
        });
      } catch (e) {
        console.warn('Could not initialize audio:', e);
      }
    },

    // ==================== Playback Controls ====================

    play() {
      if (!this.timeline) return;

      this.isPaused = false;

      // Start tick interval if not already running
      if (!this._tickInterval) {
        this._tickInterval = setInterval(() => this.tick(), 1000);
      }
    },

    pause() {
      this.isPaused = true;

      if (this._tickInterval) {
        clearInterval(this._tickInterval);
        this._tickInterval = null;
      }
    },

    toggle() {
      if (this.isPaused) {
        this.play();
      } else {
        this.pause();
      }
    },

    stop() {
      this.pause();
      this.isActive = false;
      this.currentTime = 0;
      this.currentSegmentIndex = 0;
      this.elapsedTime = 0;
    },

    restart() {
      this.currentTime = 0;
      this.currentSegmentIndex = 0;
      this.elapsedTime = 0;
      this.play();
    },

    // ==================== Navigation ====================

    seek(percent) {
      if (!this.timeline || this.timeline.totalDuration === 0) return;

      // Apply magnetization if enabled
      const magnetizedPercent = TimelineBuilder.magnetize(
        percent,
        this.timeline.checkpoints,
        this.magnetizationThreshold
      );

      // Convert percent to time
      const targetTime = (magnetizedPercent / 100) * this.timeline.totalDuration;

      // Find segment at this time
      const result = TimelineBuilder.getSegmentAtTime(this.timeline, targetTime);
      if (result) {
        this.currentTime = targetTime;
        this.currentSegmentIndex = result.index;
        this.elapsedTime = targetTime - result.segment.startTime;
      }
    },

    seekToCheckpoint(checkpointId) {
      if (!this.timeline) return;

      const checkpoint = this.timeline.checkpoints.find(cp => cp.id === checkpointId);
      if (checkpoint) {
        this.seek(checkpoint.percent);
      }
    },

    skipToNext() {
      if (!this.timeline) return;

      // Find next checkpoint after current position
      const currentPercent = this.progress;
      const nextCheckpoint = this.timeline.checkpoints.find(cp => cp.percent > currentPercent + 0.1);

      if (nextCheckpoint) {
        this.seek(nextCheckpoint.percent);
        this.triggerSkipCountdown();
      } else if (this.currentSegmentIndex < this.timeline.segments.length - 1) {
        // No more checkpoints, jump to next segment
        this.advanceToNextSegment();
      }
    },

    skipToPrevious() {
      if (!this.timeline) return;

      const currentPercent = this.progress;

      // Find the checkpoint before current position
      // If we're within 2 seconds of current segment start, go to previous checkpoint
      const segment = this.currentSegment;
      const timeInSegment = segment ? this.currentTime - segment.startTime : 0;

      let targetPercent = 0;

      if (timeInSegment <= 2) {
        // Go to previous checkpoint
        const prevCheckpoints = this.timeline.checkpoints.filter(cp => cp.percent < currentPercent - 0.1);
        if (prevCheckpoints.length > 0) {
          targetPercent = prevCheckpoints[prevCheckpoints.length - 1].percent;
        }
      } else {
        // Go to start of current checkpoint/segment
        const currentCheckpoint = this.timeline.checkpoints
          .filter(cp => cp.percent <= currentPercent)
          .pop();
        targetPercent = currentCheckpoint ? currentCheckpoint.percent : 0;
      }

      this.seek(targetPercent);
      this.triggerSkipCountdown();
    },

    triggerSkipCountdown() {
      // Skip countdown if disabled
      if (this.countdownDuration === 0) {
        this.playChime('transition');
        return;
      }

      // Cancel any existing skip countdown
      if (this._skipCountdownInterval) {
        clearInterval(this._skipCountdownInterval);
      }

      // Pause and show countdown
      this.pause();
      this.isSkipCountdown = true;
      this.showCountdown = true;
      this.countdownValue = this.countdownDuration;
      this.playChime('beep');
      this.vibrate(100);

      this._skipCountdownInterval = setInterval(() => {
        this.countdownValue -= 1;

        if (this.countdownValue > 0) {
          this.playChime('beep');
          this.vibrate(100);
        } else {
          // Countdown complete - always auto-play
          clearInterval(this._skipCountdownInterval);
          this._skipCountdownInterval = null;
          this.showCountdown = false;
          this.isSkipCountdown = false;
          this.playChime('transition');
          this.play();
        }
      }, 1000);
    },

    skipForward(seconds = 15) {
      if (!this.timeline) return;

      const targetTime = Math.min(
        this.currentTime + seconds,
        this.timeline.totalDuration
      );
      // Directly set time without magnetization
      this.seekToTime(targetTime);
    },

    skipBackward(seconds = 15) {
      if (!this.timeline) return;

      const targetTime = Math.max(0, this.currentTime - seconds);
      // Directly set time without magnetization
      this.seekToTime(targetTime);
    },

    // Direct time seek without magnetization (for skip buttons)
    seekToTime(targetTime) {
      if (!this.timeline) return;
      const result = TimelineBuilder.getSegmentAtTime(this.timeline, targetTime);
      if (result) {
        this.currentTime = targetTime;
        this.currentSegmentIndex = result.index;
        this.elapsedTime = targetTime - result.segment.startTime;
      }
    },

    // ==================== Rep-Based Exercise Handling ====================

    markDone() {
      const segment = this.currentSegment;
      if (!segment || !segment.isUserControlled) return;

      // Skip to next checkpoint/block (like fast forward)
      this.skipToNext();
    },

    // ==================== Internal Methods ====================

    tick() {
      if (this.isPaused || !this.timeline) return;

      const segment = this.currentSegment;
      if (!segment) return;

      // Handle user-controlled (rep-based) segments differently
      if (segment.isUserControlled) {
        this.elapsedTime += 1;
        // Don't auto-advance, wait for markDone()
        return;
      }

      // Normal timed segment
      this.currentTime += 1;

      // Countdown beeps (based on countdownDuration setting)
      const remaining = Math.ceil(segment.endTime - this.currentTime);
      if (this.countdownDuration > 0 && remaining <= this.countdownDuration && remaining > 0) {
        // Only trigger once per second (when countdown changes)
        if (this.countdownValue !== remaining) {
          this.playChime('beep');
          this.vibrate(100);
        }
        this.showCountdown = true;
        this.countdownValue = remaining;
      } else {
        this.showCountdown = false;
      }

      // Check for segment transition
      if (this.currentTime >= segment.endTime) {
        this.advanceToNextSegment();
      }
    },

    advanceToNextSegment() {
      const nextIndex = this.currentSegmentIndex + 1;

      if (nextIndex >= this.timeline.segments.length) {
        // Workout complete
        this.handleWorkoutComplete();
        return;
      }

      const prevSegment = this.currentSegment;
      const nextSegment = this.timeline.segments[nextIndex];

      // Play appropriate chime
      if (nextSegment.type === 'rest-after' || nextSegment.type === 'rest-between') {
        this.playChime('transition');
      } else if (prevSegment && (prevSegment.type === 'rest-after' || prevSegment.type === 'rest-between')) {
        this.playChime('transition');
        this.vibrate(200);
      } else {
        this.playChime('transition');
      }

      this.currentSegmentIndex = nextIndex;
      this.currentTime = nextSegment.startTime;
      this.elapsedTime = 0;
      this.showCountdown = false;
    },

    handleWorkoutComplete() {
      this.pause();
      this.playChime('complete');
      this.vibrate([200, 100, 200, 100, 200]);
      console.log('Workout complete!');
    },

    // ==================== Audio & Haptics ====================

    playChime(type) {
      if (!this.audioEnabled) return;

      const sound = this.sounds[type];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => {
          // Audio play often fails without user interaction
          console.warn('Audio playback failed:', err);
        });
      }
    },

    vibrate(pattern) {
      if (!this.vibrationEnabled) return;

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch (e) {
          // Vibration not supported or failed
        }
      }
    },

    toggleAudio() {
      this.audioEnabled = !this.audioEnabled;
    },

    toggleVibration() {
      this.vibrationEnabled = !this.vibrationEnabled;
    },

    cycleCountdown() {
      // Cycle through: 3 -> 6 -> 9 -> 0 (off) -> 3
      const options = [3, 6, 9, 0];
      const currentIndex = options.indexOf(this.countdownDuration);
      const nextIndex = (currentIndex + 1) % options.length;
      this.countdownDuration = options[nextIndex];
    },

    // ==================== Scrubbing ====================

    startScrub() {
      this.isScrubbing = true;
      this.pause();
    },

    endScrub() {
      this.isScrubbing = false;
    },

    onScrub(event) {
      if (!this.isScrubbing) return;

      const target = event.target;
      const rect = target.getBoundingClientRect();
      const x = event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
      const percent = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));

      this.scrubPosition = percent;
      this.seek(percent);
    },

    // ==================== Cleanup ====================

    destroy() {
      this.pause();
      this.timeline = null;
      this.isActive = false;
    },
  };
}

// Register as global for Alpine.js
if (typeof window !== 'undefined') {
  window.workoutTimer = workoutTimer;
}
