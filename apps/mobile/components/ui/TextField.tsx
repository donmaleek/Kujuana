import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/config/theme';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  error?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  multiline,
  error,
}: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <LinearGradient
        colors={
          error
            ? ['rgba(255,143,163,0.92)', 'rgba(255,143,163,0.42)']
            : ['rgba(227,193,111,0.66)', 'rgba(227,193,111,0.22)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inputBorder}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          style={[styles.input, multiline && styles.multiline, error && styles.errorInput]}
        />
      </LinearGradient>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    fontSize: 14,
  },
  inputBorder: {
    borderRadius: theme.radius.sm,
    padding: 1.2,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(10, 4, 18, 0.55)',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    minHeight: 48,
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 15,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  errorInput: {
    borderColor: 'rgba(255,255,255,0.12)',
  },
  error: {
    color: theme.colors.error,
    fontSize: 12,
    fontFamily: theme.font.sans,
  },
});
