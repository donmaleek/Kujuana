import { Match } from '../models/Match.model.js';
import type {
  SubscriptionTier,
  IScoreBreakdown,
  MatchStatus,
} from '@kujuana/shared';

interface CreateMatchInput {
  userId: string;
  matchedUserId: string;
  score: number;
  scoreBreakdown: IScoreBreakdown;
  tier: SubscriptionTier;
  status?: MatchStatus;
}

function normalizePair(userId: string, matchedUserId: string): [string, string] {
  return userId <= matchedUserId
    ? [userId, matchedUserId]
    : [matchedUserId, userId];
}

export const matchRepo = {
  findByUserId: async (userId: string) => {
    const matches = await Match.find({
      $or: [{ userId }, { matchedUserId: userId }],
    }).sort({ createdAt: -1 });

    // Defend against historical [A,B] + [B,A] duplicates.
    const seenPairs = new Set<string>();
    return matches.filter((match) => {
      const pair = normalizePair(
        match.userId.toString(),
        match.matchedUserId.toString(),
      ).join(':');

      if (seenPairs.has(pair)) return false;
      seenPairs.add(pair);
      return true;
    });
  },

  findById: (id: string) => Match.findById(id),

  findByIdForUser: (id: string, userId: string) =>
    Match.findOne({
      _id: id,
      $or: [{ userId }, { matchedUserId: userId }],
    }),

  countByUserId: async (userId: string) => {
    const [result] = await Match.aggregate<{ count: number }>([
      { $match: { $or: [{ userId }, { matchedUserId: userId }] } },
      {
        $project: {
          pairKey: {
            $cond: [
              { $lt: ['$userId', '$matchedUserId'] },
              {
                $concat: [
                  { $toString: '$userId' },
                  ':',
                  { $toString: '$matchedUserId' },
                ],
              },
              {
                $concat: [
                  { $toString: '$matchedUserId' },
                  ':',
                  { $toString: '$userId' },
                ],
              },
            ],
          },
        },
      },
      { $group: { _id: '$pairKey' } },
      { $count: 'count' },
    ]);

    return result?.count ?? 0;
  },

  createMatch: async (input: CreateMatchInput) => {
    const [userId, matchedUserId] = normalizePair(
      input.userId,
      input.matchedUserId,
    );

    const match = await Match.findOneAndUpdate(
      { userId, matchedUserId },
      {
        $setOnInsert: {
          ...input,
          userId,
          matchedUserId,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return match!;
  },

  respondToMatch: async (
    matchId: string,
    respondingUserId: string,
    action: 'accepted' | 'declined',
  ) => {
    // Try atomically as the initiating user side first.
    let match = await Match.findOneAndUpdate(
      { _id: matchId, userId: respondingUserId },
      { $set: { userAction: action } },
      { new: true },
    );

    // Fallback: responding user is the matched side.
    if (!match) {
      match = await Match.findOneAndUpdate(
        { _id: matchId, matchedUserId: respondingUserId },
        { $set: { matchedUserAction: action } },
        { new: true },
      );
    }

    if (!match) return null;

    // Resolve overall status from the latest saved actions.
    const declined = match.userAction === 'declined' || match.matchedUserAction === 'declined';
    const accepted = match.userAction === 'accepted' && match.matchedUserAction === 'accepted';
    const newStatus: MatchStatus = declined ? 'declined' : accepted ? 'accepted' : 'active';

    if (newStatus !== match.status) {
      match = await Match.findByIdAndUpdate(
        match._id,
        { $set: { status: newStatus } },
        { new: true },
      );
    }

    return match;
  },

  findExisting: (userId: string, matchedUserId: string) => {
    const [normalizedUserId, normalizedMatchedUserId] = normalizePair(
      userId,
      matchedUserId,
    );

    return Match.findOne({
      userId: normalizedUserId,
      matchedUserId: normalizedMatchedUserId,
    });
  },
};
