# Lenni database

PostgreSQL is the source of truth. Apply [`schema.sql`](./schema.sql) to an empty database before wiring an ORM or query layer.

## Domain map

```text
users
├── auth_sessions / password_reset_tokens
├── profiles ── profile_sources (resume required; LinkedIn/GitHub optional)
├── career_goals ── roles ── role_skills ── skills
│   └── roadmaps ── milestones ── modules ── lessons
│       ├── exercises ── exercise_options ── exercise_attempts
│       └── lesson_progress / daily_tasks
├── user_skills ── skill_evidence
├── daily_plans / learning_activity / streaks / coach_messages
├── job_matches ── job_postings ── companies
├── job_evaluations
└── subscriptions

organizations ── organization_members ── users
              └── subscriptions
```

## Key decisions

- UUID primary keys prevent exposing sequential IDs and work across distributed workers.
- Email uses `citext` for case-insensitive uniqueness.
- Auth stores only password and session/reset-token hashes.
- `profile_sources` stores file/object keys, not résumé bytes. A ready `resume` source is the application-level onboarding requirement; LinkedIn and GitHub remain optional.
- Skills are normalized into a shared catalog. `skill_evidence` records why Lenni believes a user has a skill, while `user_skills` stores the current aggregate.
- Roadmaps are versioned snapshots tied to one career goal. Ordered milestones, modules, and lessons use unique positional constraints.
- Flexible AI output is limited to JSONB context/evidence fields; core relations and state remain strongly typed.
- Job matches are recomputable snapshots. Pasted descriptions are retained separately in `job_evaluations`.
- Soft deletion is used only for users; dependent private data still supports explicit cascading deletion.

## Applying locally

```bash
createdb lenni
psql lenni -v ON_ERROR_STOP=1 -f database/schema.sql
```

For production, run the same DDL through the migration tool chosen with the persistence layer. Store database credentials in server-only environment variables and enable row-level security if clients will ever access PostgreSQL directly.
