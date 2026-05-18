import { useRef, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Beauty', 'Books'];

interface Props {
  selected?: string;
  onSelect?: (category: string) => void;
}

function CategoryFilter({ selected = 'All', onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const active = cat === selected;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect?.(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default memo(CategoryFilter);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#000',
  },
});
