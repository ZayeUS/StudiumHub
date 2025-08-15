-- Enable UUID and Vector extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- New: Required for storing embeddings

-- 1. PLANS TABLE
CREATE TABLE plans (
  plan_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  stripe_price_id VARCHAR(255) UNIQUE,
  price_monthly NUMERIC(10, 2),
  max_projects INT,
  allow_custom_branding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed default plan
INSERT INTO plans (name, stripe_price_id, price_monthly, max_projects, allow_custom_branding)
VALUES ('Free', NULL, 0.00, 1, FALSE);

-- 2. USERS TABLE
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  firebase_uid VARCHAR(255) NOT NULL UNIQUE,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 3. ORGANIZATIONS TABLE
CREATE TABLE organizations (
  organization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_user_id UUID NOT NULL,
  plan_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
  CONSTRAINT fk_owner FOREIGN KEY (owner_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. ORGANIZATION MEMBERSHIP
CREATE TABLE organization_members (
  membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'admin' or 'member'
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_org_member FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_member FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_member UNIQUE (organization_id, user_id)
);

-- 5. INVITATIONS
CREATE TABLE invitations (
  invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invite_org FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
  CONSTRAINT unique_invite UNIQUE (organization_id, email)
);

-- 6. PROFILES
CREATE TABLE profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  avatar_url TEXT DEFAULT NULL,
  fully_onboarded BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- 7. PAYMENTS
CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  plan_id INT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_org FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_plan FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
  CONSTRAINT unique_subscription UNIQUE (stripe_subscription_id)
);

-- 8. AUDIT LOGS
CREATE TABLE audit_logs (
  log_id SERIAL PRIMARY KEY,
  actor_user_id UUID,
  target_user_id UUID,
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(255),
  record_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_actor_user FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_target_user FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 9. COURSE MATERIALS
CREATE TABLE course_materials (
    material_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    uploaded_by_user_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    s3_key TEXT NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'processing', -- processing, ready, error
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_material_org FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    CONSTRAINT fk_material_user FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 10. COURSES
CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    created_by_user_id UUID NOT NULL,
    source_material_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_org FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    CONSTRAINT fk_course_user FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_course_material FOREIGN KEY (source_material_id) REFERENCES course_materials(material_id) ON DELETE RESTRICT
);

-- 11. COURSE MODULES
CREATE TABLE course_modules (
    module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    module_order INT NOT NULL,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_module_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT unique_module_order UNIQUE (course_id, module_order)
);

-- 12. CHUNKS (NEW)
-- Stores the text chunks and vector embeddings from course materials.
-- OpenAI's 'text-embedding-3-large' model has 3072 dimensions.
CREATE TABLE chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL,
    content TEXT NOT NULL,
    page_number INT,
    embedding vector(3072) NOT NULL, -- Storing the vector embedding
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chunk_material FOREIGN KEY (material_id) REFERENCES course_materials(material_id) ON DELETE CASCADE
);

-- Create an index on the embedding column for faster similarity searches
CREATE INDEX ON chunks USING HNSW (embedding vector_l2_ops);

-- 1. Add columns to the existing course_modules table to link to flashcards and quizzes
ALTER TABLE course_modules
ADD COLUMN IF NOT EXISTS flashcard_deck_id UUID,
ADD COLUMN IF NOT EXISTS quiz_id UUID;

-- 2. Create the new table for flashcard decks
CREATE TABLE IF NOT EXISTS flashcard_decks (
    deck_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL UNIQUE, -- Each module has one deck
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_deck_module FOREIGN KEY (module_id) REFERENCES course_modules(module_id) ON DELETE CASCADE
);

-- 3. Create the new table for individual flashcards
CREATE TABLE IF NOT EXISTS flashcards (
    flashcard_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    CONSTRAINT fk_flashcard_deck FOREIGN KEY (deck_id) REFERENCES flashcard_decks(deck_id) ON DELETE CASCADE
);

-- 4. Create the new table for quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL UNIQUE, -- Each module has one quiz
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_module FOREIGN KEY (module_id) REFERENCES course_modules(module_id) ON DELETE CASCADE
);

-- 5. Create the new table for individual quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Stores ["Option A", "Option B", "Option C", "Option D"]
    correct_answer TEXT NOT NULL,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
);

-- 6. Add the foreign key constraints from course_modules to the new tables
-- These might fail if they already exist, which is okay.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_module_deck') THEN
        ALTER TABLE course_modules ADD CONSTRAINT fk_module_deck FOREIGN KEY (flashcard_deck_id) REFERENCES flashcard_decks(deck_id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_module_quiz') THEN
        ALTER TABLE course_modules ADD CONSTRAINT fk_module_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE SET NULL;
    END IF;
END;
$$;

ALTER TABLE course_modules
ALTER COLUMN ai_summary TYPE JSONB USING ai_summary::jsonb;