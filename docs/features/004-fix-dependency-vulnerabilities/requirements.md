# Requirements Document

## Introduction

`yarn npm audit --recursive` currently reports advisories in the workspace's dependency tree, including critical ones in `tinypool` (prototype pollution leading to RCE, via `vitest@3.2.7`) and `tar` (multiple path traversal and DoS issues, fixed in newer 7.x releases), a high one in `ip` (SSRF), a low one in `@tootallnate/once`, and moderate ones in `vitest`/`@vitest/mocker` (fixed in 4.1.12 and later). Other entries are deprecation notices (`@mui/styles`, `glob`, `rimraf`, `inflight`, `npmlog`, `gauge`, `are-we-there-yet`, `@npmcli/move-file`, `eslint`) rather than exploitable flaws. This feature remediates the exploitable advisories by upgrading direct dependencies or pinning transitive ones in `yarn.lock`, so the project is no longer exposed to published security issues. It is the stage-1 work described in `docs/features/003-staged-dependency-updates`.

## Requirements

### Requirement 1

**User Story:** As a maintainer, I want the baseline set of advisories recorded, so that I can verify each one is resolved or consciously deferred.

#### Acceptance Criteria

1. WHEN work starts THEN the maintainer SHALL run `yarn npm audit --recursive` and record each advisory (package, severity, vulnerable range, dependent chain) in the PR description.
2. WHEN an advisory is a deprecation notice with no fixed version (for example `glob`, `rimraf`, `inflight`, `npmlog`, `gauge`, `are-we-there-yet`, `@npmcli/move-file`) THEN the maintainer SHALL classify it as non-exploitable and list it as deferred, unless a parent upgrade removes it.
3. IF an advisory has no available fix THEN the maintainer SHALL document it with its reason and the revisit condition.

### Requirement 2

**User Story:** As a maintainer, I want vulnerable direct dependencies upgraded, so that the fix is visible in `package.json` and does not rely on overrides.

#### Acceptance Criteria

1. WHEN `vitest` is upgraded to a version satisfying `>=4.1.12` THEN `tinypool` SHALL resolve to `>=2.1.2` and `@vitest/mocker` SHALL resolve to a fixed version in `yarn.lock`.
2. WHEN `vitest` is bumped across a major version THEN companion packages (`@vitest/coverage-*`, `@vitest/ui`, and similar) SHALL be bumped to the same version, and `vitest.config.ts`, `src/vitest.config.backend.ts` and `src/vitest.config.frontend.ts` SHALL be adjusted for any breaking changes.
3. WHEN a fixed version of a vulnerable direct dependency exists in its current semver range THEN `package.json` and `yarn.lock` SHALL be updated together.

### Requirement 3

**User Story:** As a maintainer, I want vulnerable transitive dependencies resolved, so that issues in `tar`, `ip` and `@tootallnate/once` are eliminated even when parents have not released updates.

#### Acceptance Criteria

1. WHEN a parent package can be upgraded to pull in a fixed version THEN the maintainer SHALL upgrade the parent in preference to adding an override.
2. IF no parent upgrade is available THEN the maintainer SHALL add a `resolutions` entry in `package.json` pinning `tar` to a version above the highest affected range (`>7.5.20`), and likewise for `ip` and `@tootallnate/once` where a fixed version exists.
3. WHEN a `resolutions` entry is added THEN the PR description SHALL state the reason and the condition for its removal.
4. IF a fixed version of `ip` does not exist THEN the maintainer SHALL document it as an accepted risk, noting whether the package is reachable at runtime or only through dev and build tooling.

### Requirement 4

**User Story:** As a maintainer, I want the fixes verified, so that remediation does not break the application.

#### Acceptance Criteria

1. WHEN all upgrades are applied THEN `yarn npm audit --recursive` SHALL report no critical or high advisories, except documented ones with no available fix.
2. WHEN all upgrades are applied THEN `yarn install` SHALL complete with an immutable lockfile check passing in CI (`yarn install --immutable`).
3. WHEN all upgrades are applied THEN lint, type-check, backend and frontend unit tests, production build and e2e tests SHALL pass.
4. IF an upgrade causes a failure that cannot be fixed in scope THEN the maintainer SHALL revert that package, record it as deferred, and continue.
5. WHEN the work is complete THEN it SHALL be committed separately from minor, patch and major update work.

## Non-Functional Requirements

### Code Architecture and Modularity
- Changes are limited to `package.json`, `yarn.lock`, and test or config files that must change for upgraded tooling; no application source refactors.
- Prefer direct upgrades over `resolutions`; every `resolutions` entry is documented.

### Performance
- Unit test suite runtime and production build time SHALL not regress by more than 20% compared to baseline.

### Security
- Zero critical and zero high advisories in `yarn npm audit --recursive` after the change, except documented unfixable ones.
- Moderate and low exploitable advisories (`vitest`, `@vitest/mocker`, `tar`, `@tootallnate/once`) SHALL be resolved.
- No new dependencies SHALL be added solely to work around an advisory.

### Reliability
- The lockfile SHALL be reproducible: `yarn install --immutable` succeeds on a clean checkout.
- Node engine support (`>=18.12.0` in `package.json`) SHALL be checked against upgraded packages; if a package requires a newer Node, the `engines` field and CI Node version SHALL be updated deliberately and noted.

### Usability
- N/A

### Unit Testing
- All existing backend (`src/vitest.config.backend.ts`) and frontend (`src/vitest.config.frontend.ts`) unit tests SHALL pass without weakening assertions.
- Coverage thresholds, if configured, SHALL still be met.

### Integration Testing
- The Express server SHALL start in development and production modes, serving the frontend bundle and `/api/repo/:owner/:repo` with MSW-mocked GitHub responses in tests.

### E2E Testing
- The Playwright suite in `e2e/` SHALL pass against the production build: login redirect, repository search, and D3 chart rendering.
