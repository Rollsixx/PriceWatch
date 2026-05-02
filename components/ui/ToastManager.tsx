// components/ui/ToastManager.tsx
// Listens to notification store and shows toast when new alert arrives

import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNotificationStore } from '../../store/useNotificationStore';
import Toast from './Toast';
import { PriceDropAlert } from '../../types';

export default function ToastManager() {
  const alerts = useNotificationStore((state) => state.alerts);
  const [activeToast, setActiveToast] = useState<PriceDropAlert | null>(null);
  const lastAlertIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (alerts.length === 0) return;

    const latestAlert = alerts[0]; // Alerts are prepended, so [0] is newest

    // Only show toast if this is a new alert we haven't shown yet
    if (latestAlert.id !== lastAlertIdRef.current && !latestAlert.read) {
      lastAlertIdRef.current = latestAlert.id;
      setActiveToast(latestAlert);
    }
  }, [alerts]);

  if (!activeToast) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Toast
        productName={activeToast.productName}
        dropPercent={activeToast.dropPercent}
        message={`$${activeToast.newPrice.toFixed(2)}`}
        onDismiss={() => setActiveToast(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
});