import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated'
import { Colors, Spacing, Radii, Typography, TouchTargets, Motion } from '@/theme/tokens'
import { PrimaryButton } from '@/components/ui'
import { triggerHaptic } from '@/lib/haptics'
import { useReducedMotion } from '@/lib/motion'
import { RadarSceneVisual } from '@/components/onboarding/RadarSceneVisual'
import { RideSyncSceneVisual } from '@/components/onboarding/RideSyncSceneVisual'
import { SplitTankSceneVisual } from '@/components/onboarding/SplitTankSceneVisual'
import { ArrowRight, Zap, Shield } from 'lucide-react-native'

interface OnboardingSceneData {
  id: string
  headline: string // Max 4 words
  subline: string  // Max 10 words
  visual: React.ReactNode
}

const SCENES: OnboardingSceneData[] = [
  {
    id: 'radar',
    headline: 'Find your pack',
    subline: 'Connect with nearby rider crews instantly.',
    visual: <RadarSceneVisual />,
  },
  {
    id: 'sync',
    headline: 'Ride in sync',
    subline: 'Live pack telemetry and waypoints.',
    visual: <RideSyncSceneVisual />,
  },
  {
    id: 'split',
    headline: 'Split the tank',
    subline: 'Split fuel and food with one tap.',
    visual: <SplitTankSceneVisual />,
  },
]

interface SceneCardProps {
  scene: OnboardingSceneData
  index: number
  activeIndex: SharedValue<number>
  dragX: SharedValue<number>
  width: number
  reduceMotion: boolean
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  index,
  activeIndex,
  dragX,
  width,
  reduceMotion,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      const isCurrent = Math.round(activeIndex.value) === index
      return {
        opacity: isCurrent ? 1 : 0,
        display: isCurrent ? 'flex' : 'none',
      }
    }

    const dist = Math.abs(index - activeIndex.value)
    // Prevent DOM overflow from offscreen elements
    if (dist >= 1.05) {
      return {
        opacity: 0,
        display: 'none',
      }
    }

    const offset = (index - activeIndex.value) * width + dragX.value
    const opacity = 1 - Math.min(1, dist * 0.7)

    return {
      transform: [{ translateX: offset }],
      opacity,
      display: 'flex',
    }
  })

  return (
    <Animated.View style={[styles.sceneCard, animatedStyle]}>
      {/* Visual Demonstration Hero */}
      <View style={styles.visualContainer}>{scene.visual}</View>

      {/* Text Content: 1 Headline (max 4 words), 1 Subline (max 10 words) */}
      <View style={styles.textContainer}>
        <Text style={styles.headline}>{scene.headline}</Text>
        <Text style={styles.subline}>{scene.subline}</Text>
      </View>
    </Animated.View>
  )
}

