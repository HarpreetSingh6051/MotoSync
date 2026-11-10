import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Colors } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'

interface PullToRefreshWheelProps {
  refreshing: boolean
  size?: number
}

export const PullToRefreshWheel: React.FC<PullToRefreshWheelProps> = ({
  refreshing,
  size = 32,
}) => {
  const rotation = useSharedValue(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (refreshing && !reduceMotion) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 800, easing: Easing.linear }),
        -1,
        false
      )
    } else {
      rotation.value = 0
    }
  }, [refreshing, reduceMotion])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  if (!refreshing) return null

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.wheel,
          { width: size, height: size, borderRadius: size / 2 },
          animatedStyle,
        ]}
      >
        <View style={styles.outerTire} />
        <View style={styles.neonRim} />
        <View style={styles.spokeH} />
        <View style={styles.spokeV} />
        <View style={styles.centerHub} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 8,
  },
  wheel: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerTire: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: '#1E293B',
  },
  neonRim: {
    position: 'absolute',
    width: '84%',
    height: '84%',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  spokeH: {
    position: 'absolute',
    width: '70%',
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  spokeV: {
    position: 'absolute',
    height: '70%',
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  centerHub: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.blue,
  },
})
