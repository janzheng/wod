This is WOD's tiny integration seam for a Mac-local Smolbox. The actual project remains a normal Git repository. From the WOD directory, run:

* `smolbox up` — create or start the local prodbox and print its virtual CLI
* `smolbox shell` — open a native owner shell
* `smolbox run build`, `smolbox run test`, or `smolbox run start`
* `smolbox status` — show the local machine, Git, app, and terminal state
* `smolbox down` — stop the machine without deleting its workspace

## Public WOD Builder

The AI panel at `https://wod.janzheng.com` runs Pi inside `smolbox-wod`. Its
default is the separate inference fabric's `coding` route, configured through a
private Pi provider file at `/root/.smolbox/pi-fabric/models.json`. The fabric,
not WOD or smolbox core, chooses the exact Spark or OpenRouter leg. Pi starts in
`/workspace` with normal coding tools, so it can inspect and change this WOD
checkout. Each browser gets a persistent Pi session; clearing the chat starts a
new one. Terminal `pi` remains the owner's direct OpenRouter/Ollama command and
shares the files, but not the browser conversation transcript.

Each browser turn also sends the current WOD view's title, route, and
project-relative source path. It does not copy the rendered page contents. When
you ask about “this page,” Pi is instructed to inspect that source file with a
project tool before answering. Notes map to their Markdown file; workout and
exercise views map to their canonical `workouts/` and `exercises/` source
directories; program and activity views map to the
program JSON. This is the normal WOD Builder path, not a separate smolbox-only
chat implementation.

This is deliberately a public, no-auth prototype. Anyone who reaches it can
change WOD and consume the personal box's model quota. The current `coding`
route prefers OpenRouter's free endpoint, then NVIDIA Build, then the local
Spark model. The remote free providers may log traffic, so do not send private
or personal information. Free routes are rate-limited and a turn can take a
while.

The browser's fabric provider contains only its private endpoint and a
meaningless local placeholder; Spark and OpenRouter credentials stay with the
separate fabric process. Owner OpenRouter login remains private guest state at
`/root/.smolbox/pi/auth.json` for terminal use and rollback. Do not put a key in
`.env.example` or commit one to this repository. To roll the browser Builder
back, start WOD with `WOD_PI_PROVIDER=openrouter`,
`WOD_PI_MODEL=nvidia/nemotron-3-super-120b-a12b:free`, and
`WOD_PI_CONFIG_DIR=/root/.smolbox/pi`.
`WOD_AGENT_BASE_URL` is only a non-secret seam: blank means the chat calls the
same WOD origin; a later separately served frontend can point it at an approved
agent endpoint.

**Commands**
* **build** – `deno task build`
* **test** – `deno task ai:test`
* **start** – `deno task dev`

**Port** – 8010

Secrets are only referenced by name. The values must be supplied at runtime and are **not** stored here. Do not copy `*.env` files or any credentials into the repo.

Smolbox keeps its machine and separate Git checkout in private Mac owner state, outside this repository. That means ignored files such as `.env` are not copied into the box. Do not store VM images, checkpoints, generated runtime state, or credentials in this directory.
