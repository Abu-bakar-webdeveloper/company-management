import type { KpiTemplateCategory } from './kpi-template.model.js'

/** Default scorecard from docs/KPI sheet company.xlsx (6 categories / 15 sub-KPIs / 100 marks). */
export const DEFAULT_EMPLOYEE_KPI_CATEGORIES: KpiTemplateCategory[] = [
  {
    name: 'Delivery & Task Completion',
    weightPct: 40,
    maxMarks: 40,
    subKpis: [
      { id: 'on_time_tasks', label: 'On-time task completion', maxMarks: 20 },
      { id: 'quality_bugs', label: 'Quality / low bug rate', maxMarks: 10 },
      { id: 'milestones', label: 'Milestone achievement', maxMarks: 10 },
    ],
  },
  {
    name: 'Daily Discipline & Availability',
    weightPct: 15,
    maxMarks: 15,
    subKpis: [
      { id: 'check_in', label: 'Daily check-in discipline', maxMarks: 5 },
      { id: 'availability', label: 'Availability during work hours', maxMarks: 5 },
      { id: 'response_time', label: 'Response time', maxMarks: 5 },
    ],
  },
  {
    name: 'Problem Solving & Ownership',
    weightPct: 15,
    maxMarks: 15,
    subKpis: [
      { id: 'independence', label: 'Independent problem solving', maxMarks: 5 },
      { id: 'ownership', label: 'Ownership of outcomes', maxMarks: 5 },
      { id: 'improvements', label: 'Process / product improvements', maxMarks: 5 },
    ],
  },
  {
    name: 'Communication & Teamwork',
    weightPct: 10,
    maxMarks: 10,
    subKpis: [
      { id: 'clear_communication', label: 'Clear communication', maxMarks: 5 },
      { id: 'collaboration', label: 'Collaboration', maxMarks: 5 },
    ],
  },
  {
    name: 'Code Quality / Technical Excellence',
    weightPct: 10,
    maxMarks: 10,
    subKpis: [
      { id: 'clean_code', label: 'Clean, maintainable code', maxMarks: 5 },
      { id: 'best_practices', label: 'Best practices & standards', maxMarks: 5 },
    ],
  },
  {
    name: 'Attendance / Leaves / WFH Discipline',
    weightPct: 10,
    maxMarks: 10,
    subKpis: [
      { id: 'consistency', label: 'Attendance consistency', maxMarks: 5 },
      { id: 'policy_follow', label: 'Leave / WFH policy follow', maxMarks: 5 },
    ],
  },
]

export const DEFAULT_MANAGER_KPI_CATEGORIES: KpiTemplateCategory[] = [
  {
    name: 'Delivery & Team Output',
    weightPct: 40,
    maxMarks: 40,
    subKpis: [
      { id: 'team_delivery', label: 'Team on-time delivery', maxMarks: 20 },
      { id: 'project_quality', label: 'Project quality outcomes', maxMarks: 10 },
      { id: 'milestone_leadership', label: 'Milestone leadership', maxMarks: 10 },
    ],
  },
  {
    name: 'Daily Discipline & Availability',
    weightPct: 15,
    maxMarks: 15,
    subKpis: [
      { id: 'check_in', label: 'Daily check-in discipline', maxMarks: 5 },
      { id: 'availability', label: 'Availability for team', maxMarks: 5 },
      { id: 'response_time', label: 'Response time', maxMarks: 5 },
    ],
  },
  {
    name: 'Leadership & Ownership',
    weightPct: 15,
    maxMarks: 15,
    subKpis: [
      { id: 'decision_making', label: 'Decision making', maxMarks: 5 },
      { id: 'ownership', label: 'Ownership of outcomes', maxMarks: 5 },
      { id: 'improvements', label: 'Process improvements', maxMarks: 5 },
    ],
  },
  {
    name: 'Communication & Teamwork',
    weightPct: 10,
    maxMarks: 10,
    subKpis: [
      { id: 'clear_communication', label: 'Clear communication', maxMarks: 5 },
      { id: 'collaboration', label: 'Cross-team collaboration', maxMarks: 5 },
    ],
  },
  {
    name: 'People & Technical Leadership',
    weightPct: 10,
    maxMarks: 10,
    subKpis: [
      { id: 'coaching', label: 'Coaching & mentoring', maxMarks: 5 },
      { id: 'tech_standards', label: 'Technical standards', maxMarks: 5 },
    ],
  },
  {
    name: 'Attendance / Leaves / WFH Discipline',
    weightPct: 10,
    maxMarks: 10,
    subKpis: [
      { id: 'consistency', label: 'Attendance consistency', maxMarks: 5 },
      { id: 'policy_follow', label: 'Leave / WFH policy follow', maxMarks: 5 },
    ],
  },
]
