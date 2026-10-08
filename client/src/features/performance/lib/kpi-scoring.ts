import type { KpiCategory, KpiScoreValue, PerformanceLevel } from '@/features/performance/model/contracts'

export function scoreToLevel(finalAdjustedScore: number): PerformanceLevel {
  if (finalAdjustedScore >= 90) return 'excellent'
  if (finalAdjustedScore >= 75) return 'good'
  if (finalAdjustedScore >= 60) return 'needs_improvement'
  return 'poor'
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

export function computeLiveKpiSummary(
  categories: KpiCategory[],
  scores: KpiScoreValue[],
  bonus: number,
  penalty: number,
) {
  const obtainedById = new Map(scores.map((s) => [s.subKpiId, s.marksObtained]))
  const categoryScores = categories.map((category) => {
    const obtained = category.subKpis.reduce(
      (sum, sub) => sum + (obtainedById.get(sub.id) ?? 0),
      0,
    )
    return { name: category.name, maxMarks: category.maxMarks, obtained }
  })
  const totalScore = categoryScores.reduce((sum, c) => sum + c.obtained, 0)
  const clamped = clampBonusPenalty(totalScore, bonus, penalty)
  return {
    categoryScores,
    totalScore,
    maxBonus: clamped.maxBonus,
    maxPenalty: clamped.maxPenalty,
    finalAdjustedScore: clamped.finalAdjustedScore,
    performanceLevel: scoreToLevel(clamped.finalAdjustedScore),
  }
}
