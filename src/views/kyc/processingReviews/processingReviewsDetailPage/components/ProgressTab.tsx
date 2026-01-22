// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import { useTranslate } from '@/contexts/DictionaryContext'

// Icon Imports
import { BarChart3, Clock, Timer } from 'lucide-react'

// Types
interface ProgressTabProps {
  progress: any
}

const ProgressTab = ({ progress }: ProgressTabProps) => {
  const t = useTranslate()
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success'
    if (progress >= 50) return 'primary'
    return 'warning'
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-2 mbe-6'>
              <BarChart3 size={20} className='text-primary' />
              <Typography variant='h6' className='font-semibold'>
                {t('processingReviews.reviewProgress')} {/* 审核进度 */}
              </Typography>
            </div>

            {/* 整体进度 */}
            <div className='mbe-6'>
              <div className='flex items-center justify-between mbe-2'>
                <Typography variant='subtitle2' color='text.secondary'>
                  {t('processingReviews.overallProgress')} {/* 整体进度 */}
                </Typography>
                <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                  {progress?.progress_rate ?? 0}%
                </Typography>
              </div>
              <LinearProgress
                variant='determinate'
                value={progress?.progress_rate ?? 0}
                color={getProgressColor(progress?.progress_rate ?? 0) as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </div>

            {/* 时间统计 */}
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <div className='text-center p-4 bg-[var(--mui-palette-customColors-infoCardBg)] rounded'>
                  <div className='flex items-center justify-center gap-2 mbe-2'>
                    <Clock size={16} className='text-primary' />
                    <Typography variant='body2' color='text.secondary'>
                      {t('processingReviews.timeUsed')} {/* 已用时间 */}
                    </Typography>
                  </div>
                  <Typography variant='h6' sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {progress?.usedTime ?? 0}
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <div className='text-center p-4 bg-[var(--mui-palette-customColors-infoCardBg)] rounded'>
                  <div className='flex items-center justify-center gap-2 mbe-2'>
                    <Timer size={16} className='text-primary' />
                    <Typography variant='body2' color='text.secondary'>
                      {t('processingReviews.estimatedRemainingTime')} {/* 预计剩余时间 */}
                    </Typography>
                  </div>
                  <Typography variant='h6' sx={{ fontWeight: 600, color: '#f57c00' }}>
                    {progress?.remainingTime ?? 0}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProgressTab
