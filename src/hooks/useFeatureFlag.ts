import { useConfigStore } from '@/store/useConfigStore'
import { useAppStore } from '@/store/useAppStore'
import { currentUserId } from '@/lib/mockData'
import { hashCode } from '@/lib/format'

/**
 * A flag is available only when:
 *  - the Super Admin has it enabled,
 *  - the rider's entitlement satisfies the access level, and
 *  - the rider falls inside the deterministic rollout bucket.
 */
export const useFeatureFlag = (key: string) => {
  const flag = useConfigStore((state) => state.flags.find((item) => item.key === key))
  const isPro = useAppStore((state) => state.isPro)

  const enabled = flag?.isEnabled ?? true
  const access = flag?.accessLevel ?? 'all'
  const rollout = flag?.rolloutPercentage ?? 100
  const inRollout = rollout >= 100 || hashCode(currentUserId) % 100 < rollout

  const allowed =
    access === 'all' ||
    ((access === 'pro_only' || access === 'club_admins' || access === 'beta_testers') && isPro)

  return {
    flag,
    enabled,
    allowed,
    inRollout,
    available: enabled && allowed && inRollout,
  }
}
