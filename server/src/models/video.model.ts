import { Schema, model, Document } from 'mongoose';

// ─── Seed data interface (timestamps managed by Mongoose) ─────────────────────
interface SeedVideo {
  title:        string;
  description:  string;
  videoUrl:     string;
  thumbnailUrl: string;
  duration:     number;
  instructor?:  string;
  tags?:        string[];
}

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface IVideo extends Document {
  title:        string;
  description:  string;
  videoUrl:     string;
  thumbnailUrl: string;
  duration:     number; // seconds
  instructor?:  string;
  tags?:        string[];
  createdAt:    Date;
  updatedAt:    Date;
}

// ─── Mongoose Schema ───────────────────────────────────────────────────────────
const VideoSchema = new Schema<IVideo>(
  {
    title:        { type: String, required: true, trim: true, maxlength: 200 },
    description:  { type: String, required: true, trim: true },
    videoUrl:     { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, default: '' },
    duration:     { type: Number, required: true, min: 0 },
    instructor:   { type: String, trim: true },
    tags:         { type: [String], default: [] },
  },
  { timestamps: true },
);

VideoSchema.index({ title: 'text', description: 'text' });

export const Video = model<IVideo>('Video', VideoSchema);

// ─── Seed Data ─────────────────────────────────────────────────────────────────
export const SEED_VIDEOS: SeedVideo[] = [
  {
    title:        'Introduction to TypeScript',
    description:  'A comprehensive introduction to TypeScript covering types, interfaces, generics, and best practices for building large-scale applications. Learn how TypeScript adds static type checking to JavaScript.',
    videoUrl:     '/videos/video1.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=640&q=80',
    duration:     27,
    instructor:   'Dr. Sarah Chen',
    tags:         ['TypeScript', 'JavaScript', 'Types', 'Beginner'],
  },
  {
    title:        'React Hooks Deep Dive',
    description:  'Master React hooks including useState, useEffect, useCallback, useMemo, useRef, and custom hooks. Understand when and how to use each hook for optimal performance.',
    videoUrl:     '/videos/video2.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80',
    duration:     13,
    instructor:   'Alex Rodriguez',
    tags:         ['React', 'Hooks', 'useState', 'useEffect', 'Intermediate'],
  },
  {
    title:        'Node.js & Express REST APIs',
    description:  'Build production-ready REST APIs using Node.js and Express. Covers routing, middleware, error handling, authentication patterns, and integration with MongoDB.',
    videoUrl:     '/videos/video3.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=640&q=80',
    duration:     30,
    instructor:   'Marcus Johnson',
    tags:         ['Node.js', 'Express', 'REST API', 'Backend', 'Intermediate'],
  },
  {
    title:        'MongoDB & Mongoose Mastery',
    description:  'Deep dive into MongoDB document modeling with Mongoose. Learn schemas, validation, indexing, aggregation pipelines, and performance optimization techniques.',
    videoUrl:     '/videos/video4.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=640&q=80',
    duration:     30,
    instructor:   'Dr. Sarah Chen',
    tags:         ['MongoDB', 'Mongoose', 'Database', 'NoSQL', 'Advanced'],
  },
  {
    title:        'Full-Stack MERN Deployment',
    description:  'Deploy your complete MERN stack application to production. Covers environment configuration, Docker containerization, CI/CD pipelines, and cloud deployment strategies.',
    videoUrl:     '/videos/video5.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80',
    duration:     60,
    instructor:   'Priya Patel',
    tags:         ['Deployment', 'Docker', 'DevOps', 'CI/CD', 'Advanced'],
  },
];
