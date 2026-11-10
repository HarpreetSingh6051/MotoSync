import React from 'react'
import { StyleSheet, Text, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens'

export interface PillProps extends ViewProps {
  label: string
  tone?: 'blue' | 'violet' | 'red' | 'green' | 'neutral'
  icon?: React.ReactNode
  size?: 'sm' | 'md'
  style?: StyleProp<ViewStyle>
}

export const Pill: React.FC<PillProps> = ({
  label,
  tone = 'blue',
  icon,
  size = 'md',
  style,
  ...props
}) => {
  const toneMap = {
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
    red: {
      bg: Colors.redSoft,
      border: Colors.redBorder,
      text: Colors.red,
    },
    green: {
      bg: Colors.greenSoft,
      border: Colors.greenBorder,
      text: Colors.green,
    },
    neutral: {
      bg: 'rgba(255, 255, 255, 0.05)',
      border: Colors.border,
      text: Colors.textSecondary,
    },
  }

  const { bg, border, text } = toneMap[tone]
  const isSm = size === 'sm'

  return (
    <View
      style={[
        styles.pill,
        isSm ? styles.pillSm : styles.pillMd,
        { backgroundColor: bg, borderColor: border },
        style,
      ]}
      accessibilityRole="text"
      {...props}
    >
      {icon}
      <Text
        style={[
          styles.text,
          isSm ? styles.textSm : styles.textMd,
          { color: text },
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  pillSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    gap: Spacing.xxs,
  },
  text: {
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.5,
  },
  textMd: {
    fontSize: 11,
    lineHeight: 15,
  },
  textSm: {
    fontSize: 10,
    lineHeight: 13,
  },
})
