'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Icon Imports
import { X, Check, User, Phone, Mail, MapPin } from 'lucide-react'

// Utils Imports
import { getInitials } from '@/utils/getInitials'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import type { BeneficiaryListItem } from '@server/trust'

interface BeneficiaryDetailDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 受益人数据 */
  beneficiary?: BeneficiaryListItem | null
  /** 通过审核回调 */
  onApprove?: (beneficiary: BeneficiaryListItem) => void
  /** 驳回回调 */
  onReject?: (beneficiary: BeneficiaryListItem, reason: string) => void
  /** 按钮加载状态 */
  loading?: boolean
  /** 是否显示通过审核按钮 */
  showApproveButton?: boolean
}

/**
 * 受益人详情弹窗组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param beneficiary - 受益人数据
 * @param onApprove - 通过审核回调
 * @param onReject - 驳回回调
 * @param loading - 按钮加载状态
 */
const BeneficiaryDetailDialog = ({
  open,
  onClose,
  beneficiary,
  onApprove,
  onReject,
  loading = false,
  showApproveButton = true
}: BeneficiaryDetailDialogProps) => {
  const t = useTranslate()
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!open) {
      setRejectionReason('')
    }
  }, [open])

  if (!beneficiary) return null

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return { color: '#2e7d32', bg: '#e8f5e9' }
      case 2:
        return { color: '#d32f2f', bg: '#ffebee' }
      default:
        return { color: '#f57c00', bg: '#fff3e0' }
    }
  }

  const statusObj = getStatusColor(beneficiary.status)
  const statusLabel =
    beneficiary.statusLabel ||
    (beneficiary.status === 1
      ? t('kycDashboard.approved')
      : beneficiary.status === 2
        ? t('kycDashboard.reject')
        : t('kycDashboard.pendingReview'))

  const handleApprove = () => {
    onApprove?.(beneficiary)
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return
    }
    onReject?.(beneficiary, rejectionReason)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      closeAfterTransition={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '600px'
        }
      }}
    >
      <DialogTitle className='flex items-center justify-between p-6 pb-0'>
        {t('kycDashboard.beneficiaryDetail')}
        <IconButton onClick={onClose} size='small'>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent className='px-6 py-5'>
        <Box className='flex flex-col gap-5'>
          {/* 头部：头像和基本信息 */}
          <Box className='flex items-start gap-4'>
            <CustomAvatar skin='light' size={56} color='primary'>
              {getInitials(beneficiary.name)}
            </CustomAvatar>
            <Box className='flex-1 flex flex-col gap-2'>
              <Box className='flex items-center gap-2 flex-wrap'>
                <Typography variant='h6' className='font-semibold'>
                  {beneficiary.name}
                </Typography>
                <Chip
                  variant='tonal'
                  label={statusLabel}
                  size='small'
                  sx={{
                    backgroundColor: statusObj.bg,
                    color: statusObj.color,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24
                  }}
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

          <Divider sx={{ borderStyle: 'dashed', borderColor: 'divider' }} />

          {/* 证件信息 */}
          <Box className='flex flex-col gap-2.5'>
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

          <Divider sx={{ borderStyle: 'dashed', borderColor: 'divider' }} />

          {/* 受益比例 */}
          <Box className='flex flex-col gap-2'>
            <Typography variant='caption' color='text.secondary' className='font-medium'>
              {t('kycDashboard.beneficiaryRatio')}
            </Typography>
            <Box
              className='flex items-center justify-between p-3 rounded-lg border'
              sx={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.06) 100%)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
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

          <Divider sx={{ borderStyle: 'dashed', borderColor: 'divider' }} />

          {/* 联系方式 */}
          {(beneficiary.phone || beneficiary.email || beneficiary.address) && (
            <Box className='flex flex-col gap-3'>
              {(beneficiary.phone || beneficiary.address) && (
                <Box className='flex flex-col gap-3'>
                  {beneficiary.phone && (
                    <Box className='flex items-center gap-2'>
                      <Phone size={14} className='text-textSecondary' />
                      <Typography variant='body2' color='text.secondary'>
                        {beneficiary.phone}
                      </Typography>
                    </Box>
                  )}
                  {beneficiary.address && (
                    <Box className='flex items-center gap-2'>
                      <MapPin size={14} className='text-textSecondary' />
                      <Typography variant='body2' color='text.secondary'>
                        {beneficiary.address}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              {beneficiary.email && (
                <Box className='flex items-center gap-2'>
                  <Mail size={14} className='text-textSecondary' />
                  <Typography variant='body2' color='text.secondary' className='break-all'>
                    {beneficiary.email}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* 已驳回原因显示 */}
          {beneficiary.status === 2 && (
            <>
              <Divider sx={{ borderStyle: 'dashed', borderColor: 'divider' }} />
              <Box className='flex flex-col gap-2.5'>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary' }}>
                  {t('kycDashboard.rejectionReason')}
                </Typography>
                <Box
                  className='p-3 rounded-lg border'
                  sx={{
                    backgroundColor: 'rgba(244, 67, 54, 0.04)',
                    borderColor: 'rgba(244, 67, 54, 0.2)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(244, 67, 54, 0.3)',
                      backgroundColor: 'rgba(244, 67, 54, 0.06)'
                    }
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{
                      color: '#d32f2f',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {beneficiary.remark || '-'}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {/* 驳回原因输入 */}
          {(beneficiary.status === 0 || beneficiary?.status == 3) && (
            <>
              <Divider sx={{ borderStyle: 'dashed', borderColor: 'divider' }} />
              <Box className='flex flex-col gap-2.5'>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary' }}>
                  {t('kycDashboard.rejectionReason')} ({t('kycDashboard.rejectReason')})
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder={t('kycDashboard.rejectionReasonPlaceholder')}
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      {(beneficiary.status === 0 || beneficiary?.status == 3) && (
        <DialogActions sx={{ px: 5, py: 3 }}>
          <Button
            onClick={onClose}
            variant='outlined'
            sx={{
              borderColor: '#9c27b0',
              color: '#9c27b0',
              '&:hover': {
                borderColor: '#7b1fa2',
                backgroundColor: 'rgba(156, 39, 176, 0.04)'
              }
            }}
          >
            {t('kycDashboard.close')}
          </Button>
          <Button
            variant='outlined'
            onClick={handleReject}
            disabled={loading || !rejectionReason.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <X size={16} />}
            sx={{
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(244, 67, 54, 0.04)'
              },
              '&.Mui-disabled': {
                borderColor: 'rgba(0, 0, 0, 0.26)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {t('kycDashboard.reject')}
          </Button>
          {showApproveButton && (
            <Button
              variant='contained'
              onClick={handleApprove}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <Check size={16} />}
              sx={{
                color: '#fff',

                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)'
                }
              }}
            >
              {t('kycDashboard.approveReview')}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default BeneficiaryDetailDialog
