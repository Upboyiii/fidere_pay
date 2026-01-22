// MUI Imports
import Grid from '@mui/material/Grid2'
import { useState, useEffect, useMemo } from 'react'
// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import { getKycDashboardData } from '@server/kycDashboard'
import { CardSkeleton } from '@/components/skeletons'
import { useTranslate } from '@/contexts/DictionaryContext'

const KycDashboardCards = () => {
  const t = useTranslate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>([])

  const requestKycDashboardData = async () => {
    setLoading(true)
    try {
      const res = await getKycDashboardData()
      setData(res.data?.total ?? {})
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    requestKycDashboardData()
  }, [])
  // Vars
  const list: UserDataType[] = useMemo(
    () => [
      {
        title: t('kycDashboard.pendingReview'), // 待处理审核
        stats: 'pending',
        avatarIcon: 'ri-time-line',
        avatarColor: 'warning',
        trend: 'positive',
        // trendNumber: '2',
        subtitle: t('kycDashboard.comparedToYesterday') // 较昨日
      },
      {
        title: t('kycDashboard.completedToday'), // 今日完成
        stats: 'todayCompleted',
        avatarIcon: 'ri-checkbox-circle-line',
        avatarColor: 'success',
        trend: 'positive',
        // trendNumber: '12%',
        subtitle: t('kycDashboard.comparedToYesterday') // 较昨日
      },
      {
        title: t('kycDashboard.totalApproved'), // 累计审核通过
        stats: 'completed',
        avatarIcon: 'ri-line-chart-line',
        avatarColor: 'info',
        trend: 'negative',
        // trendNumber: '0.2天',
        subtitle: t('kycDashboard.all') // 全部
      },
      {
        title: t('kycDashboard.currentRejected'), // 当前已拒绝
        stats: 'rejected',
        avatarIcon: 'ri-close-circle-line',
        avatarColor: 'error',
        trend: 'negative',
        // trendNumber: '0.2天',
        subtitle: t('kycDashboard.all') // 全部
      }
    ],
    [t]
  )

  const dataCode = useMemo(() => {
    return list.map((item: any) => ({ ...item, stats: data?.[item.stats] ?? 0 }))
  }, [data, list])
  return (
    <Grid container spacing={6}>
      {dataCode.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? <CardSkeleton /> : <HorizontalWithSubtitle {...item} />}
        </Grid>
      ))}
    </Grid>
  )
}

export default KycDashboardCards
