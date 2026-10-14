import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuickLink extends Document {
  title: string;
  description: string;
  icon: string;
  href: string;
  order: number;
  isActive: boolean;
}

const QuickLinkSchema = new Schema<IQuickLink>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    icon: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const QuickLink: Model<IQuickLink> =
  mongoose.models.QuickLink || mongoose.model<IQuickLink>('QuickLink', QuickLinkSchema);

export default QuickLink;
