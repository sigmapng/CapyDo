-- Database Initialization --
DO $$ BEGIN IF NOT EXISTS (
  SELECT
  FROM pg_database
  WHERE datname = 'capydo'
) THEN CREATE DATABASE capydo;
END IF;
END $$;
CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL
);
CREATE TABLE Task (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(255) NOT NULL,
  importance VARCHAR(255) NOT NULL,
  due_to DATE,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT REFERENCES Users(id)
);
