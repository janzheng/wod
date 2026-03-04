import "jsr:@std/dotenv/load";
import { Hono } from "hono";
import { createWodAI, getConfig } from "./src/ai/mod.ts";
import { complete } from "./src/ai/llm/provider.ts";
import type { ConversationSession } from "./src/ai/types.ts";

const app = new Hono();

// AI pipeline (lazy init on first request)
let wodAI: Awaited<ReturnType<typeof createWodAI>> | null = null;
const aiSessions = new Map<string, ConversationSession>();

async function getWodAI() {
  if (!wodAI) {
    const dataDir = new URL("./", import.meta.url).pathname;
    const config = getConfig();
    wodAI = await createWodAI(dataDir, config);
    console.log(`AI loaded: ${wodAI.index.size} exercises, ${wodAI.data.workouts.size} templates`);
  }
  return wodAI;
}

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
const CACHE_NAME = 'wod-v3';
const STATIC_ASSETS = ['/', '/static/generator.js', '/static/timeline.js', '/static/timer.js', '/static/chat.js'];

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
  const routineFiles = ['barre', 'cardio', 'gym', 'calisthenics', 'morning', 'yoga', 'stretch', 'action-jacqueline', 'challenges', 'maternity', 'heavy-duty', 'jump-rope', 'kettlebell', 'snippets'];
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
  const savedFiles = ['aj-standing-barre', 'aj-floor-barre', 'aj-random-4', 'morning-wakeup', 'apartment-gym', '4x4x3-block', 'squat-rack', 'machine-circuit', 'gentle-yoga', 'hip-lower-back-flow', 'reddit-rrr', 'gym-classic-workouts', 'calisthenics-classic-workouts', 'kb-random-circuit', 'kb-controlled-power', 'kb-controlled-power-challenge'];
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

app.get("/api/programs", async (c) => {
  const programs = [];
  try {
    for await (const entry of Deno.readDir(new URL("./programs", import.meta.url))) {
      if (entry.name.endsWith(".json")) {
        const data = await readJson(`./programs/${entry.name}`);
        if (data) programs.push(data);
      }
    }
  } catch { /* programs directory may not exist yet */ }
  return c.json(programs);
});

app.get("/api/programs/:id", async (c) => {
  const id = c.req.param("id");
  const data = await readJson(`./programs/${id}.json`);
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json(data);
});


// Exercise search endpoint
app.get("/api/ai/search", async (c) => {
  const q = c.req.query("q") || "";
  const limit = parseInt(c.req.query("limit") || "10");
  if (!q.trim()) return c.json({ results: [] });

  const wod = await getWodAI();
  const results = wod.index.search(q.trim(), limit).map((ex) => ({
    id: ex.id,
    name: ex.name,
    category: ex.category,
    type: ex.type,
    muscles: ex.muscles,
    equipment: ex.equipment,
    tags: ex.tags,
    difficulty: ex.difficulty,
    description: ex.description,
  }));
  return c.json({ results, query: q.trim() });
});

// AI Chat endpoint — classifies message as Q&A vs workout generation
app.post("/api/ai/chat", async (c) => {
  const body = await c.req.json<{
    prompt: string;
    sessionId?: string;
    workoutContext?: Record<string, unknown>;
    history?: Array<{ role: string; content: string; workoutContext?: Record<string, unknown> }>;
    enableCritic?: boolean;
  }>();
  if (!body.prompt) return c.json({ error: "prompt is required" }, 400);

  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) return c.json({ error: "GROQ_API_KEY not configured" }, 503);

  try {
    const config = getConfig();

    // Step 1: Classify — question, search, or generate?
    const classifyMessages = [
      {
        role: "system" as const,
        content: `You are a classifier. Given a user message about fitness/workouts, respond with EXACTLY one word:
- "search" if the user asks about a specific exercise by name, wants to find exercises, or asks "what is X" / "do we have X" / "tell me about X exercise" (e.g. "what about butterfly stretch", "do we have turkish getup", "find me hamstring exercises", "what is a plié squat")
- "question" if the user asks a general question, seeks advice, or wants information about a workout they're viewing (e.g. "does this build muscle?", "is this good for beginners?", "how many calories?", "what should I eat?")
- "generate" if the user wants to create, modify, or change a workout (e.g. "make a leg workout", "make it harder", "add more core", "create a 30 min routine")

Respond with ONLY one word, nothing else.`,
      },
      { role: "user" as const, content: body.prompt },
    ];

    const classification = (await complete(classifyMessages, { ...config, temperature: 0 })).toLowerCase().trim();
    const intent = classification.startsWith("search") ? "search"
      : classification.startsWith("question") ? "question"
      : "generate";

    if (intent === "search" || intent === "question") {
      // Search the exercise library when relevant
      const wod = await getWodAI();
      let searchResults: Array<Record<string, unknown>> = [];

      if (intent === "search") {
        // Extract search terms (strip common prefixes)
        const searchQuery = body.prompt
          .replace(/^(what about|do we have|find me|tell me about|what is|show me|search for|look up)\s*/i, "")
          .replace(/\?+$/, "")
          .trim();
        const results = wod.index.search(searchQuery, 8);
        searchResults = results.map((ex) => ({
          id: ex.id, name: ex.name, category: ex.category, type: ex.type,
          muscles: ex.muscles, equipment: ex.equipment, tags: ex.tags,
          difficulty: ex.difficulty, description: ex.description,
        }));
      }

      // Q&A path — answer using workout context + search results + history
      let systemPrompt = `You are a knowledgeable, friendly fitness coach. Answer the user's question concisely and helpfully.`;

      if (searchResults.length > 0) {
        systemPrompt += `\n\nSearch results from the exercise library:\n${JSON.stringify(searchResults, null, 2)}\n\nUse these results to answer the user's question. Mention which exercises were found and key details (muscles, difficulty, description). If the exact exercise wasn't found, mention the closest matches.`;
      } else if (intent === "search") {
        systemPrompt += `\n\nNo matching exercises were found in the library for this search. Let the user know and suggest what they might search for instead.`;
      }

      if (body.workoutContext) {
        systemPrompt += `\n\nThe user is currently viewing this workout:\n${JSON.stringify(body.workoutContext, null, 2)}`;
      }

      systemPrompt += `\nKeep answers focused and practical. Use 2-4 sentences unless the question needs more detail. Don't generate a new workout unless explicitly asked.
When the user references previous workouts from the conversation, use the context provided in earlier messages to answer accurately.`;

      // Build messages array with history
      const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
      ];

      if (body.history?.length) {
        for (const h of body.history.slice(-16)) {
          const role = h.role === "user" ? "user" as const : "assistant" as const;
          let content = h.content;
          if (h.role === "user" && h.workoutContext) {
            content = `[Viewing: ${(h.workoutContext as Record<string, unknown>).name}] ${content}`;
          }
          chatMessages.push({ role, content });
        }
      }

      chatMessages.push({ role: "user", content: body.prompt });

      const answer = await complete(chatMessages, config);
      const sessionId = body.sessionId || crypto.randomUUID();

      return c.json({
        workout: null,
        intent: intent,
        critique: null,
        sessionId,
        message: answer,
        searchResults: searchResults.length > 0 ? searchResults : undefined,
      });
    }

    // Workout generation path — use full pipeline
    const wod = await getWodAI();
    const session = body.sessionId ? aiSessions.get(body.sessionId) : undefined;

    // Build enriched prompt with conversation history + current context
    let enrichedPrompt = "";

    // Add conversation history summary so generation knows about previously discussed workouts
    if (body.history?.length) {
      const workoutMentions: string[] = [];
      for (const h of body.history.slice(-16)) {
        if (h.role === "user" && h.workoutContext) {
          const wc = h.workoutContext as Record<string, unknown>;
          workoutMentions.push(`- "${wc.name}": ${h.content}`);
        }
      }
      if (workoutMentions.length) {
        enrichedPrompt += `[PREVIOUSLY DISCUSSED WORKOUTS]\n${workoutMentions.join("\n")}\n\n`;
      }
    }

    if (body.workoutContext) {
      enrichedPrompt += `[CURRENT WORKOUT CONTEXT]\n${JSON.stringify(body.workoutContext)}\n\n`;
    }
    enrichedPrompt += `[USER MESSAGE]\n${body.prompt}`;

    const result = await wod.chat({
      prompt: enrichedPrompt,
      session,
      enableCritic: body.enableCritic ?? true,
    });

    aiSessions.set(result.session.id, result.session);

    const w = result.workout;
    const exCount = w.sets.reduce((n: number, s: { exercises: unknown[] }) => n + s.exercises.length, 0);
    let message = `Here's "${w.name}" — ${w.sets.length} sets, ${exCount} exercises`;
    if (w.estimatedDuration) message += `, ~${w.estimatedDuration} min`;
    message += ".";
    if (w.tips?.length) message += ` Tip: ${w.tips[0]}`;

    return c.json({
      workout: result.workout,
      intent: result.intent,
      critique: result.critique,
      sessionId: result.session.id,
      message,
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return c.json({ error: String(err) }, 500);
  }
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
  const chatJs = await Deno.readTextFile(new URL("./static/chat.js", import.meta.url)).catch(() => "");

  return c.html(renderPage(css, generatorJs, timelineJs, timerJs, chatJs));
});

