import type { IProfileDocument } from '../../models/Profile.model.js';

/**
 * VIP-tier strict filters and private field access rules.
 * Applies additional qualitative filters beyond hard preferences.
 */
export const vipFilterService = {
  async applyVipFilters(
    seeker: IProfileDocument,
    candidates: IProfileDocument[],
  ): Promise<IProfileDocument[]> {
    return candidates.filter((c) => {
      // Require profile completeness >= 90%
      if (c.completeness.overall < 90) return false;

      // Require vision section filled
      if (!c.completeness.vision) return false;

      // Require at least 3 photos
      if (c.photos.length < 3) return false;

      return true;
    });
  },

  /**
   * Determines if a given viewer tier can access private photos of a target.
   */
  canAccessPrivatePhotos(viewerTier: string, targetUserId: string, viewerUserId: string): boolean {
    if (viewerTier === 'vip') return true;
    if (viewerTier === 'priority') return true;
    // Standard users can only see non-private photos
    return false;
  },
};
