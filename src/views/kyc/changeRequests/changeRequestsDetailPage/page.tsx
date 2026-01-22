'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tab,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Eye,
  User,
  Calendar,
  AlertTriangle,
  Expand as ExpandMore
} from 'lucide-react'
import { FieldComparison } from './components/field-comparison'
import { VersionHistory } from './components/version-history'
import { RiskAssessment } from './components/risk-assessment'
import { AuditTrail } from './components/audit-trail'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTabList from '@core/components/mui/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
// import CreateChangeRequestPage from './components/CreateChangeRequestPage'

interface FieldChange {
  fieldName: string
  fieldLabel: string
  oldValue: string
  newValue: string
  changeType: 'modify' | 'add' | 'delete'
  hasIssue?: boolean
  rejectionReason?: string
}

interface ChangeRequestDetail {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  requestType: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  riskLevel: string
  reviewer?: string
  reviewedAt?: string
  changes: FieldChange[]
  documents: Array<{
    name: string
    type: string
    uploadedAt: string
    url: string
  }>
  comments: string
  version: number
}

const mockRequestDetail: ChangeRequestDetail = {
  id: 'CR-2024-001',
  userId: 'USR-2024-001',
  userName: '张三',
  userEmail: 'zhangsan@example.com',
  userPhone: '+86 138****1234',
  requestType: '信息修改',
  submittedAt: '2024-01-20 10:30',
  status: 'pending',
  priority: 'high',
  riskLevel: '中风险',
  changes: [
    {
      fieldName: 'email',
      fieldLabel: '电子邮箱',
      oldValue: 'zhangsan@oldmail.com',
      newValue: 'zhangsan@example.com',
      changeType: 'modify'
    },
    {
      fieldName: 'phone',
      fieldLabel: '手机号码',
      oldValue: '+86 138****5678',
      newValue: '+86 138****1234',
      changeType: 'modify'
    },
    {
      fieldName: 'address',
      fieldLabel: '联系地址',
      oldValue: '上海市浦东新区XX路123号',
      newValue: '上海市浦东新区YY路456号',
      changeType: 'modify'
    }
  ],
  documents: [
    {
      name: '身份证正面（更新）.jpg',
      type: 'identity_front',
      uploadedAt: '2024-01-20 10:25',
      url: '/generic-id-card-front.png'
    },
    {
      name: '地址证明文件.pdf',
      type: 'address_proof',
      uploadedAt: '2024-01-20 10:28',
      url: '#'
    }
  ],
  comments: '因搬家需要更新联系地址和相关证明文件',
  version: 1
}

const mockRiskAssessment = {
  overallRisk: 'medium' as const,
  riskScore: 65,
  factors: [
    {
      name: '变更字段敏感度',
      level: 'high' as const,
      description: '涉及联系方式和地址等敏感信息的修改',
      score: 75
    },
    {
      name: '用户历史记录',
      level: 'low' as const,
      description: '用户账户状态良好，无异常操作记录',
      score: 20
    },
    {
      name: '文档完整性',
      level: 'medium' as const,
      description: '提供了必要的证明文件，但需要仔细核对',
      score: 50
    }
  ],
  recommendations: ['建议仔细核对新提交的地址证明文件', '确认新联系方式的有效性', '检查用户身份证件是否在有效期内']
}

const mockAuditLogs = [
  {
    id: '1',
    timestamp: '2024-01-20 10:30:15',
    operator: '张三',
    operatorRole: '客户',
    action: '提交变更申请',
    actionType: 'create' as const,
    details: '用户提交了包含3个字段变更的申请，原因：因搬家需要更新联系地址和相关证明文件',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    timestamp: '2024-01-20 10:32:45',
    operator: '系统',
    operatorRole: '自动化',
    action: '风险评估完成',
    actionType: 'update' as const,
    details: '系统自动完成风险评估，综合风险等级：中风险（65分）'
  }
]

const mockVersionHistory = [
  {
    version: 1,
    action: 'created' as const,
    timestamp: '2024-01-20 10:30:15',
    operator: '张三（客户）',
    changes: ['修改电子邮箱', '修改手机号码', '修改联系地址'],
    comment: '因搬家需要更新联系地址和相关证明文件'
  }
]

