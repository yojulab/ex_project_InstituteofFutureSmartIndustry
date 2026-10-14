import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  imageUrl: string;
  altText: string; // KWCAG 2.2 대체텍스트 필수
  linkUrl: string;
  isExternal: boolean;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    altText: {
      type: String,
      required: true, // KWCAG 2.2 준수: 대체텍스트 필수 강제
      trim: true,
    },
    linkUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BannerSchema.index({ isActive: 1, order: 1 });

export const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
