import React, { useEffect, useState } from 'react'
import { Text, StyleSheet, type TextProps, type StyleProp, type TextStyle } from 'react-native'
import { Colors, Typography } from '@/theme/tokens'
import { useReducedMotion } from '@/lib/motion'

export interface AnimatedNumberProps extends TextProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  formatDecimals?: number
  style?: StyleProp<TextStyle>
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  duration = 600,
  formatDecimals = 0,
  style,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(value)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value)
      return
    }

    const start = displayValue
    const end = value
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * easedProgress

      setDisplayValue(current)

      if (progress >= 1) {
        clearInterval(interval)
        setDisplayValue(end)
      }
    }, 16)

    return () => clearInterval(interval)
  }, [value, reduceMotion])

  const formatted =
    formatDecimals > 0
      ? displayValue.toFixed(formatDecimals)
      : Math.round(displayValue).toString()

  return (
    <Text
      style={[styles.text, style]}
      accessibilityRole="text"
      accessibilityLabel={`${prefix}${formatted}${suffix}`}
      {...props}
    >
      {prefix}
      {formatted}
      {suffix}
    </Text>
  )
}

const styles = StyleSheet.create({
  text: {
    ...Typography.telemetryMonoLarge,
    color: Colors.text,
  },
})
