import React from 'react'
import { StyleSheet, View, Pressable, Text, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Tabs } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Home, Radio, Receipt, Sparkles } from 'lucide-react-native'
import { Colors, Radii, Spacing, Typography, Motion } from '@/theme/tokens'
import { triggerHaptic } from '@/lib/haptics'
import { useReducedMotion } from '@/lib/motion'

interface TabConfig {
  name: string
  label: string
  Icon: React.ComponentType<{ size: number; color: string }>
}

const TABS: TabConfig[] = [
  { name: 'home', label: 'Home', Icon: Home },
  { name: 'pack', label: 'Pack', Icon: Radio },
  { name: 'splits', label: 'Splits', Icon: Receipt },
  { name: 'discover', label: 'Discover', Icon: Sparkles },
]

interface CustomTabBarProps {
  state: {
    index: number
    routes: Array<{ key: string; name: string }>
  }
  descriptors: Record<string, any>
  navigation: {
    emit: (event: any) => { defaultPrevented: boolean }
    navigate: (name: string) => void
  }
}

function FloatingTabBar({ state, navigation }: CustomTabBarProps) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const reduceMotion = useReducedMotion()

  const containerWidth = Math.min(width - 32, 420)
  const tabWidth = containerWidth / TABS.length
  const pillTranslateX = useSharedValue(state.index * tabWidth)

  React.useEffect(() => {
    if (reduceMotion) {
      pillTranslateX.value = state.index * tabWidth
    } else {
      pillTranslateX.value = withSpring(state.index * tabWidth, Motion.spring)
    }
  }, [state.index, tabWidth, reduceMotion])

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillTranslateX.value }],
  }))

  const bottomInset = Math.max(16, (insets.bottom || 0) + 8)

  return (
    <View style={[styles.floatingWrapper, { bottom: bottomInset }]} pointerEvents="box-none">
      <View style={[styles.barContainer, { width: containerWidth }]}>
        {/* Sliding Pill Indicator */}
        <Animated.View
          style={[
            styles.slidingPill,
            { width: tabWidth - 8 },
            pillAnimatedStyle,
          ]}
        />

        {/* Tab Items */}
        {state.routes.map((route: { key: string; name: string }, index: number) => {
          const tabConfig = TABS.find((t) => t.name === route.name) || TABS[index]
          if (!tabConfig) return null

          const isFocused = state.index === index
          const { Icon, label } = tabConfig

          const onPress = () => {
            triggerHaptic('selection')
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tabButton, { width: tabWidth }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={`${label} Tab`}
            >
              <View style={[styles.iconBox, isFocused && styles.activeIconBox]}>
                <Icon
                  size={20}
                  color={isFocused ? Colors.blue : Colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="pack" options={{ title: 'Pack' }} />
      <Tabs.Screen name="splits" options={{ title: 'Splits' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  barContainer: {
    height: 64,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(10, 14, 24, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  slidingPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 4,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(16, 177, 251, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 177, 251, 0.4)',
  },
  tabButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBox: {
    transform: [{ scale: 1.08 }],
  },
  tabLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  activeLabel: {
    color: Colors.blue,
    fontWeight: '700',
  },
  inactiveLabel: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
})
