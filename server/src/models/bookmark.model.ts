import { Schema, model, Document, Types } from 'mongoose';

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface IBookmark extends Document {
  videoId:   Types.ObjectId;
  timestamp: number;   // seconds
  title?:    string;
  notes?:    string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mongoose Schema ───────────────────────────────────────────────────────────
const BookmarkSchema = new Schema<IBookmark>(
  {
    videoId:   {
      type:     Schema.Types.ObjectId,
      ref:      'Video',
      required: true,
      index:    true,
    },
    timestamp: {
      type:     Number,
      required: true,
      min:      0,
    },
    title: {
      type:      String,
      trim:      true,
      maxlength: 200,
    },
    notes: {
      type:      String,
      trim:      true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

// Compound index: fast per-video bookmark queries sorted by timestamp
BookmarkSchema.index({ videoId: 1, timestamp: 1 });

export const Bookmark = model<IBookmark>('Bookmark', BookmarkSchema);
