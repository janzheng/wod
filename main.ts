import { Hono } from "hono";

const app = new Hono();

// PWA Manifest
const MANIFEST = {
  name: "Workouts of the Day",
  short_name: "WOD",
  description: "Workout generator with timers and shuffleable routines",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#374151",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
  ]
};

// Service Worker
const SERVICE_WORKER = `
const CACHE_NAME = 'wod-v2';
const STATIC_ASSETS = ['/', '/static/generator.js', '/static/timeline.js', '/static/timer.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
`;

// SVG Icon (dumbbell icon)
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#374151"/>
  <g transform="translate(80, 160)" fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M56 64v64M56 128h240M296 64v64M16 88v16M336 88v16M16 48v96M336 48v96"/>
  </g>
</svg>`;

// Helper to read JSON files
async function readJson(path: string) {
  try {
    const text = await Deno.readTextFile(new URL(path, import.meta.url));
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// API Routes for JSON data
app.get("/api/routines", async (c) => {
  // Load all routine files
  const routines = [];
  const routineFiles = ['barre', 'cardio', 'gym', 'calisthenics', 'morning', 'yoga', 'action-jacqueline', 'challenges', 'maternity', 'heavy-duty', 'jump-rope', 'kettlebell', 'snippets'];
  for (const id of routineFiles) {
    const data = await readJson(`./routines/${id}.json`);
    if (data) routines.push(data);
  }
  return c.json(routines);
});

app.get("/api/routines/:id", async (c) => {
  const id = c.req.param("id");
  const data = await readJson(`./routines/${id}.json`);
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json(data);
});

app.get("/api/saved", async (c) => {
  // Load all saved workout files
  const savedWorkouts = [];
  const savedFiles = ['aj-standing-barre', 'aj-floor-barre', 'aj-random-4', 'morning-wakeup', 'apartment-gym', '4x4x3-block', 'squat-rack', 'machine-circuit', 'gentle-yoga', 'hip-lower-back-flow', 'reddit-rrr', 'gym-classic-workouts', 'calisthenics-classic-workouts', 'kb-random-circuit'];
  for (const id of savedFiles) {
    const data = await readJson(`./saved/${id}.json`);
    if (data) savedWorkouts.push(data);
  }
  return c.json(savedWorkouts);
});

app.get("/api/saved/:id", async (c) => {
  const id = c.req.param("id");
  const data = await readJson(`./saved/${id}.json`);
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json(data);
});

app.get("/api/exercises", async (c) => {
  const data = await readJson("./static/exercises.json");
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json(data);
});

app.get("/api/workouts", async (c) => {
  const data = await readJson("./static/workouts.json");
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json(data);
});

app.get("/api/workouts/*", async (c) => {
  const path = c.req.path.replace("/api/workouts/", "");
  const data = await readJson(`./workouts/${path}`);
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json(data);
});

app.get("/api/progressions", async (c) => {
  // Load all progression files
  const progressions = [];
  const progressionFiles = [
    "dip-progression",
    "hinge-progression",
    "pull-up-progression",
    "push-up-progression",
    "row-progression",
    "squat-progression",
  ];
  for (const id of progressionFiles) {
    const data = await readJson(`./progressions/${id}.json`);
    if (data) progressions.push(data);
  }
  return c.json(progressions);
});

// Serve static files (images, js, sounds)
app.get("/static/*", async (c) => {
  const path = c.req.path.replace("/static/", "./static/");
  const contentTypes: Record<string, string> = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "js": "application/javascript",
    "json": "application/json",
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "css": "text/css",
  };

  // Try to read the file directly first
  try {
    const file = await Deno.readFile(new URL(path, import.meta.url));
    const ext = path.split(".").pop()?.toLowerCase();
    const contentType = contentTypes[ext || ""] || "application/octet-stream";
    return new Response(file, { headers: { "Content-Type": contentType } });
  } catch {
    // If it's an image request, try alternate extensions (png <-> jpg <-> jpeg)
    const ext = path.split(".").pop()?.toLowerCase();
    if (ext === "png" || ext === "jpg" || ext === "jpeg") {
      const altExts = ["png", "jpg", "jpeg"].filter(e => e !== ext);
      for (const altExt of altExts) {
        const altPath = path.replace(/\.(png|jpg|jpeg)$/i, `.${altExt}`);
        try {
          const file = await Deno.readFile(new URL(altPath, import.meta.url));
          const contentType = contentTypes[altExt] || "application/octet-stream";
          return new Response(file, { headers: { "Content-Type": contentType } });
        } catch {
          // Try next extension
        }
      }
    }
    return c.text("Not found", 404);
  }
});

// PWA Routes
app.get("/manifest.json", (c) => {
  return c.json(MANIFEST);
});

app.get("/sw.js", (c) => {
  return new Response(SERVICE_WORKER, {
    headers: { "Content-Type": "application/javascript" }
  });
});

app.get("/icon-192.png", async (c) => {
  try {
    // Try to load from static file first
    const staticPath = new URL("./static/icon-192.png", import.meta.url);
    const file = await Deno.readFile(staticPath);
    return new Response(file, { headers: { "Content-Type": "image/png" } });
  } catch {
    // Fallback: return SVG as image
    return new Response(ICON_SVG, { headers: { "Content-Type": "image/svg+xml" } });
  }
});

app.get("/icon-512.png", async (c) => {
  try {
    // Try to load from static file first
    const staticPath = new URL("./static/icon-512.png", import.meta.url);
    const file = await Deno.readFile(staticPath);
    return new Response(file, { headers: { "Content-Type": "image/png" } });
  } catch {
    // Fallback: return SVG as image
    return new Response(ICON_SVG, { headers: { "Content-Type": "image/svg+xml" } });
  }
});

// Main page - also handle workout deep links
app.get("/*", async (c) => {
  const css = await Deno.readTextFile(new URL("./styles.css", import.meta.url)).catch(() => "");
  const generatorJs = await Deno.readTextFile(new URL("./static/generator.js", import.meta.url)).catch(() => "");
  const timelineJs = await Deno.readTextFile(new URL("./static/timeline.js", import.meta.url)).catch(() => "");
  const timerJs = await Deno.readTextFile(new URL("./static/timer.js", import.meta.url)).catch(() => "");

  return c.html(renderPage(css, generatorJs, timelineJs, timerJs));
});

function renderPage(css: string, generatorJs: string, timelineJs: string, timerJs: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workouts of the Day</title>
  <!-- PWA Meta Tags -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#374151">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="WOD">
  <link rel="apple-touch-icon" href="/icon-192.png">
  <script src="https://code.iconify.design/3/3.1.1/iconify.min.js"></script>
  <style>${css}</style>
</head>
<body>

<div id="app" x-data="routineStackApp()">
  <div
    class="sidebar-provider"
    :data-state="sidebarOpen ? 'open' : 'closed'"
    @keydown.escape.window="handleKeydown($event)"
  >
    <!-- Sidebar Wrapper -->
    <div class="sidebar-wrapper">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-header-content">
            <span class="iconify sidebar-icon" data-icon="lucide:dumbbell" style="color: #374151;"></span>
            <span class="sidebar-title">Workouts of the Day</span>
          </div>
          <button class="sidebar-close-mobile" @click="sidebarOpen = false" aria-label="Close sidebar">
            <span class="iconify" data-icon="lucide:x"></span>
          </button>
        </div>

        <div class="sidebar-content">
          <div class="sidebar-group">
            <div class="sidebar-group-label">Saved Workouts</div>
            <nav class="sidebar-menu">
              <template x-if="loading">
                <div class="sidebar-loading">
                  <span class="iconify" data-icon="lucide:loader-2" style="animation: spin 1s linear infinite;"></span>
                  <span>Loading...</span>
                </div>
              </template>
              <template x-if="!loading && savedWorkouts.length === 0">
                <div class="sidebar-empty">
                  <span class="iconify" data-icon="lucide:inbox"></span>
                  <span>No saved workouts</span>
                </div>
              </template>
              <template x-for="(workout, idx) in savedWorkouts" :key="'saved-' + idx + '-' + workout.id">
                <div class="sidebar-menu-item">
                  <button
                    class="sidebar-menu-button"
                    :class="{ 'active': selectedWorkoutId === workout.id }"
                    @click="selectWorkout(workout.id)"
                  >
                    <span class="iconify sidebar-icon" :data-icon="getWorkoutIcon(workout)"></span>
                    <span class="sidebar-menu-label" x-text="workout.name"></span>
                    <span class="sidebar-menu-badge" x-show="workout.estimatedDuration" x-text="workout.estimatedDuration + 'm'"></span>
                  </button>
                </div>
              </template>
            </nav>
          </div>

          <div class="sidebar-group">
            <div class="sidebar-group-label">Categories</div>
            <div class="folder-tree">
              <template x-for="(routine, routineIdx) in routines" :key="'folder-' + routineIdx + '-' + routine.id">
                <div class="folder-tree-folder" x-data="{ expanded: false }">
                  <div class="folder-tree-folder-row" @click="expanded = !expanded">
                    <button class="folder-tree-toggle" @click.stop="expanded = !expanded">
                      <svg class="folder-tree-chevron" :class="{ 'rotated': expanded }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                    <span class="iconify folder-tree-icon" :data-icon="expanded ? 'lucide:folder-open' : 'lucide:folder'"></span>
                    <span class="folder-tree-name" x-text="routine.name"></span>
                    <span class="folder-tree-count" x-text="getRoutineWorkoutCount(routine.id)"></span>
                  </div>
                  <div class="folder-tree-contents" x-show="expanded" x-collapse>
                    <template x-for="(workout, workoutIdx) in getWorkoutsByRoutine(routine.id)" :key="'item-' + routineIdx + '-' + workoutIdx + '-' + workout.id">
                      <div class="folder-tree-item" :class="{ 'active': selectedWorkoutId === workout.id }" @click="selectWorkout(workout.id)">
                        <button class="folder-tree-item-btn">
                          <span x-show="isWorkoutShuffleable(workout)" class="iconify folder-tree-shuffle-icon" data-icon="lucide:shuffle"></span>
                          <span x-text="workout.name"></span>
                        </button>
                        <span class="folder-tree-item-badge" x-show="workout.estimatedDuration" x-text="workout.estimatedDuration + 'm'"></span>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-footer-info">
            <span class="text-xs text-muted">
              <span x-text="savedWorkouts.length"></span> saved ·
              <span x-text="allWorkouts.length"></span> total
            </span>
          </div>
        </div>
      </aside>
    </div>

    <div class="sidebar-overlay" @click="sidebarOpen = false" aria-hidden="true"></div>

    <main class="sidebar-inset">
      <header class="sidebar-inset-header">
        <button class="sidebar-trigger" @click="sidebarOpen = !sidebarOpen">
          <span class="iconify sidebar-trigger-icon" :class="{ 'rotated': !sidebarOpen }" data-icon="lucide:panel-left"></span>
        </button>
        <h1 class="sidebar-inset-title" x-text="selectedWorkout ? selectedWorkout.name : 'Select a Workout'"></h1>
      </header>

      <div class="sidebar-inset-content">
        <template x-if="!selectedWorkout && !loading">
          <div class="empty-state">
            <div class="empty-state-icon">
              <span class="iconify" data-icon="lucide:dumbbell"></span>
            </div>
            <h2 class="empty-state-title">Select a Workout</h2>
            <p class="empty-state-description">Choose a saved workout from the sidebar to view its details.</p>
          </div>
        </template>

        <template x-if="loading">
          <div class="loading-state">
            <span class="iconify" data-icon="lucide:loader-2"></span>
            <span>Loading workouts...</span>
          </div>
        </template>

        <template x-if="selectedWorkout && !loading">
          <div class="workout-detail">
            <div class="workout-header">
              <div class="workout-meta">
                <template x-if="selectedWorkout.estimatedDuration">
                  <span class="workout-tag">
                    <span class="iconify" data-icon="lucide:clock"></span>
                    <span x-text="selectedWorkout.estimatedDuration + ' min'"></span>
                  </span>
                </template>
                <template x-for="(tag, tagIdx) in (selectedWorkout.tags || []).slice(0, 3)" :key="'tag-' + tagIdx">
                  <span class="workout-tag" x-text="tag"></span>
                </template>
                <!-- Source link -->
                <template x-if="selectedWorkout.sourceUrl">
                  <a class="workout-tag workout-source-link" :href="selectedWorkout.sourceUrl" target="_blank" rel="noopener" @click.stop>
                    <span class="iconify" data-icon="lucide:external-link"></span>
                    <span x-text="selectedWorkout.source || 'Source'"></span>
                  </a>
                </template>
                <template x-if="!selectedWorkout.sourceUrl && selectedWorkout.source">
                  <span class="workout-tag workout-source-tag">
                    <span x-text="selectedWorkout.source"></span>
                  </span>
                </template>
              </div>
              <template x-if="selectedWorkout.description">
                <p class="workout-description" x-text="selectedWorkout.description"></p>
              </template>
              <template x-if="selectedWorkout.tips && selectedWorkout.tips.length > 0">
                <p class="workout-tips-inline">
                  <template x-for="(tip, tipIdx) in selectedWorkout.tips" :key="'tip-' + tipIdx">
                    <span><span x-text="tip"></span><span x-show="tipIdx < selectedWorkout.tips.length - 1"> · </span></span>
                  </template>
                </p>
              </template>
            </div>

            <template x-if="!timerMode">
              <div class="workout-controls">
                <div class="workout-controls-buttons">
                  <template x-if="canShuffle">
                    <button class="shuffle-btn" @click="shuffleWorkout()">
                      <span class="iconify" data-icon="lucide:shuffle"></span>
                      <span>Shuffle All</span>
                    </button>
                  </template>
                  <template x-if="generatedWorkout">
                    <button class="timer-start-btn" @click="startTimer()">
                      <span class="iconify" data-icon="lucide:play-circle"></span>
                      <span>Start Timer</span>
                    </button>
                  </template>
                </div>
                <template x-if="generatedWorkout">
                  <span class="shuffle-hint">
                    Generated: <span x-text="new Date(generatedWorkout.generatedAt).toLocaleTimeString()"></span>
                  </span>
                </template>
              </div>
            </template>

            <!-- Inline Timer -->
            <template x-if="timerMode && timer">
              <div class="timer-inline" x-data="{ expanded: true, scrubbing: false }">
                <div class="timer-inline-row1">
                  <span class="timer-inline-context" x-text="timer.currentSegment?.setName"></span>
                  <span class="timer-inline-exercise" x-text="timer.currentSegment?.exerciseName || timer.currentSegment?.setName || 'Starting...'"></span>
                  <template x-if="timer.currentSegment?.notes">
                    <span class="timer-inline-notes" x-text="timer.currentSegment.notes"></span>
                  </template>
                </div>
                <div class="timer-inline-row2">
                  <div class="timer-inline-controls">
                    <button class="timer-inline-btn" @click="timer.skipToPrevious()"><span class="iconify" data-icon="lucide:skip-back"></span></button>
                    <button class="timer-inline-btn timer-inline-play" @click="timer.toggle()"><span class="iconify" :data-icon="timer.isPaused ? 'lucide:play' : 'lucide:pause'"></span></button>
                    <button class="timer-inline-btn" @click="timer.skipToNext()"><span class="iconify" data-icon="lucide:skip-forward"></span></button>
                  </div>
                  <div class="timer-inline-time" :class="{ 'is-countdown': timer.showCountdown, 'is-rest': timer.isRestSegment }">
                    <span x-text="timer.showCountdown ? timer.countdownValue : timer.formattedSegmentTime"></span>
                  </div>
                  <div class="timer-inline-actions">
                    <button class="timer-inline-btn" @click="expanded = !expanded">
                      <span class="iconify" :data-icon="expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"></span>
                    </button>
                    <button class="timer-inline-btn timer-inline-exit" @click="exitTimer()">
                      <span class="iconify" data-icon="lucide:x"></span>
                    </button>
                  </div>
                </div>
                <div class="timer-inline-expanded" x-show="expanded" x-collapse>
                  <div class="timer-inline-scrubber" @mousedown="scrubbing = true; timer.startScrub()" @mouseup="scrubbing = false; timer.endScrub()" @mouseleave="if (scrubbing) { scrubbing = false; timer.endScrub(); }" @mousemove="if (scrubbing) timer.onScrub($event)" @touchstart="scrubbing = true; timer.startScrub()" @touchend="scrubbing = false; timer.endScrub()" @touchmove="if (scrubbing) timer.onScrub($event)" @click="timer.seek(($event.offsetX / $event.target.offsetWidth) * 100)">
                    <div class="timer-inline-track">
                      <div class="timer-inline-progress" :style="'width: ' + timer.progress + '%'"></div>
                    </div>
                    <template x-for="(cp, idx) in timer.timeline?.checkpoints || []" :key="'icp-' + idx">
                      <div class="timer-inline-checkpoint" :class="{ 'passed': timer.progress >= cp.percent }" :style="'left: ' + cp.percent + '%'" @click.stop="timer.seekToCheckpoint(cp.id)"></div>
                    </template>
                  </div>
                  <div class="timer-inline-meta">
                    <span x-text="timer.formattedCurrentTime"></span>
                    <div class="timer-inline-settings">
                      <button class="timer-setting-btn-sm" :class="{ 'active': timer.audioEnabled }" @click="timer.toggleAudio()">
                        <span class="iconify" :data-icon="timer.audioEnabled ? 'lucide:volume-2' : 'lucide:volume-x'"></span>
                      </button>
                      <button class="timer-setting-btn-sm" :class="{ 'active': timer.countdownDuration > 0 }" @click="timer.cycleCountdown()">
                        <span class="iconify" data-icon="mdi:timer-outline"></span>
                        <span class="countdown-value-sm" x-text="timer.countdownDuration || 'Off'"></span>
                      </button>
                      <button class="timer-setting-btn-sm" :class="{ 'active': timer.vibrationEnabled }" @click="timer.toggleVibration()">
                        <span class="iconify" :data-icon="timer.vibrationEnabled ? 'mdi:vibrate' : 'mdi:vibrate-off'"></span>
                      </button>
                    </div>
                    <span x-text="timer.formattedTotalRemaining + ' left'"></span>
                  </div>
                  <template x-if="timer.currentSegment?.isUserControlled">
                    <button class="timer-inline-done" @click="timer.markDone()">
                      <span class="iconify" data-icon="lucide:check"></span>
                      <span>Done</span>
                    </button>
                  </template>
                </div>
              </div>
            </template>

            <template x-if="generatedWorkout && generatedWorkout.sets">
              <div class="generated-sets-section">
                <div class="workout-card-container">
                <template x-for="(set, setIdx) in generatedWorkout.sets" :key="'gen-set-' + setIdx">
                  <div class="generated-set">
                    <div class="generated-set-header">
                      <span class="generated-set-name" x-text="set.name || 'Set ' + (setIdx + 1)"></span>
                      <template x-if="set.rounds && set.rounds > 1">
                        <span class="generated-set-rounds" x-text="'×' + set.rounds"></span>
                      </template>
                      <template x-if="isSetRandomizable(set)">
                        <button class="shuffle-set-btn" @click="shuffleSet(set.id)">
                          <span class="iconify" data-icon="lucide:refresh-cw"></span>
                        </button>
                      </template>
                    </div>
                    <template x-if="set.generatedExercises && set.generatedExercises.length > 0">
                      <div class="exercise-list">
                        <template x-for="(ex, exIdx) in set.generatedExercises" :key="'gen-ex-' + setIdx + '-' + exIdx">
                          <div class="exercise-line" :class="{ 'expandable': ex.description || ex.media }" @click="(ex.description || ex.media) && toggleExerciseExpand(ex.id)">
                            <template x-if="ex.shuffleable">
                              <button class="ex-shuffle" @click.stop="shuffleExercise(set.id, exIdx)" title="Shuffle">↻</button>
                            </template>
                            <span class="ex-name" x-text="ex.name"></span>
                            <span class="ex-duration" x-text="ex.duration ? ex.duration + 's' : (ex.reps ? ex.reps + ' reps' : '')"></span>
                            <template x-if="ex.notes">
                              <span class="ex-notes" x-text="ex.notes"></span>
                            </template>
                            <template x-if="ex.media && ex.media.length > 0">
                              <span class="ex-media-icon"><span class="iconify" data-icon="lucide:image"></span></span>
                            </template>
                            <template x-if="ex.description || ex.media">
                              <span class="ex-expand" :class="{ 'expanded': expandedExercises?.includes(ex.id) }">
                                <span class="iconify" data-icon="lucide:chevron-down"></span>
                              </span>
                            </template>
                            <template x-if="expandedExercises?.includes(ex.id)">
                              <div class="ex-expanded" @click.stop>
                                <template x-if="ex.description">
                                  <p class="ex-desc" x-text="ex.description"></p>
                                </template>
                                <template x-if="ex.media && ex.media.length > 0">
                                  <div class="ex-media">
                                    <template x-if="ex.media[0].type === 'image'">
                                      <img :src="getExerciseImagePath(ex.media[0].value)" :alt="ex.name" loading="lazy">
                                    </template>
                                    <template x-if="ex.media[0].type === 'youtube'">
                                      <iframe :src="'https://www.youtube.com/embed/' + getYoutubeId(ex.media[0].value)" frameborder="0" allowfullscreen></iframe>
                                    </template>
                                  </div>
                                </template>
                              </div>
                            </template>
                          </div>
                        </template>
                      </div>
                    </template>
                    <template x-if="set.type === 'rest'">
                      <div class="set-rest">
                        <span class="iconify" data-icon="lucide:pause-circle"></span>
                        <span x-text="'Rest ' + (set.restDuration || 60) + 's'"></span>
                      </div>
                    </template>
                    <template x-if="set.type === 'activity' && set.activity">
                      <div class="set-activity">
                        <span class="iconify" data-icon="lucide:activity"></span>
                        <span x-text="set.activity.name"></span>
                        <span x-show="set.activity.duration" x-text="set.activity.duration + ' min'"></span>
                      </div>
                    </template>
                  </div>
                </template>
                </div>
              </div>
            </template>

            <details class="json-details">
              <summary class="json-summary">
                <span class="json-summary-text">Workout JSON</span>
                <button class="copy-btn" @click.stop="copyToClipboard()" :class="{ 'copied': copied }">
                  <span class="iconify" :data-icon="copied ? 'lucide:check' : 'lucide:copy'"></span>
                </button>
              </summary>
              <pre class="workout-json"><code x-text="JSON.stringify(selectedWorkout, null, 2)"></code></pre>
            </details>
          </div>
        </template>
      </div>
    </main>
  </div>

</div>

<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js"></script>

<script>
${generatorJs}

${timelineJs}

${timerJs}

function routineStackApp() {
  return {
    sidebarOpen: true,
    loading: true,
    initialized: false,
    isMobile: false,
    savedWorkouts: [],
    routines: [],
    allWorkouts: [],
    exercisesCatalogue: [],
    progressions: {},
    selectedWorkoutId: null,
    selectedRoutineId: null,
    copied: false,
    generatedWorkout: null,
    expandedExercises: [],

    // Timer state
    timerMode: false,
    timer: null,

    checkMobile() {
      return window.matchMedia('(max-width: 767px)').matches;
    },

    handleKeydown(e) {
      if (e.key === 'Escape' && this.sidebarOpen && this.isMobile) {
        this.sidebarOpen = false;
      }
    },

    get selectedWorkout() {
      // Check if generated workout matches (including alternative workouts)
      if (this.generatedWorkout && (this.generatedWorkout.id === this.selectedWorkoutId || this.generatedWorkout._originalId === this.selectedWorkoutId)) {
        return this.generatedWorkout;
      }
      const fromSaved = this.savedWorkouts.find(w => w.id === this.selectedWorkoutId);
      if (fromSaved) return fromSaved;
      return this.allWorkouts.find(w => w.id === this.selectedWorkoutId) || null;
    },

    get canShuffle() {
      // For alternative workouts, check the generated workout
      if (this.generatedWorkout && this.generatedWorkout._originalId === this.selectedWorkoutId) {
        return true; // Alternative workouts are always shuffleable (they randomly select)
      }
      const workout = this.allWorkouts.find(w => w.id === this.selectedWorkoutId) ||
                      this.savedWorkouts.find(w => w.id === this.selectedWorkoutId);
      if (!workout) return false;
      // Workouts with fixedAlternatives are shuffleable even if they have empty sets
      if (workout.fixedAlternatives && workout.fixedAlternatives.length > 0) {
        return true;
      }
      if (!workout.sets) return false;
      return WorkoutGenerator?.hasRandomizableSets(workout) ?? false;
    },

    getWorkoutsByRoutine(routineId) {
      const workouts = this.allWorkouts.filter(w => w.routineId === routineId || w.category === routineId);
      return workouts.sort((a, b) => {
        const aShuffable = this.isWorkoutShuffleable(a);
        const bShuffable = this.isWorkoutShuffleable(b);
        if (aShuffable && !bShuffable) return -1;
        if (!aShuffable && bShuffable) return 1;
        return 0;
      });
    },

    isWorkoutShuffleable(workout) {
      if (!workout) return false;
      // Workouts with fixedAlternatives are shuffleable even if they have empty sets
      if (workout.fixedAlternatives && workout.fixedAlternatives.length > 0) {
        return true;
      }
      if (!workout.sets) return false;
      return WorkoutGenerator?.hasRandomizableSets(workout) ?? false;
    },

    getWorkoutIdFromUrl() {
      const path = window.location.pathname;
      if (path === '/' || path === '') return null;
      // Remove leading and trailing slashes
      let slug = path;
      if (slug.startsWith('/')) slug = slug.substring(1);
      if (slug.endsWith('/')) slug = slug.substring(0, slug.length - 1);
      // Skip API routes and static files
      if (slug.startsWith('api/') || slug.startsWith('static/')) return null;
      return slug || null;
    },

    updateUrl(workoutId) {
      if (!workoutId) {
        // Clear URL if no workout selected
        if (window.location.pathname !== '/') {
          window.history.pushState({ workoutId: null }, '', '/');
        }
        return;
      }
      const currentPath = '/' + workoutId;
      if (window.location.pathname !== currentPath) {
        window.history.pushState({ workoutId }, '', currentPath);
      }
    },

    async init() {
      if (this.initialized) return;
      this.initialized = true;

      this.isMobile = this.checkMobile();
      if (this.isMobile) this.sidebarOpen = false;

      window.matchMedia('(max-width: 767px)').addEventListener('change', (e) => {
        this.isMobile = e.matches;
        this.sidebarOpen = !e.matches;
      });

      // Listen for browser back/forward navigation
      window.addEventListener('popstate', (e) => {
        const workoutId = this.getWorkoutIdFromUrl();
        if (workoutId && workoutId !== this.selectedWorkoutId) {
          this.selectWorkout(workoutId, false); // Don't update URL since it's already changed
        } else if (!workoutId && this.selectedWorkoutId) {
          this.selectedWorkoutId = null;
          this.generatedWorkout = null;
        }
      });

      await this.loadData();
      await this.loadExercisesCatalogue();
      await this.loadProgressions();
      this.autoLoadRandomWorkout();
    },

    async loadData() {
      this.loading = true;
      this.savedWorkouts = [];
      this.routines = [];
      this.allWorkouts = [];

      try {
        // Load all routines in one call
        try {
          const res = await fetch('/api/routines');
          if (res.ok) {
            this.routines = await res.json();
            console.log('Loaded ' + this.routines.length + ' routines');
          } else {
            console.warn('Failed to load routines - Status: ' + res.status);
          }
        } catch (e) {
          console.warn('Could not load routines:', e);
        }

        // Load all workouts in one call from compiled file
        try {
          const res = await fetch('/api/workouts');
          if (res.ok) {
            this.allWorkouts = await res.json();
            console.log('Loaded ' + this.allWorkouts.length + ' workouts');
          } else {
            console.warn('Failed to load workouts - Status: ' + res.status);
          }
        } catch (e) {
          console.warn('Could not load workouts:', e);
        }

        // Load all saved workouts in one call
        try {
          const res = await fetch('/api/saved');
          if (res.ok) {
            const savedDataList = await res.json();
            for (const savedData of savedDataList) {
              if (savedData.workoutRef) {
                const actualWorkout = this.allWorkouts.find(w => w.id === savedData.workoutRef);
                if (actualWorkout) {
                  this.savedWorkouts.push({ ...actualWorkout, savedAt: savedData.savedAt, alias: savedData.alias });
                }
              } else if (savedData.id) {
                this.savedWorkouts.push(savedData);
              }
            }
            console.log('Loaded ' + this.savedWorkouts.length + ' saved workouts');
          } else {
            console.warn('Failed to load saved workouts - Status: ' + res.status);
          }
        } catch (e) {
          console.warn('Could not load saved workouts:', e);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        this.loading = false;
      }
    },

    autoLoadRandomWorkout() {
      // First, check URL for workout ID
      const urlWorkoutId = this.getWorkoutIdFromUrl();
      if (urlWorkoutId) {
        // Check if workout exists in loaded workouts
        const workout = this.allWorkouts.find(w => w.id === urlWorkoutId) ||
                        this.savedWorkouts.find(w => w.id === urlWorkoutId);
        if (workout) {
          console.log('Loading workout from URL:', urlWorkoutId);
          this.selectWorkout(urlWorkoutId, false); // Don't update URL since it's already correct
          return;
        } else {
          console.warn('Workout not found in URL:', urlWorkoutId);
        }
      }

      // Try to load from localStorage
      try {
        const saved = localStorage.getItem('wod-current-workout');
        if (saved) {
          const { workoutId, generatedWorkout } = JSON.parse(saved);
          console.log('Restoring workout from localStorage:', workoutId);
          this.selectedWorkoutId = workoutId;
          this.generatedWorkout = generatedWorkout;
          this.updateUrl(workoutId);
          return;
        }
      } catch (e) {
        console.warn('Failed to load from localStorage:', e);
      }

      // Fallback to random workout
      if (this.savedWorkouts.length === 0) return;
      const randomIndex = Math.floor(Math.random() * this.savedWorkouts.length);
      const randomWorkout = this.savedWorkouts[randomIndex];
      this.selectWorkout(randomWorkout.id);
    },

    saveToLocalStorage() {
      try {
        const data = {
          workoutId: this.selectedWorkoutId,
          generatedWorkout: this.generatedWorkout,
        };
        localStorage.setItem('wod-current-workout', JSON.stringify(data));
        console.log('Saved workout to localStorage');
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    },

    async loadExercisesCatalogue() {
      try {
        const res = await fetch('/api/exercises');
        if (res.ok) {
          this.exercisesCatalogue = await res.json();
          console.log('Loaded ' + this.exercisesCatalogue.length + ' exercises');
        }
      } catch (e) { console.warn('Could not load exercises:', e); }
    },

    async loadProgressions() {
      try {
        const res = await fetch('/api/progressions');
        if (res.ok) {
          const progressionList = await res.json();
          // Convert array to object/map for easy lookup
          this.progressions = {};
          for (const prog of progressionList) {
            this.progressions[prog.id] = prog;
          }
          console.log('Loaded ' + progressionList.length + ' progressions');
        }
      } catch (e) { console.warn('Could not load progressions:', e); }
    },

    shuffleWorkout() {
      if (!this.selectedWorkoutId || this.exercisesCatalogue.length === 0) return;
      const originalWorkout = this.allWorkouts.find(w => w.id === this.selectedWorkoutId) ||
                              this.savedWorkouts.find(w => w.id === this.selectedWorkoutId);
      if (!originalWorkout) return;
      const workoutMap = {};
      [...this.allWorkouts, ...this.savedWorkouts].forEach(w => { if (w.id) workoutMap[w.id] = w; });
      this.generatedWorkout = WorkoutGenerator.generate(originalWorkout, this.exercisesCatalogue, this.progressions, workoutMap);
      this.saveToLocalStorage();
    },

    shuffleSet(setId) {
      if (!this.generatedWorkout || this.exercisesCatalogue.length === 0) return;
      this.generatedWorkout = WorkoutGenerator.regenerateSet(this.generatedWorkout, setId, this.exercisesCatalogue, this.progressions);
      this.saveToLocalStorage();
    },

    shuffleExercise(setId, exerciseIndex) {
      if (!this.generatedWorkout || this.exercisesCatalogue.length === 0) return;
      this.generatedWorkout = WorkoutGenerator.regenerateExercise(this.generatedWorkout, setId, exerciseIndex, this.exercisesCatalogue, this.progressions);
      this.saveToLocalStorage();
    },

    isSetRandomizable(set) {
      return WorkoutGenerator?.isRandomizable(set) ?? false;
    },

    selectWorkout(id, updateUrl = true) {
      this.selectedWorkoutId = id;
      this.generatedWorkout = null;
      const workout = this.allWorkouts.find(w => w.id === id) || this.savedWorkouts.find(w => w.id === id);
      if (workout && this.exercisesCatalogue.length > 0) {
        const workoutMap = {};
        [...this.allWorkouts, ...this.savedWorkouts].forEach(w => { if (w.id) workoutMap[w.id] = w; });
        // Generate even if sets is empty - generator will handle fixedAlternatives
        this.generatedWorkout = WorkoutGenerator.generate(workout, this.exercisesCatalogue, this.progressions, workoutMap);
      }
      if (updateUrl) {
        this.updateUrl(id);
      }
      this.saveToLocalStorage();
      if (this.isMobile) this.sidebarOpen = false;
    },

    getRoutineName(routineId) {
      const routine = this.routines.find(r => r.id === routineId);
      return routine ? routine.name : routineId;
    },

    getWorkoutIcon(workout) {
      if (this.isWorkoutShuffleable(workout)) return 'lucide:shuffle';
      const categoryIcons = {
        'barre': 'lucide:sparkles',
        'gym': 'lucide:dumbbell',
        'cardio': 'lucide:heart',
        'calisthenics': 'lucide:activity',
        'yoga': 'lucide:flower-2',
        'morning': 'lucide:sunrise',
        'action-jacqueline': 'lucide:sparkles',
        'challenges': 'lucide:flame',
        'maternity': 'lucide:heart-handshake',
        'kettlebell': 'lucide:dumbbell',
        'heavy-duty': 'lucide:weight',
        'jump-rope': 'lucide:zap',
        'snippets': 'lucide:puzzle',
      };
      return categoryIcons[workout.category] || categoryIcons[workout.routineId] || 'lucide:file';
    },

    getExerciseImagePath(mediaPath) {
      if (!mediaPath) return '';
      if (mediaPath.startsWith('/images/')) return '/static' + mediaPath;
      if (mediaPath.startsWith('./static/')) return mediaPath.replace('./', '/');
      return '/static/images/' + mediaPath;
    },

    toggleExerciseExpand(exerciseId) {
      if (!this.expandedExercises) this.expandedExercises = [];
      const idx = this.expandedExercises.indexOf(exerciseId);
      if (idx === -1) this.expandedExercises.push(exerciseId);
      else this.expandedExercises.splice(idx, 1);
    },

    getYoutubeId(url) {
      if (!url) return '';
      const patterns = [
        /(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/|youtube\\.com\\/embed\\/)([^&\\?\\/]+)/,
        /^([a-zA-Z0-9_-]{11})$/
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return url;
    },

    getYoutubeThumbnail(url) {
      const videoId = this.getYoutubeId(url);
      return videoId ? 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg' : '';
    },

    getRoutineWorkoutCount(routineId) {
      return this.allWorkouts.filter(w => w.routineId === routineId || w.category === routineId).length;
    },

    async copyToClipboard() {
      if (!this.selectedWorkout) return;
      try {
        await navigator.clipboard.writeText(JSON.stringify(this.selectedWorkout, null, 2));
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2000);
      } catch (e) { console.error('Failed to copy:', e); }
    },

    // Timer methods
    startTimer() {
      if (!this.generatedWorkout) {
        console.warn('No workout to start timer for');
        return;
      }
      if (!this.timer) {
        this.timer = workoutTimer();
      }
      this.timer.init(this.generatedWorkout);
      this.timerMode = true;
      document.body.style.overflow = 'hidden';
    },

    exitTimer() {
      if (this.timer && !this.timer.isPaused && !this.timer.isWorkoutComplete) {
        if (!confirm('Exit timer? Your progress will be lost.')) {
          return;
        }
      }
      this.timerMode = false;
      if (this.timer) {
        this.timer.stop();
      }
      document.body.style.overflow = '';
    },
  };
}
</script>

<!-- Service Worker Registration -->
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
}
</script>

</body>
</html>`;
}

// Start server for local dev, skip for Deno Deploy/Val Town
if (!Deno.env?.get?.("DENO_DEPLOYMENT_ID") && !Deno.env?.get?.("valtown")) {
  const port = parseInt(Deno.env?.get?.("PORT") || "8000");
  console.log(`🏋️ Workouts of the Day running at http://localhost:${port}`);
  Deno.serve({ port }, app.fetch);
}

export default Deno.env?.get?.("valtown") ? app.fetch : app;
