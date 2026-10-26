import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface IThumbnail {
  url: string;
  alt: string;
}

export interface IPost extends Document {
  category: 'notice' | 'activity' | 'paper' | 'director';
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: 'draft' | 'private' | 'public';
  isFeatured: boolean;
  eventDate?: Date;
  sourceUrl?: string;
  sourceName?: string;
  doi?: string;
  authors: string[];
  journal?: string;
  volumeIssuePages?: string;
  thumbnail?: IThumbnail;
  attachments: IAttachment[];
  tags: string[];
  deletedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true, default: 0 },
    mimeType: { type: String, required: true, default: 'application/octet-stream' },
  },
  { _id: false }
);

const ThumbnailSchema = new Schema<IThumbnail>(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    category: {
      type: String,
      enum: ['notice', 'activity', 'paper', 'director'],
      required: true,
      default: 'notice',
      index: true,
    },
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
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    body: {
      type: String,
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
    eventDate: {
      type: Date,
      index: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    sourceName: {
      type: String,
      trim: true,
    },
    doi: {
      type: String,
      trim: true,
    },
    authors: [{ type: String, trim: true }],
    journal: {
      type: String,
      trim: true,
    },
    volumeIssuePages: {
      type: String,
      trim: true,
    },
    thumbnail: ThumbnailSchema,
    attachments: [AttachmentSchema],
    tags: [{ type: String, trim: true }],
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

// 복합 인덱스 및 검색용 텍스트 인덱스 설정
PostSchema.index({ status: 1, category: 1, eventDate: -1, createdAt: -1 });
PostSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
PostSchema.index({ title: 'text', summary: 'text', body: 'text' });

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
