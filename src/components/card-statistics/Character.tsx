// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Types Imports
import type { CardStatsCharacterProps } from '@/types/pages/widgetTypes'

const CardStatWithImage = (props: CardStatsCharacterProps) => {
  // Props
  const { title, src, stats, trendNumber, trend, chipText, chipColor, showSign = true, trendColor } = props

  // 根据 showSign 决定是否显示正负号
  const displayTrendNumber = showSign 
    ? `${trend === 'negative' ? '-' : '+'}${trendNumber}`
    : trendNumber

  // 根据 trendColor 或 trend 决定颜色
  const getTrendColor = () => {
    if (trendColor) {
      return `${trendColor}.main`
    }
    return trend === 'negative' ? 'error.main' : 'success.main'
  }

  return (
    <Card className='relative overflow-visible mbs-8' sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
        <Typography color='text.primary' className='font-medium'>
          {title}
        </Typography>
        <div className='flex items-center gap-2 pbs-4 pbe-1.5 flex-wrap'>
          <Typography variant='h4'>{stats}</Typography>
          <Typography color={getTrendColor()} sx={{ whiteSpace: 'nowrap' }}>
            {displayTrendNumber}
          </Typography>
        </div>
        <Chip label={chipText} color={chipColor} variant='tonal' size='small' sx={{ alignSelf: 'flex-start' }} />
        <img src={src} alt={title} className='absolute block-end-0 inline-end-4' style={{ height: '176px', width: 'auto' }} />
      </CardContent>
    </Card>
  )
}

export default CardStatWithImage
