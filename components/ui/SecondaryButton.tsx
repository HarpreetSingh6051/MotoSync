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
import { Colors, Radii, Spacing, TouchTargets, Motion, Typography } from '@/theme/tokens'
import { triggerHaptic } from '@/lib/haptics'
import { useReducedMotion } from '@/lib/motion'

export interface SecondaryButtonProps extends PressableProps {
  title: string
  loading?: boolean
  icon?: React.ReactNode
  variant?: 'glass' | 'ghost' | 'danger'
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  loading = false,
  icon,
  variant = 'glass',
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

  const isDanger = variant === 'danger'
  const isGhost = variant === 'ghost'

  const containerStyle = [
    styles.button,
    variant === 'glass' && styles.glass,
    isGhost && styles.ghost,
    isDanger && styles.danger,
    (disabled || loading) && styles.disabled,
    animatedStyle,
    style,
  ]

  const textColor = isDanger
    ? Colors.red
    : isGhost
    ? Colors.blue
    : Colors.text

  return (
    <AnimatedPressable
      style={containerStyle}
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
  button: {
    height: TouchTargets.secondaryButtonHeight,
    borderRadius: Radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.redSoft,
    borderWidth: 1,
    borderColor: Colors.redBorder,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    ...Typography.headline,
    fontSize: 15,
    fontWeight: '600',
  },
})
