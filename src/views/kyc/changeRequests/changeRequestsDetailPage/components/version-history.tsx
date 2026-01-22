'use client'

import { Typography, Card, CardContent, Chip } from '@mui/material'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import { styled } from '@mui/material/styles'
import type { TimelineProps } from '@mui/lab/Timeline'
import { Clock, CheckCircle, XCircle, FileEdit, User } from 'lucide-react'

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

interface VersionHistoryItem {
  version: number
  action: 'created' | 'approved' | 'rejected' | 'modified'
  timestamp: string
  operator: string
  changes?: string[]
  comment?: string
}

interface VersionHistoryProps {
  history: VersionHistoryItem[]
  currentVersion: number
}

export function VersionHistory({ history, currentVersion }: VersionHistoryProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'primary'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'error'
      case 'modified':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return '创建工单'
      case 'approved':
        return '批准变更'
      case 'rejected':
        return '拒绝变更'
      case 'modified':
        return '修改工单'
      default:
        return action
    }
  }

  return (
    <div>
      <div className='flex items-center justify-between mbe-6'>
        <Typography variant='h6' className='font-semibold'></Typography>
        <Chip label={`当前版本: v${currentVersion}`} color='primary' className='font-semibold' />
      </div>

      <Card className='border border-gray-200'>
        <CardContent className='p-8 text-center'>
          <Timeline>
            {history.map((item, index) => {
              const isCurrentVersion = item.version === currentVersion

              return (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={getActionColor(item.action) as any} />
                    {index < history.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Card
                      className={`mbe-4 ${
                        isCurrentVersion ? 'border-2 border-primary bg-blue-50' : 'border border-gray-200'
                      }`}
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between mbe-2'>
                          <div className='flex items-center gap-2'>
                            <Typography variant='body2' className='font-semibold'>
                              版本 {item.version}
                            </Typography>
                            <Chip
                              label={getActionLabel(item.action)}
                              size='small'
                              color={getActionColor(item.action) as any}
                            />
                            {isCurrentVersion && <Chip label='当前' size='small' color='primary' />}
                          </div>
                        </div>

                        <div className='flex items-center gap-2 mbe-2'>
                          <Clock size={14} className='text-gray-500' />
                          <Typography variant='caption' color='text.secondary'>
                            {item.timestamp}
                          </Typography>
                        </div>

                        <div className='flex items-center gap-2 mbe-2'>
                          <User size={14} className='text-gray-500' />
                          <Typography variant='caption' color='text.secondary'>
                            操作人: {item.operator}
                          </Typography>
                        </div>

                        {item.changes && item.changes.length > 0 && (
                          <div className='mts-2'>
                            <Typography variant='caption' color='text.secondary' className='block mbe-1'>
                              变更内容:
                            </Typography>
                            <div className='pl-4'>
                              {item.changes.map((change, idx) => (
                                <Typography key={idx} variant='caption' color='text.secondary' className='block'>
                                  • {change}
                                </Typography>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.comment && (
                          <div className='mts-2 p-3 bg-gray-50 rounded border-l-4 border-gray-300'>
                            <Typography variant='caption' color='text.secondary' className='italic'>
                              "{item.comment}"
                            </Typography>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        </CardContent>
      </Card>
    </div>
  )
}
