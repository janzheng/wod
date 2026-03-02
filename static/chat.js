/**
 * AI Chat Panel — Alpine.js mixin for routineStackApp().
 * Manages chat conversation, API calls, context injection, and custom workouts.
 */
function chatPanel() {
  return {
    // Chat panel state
    chatOpen: false,
    chatLoading: false,
    chatInput: '',
    chatMessages: [],
    chatSessionId: null,
    customWorkouts: [],

    initChat() {
      try {
        const stored = localStorage.getItem('wod-custom-workouts');
        if (stored) this.customWorkouts = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load custom workouts:', e);
      }
      try {
        const storedMessages = localStorage.getItem('wod-chat-messages');
        if (storedMessages) this.chatMessages = JSON.parse(storedMessages);
        this.chatSessionId = localStorage.getItem('wod-chat-session-id');
      } catch (e) { /* ignore */ }
    },

    toggleChat() {
      this.chatOpen = !this.chatOpen;
      if (this.chatOpen && this.isMobile) {
        this.sidebarOpen = false;
      }
      if (this.chatOpen) {
        this.$nextTick(() => {
          const input = document.querySelector('.chat-input-field');
          if (input) input.focus();
          this.scrollChatToBottom();
        });
      }
    },

    getChatContext() {
      const workout = this.generatedWorkout || this.selectedWorkout;
      if (!workout) return null;
      return {
        id: workout.id,
        name: workout.name,
        description: workout.description,
        difficulty: workout.difficulty,
        estimatedDuration: workout.estimatedDuration,
        equipment: workout.equipment,
        tags: workout.tags,
        sets: (workout.sets || []).map(function(s) {
          return {
            name: s.name,
            type: s.type,
            rounds: s.rounds,
            exercises: (s.generatedExercises || s.exercises || []).map(function(e) {
              return { name: e.name, reps: e.reps, duration: e.duration, notes: e.notes };
            }),
          };
        }),
      };
    },

    async sendChatMessage() {
      var msg = this.chatInput.trim();
      if (!msg || this.chatLoading) return;

      var ctx = this.getChatContext();
      var userMsg = { role: 'user', content: msg, timestamp: Date.now() };
      if (ctx) userMsg.workoutContext = ctx;
      this.chatMessages.push(userMsg);
      this.chatInput = '';
      this.chatLoading = true;
      this.scrollChatToBottom();
      this.focusChatInput();

      try {
        // Build recent history for LLM context (last 20 messages, skip the one we just pushed)
        var recentHistory = this.chatMessages.slice(-21, -1).map(function(m) {
          var entry = { role: m.role, content: m.content };
          if (m.workoutContext) entry.workoutContext = m.workoutContext;
          return entry;
        });

        var res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: msg,
            sessionId: this.chatSessionId,
            workoutContext: this.getChatContext(),
            history: recentHistory,
            enableCritic: true,
          }),
        });

        if (!res.ok) {
          var errData = await res.json().catch(function() { return {}; });
          throw new Error(errData.error || 'API error ' + res.status);
        }
        var data = await res.json();

        this.chatSessionId = data.sessionId;
        localStorage.setItem('wod-chat-session-id', data.sessionId);

        this.chatMessages.push({
          role: 'assistant',
          content: data.message,
          workout: data.workout,
          timestamp: Date.now(),
        });

        this.persistChatMessages();
      } catch (err) {
        this.chatMessages.push({
          role: 'assistant',
          content: 'Error: ' + err.message,
          error: true,
          timestamp: Date.now(),
        });
      } finally {
        this.chatLoading = false;
        this.scrollChatToBottom();
        this.focusChatInput();
      }
    },

    applyAIWorkout(workout) {
      if (!workout) return;
      var id = workout._isCustom ? workout.id : ('custom-' + Date.now());
      var customWorkout = Object.assign({}, workout, {
        id: id,
        _isCustom: true,
        _createdAt: workout._createdAt || Date.now(),
      });

      // Only add to custom list if not already there
      if (!this.customWorkouts.find(function(w) { return w.id === customWorkout.id; })) {
        this.customWorkouts.push(customWorkout);
        this.persistCustomWorkouts();
      }

      // Set as active workout
      this.generatedWorkout = Object.assign({}, customWorkout, {
        generatedAt: new Date().toISOString(),
        sets: (customWorkout.sets || []).map(function(s) {
          return Object.assign({}, s, {
            generatedExercises: s.generatedExercises || s.exercises || [],
          });
        }),
      });
      this.selectedWorkoutId = customWorkout.id;

      if (this.isMobile) {
        this.chatOpen = false;
      }
    },

    removeCustomWorkout(workoutId) {
      this.customWorkouts = this.customWorkouts.filter(function(w) { return w.id !== workoutId; });
      this.persistCustomWorkouts();
      if (this.selectedWorkoutId === workoutId) {
        this.selectedWorkoutId = null;
        this.generatedWorkout = null;
      }
    },

    persistCustomWorkouts() {
      try {
        localStorage.setItem('wod-custom-workouts', JSON.stringify(this.customWorkouts));
      } catch (e) {
        console.warn('Failed to persist custom workouts:', e);
      }
    },

    persistChatMessages() {
      try {
        var toSave = this.chatMessages.slice(-50);
        localStorage.setItem('wod-chat-messages', JSON.stringify(toSave));
      } catch (e) { /* ignore */ }
    },

    clearChat() {
      this.chatMessages = [];
      this.chatSessionId = null;
      localStorage.removeItem('wod-chat-messages');
      localStorage.removeItem('wod-chat-session-id');
    },

    renderMarkdown(text) {
      if (!text) return '';
      if (typeof marked !== 'undefined' && marked.parse) {
        return marked.parse(text, { breaks: true });
      }
      // Fallback: escape HTML and convert newlines
      return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>');
    },

    scrollChatToBottom() {
      this.$nextTick(function() {
        var container = document.querySelector('.chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    focusChatInput() {
      this.$nextTick(function() {
        var input = document.querySelector('.chat-input-field');
        if (input) input.focus();
      });
    },
  };
}
