import React from 'react'
import { StyleSheet, Text, View, Image, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'
import { Colors, Radii } from '@/theme/tokens'

export interface AvatarProps extends ViewProps {
  name: string
  uri?: string | null
  size?: 'sm' | 'md' | 'lg' | number
  isLive?: boolean
  borderColor?: string
  style?: StyleProp<ViewStyle>
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  uri,
  size = 'md',
  isLive = false,
  borderColor = Colors.borderLight,
  style,
  ...props
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 32
      : size === 'lg'
      ? 52
      : 40

  const initials = name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'M'

  const fontSize = Math.round(pixelSize * 0.38)
  const indicatorSize = Math.max(8, Math.round(pixelSize * 0.25))

  return (
    <View
      style={[
        styles.container,
        {
          width: pixelSize,
          height: pixelSize,
          borderRadius: pixelSize / 2,
          borderColor,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar of ${name}`}
      {...props}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: pixelSize / 2 }]}
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}

      {isLive && (
        <View
          style={[
            styles.liveIndicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
            },
          ]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: Colors.text,
  },
  liveIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: '#000000',
  },
})
