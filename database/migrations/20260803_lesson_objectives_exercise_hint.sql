-- Long-form course content.
--
-- Lessons are now created as curriculum stubs during onboarding (empty body)
-- and the full 900-1400 word body is generated on first open, so we need a
-- place for the planned learning objectives that guide that generation.
--
-- Exercises gain a hint, shown before the learner confirms their answer.

BEGIN;

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS objectives jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS hint text;

COMMIT;
