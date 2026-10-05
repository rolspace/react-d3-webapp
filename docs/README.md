# docs

Feature documentation: requirements and implementation plans.

## Structure

Each feature lives in its own numbered folder:

```
docs/features/NNN-slug/
├── requirements.md   — formal requirements and acceptance criteria
└── plan.md           — implementation plan referencing the requirements
```

## Numbering

Folders are numbered sequentially with zero-padded three-digit prefixes (`001`, `002`, …). The slug is a short, lowercase, hyphen-separated description of the feature (3–6 words).

## Workflow

1. Write a requirements document first (`requirements.md`), capturing user stories and acceptance criteria.
2. Generate an implementation plan (`plan.md`) that references the requirements and describes how to satisfy them.

Both documents can be generated using the `requirements-generator` and `plan-generator` skills.
