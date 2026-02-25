import { Schema, model, type Document, type Types } from 'mongoose';

export type AuditAction =
  | 'profile_view'
  | 'match_view'
  | 'sensitive_field_access'
  | 'admin_action'
  | 'matchmaker_action'
  | 'suspension'
  | 'unsuspension'
  | 'photo_access';

export interface IAuditLogDocument extends Document {
  actorId: Types.ObjectId;
  actorRole: string;
  targetUserId?: Types.ObjectId;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  { timestamps: true },
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetUserId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = model<IAuditLogDocument>('AuditLog', auditLogSchema);
