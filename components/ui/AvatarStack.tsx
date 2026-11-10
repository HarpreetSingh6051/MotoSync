import React from 'react'
import { StyleSheet, Text, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'
import { Avatar } from './Avatar'
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens'

export interface AvatarStackUser {
  name: string
  uri?: string | null
  isLive?: boolean
}

export interface AvatarStackProps extends ViewProps {
  users: AvatarStackUser[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
  style?: StyleProp<ViewStyle>
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  users,
  max = 4,
  size = 'md',
  style,
  ...props
}) => {
  const visible = users.slice(0, max)
  const remaining = users.length - max

  const overlapOffset = size === 'sm' ? -8 : size === 'lg' ? -14 : -10
  const pixelSize = size === 'sm' ? 32 : size === 'lg' ? 52 : 40

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="text"
      accessibilityLabel={`${users.length} riders`}
      {...props}
    >
      {visible.map((user, idx) => (
        <View
          key={`${user.name}-${idx}`}
          style={[
            styles.avatarWrapper,
            idx > 0 && { marginLeft: overlapOffset },
            { zIndex: visible.length - idx },
          ]}
        >
          <Avatar
            name={user.name}
            uri={user.uri}
            size={size}
            isLive={user.isLive}
            borderColor="#000000"
          />
        </View>
      ))}

      {remaining > 0 && (
        <View
          style={[
            styles.remainingBadge,
            {
              width: pixelSize,
              height: pixelSize,
              borderRadius: pixelSize / 2,
              marginLeft: overlapOffset,
              zIndex: 0,
            },
          ]}
        >
          <Text style={styles.remainingText}>+{remaining}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    shadowColor: '#000000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  remainingBadge: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: Colors.blue,
  },
})
