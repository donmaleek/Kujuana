import { z } from 'zod';
import { SubscriptionTier } from '../enums/tiers.js';
import {
  SmokingHabit,
  DrinkingHabit,
  DietType,
  ExerciseFrequency,
  ChildrenStatus,
  WantsChildren,
  RelocationWillingness,
} from '../enums/lifestyle.js';
import { CoreValue, PersonalityTrait } from '../enums/values.js';
import {
  RelationshipType,
  MarriageTimeline,
  PolygamyStance,
} from '../enums/relationshipTypes.js';
import {
  EmotionalReadiness,
  CommunicationStyle,
  ConflictResolutionStyle,
} from '../enums/emotionalReadiness.js';

export const step1PlanSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier),
});

export const step2BasicSchema = z.object({
  gender: z.enum(['male', 'female']),
  dateOfBirth: z.string().datetime(),
  country: z.string().min(2),
  city: z.string().min(1),
  maritalStatus: z.enum(['single', 'divorced', 'widowed']),
  occupation: z.string().min(1),
  educationLevel: z.string().min(1),
  religion: z.string().min(1),
  sect: z.string().optional(),
});

export const step3BackgroundSchema = z.object({
  smoking: z.nativeEnum(SmokingHabit),
  drinking: z.nativeEnum(DrinkingHabit),
  diet: z.nativeEnum(DietType),
  exercise: z.nativeEnum(ExerciseFrequency),
  childrenStatus: z.nativeEnum(ChildrenStatus),
  wantsChildren: z.nativeEnum(WantsChildren),
  relocationWillingness: z.nativeEnum(RelocationWillingness),
  personalityTraits: z.array(z.nativeEnum(PersonalityTrait)).min(1).max(5),
  languages: z.array(z.string()).min(1),
});

export const step5VisionSchema = z.object({
  relationshipType: z.nativeEnum(RelationshipType),
  marriageTimeline: z.nativeEnum(MarriageTimeline),
  polygamyStance: z.nativeEnum(PolygamyStance),
  coreValues: z.array(z.nativeEnum(CoreValue)).min(1).max(5),
  idealPartnerDescription: z.string().min(50).max(1000),
  lifeVision: z.string().min(50).max(1000),
  nonNegotiables: z.array(z.string()).min(1).max(10),
  emotionalReadiness: z.nativeEnum(EmotionalReadiness),
  communicationStyle: z.nativeEnum(CommunicationStyle),
  conflictResolution: z.nativeEnum(ConflictResolutionStyle),
});

export const step6PreferencesSchema = z.object({
  ageRange: z.object({ min: z.number().min(18), max: z.number().max(80) }),
  countries: z.array(z.string()).min(1),
  religions: z.array(z.string()).min(1),
  maritalStatuses: z.array(z.enum(['single', 'divorced', 'widowed'])).min(1),
  openToInternational: z.boolean(),
  lifestylePreferences: z.array(z.string()),
});

export type Step1Input = z.infer<typeof step1PlanSchema>;
export type Step2Input = z.infer<typeof step2BasicSchema>;
export type Step3Input = z.infer<typeof step3BackgroundSchema>;
export type Step5Input = z.infer<typeof step5VisionSchema>;
export type Step6Input = z.infer<typeof step6PreferencesSchema>;
