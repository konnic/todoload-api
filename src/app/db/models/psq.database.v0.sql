-- ERD SCHEMA: https://lucid.app/lucidchart/44281c1c-e25e-4a1d-9e9f-fceae2b5f682/edit

CREATE DATABASE todo_db;

CREATE TABLE project(
  id SERIAL PRIMARY KEY,
  title VARCHAR(50),
  description VARCHAR(255),
  user_id VARCHAR NOT NULL
);

CREATE TABLE section(
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES project,
  title VARCHAR(50)
);

CREATE TABLE todo(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    completed BOOLEAN NOT NULL,
    priority INT,
    due_date DATE,
    reminder TIMESTAMP WITH TIME ZONE,
    project_id INT REFERENCES project,
    section_id INT REFERENCES section,
    parent_id INT REFERENCES todo,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_id VARCHAR NOT NULL
);

CREATE TABLE comment(
  id SERIAL PRIMARY KEY,
  todo_id INT REFERENCES todo,
  comment VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE index(
    id SERIAL PRIMARY KEY,
    todo_id INT REFERENCES todo,
    index_string VARCHAR(100)
);