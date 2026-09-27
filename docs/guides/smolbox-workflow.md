# Work on WOD in the box and exchange changes with the Mac

Use this guide when asked to start WOD in smolbox, check whether it is current,
or bring changes from one checkout to the other.

## Identify the checkout first

| Location | What it contains |
| --- | --- |
| Mac: `/Users/janzheng/Desktop/Projects/__active/_deno/wod` | Original/canonical WOD Git checkout. |
| Mac: `/Users/janzheng/Library/Application Support/smolbox/project-boxes/wod/workspace` | Separate box Git checkout, mounted into the VM at `/workspace`. |
| VM: `/workspace` | The same files as the second row, not the original checkout. Guest home, accounts and conversations live separately on the VM disk. |

On the Mac, `.smolbox/project.json` selects the existing `smolbox-wod-g2`.
Use `smolbox status` to verify the current attachment; don't create a replacement
computer to answer a status question. WOD runs on this Mac, not Spark.

**Access rollout, September 6:** Cloudflare Access now protects Builder and
the terminal, including host-side token validation. WOD restarted on the Mac;
Claude Max login and the existing inference/Ask settings survived. Public
reads and signed-out challenges passed. Email login worked before the restart;
post-rollout authenticated Builder/terminal, phone and expiry checks remain
open. WOD has not moved to Spark. Do not start a retained Spark copy.

**Inside the VM:** use `pwd` and `git rev-parse --show-toplevel` to identify
your checkout. The canonical Mac path is not mounted into the guest. If you
cannot inspect both checkouts, say so and give the owner the Mac-side check
below. Don't claim a full comparison or try to escape the VM to perform it.

## Enter the existing computer

From the Mac:

```sh
cd /Users/janzheng/Desktop/Projects/__active/_deno/wod
smolbox shell
```

Inside its shell, work in `/workspace` and launch `claude`, `codex` or `pi`
by name. Use the agent's normal personal login if required. Accounts and saved
conversations belong to this computer; Mac logins/history are not copied.
Read [CLAUDE.md](../../CLAUDE.md) for the coaching, prior-context and build rules.

Build and test inside the guest with `deno task build` and `deno task ai:test`.
Those commands do not deploy. Account/resume help is in `docs personal-agents`
inside the box's shell.

## Check whether the training material matches

### Update the separate shared Spark box

`wod-shared.janzheng.com` is the independent shared Spark computer, not this
personal Mac box. Its full training data was imported September 7. To update
it again from regular local WOD (without copying code or accounts), run on Mac:

```sh
cd /Users/janzheng/Desktop/Projects/__active/_projects/smolbox
node wod-data-sync.mjs preview
node wod-data-sync.mjs apply '/absolute/plan/path/printed/above.json'
```

Finish shared agent edits first. The command backs up replacements, refuses
unresolved conflicts and rebuilds the shared catalogues. It does not delete
shared-only files, auto-sync back, deploy Deno, or refresh Ask. Full instructions
are in smolbox's `workspace/docs/wod-data-sync.md` (`docs wod-data-sync` inside
the shared shell). Public reading includes the owner-approved training notes
and logs; Builder/terminal still require Access.

### Compare the personal Mac box

For browser access and restart instructions, see the sections below. A running
box and a working login do not establish that its files match the Mac.

Run these read-only checks **on the Mac**, even when helping an agent inside
the VM:

```sh
wod_mac=/Users/janzheng/Desktop/Projects/__active/_deno/wod
wod_box="/Users/janzheng/Library/Application Support/smolbox/project-boxes/wod/workspace"

git -C "$wod_mac" status --short
git -C "$wod_mac" log -3 --oneline
git -C "$wod_box" status --short
git -C "$wod_box" log -3 --oneline

for part in exercises workouts programs progressions docs/notes NOTES.md CLAUDE.md; do
  git diff --no-index --stat -- "$wod_mac/$part" "$wod_box/$part"
done
```

No diff output means those selected files match, including uncommitted edits.
Git diff exits 1 for differences; a missing path or another error is not a match.
Inspect any reported differences. Check other source/UI/config files separately
if the user asks whether the *entire application* matches; this loop checks
training material and instructions, not every file.

Report training-data differences separately from UI, config, docs and local
uncommitted work. Different HEAD hashes alone do not mean the box is stale:
it retains extra Ask/collaboration code and some updates were cherry-picked.

**Last verified September 6, 2026:** training material and instructions matched
through canonical W29 commit `425430e`. The box's local readiness checkpoint
is `be1c2ff` on `smolbox/personal-agents-20260905`; its previous branch was
preserved. The full applications still differ. Recheck live files when asked;
this dated result is not an automatic-sync promise.

## Transfer reviewed work in either direction

There is no automatic synchronization. Pick one checkout for the current work.
When asked to transfer it, inspect both dirty trees first and agree which
changes belong in the transfer; commit only the intended source changes.
Do not mix in another agent's work or automatically commit everything.

On the Mac, choose **one** fetch direction:

