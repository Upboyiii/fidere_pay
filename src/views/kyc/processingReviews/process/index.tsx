'use client'

import type React from 'react'
import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Grid2 as Grid } from '@mui/material'
import UserDetailSkeleton from '@views/kyc/userManagement/userManagementDetailPage/components/UserDetailSkeleton'
import ProcessThirdPartyTab from '@views/kyc/userManagement/userManagementDetailPage/components/ThirdPartyStatusTab'
import DocumentsTab from '@views/kyc/userManagement/userManagementDetailPage/components/DocumentsTab'
// Component Imports
import ProcessLeftOverview from './components/ProcessLeftOverview'
import ProcessRight from './components/ProcessRight'
import BasicInfoTab from '../../userManagement/userManagementDetailPage/components/BasicInfoTab'
import { getCareerList } from '@server/pages-api'
import { getReviewDetail, approveReview, rejectReview } from '@server/kycDashboard'
import { toast } from 'react-toastify'
import { editUserManagement } from '@/@server/userManagementTable'
import { getLocalizedUrl } from '@/utils/i18n'
import { useTranslate } from '@/contexts/DictionaryContext'
/**
 * 处理审核页面
 */
export default function ProcessReviewPage() {
  const t = useTranslate()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reviewDecision, setReviewDecision] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [careerList, setCareerList] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<any>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  // 获取路由参数和查询参数
  const userId = params.id as string // 从路由中获取 user_id
  const reviewId = searchParams.get('reviewId') // 从查询参数中获取 id

  const { lang: locale } = useParams()
  useEffect(() => {
    requestgetReviewDetail()
    getCareerList().then(res => {
      setCareerList(res.data?.list ?? null)
    })
  }, [])
  const requestgetReviewDetail = (isLoading = true) => {
    isLoading && setLoading(true)
    getReviewDetail({ reviewId, userId })
      .then(res => {
        setInfo(res?.data ?? null)
      })
      .finally(() => {
        setLoading(false)
      })
      .catch(err => {})
  }

  /**
   * 提交审核决定
   */
  const handleSubmitDecision = async () => {
    try {
      const type = searchParams.get('type') // 从查询参数中获取 type
      const params = { userId, reviewId, remark: reviewNotes }
      const api = reviewDecision === 'approve' ? approveReview : rejectReview
      setBtnLoading(true)
      const res: any = await api(params)
      toast.success(res?.message || t('processingReviews.operationSuccess')) // 操作成功
      if (reviewDecision != 'approve' || info?.reviewStep == 'doc_review') {
        router.push(
          getLocalizedUrl(
            `/kyc/${(type as unknown as number) == 1 ? 'dashboard' : 'processingReviews'}`,
            locale as string
          )
        )
      } else {
        requestgetReviewDetail()
        setReviewDecision('')
        setReviewNotes('')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setBtnLoading(false)
    }
  }
  const onSave = async (data: any): Promise<string> => {
    try {
      const params = {
        id: userId,
        [data.key]: data.value
      }
      const res: any = await editUserManagement(params)
      toast.success(res?.message || t('processingReviews.saveSuccess')) // 保存成功
      // 刷新详情数据
      requestgetReviewDetail(false)
      return 'success'
    } catch (error: any) {
      toast.error(error?.message || t('processingReviews.saveFailed')) // 保存失败
      return 'error'
    }
  }
  // Tab content list
  const tabContentList = useMemo(() => {
    const objs = {
      // 基本信息
      'basic-info': (
        <BasicInfoTab
          personalInfo={{ ...info?.member, ...info?.kyc }}
          editable={true}
          careerList={careerList}
          onSave={onSave}
        />
      ),
      // 文档资料
      documents: <DocumentsTab documents={info?.documents} />,
      // 第三方验证
      'third-party': (
        <ProcessThirdPartyTab
          applicantId={info?.sumsub?.applicantId || info?.member?.inspection_id}
          sumsubData={info?.sumsub ? { sumsub: info.sumsub } : undefined}
        />
      )
    }
    return objs
  }, [info, careerList])

  return (
    <>
      <Grid container spacing={6}>
        {loading ? (
          <UserDetailSkeleton />
        ) : (
          <>
            <Grid size={{ xs: 12, lg: 4, md: 5 }}>
              <ProcessLeftOverview
                userData={{ ...info?.member, ...info?.kyc }}
                careerList={careerList}
                reviewDecision={reviewDecision}
                reviewNotes={reviewNotes}
                onReviewDecisionChange={setReviewDecision}
                onReviewNotesChange={setReviewNotes}
                onSubmitDecision={handleSubmitDecision}
                btnLoading={btnLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 8, md: 7 }}>
              <ProcessRight tabContentList={tabContentList} info={info} />
            </Grid>
          </>
        )}
      </Grid>
    </>
  )
}
