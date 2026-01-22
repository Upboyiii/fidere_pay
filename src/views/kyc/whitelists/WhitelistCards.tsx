// MUI Imports
import Grid from '@mui/material/Grid2'
import { useMemo } from 'react'
// Type Imports
import type { ThemeColor } from '@core/types'
import { CardSkeleton } from '@components/skeletons'
// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import { useTranslate } from '@/contexts/DictionaryContext'

const WhitelistCards = ({ data, loading = false }: { data: any; loading?: boolean }) => {
  const t = useTranslate()
  // Vars
  const cardData = useMemo(() => [
    {
      title: t('kycWhitelists.pendingAddresses'), // 待审核地址
      stats: 'pending',
      avatarIcon: 'ri-time-line',
      avatarColor: 'warning' as ThemeColor
    },
    {
      title: t('kycWhitelists.approvedAddresses'), // 已通过地址
      stats: 'approved',
      avatarIcon: 'ri-checkbox-circle-line',
      avatarColor: 'success' as ThemeColor
    },
    {
      title: t('kycWhitelists.rejectedAddresses'), // 已拒绝地址
      stats: 'rejected',
      avatarIcon: 'ri-close-circle-line',
      avatarColor: 'error' as ThemeColor
    }
    // {
    //   title: '高风险地址',
    //   stats: '1',
    //   avatarIcon: 'ri-error-warning-line',
    //   avatarColor: 'warning' as ThemeColor
    // }
  ], [t])

  const dataCode = useMemo(() => {
    return cardData.map((item: any) => ({ ...item, stats: data?.[item.stats] ?? 0 }))
  }, [data, cardData])
  return (
    <Grid container spacing={6}>
      {loading
        ? cardData.map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <CardSkeleton />
            </Grid>
          ))
        : dataCode.map((item, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <HorizontalWithSubtitle {...item} />
            </Grid>
          ))}
    </Grid>
  )
}

export default WhitelistCards