function renderPage(css: string, generatorJs: string, timelineJs: string, timerJs: string, chatJs: string) {
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
            <div class="sidebar-menu">
              <div class="sidebar-menu-item">
                <button
                  class="sidebar-menu-button"
                  :class="{ 'active': currentView === 'exercises' }"
                  @click="toggleExerciseLibrary()"
                >
                  <span class="iconify sidebar-icon" data-icon="lucide:library"></span>
                  <span class="sidebar-menu-label">Exercise Library</span>
                  <span class="sidebar-menu-badge" x-text="exercisesCatalogue.length"></span>
                </button>
              </div>
              <div class="sidebar-menu-item">
                <button
                  class="sidebar-menu-button"
                  :class="{ 'active': currentView === 'notes' }"
                  @click="currentView = currentView === 'notes' ? 'workout' : 'notes'; selectedWorkoutId = null; generatedWorkout = null; selectedActivity = null; selectedProgram = null; if(currentView === 'notes' && !notesHtml) loadNotes(); if(isMobile) sidebarOpen = false;"
                >
                  <span class="iconify sidebar-icon" data-icon="lucide:notebook-pen"></span>
                  <span class="sidebar-menu-label">Training Notes</span>
                </button>
              </div>
            </div>
          </div>

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

          <template x-if="programs.length > 0">
          <div class="sidebar-group">
            <div class="sidebar-group-label">Programs</div>
            <div class="folder-tree">
              <template x-for="(program, progIdx) in programs" :key="'prog-' + progIdx + '-' + program.id">
                <div class="folder-tree-folder" x-data="{ expanded: false }">
                  <div class="folder-tree-folder-row" @click="expanded = !expanded; if (expanded) selectProgramOverview(program);">
                    <button class="folder-tree-toggle" @click.stop="expanded = !expanded">
                      <svg class="folder-tree-chevron" :class="{ 'rotated': expanded }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                    <span class="iconify folder-tree-icon" data-icon="lucide:calendar-days"></span>
                    <span class="folder-tree-name" x-text="program.name"></span>
                    <span class="folder-tree-count" x-text="program.frequency + 'x/wk'"></span>
                  </div>
                  <div class="folder-tree-contents" x-show="expanded" x-collapse>
                    <div class="folder-tree-item"
                      :class="{ 'active': selectedProgram && selectedProgram.id === program.id && selectedWeekIdx === null }"
                      @click="selectProgramOverview(program)">
                      <button class="folder-tree-item-btn">
                        <span style="font-size: 0.7rem; opacity: 0.6; min-width: 1rem;">0</span>
                        <span>Overview</span>
                      </button>
                    </div>
                    <!-- Week-based programs -->
                    <template x-if="program.weeks && program.weeks.length > 0">
                      <div>
                        <template x-for="(week, weekIdx) in program.weeks" :key="'prog-week-' + progIdx + '-' + weekIdx">
                          <div x-data="{ weekExpanded: false }">
                            <div class="folder-tree-item"
                              style="cursor: pointer;"
                              @click="weekExpanded = !weekExpanded">
                              <button class="folder-tree-item-btn" style="gap: 0.35rem;">
                                <svg :class="{ 'rotated': weekExpanded }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.4; flex-shrink: 0; transition: transform 0.15s;">
                                  <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                                <span style="font-size: 0.8rem;" x-text="'Week ' + week.week + (week.label ? ': ' + week.label : '')"></span>
                              </button>
                            </div>
                            <div x-show="weekExpanded" x-collapse style="padding-left: 1.25rem;">
                              <div class="folder-tree-item"
                                :class="{ 'active': selectedProgram && selectedProgram.id === program.id && selectedWeekIdx === weekIdx }"
                                @click="selectWeek(program, weekIdx)">
                                <button class="folder-tree-item-btn">
                                  <span style="font-size: 0.7rem; opacity: 0.6; min-width: 1rem;">0</span>
                                  <span>Overview</span>
                                </button>
                              </div>
                              <template x-for="(day, dayIdx) in week.schedule" :key="'prog-week-day-' + progIdx + '-' + weekIdx + '-' + dayIdx">
                                <div class="folder-tree-item"
                                  :class="{ 'active': (day.workoutId && selectedWorkoutId === day.workoutId) || (!day.workoutId && selectedActivity && selectedActivity._dayKey === (program.id + '-w' + week.week + '-' + day.day)) }"
                                  :style="day.type === 'rest' ? 'opacity: 0.5; cursor: default;' : ''"
                                  @click="day.type === 'workout' && day.workoutId ? selectWorkout(day.workoutId) : (day.type !== 'rest' ? selectActivity(day, program, week.week) : null)">
                                  <button class="folder-tree-item-btn" :style="day.type === 'rest' ? 'cursor: default;' : ''">
                                    <span style="font-size: 0.7rem; opacity: 0.6; min-width: 1rem;" x-text="day.day"></span>
                                    <span x-text="day.label || (day.type === 'rest' ? 'REST' : day.activity?.name || 'Day ' + day.day)"></span>
                                  </button>
                                </div>
                              </template>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>
                    <!-- Flat schedule programs (no weeks) -->
                    <template x-if="!program.weeks || program.weeks.length === 0">
                      <div>
                        <template x-for="(day, dayIdx) in program.schedule" :key="'prog-day-' + progIdx + '-' + dayIdx">
                          <div class="folder-tree-item"
                            :class="{ 'active': (day.workoutId && selectedWorkoutId === day.workoutId) || (!day.workoutId && selectedActivity && selectedActivity._dayKey === (program.id + '-' + day.day)) }"
                            :style="day.type === 'rest' ? 'opacity: 0.5; cursor: default;' : ''"
                            @click="day.type === 'workout' && day.workoutId ? selectWorkout(day.workoutId) : (day.type !== 'rest' ? selectActivity(day, program) : null)">
                            <button class="folder-tree-item-btn" :style="day.type === 'rest' ? 'cursor: default;' : ''">
                              <span style="font-size: 0.7rem; opacity: 0.6; min-width: 1rem;" x-text="day.day"></span>
                              <span x-text="day.label || (day.type === 'rest' ? 'REST' : day.activity?.name || 'Day ' + day.day)"></span>
                            </button>
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
          </template>

          <!-- AI Custom Workouts -->
          <template x-if="customWorkouts && customWorkouts.length > 0">
          <div class="sidebar-group">
            <div class="sidebar-group-label">AI Custom</div>
            <nav class="sidebar-menu">
              <template x-for="(cw, cwIdx) in customWorkouts" :key="'custom-' + cwIdx">
                <div class="sidebar-menu-item" style="position: relative;">
                  <button
                    class="sidebar-menu-button"
                    :class="{ 'active': selectedWorkoutId === cw.id }"
                    @click="applyAIWorkout(cw)"
                  >
                    <span class="iconify sidebar-icon" data-icon="lucide:sparkles"></span>
                    <span class="sidebar-menu-label" x-text="cw.name"></span>
                    <span class="sidebar-menu-badge" x-show="cw.estimatedDuration" x-text="cw.estimatedDuration + 'm'"></span>
                  </button>
                  <button class="custom-workout-delete" @click.stop="removeCustomWorkout(cw.id)" title="Remove">
                    <span class="iconify" data-icon="lucide:x" style="width: 0.75rem; height: 0.75rem;"></span>
                  </button>
                </div>
              </template>
            </nav>
          </div>
          </template>

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
        <h1 class="sidebar-inset-title" x-text="currentView === 'exercises' ? 'Exercise Library' : currentView === 'notes' ? 'Training Notes' : (selectedProgram ? (selectedWeekIdx !== null && selectedProgram.weeks ? selectedProgram.name + ' — Week ' + selectedProgram.weeks[selectedWeekIdx].week : selectedProgram.name) : (selectedWorkout ? selectedWorkout.name : (selectedActivity ? (selectedActivity.label || selectedActivity.activity?.name || 'Activity') : 'Select a Workout')))"></h1>
        <button class="chat-toggle-btn" @click="toggleChat()" :class="{ 'active': chatOpen }">
          <span class="iconify" data-icon="lucide:message-square"></span>
          <span class="chat-toggle-label">AI Coach</span>
        </button>
      </header>

      <div class="sidebar-inset-content">
        <!-- ═══ Exercise Library View ═══ -->
        <template x-if="currentView === 'exercises'">
          <div class="exercise-library">
            <div class="exercise-library-header">
              <div class="exercise-library-search">
                <span class="iconify search-icon" data-icon="lucide:search"></span>
                <input
                  type="text"
                  x-model.debounce.200ms="exerciseSearch"
                  placeholder="Search exercises..."
                  class="exercise-search-input"
                />
                <template x-if="exerciseSearch || exerciseCategoryFilter || exerciseMuscleFilter || exerciseEquipmentFilter || exerciseTypeFilter">
                  <button class="exercise-clear-btn" @click="clearExerciseFilters()">
                    <span class="iconify" data-icon="lucide:x"></span>
                  </button>
                </template>
              </div>

              <div class="exercise-filters">
                <select x-model="exerciseCategoryFilter" class="exercise-filter-select">
                  <option value="">All Categories</option>
                  <template x-for="cat in exerciseCategories" :key="cat">
                    <option :value="cat" x-text="formatCategory(cat)"></option>
                  </template>
                </select>
                <select x-model="exerciseMuscleFilter" class="exercise-filter-select">
                  <option value="">All Muscles</option>
                  <template x-for="m in exerciseMuscles" :key="m">
                    <option :value="m" x-text="m"></option>
                  </template>
                </select>
                <select x-model="exerciseEquipmentFilter" class="exercise-filter-select">
                  <option value="">All Equipment</option>
                  <template x-for="e in exerciseEquipmentList" :key="e">
                    <option :value="e" x-text="e"></option>
                  </template>
                </select>
                <select x-model="exerciseTypeFilter" class="exercise-filter-select">
                  <option value="">All Types</option>
                  <template x-for="t in exerciseTypes" :key="t">
                    <option :value="t" x-text="formatCategory(t)"></option>
                  </template>
                </select>
              </div>

              <div class="exercise-result-count">
                <span x-text="_filteredExerciseResults.length"></span> exercises
                <template x-if="exerciseCategoryFilter || exerciseMuscleFilter || exerciseEquipmentFilter || exerciseSearch">
                  <span style="opacity:0.6"> (filtered)</span>
                </template>
              </div>
            </div>

            <div class="exercise-library-list">
              <template x-for="ex in _filteredExerciseResults.slice(0, 100)" :key="ex.id">
                <div class="exercise-library-card" @click="toggleLibraryExercise(ex.id)">
                  <div class="exercise-card-main">
                    <div class="exercise-card-name" x-text="ex.name"></div>
                    <div class="exercise-card-meta">
                      <span class="exercise-card-category" x-text="formatCategory(ex.category)"></span>
                      <template x-if="ex.difficulty">
                        <span class="exercise-card-difficulty" :class="'diff-' + ex.difficulty" x-text="ex.difficulty"></span>
                      </template>
                      <template x-if="ex.equipment && ex.equipment.length > 0">
                        <span class="exercise-card-equipment" x-text="ex.equipment.join(', ')"></span>
                      </template>
                    </div>
                    <div class="exercise-card-muscles">
                      <template x-for="m in (ex.muscles || []).slice(0, 5)" :key="m">
                        <span class="exercise-muscle-tag" x-text="m"></span>
                      </template>
                    </div>
                  </div>
                  <div class="exercise-card-expand-icon">
                    <span class="iconify" :class="{ 'rotated-icon': expandedLibraryExercises.includes(ex.id) }" data-icon="lucide:chevron-down"></span>
                  </div>

                  <template x-if="expandedLibraryExercises.includes(ex.id)">
                    <div class="exercise-card-expanded" @click.stop>
                      <template x-if="ex.description">
                        <p class="exercise-card-desc" x-text="ex.description"></p>
                      </template>
                      <div class="exercise-card-tags">
                        <template x-for="t in (ex.tags || [])" :key="t">
                          <span class="exercise-tag-pill" x-text="t"></span>
                        </template>
                      </div>
                      <template x-if="ex.media && ex.media.length > 0">
                        <div class="exercise-card-media">
                          <template x-for="(media, mIdx) in ex.media" :key="'media-' + mIdx">
                            <div>
                              <template x-if="media.type === 'image'">
                                <img class="exercise-media-img" :src="media.value.startsWith('/') ? '/static' + media.value : media.value" :alt="media.caption || ex.name" loading="lazy" />
                              </template>
                              <template x-if="media.type !== 'image'">
                                <a :href="media.value" target="_blank" rel="noopener" class="exercise-media-link">
                                  <span class="iconify" data-icon="lucide:external-link"></span>
                                  <span x-text="media.caption || media.source || 'View'"></span>
                                </a>
                              </template>
                            </div>
                          </template>
                        </div>
                      </template>
                    </div>
                  </template>
                </div>
              </template>
              <template x-if="_filteredExerciseResults.length > 100">
                <div class="exercise-library-more">
                  Showing 100 of <span x-text="_filteredExerciseResults.length"></span> results. Use search or filters to narrow down.
                </div>
              </template>
              <template x-if="_filteredExerciseResults.length === 0">
                <div class="exercise-library-empty">
                  <span class="iconify" data-icon="lucide:search-x" style="font-size: 2rem; opacity: 0.4;"></span>
                  <p>No exercises match your filters.</p>
                  <button class="exercise-clear-btn-large" @click="clearExerciseFilters()">Clear Filters</button>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- ═══ Training Notes View ═══ -->
        <template x-if="currentView === 'notes'">
          <div style="padding: 1.5rem; overflow-y: auto; height: 100%;">
            <template x-if="!notesHtml">
              <div class="empty-state">
                <span class="iconify" data-icon="lucide:loader-2" style="animation: spin 1s linear infinite; font-size: 2rem; opacity: 0.4;"></span>
                <span style="opacity: 0.5;">Loading notes...</span>
              </div>
            </template>
            <template x-if="notesHtml">
              <div class="prose prose-full" x-html="notesHtml"></div>
            </template>
          </div>
        </template>

        <!-- ═══ Workout View (existing) ═══ -->
        <template x-if="currentView === 'workout' && !selectedWorkout && !selectedActivity && !selectedProgram && !loading">
          <div class="empty-state">
            <div class="empty-state-icon">
              <span class="iconify" data-icon="lucide:dumbbell"></span>
            </div>
            <h2 class="empty-state-title">Select a Workout</h2>
            <p class="empty-state-description">Choose a saved workout from the sidebar to view its details.</p>
          </div>
        </template>

        <template x-if="currentView === 'workout' && selectedActivity && !loading">
          <div class="workout-detail">
            <div class="workout-header">
              <div class="workout-meta">
                <span class="workout-tag">
                  <span class="iconify" data-icon="lucide:calendar-days"></span>
                  <span x-text="selectedActivity._programName"></span>
                </span>
                <span class="workout-tag" x-text="'Day ' + selectedActivity.day"></span>
                <template x-if="selectedActivity.type === 'choice'">
                  <span class="workout-tag">Rest or Activity</span>
                </template>
              </div>
              <template x-if="selectedActivity.activity?.name || selectedActivity.label">
                <p class="workout-description" style="margin-top: 0.75rem; font-size: 1rem; opacity: 0.85;" x-text="selectedActivity.activity?.notes || ''"></p>
              </template>
            </div>

            <template x-if="selectedActivity.type === 'activity' && selectedActivity.activity">
              <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: var(--color-sidebar); border-radius: 0.75rem;">
                  <span class="iconify" data-icon="lucide:heart-pulse" style="font-size: 1.5rem; color: var(--color-primary);"></span>
                  <div>
                    <div style="font-weight: 600;" x-text="selectedActivity.activity.name"></div>
                    <div style="font-size: 0.85rem; opacity: 0.7;" x-text="(selectedActivity.activity.duration || 30) + ' minutes · ' + (selectedActivity.activity.intensity || 'easy') + ' intensity'"></div>
                  </div>
                </div>
                <div style="line-height: 1.7; font-size: 0.9rem; opacity: 0.85;">
                  <p><strong>What is Zone 2 Cardio?</strong></p>
                  <p>Zone 2 is the aerobic heart rate zone where you can hold a conversation while exercising. It builds your cardiovascular base, improves fat oxidation, and aids recovery between hard training sessions.</p>
                  <p style="margin-top: 0.75rem;"><strong>Heart Rate Target:</strong> 120–140 bpm (roughly 60–70% of max HR)</p>
                  <p style="margin-top: 0.75rem;"><strong>Good Options:</strong></p>
                  <ul style="margin: 0.25rem 0 0 1.25rem; list-style: disc;">
                    <li>Walking (incline treadmill or outdoors)</li>
                    <li>Cycling (stationary or outdoor)</li>
                    <li>Light jogging</li>
                    <li>Elliptical or rowing at easy pace</li>
                    <li>Swimming at conversational pace</li>
                  </ul>
                  <p style="margin-top: 0.75rem;"><strong>Key Rule:</strong> If you can't comfortably talk, you're going too hard. Zone 2 should feel easy — that's the point.</p>
                </div>
              </div>
            </template>

            <template x-if="selectedActivity.type === 'choice' && selectedActivity.options">
              <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="font-size: 0.9rem; opacity: 0.85; line-height: 1.6;">
                  <p>This is a flexible day — pick whichever option suits how you feel:</p>
                </div>
                <template x-for="(opt, optIdx) in selectedActivity.options" :key="'opt-' + optIdx">
                  <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: var(--color-sidebar); border-radius: 0.75rem;">
                    <span class="iconify" :data-icon="opt.type === 'rest' ? 'lucide:bed' : 'lucide:heart-pulse'" style="font-size: 1.25rem; color: var(--color-primary);"></span>
                    <div>
                      <div style="font-weight: 600;" x-text="opt.label"></div>
                      <template x-if="opt.activity?.notes">
                        <div style="font-size: 0.85rem; opacity: 0.7;" x-text="opt.activity.notes"></div>
                      </template>
                      <template x-if="opt.type === 'rest'">
                        <div style="font-size: 0.85rem; opacity: 0.7;">Full rest day. Let your body recover.</div>
                      </template>
                    </div>
                  </div>
                </template>
                <div style="line-height: 1.7; font-size: 0.9rem; opacity: 0.85; margin-top: 0.5rem;">
                  <p><strong>What is Zone 2 Cardio?</strong></p>
                  <p>Zone 2 is the aerobic heart rate zone where you can hold a conversation while exercising. It builds your cardiovascular base, improves fat oxidation, and aids recovery between hard training sessions.</p>
                  <p style="margin-top: 0.75rem;"><strong>Heart Rate Target:</strong> 120–140 bpm (roughly 60–70% of max HR)</p>
                  <p style="margin-top: 0.75rem;"><strong>Key Rule:</strong> If you can't comfortably talk, you're going too hard. Zone 2 should feel easy — that's the point.</p>
                </div>
              </div>
            </template>

            <template x-if="selectedActivity.type === 'rest'">
              <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; align-items: center; text-align: center;">
                <span class="iconify" data-icon="lucide:bed" style="font-size: 2.5rem; opacity: 0.4;"></span>
                <p style="font-size: 0.9rem; opacity: 0.7;">Full rest day. Let your body recover.</p>
              </div>
            </template>

            <!-- Home Gym Notes -->
            <template x-if="selectedActivity.homeGym">
              <div style="margin: 0 1.5rem 1.5rem; padding: 0.75rem 1rem; background: rgba(128,128,128,0.06); border-radius: 0.5rem; display: flex; gap: 0.6rem; align-items: flex-start;">
                <span class="iconify" data-icon="lucide:plus-circle" style="font-size: 1rem; opacity: 0.5; margin-top: 0.15rem; flex-shrink: 0;"></span>
                <div style="font-size: 0.85rem; line-height: 1.6; opacity: 0.75;" x-text="selectedActivity.homeGym"></div>
              </div>
            </template>
          </div>
        </template>

        <!-- ═══ Program Overview View ═══ -->
        <template x-if="currentView === 'workout' && selectedProgram && !loading">
          <div class="workout-detail">
            <div class="workout-header">
              <div class="workout-meta">
                <template x-if="selectedProgram.frequency">
                  <span class="workout-tag">
                    <span class="iconify" data-icon="lucide:calendar-days"></span>
                    <span x-text="selectedProgram.frequency + 'x/week'"></span>
                  </span>
                </template>
                <template x-if="selectedProgram.difficulty">
                  <span class="workout-tag" x-text="selectedProgram.difficulty"></span>
                </template>
                <template x-if="selectedProgram.overview?.duration">
                  <span class="workout-tag">
                    <span class="iconify" data-icon="lucide:clock"></span>
                    <span x-text="selectedProgram.overview.duration"></span>
                  </span>
                </template>
                <template x-if="selectedProgram.sourceUrl">
                  <a class="workout-tag workout-source-link" :href="selectedProgram.sourceUrl" target="_blank" rel="noopener" @click.stop>
                    <span class="iconify" data-icon="lucide:external-link"></span>
                    <span x-text="selectedProgram.creator || 'Source'"></span>
                  </a>
                </template>
                <template x-if="!selectedProgram.sourceUrl && selectedProgram.creator">
                  <span class="workout-tag workout-source-tag">
                    <span x-text="selectedProgram.creator"></span>
                  </span>
                </template>
              </div>
              <template x-if="selectedProgram.description">
                <p class="workout-description" x-text="selectedProgram.description"></p>
              </template>
            </div>

            <!-- ═══ Week Landing Page ═══ -->
            <template x-if="selectedWeekIdx !== null && selectedProgram.weeks && selectedProgram.weeks[selectedWeekIdx]">
              <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                  <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.4; margin-bottom: 0.25rem;">
                    <span style="cursor: pointer; text-decoration: underline;" @click="selectProgramOverview(selectedProgram)">Program Overview</span>
                  </div>
                  <div style="font-weight: 700; font-size: 1.25rem;" x-text="'Week ' + selectedProgram.weeks[selectedWeekIdx].week + (selectedProgram.weeks[selectedWeekIdx].label ? ': ' + selectedProgram.weeks[selectedWeekIdx].label : '')"></div>
                </div>

                <template x-if="selectedProgram.weeks[selectedWeekIdx].description">
                  <p style="line-height: 1.7; font-size: 0.95rem;" x-text="selectedProgram.weeks[selectedWeekIdx].description"></p>
                </template>

                <!-- Week Schedule -->
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Schedule</div>
                  <div style="display: flex; flex-direction: column; gap: 0;">
                    <template x-for="(day, dayIdx) in selectedProgram.weeks[selectedWeekIdx].schedule" :key="'wk-day-' + dayIdx">
                      <div
                        style="display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.75rem; padding: 0.35rem 0; border-bottom: 1px solid rgba(128,128,128,0.08);"
                        :style="day.type === 'workout' ? 'cursor: pointer;' : (day.type === 'rest' ? 'opacity: 0.4;' : 'cursor: pointer;')"
                        @click="day.type === 'workout' && day.workoutId ? selectWorkout(day.workoutId) : (day.type !== 'rest' ? selectActivity(day, selectedProgram, selectedProgram.weeks[selectedWeekIdx].week) : null)"
                      >
                        <span style="font-size: 0.75rem; font-weight: 600; opacity: 0.35; min-width: 1.5rem; text-align: right;" x-text="day.day"></span>
                        <span style="font-weight: 600; font-size: 0.875rem; flex: 1;" x-text="day.label"></span>
                        <template x-if="day.homeGym">
                          <span class="iconify" data-icon="lucide:plus-circle" style="font-size: 0.7rem; opacity: 0.3;" title="Daily extras"></span>
                        </template>
                        <template x-if="day.type === 'workout'">
                          <span style="font-size: 0.7rem; opacity: 0.3;">&rsaquo;</span>
                        </template>
                        <template x-if="day.type === 'choice'">
                          <span style="font-size: 0.7rem; opacity: 0.4; font-style: italic;">options</span>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Week Tips -->
                <template x-if="selectedProgram.weeks[selectedWeekIdx].tips && selectedProgram.weeks[selectedWeekIdx].tips.length > 0">
                  <div>
                    <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Week Tips</div>
                    <ul style="margin: 0; padding-left: 1.25rem; list-style: disc; display: flex; flex-direction: column; gap: 0.4rem;">
                      <template x-for="(tip, tipIdx) in selectedProgram.weeks[selectedWeekIdx].tips" :key="'wtip-' + tipIdx">
                        <li style="line-height: 1.6; font-size: 0.9rem;" x-text="tip"></li>
                      </template>
                    </ul>
                  </div>
                </template>
              </div>
            </template>

            <!-- ═══ Program Overview (when no week selected) ═══ -->
            <template x-if="selectedWeekIdx === null">
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <!-- Cycle Note -->
              <template x-if="selectedProgram.overview?.cycleNote">
                <div style="padding: 0.75rem 1rem; background: rgba(128,128,128,0.06); border-radius: 0.5rem; font-size: 0.85rem; line-height: 1.6; opacity: 0.85;">
                  <span x-text="selectedProgram.overview.cycleNote"></span>
                </div>
              </template>

              <!-- Goal -->
              <template x-if="selectedProgram.overview?.goal">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Goal</div>
                  <p style="line-height: 1.7; font-size: 0.95rem;" x-text="selectedProgram.overview.goal"></p>
                </div>
              </template>

              <!-- Who It's For -->
              <template x-if="selectedProgram.overview?.whoIsItFor">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Who It's For</div>
                  <p style="line-height: 1.7; font-size: 0.95rem;" x-text="selectedProgram.overview.whoIsItFor"></p>
                </div>
              </template>

              <!-- What to Expect -->
              <template x-if="selectedProgram.overview?.whatToExpect">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">What to Expect</div>
                  <p style="line-height: 1.7; font-size: 0.95rem;" x-text="selectedProgram.overview.whatToExpect"></p>
                </div>
              </template>

              <!-- Weekly Structure -->
              <template x-if="selectedProgram.overview?.weeklyStructure">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Weekly Structure</div>
                  <div style="padding: 0.75rem 1rem; background: var(--color-sidebar); border-radius: 0.5rem; font-family: monospace; font-size: 0.85rem; line-height: 1.8; word-break: break-word;" x-text="selectedProgram.overview.weeklyStructure"></div>
                </div>
              </template>

              <!-- Weeks Overview (for multi-week programs) -->
              <template x-if="selectedProgram.weeks && selectedProgram.weeks.length > 0">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Weeks</div>
                  <div style="display: flex; flex-direction: column; gap: 0;">
                    <template x-for="(week, weekIdx) in selectedProgram.weeks" :key="'ov-week-' + weekIdx">
                      <div
                        style="display: flex; align-items: baseline; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(128,128,128,0.08); cursor: pointer;"
                        @click="selectWeek(selectedProgram, weekIdx)"
                      >
                        <span style="font-size: 0.75rem; font-weight: 600; opacity: 0.35; min-width: 1.5rem; text-align: right;" x-text="week.week"></span>
                        <span style="font-weight: 600; font-size: 0.875rem; flex: 1;" x-text="week.label || ('Week ' + week.week)"></span>
                        <span style="font-size: 0.7rem; opacity: 0.3;">&rsaquo;</span>
                      </div>
                    </template>
                  </div>
                </div>
              </template>

              <!-- Schedule (for flat schedule programs) -->
              <template x-if="selectedProgram.schedule && (!selectedProgram.weeks || selectedProgram.weeks.length === 0)">
              <div>
                <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Schedule</div>
                <div style="display: flex; flex-direction: column; gap: 0;">
                  <template x-for="(day, dayIdx) in selectedProgram.schedule" :key="'ov-day-' + dayIdx">
                    <div
                      style="display: flex; align-items: baseline; gap: 0.75rem; padding: 0.35rem 0; border-bottom: 1px solid rgba(128,128,128,0.08);"
                      :style="day.type === 'workout' ? 'cursor: pointer;' : (day.type === 'rest' ? 'opacity: 0.4;' : 'cursor: pointer;')"
                      @click="day.type === 'workout' && day.workoutId ? selectWorkout(day.workoutId) : (day.type !== 'rest' ? selectActivity(day, selectedProgram) : null)"
                    >
                      <span style="font-size: 0.75rem; font-weight: 600; opacity: 0.35; min-width: 1.5rem; text-align: right;" x-text="day.day"></span>
                      <span style="font-weight: 600; font-size: 0.875rem; flex: 1;" x-text="day.label"></span>
                      <template x-if="day.type === 'workout'">
                        <span style="font-size: 0.7rem; opacity: 0.3;">&rsaquo;</span>
                      </template>
                      <template x-if="day.type === 'choice'">
                        <span style="font-size: 0.7rem; opacity: 0.4; font-style: italic;">options</span>
                      </template>
                    </div>
                  </template>
                </div>
              </div>
              </template>

              <!-- Key Principles -->
              <template x-if="selectedProgram.overview?.keyPrinciples && selectedProgram.overview.keyPrinciples.length > 0">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Key Principles</div>
                  <ul style="margin: 0; padding-left: 1.25rem; list-style: disc; display: flex; flex-direction: column; gap: 0.4rem;">
                    <template x-for="(principle, pIdx) in selectedProgram.overview.keyPrinciples" :key="'principle-' + pIdx">
                      <li style="line-height: 1.6; font-size: 0.9rem;" x-text="principle"></li>
                    </template>
                  </ul>
                </div>
              </template>

              <!-- Pros & Cons -->
              <template x-if="selectedProgram.overview?.prosAndCons">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.75rem;">Pros & Cons</div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                      <div style="font-weight: 600; font-size: 0.8rem; color: #22c55e; display: flex; align-items: center; gap: 0.35rem;">
                        <span class="iconify" data-icon="lucide:thumbs-up" style="font-size: 0.85rem;"></span> Pros
                      </div>
                      <ul style="margin: 0; padding-left: 1rem; list-style: none; display: flex; flex-direction: column; gap: 0.35rem;">
                        <template x-for="(pro, proIdx) in selectedProgram.overview.prosAndCons.pros" :key="'pro-' + proIdx">
                          <li style="line-height: 1.5; font-size: 0.85rem; position: relative; padding-left: 0.75rem;">
                            <span style="position: absolute; left: 0; color: #22c55e;">+</span>
                            <span x-text="pro"></span>
                          </li>
                        </template>
                      </ul>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                      <div style="font-weight: 600; font-size: 0.8rem; color: #ef4444; display: flex; align-items: center; gap: 0.35rem;">
                        <span class="iconify" data-icon="lucide:thumbs-down" style="font-size: 0.85rem;"></span> Cons
                      </div>
                      <ul style="margin: 0; padding-left: 1rem; list-style: none; display: flex; flex-direction: column; gap: 0.35rem;">
                        <template x-for="(con, conIdx) in selectedProgram.overview.prosAndCons.cons" :key="'con-' + conIdx">
                          <li style="line-height: 1.5; font-size: 0.85rem; position: relative; padding-left: 0.75rem;">
                            <span style="position: absolute; left: 0; color: #ef4444;">−</span>
                            <span x-text="con"></span>
                          </li>
                        </template>
                      </ul>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Tips -->
              <template x-if="selectedProgram.tips && selectedProgram.tips.length > 0">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Tips</div>
                  <div class="workout-tips-inline" style="margin: 0;">
                    <template x-for="(tip, tipIdx) in selectedProgram.tips" :key="'ptip-' + tipIdx">
                      <span><span x-text="tip"></span><span x-show="tipIdx < selectedProgram.tips.length - 1"> · </span></span>
                    </template>
                  </div>
                </div>
              </template>

              <!-- Rest Guidelines -->
              <template x-if="selectedProgram.restGuidelines">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Rest Guidelines</div>
                  <p style="line-height: 1.7; font-size: 0.9rem;" x-text="selectedProgram.restGuidelines"></p>
                </div>
              </template>

              <!-- Equipment -->
              <template x-if="selectedProgram.equipment && selectedProgram.equipment.length > 0">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.5rem;">Equipment Needed</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                    <template x-for="(eq, eqIdx) in selectedProgram.equipment" :key="'eq-' + eqIdx">
                      <span class="workout-tag" x-text="eq"></span>
                    </template>
                  </div>
                </div>
              </template>

              <!-- Reference Guide -->
              <template x-if="selectedProgram.overview?.referenceGuide && selectedProgram.overview.referenceGuide.length > 0">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.75rem;">Reference Guide</div>
                  <div style="display: flex; flex-direction: column; gap: 0;">
                    <template x-for="(section, secIdx) in selectedProgram.overview.referenceGuide" :key="'guide-' + secIdx">
                      <details class="ref-guide-section" style="border-top: 1px solid rgba(128,128,128,0.15);">
                        <summary style="padding: 0.75rem 0; cursor: pointer; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; user-select: none;">
                          <svg style="width: 12px; height: 12px; transition: transform 0.2s; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          <span x-text="section.title"></span>
                        </summary>
                        <div style="padding: 0 0 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
                          <!-- Content text -->
                          <template x-if="section.content">
                            <p style="line-height: 1.7; font-size: 0.85rem; margin: 0;" x-text="section.content"></p>
                          </template>

                          <!-- Bullet items -->
                          <template x-if="section.items && section.items.length > 0">
                            <ul style="margin: 0; padding-left: 1rem; list-style: disc; display: flex; flex-direction: column; gap: 0.3rem;">
                              <template x-for="(item, itemIdx) in section.items" :key="'item-' + secIdx + '-' + itemIdx">
                                <li style="line-height: 1.6; font-size: 0.85rem;" x-text="item"></li>
                              </template>
                            </ul>
                          </template>

                          <!-- Table -->
                          <template x-if="section.table">
                            <div style="overflow-x: auto;">
                              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                                <thead>
                                  <tr>
                                    <template x-for="(header, hIdx) in section.table.headers" :key="'th-' + secIdx + '-' + hIdx">
                                      <th style="text-align: left; padding: 0.4rem 0.6rem; border-bottom: 2px solid rgba(128,128,128,0.2); font-weight: 600; white-space: nowrap;" x-text="header"></th>
                                    </template>
                                  </tr>
                                </thead>
                                <tbody>
                                  <template x-for="(row, rIdx) in section.table.rows" :key="'tr-' + secIdx + '-' + rIdx">
                                    <tr>
                                      <template x-for="(cell, cIdx) in row" :key="'td-' + secIdx + '-' + rIdx + '-' + cIdx">
                                        <td style="padding: 0.35rem 0.6rem; border-bottom: 1px solid rgba(128,128,128,0.1);" :style="cIdx === 0 ? 'font-weight: 600; white-space: nowrap; min-width: 3rem;' : ''" x-text="cell"></td>
                                      </template>
                                    </tr>
                                  </template>
                                </tbody>
                              </table>
                            </div>
                          </template>

                          <!-- Subsections -->
                          <template x-if="section.subsections && section.subsections.length > 0">
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                              <template x-for="(sub, subIdx) in section.subsections" :key="'sub-' + secIdx + '-' + subIdx">
                                <div style="padding: 0.6rem 0.75rem; background: var(--color-sidebar); border-radius: 0.375rem;">
                                  <div style="font-weight: 600; font-size: 0.85rem;" x-text="sub.name"></div>
                                  <div style="font-size: 0.8rem; opacity: 0.75; margin-top: 0.2rem; font-family: monospace;" x-text="sub.detail"></div>
                                </div>
                              </template>
                            </div>
                          </template>

                          <!-- Example -->
                          <template x-if="section.example">
                            <div style="padding: 0.5rem 0.75rem; background: var(--color-sidebar); border-radius: 0.375rem; font-family: monospace; font-size: 0.75rem; line-height: 1.8; word-break: break-word; white-space: pre-wrap;" x-text="section.example"></div>
                          </template>
                        </div>
                      </details>
                    </template>
                  </div>
                </div>
              </template>

              <!-- Full Reference Text -->
              <template x-if="selectedProgram.overview?.referenceText">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.75rem;">Full Reference Text</div>
                  <pre style="white-space: pre-wrap; word-break: break-word; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8rem; line-height: 1.7; padding: 1rem; background: var(--color-bg-secondary, #f9fafb); border: 1px solid var(--color-border, #e5e7eb); border-radius: 0.5rem; margin: 0; max-height: 600px; overflow-y: auto;" x-text="selectedProgram.overview.referenceText"></pre>
                </div>
              </template>
            </div>
            </template>
          </div>
        </template>

        <template x-if="loading">
          <div class="loading-state">
            <span class="iconify" data-icon="lucide:loader-2"></span>
            <span>Loading workouts...</span>
          </div>
        </template>

        <template x-if="currentView === 'workout' && selectedWorkout && !loading">
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

              <!-- Home Gym Notes -->
              <template x-if="workoutHomeGym">
                <div style="margin-top: 0.75rem; padding: 0.6rem 0.75rem; background: rgba(128,128,128,0.06); border-radius: 0.5rem; display: flex; gap: 0.5rem; align-items: flex-start; font-size: 0.8rem;">
                  <span class="iconify" data-icon="lucide:plus-circle" style="font-size: 0.9rem; opacity: 0.45; margin-top: 0.1rem; flex-shrink: 0;"></span>
                  <span style="line-height: 1.5; opacity: 0.7;" x-text="workoutHomeGym"></span>
                </div>
              </template>

              <!-- Morning Flow -->
              <template x-if="workoutFlow">
                <div @click="selectWorkout(workoutFlow.workoutId)" style="margin-top: 0.75rem; padding: 0.6rem 0.75rem; background: var(--color-bg-secondary, #f9fafb); border: 1px solid var(--color-border, #e5e7eb); border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; transition: border-color 0.15s;">
                  <span style="font-size: 1rem;">&#9728;</span>
                  <div style="flex: 1;">
                    <span style="font-weight: 600;" x-text="workoutFlow.label || 'Morning Flow'"></span>
                    <template x-if="workoutFlow.notes">
                      <span style="opacity: 0.6; margin-left: 0.4rem;" x-text="workoutFlow.notes"></span>
                    </template>
                  </div>
                  <svg width="14" height="14" style="opacity: 0.4; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </template>

              <!-- Session Log -->
              <template x-if="workoutLog">
                <div x-data="{ logOpen: false }" style="margin-top: 0.75rem;">
                  <div @click="logOpen = !logOpen" style="cursor: pointer; display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; opacity: 0.7;">
                    <svg :style="logOpen ? 'transform: rotate(90deg)' : ''" width="12" height="12" style="min-width: 12px; max-width: 12px; min-height: 12px; max-height: 12px; flex-shrink: 0; transition: transform 0.15s;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                    <span x-text="'Session Log (' + workoutLog.entries.length + ')'"></span>
                  </div>
                  <div x-show="logOpen" x-collapse style="margin-top: 0.5rem;">
                    <template x-for="(entry, entryIdx) in workoutLog.entries" :key="'log-' + entryIdx">
                      <div style="padding: 0.75rem; background: var(--color-bg-secondary, #f9fafb); border: 1px solid var(--color-border, #e5e7eb); border-radius: 0.5rem; margin-bottom: 0.5rem; font-size: 0.8rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                          <span style="font-weight: 600;" x-text="entry.date"></span>
                          <template x-if="entry.cardio">
                            <span style="opacity: 0.6; font-size: 0.75rem;" x-text="entry.cardio"></span>
                          </template>
                        </div>
                        <template x-if="entry.notes">
                          <p style="margin: 0 0 0.5rem 0; opacity: 0.8; line-height: 1.4;" x-text="entry.notes"></p>
                        </template>
                        <template x-if="entry.exercises && entry.exercises.length > 0">
                          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                            <template x-for="(ex, exIdx) in entry.exercises" :key="'logex-' + exIdx">
                              <div style="display: flex; flex-wrap: wrap; gap: 0.25rem 0.5rem; align-items: baseline;">
                                <span style="font-weight: 500; min-width: 140px;" x-text="ex.id + (ex.swappedFor ? ' (for ' + ex.swappedFor + ')' : '')"></span>
                                <span style="opacity: 0.7; font-size: 0.75rem;" x-text="ex.sets.join(' / ')"></span>
                                <template x-if="ex.workingWeight">
                                  <span style="font-size: 0.7rem; background: var(--color-bg, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: 3px; padding: 0 4px; white-space: nowrap;">Working: <span x-text="ex.workingWeight"></span> lbs</span>
                                </template>
                              </div>
                            </template>
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
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
                  <template x-if="timer.currentSegment && !timer.isWorkoutComplete">
                    <button class="timer-inline-done" @click="timer.currentSegment?.isUserControlled ? timer.markDone() : timer.advanceToNextSegment()">
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
                          <div class="exercise-line" :class="{ 'expandable': ex.description || (ex.media && ex.media.length > 0) || generatedWorkout?.sourceUrl }" @click="(ex.description || (ex.media && ex.media.length > 0) || generatedWorkout?.sourceUrl) && toggleExerciseExpand(setIdx + '-' + exIdx)">
                            <div class="ex-title-row">
                              <template x-if="ex.shuffleable">
                                <button class="ex-shuffle" @click.stop="shuffleExercise(set.id, exIdx)" title="Shuffle">↻</button>
                              </template>
                              <span class="ex-name" x-text="ex.name"></span>
                              <span class="ex-duration" x-text="ex.duration ? ex.duration + 's' : (ex.reps ? ex.reps + ' reps' : '')"></span>
                              <template x-if="ex.media && ex.media.length > 0">
                                <span class="ex-media-icon"><span class="iconify" data-icon="lucide:play-circle"></span></span>
                              </template>
                              <template x-if="ex.description || (ex.media && ex.media.length > 0) || generatedWorkout?.sourceUrl">
                                <span class="ex-expand" :class="{ 'expanded': expandedExercises?.includes(setIdx + '-' + exIdx) }">
                                  <span class="iconify" data-icon="lucide:chevron-down"></span>
                                </span>
                              </template>
                            </div>
                            <template x-if="ex.notes">
                              <div class="ex-notes" x-text="ex.notes"></div>
                            </template>
                            <template x-if="expandedExercises?.includes(setIdx + '-' + exIdx)">
                              <div class="ex-expanded" @click.stop>
                                <p class="ex-full-name" x-text="ex.name"></p>
                                <template x-if="ex.description">
                                  <p class="ex-desc" x-text="ex.description"></p>
                                </template>
                                <template x-if="ex.media && ex.media.length > 0">
                                  <div class="ex-media-links">
                                    <template x-for="(m, mIdx) in ex.media.filter((v, i, a) => a.findIndex(x => x.value === v.value) === i)" :key="'m-' + mIdx">
                                      <div>
                                        <template x-if="m.type === 'image'">
                                          <img :src="getExerciseImagePath(m.value)" :alt="ex.name" loading="lazy" style="max-width:240px;border-radius:0.375rem;">
                                        </template>
                                        <template x-if="m.type === 'youtube'">
                                          <iframe :src="'https://www.youtube.com/embed/' + getYoutubeId(m.value)" frameborder="0" allowfullscreen style="width:240px;aspect-ratio:16/9;border:none;border-radius:0.375rem;"></iframe>
                                        </template>
                                        <template x-if="m.type === 'link' || m.type === 'tweet'">
                                          <a :href="m.value" target="_blank" rel="noopener" class="ex-media-link" @click.stop>
                                            <span class="iconify" data-icon="lucide:external-link"></span>
                                            <span x-text="(m.source || m.caption || 'Watch demo')"></span>
                                          </a>
                                        </template>
                                      </div>
                                    </template>
                                  </div>
                                </template>
                                <template x-if="generatedWorkout?.sourceUrl && !(ex.media && ex.media.length > 0)">
                                  <div class="ex-media-links">
                                    <a :href="generatedWorkout.sourceUrl" target="_blank" rel="noopener" class="ex-media-link" @click.stop>
                                      <span class="iconify" data-icon="lucide:external-link"></span>
                                      <span x-text="generatedWorkout.source || 'Watch workout'"></span>
                                    </a>
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

            <!-- Full Reference Text (for workouts like RRR) -->
            <template x-if="selectedWorkout.referenceText">
              <div style="margin-top: 1.5rem;">
                <div style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 0.75rem;">Full Reference Text</div>
                <pre style="white-space: pre-wrap; word-break: break-word; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8rem; line-height: 1.7; padding: 1rem; background: var(--color-bg-secondary, #f9fafb); border: 1px solid var(--color-border, #e5e7eb); border-radius: 0.5rem; margin: 0; max-height: 600px; overflow-y: auto;" x-text="selectedWorkout.referenceText"></pre>
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

    <!-- AI Chat Panel (Right Sidebar) -->
    <div class="chat-panel-wrapper" :class="{ 'open': chatOpen }">
    <aside class="chat-panel">
      <div class="chat-panel-header">
        <div class="chat-panel-title">
          <span class="iconify" data-icon="lucide:bot"></span>
          <span>AI Coach</span>
        </div>
        <div class="chat-panel-actions">
          <button class="chat-action-btn" @click="clearChat()" title="Clear chat">
            <span class="iconify" data-icon="lucide:trash-2"></span>
          </button>
          <button class="chat-action-btn" @click="chatOpen = false">
            <span class="iconify" data-icon="lucide:x"></span>
          </button>
        </div>
      </div>

      <template x-if="selectedWorkout">
        <div class="chat-context-bar">
          <span class="iconify" data-icon="lucide:eye"></span>
          <span x-text="'Viewing: ' + selectedWorkout.name"></span>
        </div>
      </template>

      <div class="chat-messages">
        <template x-if="chatMessages.length === 0">
          <div class="chat-empty">
            <span class="iconify" data-icon="lucide:message-square" style="font-size: 2rem; opacity: 0.3;"></span>
            <p>Ask me to modify your workout, generate a new one, or explain exercises.</p>
            <div class="chat-suggestions">
              <button class="chat-suggestion" @click="chatInput = 'Make this workout harder'; sendChatMessage()">Make it harder</button>
              <button class="chat-suggestion" @click="chatInput = 'Add more core exercises'; sendChatMessage()">Add more core</button>
              <button class="chat-suggestion" @click="chatInput = 'Generate a 20 min bodyweight workout'; sendChatMessage()">Quick bodyweight</button>
            </div>
          </div>
        </template>

        <template x-for="(msg, msgIdx) in chatMessages" :key="'chat-' + msgIdx">
          <div class="chat-message" :class="msg.role">
            <div class="chat-message-content" x-html="renderMarkdown(msg.content)"></div>
            <template x-if="msg.role === 'assistant' && msg.workout">
              <div class="chat-message-actions">
                <button class="chat-apply-btn" @click="applyAIWorkout(msg.workout)">
                  <span class="iconify" data-icon="lucide:download"></span>
                  Save &amp; Apply
                </button>
              </div>
            </template>
          </div>
        </template>

        <template x-if="chatLoading">
          <div class="chat-message assistant">
            <div class="chat-typing"><span></span><span></span><span></span></div>
          </div>
        </template>
      </div>

      <div class="chat-input-area">
        <input
          type="text"
          class="chat-input-field"
          x-model="chatInput"
          @keydown.enter="sendChatMessage()"
          placeholder="Ask about this workout..."
          :disabled="chatLoading"
        />
        <button class="chat-send-btn" @click="sendChatMessage()" :disabled="!chatInput.trim() || chatLoading">
          <span class="iconify" data-icon="lucide:send"></span>
        </button>
      </div>
    </aside>
    </div>
  </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/marked@15/marked.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js"></script>

<script>
${generatorJs}

${timelineJs}

${timerJs}

${chatJs}

function routineStackApp() {
  const chatMixin = typeof chatPanel === 'function' ? chatPanel() : {};
  return {
    ...chatMixin,
    sidebarOpen: true,
    loading: true,
    initialized: false,
    isMobile: false,
    savedWorkouts: [],
    routines: [],
    programs: [],
    allWorkouts: [],
    exercisesCatalogue: [],
    progressions: {},
    selectedWorkoutId: null,
    selectedRoutineId: null,
    selectedActivity: null,
    selectedProgram: null,
    selectedWeekIdx: null,
    copied: false,
    generatedWorkout: null,
    expandedExercises: [],

    // Exercise library state
    currentView: 'workout',
    exerciseSearch: '',
    exerciseCategoryFilter: '',
    exerciseMuscleFilter: '',
    exerciseEquipmentFilter: '',
    exerciseTypeFilter: '',
    expandedLibraryExercises: [],
    _filteredExerciseResults: [],

    // Training notes state
    notesHtml: '',

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

    get workoutLog() {
      if (!this.selectedWorkoutId) return null;
      for (const program of this.programs) {
        if (!program.weeks) continue;
        for (const week of program.weeks) {
          if (!week.log) continue;
          const entries = week.log.filter(l => l.workoutId === this.selectedWorkoutId);
          if (entries.length > 0) return { program, week, entries };
        }
      }
      return null;
    },

    get workoutFlow() {
      if (!this.selectedWorkoutId) return null;
      for (const program of this.programs) {
        if (!program.weeks) continue;
        for (const week of program.weeks) {
          // Check per-day flow first
          const day = week.schedule?.find(d => d.workoutId === this.selectedWorkoutId);
          if (day?.flow) return day.flow;
          // Fall back to week-level flow
          if (week.flow && day) return week.flow;
        }
      }
      return null;
    },

    get workoutHomeGym() {
      if (!this.selectedWorkoutId) return null;
      for (const program of this.programs) {
        if (!program.weeks) continue;
        for (const week of program.weeks) {
          const day = week.schedule?.find(d => d.workoutId === this.selectedWorkoutId);
          if (day?.homeGym) return day.homeGym;
        }
      }
      return null;
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
        return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true });
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

    getSlugFromUrl() {
      const path = window.location.pathname;
      if (path === '/' || path === '') return null;
      let slug = path;
      if (slug.startsWith('/')) slug = slug.substring(1);
      if (slug.endsWith('/')) slug = slug.substring(0, slug.length - 1);
      if (slug.startsWith('api/') || slug.startsWith('static/')) return null;
      return slug || null;
    },

    // Keep old name for compatibility
    getWorkoutIdFromUrl() {
      const slug = this.getSlugFromUrl();
      if (!slug) return null;
      // program/ prefix means it's a program overview, not a workout
      if (slug.startsWith('program/')) return null;
      if (slug === 'exercise-library') return null;
      return slug;
    },

    getProgramIdFromUrl() {
      const slug = this.getSlugFromUrl();
      if (!slug) return null;
      if (slug.startsWith('program/')) return slug.substring('program/'.length);
      return null;
    },

    updateUrl(id, type = 'workout') {
      if (!id) {
        if (window.location.pathname !== '/') {
          window.history.pushState({ type: null, id: null }, '', '/');
        }
        return;
      }
      const currentPath = type === 'program' ? '/program/' + id : '/' + id;
      if (window.location.pathname !== currentPath) {
        window.history.pushState({ type, id }, '', currentPath);
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
        const navSlug = this.getSlugFromUrl();
        if (navSlug === 'exercise-library') {
          this.currentView = 'exercises';
          this.selectedWorkoutId = null;
          this.generatedWorkout = null;
          return;
        }
        if (this.currentView === 'exercises') {
          this.currentView = 'workout';
        }
        const programId = this.getProgramIdFromUrl();
        if (programId) {
          const program = this.programs.find(p => p.id === programId);
          if (program) {
            this.selectProgramOverview(program, false);
            return;
          }
        }
        const workoutId = this.getWorkoutIdFromUrl();
        if (workoutId && workoutId !== this.selectedWorkoutId) {
          this.selectWorkout(workoutId, false);
        } else if (!workoutId && this.selectedWorkoutId) {
          this.selectedWorkoutId = null;
          this.generatedWorkout = null;
          this.selectedProgram = null;
        }
      });

      await this.loadData();
      await this.loadExercisesCatalogue();
      await this.loadProgressions();
      this.autoLoadRandomWorkout();

      // Initialize AI chat panel
      if (this.initChat) this.initChat();

      // Update filtered exercises on any filter change
      this.updateFilteredExercises();
      this.$watch('exerciseSearch', () => this.updateFilteredExercises());
      this.$watch('exerciseCategoryFilter', () => this.updateFilteredExercises());
      this.$watch('exerciseMuscleFilter', () => this.updateFilteredExercises());
      this.$watch('exerciseEquipmentFilter', () => this.updateFilteredExercises());
      this.$watch('exerciseTypeFilter', () => this.updateFilteredExercises());
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

        // Load programs
        try {
          const res = await fetch('/api/programs');
          if (res.ok) {
            this.programs = (await res.json()).sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
            console.log('Loaded ' + this.programs.length + ' programs');
          }
        } catch (e) {
          console.warn('Could not load programs:', e);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        this.loading = false;
      }
    },

    autoLoadRandomWorkout() {
      // Check URL for exercise library
      const slug = this.getSlugFromUrl();
      if (slug === 'exercise-library') {
        this.currentView = 'exercises';
        return;
      }

      // First, check URL for program overview
      const urlProgramId = this.getProgramIdFromUrl();
      if (urlProgramId) {
        const program = this.programs.find(p => p.id === urlProgramId);
        if (program) {
          console.log('Loading program from URL:', urlProgramId);
          this.selectProgramOverview(program, false);
          return;
        } else {
          console.warn('Program not found in URL:', urlProgramId);
        }
      }

      // Then, check URL for workout ID
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

    async loadNotes() {
      try {
        const res = await fetch('/static/notes.md');
        if (res.ok) {
          const md = await res.text();
          this.notesHtml = marked.parse(md);
        }
      } catch (e) { console.warn('Could not load notes:', e); }
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

    toggleExerciseLibrary() {
      if (this.currentView === 'exercises') {
        this.currentView = 'workout';
        window.history.pushState({ type: null, id: null }, '', '/');
      } else {
        this.currentView = 'exercises';
        this.selectedWorkoutId = null;
        this.generatedWorkout = null;
        this.selectedActivity = null;
        window.history.pushState({ type: 'exercises' }, '', '/exercise-library');
      }
      if (this.isMobile) this.sidebarOpen = false;
    },

    selectWorkout(id, updateUrl = true) {
      this.currentView = 'workout';
      this.selectedWorkoutId = id;
      this.selectedActivity = null;
      this.selectedProgram = null;
      this.selectedWeekIdx = null;
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

    selectActivity(day, program, weekNum) {
      this.selectedWorkoutId = null;
      this.generatedWorkout = null;
      this.selectedProgram = null;
      this.selectedWeekIdx = null;
      this.selectedActivity = {
        ...day,
        _dayKey: program.id + (weekNum ? '-w' + weekNum : '') + '-' + day.day,
        _programName: program.name,
      };
      if (this.isMobile) this.sidebarOpen = false;
    },

    selectProgramOverview(program, updateUrl = true) {
      this.currentView = 'workout';
      this.selectedWorkoutId = null;
      this.generatedWorkout = null;
      this.selectedActivity = null;
      this.selectedProgram = program;
      this.selectedWeekIdx = null;
      if (updateUrl) {
        this.updateUrl(program.id, 'program');
      }
      if (this.isMobile) this.sidebarOpen = false;
    },

    selectWeek(program, weekIdx) {
      this.currentView = 'workout';
      this.selectedWorkoutId = null;
      this.generatedWorkout = null;
      this.selectedActivity = null;
      this.selectedProgram = program;
      this.selectedWeekIdx = weekIdx;
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
        'stretch': 'lucide:move-diagonal',
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

    // ─── Exercise Library ──────────────────────────────────────

    get exerciseCategories() {
      const cats = new Set();
      for (const ex of this.exercisesCatalogue) {
        if (ex.category) cats.add(ex.category);
      }
      return [...cats].sort();
    },

    get exerciseMuscles() {
      const muscles = {};
      for (const ex of this.exercisesCatalogue) {
        for (const m of (ex.muscles || [])) {
          muscles[m] = (muscles[m] || 0) + 1;
        }
      }
      return Object.entries(muscles)
        .map(([m]) => m)
        .sort((a, b) => a.localeCompare(b));
    },

    get exerciseTypes() {
      const types = new Set();
      for (const ex of this.exercisesCatalogue) {
        if (ex.type) types.add(ex.type);
      }
      return [...types].sort();
    },

    get exerciseEquipmentList() {
      const eq = {};
      for (const ex of this.exercisesCatalogue) {
        for (const e of (ex.equipment || [])) {
          eq[e] = (eq[e] || 0) + 1;
        }
      }
      return Object.entries(eq)
        .map(([e]) => e)
        .sort((a, b) => a.localeCompare(b));
    },

    updateFilteredExercises() {
      let results = [...this.exercisesCatalogue];

      // Category filter
      if (this.exerciseCategoryFilter) {
        results = results.filter(ex => ex.category === this.exerciseCategoryFilter);
      }

      // Muscle filter
      if (this.exerciseMuscleFilter) {
        results = results.filter(ex => ex.muscles && ex.muscles.includes(this.exerciseMuscleFilter));
      }

      // Equipment filter
      if (this.exerciseEquipmentFilter) {
        results = results.filter(ex => ex.equipment && ex.equipment.includes(this.exerciseEquipmentFilter));
      }

      // Type filter
      if (this.exerciseTypeFilter) {
        results = results.filter(ex => ex.type === this.exerciseTypeFilter);
      }

      // Text search (simple BM25-ish: name match weighted highest, then description, then tags)
      const q = (this.exerciseSearch || '').trim().toLowerCase();
      if (q) {
        const terms = q.split(/\s+/);
        results = results.map(ex => {
          let score = 0;
          const name = (ex.name || '').toLowerCase();
          const desc = (ex.description || '').toLowerCase();
          const tags = (ex.tags || []).join(' ').toLowerCase();
          const muscles = (ex.muscles || []).join(' ').toLowerCase();
          const category = (ex.category || '').toLowerCase();

          for (const term of terms) {
            // Name match (highest weight)
            if (name.includes(term)) score += 10;
            if (name.startsWith(term)) score += 5;
            // Category match
            if (category.includes(term)) score += 6;
            // Muscle match
            if (muscles.includes(term)) score += 4;
            // Tag match
            if (tags.includes(term)) score += 3;
            // Description match
            if (desc.includes(term)) score += 1;
          }
          return { ...ex, _score: score };
        })
        .filter(ex => ex._score > 0)
        .sort((a, b) => b._score - a._score);
      } else {
        // Default sort: alphabetical by name
        results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }

      this._filteredExerciseResults = results;
    },

    clearExerciseFilters() {
      this.exerciseSearch = '';
      this.exerciseCategoryFilter = '';
      this.exerciseMuscleFilter = '';
      this.exerciseEquipmentFilter = '';
      this.exerciseTypeFilter = '';
    },

    toggleLibraryExercise(exId) {
      if (!this.expandedLibraryExercises) this.expandedLibraryExercises = [];
      const idx = this.expandedLibraryExercises.indexOf(exId);
      if (idx === -1) this.expandedLibraryExercises.push(exId);
      else this.expandedLibraryExercises.splice(idx, 1);
    },

    formatCategory(cat) {
      if (!cat) return '';
      return cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

    getCategoryIcon(cat) {
      const icons = {
        'chest': 'lucide:heart',
        'back-vertical-pull': 'lucide:arrow-up',
        'back-horizontal-pull': 'lucide:arrow-left',
        'shoulders': 'lucide:mountain',
        'arms-biceps': 'lucide:beef',
        'arms-triceps': 'lucide:beef',
        'legs-quads': 'lucide:footprints',
        'legs-hip-hinge': 'lucide:footprints',
        'calves': 'lucide:footprints',
        'core': 'lucide:circle-dot',
        'full-body': 'lucide:person-standing',
        'mobility': 'lucide:stretch-horizontal',
        'cardio': 'lucide:zap',
      };
      return icons[cat] || 'lucide:dumbbell';
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
