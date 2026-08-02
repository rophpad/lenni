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
CREATE TYPE ai_run_status AS ENUM ('pending', 'running', 'succeeded', 'failed', 'canceled');
CREATE TYPE ai_operation AS ENUM ('profile_extraction', 'skill_inference', 'goal_benchmark', 'roadmap_generation', 'roadmap_replan', 'lesson_generation', 'exercise_grading', 'daily_planning', 'coach_summary', 'job_evaluation');
CREATE TYPE exercise_type AS ENUM ('multiple_choice', 'free_text', 'code', 'project');
CREATE TYPE grading_status AS ENUM ('pending', 'graded', 'needs_review', 'failed');
CREATE TYPE roadmap_change_status AS ENUM ('pending', 'applied', 'rejected', 'canceled');

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
  timezone text NOT NULL DEFAULT 'UTC',
  preferred_daily_minutes integer NOT NULL DEFAULT 45 CHECK (preferred_daily_minutes > 0),
  study_days smallint[] NOT NULL DEFAULT ARRAY[1,2,3,4,5]::smallint[],
  reminder_time time,
  email_reminders boolean NOT NULL DEFAULT true,
  push_reminders boolean NOT NULL DEFAULT false,
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  operation ai_operation NOT NULL,
  status ai_run_status NOT NULL DEFAULT 'pending',
  provider text,
  model text,
  prompt_version text,
  input_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric(4,3) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  input_tokens integer CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens integer CHECK (output_tokens IS NULL OR output_tokens >= 0),
  cost_micros bigint CHECK (cost_micros IS NULL OR cost_micros >= 0),
  error_message text,
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_runs_user_created_idx ON ai_runs(user_id, created_at DESC);
CREATE INDEX ai_runs_status_idx ON ai_runs(status) WHERE status IN ('pending', 'running');

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

CREATE TABLE profile_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id uuid REFERENCES profile_sources(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  job_title text NOT NULL,
  start_date date,
  end_date date,
  description text,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
CREATE INDEX profile_experiences_user_idx ON profile_experiences(user_id, position);

CREATE TABLE profile_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id uuid REFERENCES profile_sources(id) ON DELETE SET NULL,
  institution text NOT NULL,
  qualification text,
  field_of_study text,
  start_date date,
  end_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE profile_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id uuid REFERENCES profile_sources(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  url text,
  started_at date,
  completed_at date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE profile_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id uuid REFERENCES profile_sources(id) ON DELETE SET NULL,
  name text NOT NULL,
  issuer text,
  issued_on date,
  expires_on date,
  credential_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE profile_repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id uuid REFERENCES profile_sources(id) ON DELETE SET NULL,
  external_id text,
  name text NOT NULL,
  url text NOT NULL,
  description text,
  primary_language text,
  stars integer CHECK (stars IS NULL OR stars >= 0),
  analyzed_at timestamptz,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, url)
);

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

