import { Schema, model, type Document, type Types } from 'mongoose';
import { encrypt, decrypt } from '../config/encryption.js';

interface ILocation {
  city: string;
  country: string;
  countryCode: string;
  coordinates: { type: 'Point'; coordinates: [number, number] };
}

interface IPhoto {
  publicId: string;
  url?: string;
  isPrimary?: boolean;
  uploadedAt?: Date;
  isPrivate?: boolean; // legacy compatibility
  order?: number; // legacy compatibility
}

interface ICompleteness {
  basic: boolean;
  background: boolean;
  photos: boolean;
  vision: boolean;
  preferences: boolean;
  overall: number;
}

interface IAgeRange {
  min: number;
  max: number;
}

interface IPreferences {
  ageRange?: IAgeRange;
  countries?: string[];
  lifestyle?: string[];
  religion?: string;
  international?: boolean;
  incomeRange?: string;
  racePreference?: string;
  healthStatus?: string;
  strictAge?: boolean;
  personalityPreference?: string[];
  locationFilter?: { city?: string; radiusKm?: number };
  highlySpecificCriteria?: string;
  // Legacy shape used by existing scoring/onboarding code.
  religions?: string[];
  maritalStatuses?: string[];
  openToInternational?: boolean;
  lifestylePreferences?: string[];
}

export interface IProfileDocument extends Document {
  userId: Types.ObjectId;

  // Canonical profile fields.
  gender?: string;
  age?: number;
  dateOfBirth?: Date;
  location?: ILocation;
  relationshipStatus?: string;
  occupation?: string;
  lifestyle: string[];
  personalityTraits: string[];
  hasChildren: boolean;
  childrenCount: number;
  wantsChildren?: string;
  emotionalReadiness?: string;
  religion?: string;
  photos: IPhoto[];
  relationshipType?: string;
  partnerValues: string[];
  idealPartnerDescription?: string;
  lifeVision?: string;
  nonNegotiables: string[];
  preferences: IPreferences;
  profileCompleteness: number;
  onboardingStep: number;
  onboardingComplete: boolean;
  isActive: boolean;
  isVisible: boolean;
  isPaused: boolean;
  pausedUntil?: Date;
  lastActive: Date;
  lastMatchedAt?: Date;
  matchmakerNote?: string;
  flaggedFor?: string;
  isFlagged: boolean;

  // Legacy compatibility fields still referenced by current services.
  basic: Record<string, unknown>;
  background: Record<string, unknown>;
  vision: Record<string, unknown>;
  completeness: ICompleteness;
  isSubmitted: boolean;
  submittedAt?: Date;

  computeCompleteness(): number;
}

function safeUpperCountryCode(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return 'XX';
  const trimmed = value.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function ageFromDateOfBirth(dateOfBirth?: Date): number | undefined {
  if (!dateOfBirth) return undefined;
  const now = new Date();
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  const dayDiff = now.getUTCDate() - dateOfBirth.getUTCDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
}

const locationSchema = new Schema(
  {
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    countryCode: { type: String, required: true, uppercase: true, length: 2 },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) =>
            v.length === 2 &&
            v[0] !== undefined &&
            v[1] !== undefined &&
            v[0] >= -180 &&
            v[0] <= 180 &&
            v[1] >= -90 &&
            v[1] <= 90,
          message: 'Coordinates must be [longitude, latitude] within valid range',
        },
      },
    },
  },
  { _id: false },
);

const photoSchema = new Schema(
  {
    publicId: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: true },
    order: { type: Number, min: 1 },
  },
  { _id: false },
);

const preferencesSchema = new Schema(
  {
    ageRange: {
      min: { type: Number, min: 18, max: 80 },
      max: { type: Number, min: 18, max: 80 },
    },
    countries: { type: [String], default: [] },
    lifestyle: { type: [String], default: [] },
    religion: { type: String, default: 'any' },
    international: { type: Boolean, default: false },
    incomeRange: { type: String, select: false },
    racePreference: { type: String, select: false },
    healthStatus: { type: String, select: false },
    strictAge: { type: Boolean, default: false },
    personalityPreference: { type: [String], default: [] },
    locationFilter: {
      city: { type: String, trim: true },
      radiusKm: { type: Number, min: 1, max: 500 },
    },
    highlySpecificCriteria: { type: String, maxlength: 1000, trim: true },
    // Legacy compatibility.
    religions: { type: [String], default: [] },
    maritalStatuses: { type: [String], default: [] },
    openToInternational: { type: Boolean, default: false },
    lifestylePreferences: { type: [String], default: [] },
  },
  { _id: false },
);

