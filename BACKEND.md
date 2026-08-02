# Lenni backend

Lenni uses PostgreSQL on Neon, Prisma 6, Better Auth, and Imole's OpenAI-compatible API. AI Engineer is the only enabled career. All shared system and role prompts live in `lib/prompts.ts`.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in the Neon, Better Auth, and Imole values.
2. Apply the SQL schema to an empty Neon database:

   ```bash
   npm run db:setup
   ```

3. Generate Prisma Client and start Next.js:

   ```bash
   npm run db:generate
   npm run dev
   ```

`database/schema.sql` is the source-of-truth initial migration. Prisma maps the tables used by the application; keep SQL migrations for database-only constraints, generated columns, and extensions.

## Implemented flows

- Better Auth email/password registration, login, logout, and protected app layout
- PDF (`pdf2json`) and DOCX (`mammoth`) résumé extraction
- Imole profile analysis and AI Engineer benchmark comparison
- Persistent personalized roadmap, milestones, modules, lessons, exercises, daily plan, skill scores, and coach message
- Exercise attempts and daily-task completion
- AI job-description evaluation against the current skill profile
- AI call audit records with prompt/model/version, usage, output, and error state

Resume text is currently retained in Neon in `profile_sources.parsed_data`. Before production, add a retention policy and explicit consent. If original files must be retained, replace the logical `database://` storage key with private object storage.

## Imole

The server calls `POST {IMOLE_BASE_URL}/responses` with `Authorization: Bearer {IMOLE_API_KEY}`. The key is never exposed to browser code. Change `IMOLE_MODEL` to another Imole text model without changing application code.
