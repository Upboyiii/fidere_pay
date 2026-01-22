'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'
import CopyButton from '@/components/options/CopyButton'
import { formatDate } from 'date-fns/format'
import { approveWhitelist, rejectWhitelist } from '@server/whitelists'
import { getLocalizedUrl } from '@/utils/i18n'
// Lucide React Imports
import { XCircle, CheckCircle, ExternalLink, User, AlertTriangle, Check, Wallet, Shield } from 'lucide-react'
import { getWhitelistDetail } from '@server/whitelists'
import { toast } from 'react-toastify'
// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'
import { DetailCardSkeleton, StatusCardSkeleton } from '@components/skeletons'
import { CircularProgress } from '@mui/material'
import { useTranslate } from '@/contexts/DictionaryContext'
export default function WhitelistDetailPage() {
  const t = useTranslate()
  const params = useParams()
  const router = useRouter()
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [whitelist, setWhitelist] = useState<any>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const { lang: locale } = useParams()
  useEffect(() => {
    setLoading(true)
    getWhitelistDetail({ id: params.id as string })
      .then(res => {
        setWhitelist(res.data)
      })
      .catch(err => {
        toast.error(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [params.id])

  const handleApprove = (type: 'pass' | 'reject') => {
    setBtnLoading(true)
    const api = type == 'pass' ? approveWhitelist : rejectWhitelist
    setBtnLoading(true)
    api({ id: params.id as string, remark: type == 'pass' ? undefined : rejectionReason })
      .then(res => {
        toast.success(t('kycWhitelists.operationSuccess')) // 操作成功
        setApproveDialogOpen(false)
        setRejectDialogOpen(false)
        setRejectionReason('')
        router.push(getLocalizedUrl('/kyc/whitelists', locale as string))
      })
      .catch(err => {
        toast.error(err.message)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  return (
    <Box>
      {loading ? (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 8 }}>
            <DetailCardSkeleton titleSections={2} fieldsPerGroup={6} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatusCardSkeleton />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card className='mbe-6'>
              <CardContent className='p-6'>
                {/* 地址信息区域 */}
                <div className='flex items-center gap-2.5 mbe-4'>
                  <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                    <Wallet size={20} className='text-primary' />
                  </div>
                  <Typography variant='h6' className='font-semibold'>
                    {t('kycWhitelists.addressInfo')} {/* 地址信息 */}
                  </Typography>
                </div>

                <div className='flex flex-col sm:pl-[50px]'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div
                      className='flex flex-col gap-2 p-4  rounded-lg border'
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('kycWhitelists.addressType')} {/* 地址类型 */}
                      </Typography>
                      <Chip
                        label={whitelist?.coinName || '-'}
                        variant='outlined'
                        size='small'
                        sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                      />
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border'
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('kycWhitelists.network')} {/* 网络 */}
                      </Typography>
                      <Chip
                        label={whitelist?.blockChain || '-'}
                        size='small'
                        variant='tonal'
                        sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                      />
                    </div>
                    <div
                      className='flex flex-col  p-4 rounded-lg border sm:col-span-2'
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('kycWhitelists.address')} {/* 地址 */}
                      </Typography>
                      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                        <div className='flex-grow w-full'>
                          <Typography
                            variant='body1'
                            className='font-mono break-all p-3 pl-0 rounded text-xs sm:text-sm overflow-x-auto bg-background-paper'
                            style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                          >
                            {whitelist?.address || whitelist?.walletAddress || '-'}
                          </Typography>
                        </div>
                        <div className='flex gap-1 flex-shrink-0'>
                          <CopyButton
                            text={whitelist?.address || whitelist?.walletAddress}
                            size='small'
                            sx={{ p: 0.5 }}
                          />
                          {(whitelist?.address || whitelist?.walletAddress) && (
                            <IconButton
                              size='small'
                              onClick={() =>
                                window &&
                                window?.open?.(
                                  `https://tronscan.org/#/address/${whitelist?.address || whitelist?.walletAddress}`,
                                  '_blank'
                                )
                              }
                            >
                              <ExternalLink size={16} />
                            </IconButton>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border'
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('kycWhitelists.label')} {/* 标签 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {whitelist?.remark || '-'}
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                {/* 用户信息区域 */}
                <div className='flex items-center gap-2.5 mbe-4'>
                  <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                    <User size={20} className='text-primary' />
                  </div>
                  <Typography variant='h6' className='font-semibold'>
                    {t('kycWhitelists.userInfo')} {/* 用户信息 */}
                  </Typography>
                </div>

                <div className='flex flex-col sm:pl-[50px]'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border'
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('kycWhitelists.userId')} {/* 用户ID */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {whitelist?.userId || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border'
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('kycWhitelists.userName')} {/* 用户姓名 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {whitelist?.memberNickName || '-'}
                      </Typography>
                    </div>
                  </div>
                </div>

                <Divider className='my-6' />

                {/* 操作区域 */}
                <div className='flex flex-col gap-6'>
                  {/* 相关操作区域 */}
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-2.5 mbe-4'>
                      <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                        <User size={20} className='text-primary' />
                      </div>
                      <Typography variant='h6' className='font-semibold'>
                        {t('kycWhitelists.view')} {/* 查看 */}
                      </Typography>
                    </div>
                    <div className='flex flex-col sm:pl-[50px]'>
                      <div className='flex flex-col gap-2'>
                        <RouterLinkSkip href={`/kyc/userManagement/userManagementDetailPage?id=${whitelist?.userId}`}>
                          <Button
                            variant='outlined'
                            startIcon={<User size={18} />}
                            size='medium'
                            sx={{
                              fontWeight: 500,
                              textTransform: 'none',
                              alignSelf: 'flex-start',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                              }
                            }}
                          >
                            {t('kycWhitelists.viewFullUserProfile')} {/* 查看完整用户资料 */}
                          </Button>
                        </RouterLinkSkip>
                      </div>
                    </div>
                  </div>

                  {/* 审核操作区域 */}
                  {!whitelist?.reviewStatus && (
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-2.5 mbe-4'>
                        <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-success/10'>
                          <CheckCircle size={20} className='text-primary' />
                        </div>
                        <Typography variant='h6' className='font-semibold'>
                          {t('kycWhitelists.review')} {/* 审核 */}
                        </Typography>
                      </div>
                      <div className='flex flex-col sm:pl-[50px]'>
                        <div className='flex gap-4 max-sm:flex-col'>
                          <Button
                            variant='outlined'
                            color='error'
                            startIcon={<XCircle size={18} />}
                            onClick={() => setRejectDialogOpen(true)}
                            size='medium'
                            className='max-sm:is-full'
                            sx={{
                              fontWeight: 500,
                              textTransform: 'none',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                              }
                            }}
                          >
                            {t('kycWhitelists.reject')} {/* 拒绝 */}
                          </Button>
                          <Button
                            variant='contained'
                            color='success'
                            startIcon={<CheckCircle size={18} />}
                            onClick={() => setApproveDialogOpen(true)}
                            size='medium'
                            className='max-sm:is-full'
                            sx={{
                              fontWeight: 600,
                              textTransform: 'none',
                              boxShadow: 2,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 4
                              }
                            }}
                          >
                            {t('kycWhitelists.pass')} {/* 通过 */}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card className='mbe-6'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-1 mbe-2'>
                  <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10'>
                    <AlertTriangle size={20} className='text-warning' />
                  </div>
                  <Typography variant='h6' className='font-semibold'>
                    {t('kycWhitelists.reviewStatus')} {/* 审核状态 */}
                  </Typography>
                </div>
                <div className='flex flex-col gap-5'>
                  <div className='flex flex-col gap-2'>
                    <Typography variant='caption' color='text.secondary' className='font-medium'>
                      {t('kycWhitelists.currentStatus')} {/* 当前状态 */}
                    </Typography>
                    <Chip
                      label={whitelist?.reviewStatusLabel || t('kycWhitelists.unknown')} // 未知
                      color={!whitelist?.reviewStatus ? 'warning' : whitelist?.reviewStatus == 1 ? 'success' : 'error'}
                      size='medium'
                      variant='tonal'
                      sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
                    />
                  </div>
                  <Divider />
                  <div className='flex flex-col gap-2'>
                    <Typography variant='caption' color='text.secondary' className='font-medium'>
                      {t('kycWhitelists.submittedDate')} {/* 提交时间 */}
                    </Typography>
                    <Typography variant='body1' className='font-medium'>
                      {!!whitelist?.createdAt ? formatDate(whitelist?.createdAt, 'yyyy-MM-dd HH:mm') : '-'}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='mbe-6'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-1 '>
                  <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-success/10'>
                    <Shield size={20} className='text-success' />
                  </div>
                  <Typography variant='h6' className='font-semibold'>
                    {t('kycWhitelists.chainVerification')} {/* 链上验证 */}
                  </Typography>
                </div>
                <div className='flex flex-col gap-4'>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <span className='flex items-center gap-2'>
                            <Check size={16} style={{ color: 'var(--mui-palette-success-main)' }} />
                            <Typography variant='body2' color='success.main'>
                              {t('kycWhitelists.addressFormatVerified')} {/* 地址格式验证通过 */}
                            </Typography>
                          </span>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  </List>
                  <Alert severity='info' sx={{ mt: 1 }}>
                    {t('kycWhitelists.suggestApprove')} {/* 建议通过此白名单审核 */}
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{t('kycWhitelists.confirmApproval')}</DialogTitle> {/* 确认通过审核 */}
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {t('kycWhitelists.confirmApprovalMessage')} {/* 确认通过此数字资产地址的审核 */}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('kycWhitelists.postApprovalMessage')} {/* 通过后，用户将可以向此地址进行转账操作。 */}
            </Typography>
          </Box>
          <Box sx={{ p: 3, backgroundColor: '#f0f9f4', borderRadius: 2, mb: 3 }}>
            <Typography variant='body2' sx={{ fontWeight: 500, mb: 2 }}>
              {t('kycWhitelists.addressInfo')} {/* 地址信息 */}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                overflowWrap: 'break-word'
              }}
            >
              {whitelist?.walletAddress}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>{t('kycWhitelists.cancel')}</Button> {/* 取消 */}
          <Button variant='contained' color='success' onClick={() => handleApprove('pass')} disabled={btnLoading}>
            {btnLoading && <CircularProgress size={16} />} {'  '} {t('kycWhitelists.confirmApprovalAction')} {/* 确认通过 */}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{t('kycWhitelists.rejectReview')}</DialogTitle> {/* 拒绝审核 */}
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {t('kycWhitelists.rejectionReasonPrompt')} {/* 请填写拒绝原因 */}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('kycWhitelists.rejectionReasonLabel')} // 拒绝原因
            placeholder={t('kycWhitelists.rejectionReasonPlaceholder')} // 请详细说明拒绝的原因...
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>{t('kycWhitelists.cancel')}</Button> {/* 取消 */}
          <Button
            variant='contained'
            color='error'
            onClick={() => handleApprove('reject')}
            disabled={!rejectionReason.trim()}
          >
            {btnLoading ? <CircularProgress size={20} /> : t('kycWhitelists.confirmRejection')} {/* 确认拒绝 */}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
