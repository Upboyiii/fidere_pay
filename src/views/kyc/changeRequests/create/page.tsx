'use client'

console.log('[v0] create/page.tsx file loaded')

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid2 as Grid,
  Divider,
  Chip,
  Alert,
  Autocomplete,
  Card,
  CardContent,
  IconButton,
  Radio,
  RadioGroup
} from '@mui/material'
import { ArrowLeft, User, FileText, Building, Mail, Phone, Upload, FileSignature } from 'lucide-react'

interface DocumentOption {
  id: string
  label: string
  category: string
  required: boolean
}

const documentOptions: DocumentOption[] = [
  { id: 'idCard', label: '身份证明文件', category: '身份文件', required: true },
  { id: 'addressProof', label: '地址证明文件', category: '地址文件', required: true },
  { id: 'bankStatement', label: '银行流水', category: '财务文件', required: false },
  { id: 'incomeProof', label: '收入证明', category: '财务文件', required: false },
  { id: 'businessLicense', label: '营业执照', category: '企业文件', required: false },
  { id: 'taxCertificate', label: '税务登记证', category: '企业文件', required: false }
]

// Mock user data for search
const mockUsers = [
  {
    id: 'USR-2024-001',
    name: '张三',
    type: '个人客户',
    email: 'zhangsan@example.com',
    phone: '+86 138****1234',
    status: '已通过',
    riskLevel: '低风险'
  },
  {
    id: 'USR-2024-005',
    name: '科技创新有限公司',
    type: '企业客户',
    email: 'contact@techco.com',
    phone: '+86 021****5678',
    status: '已通过',
    riskLevel: '中风险'
  },
  {
    id: 'USR-2024-012',
    name: '李四',
    type: '个人客户',
    email: 'lisi@example.com',
    phone: '+86 139****9876',
    status: '已通过',
    riskLevel: '低风险'
  }
]