```sh
# Bring committed Mac work into the box for review:
git -C "$wod_box" fetch --no-tags "$wod_mac" HEAD

# OR bring committed box work into the Mac for review:
git -C "$wod_mac" fetch --no-tags "$wod_box" HEAD
```

These commands only fetch; they do not update destination files. In the chosen
destination, review `HEAD..FETCH_HEAD` and the actual file diff, then apply
selected new commits or a reviewed merge. Fetch does not include uncommitted
files. Local path exchange needs no GitHub login.

Preserve box-only Ask/collaboration changes. Do not reset either checkout,
mirror folders with deletion, blanket-overwrite source, or reapply the old
readiness checkpoint just because it has a different hash. Stop and surface
conflicts or ambiguous ownership. Build/test the destination after an update.
Publishing to Deno Deploy is a separate action requested by the owner.

## Distinguish current files from Ask WOD's snapshot

Native coding agents and WOD Builder can inspect the box's live checkout.
Read-only **Ask WOD** sees its declared immutable data snapshot. Updating WOD's
files or rebuilding the site does not refresh that room. At the September 6
check it still used the September 2 snapshot, not newly imported W29 data.

On the Mac, inspect `smolbox snapshot status "$wod_mac"` and
`smolbox data status` before proposing a refresh. A refresh is separate from Git
sync and must preserve existing conversation state; don't reset the room just
to make a version label current.

## Open WOD in a browser or on a phone

| Door | How to enter | Authority |
| --- | --- | --- |
| [WOD](https://wod.janzheng.com) | Open normally | Public reading of workouts, programs and notes. |
| WOD Builder on that site | Open the panel and use its sign-in action | Pi can inspect and edit the live box checkout. |
| [Owner terminal](https://wod-shell.janzheng.com/) | Bookmark the root URL and complete login | Root shell; can use accounts saved in the guest. |
| Ask WOD on the site | Open the separate Ask panel | Read-only declared snapshot; not the live checkout. |

Builder and terminal share the Cloudflare `EmailAccess` policy. Use an approved
email and enter the one-time code from its inbox; you do not need a Cloudflare
dashboard account or a shared password. The owner currently allows
`hello@janzheng.com`, `janeazy@gmail.com` and `jan@phage.directory`, all with
the same owner authority. Adding someone means trusting them with this computer,
not giving them a read-only account.

The **24 hours** is the browser's application-login session, not a deadline to
reconfigure Cloudflare. Access may renew it from an existing sign-in or ask for
another email code. If Builder requests sign-in again, use that action and
return to the page; pending jobs are checked, not automatically resubmitted.
See [Cloudflare session behavior](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/).

Cloudflare login opens the web door. Claude, Codex and GitHub logins inside
the VM are separate. Native `smolbox shell` and the Mac-loopback terminal do not
use the Cloudflare login. Ask keeps its separate public Quick Tunnel and did
not gain owner-only protection.

## Start, stop or restart without losing the computer

From the canonical WOD directory on the Mac, inspect `smolbox remote status`.
For routine public starts, reuse the saved configuration—do not recreate the
Cloudflare applications or reapply the Access profile:

```sh
export WOD_PI_PROVIDER=fabric
export WOD_PI_MODEL=coding
export WOD_PI_CONFIG_DIR=/root/.smolbox/pi-fabric
data_url="$(smolbox data status | jq -r '.publicUrl // empty')"
WOD_DATA_ROOM_BASE_URL="$data_url" smolbox remote
```

Check the separate inference service and Ask room first when testing chat.
A blank `data_url` does not start Ask. For a full restart, finish running
agent/Builder work (or explicitly approve interrupting it), run `smolbox down`,
then repeat the start above. There is no need to log out of Claude first.
Shutdown closes running processes; installed tools, saved accounts and
conversations, workspace files and the saved Access configuration persist.
Re-enter with `smolbox shell` and resume the agent's saved conversation.

To close only a web door, use `smolbox remote set terminal off` or
`smolbox remote set project off`; use `on` to reopen it with its saved protection.
Closing the launching terminal does not stop the host tunnel. Mac sleep makes
these Mac-hosted services unavailable; there is no automatic Deno or Spark
failover. The separately published Deno site has its own lifecycle.

The operator runbook is `docs/wod-tunnel-operations.md` in the smolbox repo at
`/Users/janzheng/Desktop/Projects/__active/_projects/smolbox` on the Mac.
Its `docs/project-access-setup.md` covers policy changes and remaining login
checks; `workspace/docs/project-location.md` covers the future explicit move.

## Keep these docs current

This guide lives in both WOD checkouts. Update both guides deliberately; that
does not sync application code or training data. To deliver smolbox's separate
field manual, run `smolbox docs sync` from the canonical WOD directory. In the
guest, use `docs wod-prodbox`, `docs personal-agents` or `/help`.
Manual sync updates `/opt/smolbox-manual`, not `/workspace`, and does not require
a WOD app restart.
