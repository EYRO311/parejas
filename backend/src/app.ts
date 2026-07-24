import cors from 'cors';
import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import router from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', router);

app.use(errorMiddleware);

export default app;
