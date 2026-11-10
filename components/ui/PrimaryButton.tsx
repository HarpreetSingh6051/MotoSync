import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Colors, Radii, Spacing, TouchTargets, Motion, Shadows, Typography } from '@/theme/tokens'
import { triggerHaptic } from '@/lib/haptics'
import { useReducedMotion } from '@/lib/motion'

export interface PrimaryButtonProps extends PressableProps {
  title: string
  loading?: boolean
  icon?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading = false,
  icon,
  style,
  onPress,
  disabled,
  accessibilityLabel,
  ...props
}) => {
  const scale = useSharedValue(1)
  const reduceMotion = useReducedMotion()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (disabled || loading) return
    triggerHaptic('light')
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
      style={[
        styles.button,
        Shadows.blueGlow,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: Boolean(disabled), busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#000000" size="small" />
      ) : (
        <>
          {icon}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: TouchTargets.primaryButtonHeight,
    borderRadius: Radii.button,
    backgroundColor: Colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  disabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    ...Typography.headline,
    color: '#000000',
    fontWeight: '700',
  },
})
