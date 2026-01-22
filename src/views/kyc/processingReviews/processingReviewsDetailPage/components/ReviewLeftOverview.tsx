// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { formatDate } from 'date-fns/format'
import { useTranslate } from '@/contexts/DictionaryContext'
// Icon Imports
import { User, Clock, Play, FileText } from 'lucide-react'

// Types
interface ReviewData {
  nickName: string
  accountTypeLabel: string
  kycTime: string
  reviewName: string
  reviewIsCompleted?: number
}

interface ReviewLeftOverviewProps {
  reviewData: ReviewData
  time?: number
}

const ReviewLeftOverview = ({ reviewData, time }: ReviewLeftOverviewProps) => {
  const t = useTranslate()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const userId = params.id as string
  const reviewId = searchParams.get('reviewId')
  const type = searchParams.get('type')
  const getPriorityColor = (priority: number) => {
    // 0 = 待审核 1 = 审核中 2 = 审核完成
    switch (priority) {
      case 0:
        return { color: 'info', label: t('processingReviews.pending') } // 待审核
      case 1:
        return { color: 'warning', label: t('processingReviews.reviewing') } // 审核中
      case 2:
        return { color: 'success', label: t('processingReviews.reviewCompleted') } // 审核完成
      default:
        return { color: 'default', label: t('processingReviews.unknown') } // 未知
    }
  }

  return (
    <Grid container spacing={6}>
      {/* Review Details Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col pbs-12 gap-6'>
            <div className='flex flex-col gap-6'>
              <div className='flex items-center justify-center flex-col gap-4'>
                <div className='flex flex-col items-center gap-4'>
                  <CustomAvatar alt='review-profile' src='/images/avatars/1.png' variant='rounded' size={120}>
                    <User size={40} />
                  </CustomAvatar>
                  <Typography variant='h5'>{reviewData?.nickName}</Typography>
                </div>
                <div className='flex gap-2'>
                  <Chip label={reviewData?.accountTypeLabel} size='small' variant='outlined' />
                  <Chip
                    label={getPriorityColor(reviewData?.reviewIsCompleted ?? 0).label}
                    color={getPriorityColor(reviewData?.reviewIsCompleted ?? 0).color as any}
                    size='small'
                    variant='tonal'
                  />
                </div>
              </div>

              {/* Progress Section */}

              <div className='flex flex-col items-center gap-4'>
                <div className='flex items-center gap-4 w-full'>
                  <div className='w-[30%] flex justify-end'>
                    <CustomAvatar variant='rounded' color='primary' skin='light'>
                      <Clock size={20} />
                    </CustomAvatar>
                  </div>
                  <div className='flex-1 text-left'>
                    <Typography variant='h6'>
                      {reviewData?.kycTime ? formatDate(reviewData?.kycTime, 'yyyy-MM-dd hh:mm') : '-'}
                    </Typography>
                    <Typography variant='body2'>{t('processingReviews.submittedTime')}</Typography> {/* 提交时间 */}
                  </div>
                </div>
                <div className='flex items-center gap-4 w-full'>
                  <div className='w-[30%] flex justify-end'>
                    <CustomAvatar variant='rounded' color='primary' skin='light'>
                      <User size={20} />
                    </CustomAvatar>
                  </div>
                  <div className='flex-1 text-left'>
                    <Typography variant='h6'>{reviewData?.reviewName}</Typography>
                    <Typography variant='body2'>{t('processingReviews.assignedReviewer')}</Typography>{' '}
                    {/* 分配审核员 */}
                  </div>
                </div>
              </div>
            </div>

            {/* <div>
              <Typography variant='h5'>详细信息</Typography>
              <Divider className='mlb-4 !mt-1' />
              <div className='flex flex-col gap-4'>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    审核类型:
                  </Typography>
                  <Typography>{reviewData.reviewType}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    风险等级:
                  </Typography>
                  <Typography>{reviewData.riskLevel}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    账户类型:
                  </Typography>
                  <Typography>{reviewData.accountType}</Typography>
                </div>
              </div>
            </div> */}

            <div>
              <Typography variant='h5'>{t('processingReviews.quickActions')}</Typography> {/* 快速操作 */}
              <Divider className='mlb-4 !mt-2' />
              <div className='flex flex-col sm:flex-row gap-3 pt-2'>
                <Button
                  variant='outlined'
                  startIcon={<FileText size={20} />}
                  onClick={() => {
                    router.push(getLocalizedUrl(`/kyc/userManagement/${userId}`, locale as string))
                  }}
                  className='flex-1 max-sm:is-full'
                  sx={{
                    minHeight: '44px',
                    fontWeight: 500,
                    textTransform: 'none'
                  }}
                >
                  {t('processingReviews.viewFullProfile')} {/* 查看完整档案 */}
                </Button>
                {reviewData?.reviewIsCompleted != 2 && (
                  <Button
                    variant='contained'
                    startIcon={<Play size={20} />}
                    onClick={() => {
                      router.push(
                        getLocalizedUrl(
                          `/kyc/processingReviews/${userId}/process?reviewId=${reviewId}&type=${type}`,
                          locale as string
                        )
                      )
                    }}
                    className='flex-1 max-sm:is-full'
                    sx={{
                      minHeight: '44px',
                      fontWeight: 500,
                      textTransform: 'none'
                    }}
                  >
                    {t('processingReviews.continueProcessing')} {/* 继续处理 */}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Action Buttons Card */}
      {/* <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <Typography variant='h5'>快速操作</Typography>
            <div className='flex flex-col gap-3'>
              <Button
                variant='contained'
                startIcon={<Play size={20} />}
                // onClick={onContinueProcess}
                className='max-sm:is-full'
              >
                继续处理
              </Button>

              <Button
                variant='outlined'
                startIcon={<FileText size={20} />}
                // onClick={onViewProfile}
                className='max-sm:is-full'
              >
                查看完整档案
              </Button>
            </div>
          </CardContent>
        </Card>
      </Grid> */}
    </Grid>
  )
}

export default ReviewLeftOverview
