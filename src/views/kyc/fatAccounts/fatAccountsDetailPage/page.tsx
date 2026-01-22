'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import { styled } from '@mui/material/styles'
import { CircularProgress } from '@mui/material'

// Component Imports
import { DetailCardSkeleton, StatusCardSkeleton } from '@components/skeletons'
import type { TimelineProps } from '@mui/lab/Timeline'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, User, CreditCard, History, Check, X } from 'lucide-react'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'
import { getFatAccountDetail, approveFatAccount, rejectFatAccount } from '@server/fatAccounts'
import { formatDate } from 'date-fns/format'
import { toast } from 'react-toastify'
import { getLocalizedUrl } from '@/utils/i18n'
import { useTranslate } from '@/contexts/DictionaryContext'

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

export default function FiatAccountDetailPage() {
  const t = useTranslate()
  const params = useParams()
  const router = useRouter()
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)
  const { lang: locale } = useParams()

  useEffect(() => {
    setLoading(true)
    getFatAccountDetail({ id: params.id as string })
      .then(res => {
        setAccount(res.data)
      })
      .catch(err => {
        toast.error(err.message || t('fatAccounts.accountDetailFetchError')) // 获取账户详情失败
      })
      .finally(() => {
        setLoading(false)
      })
  }, [params.id])

  // const auditLogs = [
  //   {
  //     id: '1',
  //     action: '账户提交',
  //     operator: '系统',
  //     timestamp: '2024-01-15 10:30:15',
  //     details: '用户提交法币账户审核申请'
  //   },
  //   {
  //     id: '2',
  //     action: '风险评估',
  //     operator: '系统',
  //     timestamp: '2024-01-15 10:30:20',
  //     details: '自动风险评估完成，风险等级：低'
  //   },
  //   {
  //     id: '3',
  //     action: '分配审核员',
  //     operator: '系统',
  //     timestamp: '2024-01-15 10:30:25',
  //     details: '自动分配给审核员进行审核'
  //   }
  // ]

  const handleApprove = (type: 'pass' | 'reject') => {
    setBtnLoading(true)
    const api = type == 'pass' ? approveFatAccount : rejectFatAccount
    setBtnLoading(true)
    api({ id: params.id as string, remark: type == 'pass' ? undefined : rejectionReason })
      .then(res => {
        toast.success(t('fatAccounts.operationSuccess')) // 操作成功
        setApproveDialogOpen(false)
        setRejectDialogOpen(false)
        setRejectionReason('')
        router.push(getLocalizedUrl('/kyc/fatAccounts', locale as string))
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
        // 加载状态：显示骨架屏
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
                {/* 账户信息区域 */}
                <div className='flex items-center gap-2.5 mbe-4'>
                  <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                    <CreditCard size={20} className='text-primary' />
                  </div>
                  <Typography variant='h6' className='font-semibold'>
                    {t('fatAccounts.accountInfo')} {/* 账户信息 */}
                  </Typography>
                </div>

                <div className='flex flex-col sm:pl-[50px]'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.accountType')} {/* 账户类型 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {t('fatAccounts.bankCard')} {/* 银行卡 */}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.bankName')} {/* 银行名称 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {account?.account?.bankName || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.accountNumber')} {/* 账户号码 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium font-mono'>
                        {account?.account?.bankAccount || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.accountHolder')} {/* 账户持有人 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {account?.account?.accountHolder || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.openingBank')} {/* 开户行 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {account?.bankAddress || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.swiftCode')} {/* SWIFT代码 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium font-mono'>
                        {account?.account?.swiftCode || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.bankAddress')} {/* 开户行地址 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium font-mono'>
                        {account?.bankAddress || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.intermediaryBankName')} {/* 中间银行名称 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium font-mono'>
                        {account?.transferBank || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.intermediarySwiftCode')} {/* 中间银行 SWIFT 代码 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium font-mono'>
                        {account?.transferSwift || '-'}
                      </Typography>
                    </div>
                  </div>
                </div>

                <Divider className='my-6' />

                {/* 用户信息区域 */}
                <div className='flex items-center gap-2.5 mbe-4'>
                  <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                    <User size={20} className='text-primary' />
                  </div>
                  <Typography variant='h6' className='font-semibold'>
                    {t('fatAccounts.userInfo')} {/* 用户信息 */}
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
                        {t('fatAccounts.userId')} {/* 用户ID */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {account?.account?.userId || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.userName')} {/* 用户姓名 */}
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {account?.account?.memberNickName || '-'}
                      </Typography>
                    </div>
                    <div
                      className='flex flex-col gap-2 p-4 rounded-lg border '
                      style={{
                        backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                        borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                      }}
                    >
                      <Typography variant='caption' color='text.secondary' className='font-medium'>
                        {t('fatAccounts.kycStatus')} {/* KYC状态 */}
                      </Typography>
                      <div>
                        <Chip label={t('fatAccounts.passed')} size='small' color='success' variant='tonal' />{' '}
                        {/* 已通过 */}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card className='mbe-6'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-2.5 mbe-5'>
                  <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10'>
                    <AlertTriangle size={20} className='text-warning' />
                  </div>
                  <Typography variant='h6' className='font-semibold'>
                    {t('fatAccounts.reviewStatus')} {/* 审核状态 */}
                  </Typography>
                </div>
                <div className='flex flex-col gap-5'>
                  <div className='flex flex-col gap-2'>
                    <Typography variant='caption' color='text.secondary' className='font-medium'>
                      {t('fatAccounts.currentStatus')} {/* 当前状态 */}
                    </Typography>
                    <Chip
                      label={account?.account?.statusLabel || t('fatAccounts.unknown')} // 未知
                      color={
                        !account?.account?.status ? 'warning' : account?.account?.status == 1 ? 'success' : 'error'
                      }
                      size='medium'
                      variant='tonal'
                      sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
                    />
                  </div>
                  <Divider />
                  <div className='flex flex-col gap-2'>
                    <Typography variant='caption' color='text.secondary' className='font-medium'>
                      {t('fatAccounts.submittedDate')} {/* 提交时间 */}
                    </Typography>
                    <Typography variant='body1' className='font-medium'>
                      {!!account?.account?.createdAt
                        ? formatDate(account?.account?.createdAt, 'yyyy-MM-dd HH:mm')
                        : '-'}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 操作区域卡片 */}
            <Card className='mbe-6'>
              <CardContent className='p-6'>
                <div className='flex flex-col gap-6'>
                  {/* 相关操作区域 */}
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-2.5 mbe-4'>
                      <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                        <User size={20} className='text-primary' />
                      </div>
                      <Typography variant='h6' className='font-semibold'>
                        {t('fatAccounts.view')} {/* 查看 */}
                      </Typography>
                    </div>
                    <div className='flex flex-col sm:pl-[50px]'>
                      <div className='flex flex-col gap-2'>
                        <RouterLinkSkip href={`/kyc/userManagement/userManagementDetailPage?id=${account?.userId}`}>
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
                            {t('fatAccounts.viewFullUserProfile')} {/* 查看完整用户资料 */}
                          </Button>
                        </RouterLinkSkip>
                      </div>
                    </div>
                  </div>

                  {/* 审核操作区域 */}
                  {account?.account?.status == 0 && (
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-2.5 mbe-4'>
                        <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-success/10'>
                          <CheckCircle size={20} className='text-primary' />
                        </div>
                        <Typography variant='h6' className='font-semibold'>
                          {t('fatAccounts.review')} {/* 审核 */}
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
                            {t('fatAccounts.reject')} {/* 拒绝 */}
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
                            {t('fatAccounts.pass')} {/* 通过 */}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* <Card className='mbe-6'>
            <CardContent className='p-6'>
              <Typography variant='h6' className='font-semibold mbe-4'>
                快速检查
              </Typography>
              <List dense>
                {quickChecks.map(check => (
                  <ListItem key={check.id}>
                    <ListItemText
                      primary={
                        <div className='flex items-center gap-2'>
                          {check.passed ? (
                            <Check size={16} className='text-green-600' />
                          ) : (
                            <X size={16} className='text-red-600' />
                          )}
                          <span className={check.passed ? 'text-green-600' : 'text-red-600'}>{check.text}</span>
                        </div>
                      }
                      primaryTypographyProps={{ variant: 'body2', component: 'div' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card> */}

            {/* <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2 mbe-6'>
                <History size={20} className='text-primary' />
                <Typography variant='h6' className='font-semibold'>
                  审计日志
                </Typography>
              </div>

              <Timeline>
                {auditLogs.map((log, index) => (
                  <TimelineItem key={log.id}>
                    <TimelineSeparator>
                      <TimelineDot color='primary' />
                      {index < auditLogs.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                        <Typography className='font-medium' color='text.primary'>
                          {log.action}
                        </Typography>
                        <Typography variant='caption' color='text.disabled'>
                          {log.timestamp}
                        </Typography>
                      </div>
                      <Typography className='mbe-2.5'>{log.details}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        操作人: {log.operator}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card> */}
          </Grid>
        </Grid>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{t('fatAccounts.confirmApproval')}</DialogTitle> {/* 确认通过审核 */}
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {t('fatAccounts.confirmApprovalMessage')} {/* 确认通过此法币账户的审核 */}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('fatAccounts.postApprovalMessage')} {/* 通过后，用户将可以使用此账户进行转账操作。 */}
            </Typography>
          </Box>
          <Box sx={{ p: 3, backgroundColor: '#f0f9f4', borderRadius: 2, mb: 3 }}>
            <Typography variant='body2' sx={{ fontWeight: 500, mb: 2 }}>
              {t('fatAccounts.accountInfo')} {/* 账户信息 */}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {account?.account?.bankName} - {account?.account?.bankAccount}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>{t('fatAccounts.cancel')}</Button> {/* 取消 */}
          <Button variant='contained' color='success' onClick={() => handleApprove('pass')} disabled={btnLoading}>
            {btnLoading && <CircularProgress size={16} />} {'  '} {t('fatAccounts.confirmApprovalAction')}{' '}
            {/* 确认通过 */}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{t('fatAccounts.rejectReview')}</DialogTitle> {/* 拒绝审核 */}
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {t('fatAccounts.rejectionReasonPrompt')} {/* 请填写拒绝原因 */}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('fatAccounts.rejectionReasonLabel')} // 拒绝原因
            placeholder={t('fatAccounts.rejectionReasonPlaceholder')} // 请详细说明拒绝的原因...
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>{t('fatAccounts.cancel')}</Button> {/* 取消 */}
          <Button
            variant='contained'
            color='error'
            onClick={() => handleApprove('reject')}
            disabled={!rejectionReason.trim()}
          >
            {t('fatAccounts.confirmRejection')} {/* 确认拒绝 */}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
