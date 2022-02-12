import { BaseEntity } from './../../../shared/models/domain.models';

export interface Comment extends BaseEntity {
  todo_id: string;
  comment: string;
}

export type CreateCommentRequest = Pick<Comment, 'comment' | 'id'>;

export type UpdateCommentRequest = Pick<Comment, 'comment'>;

export type DB_Comment = Omit<Comment, ''>;
