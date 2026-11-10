import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Colors, Radii, Spacing, TouchTargets, Motion, Typography } from '@/theme/tokens'
import { triggerHaptic } from '@/lib/haptics'
import { useReducedMotion } from '@/lib/motion'

export interface HapticTabProps extends PressableProps {
  label: string
  active?: boolean
  icon: React.ReactNode
  badgeCount?: number
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const HapticTab: React.FC<HapticTabProps> = ({
  label,
  active = false,
  icon,
  badgeCount,
  style,
  onPress,
  ...props
}) => {
  const scale = useSharedValue(1)
  const reduceMotion = useReducedMotion()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    triggerHaptic('selection')
    if (!reduceMotion) {
      scale.value = withSpring(Motion.pressScale, Motion.spring)
    }
  }

  const handlePressOut = () => {
    if (!reduceMotion) {
      scale.value = withSpring(1, Motion.spring)
    }
  }

  return (
    <AnimatedPressable
      style={[styles.tab, animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      {...props}
    >
      <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
        {icon}
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.label,
          active ? styles.activeLabel : styles.inactiveLabel,
        ]}
      >
        {label}
      </Text>

      {/* Active Glowing Dot Indicator */}
      {active && <View style={styles.activeDot} />}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  tab: {
    minHeight: TouchTargets.minTouch,
    minWidth: TouchTargets.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  activeIconContainer: {
    transform: [{ scale: 1.05 }],
  },
  label: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: Spacing.xxs,
  },
  activeLabel: {
    color: Colors.blue,
    fontWeight: '700',
  },
  inactiveLabel: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.blue,
    marginTop: Spacing.xxs,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -6,
    backgroundColor: Colors.red,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
})
