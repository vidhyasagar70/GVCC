import React, { useState, useRef } from 'react';
import {
  BookmarkPlus, BookmarkCheck, Trash2,
  Clock, StickyNote, Loader2, AlertCircle, ChevronRight,
} from 'lucide-react';
import { useBookmarks }    from '../../hooks/useBookmarks';
import { Button }          from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import type { BookmarkManagerProps, CreateBookmarkPayload } from '../../types';

function formatTs(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({
  videoId, getCurrentTime, onSeek,
}) => {
  const { bookmarks, loading, error, addBookmark, deleteBookmark } = useBookmarks(videoId);

  const [showForm, setShowForm]         = useState(false);
  const [capturedTime, setCapturedTime] = useState(0);
  const [formTitle, setFormTitle]       = useState('');
  const [formNotes, setFormNotes]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const titleInputRef                    = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    setCapturedTime(getCurrentTime());
    setFormTitle('');
    setFormNotes('');
    setShowForm(true);
    setTimeout(() => titleInputRef.current?.focus(), 80);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload: CreateBookmarkPayload = {
      videoId,
      timestamp: capturedTime,
      title:     formTitle.trim() || undefined,
      notes:     formNotes.trim() || undefined,
    };
    try {
      await addBookmark(payload);
      setShowForm(false);
      setFormTitle('');
      setFormNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await deleteBookmark(id); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Add button ─────────────────────────────────────────────────────────── */}
      {!showForm && (
        <div className="pb-3 border-b border-zinc-100">
          <Button
            id="add-bookmark-btn"
            variant="primary"
            size="sm"
            onClick={handleCapture}
            icon={<BookmarkPlus size={14} />}
            className="w-full"
          >
            Bookmark at current time
          </Button>
        </div>
      )}

      {/* ── Capture form ───────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="pb-3 border-b border-zinc-100 animate-slide-up">
          {/* Timestamp label */}
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-zinc-400" />
            <span className="font-mono text-sm font-semibold text-zinc-900">{formatTs(capturedTime)}</span>
            <span className="text-xs text-zinc-400">captured</span>
          </div>

          <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-2.5">
            <Input
              ref={titleInputRef}
              label="Title"
              placeholder="e.g. Key concept explained"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              id="bookmark-title-input"
            />
            <Textarea
              label="Notes"
              placeholder="Add context or takeaways..."
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              rows={2}
              id="bookmark-notes-input"
            />
            <div className="flex gap-2 pt-1">
              <Button
                type="submit" variant="primary" size="sm"
                loading={isSubmitting}
                icon={<BookmarkCheck size={13} />}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                type="button" variant="ghost" size="sm"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── List ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 mt-1">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={18} className="text-zinc-300 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-start gap-2 py-4 text-sm text-red-500">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && bookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <BookmarkPlus size={22} className="text-zinc-300" />
            <p className="text-sm text-zinc-500">No bookmarks yet</p>
            <p className="text-xs text-zinc-400">Pause and save key moments while watching</p>
          </div>
        )}

        {/* Bookmark rows — flat list divided by thin lines */}
        {!loading && bookmarks.length > 0 && (
          <div className="divide-y divide-zinc-100">
            {bookmarks.map(bm => (
              <div
                key={bm._id}
                role="button"
                tabIndex={0}
                onClick={() => onSeek(bm.timestamp)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSeek(bm.timestamp); }}
                aria-label={`Seek to ${formatTs(bm.timestamp)}`}
                className="group flex items-start gap-3 py-3 px-1 cursor-pointer
                           hover:bg-zinc-50 transition-colors duration-100 rounded
                           border-l-2 border-transparent hover:border-zinc-900
                           animate-fade-in"
              >
                {/* Timestamp */}
                <span className="flex-shrink-0 font-mono text-xs font-semibold text-zinc-900 tabular-nums pt-0.5 min-w-[36px]">
                  {formatTs(bm.timestamp)}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {bm.title
                    ? <p className="text-sm font-medium text-zinc-900 leading-snug">{bm.title}</p>
                    : <p className="text-sm text-zinc-400 italic">Untitled</p>
                  }
                  {bm.notes && (
                    <div className="flex items-start gap-1 mt-0.5">
                      <StickyNote size={11} className="text-zinc-300 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-500 line-clamp-2">{bm.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions — hidden until hover */}
                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <ChevronRight size={14} className="text-zinc-400" />
                  <button
                    id={`delete-bookmark-${bm._id}`}
                    onClick={e => { e.stopPropagation(); void handleDelete(bm._id); }}
                    disabled={deletingId === bm._id}
                    className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    aria-label="Delete bookmark"
                  >
                    {deletingId === bm._id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer count */}
      {bookmarks.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
          <span className="text-xs text-zinc-400">{bookmarks.length} saved</span>
          <span className="text-xs text-zinc-400">Click any row to jump</span>
        </div>
      )}
    </div>
  );
};
