import type {
  IProfileBackground,
  IProfileBasic,
  IProfilePreferences,
  IProfileRelationshipVision,
} from '@kujuana/shared';

export interface CandidateSnapshot {
  basic: IProfileBasic;
  background: IProfileBackground;
  preferences: IProfilePreferences;
  vision: IProfileRelationshipVision;
}

/**
 * Returns true if the candidate passes all hard (non-negotiable) filters
 * against the seeker's preferences. A single failed filter eliminates the candidate.
 */
export function passesHardFilters(
  seeker: CandidateSnapshot,
  candidate: CandidateSnapshot,
): boolean {
  const { preferences } = seeker;
  const candidateAge = getAge(candidate.basic.dateOfBirth);

  // Age range
  if (candidateAge < preferences.ageRange.min || candidateAge > preferences.ageRange.max) {
    return false;
  }

  // Gender (opposite gender rule)
  if (seeker.basic.gender === candidate.basic.gender) {
    return false;
  }

  // Country preference
  if (
    !preferences.openToInternational &&
    !preferences.countries.includes(candidate.basic.country)
  ) {
    return false;
  }

  // Religion preference
  const religions = preferences.religions ?? [];
  if (
    religions.length > 0 &&
    !religions.includes(candidate.basic.religion)
  ) {
    return false;
  }

  // Marital status preference
  const maritalStatuses = preferences.maritalStatuses ?? [];
  if (
    maritalStatuses.length > 0 &&
    !maritalStatuses.includes(candidate.basic.maritalStatus)
  ) {
    return false;
  }

  return true;
}

function getAge(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}
