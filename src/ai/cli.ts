#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read --allow-write
/**
 * WOD-AI CLI — AI-powered workout generator with conversation context.
 *
 * Usage:
 *   deno task ai:chat                          # start interactive mode
 *   deno task ai:chat --preset groq-8b         # use 8b model
 *   deno task ai:chat --preset local           # use local Ollama
 *   deno task ai:chat --once --prompt "leg day" # single generation, no REPL
 */

import "jsr:@std/dotenv/load";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { createWodAI, formatTerminal, formatJson, listPatterns, getConfig, getLastWorkout } from "./mod.ts";
import type { WodAI } from "./mod.ts";
import type { ConversationSession } from "./types.ts";

// ============================================================================
// Args
// ============================================================================

const args = parseArgs(Deno.args, {
  string: ["preset", "prompt", "model", "provider-url"],
  boolean: ["help", "once", "json", "verbose", "no-critic"],
  default: { preset: "groq", verbose: false, json: false, "no-critic": false },
  alias: { h: "help", p: "prompt", v: "verbose" },
});

if (args.help) {
  console.log(`
wod-ai — AI-powered workout generator

Usage: deno task ai:chat [options]

Options:
  --preset NAME         LLM preset: groq (default), groq-8b, local, lmstudio
  --model NAME          Override model name
  --provider-url URL    Override API base URL
  --once                Generate one workout and exit (use with --prompt)
  --prompt TEXT         Workout request (required with --once)
  --json                Output as JSON instead of formatted
  --no-critic           Disable the critic/reflection step
  -v, --verbose         Show debug info (intent, critic score)
  -h, --help            Show this help

In-chat commands:
  /patterns             List available workout patterns
  /browse <field>       Browse exercises (muscles, equipment, types, tags)
  /save <name>          Save last workout as JSON
  /vocab                Show available vocabulary
  /history              Show conversation history
  /reset                Clear conversation, start fresh
  /critique             Toggle critic on/off
  /last                 Show last parsed intent
  /json                 Show last workout as JSON
  /help                 Show commands
  /quit                 Exit
`);
  Deno.exit(0);
}

// ============================================================================
// Colors
// ============================================================================

const DIM = "\x1b[90m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

// ============================================================================
// Setup
// ============================================================================

// Data dir is the project root (exercises/, workouts/, routines/, progressions/)
const dataDir = new URL("../../", import.meta.url).pathname;
const overrides: Record<string, string> = {};
if (args.model) overrides.model = args.model;
if (args["provider-url"]) overrides.baseUrl = args["provider-url"];

const config = getConfig(args.preset, overrides);

console.log(`${DIM}Loading exercise database...${RESET}`);
const wod: WodAI = await createWodAI(dataDir, config);
console.log(`${GREEN}Loaded ${wod.index.size} exercises, ${wod.data.workouts.size} templates${RESET}`);
console.log(`${DIM}Model: ${config.model} @ ${config.baseUrl}${RESET}`);

// ============================================================================
// Single-shot mode
// ============================================================================

if (args.once) {
  const prompt = args.prompt ?? args._.join(" ");
  if (!prompt) {
    console.error(`${RED}Error: --once requires --prompt or positional arguments${RESET}`);
    Deno.exit(1);
  }

  console.log(`${DIM}Generating...${RESET}\n`);
  try {
    const result = await wod.chat({
      prompt: prompt as string,
      enableCritic: !args["no-critic"],
    });
    if (args.json) {
      console.log(formatJson(result.workout));
    } else {
      console.log(formatTerminal(result.workout));
    }
    if (args.verbose && result.critique) {
      console.log(`${DIM}Critic: ${result.critique.pass ? "PASS" : "FAIL"} (${result.critique.score}/5)${RESET}`);
    }
  } catch (err) {
    console.error(`${RED}Error: ${err}${RESET}`);
    Deno.exit(1);
  }
  Deno.exit(0);
}

