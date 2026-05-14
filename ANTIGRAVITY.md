# ANTIGRAVITY.md

## Git Commit Rules

- Use Conventional Commits
- Keep commits atomic
- Never create vague commit messages
- Explain WHY the change exists
- Group related changes only

## Commit Format

```
type: short summary
```

Examples:

```
feat: add JWT refresh token flow
fix: prevent duplicated user creation
refactor: simplify dashboard sidebar state
perf: optimize avatar lazy loading
```

## Valid Types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change without behavior change |
| `perf` | Performance improvement |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `chore` | Maintenance, deps, configs |
| `ci` | CI/CD pipeline changes |
| `build` | Build system changes |
| `style` | Formatting, missing semicolons, etc |
| `revert` | Reverting a previous commit |

## Rules

- Subject max 72 chars
- Use imperative mood
- No generic messages like:
  - `update code`
  - `fixes`
  - `changes`
  - `improvements`

## Staging

- **Only commit files that are explicitly staged** (`git add`)
- Never run `git add .` or `git add -A` automatically
- Never stage untracked or modified files without explicit instruction
- If no files are staged, stop and ask what should be committed

## Commit Body

Include:

- what changed
- why
- possible side effects

## Breaking Changes

Append `!` after type or add `BREAKING CHANGE:` in the footer.

```
feat!: remove legacy token endpoint

BREAKING CHANGE: clients using /auth/v1/token must migrate to /auth/v2/token
```
