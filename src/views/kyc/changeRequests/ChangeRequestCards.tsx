// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Vars
const data: UserDataType[] = [
  {
    title: '总工单数',
    stats: '4',
    avatarIcon: 'ri-file-list-line',
    avatarColor: 'primary',
    trend: 'positive',
    trendNumber: '2',
    subtitle: '较昨日'
  },
  {
    title: '待处理',
    stats: '1',
    avatarIcon: 'ri-time-line',
    avatarColor: 'warning',
    trend: 'negative',
    trendNumber: '0',
    subtitle: '需要关注'
  },
  {
    title: '审核中',
    stats: '1',
    avatarIcon: 'ri-eye-line',
    avatarColor: 'info',
    trend: 'positive',
    trendNumber: '1',
    subtitle: '较昨日'
  },
  {
    title: '已批准',
    stats: '1',
    avatarIcon: 'ri-checkbox-circle-line',
    avatarColor: 'success',
    trend: 'positive',
    trendNumber: '0',
    subtitle: '较昨日'
  }
]

const ChangeRequestCards = () => {
  return (
    <Grid container spacing={6}>
      {data.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default ChangeRequestCards
