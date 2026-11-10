import React from 'react'
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Colors, Radii, TouchTargets, Motion, Shadows } from '@/theme/tokens'
import { triggerHaptic } from '@/lib/haptics'
import { useReducedMotion } from '@/lib/motion'

export interface IconButtonProps extends PressableProps {
  icon: React.ReactNode
  variant?: 'glass' | 'ghost' | 'primary' | 'danger'
  size?: number
  accessibilityLabel: string
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'glass',
  size = TouchTargets.iconButtonSize,
  accessibilityLabel,
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
    if (disabled) return
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

  const containerStyle = [
    styles.button,
    { width: size, height: size, borderRadius: size / 2 },
    variant === 'glass' && styles.glass,
    variant === 'ghost' && styles.ghost,
    variant === 'primary' && [styles.primary, Shadows.blueGlow],
    variant === 'danger' && [styles.danger, Shadows.redGlow],
    disabled && styles.disabled,
    animatedStyle,
    style,
  ]

  return (
    <AnimatedPressable
      style={containerStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      {icon}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  primary: {
    backgroundColor: Colors.blue,
  },
  danger: {
    backgroundColor: Colors.red,
  },
  disabled: {
    opacity: 0.4,
  },
})
