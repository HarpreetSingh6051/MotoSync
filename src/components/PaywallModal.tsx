import { useMemo, useState } from 'react'
import { Check, Sparkles, Zap } from 'lucide-react'
import { Button, Divider, Modal, Segmented } from '@/components/ui'
import { GoldenHelmetBadge } from '@/components/brand/GoldenHelmetBadge'
import { useAppStore } from '@/store/useAppStore'
import { useConfigStore } from '@/store/useConfigStore'
import { currentUserId } from '@/lib/mockData'
import { money } from '@/lib/format'

const fallbackFeatures = [
  '4K watermark-free reels',
  'Pack spread / fall-behind alerts',
  'Offline mountain GPX',
  'Family tracking web links',
  'Helmet intercom bridge',
  'Unlimited AI tank splits',
]

export const PaywallModal = () => {
  const paywall = useAppStore((state) => state.paywall)
  const closePaywall = useAppStore((state) => state.closePaywall)
  const isPro = useAppStore((state) => state.isPro)
  const planId = useAppStore((state) => state.planId)
  const planBadge = useAppStore((state) => state.planBadge)
  const setPlan = useAppStore((state) => state.setPlan)
  const pushToast = useAppStore((state) => state.pushToast)
  const plans = useConfigStore((state) => state.plans)
  const setUserOverride = useConfigStore((state) => state.setUserOverride)

  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')
  const [region, setRegion] = useState<'IN' | 'GLOBAL'>('IN')
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const currentPlan = plans.find((plan) => plan.id === planId)
  const cyclePlans = useMemo(
    () =>
      plans
        .filter(
          (plan) =>
            plan.isActive &&
            plan.audience === 'rider' &&
            plan.billingInterval === cycle,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [plans, cycle],
  )
  const selected =
    cyclePlans.find((plan) => plan.id === selectedId) ??
    cyclePlans[0] ??
    plans.find((plan) => plan.id === planId) ??
    plans[0]

  const currency = region === 'IN' ? 'INR' : 'USD'
  const price = selected
    ? region === 'IN'
      ? selected.priceInr
      : selected.priceUsd
    : 0
  const perMonth =
    selected?.billingInterval === 'annual' ? Math.round((price / 12) * 100) / 100 : price
  const features =
    selected && selected.features.length ? selected.features : fallbackFeatures
  const activeBadge = isPro ? planBadge : selected?.badgeType ?? 'golden_helmet'

  const activate = async () => {
    if (!selected) return
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setLoading(false)

    const pro = selected.priceInr > 0 || selected.priceUsd > 0
    setPlan(selected.id, selected.badgeType, pro, true)
    setUserOverride(currentUserId, { planId: selected.id, isPro: pro })
    pushToast(
      pro ? `${selected.name} unlocked` : 'Free Rider restored',
      pro
        ? 'Your plan is live on this device and in the Super Admin ERP.'
        : 'You can upgrade again any time.',
      pro ? 'success' : 'default',
    )
    closePaywall()
  }

  if (!selected) {
    return (
      <Modal
        open={Boolean(paywall?.open)}
        onClose={closePaywall}
        size="md"
        title="Plans are being restocked"
        subtitle="The Super Admin has paused every rider plan."
      >
        <p className="pb-4 text-xs leading-relaxed text-white/50">
          Ask the Kixup team to activate a plan in the Super Admin ERP, then try again.
        </p>
      </Modal>
    )
  }

  return (
    <Modal
      open={Boolean(paywall?.open)}
      onClose={closePaywall}
      size="md"
      title={isPro ? 'Your Golden Helmet is active' : 'Kixup PRO'}
      subtitle={
        isPro
          ? `${currentPlan?.name ?? 'Road Captain PRO'} · every pack tool is unlocked on this device.`
          : paywall?.reason ?? 'The full toolkit for riders who lead the pack.'
      }
    >
      <div className="relative mb-5 overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/15 via-crimson-500/10 to-cyber-500/10 p-5">
        <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10">
            <GoldenHelmetBadge badgeType={activeBadge} size="lg" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-white">
              {isPro ? 'Ride like a captain, not a passenger.' : 'Kickstands up. Pack connected.'}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/55">
              12,400+ riders run Sunday packs on Kixup. PRO pays for itself in one tank
              split.
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-2">
          <span className="flex -space-x-2">
            {['#F43F5E', '#22D3EE', '#FBBF24', '#A78BFA'].map((color, index) => (
              <span
                key={color}
                className="h-6 w-6 rounded-full border-2 border-ink-900"
                style={{ background: `linear-gradient(135deg, ${color}, #1b1b2b)` }}
              >
                <span className="flex h-full w-full items-center justify-center text-[8px] font-bold text-white/90">
                  {['AS', 'SK', 'KM', 'AR'][index]}
                </span>
              </span>
            ))}
          </span>
          <span className="text-[10px] text-white/45">
            <span className="font-semibold text-amber-300">★★★★★</span> 4.9 from 2,180 riders
          </span>
        </div>
      </div>

      {isPro ? (
        <div className="space-y-3 pb-2">
          {features.slice(0, 6).map((feature) => (
            <div key={feature} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pack-500/20 text-pack-400">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <p className="text-xs leading-relaxed text-white/60">{feature}</p>
            </div>
          ))}
          <Divider className="my-4" />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              full
              onClick={() => {
                pushToast(
                  'Subscription manager',
                  'Billing is handled by Razorpay / Lemon Squeezy in production.',
                  'default',
                )
                closePaywall()
              }}
            >
              Manage billing
            </Button>
            <Button variant="ghost" full onClick={closePaywall}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRegion('IN')}
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                region === 'IN'
                  ? 'border-crimson-500/50 bg-crimson-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <p className="text-xs font-semibold text-white">🇮🇳 India</p>
              <p className="mt-0.5 text-[10px] text-white/40">UPI AutoPay · Razorpay</p>
            </button>
            <button
              type="button"
              onClick={() => setRegion('GLOBAL')}
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                region === 'GLOBAL'
                  ? 'border-cyber-400/50 bg-cyber-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <p className="text-xs font-semibold text-white">🌍 Global</p>
              <p className="mt-0.5 text-[10px] text-white/40">Cards · Apple Pay</p>
            </button>
          </div>

          <Segmented
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'annual', label: 'Annual · save 37%' },
            ]}
            value={cycle}
            onChange={setCycle}
            className="mb-4"
          />

          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {cyclePlans.map((plan) => {
              const active = plan.id === selected.id
              const planPrice = region === 'IN' ? plan.priceInr : plan.priceUsd
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedId(plan.id)}
                  className={`relative rounded-2xl border p-3 text-left transition ${
                    active
                      ? 'border-amber-400/50 bg-amber-400/[0.08]'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/55">
                      <GoldenHelmetBadge badgeType={plan.badgeType} size="xs" />
                      {plan.name}
                    </span>
                    {plan.isPopular ? (
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-300">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 font-display text-base font-bold text-white">
                    {money(planPrice, currency)}
                    <span className="ml-1 text-[9px] font-medium text-white/35">
                      /{plan.billingInterval === 'annual' ? 'yr' : 'mo'}
                    </span>
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed text-white/35">
                    {plan.tagline}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="mb-4 flex items-end justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div>
              <p className="font-display text-3xl font-bold tracking-tight text-white">
                {money(price, currency)}
                <span className="ml-1 text-xs font-medium text-white/40">
                  /{selected.billingInterval === 'annual' ? 'yr' : 'mo'}
                </span>
              </p>
              <p className="mt-1 text-[10px] text-white/40">
                {selected.billingInterval === 'annual'
                  ? `${money(perMonth, currency)}/mo billed yearly · cancel anytime`
                  : 'Billed monthly · cancel anytime'}
              </p>
            </div>
            <span className="rounded-full border border-pack-400/30 bg-pack-500/10 px-2.5 py-1 text-[10px] font-bold text-pack-400">
              7-day free trial
            </span>
          </div>

          <div className="space-y-3 pb-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-crimson-500/15 text-crimson-400">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <p className="text-xs leading-relaxed text-white/55">{feature}</p>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-white/[0.07] bg-ink-900/95 px-5 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
            <Button
              full
              size="lg"
              loading={loading}
              icon={<Zap className="h-4 w-4" />}
              onClick={activate}
            >
              Activate {selected.name}
            </Button>
            <p className="mt-2 text-center text-[10px] leading-relaxed text-white/30">
              Demo build — no card is charged. Production wires Razorpay Subscriptions
              (UPI AutoPay) and Lemon Squeezy (global MoR).
            </p>
          </div>
        </>
      )}

      <p className="flex items-center justify-center gap-1.5 pb-2 text-[10px] text-white/25">
        <Sparkles className="h-3 w-3" /> Prices in{' '}
        {region === 'IN' ? 'INR incl. GST' : 'USD excl. local tax'}
      </p>
    </Modal>
  )
}
