import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'
import { Fuel, CheckCircle2, ArrowRightLeft } from 'lucide-react-native'

interface RiderShare {
  name: string
  role: string
  amount: string
  initials: string
  color: string
}

const RIDERS: RiderShare[] = [
  { name: 'Kabir', role: 'Lead', amount: '₹600', initials: 'KB', color: Colors.blue },
  { name: 'Aryan', role: 'Rider', amount: '₹600', initials: 'AR', color: Colors.violet },
  { name: 'Rohan', role: 'Rider', amount: '₹600', initials: 'RH', color: Colors.violet },
  { name: 'Vikram', role: 'Sweep', amount: '₹600', initials: 'VK', color: Colors.green },
]

export const SplitTankSceneVisual: React.FC = () => {
  const reduceMotion = useReducedMotion()

  const splitProgress = useSharedValue(reduceMotion ? 1 : 0)
  const checkmarkScale = useSharedValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (reduceMotion) {
      splitProgress.value = 1
      checkmarkScale.value = 1
      return
    }

    // Split animation sequence
    splitProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.4)) }),
        withDelay(2200, withTiming(0.85, { duration: 500, easing: Easing.inOut(Easing.ease) })),
        withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.4)) }))
      ),
      -1,
      false
    )

    checkmarkScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.out(Easing.back(2)) }),
        withDelay(2400, withTiming(0.9, { duration: 400 })),
        withDelay(400, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(2)) }))
      ),
      -1,
      false
    )
  }, [reduceMotion])

  const billHeaderStyle = useAnimatedStyle(() => {
    const scale = interpolate(splitProgress.value, [0, 1], [1, 0.94])
    const translateY = interpolate(splitProgress.value, [0, 1], [0, -6])
    return {
      transform: [{ scale }, { translateY }],
    }
  })

  const chipsContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(splitProgress.value, [0, 0.3, 1], [0.3, 0.8, 1])
    return { opacity }
  })

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }))

  return (
    <View style={styles.container}>
      {/* Bill & Split Card Canvas */}
      <View style={styles.cardFrame}>
        {/* Top Receipt Header */}
        <Animated.View style={[styles.receiptHeader, billHeaderStyle]}>
          <View style={styles.receiptTopRow}>
            <View style={styles.fuelBadge}>
              <Fuel size={14} color={Colors.blue} />
              <Text style={styles.receiptCategory}>HIGHWAY DHABA & FUEL</Text>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmount}>₹2,400</Text>
            </View>
          </View>

          {/* Dotted Receipt Tear Line */}
          <View style={styles.tearLine} />
        </Animated.View>

        {/* 4 Splitting Equal Rider Chips */}
        <Animated.View style={[styles.chipsGrid, chipsContainerStyle]}>
          {RIDERS.map((rider, index) => {
            const isLeft = index % 2 === 0
            const chipStyle = useAnimatedStyle(() => {
              const translateX = interpolate(
                splitProgress.value,
                [0, 1],
                [isLeft ? 25 : -25, 0]
              )
              const translateY = interpolate(
                splitProgress.value,
                [0, 1],
                [index < 2 ? 15 : -15, 0]
              )
              const scale = interpolate(splitProgress.value, [0, 1], [0.8, 1])

              return {
                transform: [{ translateX }, { translateY }, { scale }],
              }
            })

            return (
              <Animated.View key={rider.name} style={[styles.chip, chipStyle]}>
                <View style={[styles.riderAvatar, { backgroundColor: rider.color }]}>
                  <Text style={styles.avatarInitials}>{rider.initials}</Text>
                </View>
                <View style={styles.riderDetails}>
                  <Text style={styles.riderName}>{rider.name}</Text>
                  <Text style={styles.riderRole}>{rider.role}</Text>
                </View>
                <View style={styles.riderAmountContainer}>
                  <Text style={styles.riderAmount}>{rider.amount}</Text>
                  <CheckCircle2 size={11} color={Colors.green} />
                </View>
              </Animated.View>
            )
          })}
        </Animated.View>

        {/* Settlement Floating Banner */}
        <Animated.View style={[styles.settledBadge, checkmarkAnimatedStyle]}>
          <CheckCircle2 size={13} color={Colors.green} />
          <Text style={styles.settledText}>EQUAL 4-WAY SPLIT • ALL SETTLED</Text>
        </Animated.View>
      </View>

      {/* Bottom UPI Feature Pill */}
      <View style={styles.upiFeaturePill}>
        <ArrowRightLeft size={13} color={Colors.blue} />
        <Text style={styles.upiFeatureText}>ONE-TAP UPI AUTOPAY • ZERO MATH</Text>
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
  cardFrame: {
    width: 270,
    minHeight: 240,
    borderRadius: Radii.card,
    backgroundColor: '#070A10',
    borderWidth: 1,
    borderColor: 'rgba(16, 177, 251, 0.25)',
    padding: Spacing.md,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptHeader: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  receiptTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fuelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  receiptCategory: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  totalBadge: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 8,
    color: Colors.textMuted,
  },
  totalAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: Colors.blue,
  },
  tearLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: Spacing.xs,
  },
  chipsGrid: {
    width: '100%',
    gap: 8,
    marginTop: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 20, 34, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: Radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 8,
  },
  riderAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 8,
    color: '#000000',
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.text,
  },
  riderRole: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8,
    color: Colors.textMuted,
  },
  riderAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riderAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: Colors.text,
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: Colors.greenBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    marginTop: 6,
  },
  settledText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: Colors.green,
    letterSpacing: 0.3,
  },
  upiFeaturePill: {
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
  upiFeatureText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10,
    color: Colors.blue,
    letterSpacing: 0.6,
  },
})