// ============================================================================
// Interactive REPL
// ============================================================================

async function readLine(prompt: string): Promise<string | null> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  Deno.stdout.writeSync(encoder.encode(prompt));
  const buf = new Uint8Array(4096);
  const n = await Deno.stdin.read(buf);
  if (n === null) return null;
  return decoder.decode(buf.subarray(0, n)).trim();
}

console.log(`\n${BOLD}WOD-AI${RESET} — describe a workout and I'll generate it.`);
console.log(`${DIM}Try: "30 min upper body with dumbbells" or "something like the morning wakeup"${RESET}`);
console.log(`${DIM}Follow up: "make it harder" or "add more core" to refine${RESET}`);
console.log(`${DIM}Type /help for commands, /quit to exit${RESET}\n`);

let session: ConversationSession | undefined;
let criticEnabled = !args["no-critic"];

while (true) {
  const input = await readLine(`${CYAN}>${RESET} `);
  if (input === null) break;
  if (!input) continue;

  // Slash commands
  if (input.startsWith("/")) {
    const spaceIdx = input.indexOf(" ");
    const cmd = input.slice(1, spaceIdx === -1 ? undefined : spaceIdx).toLowerCase();
    const cmdArg = spaceIdx === -1 ? "" : input.slice(spaceIdx + 1).trim();

    switch (cmd) {
      case "quit":
      case "q":
      case "exit":
        console.log(`${DIM}Bye!${RESET}`);
        Deno.exit(0);
        break;

      case "help":
        console.log(`
${BOLD}Commands:${RESET}
  /patterns          List workout patterns
  /browse <field>    Browse exercises by: muscles, equipment, types, tags
  /vocab             Show valid field values
  /save <name>       Save last generated workout as JSON
  /json              Show last workout as JSON
  /history           Show conversation history
  /reset             Clear conversation, start fresh
  /critique          Toggle critic on/off (currently: ${criticEnabled ? "ON" : "OFF"})
  /last              Show last parsed intent
  /help              This help
  /quit              Exit

${BOLD}Examples:${RESET}
  ${DIM}make a barre workout${RESET}
  ${DIM}leg-heavy workout for a full gym${RESET}
  ${DIM}make it harder${RESET}               ${DIM}<- refines previous workout${RESET}
  ${DIM}add more core exercises${RESET}       ${DIM}<- modifies previous intent${RESET}
  ${DIM}swap the leg exercises${RESET}        ${DIM}<- re-rolls keeping structure${RESET}
  ${DIM}something completely different${RESET} ${DIM}<- fresh generation${RESET}
`);
        break;

      case "patterns":
        console.log(`\n${BOLD}Available Patterns:${RESET}\n${listPatterns()}\n`);
        break;

      case "vocab": {
        const v = wod.index.getVocabulary();
        console.log(`\n${BOLD}Types:${RESET} ${v.types.join(", ")}`);
        console.log(`${BOLD}Muscles:${RESET} ${v.muscles.join(", ")}`);
        console.log(`${BOLD}Equipment:${RESET} ${v.equipment.join(", ")}`);
        console.log(`${BOLD}Categories:${RESET} ${v.categories.join(", ")}`);
        console.log(`${BOLD}Difficulties:${RESET} ${v.difficulties.join(", ")}\n`);
        break;
      }

      case "browse": {
        const v = wod.index.getVocabulary();
        const field = cmdArg.toLowerCase();
        if (field === "muscles") console.log(`\n${BOLD}Muscles:${RESET} ${v.muscles.join(", ")}\n`);
        else if (field === "equipment") console.log(`\n${BOLD}Equipment:${RESET} ${v.equipment.join(", ")}\n`);
        else if (field === "types") console.log(`\n${BOLD}Types:${RESET} ${v.types.join(", ")}\n`);
        else if (field === "tags") console.log(`\n${BOLD}Tags:${RESET} ${v.tags.join(", ")}\n`);
        else if (field === "categories") console.log(`\n${BOLD}Categories:${RESET} ${v.categories.join(", ")}\n`);
        else console.log(`${YELLOW}Usage: /browse muscles|equipment|types|tags|categories${RESET}`);
        break;
      }

      case "json": {
        const lastW = session ? getLastWorkout(session) : undefined;
        if (lastW) {
          console.log(formatJson(lastW));
        } else {
          console.log(`${DIM}No workout generated yet.${RESET}`);
        }
        break;
      }

      case "save": {
        const lastW = session ? getLastWorkout(session) : undefined;
        if (!lastW) {
          console.log(`${DIM}No workout to save. Generate one first.${RESET}`);
          break;
        }
        const name = cmdArg || lastW.id;
        const savePath = `saved/${name}.json`;
        try {
          await Deno.mkdir("saved", { recursive: true });
          await Deno.writeTextFile(savePath, JSON.stringify(lastW, null, 2));
          console.log(`${GREEN}Saved to ${savePath}${RESET}`);
        } catch (err) {
          console.error(`${RED}Error saving: ${err}${RESET}`);
        }
        break;
      }

      case "history": {
        if (!session || session.turns.length === 0) {
          console.log(`${DIM}No conversation history yet.${RESET}`);
          break;
        }
        console.log(`\n${BOLD}Conversation (${session.turns.length} turns):${RESET}`);
        for (const turn of session.turns) {
          if (turn.role === "user") {
            console.log(`  ${CYAN}You:${RESET} ${turn.prompt}`);
          } else {
            const w = turn.workout;
            const critico = turn.critique;
            const scoreStr = critico ? ` ${DIM}(${critico.score}/5)${RESET}` : "";
            console.log(`  ${GREEN}AI:${RESET} ${w?.name ?? "?"}${scoreStr}`);
          }
        }
        console.log();
        break;
      }

      case "reset":
        session = undefined;
        console.log(`${GREEN}Conversation cleared. Starting fresh.${RESET}`);
        break;

      case "critique":
        criticEnabled = !criticEnabled;
        console.log(`${GREEN}Critic: ${criticEnabled ? "ON" : "OFF"}${RESET}`);
        break;

      case "last": {
        if (!session || session.turns.length === 0) {
          console.log(`${DIM}No turns yet.${RESET}`);
          break;
        }
        for (let i = session.turns.length - 1; i >= 0; i--) {
          if (session.turns[i].role === "user" && session.turns[i].intent) {
            console.log(`\n${BOLD}Last Intent:${RESET}`);
            console.log(JSON.stringify(session.turns[i].intent, null, 2));
            break;
          }
        }
        console.log();
        break;
      }

      default:
        console.log(`${YELLOW}Unknown command: /${cmd}. Type /help for commands.${RESET}`);
    }

    continue;
  }

  // Natural language -> generate workout via chat
  console.log(`${DIM}Generating${session?.turns.length ? " (refining)" : ""}...${RESET}`);
  try {
    const result = await wod.chat({
      prompt: input,
      session,
      enableCritic: criticEnabled,
    });
    session = result.session;

    if (args.verbose) {
      console.log(`${DIM}Intent: ${JSON.stringify(result.intent, null, 2)}${RESET}`);
    }

    if (result.critique) {
      if (args.verbose || !result.critique.pass) {
        const status = result.critique.pass ? "PASS" : "RETRIED";
        console.log(`${DIM}Critic: ${status} (${result.critique.score}/5)${RESET}`);
        if (result.critique.issues.length > 0) {
          for (const issue of result.critique.issues) {
            console.log(`${DIM}  - ${issue}${RESET}`);
          }
        }
      }
    }

    if (args.json) {
      console.log(formatJson(result.workout));
    } else {
      console.log(formatTerminal(result.workout));
    }
  } catch (err) {
    console.error(`${RED}Error: ${err}${RESET}`);
    if (args.verbose) console.error(err);
  }
}
