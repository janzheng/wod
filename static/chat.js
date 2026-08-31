/**
 * WOD Builder — Alpine.js mixin for routineStackApp().
 * Pi owns server-side conversation history; the browser sends only each prompt
 * and its opaque session ID plus a small pointer to the visible project source.
 */
function wodAgentPageContext(state, route) {
  var browserRoute = (typeof route === 'string' && route.charAt(0) === '/') ? route : '/';

  if (state.currentView === 'notes' && state.notesPath) {
    return {
      kind: 'notes',
      title: state.notesTitle || 'Training Notes',
      route: browserRoute,
      sourcePath: String(state.notesPath).replace(/^\/+/, ''),
    };
  }

  if (state.currentView === 'exercises') {
    return {
      kind: 'exercise-library',
      title: 'Exercise Library',
      route: browserRoute,
      sourcePath: 'exercises',
    };
  }

  if (state.selectedProgram) {
    var program = state.selectedProgram;
    var title = program.name || program.id || 'Program';
    if (state.selectedWeekIdx !== null && state.selectedWeekIdx !== undefined && program.weeks && program.weeks[state.selectedWeekIdx]) {
      title += ' — Week ' + program.weeks[state.selectedWeekIdx].week;
    }
    return {
      kind: 'program',
      title: title,
      route: browserRoute,
      sourcePath: 'programs/' + program.id + '.json',
    };
  }

  if (state.selectedActivity) {
    var activity = state.selectedActivity;
    return {
      kind: 'activity',
      title: activity.label || (activity.activity && activity.activity.name) || 'Activity',
      route: browserRoute,
      sourcePath: 'programs/' + activity._programId + '.json',
    };
  }

  if (state.selectedWorkout) {
    return {
      kind: 'workout',
      title: state.selectedWorkout.name || state.selectedWorkout.id || 'Workout',
      route: browserRoute,
      sourcePath: 'workouts',
    };
  }

  return {
    kind: 'app',
    title: 'WOD',
    route: browserRoute,
    sourcePath: 'main.ts',
  };
}

globalThis.wodAgentPageContext = wodAgentPageContext;

function wodAgentSessionLabel(sessionId) {
  if (!sessionId) return 'new';
  var value = String(sessionId);
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value)) return value.slice(0, 8);
  return value.length > 24 ? value.slice(0, 21) + '…' : value;
}

function wodAgentTargetLabel(context) {
  var title = context && context.title ? String(context.title) : 'WOD';
  var route = context && context.route ? String(context.route) : '/';
  return title + ' · ' + route;
}

