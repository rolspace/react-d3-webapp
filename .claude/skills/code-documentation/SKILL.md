---
name: code-documentation
description: Updates or creates project documentation in the correct location. Use when documenting features, architecture, setup instructions, or API changes. Writes clear, concise documentation without verbosity.
allowed-tools: Read, Glob, Grep, Edit, Write
---

# Code Documentation

Updates project documentation with clear, focused content.

## Documentation Locations

### This Repository Structure

- `CLAUDE.md` - Instructions for Claude Code (project structure, commands, architecture)
- `README.md` (root) - Project overview, quick start
- `src/README.md` - BFF application documentation (architecture, setup, API endpoints)
- `src/backend/` - Backend code (Express, TypeScript)
- `src/frontend/` - Frontend code (React, TypeScript)
- Code comments - Only when logic isn't self-evident

### Location Decision Tree

1. **Claude Code instructions** → `CLAUDE.md`
2. **Workspace-level commands and architecture** → `CLAUDE.md`
3. **BFF application setup, API endpoints, development** → `src/README.md`
4. **Backend/frontend-specific architecture** → `src/README.md` (relevant section)
5. **Function/class behavior** → Code comments (sparingly)

## Writing Guidelines

### Be Concise

**Bad**: "This function is responsible for the task of processing user input data by validating it and then transforming it into the appropriate format."

**Good**: "Validates and transforms user input."

### Use Direct Language

- Start with verbs for actions
- Avoid "should", "would", "could"
- Skip unnecessary context

### Structure

For feature documentation:
```markdown
## Feature Name

Brief description (1 sentence).

### Usage

Code example or command

### Parameters/Options

- `param` - Description
```

For architectural updates to CLAUDE.md:
```markdown
## Section Name

Key points only:
- Fact 1
- Fact 2
```

## Instructions

1. **Identify the change**: What was added, modified, or needs documentation?

2. **Choose location**: Use the decision tree above

3. **Read existing docs**: Check current content to maintain consistency

4. **Update concisely**:
   - Add new sections or update existing ones
   - Remove outdated information
   - Keep formatting consistent
   - One sentence when one sentence suffices

5. **Verify accuracy**: Ensure technical details match implementation

## Examples

### Adding New API Endpoint

Location: `src/README.md` (update API Endpoints section)

```markdown
### GET /api/users
Get all users.

**Response:**
\`\`\`json
[
  { "id": 1, "name": "User 1" }
]
\`\`\`
```

### Documenting New Environment Variable

Location: `src/README.md` (update Setup section) or `CLAUDE.md` (if workspace-level)

```markdown
- `RATE_LIMIT` - Max requests per minute (default: 60)
```

### Adding Development Command

Location: `CLAUDE.md` (update Development Commands section)

```markdown
### API (`src/backend/`):
- `yarn validate` - Run linting and type checking
```

## What NOT to Document

- Obvious code behavior
- Implementation details better suited for code comments
- Temporary fixes or TODOs
- Information that duplicates existing docs
