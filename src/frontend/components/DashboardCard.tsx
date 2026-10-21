import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import React, { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  children: ReactNode
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ color: 'text.primary', mb: 2 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  )
}

export default DashboardCard
