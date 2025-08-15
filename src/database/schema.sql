-- Database Initialization --
DO $$
BEGIN IF NOT EXISTS (
  SELECT
  FROM
    pg_database
  WHERE
    datname = 'capydo'
) THEN CREATE DATABASE capydo;

END IF;

END $$;

CREATE TABLE
  users (
    id SERIAL PRIMARY KEY,
    username character varying(100) NOT NULL UNIQUE,
    password character varying(255) NOT NULL,
    firstname character varying(100) NOT NULL
  );

CREATE TABLE
  task (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    status character varying(255) NOT NULL,
    importance character varying(255) NOT NULL,
    "dueTo" date,
    "dateCreated" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "userId" integer REFERENCES users (id) ON DELETE CASCADE
  );
  