export const COLORS = {
  purpleDeepest: '#18021F',
  purpleDark: '#2A0838',
  purpleRoyal: '#3B0F4F',
  purpleMid: '#4A1663',
  purpleLight: '#5C2278',
  goldRich: '#C9A227',
  goldPrimary: '#D4AF37',
  goldChampagne: '#E8D27C',
  goldGlow: '#F5E6B3',
  white: '#FFFFFF',
  offWhite: '#F9F4ED',
  textBody: '#EDE0C4',
  textMuted: '#C4A882',
  success: '#67D98F',
  danger: '#F08282',
  panel: 'rgba(32, 10, 43, 0.88)',
  panelSoft: 'rgba(47, 16, 63, 0.72)',
  stroke: 'rgba(212, 175, 55, 0.26)',
  strokeSoft: 'rgba(212, 175, 55, 0.14)',
} as const;

export const GRADIENTS = {
  screen: ['#4A1663', '#2A0838', '#18021F'] as const,
  card: ['rgba(74, 22, 99, 0.82)', 'rgba(24, 2, 31, 0.92)'] as const,
  gold: ['#E8D27C', '#D4AF37', '#C9A227'] as const,
  goldSoft: ['#F5E6B3', '#E8D27C', '#D4AF37'] as const,
} as const;

export const FONT = {
  bodyLight: 'Jost_300Light',
  body: 'Jost_400Regular',
  bodyMedium: 'Jost_500Medium',
  bodySemiBold: 'Jost_600SemiBold',
  display: 'CormorantGaramond_600SemiBold',
  displayBold: 'CormorantGaramond_700Bold',
} as const;

export const RADIUS = {
  xl: 22,
  lg: 18,
  md: 14,
  pill: 999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  glow: {
    shadowColor: '#D4AF37',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;
