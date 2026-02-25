import { Payment } from '../models/Payment.model.js';

export const paymentRepo = {
  findByIdempotencyKey: (key: string) => Payment.findOne({ idempotencyKey: key }),
  findPendingByIdempotencyKey: (key: string) =>
    Payment.findOne({ idempotencyKey: key, status: 'pending' }),
  findByInternalRef: (internalRef: string) => Payment.findOne({ internalRef }),
  findByReference: (reference: string) => Payment.findOne({ reference }),
  findByUserId: (userId: string) => Payment.find({ userId }).sort({ createdAt: -1 }),
};
