import { Router } from 'express';
import {
  getBookmarksByVideo,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from '../controllers/bookmark.controller';

const router = Router();

// GET    /api/bookmarks/:videoId  — list bookmarks for a video
router.get('/:videoId',    getBookmarksByVideo);
// POST   /api/bookmarks           — create bookmark
router.post('/',           createBookmark);
// PUT    /api/bookmarks/:id       — update bookmark
router.put('/:id',         updateBookmark);
// DELETE /api/bookmarks/:id       — delete bookmark
router.delete('/:id',      deleteBookmark);

export default router;
