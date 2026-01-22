'use client'

import type React from 'react'
import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Grid2 as Grid } from '@mui/material'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import UserDetailSkeleton from './components/UserDetailSkeleton'
// Component Imports
import UserLeftOverview from './components/UserLeftOverview'
import UserRight from './components/UserRight'
import BasicInfoTab from './components/BasicInfoTab'
import DocumentsTab from './components/DocumentsTab'
import WhitelistTab from './components/WhitelistTab'
import ThirdPartyStatusTab from './components/ThirdPartyStatusTab'
import OperationHistoryTab from './components/OperationHistoryTab'
import { getUserManagementDetail } from '@server/userManagementTable'
import { useEffect } from 'react'
import { getCareerList } from '@server/pages-api'
import { ArrowLeft } from 'lucide-react'
import { useTranslate } from '@/contexts/DictionaryContext'

// Field validation interface

export default function UserReviewPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslate()
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<any>(null)
  const [careerList, setCareerList] = useState<any>(null)

  // 获取来源页面参数
  const from = searchParams.get('from')
  useEffect(() => {
    requestUserManagementDetail()
    getCareerList().then(res => {
      setCareerList(res.data?.list ?? null)
    })
  }, [])
  const requestUserManagementDetail = async () => {
    setLoading(true)
    getUserManagementDetail({ id: params.id as string })
      .then(res => {
        setInfo(res.data ?? null)
      })
      .catch(err => {})
      .finally(() => {
        setLoading(false)
      })
  }

  // Tab content list
  const tabContentList = {
    // 基本信息
    'basic-info': <BasicInfoTab personalInfo={{ ...info, ...info?.kycInfo }} careerList={careerList} />,
    // 文档资料
    documents: <DocumentsTab documents={info?.documents ?? []} />,
    // 白名单
    whitelist: <WhitelistTab info={info} />,
    // 三方状态
    'third-party': (
      <ThirdPartyStatusTab
        applicantId={info?.sumsub?.applicantId || info?.member?.inspection_id}
        sumsubData={info?.sumsub ? { sumsub: info.sumsub } : undefined}
      />
    ),
    // 操作记录
    'operation-history': <OperationHistoryTab operationHistory={info?.reviewHistoryList ?? []} />
  }

  // 处理返回按钮点击
  const handleBack = () => {
    if (from === 'operation/clients') {
      router.push('/operation/clients')
    } else {
      router.push('/kyc/userManagement')
    }
  }

  return (
    <>
      {/* 返回按钮 */}
      {/* <Box sx={{ mb: 4 }}>
        <Button
          variant='outlined'
          startIcon={<ArrowLeft size={18} />}
          onClick={handleBack}
          sx={{
            textTransform: 'none'
          }}
        >
          {t('common.back') || '返回'}
        </Button>
      </Box> */}

      <Grid container spacing={6}>
        {loading ? (
          <UserDetailSkeleton />
        ) : (
          <>
            <Grid size={{ xs: 12, lg: 4, md: 5 }}>
              <UserLeftOverview userData={info} careerList={careerList} />
            </Grid>
            <Grid size={{ xs: 12, lg: 8, md: 7 }}>
              <UserRight tabContentList={tabContentList} />
            </Grid>
          </>
        )}
      </Grid>
    </>
  )
}
