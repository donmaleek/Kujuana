import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/lib/config/theme';
import { humanize } from '@/lib/utils/format';

interface ChoiceChipsProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  maxSelect?: number;
}

export function ChoiceChips({
  options,
  selected,
  onChange,
  multiple = true,
  maxSelect,
}: ChoiceChipsProps) {
  function toggle(value: string) {
    const alreadySelected = selected.includes(value);
    if (alreadySelected) {
      onChange(selected.filter((item) => item !== value));
      return;
    }

    if (!multiple) {
      onChange([value]);
      return;
    }

    if (maxSelect && selected.length >= maxSelect) return;

    onChange([...selected, value]);
  }

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = selected.includes(option);

        return (
          <Pressable
            key={option}
            onPress={() => toggle(option)}
            style={[styles.chip, isActive && styles.activeChip]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>{humanize(option)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeChip: {
    borderColor: '#F0D38E',
    backgroundColor: '#E3C16F',
  },
  label: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 13,
  },
  activeLabel: {
    fontFamily: theme.font.sansBold,
    color: '#1C102D',
  },
});
