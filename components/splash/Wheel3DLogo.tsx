import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { Colors, Radii } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'

export interface Wheel3DLogoProps {
  size?: number
  onAnimationComplete?: () => void
}

export const Wheel3DLogo: React.FC<Wheel3DLogoProps> = ({
  size = 190,
  onAnimationComplete,
}) => {
  const reduceMotion = useReducedMotion()

  const spinProgress = useSharedValue(reduceMotion ? 1 : 0)
  const glowPulse = useSharedValue(0.5)

  useEffect(() => {
    if (reduceMotion) {
      spinProgress.value = 1
      glowPulse.value = 0.8
      onAnimationComplete?.()
      return
    }

    // 3D settle rotation: ease-out cubic
    spinProgress.value = withTiming(
      1,
      { duration: 1600, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished && onAnimationComplete) {
          // Callback after settling
        }
      }
    )

    // Pulsing rim glow loop
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [reduceMotion])

  const wheel3DStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(spinProgress.value, [0, 1], [-70, 0])
    const rotateZ = interpolate(spinProgress.value, [0, 1], [-210, 0])
    const scale = interpolate(spinProgress.value, [0, 1], [0.55, 1])
    const opacity = interpolate(spinProgress.value, [0, 0.25, 1], [0, 1, 1])

    return {
      opacity,
      transform: [
        { perspective: 900 },
        { rotateY: `${rotateY}deg` },
        { rotateZ: `${rotateZ}deg` },
        { scale },
      ],
    }
  })

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0.5, 1], [0.45, 0.95]),
    transform: [{ scale: interpolate(glowPulse.value, [0.5, 1], [0.98, 1.04]) }],
  }))

  const spokes = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324]
  const treads = Array.from({ length: 20 }, (_, i) => i * 18)

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Dynamic Ambient Glow Behind Wheel */}
      <Animated.View
        style={[
          styles.glowBackdrop,
          {
            width: size * 1.15,
            height: size * 1.15,
            borderRadius: (size * 1.15) / 2,
          },
          glowStyle,
        ]}
      />

      {/* 3D Rotating Wheel Assembly */}
      <Animated.View
        style={[
          styles.wheelAssembly,
          { width: size, height: size, borderRadius: size / 2 },
          wheel3DStyle,
        ]}
        accessibilityRole="image"
        accessibilityLabel="MotoSync 3D Wheel Logo"
      >
        {/* Layer 1: Outer Tire Ring (Dark Grippy Rubber) */}
        <View style={styles.tireOuter}>
          {/* Tire Tread Marks along the circumference */}
          {treads.map((deg) => (
            <View
              key={`tread-${deg}`}
              style={[
                styles.treadMark,
                {
                  transform: [{ rotate: `${deg}deg` }, { translateY: -size * 0.47 }],
                },
              ]}
            />
          ))}

          {/* Layer 2: Electric Blue Neon Rim Stripe */}
          <View style={styles.neonBlueRim} />

          {/* Layer 3: Neon Violet Secondary Rim Stripe */}
          <View style={styles.neonVioletRim} />

          {/* Layer 4: Perforated Brake Rotor */}
          <View style={styles.brakeRotor} />

          {/* Layer 5: Radial Alloy Spokes */}
          {spokes.map((deg) => (
            <View
              key={`spoke-${deg}`}
              style={[
                styles.spoke,
                {
                  transform: [{ rotate: `${deg}deg` }],
                },
              ]}
            />
          ))}

          {/* Layer 6: Machined Central Hub */}
          <View style={styles.hubCenter}>
            <View style={styles.hubCore}>
              <View style={styles.hubAxle} />
            </View>
          </View>

          {/* Racing Caliper Accent (Sharp Red) */}
          <View style={styles.caliperAccent}>
            <View style={styles.caliperPad} />
          </View>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowBackdrop: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 177, 251, 0.22)',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 36,
  },
  wheelAssembly: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  tireOuter: {
    width: '100%',
    height: '100%',
    borderRadius: Radii.full,
    backgroundColor: '#0A0C11',
    borderWidth: 14,
    borderColor: '#06080B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  treadMark: {
    position: 'absolute',
    width: 3,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 1,
  },
  neonBlueRim: {
    position: 'absolute',
    width: '94%',
    height: '94%',
    borderRadius: Radii.full,
    borderWidth: 2.5,
    borderColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
  },
  neonVioletRim: {
    position: 'absolute',
    width: '84%',
    height: '84%',
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.violet,
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  brakeRotor: {
    position: 'absolute',
    width: '68%',
    height: '68%',
    borderRadius: Radii.full,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  spoke: {
    position: 'absolute',
    width: '66%',
    height: 2.5,
    backgroundColor: '#263447',
    borderRadius: 1,
  },
  hubCenter: {
    width: '32%',
    height: '32%',
    borderRadius: Radii.full,
    backgroundColor: '#0D131F',
    borderWidth: 3,
    borderColor: 'rgba(16, 177, 251, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  hubCore: {
    width: '54%',
    height: '54%',
    borderRadius: Radii.full,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  hubAxle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  caliperAccent: {
    position: 'absolute',
    top: 6,
    right: 22,
    width: 14,
    height: 28,
    borderRadius: 5,
    backgroundColor: Colors.red,
    transform: [{ rotate: '25deg' }],
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  caliperPad: {
    width: 3,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    opacity: 0.8,
  },
})
