import { Payment } from '../models/Payment.model.js';

export const paymentRepo = {
  findByIdempotencyKey: (key: string) => Payment.findOne({ idempotencyKey: key }),
  findByUserId: (userId: string) => Payment.find({ userId }).sort({ createdAt: -1 }),
};
