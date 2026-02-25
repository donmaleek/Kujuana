import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/config/theme';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <LinearGradient
        colors={['rgba(227,193,111,0.66)', 'rgba(227,193,111,0.22)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.pickerBorder}
      >
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => onChange(String(itemValue))}
            style={styles.picker}
            dropdownIconColor={theme.colors.text}
          >
            {options.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
      </LinearGradient>
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
  pickerBorder: {
    borderRadius: 12,
    padding: 1.2,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    backgroundColor: 'rgba(10, 4, 18, 0.55)',
    overflow: 'hidden',
  },
  picker: {
    color: theme.colors.text,
  },
});
