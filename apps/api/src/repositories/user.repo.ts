import { User } from '../models/User.model.js';

export const userRepo = {
  findById: (id: string) => User.findById(id),
  findByEmail: (email: string) => User.findOne({ email }),
  findByPhone: (phone: string) => User.findOne({ phone }),
};