export default function CreateChangeRequestPage() {
  console.log('[v0] CreateChangeRequestPage function called')

  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<(typeof mockUsers)[0] | null>(null)
  const [requestType, setRequestType] = useState<'document' | 'signature'>('document')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal')
  const [reason, setReason] = useState('')
  const [instructions, setInstructions] = useState('')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    console.log('[v0] CreateChangeRequestPage mounted')
    return () => {
      console.log('[v0] CreateChangeRequestPage unmounted')
    }
  }, [])

  const handleSubmit = () => {
    if (!selectedUser) {
      alert('请选择客户')
      return
    }
    if (selectedDocuments.length === 0) {
      alert('请至少选择一个文档')
      return
    }
    if (!reason) {
      alert('请填写变更原因')
      return
    }

    console.log('[v0] 提交变更工单', {
      user: selectedUser,
      type: requestType,
      documents: selectedDocuments,
      priority,
      reason,
      instructions,
      deadline
    })

    router.push('/dashboard/change-requests')
  }

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev => (prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]))
  }

  const groupedDocuments = documentOptions.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = []
      acc[doc.category].push(doc)
      return acc
    },
    {} as Record<string, DocumentOption[]>
  )

  return (
    <div>
      <Grid container spacing={6}>
        {/* Left Column - Main Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card className='mbe-6'>
            <CardContent>
              <Typography variant='h6' className='font-semibold mbe-6'>
                1. 选择客户
              </Typography>
              <Autocomplete
                options={mockUsers}
                getOptionLabel={option => `${option.name} (${option.id})`}
                value={selectedUser}
                onChange={(e, newValue) => setSelectedUser(newValue)}
                renderInput={params => <TextField {...params} placeholder='搜索客户姓名、ID或手机号...' fullWidth />}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props
                  return (
                    <li key={key} {...otherProps}>
                      <div className='flex items-center gap-4 w-full'>
                        <div
                          className={`w-10 h-10 rounded flex items-center justify-center ${
                            option.type === '个人客户' ? 'bg-blue-100' : 'bg-green-100'
                          }`}
                        >
                          {option.type === '个人客户' ? (
                            <User size={20} className='text-primary' />
                          ) : (
                            <Building size={20} className='text-green-600' />
                          )}
                        </div>
                        <div className='flex-1'>
                          <Typography variant='body2' className='font-medium'>
                            {option.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {option.id} · {option.type}
                          </Typography>
                        </div>
                        <Chip label={option.status} size='small' color='success' variant='outlined' />
                      </div>
                    </li>
                  )
                }}
              />

              {selectedUser && (
                <Card className='mts-4 bg-gray-50 border border-gray-200'>
                  <CardContent className='py-4'>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 6 }}>
                        <div className='flex items-center gap-2'>
                          <Mail size={14} className='text-textSecondary' />
                          <Typography variant='caption' color='text.secondary'>
                            {selectedUser.email}
                          </Typography>
                        </div>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <div className='flex items-center gap-2'>
                          <Phone size={14} className='text-textSecondary' />
                          <Typography variant='caption' color='text.secondary'>
                            {selectedUser.phone}
                          </Typography>
                        </div>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card className='mbe-6'>
            <CardContent>
              <Typography variant='h6' className='font-semibold mbe-6'>
                2. 选择工单类型
              </Typography>

              <FormControl component='fieldset'>
                <RadioGroup row value={requestType} onChange={e => setRequestType(e.target.value as any)}>
                  <FormControlLabel
                    value='document'
                    control={<Radio />}
                    label={
                      <div className='flex items-center gap-2'>
                        <Upload size={18} />
                        <span>补充文件</span>
                      </div>
                    }
                  />
                  <FormControlLabel
                    value='signature'
                    control={<Radio />}
                    label={
                      <div className='flex items-center gap-2'>
                        <FileSignature size={18} />
                        <span>签署文档</span>
                      </div>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <Alert severity='info' className='mts-4'>
                {requestType === 'document'
                  ? '要求客户上传缺失或需要更新的文件'
                  : '发送文档给客户进行电子签署（通过Documenso）'}
              </Alert>
            </CardContent>
          </Card>

          <Card className='mbe-6'>
            <CardContent>
              <Typography variant='h6' className='font-semibold mbe-6'>
                3. 选择需要的文档
              </Typography>

              {Object.entries(groupedDocuments).map(([category, docs]) => (
                <div key={category} className='mbe-6'>
                  <Typography variant='subtitle2' className='font-medium text-textSecondary mbe-4'>
                    {category}
                  </Typography>
                  <FormGroup>
                    {docs.map(doc => (
                      <FormControlLabel
                        key={doc.id}
                        control={
                          <Checkbox
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={() => handleDocumentToggle(doc.id)}
                          />
                        }
                        label={
                          <div className='flex items-center gap-2'>
                            <FileText size={16} className='text-textSecondary' />
                            <span>{doc.label}</span>
                            {doc.required && (
                              <Chip label='必需' size='small' color='error' variant='outlined' className='h-5' />
                            )}
                          </div>
                        }
                        className='mbe-2'
                      />
                    ))}
                  </FormGroup>
                </div>
              ))}

              {selectedDocuments.length > 0 && (
                <Alert severity='success' className='mts-4'>
                  已选择 {selectedDocuments.length} 个文档
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant='h6' className='font-semibold mbe-6'>
                4. 填写详细信息
              </Typography>

              <Grid container spacing={6}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>优先级</InputLabel>
                    <Select value={priority} onChange={e => setPriority(e.target.value as any)} label='优先级'>
                      <MenuItem value='normal'>普通 - 7个工作日内完成</MenuItem>
                      <MenuItem value='urgent'>紧急 - 3个工作日内完成</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    label='变更原因'
                    multiline
                    rows={3}
                    className='!ml-0'
                    value={reason || ''}
                    onChange={e => setReason(e.target.value)}
                    placeholder='例如：合规审查需要、文件过期、信息不完整等'
                    helperText='此原因将显示给客户'
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label='操作指引（可选）'
                    multiline
                    rows={3}
                    value={instructions || ''}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder='为客户提供详细的操作说明，例如文件格式要求、拍摄注意事项等'
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type='date'
                    label='完成期限（可选）'
                    value={deadline || ''}
                    onChange={e => setDeadline(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='sticky top-5'>
            <CardContent>
              <Typography variant='h6' className='font-semibold mbe-6'>
                工单摘要
              </Typography>

              <div className='mbe-6'>
                <Typography variant='caption' color='text.secondary' className='block mbe-2'>
                  客户
                </Typography>
                {selectedUser ? (
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        selectedUser.type === '个人客户' ? 'bg-blue-100' : 'bg-green-100'
                      }`}
                    >
                      {selectedUser.type === '个人客户' ? (
                        <User size={16} className='text-primary' />
                      ) : (
                        <Building size={16} className='text-green-600' />
                      )}
                    </div>
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        {selectedUser.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {selectedUser.id}
                      </Typography>
                    </div>
                  </div>
                ) : (
                  <Typography variant='body2' className='text-gray-400'>
                    未选择
                  </Typography>
                )}
              </div>

              <Divider className='my-4' />

              <div className='mbe-6'>
                <Typography variant='caption' color='text.secondary' className='block mbe-2'>
                  工单类型
                </Typography>
                <Chip
                  label={requestType === 'document' ? '补充文件' : '签署文档'}
                  size='small'
                  color={requestType === 'document' ? 'primary' : 'secondary'}
                  icon={requestType === 'document' ? <Upload size={14} /> : <FileSignature size={14} />}
                />
              </div>

              <Divider className='my-4' />

              <div className='mbe-6'>
                <Typography variant='caption' color='text.secondary' className='block mbe-2'>
                  需要的文档
                </Typography>
                {selectedDocuments.length > 0 ? (
                  <div className='flex flex-col gap-1'>
                    {selectedDocuments.map(docId => {
                      const doc = documentOptions.find(d => d.id === docId)
                      return (
                        <Typography key={docId} variant='body2' className='text-sm'>
                          • {doc?.label}
                        </Typography>
                      )
                    })}
                  </div>
                ) : (
                  <Typography variant='body2' className='text-gray-400'>
                    未选择
                  </Typography>
                )}
              </div>

              <Divider className='my-4' />

              <div className='mbe-6'>
                <Typography variant='caption' color='text.secondary' className='block mbe-2'>
                  优先级
                </Typography>
                <Chip
                  label={priority === 'urgent' ? '紧急' : '普通'}
                  size='small'
                  color={priority === 'urgent' ? 'error' : 'default'}
                />
              </div>

              <Alert severity='warning' className='mbe-6 text-xs'>
                提交后将自动发送通知给客户
              </Alert>

              <div className='flex flex-col gap-4'>
                <Button
                  fullWidth
                  variant='contained'
                  onClick={handleSubmit}
                  disabled={!selectedUser || selectedDocuments.length === 0 || !reason}
                >
                  提交工单
                </Button>
                <Button fullWidth variant='outlined' onClick={() => router.back()}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
