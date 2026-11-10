import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Calendar,
  Clock,
  MapPin,
  CloudSun,
  Volume2,
  VolumeX,
  Play,
  Navigation,
  Wrench,
  Fuel,
  Flame,
  X,
  CheckCircle2,
  Radio,
  Sparkles,
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
  Avatar,
  AvatarStack,
  Pill,
  BottomSheet,
  PullToRefreshWheel,
  EqualizerIcon,
} from '@/components/ui'
import { useRides } from '@/lib/data'
import { profiles, garage, reelClips } from '@/lib/mockData'
import { useAppStore } from '@/store/useAppStore'
import { useSound } from '@/context/SoundContext'
import { triggerHaptic } from '@/lib/haptics'
import type { ReelClip } from '@/types'

export default function HomeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ sheet?: string }>()
  const { width } = useWindowDimensions()
  const { data: rides, isLoading, refetch } = useRides()

  const { isPlaying, toggle: toggleSound } = useSound()

  const [refreshing, setRefreshing] = useState(false)
  const [routeSheetOpen, setRouteSheetOpen] = useState(params.sheet === 'route')
  const [garageSheetOpen, setGarageSheetOpen] = useState(params.sheet === 'garage')
  const [activeReel, setActiveReel] = useState<ReelClip | null>(
    params.sheet === 'reel' ? reelClips[0] : null
  )
  const [selectedExhaust, setSelectedExhaust] = useState('Harley 114 V-Twin')
  const [isPlayingExhaust, setIsPlayingExhaust] = useState(false)

  // Current featured ride
  const featuredRide = rides?.[0] || {
    id: 'r_sunrise',
    title: 'Sunrise NH-44 Express',
    distanceKm: 140,
    startTime: 'Sun 10 Nov • 05:30 AM',
    meetupLabel: 'Haveli Dhaba, Murthal (NH-44)',
  }

  const confirmedAvatars = profiles.slice(0, 5).map((p) => ({
    name: p.fullName,
  }))

  const onRefresh = async () => {
    setRefreshing(true)
    triggerHaptic('light')
    await refetch()
    setTimeout(() => {
      setRefreshing(false)
      triggerHaptic('success')
    }, 800)
  }

  const handleSoundToggle = () => {
    triggerHaptic('light')
    toggleSound()
  }

  const handleExhaustPreview = (soundName: string) => {
    triggerHaptic('medium')
    setSelectedExhaust(soundName)
    setIsPlayingExhaust(true)
    setTimeout(() => setIsPlayingExhaust(false), 2400)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.blue}
            colors={[Colors.blue]}
          />
        }
      >
        {/* Custom Wheel Refresh Indicator */}
        <PullToRefreshWheel refreshing={refreshing} />

        {/* 1. Header: Pack Status Pill, Sound Toggle, Avatar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveIndicatorRing}>
              <View style={styles.liveIndicatorDot} />
            </View>
            <Text style={styles.packStatusText}>LIVE PACK • NH-44 RUN</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Ambient Sound Toggle: Miniature Equalizer when playing */}
            <Pressable
              style={[
                styles.soundToggleSlot,
                isPlaying && styles.soundToggleSlotActive,
              ]}
              onPress={handleSoundToggle}
              accessibilityRole="button"
              accessibilityLabel={
                isPlaying ? 'Mute ambient engine audio' : 'Play ambient engine audio'
              }
            >
              {isPlaying ? (
                <EqualizerIcon isPlaying={true} color={Colors.violet} size={18} />
              ) : (
                <VolumeX size={18} color={Colors.textMuted} />
              )}
            </Pressable>

            {/* Profile & Garage Avatar */}
            <Pressable
              onPress={() => {
                triggerHaptic('selection')
                setGarageSheetOpen(true)
              }}
              accessibilityRole="button"
              accessibilityLabel="Open Rider Profile and Garage"
            >
              <Avatar
                name="Arjun Singh"
                size={38}
                isLive={true}
              />
            </Pressable>
          </View>
        </View>

        {/* 2. Hero Card: "Next Ride" */}
        <View style={styles.sectionMargin}>
          <GlassCard glow="blue" style={styles.heroCard}>
            {/* Top Badge & Distance */}
            <View style={styles.heroTopRow}>
              <Pill
                label="NEXT CONFIRMED RIDE"
                tone="blue"
                size="sm"
                icon={<Radio size={10} color={Colors.blue} />}
              />
              <Text style={styles.heroDistance}>
                {featuredRide.distanceKm} km
              </Text>
            </View>

            {/* Ride Title */}
            <Text style={styles.heroTitle} numberOfLines={1}>
              {featuredRide.title}
            </Text>

            {/* Date & Time */}
            <View style={styles.heroMetaRow}>
              <View style={styles.metaItem}>
                <Calendar size={13} color={Colors.blue} />
                <Text style={styles.metaText}>Sun 10 Nov</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={13} color={Colors.blue} />
                <Text style={styles.metaText}>05:30 AM</Text>
              </View>
            </View>

            {/* Meeting Place */}
            <View style={styles.meetupRow}>
              <MapPin size={14} color={Colors.violet} />
              <Text style={styles.meetupText} numberOfLines={1}>
                {featuredRide.meetupLabel}
              </Text>
            </View>

            {/* Weather Chip & Confirmed Avatars */}
            <View style={styles.ridersAndWeatherRow}>
              <View style={styles.weatherChip}>
                <CloudSun size={12} color="#FBBF24" />
                <Text style={styles.weatherText}>22°C Clear • 0% Rain</Text>
              </View>

              <View style={styles.avatarStackWrap}>
                <AvatarStack users={confirmedAvatars} max={4} size="sm" />
              </View>
            </View>

            {/* Route Planner Trigger Button */}
            <Pressable
              style={styles.routePlannerButton}
              onPress={() => {
                triggerHaptic('light')
                setRouteSheetOpen(true)
              }}
              accessibilityRole="button"
              accessibilityLabel="View route waypoints"
            >
              <Navigation size={13} color={Colors.blue} />
              <Text style={styles.routePlannerButtonText}>
                View 4 Route Waypoints
              </Text>
            </Pressable>

            {/* ONE BIG PRIMARY BUTTON: Start Ride (56px) */}
            <PrimaryButton
              title="Start Ride"
              icon={<Play size={18} color="#000000" fill="#000000" />}
              onPress={() => {
                triggerHaptic('medium')
                router.push('/(tabs)/pack' as any)
              }}
              style={styles.heroActionButton}
            />
          </GlassCard>
        </View>

        {/* 3. Horizontal Story-Style Pack Highlights (Reels & Runs) */}
        <View style={styles.sectionMargin}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Sparkles size={15} color={Colors.blue} />
              <Text style={styles.sectionTitle}>PACK HIGHLIGHTS</Text>
            </View>
            <Pill label="6 REELS" tone="neutral" size="sm" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reelsScrollContent}
          >
            {reelClips.map((clip) => (
              <Pressable
                key={clip.id}
                style={styles.reelCard}
                onPress={() => {
                  triggerHaptic('selection')
                  setActiveReel(clip)
                }}
                accessibilityRole="button"
                accessibilityLabel={`Watch reel: ${clip.label}`}
              >
                <View style={styles.reelArtwork}>
                  <View style={styles.reelBadge}>
                    <Text style={styles.reelBadgeText}>
                      {clip.durationSec}s
                    </Text>
                  </View>
                  <View style={styles.reelCenterIcon}>
                    <Play size={20} color={Colors.text} fill={Colors.text} />
                  </View>
                  <View style={styles.reelDbTag}>
                    <Flame size={10} color="#F59E0B" />
                    <Text style={styles.reelDbText}>101 dB</Text>
                  </View>
                </View>

                <Text style={styles.reelTitle} numberOfLines={1}>
                  {clip.label}
                </Text>
                <Text style={styles.reelAuthor}>Simran Kaur</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Bottom padding to clear floating tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 4. Route Planner BottomSheet */}
      <BottomSheet
        visible={routeSheetOpen}
        onClose={() => setRouteSheetOpen(false)}
        maxHeight={520}
      >
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>Sunrise NH-44 Route</Text>
            <Text style={styles.sheetSubtitle}>140 km • 4 Planned Stops</Text>
          </View>
          <Pressable
            onPress={() => setRouteSheetOpen(false)}
            style={styles.sheetCloseButton}
            accessibilityLabel="Close route planner"
          >
            <X size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.waypointsList}>
          <View style={styles.waypointItem}>
            <View style={[styles.waypointDot, styles.dotBlue]} />
            <View style={styles.waypointInfo}>
              <Text style={styles.waypointTitle}>WP 1: Mukarba Chowk</Text>
              <Text style={styles.waypointDesc}>0 km • Muster & Rollout 05:30</Text>
            </View>
          </View>

          <View style={styles.waypointItem}>
            <View style={[styles.waypointDot, styles.dotViolet]} />
            <View style={styles.waypointInfo}>
              <Text style={styles.waypointTitle}>WP 2: Haveli Murthal</Text>
              <Text style={styles.waypointDesc}>48 km • Chai & Paratha Stop</Text>
            </View>
          </View>

          <View style={styles.waypointItem}>
            <View style={[styles.waypointDot, styles.dotGreen]} />
            <View style={styles.waypointInfo}>
              <Text style={styles.waypointTitle}>WP 3: Karnal Bypass</Text>
              <Text style={styles.waypointDesc}>92 km • HP Fuel Top-up</Text>
            </View>
          </View>

          <View style={styles.waypointItem}>
            <View style={[styles.waypointDot, styles.dotBlue]} />
            <View style={styles.waypointInfo}>
              <Text style={styles.waypointTitle}>WP 4: Dharampur Ridge</Text>
              <Text style={styles.waypointDesc}>140 km • Final Pack Summit</Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          title="Export GPX to GPS"
          onPress={() => {
            triggerHaptic('success')
            setRouteSheetOpen(false)
          }}
          style={styles.sheetPrimaryButton}
        />
      </BottomSheet>

      {/* 5. Garage & Exhaust Audio BottomSheet */}
      <BottomSheet
        visible={garageSheetOpen}
        onClose={() => setGarageSheetOpen(false)}
        maxHeight={560}
      >
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>Rider Garage & Sounds</Text>
            <Text style={styles.sheetSubtitle}>Arjun Singh • Road Captain</Text>
          </View>
          <Pressable
            onPress={() => setGarageSheetOpen(false)}
            style={styles.sheetCloseButton}
            accessibilityLabel="Close garage"
          >
            <X size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Primary Bike Card */}
        <View style={styles.bikeCard}>
          <View style={styles.bikeCardTop}>
            <Text style={styles.bikeModel}>{garage.model}</Text>
            <Pill label={garage.plate} tone="blue" size="sm" />
          </View>
          <View style={styles.bikeStatsRow}>
            <View style={styles.bikeStat}>
              <Text style={styles.bikeStatLabel}>ODOMETER</Text>
              <Text style={styles.bikeStatVal}>{garage.odometerKm.toLocaleString()} km</Text>
            </View>
            <View style={styles.bikeStat}>
              <Text style={styles.bikeStatLabel}>TYRES (PSI)</Text>
              <Text style={styles.bikeStatVal}>F:36 / R:40</Text>
            </View>
            <View style={styles.bikeStat}>
              <Text style={styles.bikeStatLabel}>NEXT OIL</Text>
              <Text style={styles.bikeStatVal}>980 km</Text>
            </View>
          </View>
        </View>

        {/* Exhaust Sounds Selector */}
        <Text style={styles.exhaustSectionHeader}>EXHAUST SOUND PROFILE</Text>
        <View style={styles.exhaustList}>
          {['Harley 114 V-Twin', 'RE 650 Twin', 'KTM 390 Single'].map((sound) => {
            const isSelected = selectedExhaust === sound
            return (
              <Pressable
                key={sound}
                style={[
                  styles.exhaustItem,
                  isSelected && styles.exhaustItemActive,
                ]}
                onPress={() => handleExhaustPreview(sound)}
                accessibilityRole="button"
                accessibilityLabel={`Select and preview ${sound}`}
              >
                <View style={styles.exhaustItemLeft}>
                  <Flame
                    size={14}
                    color={isSelected ? Colors.blue : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.exhaustName,
                      isSelected && styles.exhaustNameActive,
                    ]}
                  >
                    {sound}
                  </Text>
                </View>
                {isSelected && isPlayingExhaust ? (
                  <Pill label="104 dB REVVING" tone="blue" size="sm" />
                ) : (
                  <Text style={styles.previewText}>Tap to Preview</Text>
                )}
              </Pressable>
            )
          })}
        </View>
      </BottomSheet>

      {/* 6. Reel Viewer Modal / Sheet */}
      <BottomSheet
        visible={Boolean(activeReel)}
        onClose={() => setActiveReel(null)}
        maxHeight={480}
      >
        {activeReel && (
          <View style={styles.reelModalContent}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{activeReel.label}</Text>
                <Text style={styles.sheetSubtitle}>Simran Kaur • Pack Creator</Text>
              </View>
              <Pressable
                onPress={() => setActiveReel(null)}
                style={styles.sheetCloseButton}
              >
                <X size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {/* Audio Wave Visualizer Simulation */}
            <View style={styles.audioWaveContainer}>
              {[24, 48, 64, 88, 52, 96, 72, 38, 80, 56, 32].map((h, i) => (
                <View
                  key={`wave-${i}`}
                  style={[
                    styles.audioWaveBar,
                    { height: h * 0.7, backgroundColor: Colors.blue },
                  ]}
                />
              ))}
            </View>

            <View style={styles.reelMetaRow}>
              <Pill label="101 dB AUDIO" tone="violet" size="sm" />
              <Pill label="4K HIGH SPEED" tone="blue" size="sm" />
            </View>

            <PrimaryButton
              title="Join Next Weekend Run"
              onPress={() => {
                triggerHaptic('success')
                setActiveReel(null)
              }}
              style={styles.sheetPrimaryButton}
            />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    gap: 8,
  },
  liveIndicatorRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  packStatusText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: Colors.green,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  soundToggleSlot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundToggleSlotActive: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  sectionMargin: {
    marginBottom: Spacing.xl,
  },
  heroCard: {
    padding: Spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  heroDistance: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: Colors.blue,
  },
  heroTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  meetupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  meetupText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  ridersAndWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  weatherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    gap: 5,
  },
  weatherText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10,
    color: '#FBBF24',
  },
  avatarStackWrap: {
    alignItems: 'flex-end',
  },
  routePlannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 177, 251, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 177, 251, 0.2)',
    paddingVertical: Spacing.xs,
    borderRadius: Radii.button,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  routePlannerButtonText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 11,
    color: Colors.blue,
  },
  heroActionButton: {
    marginTop: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  reelsScrollContent: {
    gap: Spacing.md,
  },
  reelCard: {
    width: 140,
  },
  reelArtwork: {
    width: 140,
    height: 190,
    borderRadius: Radii.md,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reelBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  reelBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: Colors.text,
  },
  reelCenterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 177, 251, 0.3)',
    borderWidth: 1,
    borderColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelDbTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  reelDbText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: '#F59E0B',
  },
  reelTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.text,
    marginTop: 6,
  },
  reelAuthor: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  bottomSpacer: {
    height: 90,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  sheetSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sheetCloseButton: {
    padding: Spacing.xs,
  },
  waypointsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  waypointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 3,
  },
  dotBlue: {
    backgroundColor: Colors.blue,
  },
  dotViolet: {
    backgroundColor: Colors.violet,
  },
  dotGreen: {
    backgroundColor: Colors.green,
  },
  waypointInfo: {
    flex: 1,
  },
  waypointTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.text,
  },
  waypointDesc: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  sheetPrimaryButton: {
    width: '100%',
  },
  bikeCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bikeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  bikeModel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  bikeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  bikeStat: {
    alignItems: 'flex-start',
  },
  bikeStatLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 9,
    color: Colors.textMuted,
  },
  bikeStatVal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: Colors.blue,
    marginTop: 1,
  },
  exhaustSectionHeader: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  exhaustList: {
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  exhaustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  exhaustItemActive: {
    borderColor: Colors.blueBorder,
    backgroundColor: 'rgba(16, 177, 251, 0.08)',
  },
  exhaustItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exhaustName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  exhaustNameActive: {
    color: Colors.text,
  },
  previewText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 11,
    color: Colors.blue,
  },
  reelModalContent: {
    alignItems: 'center',
  },
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 80,
    width: '100%',
    marginVertical: Spacing.lg,
  },
  audioWaveBar: {
    width: 6,
    borderRadius: 3,
  },
  reelMetaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
})
