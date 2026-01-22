// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import { formatDate } from 'date-fns/format'
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { getCareerName } from './tools'
import { useTranslate } from '@/contexts/DictionaryContext'

// Icon Imports
import { User, Calendar } from 'lucide-react'

// Types
interface UserLeftOverviewProps {
  userData: any
  careerList: any
}

export const UserLeftOverviewCode = ({ userData, careerList }: UserLeftOverviewProps) => {
  const t = useTranslate()
  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-center flex-col gap-2'>
              <div className='flex flex-col items-center gap-4'>
                <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120}>
                  <User size={40} />
                </CustomAvatar>
                <Typography variant='h5'>{userData?.nameLabel}</Typography>
              </div>
              <div className='flex gap-2'>
                <Chip label={t('userManagement.individualCustomer')} size='small' variant='outlined' /> {/* 个人客户 */}
              </div>
            </div>
            <div className='flex flex-col items-center gap-4'>
              <div className='flex items-center gap-4 w-full'>
                <div className='w-[30%] flex justify-end'>
                  <CustomAvatar variant='rounded' color='primary' skin='light'>
                    <Calendar size={20} />
                  </CustomAvatar>
                </div>
                <div className='flex-1 text-left'>
                  <Typography variant='h6'>
                    {userData?.kycTime ? formatDate(userData.kycTime, 'yyyy-MM-dd hh:mm') : '-'}
                  </Typography>
                  <Typography variant='body2'>{t('userManagement.submittedTime')}</Typography> {/* 提交时间 */}
                </div>
              </div>
              <div className='flex items-center gap-4 w-full'>
                <div className='w-[30%] flex  justify-end'>
                  <CustomAvatar variant='rounded' color='primary' skin='light'>
                    <User size={20} />
                  </CustomAvatar>
                </div>
                <div className='flex-1 text-left'>
                  <Typography variant='h6'>{userData?.id}</Typography>
                  <Typography variant='body2'>{t('userManagement.userId')}</Typography> {/* 用户ID */}
                </div>
              </div>
            </div>
          </div>
          <div>
            <Typography variant='h5'>{t('userManagement.detailInfo')}</Typography> {/* 详细信息 */}
            <Divider className='mlb-4 !mt-1' />
            <div className='flex flex-col gap-4'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {t('userManagement.phoneNumber')}: {/* 手机号码 */}
                </Typography>
                <Typography>
                  {userData?.phonePrefix && '+'} {userData?.phonePrefix} {userData?.phone}
                </Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {t('userManagement.emailAddress')}: {/* 邮箱地址 */}
                </Typography>
                <Typography>{userData?.email}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {t('userManagement.career')}: {/* 职业 */}
                </Typography>
                <Typography>
                  {getCareerName(
                    (userData?.kycInfo ? userData?.kycInfo : userData)?.careerStatus,
                    careerList?.careerStatus
                  ) ?? '-'}
                </Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {t('userManagement.position')}: {/* 职位 */}
                </Typography>
                <Typography>
                  {getCareerName(
                    (userData?.kycInfo ? userData?.kycInfo : userData)?.careerPosition,
                    careerList?.position
                  ) ?? '-'}
                </Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Grid>
  )
}

const UserLeftOverview = (props: UserLeftOverviewProps) => {
  return (
    <Grid container spacing={6}>
      <UserLeftOverviewCode {...props} />
    </Grid>
  )
}

export default UserLeftOverview
