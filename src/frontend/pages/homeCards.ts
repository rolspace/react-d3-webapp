export interface HomeCardConfig {
  id: string
  title: string
  /** Route the card title links to. Cards without one are placeholders. */
  to?: string
}

export const homeCards: HomeCardConfig[] = [
  { id: 'adds-deletes', title: 'Adds / Deletes' },
  { id: 'changed-files', title: 'Changed Files' },
  { id: 'section-3', title: 'Section 3' },
  { id: 'commits-per-week', title: 'Commits per Week', to: '/graphs/repo-commits-per-week' },
]
