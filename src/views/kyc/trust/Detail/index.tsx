'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'

// Component Imports
import TrustOverview from './components/TrustOverview'
import TrustTabs from './components/TrustTabs'
import BeneficiaryTable from './components/BeneficiaryTable'
import TrustDocumentsTable from './components/TrustDocumentsTable'
import BeneficiaryDetailDialog from './components/BeneficiaryDetailDialog'
import { DetailCardSkeleton } from '@/components/skeletons'

// Utils Imports
import { toast } from 'react-toastify'

// API Imports
import {
  getTrustDetail,
  getBeneficiaryList,
  getTrustDocumentList,
  beneficiaryAudit,
  type BeneficiaryListItem,
  type TrustDocumentListItem,
  type TrustDetailData
} from '@server/trust'

/**
 * 提取响应数据（处理嵌套的 data 结构）
 */
const extractResponseData = <T,>(responseData: any): T | null => {
  if (!responseData) return null
  if (typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T
  }
  return responseData as T
}

/**
 * 信托详情页面组件
 */
const TrustDetail = () => {
  const params = useParams()

  // 状态管理
  const [loading, setLoading] = useState(false)
  const [trustData, setTrustData] = useState<TrustDetailData | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryListItem[]>([])
  const [documents, setDocuments] = useState<TrustDocumentListItem[]>([])
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryListItem | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'reject'>('view')
  const [btnLoading, setBtnLoading] = useState(false)

  /**
   * 加载信托详情数据
   */
  const loadTrustDetail = useCallback(async () => {
    if (!params.id) {
      // toast.error('信托ID不存在')
      return
    }

    try {
      setLoading(true)
      const trustId = params.id as string

      const [trustRes, beneficiaryRes, documentRes] = await Promise.all([
        getTrustDetail({ trustId }),
        getBeneficiaryList({ trustId }),
        getTrustDocumentList({ trustId })
      ])

      const trustResponseData = extractResponseData(trustRes.data)
      const beneficiaryResponseData = extractResponseData(beneficiaryRes.data)
      const documentResponseData = extractResponseData(documentRes.data)

      if (trustResponseData && typeof trustResponseData === 'object' && 'detail' in trustResponseData) {
        setTrustData(trustResponseData.detail as TrustDetailData)
      }

      if (beneficiaryResponseData && typeof beneficiaryResponseData === 'object' && 'list' in beneficiaryResponseData) {
        setBeneficiaries((beneficiaryResponseData.list as BeneficiaryListItem[]) || [])
      }

      if (documentResponseData && typeof documentResponseData === 'object' && 'list' in documentResponseData) {
        setDocuments((documentResponseData.list as TrustDocumentListItem[]) || [])
      }
    } catch (error) {
      // toast.error('加载信托详情失败')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  // 初始化数据加载
  useEffect(() => {
    loadTrustDetail()
  }, [loadTrustDetail])

  /**
   * 关闭详情对话框
   */
  const handleCloseDialog = useCallback(() => {
    setDetailDialogOpen(false)
    setSelectedBeneficiary(null)
    setDialogMode('view')
  }, [])

  /**
   * 处理查看受益人详情
   * @param beneficiary - 受益人数据
   */
  const handleViewDetail = useCallback((beneficiary: BeneficiaryListItem) => {
    setSelectedBeneficiary(beneficiary)
    setDialogMode('view')
    setDetailDialogOpen(true)
  }, [])

  /**
   * 处理打开驳回弹窗
   * @param beneficiary - 受益人数据
   */
  const handleOpenRejectDialog = useCallback((beneficiary: BeneficiaryListItem) => {
    setSelectedBeneficiary(beneficiary)
    setDialogMode('reject')
    setDetailDialogOpen(true)
  }, [])

  /**
   * 处理操作后的通用逻辑
   */
  const handleOperationSuccess = useCallback(() => {
    toast.success('操作成功')
    handleCloseDialog()
    loadTrustDetail()
  }, [handleCloseDialog, loadTrustDetail])

  /**
   * 处理受益人审核（通过或驳回）
   * @param beneficiary - 受益人数据
   * @param action - 操作类型：approve-通过，reject-驳回
   * @param remark - 备注（驳回时可选）
   */
  const handleBeneficiaryAudit = useCallback(
    async (beneficiary: BeneficiaryListItem, action: 'approve' | 'reject', remark?: string) => {
      try {
        setBtnLoading(true)
        await beneficiaryAudit({
          beneficiaryId: String(beneficiary.id),
          action,
          remark
        })
        handleOperationSuccess()
      } catch (error) {
        console.error(`${action === 'approve' ? '通过' : '驳回'}审核失败:`, error)
        toast.error(`${action === 'approve' ? '通过' : '驳回'}审核失败`)
      } finally {
        setBtnLoading(false)
      }
    },
    [handleOperationSuccess]
  )

  /**
   * 处理通过审核
   * @param beneficiary - 受益人数据
   */
  const handleApprove = useCallback(
    (beneficiary: BeneficiaryListItem) => {
      handleBeneficiaryAudit(beneficiary, 'approve')
    },
    [handleBeneficiaryAudit]
  )

  /**
   * 处理驳回
   * @param beneficiary - 受益人数据
   * @param reason - 驳回原因
   */
  const handleReject = useCallback(
    (beneficiary: BeneficiaryListItem, reason: string) => {
      handleBeneficiaryAudit(beneficiary, 'reject', reason)
    },
    [handleBeneficiaryAudit]
  )

  /**
   * 打开链接
   */
  const handleOpenUrl = useCallback((url?: string) => {
    if (url) {
      window.open(url, '_blank')
    }
  }, [])

  // 标签页内容列表
  const tabContentList = {
    beneficiaries: (
      <BeneficiaryTable
        data={beneficiaries}
        onViewDetail={handleViewDetail}
        onApprove={handleApprove}
        onReject={handleOpenRejectDialog}
      />
    ),
    documents: (
      <TrustDocumentsTable
        data={documents}
        onView={doc => handleOpenUrl(doc?.previewUrl)}
        onDownload={doc => handleOpenUrl(doc?.downloadUrl)}
      />
    )
  }

  return (
    <Box>
      {loading ? (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, lg: 3 }}>
            <DetailCardSkeleton titleSections={1} fieldsPerGroup={4} />
          </Grid>
          <Grid size={{ xs: 12, lg: 9 }}>
            <DetailCardSkeleton titleSections={1} fieldsPerGroup={6} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={6}>
          {/* 左侧概览 */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <TrustOverview trustData={trustData} />
          </Grid>

          {/* 右侧标签页 */}
          <Grid size={{ xs: 12, lg: 9 }}>
            <TrustTabs tabContentList={tabContentList} />
          </Grid>
        </Grid>
      )}

      {/* 受益人详情弹窗 */}
      <BeneficiaryDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        beneficiary={selectedBeneficiary}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={btnLoading}
        showApproveButton={dialogMode === 'view'}
      />
    </Box>
  )
}

export default TrustDetail
