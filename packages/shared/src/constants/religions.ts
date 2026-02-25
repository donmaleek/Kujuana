export const RELIGIONS = [
  'Islam',
  'Christianity',
  'Catholicism',
  'Protestantism',
  'Orthodox Christianity',
  'Other',
] as const;

export const ISLAM_SECTS = ['Sunni', 'Shia', 'Sufi', 'Ibadi', 'Other'] as const;

export type Religion = (typeof RELIGIONS)[number];
export type IslamSect = (typeof ISLAM_SECTS)[number];
