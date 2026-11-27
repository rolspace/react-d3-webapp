import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import React, { ReactNode } from 'react'
import { Link } from 'react-router'

interface DashboardCardProps {
  title: string
  /** When set, the title links to this route. */
  to?: string
  children: ReactNode
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, to, children }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ color: 'text.primary', mb: 2 }}>
          {to ? (
            <MuiLink component={Link} to={to} color="inherit" underline="hover">
              {title}
            </MuiLink>
          ) : title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  )
}

export default DashboardCard
