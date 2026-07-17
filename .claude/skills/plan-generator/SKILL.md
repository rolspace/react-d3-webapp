---
name: plan-generator
description: Generates an implementation plan from a requirements document using the project's plan template. Use this skill whenever the user asks to create an implementation plan, generate a plan from requirements, plan out a feature, or turn a requirements document into a dev plan. Trigger even if the user just names a requirements file and says "plan this" or "create a plan for this".
allowed-tools: Read, Glob, Grep, Write, Bash, PowerShell
context: fork
agent: Plan
---

## Steps

### 1. Locate the requirements document

The user must provide a requirements document path or number (e.g., `docs/requirements/002-api-integration-tests.md` or just `002`). If none was provided, stop and tell the user to re-invoke the skill with a requirements document. Otherwise, resolve the argument to the exact file.

Output path mirrors the input: `docs/requirements/NNN-slug.md` → `docs/plans/NNN-slug.md`.

### 2. Read inputs in parallel

- `docs/templates/plan-template.md`
- The resolved requirements document
- `ARCHITECTURE.md`

### 3. Explore the codebase

Read enough source and test files to produce accurate file paths and code references. Use Glob and Grep to find files, interfaces, base classes, and patterns relevant to what the requirements touch. Limit exploration to those areas.

### 4. Identify implementation options

Assess whether there are genuinely distinct approaches. If multiple viable options exist, evaluate each on correctness, simplicity, architectural fit, and trade-offs, then commit to one without deferring to the user.

If options exist, include an **Options Considered** section in the plan immediately after Context:

```markdown
## Options Considered

### Option A: [Name]
[Description]
**Pros**: ...
**Cons**: ...

### Option B: [Name]
...

**Chosen**: Option [X] — [rationale]
```

If only one sensible approach exists, omit this section.

### 5. Write the plan

Fill in the plan template. Each section must be specific enough that a developer can implement without reading the requirements document.

**Title**: `# Plan: [Feature Name]` — match the requirements document title.

**Context**: 3–5 sentences on the current state and what this plan achieves. Reference `docs/requirements/NNN-slug.md`.

**Files to Create / Modify / Delete**: Use real paths from exploration. Drop any table with nothing to say. For each file, explain what changes and why — not just which file.

**Implementation**: One numbered subsection per unit of work. Include before/after code snippets when the change is non-obvious (interface changes, new registrations, config, subtle behavioral differences). C# must compile against the project's actual types.

**Key Technical Decisions**: Non-obvious choices with rationale. Omit if there are none.

**Tests to Add**: Concrete method names in `MethodName_Condition_ExpectedOutcome` format. For each, describe setup and assertion. Match naming and project conventions in existing test files.

**Verification**: Always include the standard build and test commands. Add manual steps only if tests cannot cover the behavior.

### 6. Architecture alignment check

Verify the plan does not violate `ARCHITECTURE.md`. If the requirements force an architecture change, surface the conflict before writing — describe what would need to change and why, and ask the user how to proceed.

### 7. Save the plan

Ensure `docs/plans/` exists — use `mkdir -p docs/plans` (Bash on Linux/Mac) or `New-Item -ItemType Directory -Force docs/plans` (PowerShell on Windows) — then write to `docs/plans/NNN-slug.md`. Confirm the output path and a one-sentence summary to the user.
