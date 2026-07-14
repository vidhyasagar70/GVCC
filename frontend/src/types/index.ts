// ─── Domain Models ────────────────────────────────────────────────────────────

export interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  instructor?: string;
  tags?: string[];
  createdAt?: string;
}

export interface Bookmark {
  _id: string;
  videoId: string;
  timestamp: number; // seconds
  title?: string;
  notes?: string;
  createdAt: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateBookmarkPayload {
  videoId: string;
  timestamp: number;
  title?: string;
  notes?: string;
}

export interface UpdateBookmarkPayload {
  title?: string;
  notes?: string;
}

export interface ApiError {
  message: string;
  stack?: string;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface VideoPlayerProps {
  video: Video;
  onTimeUpdate?: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export interface BookmarkManagerProps {
  videoId: string;
  getCurrentTime: () => number;
  onSeek: (time: number) => void;
}

export interface ScreenshotShieldProps {
  children: React.ReactNode;
  className?: string;
}

// ─── UI Component Props ───────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  glass?: boolean;
}

// ─── Hook Return Types ────────────────────────────────────────────────────────

export interface UseBookmarksReturn {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  addBookmark: (payload: CreateBookmarkPayload) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  updateBookmark: (id: string, payload: UpdateBookmarkPayload) => Promise<void>;
}

export interface UseScreenshotProtectionReturn {
  isBlurred: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// ─── Toast Types ──────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';
