import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import type {
  Bookmark,
  CreateBookmarkPayload,
  UpdateBookmarkPayload,
  UseBookmarksReturn,
} from '../types';

export function useBookmarks(videoId: string): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchBookmarks = useCallback(async () => {
    if (!videoId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Bookmark[]>(`/api/bookmarks/${videoId}`);
      setBookmarks(data);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : 'Failed to load bookmarks';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    void fetchBookmarks();
  }, [fetchBookmarks]);

  // ── Add (optimistic) ─────────────────────────────────────────────────────────
  const addBookmark = useCallback(async (payload: CreateBookmarkPayload): Promise<void> => {
    // Optimistic placeholder
    const tempId = `temp-${Date.now()}`;
    const optimistic: Bookmark = {
      _id:       tempId,
      videoId:   payload.videoId,
      timestamp: payload.timestamp,
      title:     payload.title,
      notes:     payload.notes,
      createdAt: new Date().toISOString(),
    };
    setBookmarks(prev => [...prev, optimistic].sort((a, b) => a.timestamp - b.timestamp));

    try {
      const { data } = await api.post<Bookmark>('/api/bookmarks', payload);
      // Replace the optimistic entry with the real one from the server
      setBookmarks(prev =>
        prev.map(bm => (bm._id === tempId ? data : bm)).sort((a, b) => a.timestamp - b.timestamp),
      );
      toast.success('Bookmark saved!');
    } catch (err: unknown) {
      // Roll back
      setBookmarks(prev => prev.filter(bm => bm._id !== tempId));
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : 'Failed to save bookmark';
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  // ── Update ───────────────────────────────────────────────────────────────────
  const updateBookmark = useCallback(
    async (id: string, payload: UpdateBookmarkPayload): Promise<void> => {
      const previous = bookmarks.find(b => b._id === id);
      // Optimistic update
      setBookmarks(prev =>
        prev.map(bm => (bm._id === id ? { ...bm, ...payload } : bm)),
      );
      try {
        const { data } = await api.put<Bookmark>(`/api/bookmarks/${id}`, payload);
        setBookmarks(prev => prev.map(bm => (bm._id === id ? data : bm)));
        toast.success('Bookmark updated!');
      } catch (err: unknown) {
        // Roll back
        if (previous) {
          setBookmarks(prev => prev.map(bm => (bm._id === id ? previous : bm)));
        }
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : 'Failed to update bookmark';
        toast.error(msg);
        throw new Error(msg);
      }
    },
    [bookmarks],
  );

  // ── Delete (optimistic) ───────────────────────────────────────────────────────
  const deleteBookmark = useCallback(async (id: string): Promise<void> => {
    const previous = bookmarks.find(b => b._id === id);
    setBookmarks(prev => prev.filter(bm => bm._id !== id));

    try {
      await api.delete(`/api/bookmarks/${id}`);
      toast.success('Bookmark removed');
    } catch (err: unknown) {
      // Roll back
      if (previous) {
        setBookmarks(prev =>
          [...prev, previous].sort((a, b) => a.timestamp - b.timestamp),
        );
      }
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : 'Failed to delete bookmark';
      toast.error(msg);
      throw new Error(msg);
    }
  }, [bookmarks]);

  return { bookmarks, loading, error, addBookmark, updateBookmark, deleteBookmark };
}
