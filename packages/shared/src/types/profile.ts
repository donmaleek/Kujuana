import type {
  SmokingHabit,
  DrinkingHabit,
  DietType,
  ExerciseFrequency,
  ChildrenStatus,
  WantsChildren,
  RelocationWillingness,
} from '../enums/lifestyle.js';
import type { CoreValue, PersonalityTrait } from '../enums/values.js';
import type {
  RelationshipType,
  MarriageTimeline,
  PolygamyStance,
} from '../enums/relationshipTypes.js';
import type {
  EmotionalReadiness,
  CommunicationStyle,
  ConflictResolutionStyle,
} from '../enums/emotionalReadiness.js';

export interface IProfileBasic {
  gender: 'male' | 'female';
  dateOfBirth: Date;
  country: string;
  city: string;
  maritalStatus: 'single' | 'divorced' | 'widowed';
  occupation: string;
  educationLevel: string;
  religion: string;
  sect?: string;
}

export interface IProfileBackground {
  smoking: SmokingHabit;
  drinking: DrinkingHabit;
  diet: DietType;
  exercise: ExerciseFrequency;
  childrenStatus: ChildrenStatus;
  wantsChildren: WantsChildren;
  relocationWillingness: RelocationWillingness;
  personalityTraits: PersonalityTrait[];
  languages: string[];
}

export interface IProfilePhotos {
  photos: IPhoto[];
}

export interface IPhoto {
  publicId: string;
  url?: string; // signed URL, not stored
  isPrivate: boolean;
  order: number;
}

export interface IProfileRelationshipVision {
  relationshipType: RelationshipType;
  marriageTimeline: MarriageTimeline;
  polygamyStance: PolygamyStance;
  coreValues: CoreValue[];
  idealPartnerDescription: string;
  lifeVision: string;
  nonNegotiables: string[];
  emotionalReadiness: EmotionalReadiness;
  communicationStyle: CommunicationStyle;
  conflictResolution: ConflictResolutionStyle;
}

export interface IProfilePreferences {
  ageRange: { min: number; max: number };
  countries: string[];
  religions: string[];
  maritalStatuses: ('single' | 'divorced' | 'widowed')[];
  openToInternational: boolean;
  lifestylePreferences: string[];
}

export type ProfileCompleteness = {
  basic: boolean;
  background: boolean;
  photos: boolean;
  vision: boolean;
  preferences: boolean;
  overall: number; // 0-100
};
