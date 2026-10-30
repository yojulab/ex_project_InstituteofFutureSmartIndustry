import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type LectureFileType = 'pdf' | 'pptx' | 'md' | 'zip' | 'image';
export type ExtractStatus = 'none' | 'pending' | 'done' | 'failed' | 'skipped';
export type PreviewStatus = 'none' | 'pending' | 'ready' | 'failed';

export interface ILectureAttachment extends Document {
  courseId: Types.ObjectId;
  episodeId?: Types.ObjectId;
  fileType: LectureFileType;
  fileName: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
  extractedText?: string;
  extractStatus: ExtractStatus;
  previewKey?: string;
  previewStatus: PreviewStatus;
  embedUrl?: string;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LectureAttachmentSchema = new Schema<ILectureAttachment>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    episodeId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'pptx', 'md', 'zip', 'image'],
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      default: 0,
    },
    mimeType: {
      type: String,
      required: true,
      default: 'application/octet-stream',
    },
    extractedText: {
      type: String,
      default: '',
    },
    extractStatus: {
      type: String,
      enum: ['none', 'pending', 'done', 'failed', 'skipped'],
      default: 'none',
    },
    previewKey: {
      type: String,
      default: '',
    },
    previewStatus: {
      type: String,
      enum: ['none', 'pending', 'ready', 'failed'],
      default: 'none',
    },
    embedUrl: {
      type: String,
      default: '',
      trim: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

LectureAttachmentSchema.index({ courseId: 1, episodeId: 1, createdAt: 1 });

export const LectureAttachment: Model<ILectureAttachment> =
  mongoose.models.LectureAttachment ||
  mongoose.model<ILectureAttachment>('LectureAttachment', LectureAttachmentSchema);

