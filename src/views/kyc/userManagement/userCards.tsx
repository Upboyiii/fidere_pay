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

const UserCards = ({ data, loading = false }: { data: any; loading?: boolean }) => {
  const t = useTranslate()
  // Vars
  const cardData = useMemo(
    () => [
      {
        title: t('userManagement.approvedTotal'),
        stats: 'approvedCount',
        avatarIcon: 'ri-group-line',
        avatarColor: 'primary' as const,
        trend: 'positive' as 'positive' | 'negative',
        trendNumber: '',
        subtitle: t('userManagement.approvedTotalSubtitle')
      },
      {
        title: t('userManagement.activeAccount'),
        stats: 'enableCount',
        avatarIcon: 'ri-user-follow-line',
        avatarColor: 'success' as const,
        trend: 'positive' as 'positive' | 'negative',
        trendNumber: '',
        subtitle: t('userManagement.activeAccountSubtitle')
      },
      {
        title: t('userManagement.suspendedAccount'),
        stats: 'disableCount',
        avatarIcon: 'ri-pause-circle-line',
        avatarColor: 'error' as const,
        trend: 'positive' as 'positive' | 'negative',
        trendNumber: '',
        subtitle: t('userManagement.suspendedAccountSubtitle')
      }
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

export default UserCards
