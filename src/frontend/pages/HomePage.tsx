import Box from '@mui/material/Box'
import ChartErrorBoundary from '../components/ChartErrorBoundary'
import DashboardCard from '../components/DashboardCard'
import PlaceholderChart from '../components/PlaceholderChart'
import { homeCards } from './homeCards'

const HomePage: React.FC = () => {
  return (
    <Box sx={{ pt: 10, px: { xs: 2, md: 0 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        }}
      >
        {homeCards.map(({ id, title }) => (
          <Box key={id} sx={{ minWidth: 0 }}>
            <DashboardCard title={title}>
              <ChartErrorBoundary>
                <PlaceholderChart title={title} />
              </ChartErrorBoundary>
            </DashboardCard>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default HomePage
