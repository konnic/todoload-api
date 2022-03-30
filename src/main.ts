import { connectAuthDb } from './auth/db/auth.db';
import express from 'express';
import cors from 'cors';
import router from './router';
import { Logger } from './app/app.utils';
import { getAuthDbConfig, loadConfig } from './config/config';

// const corsOptions: cors.CorsOptions = {}

loadConfig();
connectAuthDb(getAuthDbConfig());

const logger = new Logger(__filename);

/**
 * Init Express App, set up Middleware and register Router with /auth and /api endpoints.
 */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router);

/**
 * Configure port.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.log(`Server is listening on port ${PORT}`));
