'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid2'
import CustomAvatar from '@core/components/mui/Avatar'
import Divider from '@mui/material/Divider'

// Icon Imports
import { Building2, Calendar, Mail, User, Hash } from 'lucide-react'

// Utils Imports
import { formatDate } from 'date-fns/format'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import type { TrustDetailData } from '@server/trust'

interface TrustOverviewProps {
  /** 信托数据 */
  trustData: TrustDetailData | null
}

/**
 * 信托概览组件
 * 显示信托基本信息
 * @param trustData - 信托数据
 */
const TrustOverview = ({ trustData }: TrustOverviewProps) => {
  const t = useTranslate()

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent className='flex flex-col pbs-8 gap-4'>
          {/* 信托标题区域 */}
          <div className='flex flex-col items-center gap-3'>
            <CustomAvatar variant='rounded' color='primary' skin='light' size={80}>
              <Building2 size={36} />
            </CustomAvatar>
            <div className='flex flex-col items-center gap-1.5'>
              <Typography variant='h6' className='font-semibold'>
                {trustData?.trustName || '-'}
              </Typography>
              <div className='flex items-center gap-1.5'>
                <Hash size={12} className='text-textSecondary' />
                <Typography variant='caption' color='text.secondary' className='font-mono text-xs'>
                  {trustData?.trustNumber || '-'}
                </Typography>
              </div>
            </div>
          </div>

          <Divider
            sx={{
              borderStyle: 'dashed',
              borderColor: 'divider'
            }}
          />

          {/* 用户信息区域 */}
          <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10'>
                <User size={16} className='text-primary' />
              </div>
              <Typography variant='subtitle2' className='font-semibold'>
                {t('kycDashboard.userInfo')}
              </Typography>
            </div>

            <div className='flex flex-col gap-3'>
              <div
                className='flex flex-col gap-1.5 p-3 rounded-lg border'
                style={{
                  backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                  borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                }}
              >
                <Typography variant='caption' color='text.secondary' className='font-medium text-xs'>
                  {t('kycDashboard.userName')}
                </Typography>
                <div className='flex items-center gap-2'>
                  <CustomAvatar variant='rounded' color='primary' skin='light' size={24}>
                    <User size={12} />
                  </CustomAvatar>
                  <Typography variant='body2' className='font-medium'>
                    {trustData?.userName || '-'}
                  </Typography>
                </div>
              </div>

              <div
                className='flex flex-col gap-1.5 p-3 rounded-lg border'
                style={{
                  backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                  borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                }}
              >
                <Typography variant='caption' color='text.secondary' className='font-medium text-xs'>
                  {t('kycDashboard.userEmail')}
                </Typography>
                <div className='flex items-center gap-2'>
                  <CustomAvatar variant='rounded' color='primary' skin='light' size={24}>
                    <Mail size={12} />
                  </CustomAvatar>
                  <Typography variant='body2' className='font-medium break-all text-xs'>
                    {trustData?.userEmail || '-'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <Divider
            sx={{
              borderStyle: 'dashed',
              borderColor: 'divider'
            }}
          />

          {/* 时间信息区域 */}
          <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10'>
                <Calendar size={16} className='text-primary' />
              </div>
              <Typography variant='subtitle2' className='font-semibold'>
                时间信息
              </Typography>
            </div>

            <div className='flex flex-col gap-3'>
              <div
                className='flex flex-col gap-1.5 p-3 rounded-lg border'
                style={{
                  backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                  borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                }}
              >
                <Typography variant='caption' color='text.secondary' className='font-medium text-xs'>
                  {t('kycDashboard.establishmentTime')}
                </Typography>
                <Typography variant='body2' className='font-medium'>
                  {trustData?.createTime ? formatDate(new Date(trustData.createTime), 'yyyy/MM/dd HH:mm') : '-'}
                </Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default TrustOverview
