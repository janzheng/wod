This is a tiny integration seam for Smolbox. The actual project remains a normal Git clone. Smolbox uses the files in `.smolbox/` to understand how to build, test, and run this repository.

**Commands**
* **build** – `deno task build`
* **test** – `deno task ai:test`
* **start** – `deno task dev`

**Port** – 8010

Secrets are only referenced by name. The values must be supplied at runtime and are **not** stored here. Do not copy `*.env` files or any credentials into the repo.

Smolbox treats this directory as a non‑invasive integration point and ignores any other configuration.

nDo not store VM images, checkpoints, generated runtime state, or credentials in this directory.
