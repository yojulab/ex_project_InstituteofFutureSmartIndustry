import { connectToDatabase } from '@/lib/db';
import { AuditLog } from '@/models/AuditLog';
import { Types } from 'mongoose';

export interface RecordAuditParams {
  adminId?: string | Types.ObjectId;
  username: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE';
  targetCollection?: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function recordAuditLog(params: RecordAuditParams): Promise<void> {
  try {
    await connectToDatabase();
    await AuditLog.create({
      adminId: params.adminId ? new Types.ObjectId(params.adminId.toString()) : undefined,
      username: params.username,
      action: params.action,
      targetCollection: params.targetCollection,
      targetId: params.targetId,
      details: params.details,
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'unknown',
    });
  } catch (error) {
    console.error('[AuditLog] Failed to record audit log:', error);
  }
}
