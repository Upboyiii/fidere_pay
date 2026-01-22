// MUI Imports
import Grid from '@mui/material/Grid2'
import { useState, useEffect, useMemo } from 'react'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import { getProcessingTotal } from '@server/processingReviews'
import { CardSkeleton } from '@/components/skeletons'
import type { ThemeColor } from '@core/types'
import { useTranslate } from '@/contexts/DictionaryContext'

const TabCard = () => {
  const t = useTranslate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>([])
  const requestProcessingTotal = async () => {
    setLoading(true)
    try {
      const res = await getProcessingTotal()
      setData(res.data ?? {})
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    requestProcessingTotal()
  }, [])
  // Vars
  const cardData = useMemo(() => [
    {
      title: t('processingReviews.inReview'), // 处理中审核
      stats: 'in_review',
      avatarIcon: 'ri-time-line',
      avatarColor: 'warning' as ThemeColor,
      trend: 'positive',
      // trendNumber: '1',
      subtitle: t('processingReviews.all') // 全部
    },
    {
      title: t('processingReviews.overdueReview'), // 逾期审核
      stats: 'out_time',
      avatarIcon: 'ri-error-warning-line',
      avatarColor: 'error' as ThemeColor,
      trend: 'negative',
      // trendNumber: '0',
      subtitle: t('processingReviews.needsAttention') // 需要关注
    },
    {
      title: t('processingReviews.onlineReviewers'), // 在线审核员
      stats: 'review_num',
      avatarIcon: 'ri-user-line',
      avatarColor: 'success' as ThemeColor,
      trend: 'positive',
      // trendNumber: '12%',
      subtitle: t('processingReviews.all') // 全部
    },
    {
      title: t('processingReviews.averageProgress'), // 平均审核进度
      stats: 'average_progress',
      avatarIcon: 'ri-percent-line',
      avatarColor: 'info' as ThemeColor,
      trend: 'negative',
      // trendNumber: '0.2天',
      subtitle: t('processingReviews.all') // 全部
    }
  ], [t])

  const dataCode = useMemo(() => {
    return cardData.map((item: any) => ({ ...item, stats: data?.[item.stats] ?? 0 }))
  }, [data, cardData])
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

export default TabCard
