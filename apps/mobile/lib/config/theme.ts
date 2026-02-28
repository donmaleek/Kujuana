import { Platform } from 'react-native';

export const theme = {
  colors: {
    canvas: '#3B0F4F',
    canvasStrong: '#4A1663',
    canvasDeep: '#18021F',
    text: '#EDE0C4',
    textMuted: '#C4A882',
    primary: '#D4AF37',
    primaryDeep: '#C9A227',
    primaryGlow: 'rgba(212, 175, 55, 0.42)',
    secondary: '#5C2278',
    card: 'rgba(255,255,255,0.08)',
    cardStrong: 'rgba(255,255,255,0.14)',
    border: 'rgba(212,175,55,0.32)',
    error: '#FF8FA3',
    errorSurface: 'rgba(255,143,163,0.18)',
    success: '#6EDBB0',
    successSurface: 'rgba(110,219,176,0.18)',
    offWhite: '#F9F4ED',
    purpleDark: '#2A0838',
    purpleLight: '#5C2278',
    goldChampagne: '#E8D27C',
    goldGlow: '#F5E6B3',
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
  },
  font: {
    sans: Platform.select({ ios: 'Jost_400Regular', android: 'Jost_400Regular', default: 'Jost_400Regular' }),
    sansBold: Platform.select({ ios: 'Jost_600SemiBold', android: 'Jost_600SemiBold', default: 'Jost_600SemiBold' }),
    serif: Platform.select({
      ios: 'CormorantGaramond_500Medium',
      android: 'CormorantGaramond_500Medium',
      default: 'CormorantGaramond_500Medium',
    }),
  },
};