CREATE TABLE career_goal_skills (
  career_goal_id uuid NOT NULL REFERENCES career_goals(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  requirement skill_requirement NOT NULL DEFAULT 'required',
  target_level proficiency_level NOT NULL,
  weight numeric(5,2) NOT NULL DEFAULT 1 CHECK (weight > 0),
  rationale text,
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
  PRIMARY KEY (career_goal_id, skill_id)
);

CREATE TABLE user_skills (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level proficiency_level NOT NULL DEFAULT 'novice',
  score numeric(5,2) NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  display_score numeric(3,1) GENERATED ALWAYS AS (round(score / 20, 1)) STORED,
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
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
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
  previous_roadmap_id uuid REFERENCES roadmaps(id) ON DELETE SET NULL,
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
  title text NOT NULL,
  status roadmap_status NOT NULL DEFAULT 'draft',
  progress_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  estimated_completion_date date,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  generation_status ai_run_status NOT NULL DEFAULT 'pending',
  generation_reason text,
  generation_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX roadmaps_one_active_per_goal ON roadmaps(career_goal_id) WHERE status = 'active';
CREATE UNIQUE INDEX roadmaps_goal_version_idx ON roadmaps(career_goal_id, version);
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
  type exercise_type NOT NULL DEFAULT 'multiple_choice',
  prompt text NOT NULL,
  explanation text,
  rubric jsonb NOT NULL DEFAULT '{}'::jsonb,
  max_score numeric(7,2) NOT NULL DEFAULT 1 CHECK (max_score > 0),
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
  UNIQUE (exercise_id, position),
  UNIQUE (id, exercise_id)
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
  selected_option_id uuid,
  is_correct boolean,
  score numeric(7,2) CHECK (score IS NULL OR score >= 0),
  response jsonb NOT NULL DEFAULT '{}'::jsonb,
  feedback text,
  grading_status grading_status NOT NULL DEFAULT 'pending',
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
  graded_at timestamptz,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE exercise_attempts ADD CONSTRAINT exercise_attempts_option_belongs_to_exercise_fk
  FOREIGN KEY (selected_option_id, exercise_id) REFERENCES exercise_options(id, exercise_id) ON DELETE SET NULL (selected_option_id);
CREATE INDEX exercise_attempts_user_exercise_idx ON exercise_attempts(user_id, exercise_id, attempted_at DESC);

CREATE TABLE learning_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id uuid REFERENCES roadmaps(id) ON DELETE SET NULL,
  title text NOT NULL,
  brief text NOT NULL,
  rubric jsonb NOT NULL DEFAULT '{}'::jsonb,
  submission jsonb NOT NULL DEFAULT '{}'::jsonb,
  status content_status NOT NULL DEFAULT 'available',
  score numeric(7,2) CHECK (score IS NULL OR score >= 0),
  feedback text,
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Daily coaching and engagement
CREATE TABLE daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  estimated_minutes integer NOT NULL DEFAULT 45 CHECK (estimated_minutes > 0),
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
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
  exercise_id uuid REFERENCES exercises(id) ON DELETE SET NULL,
  project_id uuid REFERENCES learning_projects(id) ON DELETE SET NULL,
  job_evaluation_id uuid,
  estimated_minutes integer NOT NULL CHECK (estimated_minutes > 0),
  position integer NOT NULL CHECK (position >= 0),
  completed_at timestamptz,
  UNIQUE (daily_plan_id, position),
  CHECK (num_nonnulls(lesson_id, exercise_id, project_id, job_evaluation_id) <= 1)
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
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
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
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
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
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
  matched_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  added_to_roadmap_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX job_evaluations_user_created_idx ON job_evaluations(user_id, created_at DESC);

ALTER TABLE daily_tasks ADD CONSTRAINT daily_tasks_job_evaluation_fk
  FOREIGN KEY (job_evaluation_id) REFERENCES job_evaluations(id) ON DELETE SET NULL;

CREATE TABLE roadmap_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id uuid NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_postings(id) ON DELETE SET NULL,
  job_evaluation_id uuid REFERENCES job_evaluations(id) ON DELETE SET NULL,
  status roadmap_change_status NOT NULL DEFAULT 'pending',
  reason text NOT NULL,
  ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
  applied_roadmap_id uuid REFERENCES roadmaps(id) ON DELETE SET NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  CHECK (num_nonnulls(job_id, job_evaluation_id) <= 1)
);
CREATE INDEX roadmap_change_requests_roadmap_idx ON roadmap_change_requests(roadmap_id, requested_at DESC);

CREATE TABLE roadmap_change_request_skills (
  request_id uuid NOT NULL REFERENCES roadmap_change_requests(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  target_level proficiency_level,
  rationale text,
  PRIMARY KEY (request_id, skill_id)
);

CREATE TABLE roadmap_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES roadmap_change_requests(id) ON DELETE SET NULL,
  from_roadmap_id uuid REFERENCES roadmaps(id) ON DELETE SET NULL,
  to_roadmap_id uuid NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  change_type text NOT NULL CHECK (change_type IN ('added', 'removed', 'reordered', 'updated')),
  entity_type text NOT NULL CHECK (entity_type IN ('milestone', 'module', 'lesson', 'project')),
  entity_id uuid,
  previous_position integer CHECK (previous_position IS NULL OR previous_position >= 0),
  new_position integer CHECK (new_position IS NULL OR new_position >= 0),
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX roadmap_changes_to_roadmap_idx ON roadmap_changes(to_roadmap_id, created_at);

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
    'milestones','modules','lessons','lesson_progress','learning_projects','job_postings','streaks',
    'organizations','subscriptions'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', table_name, table_name);
  END LOOP;
END;
$$;

COMMIT;
