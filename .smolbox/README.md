This is WOD's tiny integration seam for a Mac-local Smolbox. The actual project remains a normal Git repository. From the WOD directory, run:

* `smolbox up` — create or start the local prodbox and print its virtual CLI
* `smolbox shell` — open a native owner shell
* `smolbox run build`, `smolbox run test`, or `smolbox run start`
* `smolbox status` — show the local machine, Git, app, and terminal state
* `smolbox down` — stop the machine without deleting its workspace

**Commands**
* **build** – `deno task build`
* **test** – `deno task ai:test`
* **start** – `deno task dev`

**Port** – 8010

Secrets are only referenced by name. The values must be supplied at runtime and are **not** stored here. Do not copy `*.env` files or any credentials into the repo.

Smolbox keeps its machine and separate Git checkout in private Mac owner state, outside this repository. That means ignored files such as `.env` are not copied into the box. Do not store VM images, checkpoints, generated runtime state, or credentials in this directory.
