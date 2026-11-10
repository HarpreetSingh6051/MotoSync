import React from 'react'
import { StyleSheet, View, type ViewProps, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { Colors, Radii, Spacing, Shadows } from '@/theme/tokens'

export interface GlassCardProps extends ViewProps {
  glow?: 'none' | 'blue' | 'violet' | 'red' | 'green'
  variant?: 'default' | 'card' | 'subtle'
  children: React.ReactNode
}

export const GlassCard: React.FC<GlassCardProps> = ({
  glow = 'none',
  variant = 'default',
  style,
  children,
  ...props
}) => {
  const borderColorMap = {
    none: Colors.border,
    blue: Colors.blueBorder,
    violet: Colors.violetBorder,
    red: Colors.redBorder,
    green: Colors.greenBorder,
  }

  const shadowMap = {
    none: Shadows.none,
    blue: Shadows.blueGlow,
    violet: Shadows.violetGlow,
    red: Shadows.redGlow,
    green: Shadows.greenGlow,
  }

  const backgroundColor =
    variant === 'subtle'
      ? 'rgba(14, 20, 34, 0.40)'
      : variant === 'card'
      ? Colors.card
      : Colors.glassCard

  const containerStyle = [
    styles.card,
    {
      borderColor: borderColorMap[glow],
      backgroundColor,
    },
    shadowMap[glow],
    style,
  ]

  if (Platform.OS === 'ios') {
    return (
      <View style={containerStyle} {...props}>
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.content}>{children}</View>
      </View>
    )
  }

  return (
    <View style={containerStyle} {...props}>
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.lg,
  },
})
