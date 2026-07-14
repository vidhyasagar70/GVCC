import { Request, Response } from 'express';
import { Video, SEED_VIDEOS } from '../models/video.model';

// ─── GET /api/videos ──────────────────────────────────────────────────────────
export async function getAllVideos(_req: Request, res: Response): Promise<void> {
  const videos = await Video.find().sort({ createdAt: 1 }).lean();
  res.json(videos);
}

// ─── GET /api/videos/:id ──────────────────────────────────────────────────────
export async function getVideoById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const video = await Video.findById(req.params.id).lean();
  if (!video) {
    res.status(404).json({ message: 'Video not found' });
    return;
  }
  res.json(video);
}

// ─── POST /api/videos/seed ───────────────────────────────────────────────────
export async function seedVideos(_req: Request, res: Response): Promise<void> {
  // Delete all existing videos and re-insert fresh seed data
  await Video.deleteMany({});
  const created = await Video.insertMany(SEED_VIDEOS);
  res.status(201).json({
    message: `Successfully seeded ${created.length} videos`,
    count: created.length,
  });
}

// ─── DELETE /api/videos/:id ──────────────────────────────────────────────────
export async function deleteVideo(req: Request<{ id: string }>, res: Response): Promise<void> {
  const video = await Video.findByIdAndDelete(req.params.id);
  if (!video) {
    res.status(404).json({ message: 'Video not found' });
    return;
  }
  res.json({ message: 'Video deleted successfully' });
}
