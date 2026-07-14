import { Router } from 'express';
import {
  getAllVideos,
  getVideoById,
  seedVideos,
  deleteVideo,
} from '../controllers/video.controller';

const router = Router();

// GET  /api/videos         — list all
router.get('/',         getAllVideos);
// POST /api/videos/seed    — seed sample data
router.post('/seed',    seedVideos);
// GET  /api/videos/:id     — single video
router.get('/:id',      getVideoById);
// DELETE /api/videos/:id   — remove video
router.delete('/:id',   deleteVideo);

export default router;
