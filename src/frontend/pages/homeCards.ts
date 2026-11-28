export interface HomeCardConfig {
  id: string
  title: string
  /** Route the card title links to. Cards without one are placeholders. */
  to?: string
}

export const homeCards: HomeCardConfig[] = [
  { id: 'adds-deletes', title: 'Adds / Deletes' },
  { id: 'changed-files', title: 'Changed Files' },
  { id: 'summary-stats', title: 'Summary Stats', to: '/graphs/repo-summary' },
  { id: 'commits-per-week', title: 'Commits per Week', to: '/graphs/repo-commits-per-week' },
]
