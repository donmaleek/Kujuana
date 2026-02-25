import { Profile } from '../models/Profile.model.js';

export const profileRepo = {
  findByUserId: (userId: string) => Profile.findOne({ userId }),
  findById: (id: string) => Profile.findById(id),
};
