import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const floatingTabBarStyle = {
  position: 'absolute' as const,
  bottom: 16,
  left: 16,
  right: 16,
  height: 56,
  borderRadius: 28,
  backgroundColor: 'rgba(26,26,46,0.96)',
  borderTopWidth: 0,
  elevation: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
  paddingBottom: 0,
  paddingTop: 0,
};

export const floatingTabBarIndicatorStyle = {
  backgroundColor: COLORS.primary,
  height: 3,
  borderRadius: 1.5,
};
