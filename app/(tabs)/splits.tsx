import React, { useState } from 'react'
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
  Plus,
  Receipt,
  CheckCircle2,
  Fuel,
  Coffee,
  Car,
  Wrench,
  Check,
  X,
  ArrowRightLeft,
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
import { useExpenses } from '@/lib/data'
import { useAppStore } from '@/store/useAppStore'
import { useLocalSearchParams } from 'expo-router'
import { uid } from '@/lib/format'

interface MemberBalance {
  id: string
  name: string
  initials: string
  amount: number
  type: 'owes_you' | 'you_owe' | 'settled'
  forRide: string
}

const INITIAL_BALANCES: MemberBalance[] = [
  {
    id: 'b1',
    name: 'Kabir Mehta',
    initials: 'KM',
    amount: 450,
    type: 'owes_you',
    forRide: 'Haveli Highway Breakfast',
  },
  {
    id: 'b2',
    name: 'Simran Kaur',
    initials: 'SK',
    amount: 220,
    type: 'you_owe',
    forRide: 'Ridge Chai & Tolls',
  },
  {
    id: 'b3',
    name: 'Harleen Sethi',
    initials: 'HS',
    amount: 539,
    type: 'owes_you',
    forRide: 'HP Petrol Pump, Karnal',
  },
  {
    id: 'b4',
    name: 'Devansh Chauhan',
    initials: 'DC',
    amount: 200,
    type: 'owes_you',
    forRide: 'Dharampur Parking',
  },
]