const profileSchema = new Schema<IProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gender: { type: String, enum: ['male', 'female'] },
    age: { type: Number, min: 18, max: 100 },
    dateOfBirth: { type: Date },
    location: { type: locationSchema },
    relationshipStatus: {
      type: String,
      enum: ['single', 'divorced', 'widowed'],
    },
    occupation: { type: String, trim: true, maxlength: 100 },
    lifestyle: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 8,
        message: 'Maximum 8 lifestyle options',
      },
    },
    personalityTraits: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 6,
        message: 'Maximum 6 personality traits',
      },
    },
    hasChildren: { type: Boolean, default: false },
    childrenCount: { type: Number, default: 0, min: 0, max: 20 },
    wantsChildren: { type: String },
    emotionalReadiness: { type: String },
    religion: { type: String, default: 'prefer-not-to-say' },
    photos: {
      type: [photoSchema],
      default: [],
      validate: {
        validator: (v: IPhoto[]) => v.length <= 6,
        message: 'Maximum 6 photos allowed',
      },
    },
    relationshipType: { type: String },
    partnerValues: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: 'Maximum 5 partner values',
      },
    },
    idealPartnerDescription: { type: String, maxlength: 1000, trim: true },
    lifeVision: { type: String, maxlength: 1000, trim: true },
    nonNegotiables: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: 'Maximum 10 non-negotiables',
      },
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    onboardingStep: { type: Number, default: 1, min: 1, max: 6 },
    onboardingComplete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    isPaused: { type: Boolean, default: false },
    pausedUntil: { type: Date },
    lastActive: { type: Date, default: Date.now },
    lastMatchedAt: { type: Date },
    matchmakerNote: { type: String, select: false },
    flaggedFor: { type: String, select: false },
    isFlagged: { type: Boolean, default: false, select: false },

    // Legacy compatibility shape.
    basic: { type: Schema.Types.Mixed, default: {} },
    background: { type: Schema.Types.Mixed, default: {} },
    vision: { type: Schema.Types.Mixed, default: {} },
    completeness: {
      basic: { type: Boolean, default: false },
      background: { type: Boolean, default: false },
      photos: { type: Boolean, default: false },
      vision: { type: Boolean, default: false },
      preferences: { type: Boolean, default: false },
      overall: { type: Number, default: 0, min: 0, max: 100 },
    },
    isSubmitted: { type: Boolean, default: false },
    submittedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

profileSchema.index({ 'location.coordinates': '2dsphere' });
profileSchema.index({ isActive: 1, gender: 1, onboardingComplete: 1 });
profileSchema.index({ isActive: 1, 'location.countryCode': 1 });
profileSchema.index({ onboardingStep: 1, onboardingComplete: 1 });
profileSchema.index({ isFlagged: 1 });
profileSchema.index({ lastActive: -1 });
profileSchema.index({ createdAt: -1 });
// Legacy indexes used by current matching/search flow.
profileSchema.index({ 'basic.country': 1, 'basic.gender': 1 });
profileSchema.index({ isSubmitted: 1, 'completeness.overall': -1 });

profileSchema.virtual('primaryPhoto').get(function (this: IProfileDocument) {
  return this.photos.find((p) => p.isPrimary) ?? this.photos[0];
});

