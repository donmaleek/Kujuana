import { computeCompatibility, passesHardFilters, type CandidateSnapshot } from '@kujuana/scoring';
import type { IProfileDocument } from '../../models/Profile.model.js';
import type { IScoreBreakdown } from '@kujuana/shared';

function toSnapshot(profile: IProfileDocument): CandidateSnapshot {
  return {
    basic: profile.basic as any,
    background: profile.background as any,
    preferences: profile.preferences as any,
    vision: profile.vision as any,
  };
}

export const scoringService = {
  passes(seeker: IProfileDocument, candidate: IProfileDocument): boolean {
    return passesHardFilters(toSnapshot(seeker), toSnapshot(candidate));
  },

  score(seeker: IProfileDocument, candidate: IProfileDocument): IScoreBreakdown {
    return computeCompatibility(toSnapshot(seeker), toSnapshot(candidate));
  },
};
