import type { IScoreBreakdown } from '@kujuana/shared';
import type { CandidateSnapshot } from './hardFilters.js';
import { jaccardSimilarity, ageCompatibilityScore, clamp100 } from './helpers.js';

const WEIGHTS = {
  values: 0.25,
  lifestyle: 0.15,
  location: 0.10,
  religion: 0.20,
  ageCompatibility: 0.10,
  vision: 0.15,
  preferences: 0.05,
} as const;

/**
 * Compute a compatibility score (0-100) and breakdown between two profiles.
 * Both profiles must have already passed hard filters.
 */
export function computeCompatibility(
  seeker: CandidateSnapshot,
  candidate: CandidateSnapshot,
): IScoreBreakdown {
  const seekerAge = getAge(seeker.basic.dateOfBirth);
  const candidateAge = getAge(candidate.basic.dateOfBirth);

  const values = jaccardSimilarity(
    seeker.vision.coreValues,
    candidate.vision.coreValues,
  ) * 100;

  const lifestyle = computeLifestyleScore(seeker, candidate);

  const location =
    seeker.basic.country === candidate.basic.country
      ? 100
      : seeker.preferences.countries.includes(candidate.basic.country)
        ? 60
        : 20;

  const religion =
    seeker.basic.religion === candidate.basic.religion ? 100 : 0;

  const ageCompatibility = ageCompatibilityScore(seekerAge, candidateAge) * 100;

  const vision = jaccardSimilarity(
    seeker.vision.nonNegotiables,
    candidate.vision.nonNegotiables,
  ) * 100;

  const preferences = seeker.preferences.countries.includes(candidate.basic.country)
    ? 100
    : 50;

  const total = clamp100(
    values * WEIGHTS.values +
    lifestyle * WEIGHTS.lifestyle +
    location * WEIGHTS.location +
    religion * WEIGHTS.religion +
    ageCompatibility * WEIGHTS.ageCompatibility +
    vision * WEIGHTS.vision +
    preferences * WEIGHTS.preferences,
  );

  return {
    values: clamp100(values),
    lifestyle: clamp100(lifestyle),
    location: clamp100(location),
    religion: clamp100(religion),
    ageCompatibility: clamp100(ageCompatibility),
    vision: clamp100(vision),
    preferences: clamp100(preferences),
    total,
  };
}

function computeLifestyleScore(a: CandidateSnapshot, b: CandidateSnapshot): number {
  let score = 0;
  let checks = 0;

  // Smoking match
  score += a.basic.maritalStatus === b.basic.maritalStatus ? 100 : 50;
  checks++;

  // Personality trait overlap
  const traitSimilarity = jaccardSimilarity(
    'personalityTraits' in a.basic ? [] : [],
    'personalityTraits' in b.basic ? [] : [],
  );
  score += traitSimilarity * 100;
  checks++;

  return checks > 0 ? score / checks : 0;
}

function getAge(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}
