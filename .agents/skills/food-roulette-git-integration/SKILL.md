---
name: food-roulette-git-integration
description: Safely synchronize, merge, verify, and push Food Roulette branches. Use for requests involving main integration, conflict resolution, commits, pushes, or remote divergence; do not use for ordinary code changes that stop before Git delivery.
---

# Food Roulette Git Integration

Deliver Git changes without losing existing work, reversing merge direction, or expanding the user's authorization.

## Authority and default direction

- A request to "merge main" or "sync with main" means: fetch `origin/main` and merge it into the active feature branch.
- Do not merge a feature into `main`, push `main`, force-push, or delete remote refs unless the user explicitly requests that operation.
- A request to push a feature branch authorizes only that named branch. A request to push `main` authorizes a normal push after verification, never a force-push by implication.
- Preserve dirty and untracked work. Do not use `git reset --hard`, `git checkout --`, broad cleanup, or `git add .` / `git add -A` to make integration convenient.
- Keep `docs/SESSION_HANDOFF.md` local-only when it is ignored; never stage it incidentally.

## 1. Establish Git truth

Run the repository context snapshot, then inspect the exact refs involved:

```bash
bash "$(git rev-parse --show-toplevel)/.agents/skills/food-roulette-feature-workflow/scripts/context-snapshot.sh"
git status --short --branch
git remote -v
git log --oneline --decorate --graph -12
```

Record the active branch, upstream, dirty paths, local/remote divergence, and requested destination. If unrelated local changes overlap files likely to conflict, stop and ask before changing Git state.

## 2. Fetch only the required refs

Prefer an explicit target fetch so unrelated remote refs cannot block the task:

```bash
git fetch origin refs/heads/main:refs/remotes/origin/main
```

Fetch a source branch explicitly too when its remote state matters. If fetch reports that local refs could not be updated, read [macos-ref-collision.md](references/macos-ref-collision.md); do not delete or prune refs blindly.

## 3. Integrate in the requested direction

### Sync main into the active feature branch

Confirm the active branch is the intended feature branch, then merge the freshly fetched target:

```bash
git merge origin/main
```

This is the default for future "merge with main" requests. Push the feature branch only when requested.

### Deliver a feature branch into main

Only do this when the user explicitly asks to merge or push to `main`:

1. Confirm the source branch and a clean worktree.
2. Fetch `origin/main` explicitly.
3. Switch to local `main` and update it with `git merge --ff-only origin/main`.
4. Merge the named source branch. Follow the repository's current history or the user's requested merge style; do not squash or rebase silently.
5. Before pushing, fetch `origin/main` again and confirm it is still an ancestor of local `main`.

## 4. Resolve conflicts semantically

- List conflicts with `git diff --name-only --diff-filter=U`.
- Read both sides plus related usages/contracts before editing.
- Resolve each file according to current code and approved contracts, not wholesale `ours`/`theirs` selection.
- Stage only explicit resolved paths.
- Re-run checks on every resolved file; a syntactically resolved conflict is not necessarily correct.

## 5. Verify before delivery

Use `code-review-and-quality` before merging and `post-code-double-check` after code changes or conflict resolution.

At minimum:

```bash
git diff --check origin/main..HEAD
git status --short --branch
git log --oneline --decorate --graph -5
```

Run all gates for affected packages from their package directories. For schema changes, also validate Prisma and confirm migration status against the intended local database. Scan the outgoing diff for secrets and unexpected binaries.

## 6. Push and prove the result

- Use a normal, explicit push such as `git push origin main` or `git push origin <feature>`.
- If the push is rejected because the remote advanced, stop, fetch, integrate, and verify again. Never answer rejection with force-push by default.
- Verify the remote ref after push with `git ls-remote origin refs/heads/<branch>` and compare it to `git rev-parse HEAD`.
- Report merge direction, conflict status, commit hash, remote hash, gates, current branch, and any remaining local changes.
