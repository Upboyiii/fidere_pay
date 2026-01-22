// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
type ChangeRequest = {
  id: string
  userId: string
  userName: string
  requestType: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  changedFields: number
  reviewer?: string
  riskLevel?: string
}

// Component Imports
import ChangeRequestTable from './ChangeRequestTable'
import ChangeRequestCards from './ChangeRequestCards'

const mockChangeRequests: ChangeRequest[] = [
  {
    id: 'CR-2024-001',
    userId: 'USR-2024-001',
    userName: '张三',
    requestType: '信息修改',
    submittedAt: '2024-01-20 10:30',
    status: 'pending',
    priority: 'high',
    changedFields: 3,
    riskLevel: '中风险'
  },
  {
    id: 'CR-2024-002',
    userId: 'USR-2024-005',
    userName: '李四',
    requestType: '文件补充',
    submittedAt: '2024-01-20 09:15',
    status: 'in_review',
    priority: 'medium',
    changedFields: 1,
    reviewer: '王审核',
    riskLevel: '低风险'
  },
  {
    id: 'CR-2024-003',
    userId: 'USR-2024-012',
    userName: '王五',
    requestType: '信息修改',
    submittedAt: '2024-01-19 16:45',
    status: 'approved',
    priority: 'low',
    changedFields: 2,
    reviewer: '李审核',
    riskLevel: '低风险'
  },
  {
    id: 'CR-2024-004',
    userId: 'USR-2024-008',
    userName: '赵六',
    requestType: '文件补充',
    submittedAt: '2024-01-19 14:20',
    status: 'rejected',
    priority: 'medium',
    changedFields: 4,
    reviewer: '张审核',
    riskLevel: '高风险'
  }
]

const ChangeRequests = ({ changeRequestData }: { changeRequestData?: ChangeRequest[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ChangeRequestCards />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ChangeRequestTable tableData={changeRequestData || mockChangeRequests} />
      </Grid>
    </Grid>
  )
}

export default ChangeRequests
