import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import {
  Radio,
  Phone,
  AlertTriangle,
  BatteryCharging,
  Gauge,
  Navigation,
  ShieldAlert,
  Check,
  X,
  Compass,
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
  AnimatedNumber,
  Avatar,
} from '@/components/ui'
import { triggerHaptic } from '@/lib/haptics'
import { useAppStore } from '@/store/useAppStore'
import { useLocalSearchParams } from 'expo-router'

interface PackRider {
  id: string
  name: string
  role: 'Road Captain' | 'Tail Sweep' | 'Scout' | 'Pack Member'
  bike: string
  battery: number
  speedKmh: number
  distanceFromLeadM: number
  color: string
  coords: { x: number; y: number }
  status: 'active' | 'warning' | 'idle'
}

const MOCK_RIDERS: PackRider[] = [
  {
    id: 'u_kabir',
    name: 'Kabir Mehta',
    role: 'Scout',
    bike: 'Triumph Scrambler 900',
    battery: 92,
    speedKmh: 86,
    distanceFromLeadM: 0,
    color: Colors.blue,
    coords: { x: 230, y: 140 },
    status: 'active',
  },
  {
    id: 'u_arjun',
    name: 'Arjun Singh (You)',
    role: 'Road Captain',
    bike: 'Harley-Davidson Fat Bob 114',
    battery: 88,
    speedKmh: 84,
    distanceFromLeadM: 85,
    color: Colors.blue,
    coords: { x: 175, y: 220 },
    status: 'active',
  },
  {
    id: 'u_simran',
    name: 'Simran Kaur',
    role: 'Pack Member',
    bike: 'Royal Enfield Himalayan 450',
    battery: 79,
    speedKmh: 82,
    distanceFromLeadM: 190,
    color: Colors.violet,
    coords: { x: 130, y: 310 },
    status: 'active',
  },
  {
    id: 'u_dev',
    name: 'Devansh Chauhan',
    role: 'Tail Sweep',
    bike: 'RE Continental GT 650',
    battery: 64,
    speedKmh: 80,
    distanceFromLeadM: 340,
    color: Colors.green,
    coords: { x: 75, y: 400 },
    status: 'active',
  },
]

