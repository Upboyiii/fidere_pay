// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import KycDashboardCards from './KycDashboardCards'
import KycDashboardTable from './KycDashboardTable'

const KycDashboard = () => {
  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12 }}>
        <KycDashboardCards />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <KycDashboardTable />
      </Grid>
    </Grid>
  )
}

export default KycDashboard
