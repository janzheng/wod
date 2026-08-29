This is WOD's tiny integration seam for a Mac-local Smolbox. The actual project remains a normal Git repository. From the WOD directory, run:

* `smolbox up` — create or start the local prodbox and print its virtual CLI
* `smolbox shell` — open a native owner shell
* `smolbox run build`, `smolbox run test`, or `smolbox run start`
* `smolbox status` — show the local machine, Git, app, and terminal state
* `smolbox down` — stop the machine without deleting its workspace

## Public WOD Builder

The AI panel at `https://wod.janzheng.com` runs Pi inside `smolbox-wod`. It is
pinned to OpenRouter's `nvidia/nemotron-3-super-120b-a12b:free` model and starts
in `/workspace` with normal coding tools, so it can inspect and change this WOD
checkout. Each browser gets a persistent Pi session; clearing the chat starts a
new one. Terminal `pi` sessions use the same account, model, and files, but not
the browser conversation transcript.

Each browser turn also sends the current WOD view's title, route, and
project-relative source path. It does not copy the rendered page contents. When
you ask about “this page,” Pi is instructed to inspect that source file with a
project tool before answering. Notes map to their Markdown file; workout and
exercise views map to their canonical `workouts/` and `exercises/` source
directories; program and activity views map to the
program JSON. This is the normal WOD Builder path, not a separate smolbox-only
chat implementation.

This is deliberately a public, no-auth prototype. Anyone who reaches it can
change WOD and consume the personal box's model quota. OpenRouter says free
endpoint traffic may be logged, so do not send private or personal information.
The free endpoint is rate-limited and a turn can take a while.

OpenRouter login remains private guest state at `/root/.smolbox/pi/auth.json`.
Do not put a key in `.env.example` or commit one to this repository.
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
