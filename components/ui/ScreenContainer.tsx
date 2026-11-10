import React, { useEffect } from 'react'
import { StyleSheet, View, type ViewProps, ScrollView, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Colors, Spacing } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'

export interface ScreenContainerProps extends ViewProps {
  scrollable?: boolean
  fadeIn?: boolean
  contentContainerStyle?: StyleProp<ViewStyle>
  children: React.ReactNode
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  scrollable = false,
  fadeIn = true,
  contentContainerStyle,
  style,
  children,
  ...props
}) => {
  const insets = useSafeAreaInsets()
  const opacity = useSharedValue(fadeIn ? 0 : 1)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (fadeIn) {
      if (reduceMotion) {
        opacity.value = 1
      } else {
        opacity.value = withTiming(1, { duration: 250 })
      }
    }
  }, [fadeIn, reduceMotion])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const containerPadding = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom + Spacing.lg,
    paddingLeft: Math.max(insets.left, Spacing.lg),
    paddingRight: Math.max(insets.right, Spacing.lg),
  }

  if (scrollable) {
    return (
      <View style={[styles.root, style]}>
        <ScrollView
          style={styles.root}
          contentContainerStyle={[styles.content, containerPadding, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...props}
        >
          <Animated.View style={[styles.centerConstrain, animatedStyle]}>
            {children}
          </Animated.View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={[styles.root, containerPadding, style]} {...props}>
      <Animated.View style={[styles.centerConstrain, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
  },
  centerConstrain: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
})
