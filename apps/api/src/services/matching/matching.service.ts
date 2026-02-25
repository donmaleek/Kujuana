import { SubscriptionTier } from '@kujuana/shared';
import { atlasSearchService } from './atlasSearch.service.js';
import { scoringService } from './scoring.service.js';
import { vipFilterService } from './vipFilter.service.js';
import { matchRepo } from '../../repositories/match.repo.js';
import { profileRepo } from '../../repositories/profile.repo.js';
import { AppError } from '../../middleware/error.middleware.js';
import { logger } from '../../config/logger.js';

/**
 * Tier-aware matching orchestration.
 * - Standard: top-N scored candidates from Atlas Search
 * - Priority: single best match, instant
 * - VIP: curated shortlist for matchmaker review
 */
export const matchingService = {
  async runStandardMatching(userId: string): Promise<void> {
    const profile = await profileRepo.findByUserId(userId);
    if (!profile?.isSubmitted) throw new AppError('Profile not complete', 400);

    const candidates = await atlasSearchService.getCandidatePool(profile);
    const scored = candidates
      .map((c) => ({ candidate: c, score: scoringService.score(profile, c) }))
      .filter((s) => s.score.total >= 50)
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, 5);

    for (const { candidate, score } of scored) {
      await matchRepo.createMatch({
        userId,
        matchedUserId: candidate.userId.toString(),
        score: score.total,
        scoreBreakdown: score,
        tier: SubscriptionTier.Standard,
      });
    }

    logger.info({ userId, matches: scored.length }, 'Standard matching complete');
  },

  async runPriorityMatching(userId: string): Promise<{
    matchId: string;
    candidatesConsidered: number;
    candidatesFiltered: number;
    topScore: number;
  }> {
    const profile = await profileRepo.findByUserId(userId);
    if (!profile?.isSubmitted) throw new AppError('Profile not complete', 400);

    const candidates = await atlasSearchService.getCandidatePool(profile);
    const scored = candidates
      .map((c) => ({ candidate: c, score: scoringService.score(profile, c) }))
      .sort((a, b) => b.score.total - a.score.total);

    const best = scored[0];
    if (!best) throw new AppError('No suitable matches found', 404);

    const match = await matchRepo.createMatch({
      userId,
      matchedUserId: best.candidate.userId.toString(),
      score: best.score.total,
      scoreBreakdown: best.score,
      tier: SubscriptionTier.Priority,
    });

    return {
      matchId: match._id.toString(),
      candidatesConsidered: candidates.length,
      candidatesFiltered: scored.length,
      topScore: best.score.total,
    };
  },

  async runVipCuration(userId: string): Promise<string[]> {
    const profile = await profileRepo.findByUserId(userId);
    if (!profile?.isSubmitted) throw new AppError('Profile not complete', 400);

    const candidates = await atlasSearchService.getCandidatePool(profile);
    const filtered = await vipFilterService.applyVipFilters(profile, candidates);
    const scored = filtered
      .map((c) => ({ candidate: c, score: scoringService.score(profile, c) }))
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, 10);

    const matchIds: string[] = [];
    for (const { candidate, score } of scored) {
      const match = await matchRepo.createMatch({
        userId,
        matchedUserId: candidate.userId.toString(),
        score: score.total,
        scoreBreakdown: score,
        tier: SubscriptionTier.VIP,
        status: 'pending', // awaits matchmaker review
      });
      matchIds.push(match._id.toString());
    }

    return matchIds;
  },
};
