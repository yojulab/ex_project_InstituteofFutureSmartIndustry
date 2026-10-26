import nodemailer from 'nodemailer';
import { getSmtpConfig, getContactMailConfig } from '@/lib/config/env';

export interface SendInquiryMailParams {
  name: string;
  email: string;
  type: 'coop' | 'edu' | 'general';
  organization?: string;
  content: string;
}

const TYPE_LABELS: Record<string, string> = {
  coop: '기관 및 사업 협력',
  edu: '전문 교육 문의',
  general: '일반 문의',
};

/**
 * 공식 문의 메일 SMTP 발송 함수
 * 실패 시 명시적으로 에러를 발생시켜 가짜 성공 메시지를 방지함 (AC-09)
 */
export async function sendInquiryEmail(params: SendInquiryMailParams): Promise<boolean> {
  const smtpConfig = getSmtpConfig();
  const mailConfig = getContactMailConfig();

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
    // 연결 타임아웃 10초
    connectionTimeout: 10000,
  });

  const typeLabel = TYPE_LABELS[params.type] || params.type;

  const mailOptions = {
    from: mailConfig.from,
    to: mailConfig.to,
    replyTo: `${params.name} <${params.email}>`,
    subject: `[진흥원 문의접수] [${typeLabel}] ${params.name}님의 온라인 문의`,
    text: `
[미래스마트산업진흥원 온라인 문의 접수 알림]

■ 접수일시: ${new Date().toLocaleString('ko-KR')}
■ 문의유형: ${typeLabel}
■ 성명/담당자: ${params.name}
■ 이메일: ${params.email}
■ 소속기관/기업: ${params.organization || '(미입력)'}

■ 문의내용:
--------------------------------------------------
${params.content}
--------------------------------------------------

* 본 메일은 미래스마트산업진흥원 누리집 문의하기(/contact) 폼에서 자동 발송되었습니다.
* 발신자 이메일로 바로 회신(Reply)하시면 작성자에게 전달됩니다.
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Inquiry mail sent successfully. MessageId:', info.messageId);
    return true;
  } catch (error) {
    console.error('[SMTP] Failed to send inquiry email:', error);
    throw error;
  }
}
