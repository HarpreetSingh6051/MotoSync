import React, { useEffect } from 'react'
import { StyleSheet, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Colors, Radii } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'

export interface SkeletonProps extends ViewProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Radii.sm,
  style,
  ...props
}) => {
  const opacity = useSharedValue(0.3)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.5
      return
    }

    opacity.value = withRepeat(
      withTiming(0.75, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [reduceMotion])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
})
