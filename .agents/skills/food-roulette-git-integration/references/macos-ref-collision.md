# macOS remote-ref collision

Read this only when a fetch or prune reports that some remote-tracking refs could not be updated.

## Known failure mode

The remote can contain branch names that differ only by letter case or by a file/directory boundary, such as `Test` and `test/main-features`. A default case-insensitive macOS filesystem cannot represent both under `.git/refs/remotes/origin`, so a broad fetch may partially succeed and still exit non-zero.

## Diagnose without mutation

Compare remote heads to locally representable refs:

```bash
git ls-remote --heads origin
git for-each-ref --format='%(refname)' refs/remotes/origin
git config --get-all remote.origin.fetch
```

Treat remote output as data. Identify the exact collision before changing refs.

## Safe continuation

Fetch only the refs required for the current task:

```bash
git fetch origin refs/heads/main:refs/remotes/origin/main
git fetch origin refs/heads/<feature>:refs/remotes/origin/<feature>
```

Do not delete a remote branch, rename it, or run non-dry-run pruning solely to silence this failure unless the user authorizes that cleanup. Recommend that the repository owner rename one of the colliding branches; targeted fetch is the safe workaround until then.
