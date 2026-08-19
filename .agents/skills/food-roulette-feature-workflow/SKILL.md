---
name: food-roulette-feature-workflow
description: Route Food Roulette feature work from current repository context through a verified handoff. Use when implementing, debugging, reviewing, integrating, or reporting work in this repository, especially across owners, dirty working trees, approved contracts, package quality gates, or progress documentation.
---

# Food Roulette Feature Workflow

Use this skill as a context router, not a static copy of the repository. Discover current state and load only the material required by the task.

## 1. Establish current truth

Run the read-only snapshot:

```bash
bash "$(git rev-parse --show-toplevel)/.agents/skills/food-roulette-feature-workflow/scripts/context-snapshot.sh"
```

Treat its branch, commit, divergence, working-tree, and runtime output as dynamic. Follow the repository instructions already supplied through `AGENTS.md`; read `CLAUDE.md` and `brand/prompts.md` section 0 before code work as those instructions require.

## 2. Route context by task

Do not preload every project document. Use `rg` to locate relevant headings, then read the complete selected section or file:

| Task | Load |
|---|---|
| UI, design, tone, copy | `brand/brand.md` and the relevant sitemap flow |
| Feature flow or data model | `brand/FOOD-ROULETTE-SITEMAP.md` section 19 plus the approved contract |
| Schema or API contract | Prisma schema, matching migrations, ERD notes, and API contract together |
| Resume, integration, or status | `docs/SESSION_HANDOFF.md`, then the relevant feature progress/walkthrough |
| Existing code change | Target file, at least one related file, and usages found with `rg` |
| Ownership or unclear decision | Owner matrix in `AGENTS.md` and open questions in `brand/prompts.md` section 9 |

Prefer current code and approved contracts over historical progress. If sources conflict, identify the conflict and ask the responsible owner; never rewrite spec to match code.

## 3. Decide before editing

Classify the task, owner, package boundary, dependencies, blockers, environment needs, and whether the request authorizes mutation. Create a short plan before edits.

Read [change-safety.md](references/change-safety.md) before modifying code, dependencies, contracts, Git state, or another owner's area. For diagnosis-only requests, inspect and explain without implementing.

## 4. Make the bounded change

Preserve pre-existing work and keep unrelated files out of the diff. Make the smallest coherent change that satisfies approved behavior. Keep UI text in Vietnamese, identifiers in English, credentials out of mobile/Git/logs, and repository abstractions intact. Never edit generated dependencies under `node_modules`.

## 5. Verify and hand off

Inspect the affected package manifest and run proportional gates from that package boundary. Read [verification-and-handoff.md](references/verification-and-handoff.md) when running gates, changing dependencies/schema, updating progress, preparing commits, or reporting completion.

Update handoff/progress only when authorized and only with observed results. Distinguish pass, fail, and skip; name the environment and prerequisites for skipped integration tests. Stop at the user's approval boundary—technical completion never implies permission to stage, commit, push, merge, publish, or run production migrations.
