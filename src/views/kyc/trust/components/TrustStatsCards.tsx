'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import HorizontalWithSubtitle from '@/components/card-statistics/HorizontalWithSubtitle'
import { CardSkeleton } from '@/components/skeletons'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { UserDataType } from '@/components/card-statistics/HorizontalWithSubtitle'

interface TrustStatsCardsProps {
  /** 统计数据 */
  stats: {
    /** 信托记录总数 */
    totalTrustRecords: number
    /** 待审核受益人数量 */
    beneficiariesPendingReview: number
    /** 待签署文件数量 */
    documentsPendingSignature: number
    /** 受益人总数 */
    totalBeneficiaries: number
  }
  /** 加载状态 */
  loading?: boolean
}

/**
 * 信托统计卡片组件
 * @param stats - 统计数据
 * @param loading - 加载状态
 */
const TrustStatsCards = ({ stats, loading = false }: TrustStatsCardsProps) => {
  const t = useTranslate()

  // 卡片数据配置
  const cardList: UserDataType[] = useMemo(
    () => [
      {
        title: t('kycDashboard.totalTrustRecords'),
        stats: String(stats.totalTrustRecords),
        avatarIcon: 'ri-building-line',
        avatarColor: 'primary',
        subtitle: ''
      },
      {
        title: t('kycDashboard.beneficiariesPendingReview'),
        stats: String(stats.beneficiariesPendingReview),
        avatarIcon: 'ri-user-line',
        avatarColor: 'warning',
        subtitle: ''
      },
      {
        title: t('kycDashboard.documentsPendingSignature'),
        stats: String(stats.documentsPendingSignature),
        avatarIcon: 'ri-file-text-line',
        avatarColor: 'error',
        subtitle: ''
      },
      {
        title: t('kycDashboard.totalBeneficiaries'),
        stats: String(stats.totalBeneficiaries),
        avatarIcon: 'ri-group-line',
        avatarColor: 'info',
        subtitle: ''
      }
    ],
    [stats, t]
  )

  return (
    <Grid container spacing={6}>
      {cardList.map((item, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? <CardSkeleton /> : <HorizontalWithSubtitle {...item} />}
        </Grid>
      ))}
    </Grid>
  )
}

export default TrustStatsCards
