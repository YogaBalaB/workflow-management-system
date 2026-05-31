export const CATEGORIES = [
  'Hardware',
  'Software',
  'Cloud Services',
  'Furniture',
  'Office Supplies',
  'Travel & Lodging',
  'Training & Certifications',
  'Other'
];

export const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

export const STATES = {
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  NEEDS_CLARIFICATION: 'Needs Clarification',
  CLOSED: 'Closed',
  REOPENED: 'Reopened'
};

// Modern, harmonious design tokens for status badges (glassmorphic colors and subtle glows)
export const STATUS_STYLES = {
  [STATES.SUBMITTED]: {
    label: 'Submitted',
    bg: 'rgba(59, 130, 246, 0.15)', // transparent blue
    text: '#60a5fa', // bright blue
    border: 'rgba(59, 130, 246, 0.3)',
    glow: 'rgba(59, 130, 246, 0.2)'
  },
  [STATES.APPROVED]: {
    label: 'Approved',
    bg: 'rgba(16, 185, 129, 0.15)', // transparent emerald green
    text: '#34d399', // bright emerald
    border: 'rgba(16, 185, 129, 0.3)',
    glow: 'rgba(16, 185, 129, 0.2)'
  },
  [STATES.REJECTED]: {
    label: 'Rejected',
    bg: 'rgba(239, 68, 68, 0.15)', // transparent rose red
    text: '#f87171', // bright red
    border: 'rgba(239, 68, 68, 0.3)',
    glow: 'rgba(239, 68, 68, 0.2)'
  },
  [STATES.NEEDS_CLARIFICATION]: {
    label: 'Needs Clarification',
    bg: 'rgba(245, 158, 11, 0.15)', // transparent amber orange
    text: '#fbbf24', // bright amber
    border: 'rgba(245, 158, 11, 0.3)',
    glow: 'rgba(245, 158, 11, 0.2)'
  },
  [STATES.CLOSED]: {
    label: 'Closed',
    bg: 'rgba(107, 114, 128, 0.15)', // transparent slate gray
    text: '#9ca3af', // light gray
    border: 'rgba(107, 114, 128, 0.3)',
    glow: 'rgba(107, 114, 128, 0.1)'
  },
  [STATES.REOPENED]: {
    label: 'Reopened',
    bg: 'rgba(139, 92, 246, 0.15)', // transparent violet purple
    text: '#a78bfa', // bright violet
    border: 'rgba(139, 92, 246, 0.3)',
    glow: 'rgba(139, 92, 246, 0.2)'
  }
};

export const PRIORITY_STYLES = {
  [PRIORITIES.LOW]: {
    bg: 'rgba(156, 163, 175, 0.1)',
    text: '#d1d5db',
    border: 'rgba(156, 163, 175, 0.2)'
  },
  [PRIORITIES.MEDIUM]: {
    bg: 'rgba(245, 158, 11, 0.1)',
    text: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.2)'
  },
  [PRIORITIES.HIGH]: {
    bg: 'rgba(239, 68, 68, 0.1)',
    text: '#f87171',
    border: 'rgba(239, 68, 68, 0.2)'
  }
};
