// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'

// Icon Imports
import { Clock } from 'lucide-react'
import { useTranslate } from '@/contexts/DictionaryContext'

// Types
interface ReviewStep {
  status: number
  title: string
  description: string
  completedTime: string
  startTime: string
  usedTime: string
}

interface StepsTabProps {
  steps: ReviewStep[]
}

// Styled Timeline component
const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const StepsTab = ({ steps }: StepsTabProps) => {
  const t = useTranslate()
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-2 mbe-6'>
              <Clock size={20} className='text-primary' />
              <Typography variant='h6' className='font-semibold'>
                {t('processingReviews.reviewSteps')} {/* 审核步骤 */}
              </Typography>
            </div>

            <Timeline>
              {steps.map((step, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot
                      sx={{
                        backgroundColor:
                          step.status == 2
                            ? '#4caf50'
                            : step.status == 1
                              ? '#2196f3'
                              : step.status == 3
                                ? '#f44336'
                                : '#9e9e9e'
                      }}
                    />
                    {index < steps.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                      <Typography className='font-medium' color='text.primary'>
                        {step?.title}
                      </Typography>
                      {step.status == 2 && step.completedTime && (
                        <Typography variant='caption'>{step.completedTime}</Typography>
                      )}
                      {step.status == 1 && step.startTime && (
                        <Typography variant='caption'>{step.startTime}</Typography>
                      )}
                    </div>
                    <Typography className='mbe-2'>{step.description}</Typography>

                    <div className='flex items-center gap-2.5 flex-wrap'>
                      {(step.status == 2 || step.status == 3) && (
                        <>
                          <Chip
                            label={`${t('processingReviews.completedAt')} ${step.completedTime}`} // 完成于
                            size='small'
                            color={step.status == 2 ? 'success' : 'error'}
                            variant='outlined'
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={`${t('processingReviews.timeUsedLabel')} ${step.usedTime}`} // 用时
                            size='small'
                            color={step.status == 2 ? 'success' : 'error'}
                            variant='outlined'
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </>
                      )}

                      {step.status == 1 && (
                        <>
                          <Chip
                            label={`${t('processingReviews.startedAt')} ${step?.startTime}`} // 开始于
                            size='small'
                            color='primary'
                            variant='outlined'
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={`${t('processingReviews.estimated')} ${step?.usedTime}`} // 预计
                            size='small'
                            sx={{ fontSize: '0.7rem', backgroundColor: '#e3f2fd', color: '#1976d2' }}
                          />
                        </>
                      )}
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StepsTab
