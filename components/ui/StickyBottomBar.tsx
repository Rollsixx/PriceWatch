import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface Action {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface Props {
  actions: Action[];
}

export default function StickyBottomBar({ actions }: Props) {
  return (
    <View style={styles.container}>
      {actions.map((action, i) => {
        const isPrimary = action.variant === 'primary' || !action.variant;
        return (
          <TouchableOpacity
            key={i}
            style={[
              styles.button,
              isPrimary && styles.buttonPrimary,
              action.variant === 'danger' && styles.buttonDanger,
              action.variant === 'secondary' && styles.buttonSecondary,
              actions.length > 1 && { flex: 1 },
            ]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                isPrimary && styles.buttonTextPrimary,
                action.variant === 'danger' && styles.buttonTextDanger,
                action.variant === 'secondary' && styles.buttonTextSecondary,
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  buttonDanger: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonTextPrimary: { color: '#000' },
  buttonTextSecondary: { color: COLORS.textPrimary },
  buttonTextDanger: { color: '#000' },
});
