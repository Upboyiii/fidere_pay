'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Grid from '@mui/material/Grid2'

// Component Imports
import ReviewLeftOverview from './components/ReviewLeftOverview'
import ReviewRight from './components/ReviewRight'
import ProgressTab from './components/ProgressTab'
import VerificationTab from './components/VerificationTab'
import StepsTab from './components/StepsTab'
import { getOverviewData } from '@server/kycDashboard'
import UserDetailSkeleton from '@views/kyc/userManagement/userManagementDetailPage/components/UserDetailSkeleton'

export default function ProcessingReviewDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<any>(null)
  const userId = params.id as string
  const reviewId = searchParams.get('reviewId')
  useEffect(() => {
    requestgetOverviewData()
  }, [])
  const requestgetOverviewData = async () => {
    setLoading(true)
    try {
      const res = await getOverviewData({ userId, reviewId })
      setInfo(res.data ?? null)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  // Tab内容列表
  const tabContentList = {
    progress: <ProgressTab progress={info?.member ?? {}} />,
    verification: <VerificationTab info={info} />,
    steps: <StepsTab steps={info?.member?.processingStep ?? []} />
  }

  return (
    <>
      <Grid container spacing={6}>
        {loading ? (
          <UserDetailSkeleton />
        ) : (
          <>
            <Grid size={{ xs: 12, lg: 4, md: 5 }}>
              <ReviewLeftOverview reviewData={info?.member ?? {}} />
            </Grid>
            <Grid size={{ xs: 12, lg: 8, md: 7 }}>
              <ReviewRight tabContentList={tabContentList} />
            </Grid>
          </>
        )}
      </Grid>
    </>
  )
}
