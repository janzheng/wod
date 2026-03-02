#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read --allow-write
/**
 * WOD-AI Hono API Server.
 *
 * Usage:
 *   deno task ai:serve
 */

import "jsr:@std/dotenv/load";
import { Hono } from "hono";
import { createWodAI, getConfig } from "./mod.ts";
import { PATTERNS } from "./engine/patterns.ts";
import type { WorkoutIntent, ConversationSession } from "./types.ts";

const PORT = parseInt(Deno.env.get("AI_PORT") ?? "8001");
const dataDir = new URL("../../", import.meta.url).pathname;
const config = getConfig();

console.log("Loading exercise database...");
const wod = await createWodAI(dataDir, config);
console.log(`Loaded ${wod.index.size} exercises, ${wod.data.workouts.size} templates`);

const app = new Hono();

// In-memory session store
const sessions = new Map<string, ConversationSession>();

// Health
app.get("/health", (c) => c.json({ status: "ok", exercises: wod.index.size }));

// Generate workout from natural language
app.post("/api/generate", async (c) => {
  const body = await c.req.json<{ prompt: string }>();
  if (!body.prompt) return c.json({ error: "prompt is required" }, 400);

  try {
    const workout = await wod.generate(body.prompt);
    return c.json(workout);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// Generate from structured intent
app.post("/api/generate/intent", async (c) => {
  const intent = await c.req.json<WorkoutIntent>();
  try {
    const workout = await wod.generateFromIntent(intent);
    return c.json(workout);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// Conversation-aware generation with session support
app.post("/api/chat", async (c) => {
  const body = await c.req.json<{
    prompt: string;
    sessionId?: string;
    enableCritic?: boolean;
  }>();
  if (!body.prompt) return c.json({ error: "prompt is required" }, 400);

  try {
    const session = body.sessionId ? sessions.get(body.sessionId) : undefined;
    const result = await wod.chat({
      prompt: body.prompt,
      session,
      enableCritic: body.enableCritic,
    });

    sessions.set(result.session.id, result.session);

    return c.json({
      workout: result.workout,
      intent: result.intent,
      critique: result.critique,
      sessionId: result.session.id,
    });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// Clear a session
app.delete("/api/sessions/:id", (c) => {
  sessions.delete(c.req.param("id"));
  return c.json({ status: "ok" });
});

// Browse exercises with filters
app.get("/api/exercises", (c) => {
  const muscles = c.req.query("muscles")?.split(",").filter(Boolean);
  const equipment = c.req.query("equipment")?.split(",").filter(Boolean);
  const type = c.req.query("type");
  const tags = c.req.query("tags")?.split(",").filter(Boolean);
  const limit = parseInt(c.req.query("limit") ?? "50");

  const criteria: Record<string, unknown> = {};
  if (muscles?.length) criteria.muscles = muscles;
  if (equipment?.length) criteria.equipment = equipment;
  if (type) criteria.types = [type];
  if (tags?.length) criteria.tags = tags;

  const results = wod.index.query(criteria).slice(0, limit);
  return c.json({
    count: results.length,
    exercises: results.map(e => ({ id: e.id, name: e.name, type: e.type, muscles: e.muscles, equipment: e.equipment })),
  });
});

// Get exercise by ID
app.get("/api/exercises/:id", (c) => {
  const ex = wod.index.get(c.req.param("id"));
  if (!ex) return c.json({ error: "not found" }, 404);
  return c.json(ex);
});

// List patterns
app.get("/api/patterns", (c) => {
  return c.json(PATTERNS);
});

// List routines
app.get("/api/routines", (c) => {
  return c.json(Array.from(wod.data.routines.values()));
});

// Get vocabulary
app.get("/api/vocabulary", (c) => {
  return c.json(wod.index.getVocabulary());
});

// Get database summary
app.get("/api/summary", (c) => {
  return c.json({
    exercises: wod.index.size,
    workouts: wod.data.workouts.size,
    routines: wod.data.routines.size,
    progressions: wod.data.progressions.size,
    summary: wod.index.getSummary(),
  });
});

console.log(`WOD-AI API server listening on http://localhost:${PORT}`);
Deno.serve({ port: PORT }, app.fetch);
