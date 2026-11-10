/**
 * Miniature Equalizer Component for Ambient Sound Toggle
 *
 * Requirements:
 * - Miniature animated equalizer with violet bars (#8B5CF6).
 * - Only moves when isPlaying is true; rests static when paused/muted.
 * - Smooth UI-thread animations (Reanimated).
 * - Respects Reduce Motion accessibility preference.
 */
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated'
import { Colors } from '@/theme/tokens'

interface EqualizerIconProps {
  isPlaying: boolean
  size?: number
  color?: string
}

const BAR_WIDTH = 3
const MAX_BAR_HEIGHT = 16
const MIN_BAR_HEIGHT = 4

const EqualizerBar: React.FC<{
  isPlaying: boolean
  targetHeights: number[]
  duration: number
  color: string
}> = ({ isPlaying, targetHeights, duration, color }) => {
  const height = useSharedValue(MIN_BAR_HEIGHT)

  useEffect(() => {
    if (isPlaying) {
      const sequence = targetHeights.map((h) =>
        withTiming(h, {
          duration: duration / targetHeights.length,
          easing: Easing.inOut(Easing.ease),
        })
      )
      height.value = withRepeat(
        withSequence(...sequence),
        -1,
        true
      )
    } else {
      cancelAnimation(height)
      height.value = withTiming(MIN_BAR_HEIGHT, { duration: 250 })
    }

    return () => {
      cancelAnimation(height)
    }
  }, [isPlaying, targetHeights, duration, height])

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }))

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  )
}

export const EqualizerIcon: React.FC<EqualizerIconProps> = ({
  isPlaying,
  size = 20,
  color = Colors.violet,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <EqualizerBar
        isPlaying={isPlaying}
        targetHeights={[8, 14, 6, 12]}
        duration={600}
        color={color}
      />
      <EqualizerBar
        isPlaying={isPlaying}
        targetHeights={[16, 6, 15, 8]}
        duration={520}
        color={color}
      />
      <EqualizerBar
        isPlaying={isPlaying}
        targetHeights={[10, 16, 7, 13]}
        duration={640}
        color={color}
      />
      <EqualizerBar
        isPlaying={isPlaying}
        targetHeights={[5, 11, 4, 10]}
        duration={480}
        color={color}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
    minHeight: MIN_BAR_HEIGHT,
  },
})
