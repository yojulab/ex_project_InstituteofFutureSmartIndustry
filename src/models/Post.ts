import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface IPost extends Document {
  type: 'notice' | 'press' | 'event' | 'bid';
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: 'draft' | 'scheduled' | 'published' | 'hidden';
  isPinned: boolean;
  publishedAt: Date;
  department?: string;
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

const PostSchema = new Schema<IPost>(
  {
    type: {
      type: String,
      enum: ['notice', 'press', 'event', 'bid'],
      required: true,
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
      enum: ['draft', 'scheduled', 'published', 'hidden'],
      default: 'published',
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
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

// 복합 인덱스 및 텍스트 인덱스 설정
PostSchema.index({ type: 1, status: 1, isPinned: -1, publishedAt: -1 });
PostSchema.index({ title: 'text', summary: 'text', body: 'text' });

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
