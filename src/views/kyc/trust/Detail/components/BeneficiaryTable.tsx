'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Icon Imports
import { Eye, Check, X, Phone, Mail, Users, Calendar, User, CreditCard } from 'lucide-react'

// Utils Imports
import { getInitials } from '@/utils/getInitials'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import type { BeneficiaryListItem } from '@server/trust'
import { formatDate } from 'date-fns/format'

interface BeneficiaryTableProps {
  /** 受益人数据 */
  data: BeneficiaryListItem[]
  /** 查看详情回调 */
  onViewDetail?: (beneficiary: BeneficiaryListItem) => void
  /** 通过审核回调 */
  onApprove?: (beneficiary: BeneficiaryListItem) => void
  /** 驳回回调 */
  onReject?: (beneficiary: BeneficiaryListItem) => void
}

/**
 * 受益人列表卡片组件
 * @param data - 受益人数据
 * @param onViewDetail - 查看详情回调
 * @param onApprove - 通过审核回调
 * @param onReject - 驳回回调
 */
/**
 * Divider 样式
 */
const dividerSx = {
  borderStyle: 'dashed',
  borderColor: 'divider'
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: number, t: (key: string) => string) => {
  switch (status) {
    case 1:
      return { color: '#2e7d32', bg: '#e8f5e9', label: t('kycDashboard.approved') }
    case 2:
      return { color: '#d32f2f', bg: '#ffebee', label: t('kycDashboard.reject') }
    default:
      return { color: '#f57c00', bg: '#fff3e0', label: t('kycDashboard.pendingReview') }
  }
}

