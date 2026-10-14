import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgram extends Document {
  title: string;
  slug: string;
  category: string;
  summary: string;
  target: string;
  content: string;
  period: {
    start?: Date;
    end?: Date;
    rawText: string;
  };
  status: 'open' | 'upcoming' | 'closed';
  department: string;
  contact: string;
  externalUrl?: string;
  isFeatured: boolean;
  order: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
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
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    target: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    period: {
      start: { type: Date },
      end: { type: Date },
      rawText: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['open', 'upcoming', 'closed'],
      default: 'open',
      index: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    externalUrl: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
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

ProgramSchema.index({ status: 1, order: 1, createdAt: -1 });
ProgramSchema.index({ title: 'text', summary: 'text', target: 'text', content: 'text' });

export const Program: Model<IProgram> =
  mongoose.models.Program || mongoose.model<IProgram>('Program', ProgramSchema);

export default Program;
