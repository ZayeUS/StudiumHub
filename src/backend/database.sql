-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ROLES Table
CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- USERS Table (UUID, with soft delete)
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  firebase_uid VARCHAR(255) NOT NULL UNIQUE,
  role_id INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ DEFAULT NULL, -- ✅ Keep deleted_at here
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- PROFILES Table (UUID, NO deleted_at)
CREATE TABLE profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  avatar_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Default seed data for roles
INSERT INTO roles (role_name) VALUES ('admin');
INSERT INTO roles (role_name) VALUES ('user');

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- AUDIT LOGS Table
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID, -- NULL allowed for system
  target_user_id UUID,
  action TEXT NOT NULL,
  table_name VARCHAR(255),
  record_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_actor FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_target FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Audit log indexes
CREATE INDEX idx_audit_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_target_user_id ON audit_logs(target_user_id);
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
