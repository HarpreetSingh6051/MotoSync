import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
  ActivityIndicator,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Colors, Radii, Spacing, TouchTargets, Motion, Typography } from '@/theme/tokens'
import { triggerHaptic } from '@/lib/haptics'
import { useReducedMotion } from '@/lib/motion'

interface ButtonProps extends PressableProps {
  title: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
  icon?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  icon,
  style,
  onPress,
  disabled,
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

  const isPrimary = variant === 'primary'
  const isDanger = variant === 'danger'
  const isSecondary = variant === 'secondary'

  const buttonStyle = [
    styles.base,
    isPrimary && styles.primary,
    isSecondary && styles.secondary,
    isDanger && styles.danger,
    variant === 'ghost' && styles.ghost,
    disabled && styles.disabled,
    style,
  ]

  const textColor = isPrimary
    ? '#000000'
    : isDanger
    ? '#FFFFFF'
    : isSecondary
    ? Colors.text
    : Colors.blue

  return (
    <AnimatedPressable
      style={[buttonStyle, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: TouchTargets.primaryButtonHeight,
    borderRadius: Radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  primary: {
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  danger: {
    backgroundColor: Colors.red,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    ...Typography.headline,
    fontWeight: '700',
  },
})
