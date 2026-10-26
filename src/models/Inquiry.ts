import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  email: string;
  type: 'coop' | 'edu' | 'general';
  organization?: string;
  content: string;
  agreedPrivacy: boolean;
  status: 'received' | 'sent_smtp' | 'failed_smtp';
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['coop', 'edu', 'general'],
      required: true,
      index: true,
    },
    organization: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    agreedPrivacy: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: ['received', 'sent_smtp', 'failed_smtp'],
      default: 'received',
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// 1년(365일 = 31,536,000초) 후 개인정보 자동 파기 TTL 인덱스 (AC-10 준수)
InquirySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);

export default Inquiry;
