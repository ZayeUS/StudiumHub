CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the roles table
CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the users table with UUID for user_id
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Use UUID for user_id
  email VARCHAR(255) UNIQUE NOT NULL,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,            -- Firebase unique identifier
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL,
  CONSTRAINT email_unique UNIQUE (email)
);

-- Insert an 'admin' role into the roles table
INSERT INTO roles (role_name) 
VALUES ('admin');

-- Insert a 'user' role into the roles table
INSERT INTO roles (role_name) 
VALUES ('user');

-- Create the profile table
CREATE TABLE profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,  -- Foreign key to the users table
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,  -- New field for storing the user's date of birth
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add a unique constraint to ensure a user has only one profile
ALTER TABLE profiles ADD CONSTRAINT unique_user_profile UNIQUE (user_id);
