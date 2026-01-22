'use client'
// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import { CardSkeleton } from '@components/skeletons'
import { useMemo } from 'react'
import { useTranslate } from '@/contexts/DictionaryContext'

const FatAccountCards = ({ data, loading = false }: { data: any; loading?: boolean }) => {
  const t = useTranslate()
  // Vars
  const cardData = useMemo(
    () => [
      {
        title: t('fatAccounts.pendingAccounts'), // 待审核账户
        stats: 'pending',
        avatarIcon: 'ri-time-line',
        avatarColor: 'warning' as ThemeColor
      },
      {
        title: t('fatAccounts.approvedAccounts'), // 已通过账户
        stats: 'approved',
        avatarIcon: 'ri-checkbox-circle-line',
        avatarColor: 'success' as ThemeColor
      },
      {
        title: t('fatAccounts.rejectedAccounts'), // 已拒绝账户
        stats: 'rejected',
        avatarIcon: 'ri-close-circle-line',
        avatarColor: 'error' as ThemeColor
      }
      // {
      //   title: '高风险账户',
      //   stats: '1',
      //   avatarIcon: 'ri-error-warning-line',
      //   avatarColor: 'warning' as ThemeColor
      // }
    ],
    [t]
  )

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

export default FatAccountCards
