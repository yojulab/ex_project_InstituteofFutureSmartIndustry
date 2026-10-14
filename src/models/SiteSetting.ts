import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSetting extends Document {
  institutionName: string;
  visionStatement: string;
  heroSubText: string;
  phone: string;
  fax: string;
  email: string;
  address: string;
  popularKeywords: string[];
  familySites: { name: string; url: string }[];
  updatedAt: Date;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    institutionName: { type: String, default: '미래스마트산업진흥원' },
    visionStatement: { type: String, default: '대한민국 미래 스마트 제조 및 AI 혁신 생태계를 선도합니다' },
    heroSubText: { type: String, default: '중소·중견기업의 AI 디지털 전환과 미래 신산업 육성을 전방위 지원합니다' },
    phone: { type: String, default: '02-1234-5678' },
    fax: { type: String, default: '02-1234-5679' },
    email: { type: String, default: 'contact@smartindustry.or.kr' },
    address: { type: String, default: '서울특별시 서초구 반포대로 123 미래스마트산업진흥원 본원' },
    popularKeywords: [{ type: String }],
    familySites: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const SiteSetting: Model<ISiteSetting> =
  mongoose.models.SiteSetting || mongoose.model<ISiteSetting>('SiteSetting', SiteSettingSchema);

export default SiteSetting;
