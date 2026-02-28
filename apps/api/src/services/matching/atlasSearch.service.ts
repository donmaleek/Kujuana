import { Profile, type IProfileDocument } from '../../models/Profile.model.js';
import { User } from '../../models/User.model.js';
import type { PipelineStage } from 'mongoose';

/**
 * Uses MongoDB Atlas Search to retrieve candidate pool for a given seeker.
 * Falls back to a regular Mongoose query in test/dev if Atlas Search is unavailable.
 */
export const atlasSearchService = {
  async getCandidatePool(seekerProfile: IProfileDocument): Promise<IProfileDocument[]> {
    const { preferences } = seekerProfile;
    // Prefer canonical gender field; fall back to legacy basic.gender if not yet synced.
    const seekerGender = seekerProfile.gender ?? (seekerProfile.basic as any)?.gender;
    const targetGender = seekerGender === 'male' ? 'female' : 'male';

    // Atlas Search $search aggregation (compound query)
    const pipeline: PipelineStage[] = [
      {
        $search: {
          index: 'profile_search',
          compound: {
            must: [
              { equals: { path: 'basic.gender', value: targetGender } },
              { equals: { path: 'isSubmitted', value: true } },
            ],
            should: [
              {
                text: {
                  query: (preferences as any).countries ?? [],
                  path: 'basic.country',
                  score: { boost: { value: 2 } },
                },
              },
            ],
          },
        },
      },
      { $match: { userId: { $ne: seekerProfile.userId } } },
      { $limit: 200 },
    ];

    try {
      const candidates = (await Profile.aggregate(pipeline)) as unknown as IProfileDocument[];
      return filterToMemberCandidates(candidates);
    } catch {
      // Fallback for local dev without Atlas Search
      const candidates = await Profile.find({
        userId: { $ne: seekerProfile.userId },
        'basic.gender': targetGender,
        isSubmitted: true,
      }).limit(200);
      return filterToMemberCandidates(candidates);
    }
  },
};

async function filterToMemberCandidates(
  candidates: IProfileDocument[],
): Promise<IProfileDocument[]> {
  if (candidates.length === 0) return candidates;

  const candidateIds = Array.from(new Set(candidates.map((candidate) => candidate.userId.toString())));
  const visibleMembers = await User.find({
    _id: { $in: candidateIds },
    role: 'member',
    isActive: true,
    isSuspended: false,
  })
    .select('_id')
    .lean();
  const visibleMemberIds = new Set(visibleMembers.map((user) => user._id.toString()));

  return candidates.filter((candidate) => visibleMemberIds.has(candidate.userId.toString()));
}