export default function PackScreen() {
  const { width } = useWindowDimensions()
  const params = useLocalSearchParams<{ rider?: string }>()
  const pushToast = useAppStore((state) => state.pushToast)

  const [hasLocationPermission, setHasLocationPermission] = useState(true)
  const [selectedRider, setSelectedRider] = useState<PackRider | null>(
    params.rider === 'true' || params.rider === '1' ? MOCK_RIDERS[0] : null
  )
  const [hazardSent, setHazardSent] = useState(false)

  const handleGrantPermission = () => {
    triggerHaptic('success')
    setHasLocationPermission(true)
    pushToast('GPS Telemetry Connected', 'Live pack radar active', 'success')
  }

  const handleCallRider = (rider: PackRider) => {
    triggerHaptic('selection')
    pushToast('Calling Rider', `Connecting helmet intercom to ${rider.name}...`, 'default')
  }

  const handleHazardPing = (rider: PackRider) => {
    triggerHaptic('warning')
    setHazardSent(true)
    pushToast('Hazard Broadcasted', 'Gravel on Apex sent to pack radar', 'danger')
    setTimeout(() => setHazardSent(false), 3000)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>PACK RADAR</Text>
          <Pill label="MOCK TELEMETRY" tone="neutral" size="sm" />
        </View>

        <Pill
          label="4 IN FORMATION"
          tone="blue"
          size="sm"
          icon={<Radio size={10} color={Colors.blue} />}
        />
      </View>

      {/* Main Map / Radar Viewport */}
      <View style={styles.mapCanvas}>
        {/* Dark Topographic Vector Route Line */}
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="radarRouteGrad" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor={Colors.blue} stopOpacity="0.8" />
              <Stop offset="0.5" stopColor={Colors.violet} stopOpacity="0.8" />
              <Stop offset="1" stopColor={Colors.blue} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Path
            d="M 20 80 Q 180 60 360 80"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M 20 180 Q 180 160 360 180"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M 20 280 Q 180 260 360 280"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M 20 380 Q 180 360 360 380"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            fill="none"
          />

          {/* Route Road (Wide Asphalt) */}
          <Path
            d="M 60 440 Q 140 290 240 120"
            stroke="#111827"
            strokeWidth="32"
            strokeLinecap="round"
            fill="none"
          />

          {/* Center Glowing Route Line */}
          <Path
            d="M 60 440 Q 140 290 240 120"
            stroke="url(#radarRouteGrad)"
            strokeWidth="4"
            strokeDasharray="6 4"
            fill="none"
          />
        </Svg>

        {/* Location Permission Flow Prompt (if disabled) */}
        {!hasLocationPermission && (
          <View style={styles.permissionPrompt}>
            <ShieldAlert size={28} color={Colors.blue} />
            <Text style={styles.permissionTitle}>Enable Pack GPS</Text>
            <Text style={styles.permissionSubtitle}>
              Broadcast telemetry and view live rider formation
            </Text>
            <PrimaryButton
              title="Connect GPS"
              onPress={handleGrantPermission}
              style={styles.permissionButton}
            />
          </View>
        )}

        {/* Pulsing Interactive Rider Dots */}
        {hasLocationPermission &&
          MOCK_RIDERS.map((rider) => (
            <Pressable
              key={rider.id}
              style={[
                styles.riderMarker,
                { left: rider.coords.x, top: rider.coords.y },
              ]}
              onPress={() => {
                triggerHaptic('selection')
                setSelectedRider(rider)
              }}
              accessibilityRole="button"
              accessibilityLabel={`Rider: ${rider.name}, ${rider.role}`}
            >
              {/* Outer Pulsing Halo */}
              <View
                style={[
                  styles.riderHalo,
                  { borderColor: rider.color, shadowColor: rider.color },
                ]}
              />

              {/* Rider Dot Core */}
              <View style={[styles.riderDot, { backgroundColor: rider.color }]}>
                <Text style={styles.riderInitials}>
                  {rider.name[0]}
                </Text>
              </View>

              {/* Mini Role Tag */}
              <View style={styles.riderMarkerTag}>
                <Text style={styles.riderMarkerTagText}>
                  {rider.role.replace('Road ', '')}
                </Text>
              </View>
            </Pressable>
          ))}

        {/* Floating Telemetry HUD Overlay (Top & Bottom) */}
        <View style={styles.hudOverlay}>
          <GlassCard style={styles.hudCard}>
            <View style={styles.hudStat}>
              <Gauge size={13} color={Colors.blue} />
              <View style={styles.hudStatValues}>
                <AnimatedNumber value={84} style={styles.hudValue} />
                <Text style={styles.hudUnit}>km/h</Text>
              </View>
            </View>

            <View style={styles.hudDivider} />

            <View style={styles.hudStat}>
              <Navigation size={13} color={Colors.violet} />
              <View>
                <Text style={styles.hudSubLabel}>SPREAD</Text>
                <Text style={styles.hudValueText}>1.4 km</Text>
              </View>
            </View>

            <View style={styles.hudDivider} />

            <View style={styles.hudStat}>
              <Compass size={13} color={Colors.green} />
              <View>
                <Text style={styles.hudSubLabel}>STYLE</Text>
                <Text style={styles.hudValueText}>STAGGERED</Text>
              </View>
            </View>
          </GlassCard>
        </View>
      </View>

      {/* Rider Detail BottomSheet */}
      <BottomSheet
        visible={Boolean(selectedRider)}
        onClose={() => setSelectedRider(null)}
        maxHeight={480}
      >
        {selectedRider && (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetRiderHeader}>
                <Avatar
                  name={selectedRider.name}
                  size={46}
                />
                <View style={styles.sheetRiderNameCol}>
                  <Text style={styles.sheetRiderName}>
                    {selectedRider.name}
                  </Text>
                  <Pill label={selectedRider.role} tone="blue" size="sm" />
                </View>
              </View>

              <Pressable
                onPress={() => setSelectedRider(null)}
                style={styles.sheetCloseButton}
              >
                <X size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {/* Rider Telemetry Card */}
            <View style={styles.telemetryCard}>
              <View style={styles.telemetryRow}>
                <Text style={styles.telemetryLabel}>PRIMARY BIKE</Text>
                <Text style={styles.telemetryVal}>{selectedRider.bike}</Text>
              </View>
              <View style={styles.telemetryRow}>
                <Text style={styles.telemetryLabel}>GAP TO LEAD</Text>
                <Text style={styles.telemetryVal}>
                  +{selectedRider.distanceFromLeadM}m
                </Text>
              </View>
              <View style={styles.telemetryRow}>
                <Text style={styles.telemetryLabel}>DEVICE BATTERY</Text>
                <View style={styles.batteryRow}>
                  <BatteryCharging size={13} color={Colors.green} />
                  <Text style={styles.telemetryVal}>{selectedRider.battery}%</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons: Call & Hazard Ping */}
            <View style={styles.sheetActionRow}>
              <SecondaryButton
                title="Call Rider"
                icon={<Phone size={16} color={Colors.blue} />}
                onPress={() => handleCallRider(selectedRider)}
                style={styles.sheetActionButton}
              />

              <SecondaryButton
                title={hazardSent ? 'Ping Broadcasted' : 'Hazard Ping'}
                icon={
                  hazardSent ? (
                    <Check size={16} color={Colors.green} />
                  ) : (
                    <AlertTriangle size={16} color={Colors.red} />
                  )
                }
                variant="danger"
                onPress={() => handleHazardPing(selectedRider)}
                style={styles.sheetActionButton}
              />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#04070D',
    position: 'relative',
    overflow: 'hidden',
  },
  permissionPrompt: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    zIndex: 30,
  },
  permissionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  permissionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  permissionButton: {
    width: 200,
  },
  riderMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    width: 60,
    height: 60,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  riderHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    opacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  riderDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  riderInitials: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: '#000000',
  },
  riderMarkerTag: {
    backgroundColor: 'rgba(10, 14, 24, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radii.pill,
    marginTop: 3,
  },
  riderMarkerTagText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 8,
    color: Colors.text,
  },
  hudOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 25,
  },
  hudCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  hudStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hudStatValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  hudValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  hudUnit: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  hudDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  hudSubLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 8,
    color: Colors.textMuted,
  },
  hudValueText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: Colors.text,
  },
  sheetContent: {
    paddingBottom: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sheetRiderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sheetRiderNameCol: {
    gap: 4,
  },
  sheetRiderName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  sheetCloseButton: {
    padding: Spacing.xs,
  },
  telemetryCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telemetryLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10,
    color: Colors.textMuted,
  },
  telemetryVal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: Colors.text,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sheetActionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sheetActionButton: {
    flex: 1,
  },
})
