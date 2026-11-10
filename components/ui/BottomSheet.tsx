import React, { useEffect } from 'react'
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  Dimensions,
  type ViewProps,
} from 'react-native'
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { Colors, Radii, Spacing, Motion } from '@/theme/tokens'
import { triggerHaptic } from '@/lib/haptics'

export interface BottomSheetProps extends ViewProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  maxHeight?: number
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  maxHeight = SCREEN_HEIGHT * 0.75,
  style,
  ...props
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT)
  const backdropOpacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      triggerHaptic('light')
      backdropOpacity.value = withTiming(1, { duration: 250 })
      translateY.value = withSpring(0, Motion.spring)
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 })
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 })
    }
  }, [visible])

  const dismiss = () => {
    triggerHaptic('light')
    backdropOpacity.value = withTiming(0, { duration: 180 })
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, () => {
      runOnJS(onClose)()
    })
  }

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY
      }
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 600) {
        runOnJS(dismiss)()
      } else {
        translateY.value = withSpring(0, Motion.spring)
      }
    })

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  if (!visible) return null

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismiss}
            accessibilityLabel="Close bottom sheet"
            accessibilityRole="button"
          />
        </Animated.View>

        {/* Draggable Sheet */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              { maxHeight },
              sheetAnimatedStyle,
              style,
            ]}
            accessibilityViewIsModal
            {...props}
          >
            {/* Handlebar */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.content}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  sheet: {
    width: '100%',
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.cardLarge,
    borderTopRightRadius: Radii.cardLarge,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.borderLight,
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  handleContainer: {
    width: '100%',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
})
