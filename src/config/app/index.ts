import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer, Server } from 'http';
import { router } from '../../routes/index.js';
import { morganMiddleware } from '../../middlewares/index.js';
import { makeResponse } from '../../lib/index.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST: string = String(process.env.HOST || '0.0.0.0');

// Parse multiple origins from environment variable (comma-separated)
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

const app = express();

// CORS configuration allowing multiple origins
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' })); // blog / case-study bodies are HTML
app.use(cookieParser());
app.use(morganMiddleware);

app.use('/api', router);

// Upload / body-parser errors -> the standard JSON envelope instead of an HTML error page
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(err);
  const tooLarge = err?.code === 'LIMIT_FILE_SIZE' || err?.type === 'entity.too.large';
  const clientError = typeof err?.status === 'number' && err.status < 500;
  const status = tooLarge ? 413 : clientError ? err.status : err?.message ? 400 : 500;
  res.status(status).json({ success: false, message: tooLarge ? 'File or request is too large' : err?.message || 'unknown_error', data: null, meta: {} });
});

app.use((req, res) => {
  makeResponse(req, res, 404, false, 'route_not_found');
});

const server: Server = createServer(app);
server.listen(PORT, HOST, async () => {
  console.log(`* App is running at PORT: ${PORT} *`);
});

export const initializeApp = () => server;
