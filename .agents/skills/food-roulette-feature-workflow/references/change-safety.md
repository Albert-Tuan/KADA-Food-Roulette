# Change safety

Read this reference before any repository mutation, dependency or contract change, Git integration, or cross-owner work.

## Approval boundaries

Stop for approval before:

- Adding or upgrading dependencies; compare at least two viable options first.
- Changing approved spec, public API, schema contract, security boundary, or business rule.
- Editing `brand/*.md`, restructuring modules, or performing a broad refactor.
- Running migrations unless the database is explicitly confirmed disposable and safe.
- Staging, committing, pushing, merging, publishing, or destructive Git operations unless that exact action is authorized.

Do not treat permission for one action as permission for the next. In particular, permission to implement does not authorize staging or committing, and permission to commit does not authorize pushing.

## Working-tree protection

- Inspect tracked, untracked, staged, and ignored changes before integration work.
- Preserve user changes and compare dirty paths with incoming paths before pull or merge.
- Never use `git reset --hard`, destructive checkout, force-push, `git add .`, or `git add -A`.
- Do not stash, restore, stage, commit, or push without specific authorization.
- Resolve authorized conflicts by understanding both intents, never by choosing a side mechanically.

## Implementation boundaries

- Do not change another owner's feature merely because it is nearby; surface the dependency and owner.
- Keep mobile screens behind feature repositories/hooks rather than calling APIs or embedding mock behavior directly.
- Treat route parameters, API responses, client metadata, uploads, and external-service data as untrusted.
- Preserve approved technical identifiers and synchronize files required by `AGENTS.md` cross-file consistency rules.
- Do not weaken lint/security rules or edit unrelated modules merely to make a gate pass.
- Never use `npm audit fix --force`.

If current code and approved documents disagree, report exact evidence and request direction rather than guessing.