export default function SplitsScreen() {
  const { data: expenses } = useExpenses()
  const params = useLocalSearchParams<{ sheet?: string }>()
  const pushToast = useAppStore((state) => state.pushToast)
  const addExpense = useAppStore((state) => state.addExpense)

  const [balances, setBalances] = useState<MemberBalance[]>(INITIAL_BALANCES)
  const [addSheetOpen, setAddSheetOpen] = useState(params.sheet === 'add')

  // New expense form state
  const [expenseAmount, setExpenseAmount] = useState('2400')
  const [expenseTitle, setExpenseTitle] = useState('Highway Dhaba Stop')
  const [selectedCategory, setSelectedCategory] = useState<'fuel' | 'food' | 'toll' | 'spares'>('food')

  // Calculate net balance
  const netPackOwes = balances.reduce((acc, curr) => {
    if (curr.type === 'owes_you') return acc + curr.amount
    if (curr.type === 'you_owe') return acc - curr.amount
    return acc
  }, 0)

  const handleSettle = (id: string, name: string) => {
    triggerHaptic('success')
    setBalances((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, type: 'settled', amount: 0 } : item
      )
    )
    pushToast('Settlement Recorded', `All debts with ${name} are settled`, 'success')
  }

  const handleCreateExpense = () => {
    const parsedAmount = parseInt(expenseAmount, 10) || 0
    if (parsedAmount <= 0) return

    triggerHaptic('success')
    addExpense({
      id: uid('exp'),
      rideId: 'r_sunrise',
      paidByUserId: 'u_arjun',
      title: expenseTitle,
      amount: parsedAmount,
      currency: 'INR',
      perRiderShare: Math.round(parsedAmount / 4),
      splitCount: 4,
      lineItems: [{ label: expenseTitle, qty: 1, price: parsedAmount }],
      createdAt: new Date().toISOString(),
    })

    // Update balances
    setBalances((prev) => [
      {
        id: uid('bal'),
        name: 'Kabir Mehta',
        initials: 'KM',
        amount: Math.round(parsedAmount / 4),
        type: 'owes_you',
        forRide: expenseTitle,
      },
      ...prev,
    ])

    setAddSheetOpen(false)
    pushToast('Expense Split with Pack', `₹${parsedAmount} split among 4 riders`, 'success')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PACK SPLITS</Text>
          <Pill
            label="UPI AUTOPAY ACTIVE"
            tone="green"
            size="sm"
            icon={<CheckCircle2 size={10} color={Colors.green} />}
          />
        </View>

        {/* 1. Big Summary Card */}
        <GlassCard glow="blue" style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>NET PACK BALANCE</Text>
          <View style={styles.summaryAmountRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <AnimatedNumber
              value={Math.abs(netPackOwes)}
              style={styles.bigAmount}
            />
          </View>
          <Text style={styles.summarySubtext}>
            {netPackOwes >= 0 ? 'Pack owes you ₹' + netPackOwes : 'You owe ₹' + Math.abs(netPackOwes)}
          </Text>

          <View style={styles.summaryFooterRow}>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeLabel}>ACTIVE SPLITS</Text>
              <Text style={styles.summaryBadgeVal}>3 Rides</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeLabel}>TOTAL SPENT</Text>
              <Text style={styles.summaryBadgeVal}>₹7,890</Text>
            </View>
          </View>
        </GlassCard>

        {/* 2. Per-Person Owed Breakdown List */}
        <View style={styles.breakdownHeaderRow}>
          <Text style={styles.sectionTitle}>MEMBER BALANCES</Text>
          <Text style={styles.sectionSubtitle}>Tap Settle to clear via UPI</Text>
        </View>

        <View style={styles.balancesList}>
          {balances.map((item) => {
            const isSettled = item.type === 'settled'
            const isOwed = item.type === 'owes_you'

            return (
              <GlassCard key={item.id} style={styles.balanceCard}>
                <View style={styles.balanceLeft}>
                  <Avatar
                    name={item.name}
                    size={36}
                  />
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceName}>{item.name}</Text>
                    <Text style={styles.balanceRide} numberOfLines={1}>
                      {item.forRide}
                    </Text>
                  </View>
                </View>

                <View style={styles.balanceRight}>
                  {isSettled ? (
                    <View style={styles.settledBadge}>
                      <Check size={12} color={Colors.green} />
                      <Text style={styles.settledText}>SETTLED</Text>
                    </View>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.balanceAmount,
                          isOwed ? styles.amountGreen : styles.amountRed,
                        ]}
                      >
                        {isOwed ? `+₹${item.amount}` : `-₹${item.amount}`}
                      </Text>
                      <Pressable
                        style={styles.settleButton}
                        onPress={() => handleSettle(item.id, item.name)}
                        accessibilityRole="button"
                        accessibilityLabel={`Settle balance with ${item.name}`}
                      >
                        <Text style={styles.settleButtonText}>Settle</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </GlassCard>
            )
          })}
        </View>

        {/* Bottom spacer for floating action & tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating "+ Add Expense" Button (56px) */}
      <View style={styles.floatingActionWrapper}>
        <PrimaryButton
          title="Add Expense"
          icon={<Plus size={18} color="#000000" />}
          onPress={() => {
            triggerHaptic('light')
            setAddSheetOpen(true)
          }}
          style={styles.addExpenseButton}
        />
      </View>

      {/* Quick Add Expense BottomSheet */}
      <BottomSheet
        visible={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        maxHeight={520}
      >
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>Split New Expense</Text>
            <Text style={styles.sheetSubtitle}>Divided equally across 4 riders</Text>
          </View>
          <Pressable
            onPress={() => setAddSheetOpen(false)}
            style={styles.sheetCloseButton}
          >
            <X size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Amount Input */}
        <View style={styles.amountInputContainer}>
          <Text style={styles.inputPrefix}>₹</Text>
          <TextInput
            style={styles.amountInput}
            value={expenseAmount}
            onChangeText={setExpenseAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Preset Chips */}
        <View style={styles.presetChipsRow}>
          {['500', '1200', '2400', '4800'].map((val) => (
            <Pressable
              key={val}
              style={[
                styles.presetChip,
                expenseAmount === val && styles.presetChipActive,
              ]}
              onPress={() => {
                triggerHaptic('selection')
                setExpenseAmount(val)
              }}
            >
              <Text
                style={[
                  styles.presetChipText,
                  expenseAmount === val && styles.presetChipTextActive,
                ]}
              >
                ₹{val}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Category Picker */}
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <View style={styles.categoryRow}>
          {[
            { id: 'food', label: 'Dhaba / Food', Icon: Coffee },
            { id: 'fuel', label: 'Petrol', Icon: Fuel },
            { id: 'toll', label: 'Tolls', Icon: Car },
            { id: 'spares', label: 'Spares', Icon: Wrench },
          ].map(({ id, label, Icon }) => {
            const isSel = selectedCategory === id
            return (
              <Pressable
                key={id}
                style={[styles.categoryCard, isSel && styles.categoryCardActive]}
                onPress={() => {
                  triggerHaptic('selection')
                  setSelectedCategory(id as any)
                  setExpenseTitle(label)
                }}
              >
                <Icon
                  size={16}
                  color={isSel ? Colors.blue : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.categoryText,
                    isSel && styles.categoryTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title="Split with Pack"
          onPress={handleCreateExpense}
          style={styles.sheetSubmitButton}
        />
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
  summaryCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  summaryLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  summaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: Spacing.xs,
  },
  currencySymbol: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: Colors.blue,
    marginRight: 2,
  },
  bigAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 34,
    color: Colors.text,
  },
  summarySubtext: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
    gap: Spacing.xl,
  },
  summaryBadge: {
    alignItems: 'center',
  },
  summaryBadgeLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 9,
    color: Colors.textMuted,
  },
  summaryBadgeVal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: Colors.text,
    marginTop: 1,
  },
  summaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  breakdownHeaderRow: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  balancesList: {
    gap: Spacing.sm,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.text,
  },
  balanceRide: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  balanceRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  balanceAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
  },
  amountGreen: {
    color: Colors.green,
  },
  amountRed: {
    color: Colors.red,
  },
  settleButton: {
    backgroundColor: 'rgba(16, 177, 251, 0.12)',
    borderWidth: 1,
    borderColor: Colors.blueBorder,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  settleButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: Colors.blue,
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  settledText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: Colors.green,
  },
  bottomSpacer: {
    height: 160,
  },
  floatingActionWrapper: {
    position: 'absolute',
    bottom: 96,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 50,
  },
  addExpenseButton: {
    width: '100%',
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
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  inputPrefix: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: Colors.blue,
    marginRight: 4,
  },
  amountInput: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: Colors.text,
    minWidth: 120,
    textAlign: 'left',
  },
  presetChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.sm,
  },
  presetChipActive: {
    borderColor: Colors.blueBorder,
    backgroundColor: 'rgba(16, 177, 251, 0.1)',
  },
  presetChipText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  presetChipTextActive: {
    color: Colors.blue,
  },
  fieldLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radii.sm,
    flexBasis: '47%',
  },
  categoryCardActive: {
    borderColor: Colors.blueBorder,
    backgroundColor: 'rgba(16, 177, 251, 0.1)',
  },
  categoryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.text,
  },
  sheetSubmitButton: {
    width: '100%',
  },
})
