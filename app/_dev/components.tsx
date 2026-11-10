import React, { useState } from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import {
  ScreenContainer,
  GlassCard,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  Pill,
  Avatar,
  AvatarStack,
  HapticTab,
  Skeleton,
  BottomSheet,
  AnimatedNumber,
} from '@/components/ui'
import { Colors, Spacing, Radii, Typography, TouchTargets } from '@/theme/tokens'
import {
  Zap,
  Navigation,
  ShieldAlert,
  Radio,
  Sliders,
  Sparkles,
  MapPin,
  IndianRupee,
  Share2,
  PhoneCall,
  Bell,
  Compass,
  Users,
  Receipt,
  Plus,
  Minus,
} from 'lucide-react-native'

export default function ComponentsDevScreen() {
  const [sheetVisible, setSheetVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<'home' | 'pack' | 'splits' | 'discover'>('home')
  const [counterValue, setCounterValue] = useState(1450)
  const [speedValue, setSpeedValue] = useState(88)

  const sampleRiders = [
    { name: 'Aarav Sharma', isLive: true },
    { name: 'Vikram Singh', isLive: false },
    { name: 'Kavya Nair', isLive: true },
    { name: 'Rohan Mehta', isLive: false },
    { name: 'Zoya Khan', isLive: true },
    { name: 'Arjun Verma', isLive: false },
  ]

  return (
    <ScreenContainer scrollable>
      {/* Dev Header */}
      <View style={styles.header}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>M</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={Typography.title}>Design System Lab</Text>
          <Text style={Typography.caption}>Phase 2 Base Components Showcase</Text>
        </View>
        <Pill label="DEV / v2.0" tone="blue" size="sm" />
      </View>

      {/* 1. COLOR TOKENS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. COLOR TOKENS & SURFACES</Text>
        <GlassCard>
          <View style={styles.swatchRow}>
            <View style={[styles.swatch, { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border }]}>
              <Text style={styles.swatchText}>Black</Text>
              <Text style={styles.swatchHex}>#000000</Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: Colors.surface }]}>
              <Text style={styles.swatchText}>Surface</Text>
              <Text style={styles.swatchHex}>#070A10</Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: Colors.card }]}>
              <Text style={styles.swatchText}>Card</Text>
              <Text style={styles.swatchHex}>#0E1422</Text>
            </View>
          </View>

          <View style={[styles.swatchRow, { marginTop: Spacing.sm }]}>
            <View style={[styles.swatch, { backgroundColor: Colors.blue }]}>
              <Text style={[styles.swatchText, { color: '#000000' }]}>Blue</Text>
              <Text style={[styles.swatchHex, { color: 'rgba(0,0,0,0.7)' }]}>#10B1FB</Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: Colors.violet }]}>
              <Text style={styles.swatchText}>Violet</Text>
              <Text style={styles.swatchHex}>#8B5CF6</Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: Colors.green }]}>
              <Text style={styles.swatchText}>Green</Text>
              <Text style={styles.swatchHex}>#10B981</Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: Colors.red }]}>
              <Text style={styles.swatchText}>Red Alert</Text>
              <Text style={styles.swatchHex}>#EF4444</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* 2. GLASSCARD VARIANTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. GLASSCARD VARIANTS (BLUR + NEON BORDER)</Text>
        <View style={styles.stack}>
          <GlassCard glow="blue">
            <View style={styles.cardHeader}>
              <Pill label="ELECTRIC BLUE GLOW" tone="blue" />
              <Text style={Typography.telemetryMono}>85 KM/H</Text>
            </View>
            <Text style={[Typography.title, { marginTop: Spacing.sm }]}>Delhi Throttle Run</Text>
            <Text style={[Typography.body, { marginTop: Spacing.xs }]} numberOfLines={2}>
              Morning sprint towards Murthal Dhaba on NH-44. High-speed formation rolling out.
            </Text>
          </GlassCard>

          <GlassCard glow="violet">
            <View style={styles.cardHeader}>
              <Pill label="NEON VIOLET GLOW" tone="violet" />
              <Text style={[Typography.telemetryMono, { color: Colors.violet }]}>PACK #04</Text>
            </View>
            <Text style={[Typography.title, { marginTop: Spacing.sm }]}>Western Ghats Apex</Text>
            <Text style={[Typography.body, { marginTop: Spacing.xs }]} numberOfLines={2}>
              Mumbai to Lonavala twisties with 12 bikes in tight formation.
            </Text>
          </GlassCard>

          <GlassCard glow="red">
            <View style={styles.cardHeader}>
              <Pill label="HAZARD ALERT ONLY" tone="red" icon={<ShieldAlert size={12} color={Colors.red} />} />
              <Text style={[Typography.telemetryMono, { color: Colors.red }]}>CRITICAL</Text>
            </View>
            <Text style={[Typography.title, { marginTop: Spacing.sm }]}>Gravel on Apex Corner</Text>
            <Text style={[Typography.body, { marginTop: Spacing.xs }]} numberOfLines={2}>
              Tail sweep reported loose stones 400m ahead. Reduce pack speed to 40 km/h.
            </Text>
          </GlassCard>
        </View>
      </View>

      {/* 3. PRIMARY & SECONDARY BUTTONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. BUTTONS (56PX PRIMARY & 48PX TOUCH TARGETS)</Text>
        <GlassCard>
          <Text style={[Typography.caption, { marginBottom: Spacing.sm }]}>PRIMARY BUTTONS (56PX TALL)</Text>
          <View style={styles.buttonStack}>
            <PrimaryButton
              title="Start Pack Ride"
              icon={<Navigation size={18} color="#000000" />}
              onPress={() => {}}
            />
            <PrimaryButton
              title="Connecting to Mesh..."
              loading
              onPress={() => {}}
            />
            <PrimaryButton
              title="Disabled State"
              disabled
              onPress={() => {}}
            />
          </View>

          <Text style={[Typography.caption, { marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
            SECONDARY BUTTONS (48PX TALL)
          </Text>
          <View style={styles.buttonStack}>
            <SecondaryButton
              title="View Route Telemetry"
              icon={<Compass size={16} color={Colors.text} />}
              onPress={() => {}}
            />
            <SecondaryButton
              title="Emergency Pack Stop"
              variant="danger"
              icon={<ShieldAlert size={16} color={Colors.red} />}
              onPress={() => {}}
            />
            <SecondaryButton
              title="Ghost Action"
              variant="ghost"
              onPress={() => {}}
            />
          </View>
        </GlassCard>
      </View>

      {/* 4. ICONBUTTONS & PILLS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. ICON BUTTONS & PILLS</Text>
        <GlassCard>
          <View style={styles.iconRow}>
            <IconButton icon={<Zap size={20} color={Colors.blue} />} accessibilityLabel="Quick Pulse" />
            <IconButton icon={<Radio size={20} color={Colors.violet} />} accessibilityLabel="Mesh Comms" />
            <IconButton icon={<PhoneCall size={20} color={Colors.green} />} accessibilityLabel="Voice Call" />
            <IconButton icon={<ShieldAlert size={20} color={Colors.red} />} variant="danger" accessibilityLabel="Alert" />
            <IconButton icon={<Navigation size={20} color="#000000" />} variant="primary" accessibilityLabel="GPS" />
          </View>

          <View style={styles.pillWrap}>
            <Pill label="INDIA LOCALE" tone="green" icon={<IndianRupee size={12} color={Colors.green} />} />
            <Pill label="85 KM/H TELEMETRY" tone="blue" />
            <Pill label="VIOLET PACK" tone="violet" />
            <Pill label="HAZARD PING" tone="red" />
            <Pill label="OFFLINE GPX" tone="neutral" />
          </View>
        </GlassCard>
      </View>

      {/* 5. AVATAR & AVATARSTACK */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. AVATARS & OVERLAPPING STACK</Text>
        <GlassCard>
          <View style={styles.avatarRow}>
            <View style={styles.avatarItem}>
              <Avatar name="Aarav Sharma" size="lg" isLive />
              <Text style={Typography.caption}>Large + Live</Text>
            </View>
            <View style={styles.avatarItem}>
              <Avatar name="Vikram Singh" size="md" />
              <Text style={Typography.caption}>Medium</Text>
            </View>
            <View style={styles.avatarItem}>
              <Avatar name="Kavya Nair" size="sm" isLive />
              <Text style={Typography.caption}>Small</Text>
            </View>
          </View>

          <View style={{ marginTop: Spacing.lg }}>
            <Text style={[Typography.caption, { marginBottom: Spacing.sm }]}>OVERLAPPING AVATAR STACK (+N COUNTER)</Text>
            <AvatarStack users={sampleRiders} max={4} size="md" />
          </View>
        </GlassCard>
      </View>

      {/* 6. HAPTICTAB COMPONENT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. HAPTICTAB (SELECTION FEEDBACK + GLOW DOT)</Text>
        <GlassCard>
          <View style={styles.tabBar}>
            <HapticTab
              label="Home"
              active={activeTab === 'home'}
              icon={<Zap size={20} color={activeTab === 'home' ? Colors.blue : Colors.textMuted} />}
              onPress={() => setActiveTab('home')}
            />
            <HapticTab
              label="Pack"
              active={activeTab === 'pack'}
              badgeCount={3}
              icon={<Compass size={20} color={activeTab === 'pack' ? Colors.blue : Colors.textMuted} />}
              onPress={() => setActiveTab('pack')}
            />
            <HapticTab
              label="Splits"
              active={activeTab === 'splits'}
              icon={<Receipt size={20} color={activeTab === 'splits' ? Colors.blue : Colors.textMuted} />}
              onPress={() => setActiveTab('splits')}
            />
            <HapticTab
              label="Discover"
              active={activeTab === 'discover'}
              icon={<Users size={20} color={activeTab === 'discover' ? Colors.blue : Colors.textMuted} />}
              onPress={() => setActiveTab('discover')}
            />
          </View>
        </GlassCard>
      </View>

      {/* 7. ANIMATED NUMBER COUNTERS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. ANIMATED NUMBER COUNTERS</Text>
        <GlassCard>
          <View style={styles.counterRow}>
            <View>
              <Text style={Typography.caption}>EXPENSE SPLIT</Text>
              <AnimatedNumber value={counterValue} prefix="₹" />
            </View>
            <View style={styles.counterActions}>
              <IconButton
                icon={<Minus size={16} color={Colors.text} />}
                size={38}
                onPress={() => setCounterValue((v) => Math.max(0, v - 250))}
                accessibilityLabel="Subtract 250 Rupees"
              />
              <IconButton
                icon={<Plus size={16} color={Colors.text} />}
                size={38}
                onPress={() => setCounterValue((v) => v + 350)}
                accessibilityLabel="Add 350 Rupees"
              />
            </View>
          </View>

          <View style={[styles.counterRow, { marginTop: Spacing.lg }]}>
            <View>
              <Text style={Typography.caption}>SPEED TELEMETRY</Text>
              <AnimatedNumber value={speedValue} suffix=" km/h" style={{ color: Colors.blue }} />
            </View>
            <View style={styles.counterActions}>
              <IconButton
                icon={<Minus size={16} color={Colors.text} />}
                size={38}
                onPress={() => setSpeedValue((v) => Math.max(0, v - 15))}
                accessibilityLabel="Decrease speed"
              />
              <IconButton
                icon={<Plus size={16} color={Colors.text} />}
                size={38}
                onPress={() => setSpeedValue((v) => Math.min(220, v + 20))}
                accessibilityLabel="Increase speed"
              />
            </View>
          </View>
        </GlassCard>
      </View>

      {/* 8. SKELETON SHIMMER LOADERS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. SHIMMER SKELETONS (NO SPINNERS)</Text>
        <GlassCard variant="subtle">
          <Skeleton width="45%" height={22} borderRadius={6} />
          <View style={{ height: Spacing.sm }} />
          <Skeleton width="90%" height={14} borderRadius={4} />
          <View style={{ height: Spacing.xs }} />
          <Skeleton width="75%" height={14} borderRadius={4} />
          <View style={{ height: Spacing.md }} />
          <Skeleton width="100%" height={TouchTargets.primaryButtonHeight} borderRadius={Radii.button} />
        </GlassCard>
      </View>

      {/* 9. BOTTOM SHEET DEMO TRIGGER */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. GESTURE-DISMISSIBLE BOTTOM SHEET</Text>
        <GlassCard glow="blue">
          <Text style={Typography.headline}>Interactive Rider Sheet</Text>
          <Text style={[Typography.body, { marginVertical: Spacing.xs }]} numberOfLines={2}>
            Tap below to trigger the Reanimated gesture-driven sheet with smooth spring physics.
          </Text>
          <View style={{ marginTop: Spacing.md }}>
            <PrimaryButton
              title="Open Rider Sheet"
              icon={<Sliders size={18} color="#000000" />}
              onPress={() => setSheetVisible(true)}
            />
          </View>
        </GlassCard>
      </View>

      {/* BOTTOM SHEET INSTANCE */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)}>
        <View style={styles.sheetHeader}>
          <Avatar name="Aarav Sharma" size="lg" isLive />
          <View style={{ flex: 1 }}>
            <Text style={Typography.title}>Aarav Sharma</Text>
            <Text style={Typography.caption}>Road Captain • Royal Enfield GT 650</Text>
          </View>
          <Pill label="LEAD" tone="blue" />
        </View>

        <View style={styles.sheetTelemetry}>
          <View style={styles.statBox}>
            <Text style={Typography.caption}>SPEED</Text>
            <Text style={Typography.telemetryMono}>85 km/h</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={Typography.caption}>DISTANCE</Text>
            <Text style={Typography.telemetryMono}>+0.0 km</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={Typography.caption}>BATTERY</Text>
            <Text style={[Typography.telemetryMono, { color: Colors.green }]}>94%</Text>
          </View>
        </View>

        <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
          <PrimaryButton
            title="Start Direct Comms"
            icon={<PhoneCall size={18} color="#000000" />}
            onPress={() => setSheetVisible(false)}
          />
          <SecondaryButton
            title="Dismiss Sheet"
            variant="glass"
            onPress={() => setSheetVisible(false)}
          />
        </View>
      </BottomSheet>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: Colors.text,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  stack: {
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  swatch: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  swatchText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.text,
  },
  swatchHex: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  buttonStack: {
    gap: Spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  avatarItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 10, 16, 0.95)',
    borderRadius: Radii.card,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sheetTelemetry: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statBox: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: Radii.sm,
    alignItems: 'center',
    gap: Spacing.xxs,
  },
})
