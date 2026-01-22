'use client'

import { Box, Typography, Card, CardContent, Chip, Avatar } from '@mui/material'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import { styled } from '@mui/material/styles'
import type { TimelineProps } from '@mui/lab/Timeline'
import { Clock, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

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

interface AuditLogEntry {
  id: string
  timestamp: string
  operator: string
  operatorRole: string
  action: string
  actionType: 'create' | 'update' | 'approve' | 'reject' | 'comment'
  details: string
  ipAddress?: string
  userAgent?: string
}

interface AuditTrailProps {
  logs: AuditLogEntry[]
}

export function AuditTrail({ logs }: AuditTrailProps) {
  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return 'primary'
      case 'update':
        return 'warning'
      case 'approve':
        return 'success'
      case 'reject':
        return 'error'
      case 'comment':
        return 'info'
      default:
        return 'default'
    }
  }

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return '创建'
      case 'update':
        return '更新'
      case 'approve':
        return '批准'
      case 'reject':
        return '拒绝'
      case 'comment':
        return '评论'
      default:
        return actionType
    }
  }

  return (
    <div>
      {logs.length > 0 ? (
        <Card className='border border-gray-200'>
          <CardContent className='p-8 text-center'>
            <Timeline>
              {logs.map((log, index) => (
                <TimelineItem key={log.id}>
                  <TimelineSeparator>
                    <TimelineDot color={getActionColor(log.actionType) as any} />
                    {index < logs.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                      <div className='flex items-center gap-2'>
                        <Chip
                          label={getActionLabel(log.actionType)}
                          size='small'
                          color={getActionColor(log.actionType) as any}
                        />
                        <Typography className='font-medium' color='text.primary'>
                          {log.action}
                        </Typography>
                      </div>
                      <Typography variant='caption' color='text.disabled'>
                        {log.timestamp}
                      </Typography>
                    </div>
                    <Typography className='mbe-2.5'>{log.details}</Typography>
                    <div className='flex items-center gap-2.5'>
                      <Avatar className='bs-8 is-8'>{log.operator.charAt(0)}</Avatar>
                      <div className='flex flex-col flex-wrap gap-0.5'>
                        <Typography variant='body2' className='font-medium'>
                          {log.operator}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {log.operatorRole}
                        </Typography>
                      </div>
                      {log.ipAddress && (
                        <Typography variant='caption' color='text.secondary'>
                          IP: {log.ipAddress}
                        </Typography>
                      )}
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      ) : (
        <Card className='border border-gray-200'>
          <CardContent className='p-8 text-center'>
            <Typography variant='body2' color='text.secondary'>
              暂无审计日志记录
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
