# Requirements Document

## Introduction

The repository's npm dependencies (managed with Yarn, `package.json` and `yarn.lock`) have fallen behind their latest releases, and some may carry known security vulnerabilities. This feature updates them in three ordered stages: vulnerability fixes first, then minor/patch updates, then major updates. Staging limits the blast radius of each change, makes regressions easy to bisect, and delivers security value as early as possible.

## Requirements

### Requirement 1

**User Story:** As a maintainer, I want dependencies with known vulnerabilities updated first, so that the application is not exposed to published security issues.

#### Acceptance Criteria

1. WHEN `yarn audit` is run before the change THEN the maintainer SHALL record the list of advisories (package, severity, fixed version) in the commit message or PR description.
2. WHEN a vulnerable package has a fixed version within its current semver range THEN the system SHALL update it to the fixed version in `yarn.lock` and `package.json`.
3. IF the fixed version requires a major bump or a `resolutions` override THEN the maintainer SHALL defer it to Requirement 3 or document the override and its reason.
4. WHEN stage 1 is complete THEN `yarn audit` SHALL report no high or critical advisories, except documented ones with no available fix.
5. WHEN stage 1 is complete THEN it SHALL be committed separately from stages 2 and 3.

### Requirement 2

**User Story:** As a maintainer, I want minor and patch updates applied next, so that the project gets backwards-compatible fixes and features at low risk.

#### Acceptance Criteria

1. WHEN stage 2 starts THEN the maintainer SHALL list outdated packages via `yarn outdated` and select only those whose latest version has the same major version as the installed one.
2. WHEN minor and patch updates are applied THEN the `package.json` semver ranges and `yarn.lock` SHALL both be updated and committed together.
3. IF an update causes a build, lint, or test failure THEN the maintainer SHALL revert that package, record it as deferred, and continue with the rest.
4. WHEN stage 2 is complete THEN it SHALL be committed separately from stages 1 and 3.

### Requirement 3

**User Story:** As a maintainer, I want major version updates applied last and one at a time, so that breaking changes can be isolated and fixed individually.

#### Acceptance Criteria

1. WHEN stage 3 starts THEN the maintainer SHALL review the changelog or migration guide of each package with a new major version before upgrading it.
2. WHEN a major update is applied THEN the system SHALL make any required code and configuration changes (for example webpack, ESLint, Vitest, MUI, React, D3 or Express config and usage) in the same commit as the bump.
3. IF a major update is incompatible with other dependencies (peer dependency conflict) THEN the maintainer SHALL defer it and document the blocker.
4. WHEN each major update is committed THEN the commit SHALL contain only that package and its related changes, using Conventional Commits (`build(deps): ...`) per `commitlint.config.js`.
5. WHEN stage 3 is complete THEN the maintainer SHALL list any deferred packages and the reason in the PR description.

### Requirement 4

**User Story:** As a developer, I want every stage verified against the full toolchain, so that updates never leave the application broken.

#### Acceptance Criteria

1. WHEN a stage is complete THEN `yarn install --frozen-lockfile`, `yarn lint`, `yarn test`, and `yarn build` SHALL all succeed.
2. WHEN a stage is complete THEN the development server (`yarn dev`) SHALL start, serve the frontend, and respond to `/api` routes over HTTPS on port 3000.
3. IF verification fails at a stage THEN the stage SHALL NOT be committed until fixed or the offending package deferred.

## Non-Functional Requirements

### Code Architecture and Modularity
- Changes SHALL be limited to dependency manifests, lockfile, and code or config strictly required by an update; no unrelated refactoring.
- Each stage SHALL be an independent commit that can be reverted without affecting the others.

### Performance
- The production build time and bundle size SHALL not regress by more than 10% versus the baseline measured before stage 1, unless justified in the PR.

### Security
- No new high or critical advisories SHALL be introduced by any stage.
- Dependencies SHALL be installed only from the public npm registry via `yarn.lock` with integrity hashes preserved.

### Reliability
- The existing GitHub OAuth flow and `/api/repo/:owner/:repo` endpoint SHALL behave identically after each stage.
- Runtime engine requirements (Node version) SHALL remain compatible with the dev container and CI; any change SHALL be documented.

### Usability
- The UI, including D3 bar charts and MUI components, SHALL render with no visual regression or new console errors after each stage.
- Deferred updates and breaking-change notes SHALL be listed in the PR description.

### Unit Testing
- The existing Vitest backend and frontend suites SHALL pass unchanged after stages 1 and 2; test changes in stage 3 SHALL be limited to API changes of the upgraded package.
- Coverage SHALL not drop below the baseline measured before stage 1.

### Integration Testing
- The MSW-based backend tests for the OAuth and repo routes SHALL pass after each stage.

### E2E Testing
- After each stage, a manual smoke test SHALL cover: start `yarn dev`, log in via GitHub OAuth, load a repository, and confirm the charts render.
