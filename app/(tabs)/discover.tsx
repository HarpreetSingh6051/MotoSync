import { LiveRiderScreen } from '@/components/LiveRiderScreen'
import { demoMode } from '@/lib/environment'
import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Compass,
  CheckCircle2,
  Users,
  MessageSquare,
  Send,
  MapPin,
  Calendar,
  X,
  Search,
} from 'lucide-react-native'
import {
  Colors,
  Radii,
  Spacing,
  Typography,
  TouchTargets,
  Shadows,
} from '@/theme/tokens'
import {
  GlassCard,
  PrimaryButton,
  SecondaryButton,
  Pill,
  BottomSheet,
  Avatar,
} from '@/components/ui'
import { triggerHaptic } from '@/lib/haptics'
import { useClubs, useChatMessages } from '@/lib/data'
import { useAppStore } from '@/store/useAppStore'
import { useLocalSearchParams } from 'expo-router'
import type { Club, ChatMessage } from '@/types'
import { uid } from '@/lib/format'

const REGION_FILTERS = ['All', 'Punjab', 'Chandigarh', 'Bengaluru', 'Jaipur']

export default function DiscoverScreen() {
  return demoMode ? <View style={{flex:1,backgroundColor:Colors.background}}><Text style={{color:Colors.blue,padding:Spacing.md}}>DEMO ? sample data and simulated actions</Text><DemoScreen /></View> : <LiveRiderScreen screen="discover" />
}
function DemoScreen() {
  const { data: clubs } = useClubs()
  const { data: messages } = useChatMessages()
  const params = useLocalSearchParams<{ sheet?: string }>()

  const joinedClubIds = useAppStore((state) => state.joinedClubIds)
  const toggleJoinClub = useAppStore((state) => state.toggleJoinClub)
  const pushToast = useAppStore((state) => state.pushToast)
  const addMessage = useAppStore((state) => state.addMessage)

  const [activeRegion, setActiveRegion] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [chatInputText, setChatInputText] = useState('')

  useEffect(() => {
    if (params.sheet === 'chat' && clubs && clubs.length > 0 && !selectedClub) {
      setSelectedClub(clubs[0])
    }
  }, [params.sheet, clubs])

  const filteredClubs = (clubs || []).filter((c) => {
    const matchesRegion =
      activeRegion === 'All' ||
      c.city.toLowerCase().includes(activeRegion.toLowerCase())
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ridingStyle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRegion && matchesSearch
  })

  const handleToggleJoin = (club: Club) => {
    triggerHaptic('success')
    toggleJoinClub(club.id)
    const isJoined = joinedClubIds.includes(club.id)
    pushToast(
      isJoined ? 'Left Pack' : 'Joined Pack!',
      isJoined ? `You left ${club.name}` : `Welcome to ${club.name} pack`,
      isJoined ? 'default' : 'success'
    )
  }

  const handleSendMessage = () => {
    if (!chatInputText.trim() || !selectedClub) return
    triggerHaptic('light')

    addMessage({
      id: uid('msg'),
      channelId: `ch_club_${selectedClub.handle}`,
      senderId: 'u_arjun',
      text: chatInputText.trim(),
      kind: 'text',
      createdAt: new Date().toISOString(),
      mine: true,
    })

    setChatInputText('')
    pushToast('Message Sent', 'Broadcasted to pack chat', 'default')
  }

  // Filter messages for current club channel
  const clubMessages = (messages || []).filter((m) =>
    selectedClub ? m.channelId.includes(selectedClub.handle) || m.channelId.includes('phog') : true
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DISCOVER PACKS</Text>
          <Pill label="NEARBY RADAR" tone="blue" size="sm" />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search packs, riding style, or cities..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Region Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionFilterScroll}
        >
          {REGION_FILTERS.map((region) => {
            const isSel = activeRegion === region
            return (
              <Pressable
                key={region}
                style={[styles.regionChip, isSel && styles.regionChipActive]}
                onPress={() => {
                  triggerHaptic('selection')
                  setActiveRegion(region)
                }}
              >
                <Text
                  style={[
                    styles.regionChipText,
                    isSel && styles.regionChipTextActive,
                  ]}
                >
                  {region}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Club Cards List */}
        <View style={styles.clubsList}>
          {filteredClubs.map((club) => {
            const isJoined = joinedClubIds.includes(club.id)

            return (
              <GlassCard key={club.id} glow={isJoined ? 'blue' : 'none'} style={styles.clubCard}>
                {/* Top Info */}
                <View style={styles.clubTopRow}>
                  <View style={styles.clubTitleGroup}>
                    <Text style={styles.clubEmoji}>{club.badgeEmoji}</Text>
                    <View style={styles.clubNameCol}>
                      <View style={styles.nameWithBadge}>
                        <Text style={styles.clubName}>{club.name}</Text>
                        {club.verified && (
                          <CheckCircle2 size={13} color={Colors.blue} />
                        )}
                      </View>
                      <Text style={styles.clubStyle}>{club.ridingStyle}</Text>
                    </View>
                  </View>

                  <Pressable
                    style={styles.chatIconButton}
                    onPress={() => {
                      triggerHaptic('selection')
                      setSelectedClub(club)
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Open chat for ${club.name}`}
                  >
                    <MessageSquare size={16} color={Colors.blue} />
                  </Pressable>
                </View>

                {/* Telemetry Row */}
                <View style={styles.clubTelemetryRow}>
                  <View style={styles.clubTelemetryItem}>
                    <Users size={12} color={Colors.blue} />
                    <Text style={styles.clubTelemetryText}>
                      {club.memberCount} riders
                    </Text>
                  </View>
                  <View style={styles.telemetryDivider} />
                  <View style={styles.clubTelemetryItem}>
                    <MapPin size={12} color={Colors.violet} />
                    <Text style={styles.clubTelemetryText}>{club.city}</Text>
                  </View>
                  <View style={styles.telemetryDivider} />
                  <View style={styles.clubTelemetryItem}>
                    <Text style={styles.onlineDot}>•</Text>
                    <Text style={styles.clubTelemetryText}>
                      {club.ridingNow} active now
                    </Text>
                  </View>
                </View>

                {/* Weekend Ride Summary */}
                <View style={styles.weekendRideBox}>
                  <Calendar size={12} color={Colors.textSecondary} />
                  <Text style={styles.weekendRideText} numberOfLines={1}>
                    Sunday 05:30 AM • NH-44 Murthal Breakfast Run
                  </Text>
                </View>

                {/* SINGLE PRIMARY ACTION: Join Pack */}
                <PrimaryButton
                  title={isJoined ? 'Joined Pack' : 'Join Pack'}
                  icon={
                    isJoined ? (
                      <CheckCircle2 size={16} color="#000000" />
                    ) : undefined
                  }
                  onPress={() => handleToggleJoin(club)}
                  style={[
                    styles.joinButton,
                    isJoined ? styles.joinedButton : null,
                  ]}
                />
              </GlassCard>
            )
          })}
        </View>

        {/* Bottom spacer for floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Lightweight Group Chat BottomSheet */}
      <BottomSheet
        visible={Boolean(selectedClub)}
        onClose={() => setSelectedClub(null)}
        maxHeight={540}
      >
        {selectedClub && (
          <View style={styles.chatSheetContainer}>
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  {selectedClub.badgeEmoji} {selectedClub.name}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {selectedClub.ridingNow} riders currently active in pack chat
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedClub(null)}
                style={styles.sheetCloseButton}
              >
                <X size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {/* Messages Scroll View */}
            <ScrollView
              style={styles.chatMessagesScroll}
              contentContainerStyle={styles.chatMessagesContent}
            >
              {clubMessages.map((msg) => {
                const isMine = msg.senderId === 'u_arjun' || msg.mine
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatBubble,
                      isMine ? styles.chatBubbleMine : styles.chatBubbleOther,
                    ]}
                  >
                    <Text style={styles.chatBubbleText}>{msg.text}</Text>
                  </View>
                )
              })}
            </ScrollView>

            {/* Quick Chat Input Bar */}
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Broadcast to pack..."
                placeholderTextColor={Colors.textMuted}
                value={chatInputText}
                onChangeText={setChatInputText}
              />
              <Pressable
                style={styles.sendButton}
                onPress={handleSendMessage}
                accessibilityRole="button"
                accessibilityLabel="Send pack message"
              >
                <Send size={16} color="#000000" />
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background, // Pure #000000
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text,
  },
  regionFilterScroll: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  regionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  regionChipActive: {
    borderColor: Colors.blueBorder,
    backgroundColor: 'rgba(16, 177, 251, 0.12)',
  },
  regionChipText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  regionChipTextActive: {
    color: Colors.blue,
  },
  clubsList: {
    gap: Spacing.md,
  },
  clubCard: {
    padding: Spacing.md,
  },
  clubTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clubTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  clubEmoji: {
    fontSize: 26,
  },
  clubNameCol: {
    flex: 1,
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  clubName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  clubStyle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  chatIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 177, 251, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  clubTelemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  clubTelemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clubTelemetryText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  telemetryDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
  },
  onlineDot: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: 'bold',
  },
  weekendRideBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  weekendRideText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  joinButton: {
    width: '100%',
  },
  joinedButton: {
    backgroundColor: '#0D281E',
    borderWidth: 1,
    borderColor: Colors.green,
  },
  bottomSpacer: {
    height: 110,
  },
  chatSheetContainer: {
    paddingBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  sheetSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sheetCloseButton: {
    padding: Spacing.xs,
  },
  chatMessagesScroll: {
    maxHeight: 280,
    marginBottom: Spacing.md,
  },
  chatMessagesContent: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  chatBubble: {
    maxWidth: '82%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
  },
  chatBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.blue,
  },
  chatBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatBubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  chatInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text,
    height: 38,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
