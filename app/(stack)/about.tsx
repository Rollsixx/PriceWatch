// app/(stack)/about.tsx
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { COLORS, GOOGLE_WEB_CLIENT_ID } from '../../constants';

export default function AboutScreen() {
  async function handleShare() {
    try {
      await Share.share({
        message: 'Check out PriceWatch! pricewatch://about',
        title: 'PriceWatch - Track price drops',
      });
    } catch {
      Alert.alert('Error', 'Could not share');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>🛍️</Text>
      <Text style={styles.title}>PriceWatch</Text>
      <Text style={styles.version}>v1.0.0</Text>
      <Text style={styles.tagline}>Wishlist & Price Drop Notifier</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tech Stack</Text>
        <Row label="Framework" value="React Native + Expo SDK 54" />
        <Row label="Navigation" value="Expo Router (Tabs + Stack + Modal + Deep Link)" />
        <Row label="Backend" value="Firebase (Auth + Firestore)" />
        <Row label="State" value="Zustand (4 stores)" />
        <Row label="Local DB" value="SQLite (expo-sqlite)" />
        <Row label="Charts" value="Raw SVG (react-native-svg)" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Algorithm</Text>
        <Row label="Detection" value="Z-score anomaly (threshold: 1.5σ)" />
        <Row label="Buffer" value="Circular buffer (max 30 records)" />
        <Row label="Polling" value="Background every 30s" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deep Links</Text>
        <Text style={styles.deepLinkText}>
          You can reach this screen via:{'\n'}
          <Text style={styles.code}>pricewatch://about{'\n'}</Text>
          Product pages use:{'\n'}
          <Text style={styles.code}>pricewatch://stack/product/{"{id}"}</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareText}>📤 Share PriceWatch</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginTop: 16, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  version: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  tagline: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginBottom: 32 },
  section: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  value: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
  deepLinkText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  code: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  shareText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