export default function OnboardingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ slide?: string; w?: string }>()
  const { width } = useWindowDimensions()
  const reduceMotion = useReducedMotion()

  const forcedWidth = params.w ? parseInt(params.w, 10) : undefined
  const safeWidth = forcedWidth || (width > 0 ? width : 390)
  const initialSlide = params.slide
    ? Math.max(0, Math.min(SCENES.length - 1, parseInt(params.slide, 10)))
    : 0

  const [currentIndex, setCurrentIndex] = useState(initialSlide)
  const activeIndex = useSharedValue(initialSlide)
  const dragX = useSharedValue(0)

  useEffect(() => {
    if (params.slide !== undefined) {
      const parsed = parseInt(params.slide, 10)
      if (!isNaN(parsed)) {
        const target = Math.max(0, Math.min(SCENES.length - 1, parsed))
        setCurrentIndex(target)
        activeIndex.value = target
      }
    }
  }, [params.slide])

  const finishOnboarding = async () => {
    triggerHaptic('success')
    try {
      await AsyncStorage.setItem('motosync_onboarding_seen', 'true')
    } catch {
      // Ignore storage error
    }
    router.replace('/home' as any)
  }

  const navigateToScene = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(SCENES.length - 1, nextIndex))
    triggerHaptic('selection')
    setCurrentIndex(clamped)
    if (reduceMotion) {
      activeIndex.value = clamped
    } else {
      activeIndex.value = withSpring(clamped, Motion.spring)
    }
  }

  const handleNext = () => {
    if (currentIndex < SCENES.length - 1) {
      navigateToScene(currentIndex + 1)
    } else {
      finishOnboarding()
    }
  }

  // Pan Gesture for smooth horizontal swiping
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      dragX.value = e.translationX
    })
    .onEnd((e) => {
      const threshold = safeWidth * 0.2
      const isQuickFling = Math.abs(e.velocityX) > 400

      let targetIndex = currentIndex

      if (
        (e.translationX < -threshold || (isQuickFling && e.velocityX < 0)) &&
        currentIndex < SCENES.length - 1
      ) {
        targetIndex = currentIndex + 1
      } else if (
        (e.translationX > threshold || (isQuickFling && e.velocityX > 0)) &&
        currentIndex > 0
      ) {
        targetIndex = currentIndex - 1
      }

      dragX.value = withSpring(0, Motion.spring)
      runOnJS(navigateToScene)(targetIndex)
    })

  return (
    <SafeAreaView
      style={[
        styles.root,
        forcedWidth ? { width: forcedWidth, maxWidth: forcedWidth } : null,
      ]}
    >
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        {/* Brand Emblem */}
        <View style={styles.brandRow}>
          <View style={styles.brandEmblem}>
            <Shield size={16} color={Colors.blue} />
          </View>
          <Text style={styles.brandTitle}>MotoSync</Text>
        </View>

        {/* Skip Action (≥48px touch target) */}
        <Pressable
          style={styles.skipButton}
          onPress={finishOnboarding}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={8}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Swipeable Scenes Area */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.viewport}>
          {SCENES.map((scene, index) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              index={index}
              activeIndex={activeIndex}
              dragX={dragX}
              width={safeWidth}
              reduceMotion={reduceMotion}
            />
          ))}
        </View>
      </GestureDetector>

      {/* Bottom Control Bar */}
      <View style={styles.bottomBar}>
        {/* Animated Pagination Indicator Pills */}
        <View style={styles.paginationRow} accessibilityRole="tablist">
          {SCENES.map((_, i) => {
            const isActive = currentIndex === i
            return (
              <Pressable
                key={`dot-${i}`}
                onPress={() => navigateToScene(i)}
                style={styles.dotTouchArea}
                accessibilityRole="tab"
                accessibilityLabel={`Go to slide ${i + 1}`}
                accessibilityState={{ selected: isActive }}
              >
                <View
                  style={[
                    styles.paginationDot,
                    isActive && styles.paginationDotActive,
                  ]}
                />
              </Pressable>
            )
          })}
        </View>

        {/* Primary Glowing Action Button (56px tall) */}
        <PrimaryButton
          title={currentIndex === SCENES.length - 1 ? 'Start Riding' : 'Continue'}
          icon={
            currentIndex === SCENES.length - 1 ? (
              <Zap size={18} color="#000000" />
            ) : (
              <ArrowRight size={18} color="#000000" />
            )
          }
          onPress={handleNext}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background, // Pure #000000
    justifyContent: 'space-between',
    overflow: 'hidden',
    width: '100%',
  },
  topBar: {
    height: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    zIndex: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandEmblem: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 177, 251, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  brandTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  skipButton: {
    minHeight: TouchTargets.minTouch,
    minWidth: TouchTargets.minTouch,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  skipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  viewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  sceneCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  visualContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxHeight: 330,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  headline: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    lineHeight: 34,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    maxWidth: 340,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  dotTouchArea: {
    minHeight: 24,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
  },
  paginationDotActive: {
    width: 26,
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  actionButton: {
    width: '100%',
  },
})
