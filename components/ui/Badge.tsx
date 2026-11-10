import React from 'react'
import { StyleSheet, Text, View, type ViewProps } from 'react-native'
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens'

export interface BadgeProps extends ViewProps {
  label: string
  tone?: 'blue' | 'violet' | 'emerald' | 'red' | 'neutral'
  icon?: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'blue',
  icon,
  style,
  ...props
}) => {
  const colorMap = {
    blue: {
      bg: Colors.blueSoft,
      border: Colors.blueBorder,
      text: Colors.blue,
    },
    violet: {
      bg: Colors.violetSoft,
      border: Colors.violetBorder,
      text: Colors.violet,
    },
    emerald: {
      bg: Colors.greenSoft,
      border: Colors.greenBorder,
      text: Colors.green,
    },
    red: {
      bg: Colors.redSoft,
      border: Colors.redBorder,
      text: Colors.red,
    },
    neutral: {
      bg: 'rgba(255, 255, 255, 0.05)',
      border: Colors.border,
      text: Colors.textSecondary,
    },
  }

  const { bg, border, text } = colorMap[tone]

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        style,
      ]}
      accessibilityRole="text"
      {...props}
    >
      {icon}
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    borderWidth: 1,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
})
