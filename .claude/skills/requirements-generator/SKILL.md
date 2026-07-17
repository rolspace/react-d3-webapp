---
name: requirements-generator
description: Generates a formal requirements document from a user story using the project's requirements template. Use this skill whenever the user asks to generate a requirements document, create requirements from a user story, write up requirements, or turn a user story into a requirements doc. Trigger even if the user just pastes a user story and asks to "document this" or "make requirements for this".
allowed-tools: Read, Glob, Write, Bash, PowerShell
---

## Steps

### 1. Read the template

Read `docs/templates/requirements-template.md`.

### 2. Determine the next document number

Glob `docs/requirements/*.md`. Files follow `NNN-description.md`. Find the highest existing number, increment by 1, and zero-pad to 3 digits. Start at `001` if none exist.

### 3. Derive the filename slug

Create a short, lowercase, hyphen-separated description (3–6 words) that captures the essence of the user story.

Examples:
- Reconnection retry → `hub-reconnection-retry`
- User login → `user-login-authentication`
- Score display → `live-score-display`

### 4. Fill in the template

Populate the template from the user story. The output must be specific enough that a developer can implement without asking clarifying questions.

**Introduction**: 2–4 sentences covering the current gap, what the feature does, and the value it delivers.

**Requirements**: Decompose the user story into individual, implementable requirements (typically 2–5, covering the happy path, edge cases, and error states). Each requirement needs:
- A user story in `As a [role], I want [feature], so that [benefit]` format
- Acceptance criteria as WHEN/IF/THEN statements using the SHALL pattern

**Non-Functional Requirements**: Fill in sections relevant to what the feature touches. Write "N/A" for sections that don't apply. Be specific — name concrete thresholds rather than generic statements.

For testing sections: unit tests (isolated logic), integration tests (component interactions), E2E tests (user-visible flows).

### 5. Write the file

Ensure `docs/requirements/` exists — use `mkdir -p docs/requirements` (Bash on Linux/Mac) or `New-Item -ItemType Directory -Force docs/requirements` (PowerShell on Windows) — then write the completed document to `docs/requirements/NNN-slug.md`.

Confirm to the user: file path, document number, and a one-sentence summary.
