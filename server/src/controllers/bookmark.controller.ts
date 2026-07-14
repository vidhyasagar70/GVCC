import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Bookmark } from '../models/bookmark.model';

// ─── Request body types ───────────────────────────────────────────────────────
interface CreateBookmarkBody {
  videoId:    string;
  timestamp:  number;
  title?:     string;
  notes?:     string;
}

interface UpdateBookmarkBody {
  title?: string;
  notes?: string;
}

// ─── GET /api/bookmarks/:videoId ──────────────────────────────────────────────
export async function getBookmarksByVideo(
  req: Request<{ videoId: string }>,
  res: Response,
): Promise<void> {
  const { videoId } = req.params;

  if (!Types.ObjectId.isValid(videoId)) {
    res.status(400).json({ message: 'Invalid video ID' });
    return;
  }

  const bookmarks = await Bookmark.find({ videoId })
    .sort({ timestamp: 1 })
    .lean();

  res.json(bookmarks);
}

// ─── POST /api/bookmarks ──────────────────────────────────────────────────────
export async function createBookmark(
  req: Request<Record<string, never>, unknown, CreateBookmarkBody>,
  res: Response,
): Promise<void> {
  const { videoId, timestamp, title, notes } = req.body;

  if (!videoId || !Types.ObjectId.isValid(videoId)) {
    res.status(400).json({ message: 'Invalid or missing videoId' });
    return;
  }
  if (typeof timestamp !== 'number' || timestamp < 0) {
    res.status(400).json({ message: 'timestamp must be a non-negative number' });
    return;
  }

  const bookmark = await Bookmark.create({
    videoId: new Types.ObjectId(videoId),
    timestamp,
    title:  title?.trim(),
    notes:  notes?.trim(),
  });

  res.status(201).json(bookmark);
}

// ─── PUT /api/bookmarks/:id ───────────────────────────────────────────────────
export async function updateBookmark(
  req: Request<{ id: string }, unknown, UpdateBookmarkBody>,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid bookmark ID' });
    return;
  }

  const { title, notes } = req.body;
  const updated = await Bookmark.findByIdAndUpdate(
    id,
    { $set: { title: title?.trim(), notes: notes?.trim() } },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    res.status(404).json({ message: 'Bookmark not found' });
    return;
  }

  res.json(updated);
}

// ─── DELETE /api/bookmarks/:id ────────────────────────────────────────────────
export async function deleteBookmark(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid bookmark ID' });
    return;
  }

  const deleted = await Bookmark.findByIdAndDelete(id);
  if (!deleted) {
    res.status(404).json({ message: 'Bookmark not found' });
    return;
  }

  res.json({ message: 'Bookmark deleted successfully', id });
}
