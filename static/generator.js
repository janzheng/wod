/**
 * Browser-compatible workout generator
 * Ported from src/cli/generator.ts
 *
 * Usage:
 *   const exercises = await fetch('./static/exercises.json').then(r => r.json());
 *   const generated = WorkoutGenerator.generate(workout, exercises);
 */

const WorkoutGenerator = {
  /**
   * Shuffle an array (Fisher-Yates)
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * Check if an exercise matches the given criteria
   */
  matchesCriteria(exercise, criteria) {
    // If specific exerciseId, only match that
    if (criteria.exerciseId) {
      return exercise.id === criteria.exerciseId;
    }

    // Check type filter (OR within array)
    if (criteria.types && criteria.types.length > 0) {
      if (!criteria.types.includes(exercise.type)) {
        return false;
      }
    }

    // Check muscle filter (OR within array)
    if (criteria.muscles && criteria.muscles.length > 0) {
      const hasMatch = criteria.muscles.some(m => exercise.muscles?.includes(m));
      if (!hasMatch) return false;
    }

    // Check tag filter (OR within array)
    if (criteria.tags && criteria.tags.length > 0) {
      const hasMatch = criteria.tags.some(t => exercise.tags?.includes(t));
      if (!hasMatch) return false;
    }

    // Check equipment filter (OR within array)
    if (criteria.equipment && criteria.equipment.length > 0) {
      const hasMatch = criteria.equipment.some(e => exercise.equipment?.includes(e));
      if (!hasMatch) return false;
    }

    // Check exclusions
    if (criteria.excludeTags && criteria.excludeTags.length > 0) {
      const hasExcluded = criteria.excludeTags.some(t => exercise.tags?.includes(t));
      if (hasExcluded) return false;
    }

    if (criteria.excludeEquipment && criteria.excludeEquipment.length > 0) {
      const hasExcluded = criteria.excludeEquipment.some(e => exercise.equipment?.includes(e));
      if (hasExcluded) return false;
    }

    // Check difficulty
    if (criteria.difficulty && exercise.difficulty !== criteria.difficulty) {
      return false;
    }

    // Check challenge filters
    if (criteria.challengeId) {
      if (!exercise.challenge || exercise.challenge.id !== criteria.challengeId) {
        return false;
      }
    }

    if (criteria.challengeCreator) {
      if (!exercise.challenge || exercise.challenge.creator !== criteria.challengeCreator) {
        return false;
      }
    }

    return true;
  },

  /**
   * Select a random exercise matching criteria
   * @param {Array} exercises - All available exercises
   * @param {Object} criteria - Selection criteria
   * @param {Set} globalUsed - Exercises used across the entire workout (prevents duplicates)
   * @param {Set} setUsed - Exercises used in this set only (for stricter set-level uniqueness)
   * @param {number} poolSize - Optional pool size limit
   * @param {Map|Object} progressions - Optional map/object of progression chains (id -> progression)
   */
  selectExercise(exercises, criteria, globalUsed, setUsed, poolSize, progressions = null) {
    // If progression is specified, pick random exercise from that chain
    if (criteria.progression && progressions) {
      const progression = progressions[criteria.progression] || 
                         (progressions instanceof Map ? progressions.get(criteria.progression) : null);
      if (progression && progression.exercises) {
        // Get all valid exercises from the progression that exist in our catalogue
        const exerciseMap = new Map(exercises.map(e => [e.id, e]));
        const validIds = progression.exercises.filter(id => exerciseMap.has(id));
        if (validIds.length > 0) {
          // Pick a random one (future: use user's level)
          const selectedId = validIds[Math.floor(Math.random() * validIds.length)];
          const exercise = exerciseMap.get(selectedId);
          if (exercise) {
            globalUsed.add(exercise.id);
            setUsed.add(exercise.id);
            return exercise;
          }
        }
      }
      // Progression not found or no valid exercises - fall through to other criteria
    }

    // Get all matching exercises
    let candidates = exercises.filter(e => this.matchesCriteria(e, criteria));

    // Limit pool size if specified (but from UNUSED candidates to prevent duplicates)
    const unusedCandidates = candidates.filter(e => !globalUsed.has(e.id));

    if (poolSize && unusedCandidates.length > poolSize) {
      candidates = this.shuffle(unusedCandidates).slice(0, poolSize);
    } else if (unusedCandidates.length > 0) {
      candidates = unusedCandidates;
    }
    // If all candidates are used globally, keep original candidates as last resort

    // Prefer exercises not used in this set
    const notInSet = candidates.filter(e => !setUsed.has(e.id));
    if (notInSet.length > 0) {
      const selected = notInSet[Math.floor(Math.random() * notInSet.length)];
      globalUsed.add(selected.id);
      setUsed.add(selected.id);
      return selected;
    }

    // If we must reuse within set, prefer ones not used globally
    const notGlobal = candidates.filter(e => !globalUsed.has(e.id));
    if (notGlobal.length > 0) {
      const selected = notGlobal[Math.floor(Math.random() * notGlobal.length)];
      globalUsed.add(selected.id);
      setUsed.add(selected.id);
      return selected;
    }

    // Last resort: return any candidate (will be duplicate)
    if (candidates.length > 0) {
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      setUsed.add(selected.id);
      return selected;
    }

    return null;
  },

  /**
   * Generate exercises for a set
   * @param {Array} setExercises - Exercise definitions for this set
   * @param {Array} exercises - All available exercises
   * @param {boolean} randomize - Whether to randomize order
   * @param {number} poolSize - Optional pool size limit
   * @param {Set} globalUsed - Exercises used across the entire workout
   * @param {Map|Object} progressions - Optional map/object of progression chains
   * @param {Array} fixedVariants - Optional array of fixed exercise sequences
   * @param {number} fixedVariantChance - Optional chance (0-1) to use a fixed variant
   */
  generateSetExercises(setExercises, exercises, randomize = false, poolSize = null, globalUsed = null, progressions = null, fixedVariants = null, fixedVariantChance = 0.3) {
    // Check if we should use a fixed variant instead
    if (fixedVariants && fixedVariants.length > 0 && Math.random() < fixedVariantChance) {
      const selectedVariant = fixedVariants[Math.floor(Math.random() * fixedVariants.length)];
      const result = [];
      
      if (!globalUsed) globalUsed = new Set();
      const setUsed = new Set();
      
      // Use exercises from the fixed variant
      for (const variantEx of selectedVariant.exercises || []) {
        let exercise = null;
        
        // If static exercise ID is provided, look it up directly
        if (variantEx.id && !variantEx.criteria) {
          exercise = exercises.find(e => e.id === variantEx.id);
        } else if (variantEx.criteria) {
          // Handle criteria-based exercises in fixed variants (e.g., progressions)
          exercise = this.selectExercise(exercises, variantEx.criteria, globalUsed, setUsed, poolSize, progressions);
        }
        
        if (exercise) {
          // Track as used
          globalUsed.add(exercise.id);
          setUsed.add(exercise.id);
          
          // Determine if this exercise slot is shuffleable (criteria-based, not fixed ID)
          const isShuffleable = !!(variantEx.criteria && !variantEx.criteria.exerciseId && !variantEx.id) || !!(variantEx.criteria && variantEx.criteria.progression);
          
          result.push({
            id: exercise.id,
            name: exercise.name,
            reps: variantEx.reps,
            duration: variantEx.duration,
            tempo: variantEx.tempo,
            notes: variantEx.notes,
            description: exercise.description,
            media: exercise.media,
            challengeDay: exercise.challenge?.day,
            challengeId: exercise.challenge?.id,
            shuffleable: isShuffleable, // Shuffleable if it has criteria (like progressions)
            _criteria: isShuffleable ? variantEx.criteria : null, // Store criteria for re-shuffling
            _poolSize: poolSize,
          });
        } else if (variantEx.id && variantEx.name) {
          // Static exercise not in catalog
          result.push({
            id: variantEx.id,
            name: variantEx.name,
            reps: variantEx.reps,
            duration: variantEx.duration,
            tempo: variantEx.tempo,
            notes: variantEx.notes,
            shuffleable: false,
          });
        } else if (variantEx.criteria) {
          // Criteria-based exercise that didn't match
          result.push({
            id: 'unknown',
            name: `[No match: ${JSON.stringify(variantEx.criteria)}]`,
            reps: variantEx.reps,
            duration: variantEx.duration,
            notes: variantEx.notes,
            shuffleable: false,
          });
        }
      }
      
      return result;
    }
    
    // Track globally used exercises (across workout) and set-level used (within this set)
    if (!globalUsed) globalUsed = new Set();
    const setUsed = new Set();
    const result = [];

    // If randomize, shuffle the order
    const orderedExercises = randomize
      ? this.shuffle(setExercises)
      : setExercises;

    for (const se of orderedExercises) {
      let exercise = null;

      // If static exercise ID is provided, look it up directly
      if (se.id && !se.criteria) {
        exercise = exercises.find(e => e.id === se.id);
      } else {
        // Otherwise use criteria-based selection
        exercise = this.selectExercise(exercises, se.criteria || {}, globalUsed, setUsed, poolSize, progressions);
      }

      // Determine if this exercise slot is shuffleable (criteria-based, not fixed)
      // Progression criteria are shuffleable (they pick random from progression chain)
      const isShuffleable = !!(se.criteria && !se.criteria.exerciseId && !se.id) || !!(se.criteria && se.criteria.progression);

      if (exercise) {
        result.push({
          id: exercise.id,
          name: exercise.name,
          reps: se.reps,
          duration: se.duration,
          tempo: se.tempo,
          notes: se.notes,
          description: exercise.description,
          media: exercise.media,
          challengeDay: exercise.challenge?.day,
          challengeId: exercise.challenge?.id,
          shuffleable: isShuffleable,
          _criteria: isShuffleable ? se.criteria : null, // Store criteria for re-shuffling
          _poolSize: poolSize,
        });
      } else if (se.id && se.name) {
        // Static exercise not found in catalog - use inline data
        result.push({
          id: se.id,
          name: se.name,
          reps: se.reps,
          duration: se.duration,
          tempo: se.tempo,
          notes: se.notes,
          description: se.description,
          media: se.media,
          challengeDay: se.challengeDay,
          challengeId: se.challengeId,
          shuffleable: false,
        });
      } else {
        // No matching exercise found
        result.push({
          id: 'unknown',
          name: `[No match: ${JSON.stringify(se.criteria || se.id)}]`,
          reps: se.reps,
          duration: se.duration,
          notes: se.notes,
          shuffleable: false,
        });
      }
    }

    return result;
  },

  /**
   * Generate a complete workout with resolved exercises
   * @param {Object} workout - Workout definition
   * @param {Array} exercises - All available exercises
   * @param {Map|Object} progressions - Optional map/object of progression chains
   * @param {Object} workoutMap - Optional map of workout IDs to workout objects (for fixedAlternatives)
   */
  generate(workout, exercises, progressions = null, workoutMap = null) {
    // Check if we should use a fixed alternative workout instead
    if (workout.fixedAlternatives && workout.fixedAlternatives.length > 0 && workoutMap) {
      const chance = workout.fixedAlternativeChance ?? 0.4;
      if (Math.random() < chance) {
        // Shuffle alternatives and try to find one that exists
        const shuffledAlternatives = this.shuffle([...workout.fixedAlternatives]);
        for (const alternativeId of shuffledAlternatives) {
          const alternativeWorkout = workoutMap[alternativeId] || (workoutMap instanceof Map ? workoutMap.get(alternativeId) : null);
          if (alternativeWorkout) {
            // Recursively generate the alternative workout (but don't check alternatives again to avoid infinite loops)
            const altWorkout = { ...alternativeWorkout, fixedAlternatives: null };
            const generated = this.generate(altWorkout, exercises, progressions, workoutMap);
            // Preserve the original workout's ID so UI can track it properly
            return { ...generated, _originalId: workout.id, _selectedAlternative: alternativeId };
          }
        }
        // If no alternative was found, log warning and fall through to generate original workout
        console.warn('No valid fixed alternative found for workout:', workout.id, 'Alternatives:', workout.fixedAlternatives);
      }
    }
    
    const generatedSets = [];
    // Track used exercises across ALL sets to prevent duplicates
    const globalUsed = new Set();

    for (const set of workout.sets || []) {
      const generatedSet = {
        ...set,
        generatedExercises: null,
      };

      if ((set.type === 'exercises' || set.type === 'superset') && set.exercises) {
        generatedSet.generatedExercises = this.generateSetExercises(
          set.exercises,
          exercises,
          set.randomize ?? false,
          set.poolSize,
          globalUsed,
          progressions,
          set.fixedVariants,
          set.fixedVariantChance ?? 0.3
        );
      }

      generatedSets.push(generatedSet);
    }

    return {
      ...workout,
      sets: generatedSets,
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Re-generate a single set
   * @param {Object} workout - Current workout state
   * @param {string} setId - ID of set to regenerate
   * @param {Array} exercises - All available exercises
   * @param {Map|Object} progressions - Optional map/object of progression chains
   */
  regenerateSet(workout, setId, exercises, progressions = null) {
    const setIndex = workout.sets.findIndex(s => s.id === setId);
    if (setIndex === -1) return workout;

    const set = workout.sets[setIndex];
    if (!set.exercises) return workout;

    // Collect exercises already used in OTHER sets to avoid duplicates
    const globalUsed = new Set();
    for (let i = 0; i < workout.sets.length; i++) {
      if (i === setIndex) continue; // Skip the set we're regenerating
      const otherSet = workout.sets[i];
      if (otherSet.generatedExercises) {
        for (const ex of otherSet.generatedExercises) {
          if (ex.id && ex.id !== 'unknown') {
            globalUsed.add(ex.id);
          }
        }
      }
    }

    const newSet = {
      ...set,
      generatedExercises: this.generateSetExercises(
        set.exercises,
        exercises,
        true, // Always randomize when manually shuffling
        set.poolSize,
        globalUsed,
        progressions
      ),
    };

    const newSets = [...workout.sets];
    newSets[setIndex] = newSet;

    return {
      ...workout,
      sets: newSets,
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Re-generate a single exercise within a set
   * @param {Object} workout - Current workout state
   * @param {string} setId - ID of set containing the exercise
   * @param {number} exerciseIndex - Index of exercise to regenerate
   * @param {Array} exercises - All available exercises
   * @param {Map|Object} progressions - Optional map/object of progression chains
   */
  regenerateExercise(workout, setId, exerciseIndex, exercises, progressions = null) {
    const setIndex = workout.sets.findIndex(s => s.id === setId);
    if (setIndex === -1) return workout;

    const set = workout.sets[setIndex];
    if (!set.generatedExercises || !set.generatedExercises[exerciseIndex]) return workout;

    const currentExercise = set.generatedExercises[exerciseIndex];
    if (!currentExercise.shuffleable || !currentExercise._criteria) return workout;

    // Collect exercises already used in the ENTIRE workout to avoid duplicates
    const globalUsed = new Set();
    for (const s of workout.sets) {
      if (s.generatedExercises) {
        for (let i = 0; i < s.generatedExercises.length; i++) {
          const ex = s.generatedExercises[i];
          // Skip the exercise we're regenerating
          if (s.id === setId && i === exerciseIndex) continue;
          if (ex.id && ex.id !== 'unknown') {
            globalUsed.add(ex.id);
          }
        }
      }
    }

    // Select a new exercise using the stored criteria
    const setUsed = new Set();
    const newExercise = this.selectExercise(
      exercises,
      currentExercise._criteria,
      globalUsed,
      setUsed,
      currentExercise._poolSize,
      progressions
    );

    if (!newExercise || newExercise.id === currentExercise.id) {
      // Couldn't find a different exercise - try again without excluding current
      const retryUsed = new Set([...globalUsed]);
      retryUsed.delete(currentExercise.id); // Allow reselecting if truly no alternatives
      const retryExercise = this.selectExercise(
        exercises,
        currentExercise._criteria,
        new Set(), // Empty global to allow any match
        new Set(),
        currentExercise._poolSize,
        progressions
      );
      if (!retryExercise) return workout;

      // Update the exercise
      const updatedExercise = {
        id: retryExercise.id,
        name: retryExercise.name,
        reps: currentExercise.reps,
        duration: currentExercise.duration,
        tempo: currentExercise.tempo,
        notes: currentExercise.notes,
        description: retryExercise.description,
        media: retryExercise.media,
        challengeDay: retryExercise.challenge?.day,
        challengeId: retryExercise.challenge?.id,
        shuffleable: true,
        _criteria: currentExercise._criteria,
        _poolSize: currentExercise._poolSize,
      };

      const newGeneratedExercises = [...set.generatedExercises];
      newGeneratedExercises[exerciseIndex] = updatedExercise;

      const newSet = { ...set, generatedExercises: newGeneratedExercises };
      const newSets = [...workout.sets];
      newSets[setIndex] = newSet;

      return {
        ...workout,
        sets: newSets,
        generatedAt: new Date().toISOString(),
      };
    }

    // Update the exercise with new selection
    const updatedExercise = {
      id: newExercise.id,
      name: newExercise.name,
      reps: currentExercise.reps,
      duration: currentExercise.duration,
      tempo: currentExercise.tempo,
      notes: currentExercise.notes,
      description: newExercise.description,
      media: newExercise.media,
      challengeDay: newExercise.challenge?.day,
      challengeId: newExercise.challenge?.id,
      shuffleable: true,
      _criteria: currentExercise._criteria,
      _poolSize: currentExercise._poolSize,
    };

    const newGeneratedExercises = [...set.generatedExercises];
    newGeneratedExercises[exerciseIndex] = updatedExercise;

    const newSet = { ...set, generatedExercises: newGeneratedExercises };
    const newSets = [...workout.sets];
    newSets[setIndex] = newSet;

    return {
      ...workout,
      sets: newSets,
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Check if a set has randomizable exercises
   * A set is randomizable if:
   * 1. set.randomize is true (shuffle order of exercises), OR
   * 2. It has criteria-based exercises (can pick different exercises)
   */
  isRandomizable(set) {
    if (set.type !== 'exercises' && set.type !== 'superset') return false;
    
    // Check both original exercises array and generatedExercises
    const exercises = set.exercises || [];
    const generatedExercises = set.generatedExercises || [];
    const exerciseCount = exercises.length || generatedExercises.length;
    
    if (exerciseCount === 0) return false;

    // 1. Randomizable if set.randomize is true (order can be shuffled)
    if (set.randomize === true && exerciseCount > 1) return true;

    // 2. Randomizable if any exercise uses criteria (can pick different exercises)
    return exercises.some(e => {
      if (e.id && !e.criteria) return false; // Static exercise ID = fixed
      if (!e.criteria) return true; // No criteria and no id = fully random
      if (e.criteria.exerciseId) return false; // Fixed exercise via criteria
      return true; // Has criteria filters (tags, equipment, etc)
    });
  },

  /**
   * Check if workout has any randomizable sets or fixed alternatives
   * Excludes warmup sets - workouts that only have warmup randomization are considered fixed
   */
  hasRandomizableSets(workout) {
    // Workouts with fixedAlternatives are shuffleable (they randomly select alternatives)
    if (workout.fixedAlternatives && workout.fixedAlternatives.length > 0) {
      return true;
    }
    // Check for randomizable sets, excluding warmup sets
    return workout.sets?.some(s => s.id !== 'warmup' && this.isRandomizable(s)) ?? false;
  },
};

// Export for ES modules (if used)
if (typeof window !== 'undefined') {
  window.WorkoutGenerator = WorkoutGenerator;
}
