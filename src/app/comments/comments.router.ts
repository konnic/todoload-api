import {
  parseValuesForCreateQuery,
  parseValuesForUpdateQuery,
} from '../app.utils';
import { Router, NextFunction, Response } from 'express';
import { QueryResult } from 'pg';
import {
  CreateQueryData,
  UpdateQueryData,
  TypedRequest,
  TypedRequestWithParams,
} from '../../shared/models';
import { v4 as uuid } from 'uuid';
import {
  CreateCommentRequest,
  DB_Comment,
  UpdateCommentRequest,
} from './models';
import { DB_Todo } from '../todos/models';
import pool from '../db/app.db';

const commentsRouter = Router({ mergeParams: true });

async function todoExistsGuard(
  req: TypedRequestWithParams<null, { todo_id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { todo_id } = req.params;

  if (!todo_id) {
    res.sendStatus(400);
    return;
  }

  pool
    .query('SELECT * FROM todo WHERE id = $1 AND user_id = $2', [
      todo_id,
      req.userId,
    ])
    .then((result: QueryResult<DB_Todo>) =>
      result.rows.length > 0 ? next() : res.sendStatus(404)
    )
    .catch(() => res.sendStatus(500));
}
commentsRouter.use(todoExistsGuard);

/**
 * Get all comments of a todo.
 */
commentsRouter.get(
  '/',
  async (
    req: TypedRequestWithParams<null, { todo_id: string }>,
    res: Response
  ) => {
    pool
      .query('SELECT * FROM comment WHERE todo_id = $1', [req.params.todo_id])
      .then((result: QueryResult<DB_Comment>) => res.json(result.rows))
      .catch(() => res.sendStatus(500));
  }
);

/**
 * Create a comment.
 */
commentsRouter.post(
  '/',
  async (req: TypedRequest<CreateCommentRequest>, res: Response) => {
    const { todo_id } = req.params;
    const { comment } = req.body;

    if (!comment || !todo_id) {
      res.sendStatus(400);
      return;
    }

    // create an id if none is privded by client
    req.body.id = req.body?.id ? req.body.id : uuid();

    const queryData: CreateQueryData = parseValuesForCreateQuery<DB_Comment>({
      ...req.body,
      todo_id,
      created_at: new Date(),
    });

    pool
      .query(
        `INSERT INTO comment (${queryData.keys}) VALUES (${queryData.refs}) RETURNING  *`,
        queryData.values
      )
      .then(async (result: QueryResult<DB_Comment>) => {
        updateHasCommentFromParentTodo(todo_id, true);
        return res.status(201).json(result.rows[0]);
      })
      .catch(() => res.sendStatus(500));
  }
);

const updateHasCommentFromParentTodo = async (
  todoId: string,
  triggeredByCommentCreation = false
): Promise<void> => {
  if (!triggeredByCommentCreation) {
    pool.query('UPDATE todo SET has_comment = $1 WHERE todo_id = $2', [
      true,
      todoId,
    ]);
    return;
  }

  pool
    .query('SELECT * FROM comment WHERE id', [todoId])
    .then((result: QueryResult<DB_Comment>) => {
      if (result.rowCount === 0) {
        pool.query('UPDATE todo SET has_comment = $1 WHERE todo_id = $2', [
          false,
          todoId,
        ]);
      }
    });
};

/**
 * Update a comment.
 */
commentsRouter.patch(
  '/:comment_id',
  async (
    req: TypedRequestWithParams<UpdateCommentRequest, { todo_id: string }>,
    res: Response
  ) => {
    const { comment_id, todo_id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment_id || !todo_id) {
      res.sendStatus(400);
      return;
    }

    const queryData: UpdateQueryData = parseValuesForUpdateQuery({
      ...req.body,
      updated_at: new Date(),
    });

    pool
      .query(
        `UPDATE comment SET ${queryData.keysAndRefs} WHERE id = $3 AND todo_id = $4 RETURNING *`,
        [...queryData.values, comment_id, todo_id]
      )
      .then((result: QueryResult<DB_Comment>) => res.json(result.rows[0]))
      .catch(() => res.sendStatus(500));
  }
);

/**
 * Delete a comment.
 */
commentsRouter.delete(
  '/:comment_id',
  async (
    req: TypedRequestWithParams<null, { todo_id: string }>,
    res: Response
  ) => {
    const { comment_id, todo_id } = req.params;

    pool
      .query('DELETE FROM comment WHERE id = $1 AND todo_id = $2', [
        comment_id,
        todo_id,
      ])
      .then((result: QueryResult<DB_Comment>) => {
        if (result.rowCount) {
          updateHasCommentFromParentTodo(todo_id, false);
          res.sendStatus(204);
          return;
        }
        res.sendStatus(404);
      })
      .catch(() => res.sendStatus(500));
  }
);

export default commentsRouter;
