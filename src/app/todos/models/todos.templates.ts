import { CreateTodoRequest, UpdateTodoRequest } from '.';

export const createTodoRequestRequiredProps: CreateTodoRequest = {
  title: 'title',
};

export const createTodoRequestAllProps: CreateTodoRequest = {
  ...createTodoRequestRequiredProps,
  id: 'id',
  description: 'description',
  priority: 0,
  due_date: new Date(),
  reminder: new Date(),
  project_id: 'project_id',
  section_id: 'section_id',
  repeats: 'repeats',
};

export const updateTodoRequestAllProps: UpdateTodoRequest = {
  title: 'title',
  description: 'description',
  priority: 0,
  due_date: new Date(),
  reminder: new Date(),
  project_id: 'project_id',
  section_id: 'section_id',
  repeats: 'repeats',
};
