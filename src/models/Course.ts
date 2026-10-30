import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEpisode {
  _id?: Types.ObjectId;
  episodeNo: number;
  title: string;
  youtubeVideoId: string;
  duration?: string;
  summary?: string;
  sortOrder: number;
  createdAt?: Date;
}

export interface ICourseThumbnail {
  url: string;
  alt: string;
  source: 'upload' | 'youtube';
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  slugHistory: string[];
  courseType: 'video' | 'markdown';
  category: 'ai' | 'beauty' | 'vocational' | 'etc';
  instructor: string;
  description: string;
  term?: string;
  thumbnail: ICourseThumbnail;
  status: 'draft' | 'private' | 'public';
  isFeatured: boolean;
  featuredOrder: number;
  sortOrder: number;
  markdownBody?: string;
  plainText?: string;
  episodes: IEpisode[];
  tags: string[];
  deletedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>(
  {
    episodeNo: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    youtubeVideoId: { type: String, required: true, trim: true },
    duration: { type: String, default: '', trim: true },
    summary: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CourseThumbnailSchema = new Schema<ICourseThumbnail>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true },
    source: { type: String, enum: ['upload', 'youtube'], default: 'youtube' },
  },
  { _id: false }
);

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    slugHistory: {
      type: [String],
      default: [],
      index: true,
    },
    courseType: {
      type: String,
      enum: ['video', 'markdown'],
      required: true,
      default: 'video',
      index: true,
    },
    category: {
      type: String,
      enum: ['ai', 'beauty', 'vocational', 'etc'],
      required: true,
      default: 'ai',
      index: true,
    },
    instructor: {
      type: String,
      required: true,
      default: '김범준 원장',
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    term: {
      type: String,
      default: '',
      trim: true,
    },
    thumbnail: {
      type: CourseThumbnailSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'private', 'public'],
      default: 'public',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    markdownBody: {
      type: String,
      default: '',
    },
    plainText: {
      type: String,
      default: '',
    },
    episodes: {
      type: [EpisodeSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    deletedAt: {
      type: Date,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  {
    timestamps: true,
  }
);

// 복합 인덱스 & 텍스트 인덱스 정의
CourseSchema.index({ status: 1, category: 1, sortOrder: 1, createdAt: -1 });
CourseSchema.index({ status: 1, isFeatured: 1, featuredOrder: 1, createdAt: -1 });
CourseSchema.index(
  {
    title: 'text',
    instructor: 'text',
    description: 'text',
    plainText: 'text',
    'episodes.title': 'text',
  },
  {
    weights: {
      title: 10,
      instructor: 8,
      'episodes.title': 6,
      description: 3,
      plainText: 1,
    },
    name: 'CourseTextIndex',
  }
);

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
