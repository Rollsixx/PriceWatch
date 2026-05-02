// components/ui/EmptyState.tsx
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface Props {
  icon?: string;
  title?: string;
  message?: string;
}

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  message = 'Check back later.',
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});