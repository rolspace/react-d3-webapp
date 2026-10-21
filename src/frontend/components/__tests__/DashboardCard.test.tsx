import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DashboardCard from '../DashboardCard'

describe('DashboardCard', () => {
  it('DashboardCard_Render_ShowsTitleAndChildren', () => {
    render(
      <DashboardCard title="Adds / Deletes">
        <span>child</span>
      </DashboardCard>,
    )

    expect(screen.getByRole('heading', { name: 'Adds / Deletes', level: 2 })).toBeVisible()
    expect(screen.getByText('child')).toBeVisible()
  })
})
