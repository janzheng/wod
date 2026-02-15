import { listCommand } from "./commands/list.ts";
import { generateCommand } from "./commands/generate.ts";
import { loadCommand } from "./commands/load.ts";

const HELP = `
╔══════════════════════════════════════════════════╗
║           WORKOUT STACK CLI (WOD)                ║
╚══════════════════════════════════════════════════╝

USAGE:
  wod <command> [options]

COMMANDS:
  list [routines|workouts|exercises]
    List available routines, workouts, or exercises

  generate [options]
    Generate a workout
    Options:
      --workout=<id>    Generate specific workout
      --routine=<id>    Generate from routine
      --random          Random selection
      --json            Output as JSON
      --save=<name>     Save as favorite

  load [name]
    List or load saved workouts
    Options:
      --delete          Delete saved workout

  help
    Show this help message

EXAMPLES:
  wod list routines
  wod list workouts --routine=barre
  wod generate --workout=simple-barre
  wod generate --routine=morning --random
  wod generate --routine=gym --random --save=my-fav
  wod load my-fav

DENO TASKS:
  deno task wod           Interactive mode
  deno task wod:list      List routines
  deno task wod:saved     List saved workouts
  deno task wod:load      Load a saved workout
  deno task wod:barre     Generate barre workout
  deno task wod:morning   Generate morning workout
  deno task wod:gym       Generate gym workout
`;

async function interactiveMode(): Promise<void> {
  console.log("\n🏋️ WORKOUT STACK - Interactive Mode\n");
  console.log("Commands: list, generate, help, exit\n");

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  while (true) {
    await Deno.stdout.write(encoder.encode("wod> "));

    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    if (n === null) break;

    const input = decoder.decode(buf.subarray(0, n)).trim();
    if (!input) continue;

    const [cmd, ...args] = input.split(/\s+/);

    switch (cmd) {
      case "list":
        await listCommand(args);
        break;
      case "generate":
      case "gen":
        await generateCommand(args);
        break;
      case "load":
      case "saved":
        await loadCommand(args);
        break;
      case "help":
        console.log(HELP);
        break;
      case "exit":
      case "quit":
      case "q":
        console.log("Goodbye! 💪");
        return;
      default:
        // Try as workout ID
        if (cmd) {
          await generateCommand([cmd, ...args]);
        }
    }
  }
}

async function main(): Promise<void> {
  const args = Deno.args;

  if (args.length === 0) {
    // Interactive mode
    await interactiveMode();
    return;
  }

  const command = args[0];
  const cmdArgs = args.slice(1);

  switch (command) {
    case "list":
      await listCommand(cmdArgs);
      break;
    case "generate":
    case "gen":
      await generateCommand(cmdArgs);
      break;
    case "load":
    case "saved":
      await loadCommand(cmdArgs);
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      break;
    default:
      // Try as workout ID
      await generateCommand(args);
  }
}

main().catch(console.error);
