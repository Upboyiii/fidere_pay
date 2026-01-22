// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'
import { formatDate } from 'date-fns/format'

// Icon Imports
import { History } from 'lucide-react'

// Types
interface OperationHistory {
  id: number
  remark: string
  actorName: string
  stageLabel: string
  createdAt: string
}

interface OperationHistoryTabProps {
  operationHistory: OperationHistory[]
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

const OperationHistoryTab = ({ operationHistory }: OperationHistoryTabProps) => {
  const getTimelineColor = (index: number) => {
    const colors = ['primary', 'success', 'info', 'warning', 'error']
    return colors[index % colors.length] as any
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Timeline>
              {operationHistory?.map((operation, index) => (
                <TimelineItem key={operation.id}>
                  <TimelineSeparator>
                    <TimelineDot color={getTimelineColor(index)} />
                    {index < operationHistory.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                      <Typography className='font-medium' color='text.primary'>
                        {operation?.stageLabel}
                      </Typography>
                      <Typography variant='caption'>
                        {!!Number(operation?.createdAt)
                          ? formatDate(Number(operation?.createdAt), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </Typography>
                    </div>
                    <Typography className='mbe-2'>{operation.remark}</Typography>
                    <div className='flex items-center gap-2.5'>
                      <Typography variant='body2' className='text-textSecondary'>
                        by {operation.actorName}
                      </Typography>
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

export default OperationHistoryTab
