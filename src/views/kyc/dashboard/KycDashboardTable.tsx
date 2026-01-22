'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import PendingTablePage from './components/pendingTable'
import TurnTablePage from './components/turnTable'
import { useTranslate } from '@/contexts/DictionaryContext'

const KycDashboardTable = () => {
  const t = useTranslate()
  return (
    <>
      {/* 待处理审核表格 */}
      <Card sx={{ mb: 4 }}>
        <CardHeader sx={{ pb: 0 }} title={t('kycDashboard.pendingReviewTable')} subheader={t('kycDashboard.pendingReviewSubtitle')} /> {/* 待处理审核 待处理的客户身份识别和尽职调查任务 */}
        <PendingTablePage />
      </Card>

      {/* 拒绝用户表格 */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title={t('kycDashboard.rejectedUsers')} // 拒绝用户
          subheader={t('kycDashboard.rejectedUsersSubtitle')} // 审核被拒绝的用户申请，可进行重新审核或联系客户
          sx={{ pb: 0 }}
          titleTypographyProps={{ color: 'error.main' }}
        />
        <TurnTablePage />
      </Card>
    </>
  )
}

export default KycDashboardTable
