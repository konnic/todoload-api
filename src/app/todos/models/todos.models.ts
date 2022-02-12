import { BaseEntity } from './../../../shared/models/domain.models';

export interface Todo extends BaseEntity {
  title: string;
  user_id: string;
  completed: boolean;
  has_comment: boolean;
  description?: string;
  priority?: number;
  due_date?: Date;
  reminder?: Date;
  repeats?: string;
  project_id?: string;
  section_id?: string;
  children?: string[];
}

export interface TodoWithComments extends Todo {
  comments: Comment[];
}

export type CreateTodoRequest = Omit<
  Todo,
  | 'created_at'
  | 'updated_at'
  | 'user_id'
  | 'completed'
  | 'children'
  | 'completed'
  | 'has_comment'
>;

export type UpdateTodoRequest = Partial<
  Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'has_comment'>
>;

export type DB_Todo = Omit<Todo, ''>;
