import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import {
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  logout,
} from '../../services/authService';
import StateDebugPanel from '../../components/ui/StateDebugPanel';
import { COLORS, GOOGLE_WEB_CLIENT_ID } from '../../constants';

WebBrowser.maybeCompleteAuthSession();

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const alertCount = useNotificationStore((s) => s.alerts.length);
  const totalSaved = useWishlistStore((s) =>
    s.items.reduce((sum, item) => sum + item.currentPrice, 0)
  );

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      signInWithGoogle(id_token).catch((err: any) => {
        Alert.alert('Error', err.message);
      });
    }
  }, [googleResponse]);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        if (!displayName) {
          Alert.alert('Error', 'Please enter your name');
          return;
        }
        await registerWithEmail(email, password, displayName);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  }

  if (isAuthenticated && user) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user.displayName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user.displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricNumber}>{wishlistCount}</Text>
              <Text style={styles.metricLabel}>Wishlisted</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricNumber}>{alertCount}</Text>
              <Text style={styles.metricLabel}>Alerts</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricNumber}>${totalSaved.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Total Value</Text>
            </View>
          </View>
        </View>

        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="💬"
            label="About"
            onPress={() => router.push('/(stack)/about')}
          />
          <QuickAction
            icon="🔔"
            label="Notifications"
            onPress={() => router.push('/(modals)/notifications')}
          />
          <QuickAction
            icon="📊"
            label="All Alerts"
            onPress={() => router.push('/(modals)/notifications')}
          />
          <QuickAction
            icon="🚪"
            label="Sign Out"
            danger
            onPress={handleLogout}
          />
        </View>

        <StateDebugPanel />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/Logo profile.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoTitle}>PriceWatch</Text>
        </View>

        <Text style={styles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin
            ? 'Sign in to access your wishlist'
            : 'Sign up to start saving products'}
        </Text>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={COLORS.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitText}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => googlePromptAsync()}
        >
          <Text style={styles.googleButtonText}>G  Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, danger && styles.actionCardDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text
        style={[styles.actionLabel, danger && styles.actionLabelDanger]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  dashboardCard: {
    width: '100%',
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  dashboardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    width: '100%',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.glass,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    flexGrow: 1,
  },
  actionCardDanger: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderColor: COLORS.secondary,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionLabelDanger: {
    color: COLORS.secondary,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 28,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  submitButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  submitText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  googleButton: {
    width: '100%',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButtonText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
