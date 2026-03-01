import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GRADIENTS } from '@/lib/theme/tokens';

type AppScreenProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function AppScreen({ children, contentContainerStyle }: AppScreenProps) {
  return (
    <LinearGradient colors={GRADIENTS.screen} style={styles.root}>
      <View style={[styles.bgLayer, styles.nonInteractive]}>
        <View style={styles.orbTop} />
        <View style={styles.orbBottom} />
        <View style={styles.grid} />
      </View>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 112,
    gap: 14,
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  nonInteractive: {
    pointerEvents: 'none',
  },
  orbTop: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    top: -80,
    left: -70,
  },
  orbBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(232, 210, 124, 0.08)',
    bottom: -40,
    right: -90,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderColor: 'rgba(212, 175, 55, 0.04)',
    borderWidth: 0.6,
    borderStyle: 'dashed',
  },
});