export default function ChangeRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const [activeTab, setActiveTab] = useState('field-comparison')
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [fieldIssues, setFieldIssues] = useState<Record<string, { hasIssue: boolean; reason: string }>>({})

  const requestDetail = mockRequestDetail

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'in_review':
        return 'info'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理'
      case 'in_review':
        return '审核中'
      case 'approved':
        return '已批准'
      case 'rejected':
        return '已拒绝'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '紧急'
      case 'high':
        return '高'
      case 'medium':
        return '中'
      case 'low':
        return '低'
      default:
        return priority
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'modify':
        return { bg: '#dbeafe', color: '#1e40af', label: '修改' }
      case 'add':
        return { bg: '#d1fae5', color: '#065f46', label: '新增' }
      case 'delete':
        return { bg: '#fee2e2', color: '#991b1b', label: '删除' }
      default:
        return { bg: '#f3f4f6', color: '#374151', label: type }
    }
  }

  const handleFieldIssueToggle = (fieldName: string) => {
    setFieldIssues(prev => ({
      ...prev,
      [fieldName]: {
        hasIssue: !prev[fieldName]?.hasIssue,
        reason: prev[fieldName]?.reason || ''
      }
    }))
  }

  const handleFieldReasonChange = (fieldName: string, reason: string) => {
    setFieldIssues(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        reason
      }
    }))
  }

  const handleApprove = () => {
    console.log('Approving change request:', requestDetail.id)
    setApproveDialogOpen(false)
    router.push('/dashboard/change-requests')
  }

  const handleReject = () => {
    const issueFields = Object.entries(fieldIssues)
      .filter(([_, value]) => value.hasIssue)
      .map(([fieldName, value]) => ({
        fieldName,
        reason: value.reason
      }))

    console.log('Rejecting change request:', requestDetail.id)
    console.log('Rejection reason:', rejectionReason)
    console.log('Field issues:', issueFields)
    setRejectDialogOpen(false)
    router.push('/dashboard/change-requests')
  }

  const hasFieldIssues = Object.values(fieldIssues).some(issue => issue.hasIssue)

  const handleChange = (event: any, value: string) => {
    setActiveTab(value)
  }

  // Tab content list
  const tabContentList = {
    'field-comparison': (
      <FieldComparison
        changes={requestDetail.changes}
        fieldIssues={fieldIssues}
        onFieldIssueToggle={handleFieldIssueToggle}
        onFieldReasonChange={handleFieldReasonChange}
      />
    ),
    documents: (
      <div>
        <Typography variant='h6' className='font-semibold mbe-4'>
          相关文档
        </Typography>
        <Grid container spacing={6}>
          {requestDetail.documents.map((doc, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Card className='border border-gray-200'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-2 mbe-2'>
                    <FileText size={20} className='text-primary' />
                    <Typography variant='body2' className='font-semibold'>
                      {doc.name}
                    </Typography>
                  </div>
                  <Typography variant='caption' color='text.secondary' className='block mbe-4'>
                    上传时间: {doc.uploadedAt}
                  </Typography>
                  <div className='flex gap-2'>
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<Eye size={16} />}
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      查看
                    </Button>
                    <Button size='small' variant='outlined' startIcon={<Download size={16} />}>
                      下载
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    ),
    'version-history': <VersionHistory history={mockVersionHistory} currentVersion={requestDetail.version} />,
    'audit-trail': <AuditTrail logs={mockAuditLogs} />
  }

  useEffect(() => {
    console.log('[v0] ChangeRequestDetailPage mounted with ID:', requestId)
  }, [requestId])

  // if (requestId === 'create') {
  //   console.log('[v0] Rendering CreateChangeRequestPage directly from [id] route')
  //   return <CreateChangeRequestPage />
  // }

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 4, md: 5 }}>
          {/* User Details Card */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent className='flex flex-col pbs-12 gap-6'>
                <div className='flex flex-col gap-6'>
                  <div className='flex items-center justify-center flex-col gap-4'>
                    <div className='flex flex-col items-center gap-4'>
                      <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120}>
                        <User size={40} />
                      </CustomAvatar>
                      <Typography variant='h5'>{requestDetail.userName}</Typography>
                    </div>
                    <div className='flex gap-2'>
                      <Chip
                        label={getStatusLabel(requestDetail.status)}
                        color={getStatusColor(requestDetail.status) as any}
                        size='small'
                        variant='tonal'
                      />
                      <Chip
                        label={getPriorityLabel(requestDetail.priority)}
                        color={getPriorityColor(requestDetail.priority) as any}
                        size='small'
                        variant='tonal'
                      />
                    </div>
                  </div>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='flex items-center gap-4 w-full'>
                      <div className='w-[30%] flex justify-end'>
                        <CustomAvatar variant='rounded' color='primary' skin='light'>
                          <Calendar size={20} />
                        </CustomAvatar>
                      </div>
                      <div className='flex-1 text-left'>
                        <Typography variant='h5'>{requestDetail.submittedAt}</Typography>
                        <Typography>提交时间</Typography>
                      </div>
                    </div>
                    <div className='flex items-center gap-4 w-full'>
                      <div className='w-[30%] flex justify-end'>
                        <CustomAvatar variant='rounded' color='primary' skin='light'>
                          <User size={20} />
                        </CustomAvatar>
                      </div>
                      <div className='flex-1 text-left'>
                        <Typography variant='h5'>{requestDetail.id}</Typography>
                        <Typography>工单ID</Typography>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant='h5'>详细信息</Typography>
                  <Divider className='mlb-4' />
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center flex-wrap gap-x-1.5'>
                      <Typography className='font-medium' color='text.primary'>
                        用户ID:
                      </Typography>
                      <Typography>{requestDetail.userId}</Typography>
                    </div>
                    <div className='flex items-center flex-wrap gap-x-1.5'>
                      <Typography className='font-medium' color='text.primary'>
                        邮箱地址:
                      </Typography>
                      <Typography>{requestDetail.userEmail}</Typography>
                    </div>
                    <div className='flex items-center flex-wrap gap-x-1.5'>
                      <Typography className='font-medium' color='text.primary'>
                        手机号码:
                      </Typography>
                      <Typography>{requestDetail.userPhone}</Typography>
                    </div>
                    <div className='flex items-center flex-wrap gap-x-1.5'>
                      <Typography className='font-medium' color='text.primary'>
                        风险等级:
                      </Typography>
                      <Typography>{requestDetail.riskLevel}</Typography>
                    </div>
                  </div>
                </div>
                <div>
                  <Typography variant='h5'>申请说明</Typography>
                  <Divider className='mlb-4' />
                  <Typography variant='body2' color='text.secondary' className='leading-relaxed'>
                    {requestDetail.comments}
                  </Typography>
                  <div className='flex mt-3 gap-3 justify-center'>
                    <Button
                      variant='contained'
                      color='success'
                      startIcon={<CheckCircle size={20} />}
                      onClick={() => setApproveDialogOpen(true)}
                      disabled={hasFieldIssues}
                      className='max-sm:is-full'
                    >
                      批准变更
                    </Button>
                    <Button
                      variant='contained'
                      color='error'
                      startIcon={<XCircle size={20} />}
                      onClick={() => setRejectDialogOpen(true)}
                      className='max-sm:is-full'
                    >
                      拒绝变更
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Risk Assessment Card */}
          <Grid size={{ xs: 12 }}>
            <Card className='mt-4'>
              <CardContent className='p-6'>
                <RiskAssessment
                  overallRisk={mockRiskAssessment.overallRisk}
                  riskScore={mockRiskAssessment.riskScore}
                  factors={mockRiskAssessment.factors}
                  recommendations={mockRiskAssessment.recommendations}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, lg: 8, md: 7 }}>
          <TabContext value={activeTab}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
                  <Tab
                    icon={<FileText size={16} />}
                    value='field-comparison'
                    label='字段变更对比'
                    iconPosition='start'
                  />
                  <Tab icon={<FileText size={16} />} value='documents' label='相关文档' iconPosition='start' />
                  <Tab icon={<Calendar size={16} />} value='version-history' label='版本历史' iconPosition='start' />
                  <Tab icon={<User size={16} />} value='audit-trail' label='审计日志' iconPosition='start' />
                </CustomTabList>
              </Grid>
              <Grid size={{ xs: 12 }}>
                {hasFieldIssues && (
                  <Accordion className='mts-6 mb-4'>
                    <AccordionSummary>
                      <Typography variant='subtitle1' className='flex items-center gap-2'>
                        <AlertTriangle size={20} className='text-red-500' />
                        字段问题汇总 ({Object.values(fieldIssues).filter(issue => issue.hasIssue).length} 个问题)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className='flex flex-col gap-4'>
                        {Object.entries(fieldIssues)
                          .filter(([_, value]) => value.hasIssue)
                          .map(([fieldName, issue], index) => (
                            <div key={index} className='p-4 bg-red-50 rounded border border-red-200'>
                              <Typography variant='subtitle2' className='text-red-500 mbe-2'>
                                {fieldName}
                              </Typography>
                              <Typography variant='body2' className='text-gray-700'>
                                {issue.reason || '未填写具体原因'}
                              </Typography>
                            </div>
                          ))}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                )}
                <TabPanel value={activeTab} className='p-0'>
                  {tabContentList[activeTab as keyof typeof tabContentList]}
                </TabPanel>
              </Grid>
            </Grid>
          </TabContext>
        </Grid>
      </Grid>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          确认批准变更
          <Typography component='span' className='flex flex-col text-center'>
            您确定要批准此变更工单吗？
          </Typography>
        </DialogTitle>
        <DialogContent className='flex flex-col gap-6 pbs-0 sm:pli-16 sm:pbe-16'>
          <IconButton onClick={() => setApproveDialogOpen(false)} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Typography variant='body2' color='text.secondary'>
            批准后，用户的资料将被更新为新值。
          </Typography>
          <Alert severity='info'>此操作将更新 {requestDetail.changes.length} 个字段，并记录到审计日志中。</Alert>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button onClick={() => setApproveDialogOpen(false)}>取消</Button>
          <Button onClick={handleApprove} variant='contained' color='success'>
            确认批准
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        scroll='body'
        closeAfterTransition={false}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          拒绝变更工单
          <Typography component='span' className='flex flex-col text-center'>
            请说明拒绝此变更工单的原因
          </Typography>
        </DialogTitle>
        <DialogContent className='flex flex-col gap-6 pbs-0 sm:pli-16 sm:pbe-16'>
          <IconButton onClick={() => setRejectDialogOpen(false)} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Typography variant='body2' color='text.secondary'>
            请详细说明拒绝原因
          </Typography>
          {hasFieldIssues && (
            <Alert severity='warning'>
              您已标记 {Object.values(fieldIssues).filter(issue => issue.hasIssue).length} 个字段存在问题
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder='请详细说明拒绝原因...'
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button onClick={() => setRejectDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleReject}
            variant='contained'
            color='error'
            disabled={!rejectionReason && !hasFieldIssues}
          >
            确认拒绝
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
