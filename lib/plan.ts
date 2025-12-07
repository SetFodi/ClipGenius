import { PLAN_LIMITS, type PlanId } from './constants'

export interface UsageLimits {
  plan: PlanId
  maxVideos: number
  maxClips: number
}

export function resolvePlan(rawPlan?: string | null): PlanId {
  if (rawPlan === 'creator' || rawPlan === 'pro') return rawPlan
  return 'free'
}

export function getLimitsForPlan(plan: PlanId): UsageLimits {
  const limits = PLAN_LIMITS[plan]
  return {
    plan,
    maxVideos: limits.maxVideos,
    maxClips: limits.maxClips,
  }
}


