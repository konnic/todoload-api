import {
  handleErrorWithStatus,
  isValidRequestBody,
  Logger,
  parseValuesForCreateQuery,
  parseValuesForUpdateQuery,
} from '../app.utils';
import { QueryResult } from 'pg';
import { Router, Response } from 'express';
import * as authUtils from '../../auth/utils/auth.utils';
import { v4 as uuid } from 'uuid';
import {
  CreateQueryData,
  TypedRequest,
  UpdateQueryData,
} from '../../shared/models';
import {
  CreateTodoRequest,
  createTodoRequestAllProps,
  createTodoRequestRequiredProps,
  DB_Todo,
  Todo,
  TodoWithComments,
  UpdateTodoRequest,
  updateTodoRequestAllProps,
} from './models';
import pool from '../db/app.db';
import cors from 'cors';

// import { Pool, PoolConfig } from 'pg';

// const config = getAppDbConfig();
// const pool = new Pool(config);
// pool
//   .connect()
//   .then(() =>
//     logger.log(`Connected to PostgreSQL database ${config.database}.`)
//   )
//   .catch((e: Error) =>
//     logger.log(
//       `Connecting to PostgreSQL database ${config.database} failed.`,
//       e
//     )
//   );

const logger = new Logger(__filename);

const todosRouter = Router();
todosRouter.use(authUtils.verifyAccessToken);
todosRouter.use(cors());

/**
 * Get all todos.
 */
todosRouter.get('/', async (req: TypedRequest<null>, res: Response) => {
  const { project_id } = req.query;

  const query = project_id
    ? 'SELECT * FROM todo WHERE project_id = $1 AND user_id = $2'
    : 'SELECT * FROM todo WHERE user_id = $1';
  const values = project_id ? [project_id, req.userId] : [req.userId];

  pool
    .query(query, values)
    .then((result: QueryResult<DB_Todo>) => res.json(result.rows))
    .catch(() => res.sendStatus(500));
});

/**
 * Get todo by todo_id.
 */
todosRouter.get('/:todo_id', async (req: TypedRequest<null>, res: Response) => {
  const { todo_id } = req.params;

  pool
    .query('SELECT * FROM todo WHERE id = $1 AND user_id = $2', [
      todo_id,
      req.userId,
    ])
    .then((todo: QueryResult<DB_Todo>) => {
      if (todo.rowCount > 0) {
        pool
          .query('SELECT * FROM comment WHERE todo_id = $1', [todo_id])
          .then((comments: QueryResult<Comment>) =>
            res.json(<TodoWithComments>{
              ...todo.rows[0],
              comments: comments.rows || [],
            })
          );
      } else {
        res.sendStatus(404);
      }
    })
    .catch(() => res.sendStatus(500));
});

/**
 * Create a todo.
 */
todosRouter.post(
  '/',
  async (req: TypedRequest<CreateTodoRequest>, res: Response) => {
    if (
      !isValidRequestBody(
        req.body,
        createTodoRequestRequiredProps,
        createTodoRequestAllProps
      )
    ) {
      res.sendStatus(400);
      return;
    }

    // create an id if none is privded by client
    req.body.id = req.body.id ? req.body.id : uuid();

    const queryData: CreateQueryData = parseValuesForCreateQuery<DB_Todo>({
      ...req.body,
      user_id: req.userId,
      created_at: new Date(),
      completed: false,
      has_comment: false,
    });

    pool
      .query(
        `INSERT INTO todo (${queryData.keys}) VALUES (${queryData.refs}) RETURNING  *`,
        queryData.values
      )
      .then((result: QueryResult<DB_Todo>) =>
        res.status(201).json(result.rows[0])
      )
      .catch((e) => handleErrorWithStatus(500, e, req, res, logger));
  }
);

/**
 * Update a todo.
 */
todosRouter.patch(
  '/:todo_id',
  async (req: TypedRequest<UpdateTodoRequest>, res: Response) => {
    const { todo_id } = req.params;

    if (
      !isValidRequestBody(req.body, null, updateTodoRequestAllProps) ||
      !todo_id
    ) {
      res.sendStatus(400);
      return;
    }

    const queryData: UpdateQueryData = parseValuesForUpdateQuery({
      ...req.body,
      updated_at: new Date(),
    });
    const whereIndex = queryData.values.length + 1;
    const andIndex = whereIndex + 1;

    pool
      .query(
        `UPDATE todo SET ${queryData.keysAndRefs} WHERE user_id = $${whereIndex} AND id = $${andIndex} RETURNING *`,
        [...queryData.values, req.userId, todo_id]
      )
      .then((result: QueryResult<DB_Todo>) => res.json(result.rows[0]))
      .catch((e) => handleErrorWithStatus(500, e, req, res, logger));
  }
);

/**
 * Delete a todo.
 */
todosRouter.delete(
  '/:todo_id',
  async (req: TypedRequest<null>, res: Response) => {
    const { todo_id } = req.params;

    const deleteComment = pool
      .query<Comment>('DELETE FROM comment WHERE todo_id = $1', [todo_id])
      .catch((e) => handleErrorWithStatus(500, e, req, res, logger));
    const deleteTodo = pool
      .query<Todo>('DELETE FROM todo WHERE id = $1  AND user_id = $2', [
        todo_id,
        req.userId,
      ])
      .catch((e) => handleErrorWithStatus(500, e, req, res, logger));

    Promise.all([deleteComment, deleteTodo]).then(
      (results: [void | QueryResult<Comment>, void | QueryResult<DB_Todo>]) => {
        const [deleteCommentResult, deleteTodoResult] = results;
        if (deleteTodoResult) {
          res.sendStatus(deleteTodoResult.rowCount === 1 ? 204 : 404);
        }
      }
    );
  }
);

export default todosRouter;
