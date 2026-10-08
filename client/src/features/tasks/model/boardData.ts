import type {
  BoardColumn,
  BoardMember,
  BoardMilestone,
  BoardTask,
} from '@/features/tasks/model/types'

export const BOARD_MEMBERS: Record<string, BoardMember> = {
  u1: { id: 'u1', name: 'Abubakar Raza', initials: 'AR', colorClass: 'bg-primary' },
  u2: { id: 'u2', name: 'Hina Sheikh', initials: 'HS', colorClass: 'bg-[#D9527E]' },
  u3: { id: 'u3', name: 'Omar Farooq', initials: 'OF', colorClass: 'bg-success' },
  u4: { id: 'u4', name: 'Sana Malik', initials: 'SM', colorClass: 'bg-warning' },
}

export const BOARD_MILESTONES: Record<string, BoardMilestone> = {
  m1: { id: 'm1', name: 'Auction Launch', colorClass: 'bg-primary' },
  m2: { id: 'm2', name: 'UI Polish', colorClass: 'bg-success' },
  m3: { id: 'm3', name: 'Beta Release', colorClass: 'bg-[#D9527E]' },
}

const AUCTION_IMG =
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&q=60&auto=format&fit=crop'

export const DEFAULT_BOARD_COLUMNS: BoardColumn[] = [
  { id: 'col-todo', name: 'To Do', order: 0 },
  { id: 'col-doing', name: 'In Progress', order: 1 },
  { id: 'col-done', name: 'Done', order: 2 },
]

let idCounter = 100

export function nextBoardTaskId() {
  return `t${idCounter++}`
}

export function nextBoardSubtaskId() {
  return `s${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

/** Seed board tasks. Uses projectId so every project gets a demo board. */
export function getSeedBoardTasks(projectId: string): BoardTask[] {
  return [
    {
      id: nextBoardTaskId(),
      projectId,
      title: 'Remove bugs from bidding UI',
      description:
        'Buttons overlap on mobile widths under 380px. Re-check the bid stepper component.',
      assigneeId: 'u1',
      priority: 'high',
      dueDate: '2026-07-18',
      milestoneId: 'm1',
      subtasks: [
        { id: 's1', text: 'Fix stepper overlap', done: true },
        { id: 's2', text: 'Retest on iOS Safari', done: false },
      ],
      comments: 3,
      attachments: 2,
      attachmentItems: [],
      columnId: 'col-todo',
      image: AUCTION_IMG,
      sortOrder: 0,
    },
    {
      id: nextBoardTaskId(),
      projectId,
      title: 'Countdown timer drift',
      description: 'Timer desyncs from server clock after ~10 minutes on the listing page.',
      assigneeId: 'u3',
      priority: 'urgent',
      dueDate: '2026-07-15',
      milestoneId: 'm1',
      subtasks: [{ id: 's3', text: 'Sync with server time on load', done: false }],
      comments: 5,
      attachments: 0,
      attachmentItems: [],
      columnId: 'col-todo',
      image: AUCTION_IMG,
      sortOrder: 1,
    },
    {
      id: nextBoardTaskId(),
      projectId,
      title: 'Add watchlist icon states',
      description: 'Add filled/outline states for the watchlist star and persist to profile.',
      assigneeId: 'u2',
      priority: 'medium',
      dueDate: '2026-07-22',
      milestoneId: 'm2',
      subtasks: [],
      comments: 1,
      attachments: 1,
      attachmentItems: [],
      columnId: 'col-doing',
      image: AUCTION_IMG,
      sortOrder: 0,
    },
    {
      id: nextBoardTaskId(),
      projectId,
      title: 'Image gallery lazy load',
      description: 'Large listing pages ship every photo up front; switch to lazy loading.',
      assigneeId: 'u1',
      priority: 'low',
      dueDate: '2026-07-25',
      milestoneId: 'm2',
      subtasks: [{ id: 's4', text: 'Add intersection observer', done: true }],
      comments: 0,
      attachments: 0,
      attachmentItems: [],
      columnId: 'col-doing',
      image: null,
      sortOrder: 1,
    },
    {
      id: nextBoardTaskId(),
      projectId,
      title: 'Polish empty search state',
      description: 'Replace placeholder copy with real empty-state illustration and CTA.',
      assigneeId: 'u4',
      priority: 'medium',
      dueDate: '2026-07-12',
      milestoneId: 'm3',
      subtasks: [
        { id: 's5', text: 'Write empty-state copy', done: true },
        { id: 's6', text: 'Wire illustration', done: true },
      ],
      comments: 2,
      attachments: 1,
      attachmentItems: [],
      columnId: 'col-done',
      image: AUCTION_IMG,
      sortOrder: 0,
    },
  ]
}

export function cloneDefaultColumns(): BoardColumn[] {
  return DEFAULT_BOARD_COLUMNS.map((c) => ({ ...c }))
}
