-- ERD SCHEMA: https://lucid.app/lucidchart/44281c1c-e25e-4a1d-9e9f-fceae2b5f682/edit
-- ORDERED BY SEQUENCE OF CREATION

CREATE DATABASE todo_db;

CREATE TABLE project(
  id UUID PRIMARY KEY,
  title VARCHAR(50),
  description VARCHAR(255),
  user_id VARCHAR NOT NULL
);

CREATE TABLE section(
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES project,
  title VARCHAR(50)
);

CREATE TABLE todo(
    id UUID PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    completed BOOLEAN NOT NULL,
    priority INT,
    due_date DATE,
    reminder TIMESTAMP WITH TIME ZONE,
    has_comment BOOLEAN NOT NULL,
    repeats VARCHAR(50),
    project_id UUID REFERENCES project,
    section_id UUID REFERENCES section,
    children UUID [],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE comment(
  id UUID PRIMARY KEY,
  todo_id UUID REFERENCES todo,
  comment VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE index(
    id UUID PRIMARY KEY,
    todo_id UUID REFERENCES todo,
    project_id UUID REFERENCES project,
    section_id UUID REFERENCES section,
    index INT NOT NULL
);

CREATE TABLE estimation(
    id UUID PRIMARY KEY,
    todo_id UUID REFERENCES todo,
    estimation INT,
    time_spent INT
);

CREATE TABLE label_repository(
    id UUID PRIMARY KEY,
    label VARCHAR(50)
);

CREATE TABLE label_todo_map(
    id UUID PRIMARY KEY,
    label_id UUID REFERENCES label_repository,
    todo_id UUID REFERENCES todo
);