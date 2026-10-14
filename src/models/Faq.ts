import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFaq extends Document {
  category: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    category: { type: String, required: true, trim: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

FaqSchema.index({ category: 1, order: 1 });
FaqSchema.index({ question: 'text', answer: 'text' });

export const Faq: Model<IFaq> =
  mongoose.models.Faq || mongoose.model<IFaq>('Faq', FaqSchema);

export default Faq;
