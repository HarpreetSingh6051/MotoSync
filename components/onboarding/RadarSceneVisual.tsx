import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import Svg, { Line, Circle } from 'react-native-svg'
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'
import { Radio } from 'lucide-react-native'

export const RadarSceneVisual: React.FC = () => {
  const reduceMotion = useReducedMotion()

  const pulse1 = useSharedValue(0)
  const pulse2 = useSharedValue(0)
  const sweepAngle = useSharedValue(0)
  const pinBob = useSharedValue(0)

  useEffect(() => {
    if (reduceMotion) {
      pulse1.value = 0.6
      pulse2.value = 0.8
      return
    }

    // Concentric radar wave pulses
    pulse1.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
      -1,
      false
    )

    pulse2.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
      -1,
      false
    )

    // Sweep rotation
    sweepAngle.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    )

    // Gentle pin float
    pinBob.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
  }, [reduceMotion])

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse1.value, [0, 1], [0.3, 1.2]) }],
    opacity: interpolate(pulse1.value, [0, 0.4, 1], [0.8, 0.5, 0]),
  }))

  const wave2Style = useAnimatedStyle(() => {
    const adjusted = (pulse2.value + 0.5) % 1
    return {
      transform: [{ scale: interpolate(adjusted, [0, 1], [0.3, 1.2]) }],
      opacity: interpolate(adjusted, [0, 0.4, 1], [0.8, 0.5, 0]),
    }
  })

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweepAngle.value}deg` }],
  }))

  const pinFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pinBob.value }],
  }))

  return (
    <View style={styles.container}>
      {/* Radar Coordinate Frame */}
      <View style={styles.radarFrame}>
        {/* Wireframe concentric rings */}
        <View style={[styles.ring, styles.ringOuter]} />
        <View style={[styles.ring, styles.ringMid]} />
        <View style={[styles.ring, styles.ringInner]} />

        {/* Crosshair grid lines */}
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />

        {/* Animated Expanding Pulses */}
        <Animated.View style={[styles.pulseWave, wave1Style]} />
        <Animated.View style={[styles.pulseWave, styles.pulseWaveViolet, wave2Style]} />

        {/* Rotating Radar Sweep Line */}
        {!reduceMotion && (
          <Animated.View style={[styles.sweepContainer, sweepStyle]}>
            <View style={styles.sweepLine} />
          </Animated.View>
        )}

        {/* Connecting Mesh Lines between Riders */}
        <Svg style={StyleSheet.absoluteFill}>
          {/* Wireframe connection lines */}
          <Line
            x1="130"
            y1="60"
            x2="65"
            y2="140"
            stroke="rgba(16, 177, 251, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <Line
            x1="130"
            y1="60"
            x2="195"
            y2="150"
            stroke="rgba(139, 92, 246, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <Line
            x1="65"
            y1="140"
            x2="140"
            y2="200"
            stroke="rgba(16, 185, 129, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <Line
            x1="195"
            y1="150"
            x2="140"
            y2="200"
            stroke="rgba(16, 177, 251, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </Svg>

        {/* Rider Pin 1: Kabir (Lead - Blue) */}
        <Animated.View
          style={[styles.riderPin, { top: 48, left: 118 }, pinFloatStyle]}
        >
          <View style={[styles.pinDot, styles.pinBlue]} />
          <View style={styles.pinTag}>
            <Text style={styles.pinTagText}>Kabir • Lead</Text>
          </View>
        </Animated.View>

        {/* Rider Pin 2: Rohan (Violet) */}
        <Animated.View
          style={[styles.riderPin, { top: 128, left: 52 }, pinFloatStyle]}
        >
          <View style={[styles.pinDot, styles.pinViolet]} />
          <View style={styles.pinTag}>
            <Text style={styles.pinTagText}>Rohan</Text>
          </View>
        </Animated.View>

        {/* Rider Pin 3: Aarav (Violet) */}
        <Animated.View
          style={[styles.riderPin, { top: 138, left: 182 }, pinFloatStyle]}
        >
          <View style={[styles.pinDot, styles.pinViolet]} />
          <View style={styles.pinTag}>
            <Text style={styles.pinTagText}>Aarav</Text>
          </View>
        </Animated.View>

        {/* Rider Pin 4: Vikram (Sweep - Green) */}
        <Animated.View
          style={[styles.riderPin, { top: 188, left: 128 }, pinFloatStyle]}
        >
          <View style={[styles.pinDot, styles.pinGreen]} />
          <View style={styles.pinTag}>
            <Text style={styles.pinTagText}>Vikram • Sweep</Text>
          </View>
        </Animated.View>

        {/* Center Origin Dot */}
        <View style={styles.centerOrigin}>
          <View style={styles.centerOriginCore} />
        </View>
      </View>

      {/* Hardware Telemetry Badge */}
      <View style={styles.telemetryBadge}>
        <Radio size={12} color={Colors.blue} />
        <Text style={styles.telemetryText}>RADAR ACTIVE • 12 RIDERS IN 5 KM</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Spacing.sm,
  },
  radarFrame: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#04070D',
    borderWidth: 1,
    borderColor: 'rgba(16, 177, 251, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ringOuter: {
    width: 220,
    height: 220,
  },
  ringMid: {
    width: 150,
    height: 150,
    borderColor: 'rgba(16, 177, 251, 0.15)',
  },
  ringInner: {
    width: 80,
    height: 80,
  },
  crosshairH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  crosshairV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  pulseWave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.blue,
  },
  pulseWaveViolet: {
    borderColor: Colors.violet,
  },
  sweepContainer: {
    position: 'absolute',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sweepLine: {
    width: 2,
    height: 130,
    backgroundColor: Colors.blue,
    opacity: 0.6,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  centerOrigin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 177, 251, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOriginCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.blue,
  },
  riderPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  pinBlue: {
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  pinViolet: {
    backgroundColor: Colors.violet,
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  pinGreen: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  pinTag: {
    backgroundColor: 'rgba(14, 20, 34, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    marginTop: 3,
  },
  pinTagText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 9,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    marginTop: Spacing.md,
  },
  telemetryText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 11,
    color: Colors.blue,
    letterSpacing: 0.8,
  },
})
