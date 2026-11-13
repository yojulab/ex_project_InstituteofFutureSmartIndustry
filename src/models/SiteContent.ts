import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISiteContent extends Document {
  slug: 'about' | 'director' | string;
  title: string;
  subtitle?: string;
  content: string; // 마크다운 본문
  metadata: Record<string, any>; // 세부 필드 (연혁, 학력, 4대역할, 프로필이미지 등)
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      required: true,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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

export const SiteContent: Model<ISiteContent> =
  mongoose.models.SiteContent || mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);
