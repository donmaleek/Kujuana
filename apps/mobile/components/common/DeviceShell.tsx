import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

interface DeviceShellProps extends PropsWithChildren {
  showNotch?: boolean;
}

export function DeviceShell({ children, showNotch = true }: DeviceShellProps) {
  return (
    <View style={styles.stage}>
      <View style={styles.frame}>
        {showNotch ? <View style={styles.notch} /> : null}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  frame: {
    flex: 1,
    borderRadius: 38,
    backgroundColor: 'rgba(0,0,0,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  notch: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 116,
    height: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 2,
  },
  content: {
    flex: 1,
    paddingTop: 22,
  },
});