const BeneficiaryTable = ({ data, onViewDetail, onApprove, onReject }: BeneficiaryTableProps) => {
  const t = useTranslate()

  return (
    <Box>
      {/* 卡片网格 */}
      {data.length === 0 ? (
        <Box className='flex flex-col items-center justify-center py-12'>
          <Users size={48} className='text-textSecondary mbe-4' />
          <Typography variant='body1' color='text.secondary'>
            {t('kycDashboard.noBeneficiaryInfo')}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {data.map(beneficiary => {
            const statusObj = getStatusColor(beneficiary.status, t)
            const isPending = beneficiary.status === 0 || beneficiary.status === 3

            return (
              <Grid key={beneficiary.id} size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 4 }}>
                <Card
                  className='h-full border transition-all hover:shadow-md'
                  sx={{
                    borderColor: 'var(--mui-palette-customColors-infoCardBorder)',
                    '&:hover': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent className='p-6'>
                    {/* 头部：头像和基本信息 */}
                    <Box className='flex items-start gap-4 mbe-4'>
                      <CustomAvatar skin='light' size={48} color='primary'>
                        {getInitials(beneficiary.name)}
                      </CustomAvatar>
                      <Box className='flex-1 flex flex-col gap-2'>
                        <Box className='flex items-center gap-2 flex-wrap'>
                          <Typography variant='h6' className='font-semibold'>
                            {beneficiary.name}
                          </Typography>
                          {beneficiary.isPrimaryBen === 1 && (
                            <Chip
                              label={t('kycDashboard.main')}
                              size='small'
                              variant='tonal'
                              color='primary'
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                          )}
                          <Chip
                            label={
                              beneficiary.beneficiaryType === 0
                                ? t('kycDashboard.individual')
                                : t('kycDashboard.institution')
                            }
                            size='small'
                            variant='outlined'
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Box className='flex items-center gap-2'>
                          <User size={14} className='text-textSecondary' />
                          <Typography variant='body2' color='text.secondary'>
                            {beneficiary?.relationLabel}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider className='mbe-4' sx={dividerSx} />

                    {/* 证件信息 */}
                    <Box className='flex flex-col gap-2.5 mbe-4'>
                      <Box
                        className='flex items-center justify-between p-2.5 rounded-lg border'
                        sx={{
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          borderColor: 'rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            backgroundColor: 'rgba(0, 0, 0, 0.03)'
                          }
                        }}
                      >
                        <Box className='flex items-center gap-2 flex-1 min-w-0'>
                          <Chip
                            label={beneficiary?.idDocumentTypeLabel}
                            size='small'
                            variant='outlined'
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 500,
                              borderColor: 'rgba(0, 0, 0, 0.15)',
                              color: 'text.secondary',
                              flexShrink: 0
                            }}
                          />
                          <Typography
                            variant='body2'
                            className='font-mono'
                            sx={{
                              fontSize: '0.75rem',
                              color: 'text.primary',
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={beneficiary.idDocumentNumber}
                          >
                            {beneficiary.idDocumentNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider className='mbe-4' sx={dividerSx} />

                    {/* 受益比例 */}
                    <Box className='flex flex-col gap-2 mbe-4'>
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('kycDashboard.beneficiaryRatio')}
                      </Typography>
                      <Box
                        className='flex items-center justify-between p-3 rounded-lg border'
                        sx={{
                          background:
                            'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.06) 100%)',
                          borderColor: 'rgba(16, 185, 129, 0.25)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: 'rgba(16, 185, 129, 0.4)',
                            background:
                              'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
                          }
                        }}
                      >
                        <Box className='flex items-baseline gap-1'>
                          <Typography
                            variant='h5'
                            className='font-semibold'
                            sx={{
                              color: '#10B981',
                              lineHeight: 1.2,
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {beneficiary.benefitRatio ?? 0}
                          </Typography>
                          <Typography
                            variant='body1'
                            className='font-medium'
                            sx={{
                              color: '#10B981',
                              opacity: 0.65,
                              ml: 0.25,
                              fontWeight: 500
                            }}
                          >
                            %
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* 联系方式 */}
                    {(beneficiary.phone || beneficiary.email) && (
                      <>
                        <Divider className='mbe-4' sx={dividerSx} />
                        <Box className='flex flex-col gap-3 mbe-3'>
                          <Box className='flex flex-col gap-1.5'>
                            {beneficiary.phone && (
                              <Box className='flex items-center gap-2'>
                                <Phone size={14} className='text-textSecondary' />
                                <Typography variant='body2'>{beneficiary.phone}</Typography>
                              </Box>
                            )}
                            {beneficiary.email && (
                              <Box className='flex items-center gap-2'>
                                <Mail size={14} className='text-textSecondary' />
                                <Typography variant='body2' className='truncate' title={beneficiary.email}>
                                  {beneficiary.email}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </>
                    )}
                    <Divider className='mbe-4' sx={dividerSx} />
                    {/* 底部：状态和时间 */}
                    <Box className='flex items-center justify-between mbe-4'>
                      <Box className='flex items-center gap-3'>
                        <Chip
                          variant='tonal'
                          label={beneficiary?.statusLabel}
                          size='small'
                          sx={{
                            backgroundColor: statusObj.bg,
                            color: statusObj.color,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                        <Box className='flex items-center gap-1'>
                          <Calendar size={12} className='text-textSecondary' />
                          <Typography variant='caption' color='text.secondary'>
                            {beneficiary.submitTime ? formatDate(beneficiary.submitTime, 'yyyy-MM-dd HH:mm') : '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* 操作按钮 */}
                    <Box className='flex items-center gap-2'>
                      {isPending ? (
                        <>
                          <Button
                            variant='outlined'
                            size='small'
                            startIcon={<Eye size={16} />}
                            onClick={() => onViewDetail?.(beneficiary)}
                            sx={{ textTransform: 'none', flex: 1 }}
                          >
                            {t('kycDashboard.viewDetails')}
                          </Button>
                          <Button
                            variant='outlined'
                            size='small'
                            color='success'
                            startIcon={<Check size={16} />}
                            onClick={() => onApprove?.(beneficiary)}
                            sx={{ textTransform: 'none', minWidth: '80px' }}
                          >
                            {t('kycDashboard.approve')}
                          </Button>
                          <Button
                            variant='outlined'
                            size='small'
                            color='error'
                            startIcon={<X size={16} />}
                            onClick={() => onReject?.(beneficiary)}
                            sx={{ textTransform: 'none', minWidth: '80px' }}
                          >
                            {t('kycDashboard.reject')}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant='outlined'
                          size='small'
                          fullWidth
                          startIcon={<Eye size={16} />}
                          onClick={() => onViewDetail?.(beneficiary)}
                          sx={{ textTransform: 'none' }}
                        >
                          {t('kycDashboard.viewDetails')}
                        </Button>
                      )}
                    </Box>
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

export default BeneficiaryTable
