import { Platform } from 'react-native';

export const theme = {
  colors: {
    canvas: '#10061D',
    canvasStrong: '#1A0C2E',
    canvasDeep: '#07030F',
    text: '#F7F1E3',
    textMuted: '#B8A9CD',
    primary: '#FFD700',
    primaryDeep: '#D9A300',
    primaryGlow: 'rgba(255, 215, 0, 0.55)',
    secondary: '#7D57C9',
    card: 'rgba(255,255,255,0.08)',
    cardStrong: 'rgba(255,255,255,0.14)',
    border: 'rgba(255,215,0,0.42)',
    error: '#FF8FA3',
    errorSurface: 'rgba(255,143,163,0.18)',
    success: '#6EDBB0',
    successSurface: 'rgba(110,219,176,0.18)',
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
    sans: Platform.select({ ios: 'AvenirNext-Regular', android: 'sans-serif-medium', default: 'sans-serif' }),
    sansBold: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-black', default: 'sans-serif' }),
    serif: Platform.select({ ios: 'Times New Roman', android: 'serif', default: 'serif' }),
  },
};
