export const OCCUPATIONS = [
  'Accountant',
  'Architect',
  'Business Owner',
  'Civil Servant',
  'Doctor',
  'Engineer',
  'Entrepreneur',
  'Farmer',
  'Finance Professional',
  'IT Professional',
  'Journalist',
  'Lawyer',
  'Nurse',
  'Pharmacist',
  'Project Manager',
  'Sales & Marketing',
  'Student',
  'Teacher / Lecturer',
  'Other',
] as const;

export type Occupation = (typeof OCCUPATIONS)[number];
