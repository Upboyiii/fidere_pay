'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Divider from '@mui/material/Divider'

// Icon Imports
import { FileText, Eye, Download, CheckCircle, Clock, Calendar } from 'lucide-react'

// Utils Imports
import { formatDate } from 'date-fns/format'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import type { TrustDocumentListItem } from '@server/trust'

interface TrustDocumentsTableProps {
  /** 文件数据 */
  data: TrustDocumentListItem[]
  /** 查看详情回调 */
  onView?: (document: TrustDocumentListItem) => void
  /** 下载回调 */
  onDownload?: (document: TrustDocumentListItem) => void
}

const dividerSx = {
  borderStyle: 'dashed',
  borderColor: 'divider'
}

/**
 * 信托文件列表卡片组件
 * @param data - 文件数据
 * @param onView - 查看详情回调
 * @param onDownload - 下载回调
 */
const TrustDocumentsTable = ({ data, onView, onDownload }: TrustDocumentsTableProps) => {
  const t = useTranslate()

  return (
    <Box>
      {data.length === 0 ? (
        <Box className='flex flex-col items-center justify-center py-12'>
          <FileText size={48} className='text-textSecondary mbe-4' />
          <Typography variant='body1' color='text.secondary'>
            暂无文件信息
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {data.map(document => {
            const isSigned = document.status === 1 || document.status === 4

            return (
              <Grid key={document.id} size={{ xs: 12, sm: 6 }}>
                <Card
                  className='h-full border transition-all hover:shadow-md'
                  sx={{
                    borderColor: 'var(--mui-palette-customColors-infoCardBorder)',
                    '&:hover': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent className='p-5'>
                    {/* 头部：文件图标和名称 */}
                    <Box className='flex items-center gap-3 mbe-4'>
                      <Box
                        className='flex items-center justify-center flex-shrink-0'
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.12)'
                          }
                        }}
                      >
                        <FileText size={20} className='text-primary' />
                      </Box>
                      <Box className='flex-1 flex flex-col justify-center min-w-0'>
                        <Typography
                          variant='h6'
                          className='font-semibold'
                          sx={{
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                          title={document.title}
                        >
                          {document.title}
                        </Typography>
                      </Box>
                    </Box>

                    {/* 签署状态 */}
                    <div className='flex items-center justify-between mbe-4'>
                      <div className='flex items-center gap-2'>
                        {isSigned ? (
                          <CheckCircle size={16} className='text-success' />
                        ) : (
                          <Clock size={16} className='text-warning' />
                        )}
                        <Typography variant='body2' color='text.secondary'>
                          {t('kycDashboard.signatureStatus')}
                        </Typography>
                      </div>
                      <Chip
                        variant='tonal'
                        label={document?.statusLabel}
                        size='small'
                        sx={{
                          backgroundColor: isSigned ? 'success.lightOpacity' : 'warning.lightOpacity',
                          color: isSigned ? 'success.main' : 'warning.main',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22
                        }}
                      />
                    </div>

                    <Divider className='mbe-4' sx={dividerSx} />

                    {/* 时间信息 */}
                    <div className='flex flex-col gap-3 mbe-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Calendar size={14} className='text-textSecondary' />
                          <Typography variant='caption' color='text.secondary' className='font-medium'>
                            {t('kycDashboard.creationTime')}
                          </Typography>
                        </div>
                        <Typography variant='body2'>
                          {document.createTime ? formatDate(new Date(document.createTime), 'yyyy/MM/dd HH:mm') : '-'}
                        </Typography>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Calendar size={14} className='text-textSecondary' />
                          <Typography variant='caption' color='text.secondary' className='font-medium'>
                            {t('kycDashboard.signatureTime')}
                          </Typography>
                        </div>
                        <Typography variant='body2'>
                          {document.signatureTime
                            ? formatDate(new Date(document.signatureTime), 'yyyy/MM/dd HH:mm')
                            : '-'}
                        </Typography>
                      </div>
                    </div>

                    <Divider className='mbe-4' sx={dividerSx} />

                    {/* 操作按钮 */}
                    <div className='flex items-center gap-2 flex-wrap'>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<Eye size={16} />}
                        onClick={() => onView?.(document)}
                        sx={{
                          textTransform: 'none',
                          flex: '1',
                          minWidth: '100px'
                        }}
                      >
                        {t('kycDashboard.viewDetails')}
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<Download size={16} />}
                        onClick={() => onDownload?.(document)}
                        sx={{
                          textTransform: 'none',
                          flex: '1',
                          minWidth: '100px'
                        }}
                      >
                        {t('kycDashboard.download')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}

export default TrustDocumentsTable
