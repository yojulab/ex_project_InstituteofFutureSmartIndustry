'use server';

import { headers } from 'next/headers';
import { connectToDatabase } from '@/lib/db';
import { Inquiry } from '@/models/Inquiry';
import { InquirySchema } from '@/lib/validators';
import { sendInquiryEmail } from '@/lib/mail/smtp';

export interface SubmitInquiryState {
  success: boolean;
  message?: string;
  error?: string;
}

// IP별 최근 접수 타임스탬프 메모리 캐시 (간이 레이트리밋: 10분 5회)
const ipRateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const timestamps = (ipRateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= 5) {
    return false;
  }

  timestamps.push(now);
  ipRateLimitMap.set(ip, timestamps);
  return true;
}

export async function submitInquiry(prevState: any, formData: FormData): Promise<SubmitInquiryState> {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const userAgent = headerList.get('user-agent') || '';

  // 1. 봇 방지 검사 (Honeypot)
  const honeypot = formData.get('_hp');
  if (honeypot && String(honeypot).trim() !== '') {
    return {
      success: false,
      error: '비정상적인 요청이 감지되었습니다.',
    };
  }

  // 2. 봇 방지 검사 (제출 소요 시간: 최소 2초 이상)
  const renderTimeStr = formData.get('_ts');
  if (renderTimeStr) {
    const renderTime = parseInt(String(renderTimeStr), 10);
    if (!isNaN(renderTime) && Date.now() - renderTime < 2000) {
      return {
        success: false,
        error: '입력 소요 시간이 너무 짧습니다. 다시 시도해 주십시오.',
      };
    }
  }

  // 3. IP 레이트리밋 검사
  if (!checkRateLimit(ip)) {
    return {
      success: false,
      error: '짧은 시간 동안 너무 많은 문의가 접수되었습니다. 잠시 후 다시 시도해 주십시오.',
    };
  }

  // 4. 입력값 파싱 및 검증
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    type: formData.get('type'),
    organization: formData.get('organization') || undefined,
    content: formData.get('content'),
    agreedPrivacy: formData.get('agreedPrivacy') === 'on' || formData.get('agreedPrivacy') === 'true',
  };

  const parseResult = InquirySchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || '입력값이 올바르지 않습니다.',
    };
  }

  const { name, email, type, organization, content, agreedPrivacy } = parseResult.data;

  // 5. DB 저장 및 메일 발송
  try {
    await connectToDatabase();

    const inquiry = await Inquiry.create({
      name,
      email,
      type,
      organization,
      content,
      agreedPrivacy,
      status: 'received',
      ipAddress: ip,
      userAgent,
    });

    // 6. SMTP 발송 (AC-09: 실패 시 절대 성공 메시지 출력 금지)
    try {
      await sendInquiryEmail({
        name,
        email,
        type,
        organization,
        content,
      });

      inquiry.status = 'sent_smtp';
      await inquiry.save();

      return {
        success: true,
        message: '문의가 성공적으로 접수되었습니다. 담당자 검토 후 신속히 기재해 주신 이메일로 답변드리겠습니다.',
      };
    } catch (smtpError) {
      console.error('[Inquiry Action] SMTP 발송 실패:', smtpError);
      inquiry.status = 'failed_smtp';
      await inquiry.save();

      // 지시서 4.7항 명시 실패 안내 문구 준수
      return {
        success: false,
        error: '발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주시거나 전화/대표메일로 문의 바랍니다.',
      };
    }
  } catch (dbError) {
    console.error('[Inquiry Action] DB 처리 실패:', dbError);
    return {
      success: false,
      error: '문의 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주시거나 대표메일로 문의 바랍니다.',
    };
  }
}
