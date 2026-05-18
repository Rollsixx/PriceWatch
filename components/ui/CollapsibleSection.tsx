import { useState, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const anim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = useCallback(() => {
    const toValue = open ? 0 : 1;
    Animated.timing(anim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setOpen(!open);
  }, [open]);

  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
}

export default memo(CollapsibleSection);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
});
