/**
 * Materialize the active program data that belongs in WOD's read-only snapshot.
 *
 * The source of truth stays in programs/. The generated static/programs/ copy
 * contains only active program definitions and logs; archived programs remain
 * outside the public Ask WOD data room.
 */

const PROJECT_ROOT = new URL("../", import.meta.url);
const PROGRAMS_ROOT = new URL("programs/", PROJECT_ROOT);
const OUTPUT_ROOT = new URL("static/programs/", PROJECT_ROOT);
const STAGING_ROOT = new URL(`static/.programs-build-${crypto.randomUUID()}/`, PROJECT_ROOT);

async function jsonFiles(directory: URL): Promise<string[]> {
  const names: string[] = [];
  for await (const entry of Deno.readDir(directory)) {
    if (entry.isFile && entry.name.endsWith(".json")) names.push(entry.name);
  }
  return names.sort();
}

async function copyJsonDirectory(source: URL, destination: URL): Promise<number> {
  await Deno.mkdir(destination, { recursive: true });
  const names = await jsonFiles(source);
  for (const name of names) {
    const sourceFile = new URL(name, source);
    JSON.parse(await Deno.readTextFile(sourceFile));
    await Deno.copyFile(sourceFile, new URL(name, destination));
  }
  return names.length;
}

try {
  const programs = await copyJsonDirectory(PROGRAMS_ROOT, STAGING_ROOT);
  const logs = await copyJsonDirectory(new URL("logs/", PROGRAMS_ROOT), new URL("logs/", STAGING_ROOT));
  await Deno.remove(OUTPUT_ROOT, { recursive: true }).catch((cause) => {
    if (!(cause instanceof Deno.errors.NotFound)) throw cause;
  });
  await Deno.rename(STAGING_ROOT, OUTPUT_ROOT);
  console.log(`✅ Snapshot data: ${programs} active programs + ${logs} program logs → static/programs`);
} catch (cause) {
  await Deno.remove(STAGING_ROOT, { recursive: true }).catch(() => {});
  throw cause;
}
