import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'
import { MapPin, Gauge, Navigation } from 'lucide-react-native'

export const RideSyncSceneVisual: React.FC = () => {
  const reduceMotion = useReducedMotion()

  const glideProgress = useSharedValue(reduceMotion ? 0.7 : 0)
  const beaconPulse = useSharedValue(0.4)

  useEffect(() => {
    if (reduceMotion) {
      glideProgress.value = 0.7
      beaconPulse.value = 0.8
      return
    }

    // Riders gliding continuously along the route
    glideProgress.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )

    // Waypoint beacon pulse
    beaconPulse.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [reduceMotion])

  // Rider 1 (Lead - Blue) trajectory
  const rider1Style = useAnimatedStyle(() => {
    const p = glideProgress.value
    // Quadratic path approximation from start (40, 190) -> (100, 110) -> (175, 45)
    const x = interpolate(p, [0, 0.5, 1], [40, 105, 172])
    const y = interpolate(p, [0, 0.5, 1], [195, 115, 52])
    return {
      transform: [{ translateX: x }, { translateY: y }],
    }
  })

  // Rider 2 (Wing - Violet) trajectory (offset slightly behind)
  const rider2Style = useAnimatedStyle(() => {
    const p = Math.max(0, glideProgress.value * 0.9)
    const x = interpolate(p, [0, 0.5, 1], [30, 88, 158])
    const y = interpolate(p, [0, 0.5, 1], [215, 138, 70])
    return {
      transform: [{ translateX: x }, { translateY: y }],
    }
  })

  // Rider 3 (Sweep - Green) trajectory (further behind)
  const rider3Style = useAnimatedStyle(() => {
    const p = Math.max(0, glideProgress.value * 0.8)
    const x = interpolate(p, [0, 0.5, 1], [20, 72, 144])
    const y = interpolate(p, [0, 0.5, 1], [235, 160, 88])
    return {
      transform: [{ translateX: x }, { translateY: y }],
    }
  })

  const beaconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(beaconPulse.value, [0.4, 1], [0.85, 1.25]) }],
    opacity: interpolate(beaconPulse.value, [0.4, 1], [0.8, 0.1]),
  }))

  return (
    <View style={styles.container}>
      {/* Route & Waypoint Canvas Frame */}
      <View style={styles.canvasFrame}>
        {/* Background Grid Pattern */}
        <Svg width="260" height="240" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="routeGradient" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor={Colors.blue} stopOpacity="0.8" />
              <Stop offset="0.6" stopColor={Colors.violet} stopOpacity="0.8" />
              <Stop offset="1" stopColor={Colors.blue} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Faint topographic grid lines */}
          <Path
            d="M 10 40 Q 130 30 250 40"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M 10 110 Q 130 90 250 120"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M 10 180 Q 130 160 250 190"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            fill="none"
          />

          {/* Route Base Curve (Wide Dark Asphalt) */}
          <Path
            d="M 35 220 Q 95 130 180 50"
            stroke="#131D2E"
            strokeWidth="24"
            strokeLinecap="round"
            fill="none"
          />

          {/* Glowing Center Route Line */}
          <Path
            d="M 35 220 Q 95 130 180 50"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeDasharray="6 4"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        {/* Meeting Waypoint Beacon Pin */}
        <View style={styles.waypointBeacon}>
          <Animated.View style={[styles.beaconWave, beaconStyle]} />
          <View style={styles.waypointPin}>
            <MapPin size={16} color="#000000" fill={Colors.blue} />
          </View>
          <View style={styles.waypointBadge}>
            <Text style={styles.waypointBadgeText}>POINT BRAVO</Text>
          </View>
        </View>

        {/* Animated Rider 1 (Lead - Blue) */}
        <Animated.View style={[styles.riderMarker, rider1Style]}>
          <View style={[styles.riderDot, styles.dotBlue]} />
          <View style={styles.riderLabel}>
            <Text style={styles.riderLabelText}>Lead • 84 km/h</Text>
          </View>
        </Animated.View>

        {/* Animated Rider 2 (Wing - Violet) */}
        <Animated.View style={[styles.riderMarker, rider2Style]}>
          <View style={[styles.riderDot, styles.dotViolet]} />
          <View style={styles.riderLabel}>
            <Text style={styles.riderLabelText}>Wing</Text>
          </View>
        </Animated.View>

        {/* Animated Rider 3 (Sweep - Green) */}
        <Animated.View style={[styles.riderMarker, rider3Style]}>
          <View style={[styles.riderDot, styles.dotGreen]} />
          <View style={styles.riderLabel}>
            <Text style={styles.riderLabelText}>Sweep</Text>
          </View>
        </Animated.View>
      </View>

      {/* Telemetry HUD Mini-Bar */}
      <View style={styles.hudBar}>
        <View style={styles.hudItem}>
          <Gauge size={13} color={Colors.blue} />
          <Text style={styles.hudVal}>84 km/h</Text>
        </View>
        <View style={styles.hudDivider} />
        <View style={styles.hudItem}>
          <Navigation size={13} color={Colors.violet} />
          <Text style={styles.hudVal}>STAGGERED</Text>
        </View>
        <View style={styles.hudDivider} />
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>GAP</Text>
          <Text style={styles.hudVal}>120m</Text>
        </View>
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
  canvasFrame: {
    width: 260,
    height: 240,
    borderRadius: Radii.card,
    backgroundColor: '#04070D',
    borderWidth: 1,
    borderColor: 'rgba(16, 177, 251, 0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  waypointBeacon: {
    position: 'absolute',
    top: 32,
    right: 64,
    alignItems: 'center',
    zIndex: 10,
  },
  beaconWave: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.blue,
    top: -12,
  },
  waypointPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  waypointBadge: {
    backgroundColor: 'rgba(14, 20, 34, 0.9)',
    borderWidth: 1,
    borderColor: Colors.blueBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    marginTop: 4,
  },
  waypointBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: Colors.blue,
    letterSpacing: 0.4,
  },
  riderMarker: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  riderDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#000000',
  },
  dotBlue: {
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  dotViolet: {
    backgroundColor: Colors.violet,
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  dotGreen: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  riderLabel: {
    backgroundColor: 'rgba(7, 10, 16, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radii.pill,
    marginTop: 2,
  },
  riderLabelText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 8,
    color: Colors.text,
  },
  hudBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  hudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hudDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  hudLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 9,
    color: Colors.textMuted,
  },
  hudVal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: Colors.text,
    letterSpacing: 0.3,
  },
})
