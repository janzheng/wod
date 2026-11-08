/**
 * Export the app as plain files for a static host (`deno task deploy` → surge).
 *
 * Every route the browser calls is a parameterless GET, so each one is rendered
 * once through the real app and written to dist/ at the same path.
 */
import { copy } from "@std/fs";
import { app } from "../main.ts";

const DIST = new URL("../dist/", import.meta.url);
const ROUTES = [
  "/api/routines",
  "/api/workouts",
  "/api/saved",
  "/api/programs",
  "/api/exercises",
  "/api/progressions",
  "/sw.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

await Deno.remove(DIST, { recursive: true }).catch(() => {});
await copy(new URL("../static/", import.meta.url), new URL("static/", DIST));

for (const route of ["/", ...ROUTES]) {
  const res = await app.request(route);
  if (!res.ok) throw new Error(`${route} → ${res.status}`);
  const file = new URL("." + (route === "/" ? "/index.html" : route), DIST);
  await Deno.mkdir(new URL("./", file), { recursive: true });
  await Deno.writeFile(file, new Uint8Array(await res.arrayBuffer()));
}

// surge serves 200.html for any path without a file, so deep links like
// /fb-w35-push still open the app, as the server's catch-all did.
await Deno.copyFile(new URL("index.html", DIST), new URL("200.html", DIST));
console.log(`✅ Static site → dist/ (${ROUTES.length + 1} routes + static/)`);
