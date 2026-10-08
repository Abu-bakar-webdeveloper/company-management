/**
 * Lightweight scoring check against Excel sample math (Usman → 76 Good).
 * Run: node src/features/performance/performance-kpi.test.mjs
 */
import assert from 'node:assert/strict'

function scoreToPerformanceLevel(finalAdjustedScore) {
  if (finalAdjustedScore >= 90) return 'excellent'
  if (finalAdjustedScore >= 75) return 'good'
  if (finalAdjustedScore >= 60) return 'needs_improvement'
  return 'poor'
}

function clampBonusPenalty(totalScore, bonus, penalty) {
  const total = Math.max(0, totalScore)
  const maxBonus = Math.max(0, Math.round((100 - total) * 100) / 100)
  let safeBonus = Math.max(0, bonus)
  safeBonus = Math.min(safeBonus, maxBonus)
  const maxPenalty = Math.round((total + safeBonus) * 100) / 100
  let safePenalty = Math.max(0, penalty)
  safePenalty = Math.min(safePenalty, maxPenalty)
  const finalAdjustedScore = Math.max(0, Math.min(100, total + safeBonus - safePenalty))
  return { bonus: safeBonus, penalty: safePenalty, finalAdjustedScore }
}

function computeKpiScores(categories, scores, bonus = 0, penalty = 0) {
  const obtainedById = new Map(scores.map((s) => [s.subKpiId, s.marksObtained]))
  const categoryScores = categories.map((category) => {
    const obtained = category.subKpis.reduce((sum, sub) => sum + (obtainedById.get(sub.id) ?? 0), 0)
    return { name: category.name, maxMarks: category.maxMarks, obtained }
  })
  const totalScore = categoryScores.reduce((sum, c) => sum + c.obtained, 0)
  const clamped = clampBonusPenalty(totalScore, bonus, penalty)
  return {
    totalScore,
    bonus: clamped.bonus,
    penalty: clamped.penalty,
    finalAdjustedScore: clamped.finalAdjustedScore,
    performanceLevel: scoreToPerformanceLevel(clamped.finalAdjustedScore),
  }
}

const categories = [
  {
    name: 'Delivery',
    maxMarks: 40,
    subKpis: [
      { id: 'a', maxMarks: 20 },
      { id: 'b', maxMarks: 10 },
      { id: 'c', maxMarks: 10 },
    ],
  },
  {
    name: 'Discipline',
    maxMarks: 15,
    subKpis: [
      { id: 'd', maxMarks: 5 },
      { id: 'e', maxMarks: 5 },
      { id: 'f', maxMarks: 5 },
    ],
  },
  {
    name: 'Ownership',
    maxMarks: 15,
    subKpis: [
      { id: 'g', maxMarks: 5 },
      { id: 'h', maxMarks: 5 },
      { id: 'i', maxMarks: 5 },
    ],
  },
  {
    name: 'Comm',
    maxMarks: 10,
    subKpis: [
      { id: 'j', maxMarks: 5 },
      { id: 'k', maxMarks: 5 },
    ],
  },
  {
    name: 'Tech',
    maxMarks: 10,
    subKpis: [
      { id: 'l', maxMarks: 5 },
      { id: 'm', maxMarks: 5 },
    ],
  },
  {
    name: 'Attendance',
    maxMarks: 10,
    subKpis: [
      { id: 'n', maxMarks: 5 },
      { id: 'o', maxMarks: 5 },
    ],
  },
]

// Approximate Usman sample totaling 76
const scores = [
  { subKpiId: 'a', marksObtained: 16 },
  { subKpiId: 'b', marksObtained: 8 },
  { subKpiId: 'c', marksObtained: 8 },
  { subKpiId: 'd', marksObtained: 4 },
  { subKpiId: 'e', marksObtained: 4 },
  { subKpiId: 'f', marksObtained: 3 },
  { subKpiId: 'g', marksObtained: 4 },
  { subKpiId: 'h', marksObtained: 4 },
  { subKpiId: 'i', marksObtained: 3 },
  { subKpiId: 'j', marksObtained: 4 },
  { subKpiId: 'k', marksObtained: 4 },
  { subKpiId: 'l', marksObtained: 4 },
  { subKpiId: 'm', marksObtained: 3 },
  { subKpiId: 'n', marksObtained: 4 },
  { subKpiId: 'o', marksObtained: 3 },
]

const result = computeKpiScores(categories, scores, 0, 0)
assert.equal(result.totalScore, 76)
assert.equal(result.finalAdjustedScore, 76)
assert.equal(result.performanceLevel, 'good')

const withPenalty = computeKpiScores(categories, scores, 0, 20)
assert.equal(withPenalty.finalAdjustedScore, 56)
assert.equal(withPenalty.performanceLevel, 'poor')

const cappedBonus = computeKpiScores(categories, scores, 50, 0)
assert.equal(cappedBonus.bonus, 24)
assert.equal(cappedBonus.finalAdjustedScore, 100)

const cappedPenalty = computeKpiScores(categories, scores, 0, 200)
assert.equal(cappedPenalty.penalty, 76)
assert.equal(cappedPenalty.finalAdjustedScore, 0)

const negativeBonusIgnored = computeKpiScores(categories, scores, -5, 0)
assert.equal(negativeBonusIgnored.bonus, 0)
assert.equal(negativeBonusIgnored.finalAdjustedScore, 76)

console.log('performance-kpi.test.mjs passed')
