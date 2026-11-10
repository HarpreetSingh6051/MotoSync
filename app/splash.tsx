import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { Wheel3DLogo } from '@/components/splash/Wheel3DLogo'
import { Colors, Spacing, Typography } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'

const LETTERS = ['M', 'o', 't', 'o', 'S', 'y', 'n', 'c']

export default function SplashScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ hold?: string; settled?: string; w?: string }>()
  const reduceMotion = useReducedMotion()
  const isSettledParam = params.settled === 'true'
  const forcedWidth = params.w ? parseInt(params.w, 10) : undefined
  const [isReturningUser, setIsReturningUser] = useState(false)

  // Letter opacity animations for staggered reveal
  const letterOpacities = LETTERS.map(() => useSharedValue(reduceMotion || isSettledParam ? 1 : 0))
  const letterTransforms = LETTERS.map(() => useSharedValue(reduceMotion || isSettledParam ? 0 : 12))

  // Tagline animation
  const taglineOpacity = useSharedValue(reduceMotion || isSettledParam ? 1 : 0)
  const taglineTransform = useSharedValue(reduceMotion || isSettledParam ? 0 : 8)

  // Screen exit cross-dissolve
  const screenOpacity = useSharedValue(1)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const checkUserStatus = async () => {
      try {
        const [hasLaunched, onboardingSeen] = await Promise.all([
          AsyncStorage.getItem('motosync_has_launched'),
          AsyncStorage.getItem('motosync_onboarding_seen'),
        ])

        const returning = Boolean(hasLaunched && onboardingSeen)
        setIsReturningUser(returning)

        const totalSplashDuration = returning ? 1100 : 2500

        if (reduceMotion || isSettledParam) {
          taglineOpacity.value = 1
          taglineTransform.value = 0
          letterOpacities.forEach((v) => (v.value = 1))
          letterTransforms.forEach((v) => (v.value = 0))
        } else {
          // Stagger letter reveals
          const letterStartDelay = returning ? 200 : 850
          LETTERS.forEach((_, idx) => {
            const delay = letterStartDelay + idx * (returning ? 30 : 65)
            letterOpacities[idx].value = withDelay(
              delay,
              withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) })
            )
            letterTransforms[idx].value = withDelay(
              delay,
              withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.5)) })
            )
          })

          // Tagline reveal
          const taglineDelay = returning ? 550 : 1450
          taglineOpacity.value = withDelay(
            taglineDelay,
            withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
          )
          taglineTransform.value = withDelay(
            taglineDelay,
            withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
          )
        }

        // Cross-dissolve exit unless hold param is specified
        if (params.hold !== 'true') {
          timer = setTimeout(async () => {
            await AsyncStorage.setItem('motosync_has_launched', 'true')
            screenOpacity.value = withTiming(0, { duration: 300 }, () => {
              if (returning) {
                router.replace('/home' as any)
              } else {
                router.replace('/onboarding')
              }
            })
          }, totalSplashDuration)
        }
      } catch {
        router.replace('/onboarding')
      }
    }

    checkUserStatus()

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [reduceMotion])

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTransform.value }],
  }))

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.root,
        screenAnimatedStyle,
        forcedWidth ? { width: forcedWidth, maxWidth: forcedWidth } : null,
      ]}
    >
      <View style={styles.content}>
        {/* 3D Depth-Rotating Wheel Mark */}
        <Wheel3DLogo size={190} />

        {/* Wordmark Letter-by-Letter Stagger */}
        <View style={styles.wordmarkContainer}>
          {LETTERS.map((char, index) => {
            const isSync = index >= 4
            const animStyle = useAnimatedStyle(() => ({
              opacity: letterOpacities[index].value,
              transform: [{ translateY: letterTransforms[index].value }],
            }))

            return (
              <Animated.Text
                key={`letter-${index}`}
                style={[
                  styles.letter,
                  isSync ? styles.letterSync : styles.letterMoto,
                  animStyle,
                ]}
              >
                {char}
              </Animated.Text>
            )
          })}
        </View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
          <Text style={styles.tagline}>Pack Connected. Ride in Sync.</Text>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background, // Pure #000000 — no white flash
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: Spacing.xl,
  },
  wordmarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  letter: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  letterMoto: {
    color: Colors.text, // Crisp White
  },
  letterSync: {
    color: Colors.blue, // Electric Blue
    textShadowColor: Colors.blueGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  taglineContainer: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
})
