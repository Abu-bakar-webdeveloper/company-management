import type { KpiTemplateCategory, KpiTemplateSnapshot } from './kpi-template.model.js'
import type { PerformanceLevel } from './performance-review.model.js'

export type KpiScoreInput = {
  subKpiId: string
  marksObtained: number
  remarks?: string
}

export type CategoryScoreResult = {
  name: string
  maxMarks: number
  obtained: number
}

export type KpiScoreResult = {
  categoryScores: CategoryScoreResult[]
  totalScore: number
  bonus: number
  penalty: number
  finalAdjustedScore: number
  performanceLevel: PerformanceLevel
}

export function scoreToPerformanceLevel(finalAdjustedScore: number): PerformanceLevel {
  if (finalAdjustedScore >= 90) return 'excellent'
  if (finalAdjustedScore >= 75) return 'good'
  if (finalAdjustedScore >= 60) return 'needs_improvement'
  return 'poor'
}

/** Legacy star bands kept for reviews without KPI scores. */
export function ratingToLegacyStatus(
  rating: number,
): 'excellent' | 'good' | 'average' | 'critical' {
  if (rating >= 4.5) return 'excellent'
  if (rating >= 4.0) return 'good'
  if (rating >= 3.5) return 'average'
  return 'critical'
}

export function resolvePerformanceStatus(input: {
  finalAdjustedScore?: number | null
  rating?: number | null
}): PerformanceLevel | 'average' | 'critical' | null {
  if (input.finalAdjustedScore != null && Number.isFinite(input.finalAdjustedScore)) {
    return scoreToPerformanceLevel(input.finalAdjustedScore)
  }
  if (input.rating != null && Number.isFinite(input.rating)) {
    return ratingToLegacyStatus(input.rating)
  }
  return null
}

export function buildTemplateSnapshot(
  categories: KpiTemplateCategory[],
  meta: { name: string; role: 'employee' | 'manager'; version: number },
): KpiTemplateSnapshot {
  return {
    name: meta.name,
    role: meta.role,
    version: meta.version,
    categories: categories.map((category) => ({
      name: category.name,
      weightPct: category.weightPct,
      maxMarks: category.maxMarks,
      subKpis: category.subKpis.map((sub) => ({
        id: sub.id,
        label: sub.label,
        maxMarks: sub.maxMarks,
      })),
    })),
  }
}

export function validateKpiScoresAgainstTemplate(
  categories: KpiTemplateCategory[],
  scores: KpiScoreInput[],
): string | null {
  const maxById = new Map<string, number>()
  for (const category of categories) {
    for (const sub of category.subKpis) {
      maxById.set(sub.id, sub.maxMarks)
    }
  }

  for (const score of scores) {
    const max = maxById.get(score.subKpiId)
    if (max == null) {
      return `Unknown sub-KPI: ${score.subKpiId}`
    }
    if (!Number.isFinite(score.marksObtained) || score.marksObtained < 0) {
      return `Marks must be >= 0 for ${score.subKpiId}`
    }
    if (score.marksObtained > max) {
      return `Marks for ${score.subKpiId} cannot exceed ${max}`
    }
  }

  return null
}

/** Keep final adjusted score in 0–100: bonus cannot push above 100, penalty cannot push below 0. */
export function clampBonusPenalty(
  totalScore: number,
  bonus: number,
  penalty: number,
): {
  bonus: number
  penalty: number
  finalAdjustedScore: number
  maxBonus: number
  maxPenalty: number
} {
  const total = Math.max(0, Number.isFinite(totalScore) ? totalScore : 0)
  const maxBonus = Math.max(0, Math.round((100 - total) * 100) / 100)
  let safeBonus = Number.isFinite(bonus) ? Math.max(0, bonus) : 0
  safeBonus = Math.min(safeBonus, maxBonus)
  safeBonus = Math.round(safeBonus * 100) / 100

  const maxPenalty = Math.round((total + safeBonus) * 100) / 100
  let safePenalty = Number.isFinite(penalty) ? Math.max(0, penalty) : 0
  safePenalty = Math.min(safePenalty, maxPenalty)
  safePenalty = Math.round(safePenalty * 100) / 100

  const finalAdjustedScore = Math.round((total + safeBonus - safePenalty) * 100) / 100
  return {
    bonus: safeBonus,
    penalty: safePenalty,
    finalAdjustedScore: Math.max(0, Math.min(100, finalAdjustedScore)),
    maxBonus,
    maxPenalty,
  }
}

export function validateBonusPenaltyLimits(
  totalScore: number,
  bonus: number,
  penalty: number,
): string | null {
  if (!Number.isFinite(bonus) || bonus < 0) return 'Bonus must be 0 or greater'
  if (!Number.isFinite(penalty) || penalty < 0) return 'Penalty must be 0 or greater'

  const total = Math.max(0, Number.isFinite(totalScore) ? totalScore : 0)
  const maxBonus = Math.max(0, Math.round((100 - total) * 100) / 100)
  if (bonus > maxBonus + 1e-9) {
    return `Bonus cannot exceed ${maxBonus} (final score cannot go above 100)`
  }

  const maxPenalty = Math.round((total + bonus) * 100) / 100
  if (penalty > maxPenalty + 1e-9) {
    return `Penalty cannot exceed ${maxPenalty} (final score cannot go below 0)`
  }

  return null
}

export function computeKpiScores(
  categories: KpiTemplateCategory[],
  scores: KpiScoreInput[],
  bonus = 0,
  penalty = 0,
): KpiScoreResult {
  const obtainedById = new Map(scores.map((s) => [s.subKpiId, s.marksObtained]))

  const categoryScores: CategoryScoreResult[] = categories.map((category) => {
    const obtained = category.subKpis.reduce((sum, sub) => {
      return sum + (obtainedById.get(sub.id) ?? 0)
    }, 0)
    return {
      name: category.name,
      maxMarks: category.maxMarks,
      obtained: Math.round(obtained * 100) / 100,
    }
  })

  const totalScore =
    Math.round(categoryScores.reduce((sum, c) => sum + c.obtained, 0) * 100) / 100
  const clamped = clampBonusPenalty(totalScore, bonus, penalty)

  return {
    categoryScores,
    totalScore,
    bonus: clamped.bonus,
    penalty: clamped.penalty,
    finalAdjustedScore: clamped.finalAdjustedScore,
    performanceLevel: scoreToPerformanceLevel(clamped.finalAdjustedScore),
  }
}

export function computeValueIndex(input: {
  finalAdjustedScore: number
  outputValue: number
  effortInput: number
}): number {
  const effort = Math.max(input.effortInput, 1)
  return Math.round(((input.finalAdjustedScore * input.outputValue) / effort) * 100) / 100
}

export function computeFinancialRoi(businessValue: number, cost: number): number | null {
  if (!Number.isFinite(cost) || cost <= 0) return null
  if (!Number.isFinite(businessValue)) return null
  return Math.round(((businessValue - cost) / cost) * 10000) / 10000
}
