import 'express-async-errors';
import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import path    from 'path';

import { connectDB }     from './config/db';
import videoRoutes       from './routes/video.routes';
import bookmarkRoutes    from './routes/bookmark.routes';
import errorMiddleware   from './middleware/error.middleware';

// ─── Load environment variables ───────────────────────────────────────────────
dotenv.config();

const app  = express();
const PORT = Number(process.env.PORT) || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:      ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// ─── Static files (local videos) ──────────────────────────────────────────────
app.use('/videos', express.static(path.join(__dirname, '..', 'public', 'videos')));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/videos',    videoRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`📚  API docs: http://localhost:${PORT}/health`);
    console.log(`🌱  Seed videos: POST http://localhost:${PORT}/api/videos/seed`);
  });
}

void start();