function wodAgentPreviewUrl(messages) {
  if (!Array.isArray(messages)) return '';

  for (var index = messages.length - 1; index >= 0; index -= 1) {
    var message = messages[index];
    if (!message || message.role !== 'assistant' || typeof message.content !== 'string') continue;

    var match = message.content.match(/\/workspace\/static\/([A-Za-z0-9][A-Za-z0-9._\/-]*)/);
    if (!match) continue;

    var relativePath = match[1].replace(/[.,;:!?`'"\)\]\}]+$/, '');
    if (!relativePath || relativePath.split('/').includes('..')) continue;
    var previewUrl = '/static/' + relativePath.split('/').map(encodeURIComponent).join('/');
    var messageTimestamp = Number(message.timestamp);
    if (Number.isFinite(messageTimestamp) && messageTimestamp > 0) {
      previewUrl += '?v=' + Math.trunc(messageTimestamp);
    }
    return previewUrl;
  }

  return '';
}

globalThis.wodAgentSessionLabel = wodAgentSessionLabel;
globalThis.wodAgentTargetLabel = wodAgentTargetLabel;
globalThis.wodAgentPreviewUrl = wodAgentPreviewUrl;

function wodEscapeChatHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wodRenderChatMarkdown(text) {
  var source = String(text || '');
  if (
    typeof marked === 'undefined' || !marked.parse ||
    typeof document === 'undefined' || !document.createElement
  ) return wodEscapeChatHtml(source).replace(/\n/g, '<br>');

  var template = document.createElement('template');
  template.innerHTML = marked.parse(source, { breaks: true });
  var allowedTags = {
    A: true, B: true, BLOCKQUOTE: true, BR: true, CODE: true, DEL: true,
    EM: true, H1: true, H2: true, H3: true, H4: true, HR: true, I: true,
    LI: true, OL: true, P: true, PRE: true, STRONG: true, TABLE: true,
    TBODY: true, TD: true, TH: true, THEAD: true, TR: true, UL: true,
  };

  Array.from(template.content.querySelectorAll('*')).forEach(function(element) {
    if (!allowedTags[element.tagName]) {
      element.replaceWith(document.createTextNode(element.textContent || ''));
      return;
    }

    var href = element.tagName === 'A' ? element.getAttribute('href') : null;
    Array.from(element.attributes).forEach(function(attribute) {
      element.removeAttribute(attribute.name);
    });

    if (element.tagName !== 'A') return;
    try {
      var target = new URL(href || '', globalThis.location && globalThis.location.href || 'https://wod.invalid/');
      if (target.protocol !== 'http:' && target.protocol !== 'https:') throw new Error('unsupported link protocol');
      element.setAttribute('href', href);
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    } catch (_error) {
      element.replaceWith(document.createTextNode(element.textContent || ''));
    }
  });

  return template.innerHTML;
}

globalThis.wodRenderChatMarkdown = wodRenderChatMarkdown;

function wodAgentPause(milliseconds, signal) {
  return new Promise(function(resolve, reject) {
    var timeout = setTimeout(resolve, milliseconds);
    if (!signal) return;
    signal.addEventListener('abort', function() {
      clearTimeout(timeout);
      reject(new DOMException('aborted', 'AbortError'));
    }, { once: true });
  });
}

function chatPanel() {
  return {
    // Chat panel state
    chatOpen: false,
    chatLoading: false,
    chatInput: '',
    chatMessages: [],
    chatSessionId: null,
    chatJobId: null,
    customWorkouts: [],
    chatRequestController: null,
    chatRequestSerial: 0,

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
        this.chatJobId = localStorage.getItem('wod-chat-job-id');
      } catch (e) { /* ignore */ }
      if (this.chatJobId) this.resumeChatJob();
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

    getAgentChatUrl() {
      var base = String(globalThis.WOD_AGENT_BASE_URL || '').replace(/\/+$/, '');
      return base ? base + '/api/ai/chat' : '/api/ai/chat';
    },

    getAgentJobUrl(jobId) {
      return this.getAgentChatUrl().replace(/\/chat$/, '/jobs/') + encodeURIComponent(jobId);
    },

    getAgentPageContext() {
      return globalThis.wodAgentPageContext(this, globalThis.location?.pathname || '/');
    },

    chatSessionLabel() {
      return globalThis.wodAgentSessionLabel(this.chatSessionId);
    },

    chatTargetLabel() {
      return globalThis.wodAgentTargetLabel(this.getAgentPageContext());
    },

    chatStatusLabel() {
      if (this.chatLoading) return 'working';
      var lastMessage = this.chatMessages[this.chatMessages.length - 1];
      if (lastMessage && lastMessage.error) return 'error';
      if (lastMessage && lastMessage.role === 'assistant') return 'complete';
      return 'ready';
    },

    latestChatPreviewUrl() {
      return globalThis.wodAgentPreviewUrl(this.chatMessages);
    },

    refreshCurrentPage() {
      globalThis.location.reload();
    },

    async sendChatMessage() {
      var msg = this.chatInput.trim();
      if (!msg || this.chatLoading) return;

      var userMsg = { role: 'user', content: msg, timestamp: Date.now() };
      this.chatMessages.push(userMsg);
      this.persistChatMessages();
      this.chatInput = '';
      this.chatLoading = true;
      var requestSerial = ++this.chatRequestSerial;
      var controller = new AbortController();
      this.chatRequestController = controller;
      this.scrollChatToBottom();
      this.focusChatInput();

      try {
        var res = await fetch(this.getAgentChatUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: msg,
            sessionId: this.chatSessionId,
            pageContext: this.getAgentPageContext(),
          }),
          signal: controller.signal,
        });

        if (requestSerial !== this.chatRequestSerial) return;

        if (!res.ok) {
          var errData = await res.json().catch(function() { return {}; });
          throw new Error(errData.error || 'API error ' + res.status);
        }
        var data = await res.json();
        if (!data.jobId || !data.sessionId) throw new Error('WOD Builder returned an invalid job');
        this.chatSessionId = data.sessionId;
        this.chatJobId = data.jobId;
        localStorage.setItem('wod-chat-session-id', data.sessionId);
        localStorage.setItem('wod-chat-job-id', data.jobId);
        await this.pollChatJob(data.jobId, requestSerial, controller);
      } catch (err) {
        if (requestSerial !== this.chatRequestSerial || err.name === 'AbortError') return;
        this.chatMessages.push({
          role: 'assistant',
          content: 'Error: ' + err.message,
          error: true,
          timestamp: Date.now(),
        });
        this.persistChatMessages();
      } finally {
        if (requestSerial !== this.chatRequestSerial) return;
        this.chatRequestController = null;
        this.chatLoading = false;
        this.scrollChatToBottom();
        this.focusChatInput();
      }
    },

    async pollChatJob(jobId, requestSerial, controller) {
      while (requestSerial === this.chatRequestSerial) {
        var res;
        try {
          res = await fetch(this.getAgentJobUrl(jobId), {
            headers: { 'Accept': 'application/json' },
            signal: controller.signal,
          });
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          await wodAgentPause(2000, controller.signal);
          continue;
        }

        if (!res.ok) {
          var errData = await res.json().catch(function() { return {}; });
          throw new Error(errData.error || 'Job status error ' + res.status);
        }
        var job = await res.json();
        if (job.status === 'pending' || job.status === 'running') {
          await wodAgentPause(1500, controller.signal);
          continue;
        }

        this.chatJobId = null;
        localStorage.removeItem('wod-chat-job-id');
        if (job.status !== 'completed' || !job.result || typeof job.result.message !== 'string') {
          throw new Error(job.error || 'WOD Builder job did not complete');
        }

        this.chatSessionId = job.result.sessionId || job.sessionId || this.chatSessionId;
        if (this.chatSessionId) localStorage.setItem('wod-chat-session-id', this.chatSessionId);
        this.chatMessages.push({
          role: 'assistant',
          content: job.result.message,
          workout: job.result.workout,
          timestamp: Date.now(),
        });
        this.persistChatMessages();
        return;
      }
    },

    resumeChatJob() {
      if (!this.chatJobId || this.chatLoading) return;
      this.chatLoading = true;
      var requestSerial = ++this.chatRequestSerial;
      var controller = new AbortController();
      this.chatRequestController = controller;
      var jobId = this.chatJobId;
      this.pollChatJob(jobId, requestSerial, controller).catch((err) => {
        if (requestSerial !== this.chatRequestSerial || err.name === 'AbortError') return;
        this.chatMessages.push({
          role: 'assistant',
          content: 'Error: ' + err.message,
          error: true,
          timestamp: Date.now(),
        });
        this.persistChatMessages();
      }).finally(() => {
        if (requestSerial !== this.chatRequestSerial) return;
        this.chatRequestController = null;
        this.chatLoading = false;
        this.scrollChatToBottom();
        this.focusChatInput();
      });
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
      var sessionId = this.chatSessionId;
      this.chatRequestSerial += 1;
      if (this.chatRequestController) this.chatRequestController.abort();
      this.chatRequestController = null;
      this.chatLoading = false;
      this.chatMessages = [];
      this.chatSessionId = null;
      this.chatJobId = null;
      localStorage.removeItem('wod-chat-messages');
      localStorage.removeItem('wod-chat-session-id');
      localStorage.removeItem('wod-chat-job-id');
      if (sessionId) {
        fetch(this.getAgentChatUrl().replace(/\/chat$/, '/session'), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId }),
        }).catch(function(error) {
          console.warn('Could not clear Pi session:', error);
        });
      }
    },

    renderMarkdown(text) {
      return globalThis.wodRenderChatMarkdown(text);
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

globalThis.wodChatPanel = chatPanel;
