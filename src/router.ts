import { Router } from 'express';
import authRouter from './auth/auth.router';
import commentsRouter from './app/comments/comments.router';
import todosRouter from './app/todos/todos.router';

const router = Router();
router.use('/auth', authRouter);
router.use('/api/todos', todosRouter);
router.use('/api/todos/:todo_id/comments', commentsRouter);

export default router;