profileSchema.methods.computeCompleteness = function computeCompleteness(
  this: IProfileDocument,
): number {
  let score = 0;

  if (this.gender) score += 4;
  if (this.age) score += 4;
  if (this.location?.city) score += 4;
  if (this.relationshipStatus) score += 4;
  if (this.occupation) score += 4;

  if (this.lifestyle.length > 0) score += 5;
  if (this.personalityTraits.length > 0) score += 5;
  if (this.wantsChildren) score += 5;
  if (this.emotionalReadiness) score += 5;

  score += Math.min(this.photos.length, 3) * (20 / 3);

  if (this.relationshipType) score += 4;
  if (this.partnerValues.length > 0) score += 4;
  if (this.idealPartnerDescription) score += 4;
  if (this.lifeVision) score += 4;
  if (this.nonNegotiables.length > 0) score += 4;

  if (this.preferences?.ageRange) score += 5;
  if (this.preferences?.countries && this.preferences.countries.length > 0) score += 5;
  if (this.preferences?.religion || (this.preferences?.religions ?? []).length > 0) score += 5;
  if (
    (this.preferences?.lifestyle && this.preferences.lifestyle.length > 0) ||
    (this.preferences?.lifestylePreferences ?? []).length > 0
  ) {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
};

profileSchema.pre('save', function syncAndCompute(next) {
  const basic = (this.basic ?? {}) as Record<string, unknown>;
  const background = (this.background ?? {}) as Record<string, unknown>;
  const vision = (this.vision ?? {}) as Record<string, unknown>;
  const prefs = (this.preferences ?? {}) as IPreferences;

  // Legacy -> canonical sync.
  if (typeof basic['gender'] === 'string') this.gender = basic['gender'];
  const dob = toDate(basic['dateOfBirth']);
  if (dob) this.dateOfBirth = dob;
  if (this.dateOfBirth) {
    this.age = ageFromDateOfBirth(this.dateOfBirth);
  }
  if (typeof basic['occupation'] === 'string') this.occupation = basic['occupation'];
  if (typeof basic['maritalStatus'] === 'string') {
    this.relationshipStatus = basic['maritalStatus'];
  }
  if (typeof basic['religion'] === 'string') this.religion = basic['religion'];
  const basicCity = typeof basic['city'] === 'string' ? basic['city'] : undefined;
  const basicCountry = typeof basic['country'] === 'string' ? basic['country'] : undefined;
  if ((basicCity && basicCountry) || this.location) {
    this.location = {
      city: basicCity ?? this.location?.city ?? '',
      country: basicCountry ?? this.location?.country ?? '',
      countryCode: this.location?.countryCode ?? safeUpperCountryCode(basicCountry),
      coordinates: this.location?.coordinates ?? { type: 'Point', coordinates: [0, 0] },
    };
  }

  if (Array.isArray(background['personalityTraits'])) {
    this.personalityTraits = background['personalityTraits'].filter(
      (v): v is string => typeof v === 'string',
    );
  }
  if (typeof background['wantsChildren'] === 'string') {
    this.wantsChildren = background['wantsChildren'];
  }
  if (typeof background['childrenStatus'] === 'string') {
    this.hasChildren = background['childrenStatus'] !== 'none';
    if (!this.hasChildren) this.childrenCount = 0;
  }
  const lifestyleParts = [
    background['smoking'],
    background['drinking'],
    background['diet'],
    background['exercise'],
  ].filter((v): v is string => typeof v === 'string');
  if (lifestyleParts.length > 0 && this.lifestyle.length === 0) {
    this.lifestyle = lifestyleParts;
  }

  if (typeof vision['relationshipType'] === 'string') {
    this.relationshipType = vision['relationshipType'];
  }
  if (Array.isArray(vision['coreValues'])) {
    this.partnerValues = vision['coreValues'].filter(
      (v): v is string => typeof v === 'string',
    );
  }
  if (typeof vision['idealPartnerDescription'] === 'string') {
    this.idealPartnerDescription = vision['idealPartnerDescription'];
  }
  if (typeof vision['lifeVision'] === 'string') {
    this.lifeVision = vision['lifeVision'];
  }
  if (Array.isArray(vision['nonNegotiables'])) {
    this.nonNegotiables = vision['nonNegotiables'].filter(
      (v): v is string => typeof v === 'string',
    );
  }
  if (typeof vision['emotionalReadiness'] === 'string') {
    this.emotionalReadiness = vision['emotionalReadiness'];
  }

  if (prefs.openToInternational !== undefined && prefs.international === undefined) {
    prefs.international = prefs.openToInternational;
  }
  if ((prefs.religions ?? []).length > 0 && !prefs.religion) {
    prefs.religion = prefs.religions![0];
  }
  if ((prefs.lifestylePreferences ?? []).length > 0 && !(prefs.lifestyle ?? []).length) {
    prefs.lifestyle = [...prefs.lifestylePreferences!];
  }
  this.preferences = prefs;

  // Canonical -> legacy sync.
  this.basic = {
    ...(this.basic ?? {}),
    gender: this.gender,
    dateOfBirth: this.dateOfBirth,
    country: this.location?.country,
    city: this.location?.city,
    maritalStatus: this.relationshipStatus,
    occupation: this.occupation,
    religion: this.religion,
  };
  this.background = {
    ...(this.background ?? {}),
    personalityTraits: this.personalityTraits,
    wantsChildren: this.wantsChildren,
    childrenStatus: this.hasChildren ? 'have_and_want_more' : 'none',
    smoking: this.lifestyle[0],
    drinking: this.lifestyle[1],
    diet: this.lifestyle[2],
    exercise: this.lifestyle[3],
  };
  this.vision = {
    ...(this.vision ?? {}),
    relationshipType: this.relationshipType,
    coreValues: this.partnerValues,
    idealPartnerDescription: this.idealPartnerDescription,
    lifeVision: this.lifeVision,
    nonNegotiables: this.nonNegotiables,
    emotionalReadiness: this.emotionalReadiness,
  };
  this.preferences = {
    ...(this.preferences ?? {}),
    religions:
      (this.preferences?.religions && this.preferences.religions.length > 0)
        ? this.preferences.religions
        : (this.preferences?.religion && this.preferences.religion !== 'any'
            ? [this.preferences.religion]
            : []),
    openToInternational:
      this.preferences?.openToInternational ?? this.preferences?.international ?? false,
    lifestylePreferences:
      (this.preferences?.lifestylePreferences ?? []).length > 0
        ? this.preferences!.lifestylePreferences
        : this.preferences?.lifestyle ?? [],
  };

  this.profileCompleteness = this.computeCompleteness();
  this.completeness = {
    basic: Boolean(
      this.gender &&
      this.age &&
      this.location?.city &&
      this.relationshipStatus &&
      this.occupation,
    ),
    background: Boolean(
      this.lifestyle.length > 0 &&
      this.personalityTraits.length > 0 &&
      this.wantsChildren &&
      this.emotionalReadiness,
    ),
    photos: this.photos.length >= 3,
    vision: Boolean(
      this.relationshipType &&
      this.partnerValues.length > 0 &&
      this.idealPartnerDescription &&
      this.lifeVision &&
      this.nonNegotiables.length > 0,
    ),
    preferences: Boolean(
      this.preferences?.ageRange &&
      (this.preferences?.countries ?? []).length > 0 &&
      (
        this.preferences?.religion ||
        (this.preferences?.religions ?? []).length > 0
      ) &&
      (
        (this.preferences?.lifestyle ?? []).length > 0 ||
        (this.preferences?.lifestylePreferences ?? []).length > 0
      ),
    ),
    overall: this.profileCompleteness,
  };

  const primaryPhotos = this.photos.filter((p) => p.isPrimary);
  if (primaryPhotos.length === 0 && this.photos.length > 0) {
    const firstPhoto = this.photos[0];
    if (firstPhoto) firstPhoto.isPrimary = true;
  } else if (primaryPhotos.length > 1) {
    this.photos.forEach((p, i) => {
      p.isPrimary = i === 0;
    });
  }

  if (this.completeness.overall === 100 && !this.onboardingComplete) {
    this.onboardingComplete = true;
  }
  if (this.onboardingComplete && !this.isActive) {
    this.isActive = true;
  }
  if (this.onboardingComplete && !this.isSubmitted) {
    this.isSubmitted = true;
  }
  if (this.isSubmitted && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  next();
});

// Sensitive VIP preference fields are stored AES-256-GCM encrypted at rest.
// Format: iv_hex:authTag_hex:encrypted_hex (24:32:variable chars)
const CIPHERTEXT_RE = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/;
const VIP_PREF_FIELDS = ['incomeRange', 'racePreference', 'healthStatus'] as const;

profileSchema.pre('save', function encryptVipPrefs(next) {
  const prefs = this.preferences as Record<string, unknown> | undefined;
  if (!prefs) { next(); return; }

  for (const field of VIP_PREF_FIELDS) {
    const val = prefs[field];
    if (typeof val === 'string' && val && !CIPHERTEXT_RE.test(val)) {
      prefs[field] = encrypt(val);
    }
  }
  next();
});

function decryptVipPrefs(doc: IProfileDocument | null): void {
  if (!doc?.preferences) return;
  const prefs = doc.preferences as unknown as Record<string, unknown>;
  for (const field of VIP_PREF_FIELDS) {
    const val = prefs[field];
    if (typeof val === 'string' && CIPHERTEXT_RE.test(val)) {
      try { prefs[field] = decrypt(val); } catch { /* leave encrypted if key mismatch */ }
    }
  }
}

profileSchema.post('find', function (docs: IProfileDocument[]) {
  docs.forEach(decryptVipPrefs);
});
profileSchema.post('findOne', function (doc: IProfileDocument | null) {
  decryptVipPrefs(doc);
});
profileSchema.post('findOneAndUpdate', function (doc: IProfileDocument | null) {
  decryptVipPrefs(doc);
});

profileSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    if (ret.preferences) {
      delete ret.preferences.incomeRange;
      delete ret.preferences.racePreference;
      delete ret.preferences.healthStatus;
    }
    delete ret.matchmakerNote;
    delete ret.flaggedFor;
    delete ret.isFlagged;
    return ret;
  },
});

export const Profile = model<IProfileDocument>('Profile', profileSchema);
