import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResourceAttachment {
  name: string;
  url: string;
  size: number;
}

export interface IResource extends Document {
  kind: 'publication' | 'statistics' | 'regulation';
  title: string;
  summary: string;
  publishedAt: Date;
  authorOrDept: string;
  attachments: IResourceAttachment[];
  downloadCount: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceAttachmentSchema = new Schema<IResourceAttachment>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const ResourceSchema = new Schema<IResource>(
  {
    kind: {
      type: String,
      enum: ['publication', 'statistics', 'regulation'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    authorOrDept: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [ResourceAttachmentSchema],
    downloadCount: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ResourceSchema.index({ kind: 1, publishedAt: -1 });
ResourceSchema.index({ title: 'text', summary: 'text', authorOrDept: 'text' });

export const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;
