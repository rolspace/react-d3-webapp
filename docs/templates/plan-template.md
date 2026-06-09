# Plan: [Title]

## Context

[Describe the problem being solved, what currently exists, and why this change is needed. Reference the relevant requirements document at `docs/requirements/NNN-*.md`.]

---

## Files to Create

| File | Purpose |
|---|---|
| `path/to/file` | [What this file is and why it's new] |

---

## Files to Modify

| File | Change |
|---|---|
| `path/to/file` | [What changes and why] |

---

## Files to Delete

| File | Reason |
|---|---|
| `path/to/file` | [Why it's being removed] |

---

## Implementation

### 1. [File or component name] — [what changes]

[Describe the change. Include before/after code blocks where the diff is non-obvious.]

```csharp
// code snippet
```

### 2. [Next change]

[...]

---

## Key Technical Decisions

- **[Decision]**: [Rationale — why this approach over the alternatives.]
- **[Decision]**: [...]

---

## Tests to Add

### Test 1: `MethodName_Condition_ExpectedOutcome`
- **Setup**: [What state or mocks are configured]
- **Assert**: [What is verified]

### Test 2: `MethodName_Condition_ExpectedOutcome`
- **Setup**: [...]
- **Assert**: [...]

---

## Verification

```bash
# 1. Build passes
dotnet build

# 2. Relevant test project(s) pass
dotnet test tests/[ProjectName]/

# 3. Full suite
dotnet test
```

[Add manual verification steps if the change has UI or runtime behavior that tests cannot cover.]
