// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Vars
const cardData = [
  {
    title: '今日操作数',
    stats: '156',
    avatarIcon: 'ri-time-line',
    avatarColor: 'primary' as ThemeColor,
    trend: 'positive',
    trendNumber: '23',
    subtitle: '较昨日'
  },
  {
    title: '活跃用户数',
    stats: '12',
    avatarIcon: 'ri-user-line',
    avatarColor: 'info' as ThemeColor,
    subtitle: '当前在线'
  },
  {
    title: '异常操作',
    stats: '2',
    avatarIcon: 'ri-shield-line',
    avatarColor: 'error' as ThemeColor,
    subtitle: '需要关注'
  },
  {
    title: '系统回调',
    stats: '45',
    avatarIcon: 'ri-webhook-line',
    avatarColor: 'success' as ThemeColor,
    subtitle: '今日处理'
  }
]

const AuditLogCards = () => {
  return (
    <Grid container spacing={6}>
      {cardData.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default AuditLogCards
