import { computeCompatibility, passesHardFilters } from '@kujuana/scoring';
import type { CandidateSnapshot } from '@kujuana/scoring';

const maleProfile: CandidateSnapshot = {
  basic: {
    gender: 'male',
    dateOfBirth: new Date('1992-03-15'),
    country: 'KE',
    city: 'Nairobi',
    maritalStatus: 'single',
    occupation: 'Engineer',
    educationLevel: "Bachelor's",
    religion: 'Islam',
  } as any,
  preferences: {
    ageRange: { min: 25, max: 35 },
    countries: ['KE', 'TZ'],
    religions: ['Islam'],
    maritalStatuses: ['single'],
    openToInternational: false,
    lifestylePreferences: [],
  },
  vision: {
    coreValues: ['faith', 'family', 'education'],
    nonNegotiables: ['same religion', 'family oriented'],
  } as any,
};

const femaleProfile: CandidateSnapshot = {
  basic: {
    gender: 'female',
    dateOfBirth: new Date('1995-06-20'),
    country: 'KE',
    city: 'Mombasa',
    maritalStatus: 'single',
    occupation: 'Teacher',
    educationLevel: "Bachelor's",
    religion: 'Islam',
  } as any,
  preferences: {
    ageRange: { min: 28, max: 40 },
    countries: ['KE'],
    religions: ['Islam'],
    maritalStatuses: ['single', 'divorced'],
    openToInternational: false,
    lifestylePreferences: [],
  },
  vision: {
    coreValues: ['faith', 'family', 'community'],
    nonNegotiables: ['same religion', 'family oriented'],
  } as any,
};

describe('passesHardFilters', () => {
  it('passes compatible profiles', () => {
    expect(passesHardFilters(maleProfile, femaleProfile)).toBe(true);
  });

  it('fails same-gender pairing', () => {
    expect(passesHardFilters(maleProfile, { ...maleProfile })).toBe(false);
  });

  it('fails when age out of range', () => {
    const oldProfile = {
      ...femaleProfile,
      basic: { ...femaleProfile.basic, dateOfBirth: new Date('1970-01-01') },
    };
    expect(passesHardFilters(maleProfile, oldProfile as any)).toBe(false);
  });
});

describe('computeCompatibility', () => {
  it('returns a score between 0 and 100', () => {
    const result = computeCompatibility(maleProfile, femaleProfile);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it('gives full religion score for same religion', () => {
    const result = computeCompatibility(maleProfile, femaleProfile);
    expect(result.religion).toBe(100);
  });

  it('gives zero religion score for different religions', () => {
    const christian = {
      ...femaleProfile,
      basic: { ...femaleProfile.basic, religion: 'Christianity' },
    };
    const result = computeCompatibility(maleProfile, christian as any);
    expect(result.religion).toBe(0);
  });
});
