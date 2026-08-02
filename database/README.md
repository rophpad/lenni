# Lenni database

PostgreSQL is the source of truth. Apply [`schema.sql`](./schema.sql) to an empty database before wiring an ORM or query layer.

The application uses Prisma for queries and Better Auth for identity. Better Auth stores credentials in `accounts` and sessions in `sessions`; `auth_sessions` remains a legacy-compatible table and is not used by the current application.

## Domain map

```text
users
├── auth_sessions / password_reset_tokens
├── profiles ── profile_sources ── experience / education / projects / certifications / repositories
├── career_goals ── career_goal_skills ── skills
│                └── roles ── role_skills
│   └── roadmaps ── milestones ── modules ── lessons
│       ├── exercises ── exercise_options ── exercise_attempts
│       ├── learning_projects / lesson_progress / daily_tasks
│       └── roadmap_change_requests / roadmap_changes
├── user_skills ── skill_evidence
├── daily_plans / learning_activity / streaks / coach_messages
├── job_matches ── job_postings ── companies
├── job_evaluations
├── ai_runs
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
- `career_goal_skills` snapshots the benchmark used for every goal, so custom and predefined goals use the same gap-analysis path.
- Roadmaps are immutable-style versioned snapshots with lineage. Change requests and change records explain how profile or job gaps caused a replan.
- `ai_runs` records model, prompt version, status, cost, confidence, and errors for every AI-assisted workflow. Domain records link back to the run that produced them.
- AI payloads and flexible evidence use JSONB, while core relations, progress, billing, and state transitions remain strongly typed and deterministic.
- The canonical skill mastery score is 0–100; `display_score` derives the 0–5 value shown by the current progress UI.
- Daily planning uses profile timezone, study-day, duration, and reminder preferences. Timezone identifiers must be validated by the application.
- Exercises support multiple choice, free text, code, and projects, with auditable AI grading and user project submissions.
- Job matches are recomputable snapshots. Pasted descriptions are retained separately in `job_evaluations`.
- Adding a job gap creates a `roadmap_change_request`; applying it produces a new roadmap version and granular `roadmap_changes`.
- Soft deletion is used only for users; dependent private data still supports explicit cascading deletion.

## Applying locally

```bash
createdb lenni
psql lenni -v ON_ERROR_STOP=1 -f database/schema.sql
```

For production, run the same DDL through the migration tool chosen with the persistence layer. Store database credentials in server-only environment variables and enable row-level security if clients will ever access PostgreSQL directly.
