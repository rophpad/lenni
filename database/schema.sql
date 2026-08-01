BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended', 'deleted');
CREATE TYPE source_type AS ENUM ('resume', 'linkedin', 'github');
CREATE TYPE source_status AS ENUM ('pending', 'processing', 'ready', 'failed');
CREATE TYPE roadmap_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE content_status AS ENUM ('locked', 'available', 'in_progress', 'completed');
CREATE TYPE proficiency_level AS ENUM ('novice', 'beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE skill_requirement AS ENUM ('required', 'preferred');
CREATE TYPE task_type AS ENUM ('review', 'lesson', 'exercise', 'project', 'job_action');
CREATE TYPE job_source AS ENUM ('manual', 'partner', 'imported');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'team');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'expired');

CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Authentication and identity
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  status account_status NOT NULL DEFAULT 'pending',
  email_verified_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  user_agent text,
  ip_address inet,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User profile and imported evidence. A ready resume is the onboarding requirement.
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline text,
  current_job_title text,
  years_experience numeric(4,1) CHECK (years_experience IS NULL OR years_experience >= 0),
  location text,
  bio text,
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profile_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type source_type NOT NULL,
  status source_status NOT NULL DEFAULT 'pending',
  file_name text,
  storage_key text,
  external_url text,
  checksum text,
  parsed_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (type <> 'resume' OR storage_key IS NOT NULL)
);
CREATE UNIQUE INDEX profile_sources_one_provider_per_user
  ON profile_sources(user_id, type) WHERE type IN ('linkedin', 'github');
CREATE INDEX profile_sources_user_status_idx ON profile_sources(user_id, status);

-- Role and skill knowledge graph
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  icon_key text,
  color_key text,
  is_custom boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE role_skills (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  requirement skill_requirement NOT NULL DEFAULT 'required',
  target_level proficiency_level NOT NULL,
  weight numeric(5,2) NOT NULL DEFAULT 1 CHECK (weight > 0),
  PRIMARY KEY (role_id, skill_id)
);

CREATE TABLE career_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  custom_title text,
  is_active boolean NOT NULL DEFAULT true,
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (role_id IS NOT NULL OR nullif(btrim(custom_title), '') IS NOT NULL)
);
CREATE UNIQUE INDEX career_goals_one_active_per_user ON career_goals(user_id) WHERE is_active;

CREATE TABLE user_skills (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level proficiency_level NOT NULL DEFAULT 'novice',
  score numeric(5,2) NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  confidence numeric(4,3) NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
  last_assessed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE skill_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  source_id uuid REFERENCES profile_sources(id) ON DELETE SET NULL,
  lesson_progress_id uuid,
  evidence_text text NOT NULL,
  score numeric(5,2) CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  confidence numeric(4,3) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX skill_evidence_user_skill_idx ON skill_evidence(user_id, skill_id);

-- Adaptive roadmap and learning content
CREATE TABLE roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_goal_id uuid NOT NULL REFERENCES career_goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  status roadmap_status NOT NULL DEFAULT 'draft',
  progress_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  estimated_completion_date date,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  generation_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX roadmaps_one_active_per_goal ON roadmaps(career_goal_id) WHERE status = 'active';
CREATE INDEX roadmaps_user_status_idx ON roadmaps(user_id, status);

CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position integer NOT NULL CHECK (position >= 0),
  status content_status NOT NULL DEFAULT 'locked',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (roadmap_id, position)
);

CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position integer NOT NULL CHECK (position >= 0),
  estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  status content_status NOT NULL DEFAULT 'locked',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (milestone_id, position)
);

CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  summary text,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  position integer NOT NULL CHECK (position >= 0),
  estimated_minutes integer NOT NULL DEFAULT 15 CHECK (estimated_minutes > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, position),
  UNIQUE (module_id, slug)
);

CREATE TABLE lesson_skills (
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  score_gain numeric(5,2) NOT NULL DEFAULT 1 CHECK (score_gain > 0),
  PRIMARY KEY (lesson_id, skill_id)
);

CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  explanation text,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, position)
);

CREATE TABLE exercise_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  position integer NOT NULL CHECK (position >= 0),
  UNIQUE (exercise_id, position)
);

CREATE TABLE lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status content_status NOT NULL DEFAULT 'available',
  progress_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  started_at timestamptz,
  completed_at timestamptz,
  time_spent_seconds integer NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE skill_evidence ADD CONSTRAINT skill_evidence_lesson_progress_fk
  FOREIGN KEY (lesson_progress_id) REFERENCES lesson_progress(id) ON DELETE SET NULL;

CREATE TABLE exercise_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES exercise_options(id) ON DELETE SET NULL,
  is_correct boolean NOT NULL,
  response jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exercise_attempts_user_exercise_idx ON exercise_attempts(user_id, exercise_id, attempted_at DESC);

-- Daily coaching and engagement
CREATE TABLE daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  estimated_minutes integer NOT NULL DEFAULT 45 CHECK (estimated_minutes > 0),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, plan_date)
);

CREATE TABLE daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id uuid NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  type task_type NOT NULL,
  title text NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  estimated_minutes integer NOT NULL CHECK (estimated_minutes > 0),
  position integer NOT NULL CHECK (position >= 0),
  completed_at timestamptz,
  UNIQUE (daily_plan_id, position)
);

CREATE TABLE learning_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX learning_activity_user_time_idx ON learning_activity(user_id, occurred_at DESC);

CREATE TABLE streaks (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_days integer NOT NULL DEFAULT 0 CHECK (current_days >= 0),
  longest_days integer NOT NULL DEFAULT 0 CHECK (longest_days >= 0),
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE coach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  trigger_type text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX coach_messages_user_created_idx ON coach_messages(user_id, created_at DESC);

-- Job catalog, matching, and pasted job-description evaluation
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  source job_source NOT NULL DEFAULT 'manual',
  external_id text,
  title text NOT NULL,
  description text NOT NULL,
  location text,
  remote boolean NOT NULL DEFAULT false,
  employment_type text,
  salary_min integer,
  salary_max integer,
  currency char(3),
  source_url text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);
CREATE INDEX job_postings_title_idx ON job_postings(title);
CREATE INDEX job_postings_active_idx ON job_postings(expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE job_skills (
  job_id uuid NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  requirement skill_requirement NOT NULL DEFAULT 'required',
  target_level proficiency_level,
  weight numeric(5,2) NOT NULL DEFAULT 1 CHECK (weight > 0),
  PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE job_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  score numeric(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  matched_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
CREATE INDEX job_matches_user_score_idx ON job_matches(user_id, score DESC);

CREATE TABLE job_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_description text NOT NULL,
  detected_title text,
  score numeric(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  matched_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  added_to_roadmap_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX job_evaluations_user_created_idx ON job_evaluations(user_id, created_at DESC);

-- Billing and team plan support
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organization_members (
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  provider_customer_id text,
  provider_subscription_id text UNIQUE,
  seats integer CHECK (seats IS NULL OR seats > 0),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((user_id IS NOT NULL)::integer + (organization_id IS NOT NULL)::integer = 1)
);
CREATE UNIQUE INDEX subscriptions_one_user_active ON subscriptions(user_id)
  WHERE user_id IS NOT NULL AND status IN ('trialing', 'active', 'past_due');
CREATE UNIQUE INDEX subscriptions_one_org_active ON subscriptions(organization_id)
  WHERE organization_id IS NOT NULL AND status IN ('trialing', 'active', 'past_due');

-- Keep mutable records timestamped consistently.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users','profiles','profile_sources','career_goals','user_skills','roadmaps',
    'milestones','modules','lessons','lesson_progress','job_postings','streaks',
    'organizations','subscriptions'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', table_name, table_name);
  END LOOP;
END;
$$;

COMMIT;
