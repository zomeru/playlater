import React, { useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ACTION_WIDTH = 80;

interface SwipeableItemProps {
  children: React.ReactNode;
  onWatched: () => void;
  onDelete: () => void;
}

export function SwipeableItem({ children, onWatched, onDelete }: SwipeableItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.setValue(e.translationX);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -ACTION_WIDTH) {
        Animated.timing(translateX, {
          toValue: -ACTION_WIDTH * 2,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      }
    });

  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.successLight }]}
          onPress={() => {
            onWatched();
            Animated.spring(translateX, {
              toValue: 0,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.success} />
          <Text style={[styles.actionText, { color: colors.success }]}>Watched</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.dangerLight }]}
          onPress={() => {
            onDelete();
            Animated.spring(translateX, {
              toValue: 0,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={{ transform: [{ translateX }] }}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.sm },
  actions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: spacing.md,
    gap: spacing.xs,
  },
  action: {
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: 2,
  },
  actionText: { fontSize: 10, fontWeight: '600' },
});
