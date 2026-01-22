'use client'

import { useState, useEffect } from 'react'
import {
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material'
import { FileText, RefreshCw, CheckCircle, XCircle, Clock, Eye, Download, Plus, Send } from 'lucide-react'

interface DocumensoStatusProps {
  userId: string
  onStatusUpdate?: (status: any) => void
}

export function DocumensoStatus({ userId, onStatusUpdate }: DocumensoStatusProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null)
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false)

  const createDocument = async (templateId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/integrations/documenso/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          templateId,
          title: `KYC文档 - ${userId}`,
          signers: [
            {
              name: '客户',
              email: 'customer@example.com', // 从用户信息获取
              role: 'SIGNER'
            }
          ]
        })
      })

      if (!response.ok) throw new Error('Failed to create document')

      const newDocument = await response.json()
      setDocuments(prev => [...prev, newDocument])
      setCreateDocumentOpen(false)

      await sendSigningInvitation(newDocument.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const sendSigningInvitation = async (documentId: string) => {
    try {
      const response = await fetch(`/api/integrations/documenso/send/${documentId}`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to send invitation')

      // 刷新文档状态
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const viewDocument = (document: any) => {
    window.open(`/api/integrations/documenso/view/${document.id}`, '_blank')
  }

  const downloadDocument = async (document: any) => {
    try {
      const response = await fetch(`/api/integrations/documenso/download/${document.id}`)
      if (!response.ok) throw new Error('Failed to download document')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${document.title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const getStatusInfo = (status: any) => {
    switch (status) {
      case 'COMPLETED':
        return { color: 'success', icon: CheckCircle, label: '已完成', bg: '#ecfdf5' }
      case 'PENDING':
        return { color: 'warning', icon: Clock, label: '待签署', bg: '#fffbeb' }
      case 'CANCELLED':
        return { color: 'error', icon: XCircle, label: '已取消', bg: '#fef2f2' }
      default:
        return { color: 'default', icon: FileText, label: '草稿', bg: '#f9fafb' }
    }
  }

  const allDocumentsSigned = documents.length > 0 && documents.every(doc => doc.status === 'COMPLETED')
  const hasDocuments = documents.length > 0

  return (
    <>
      <>
        <div className='flex items-center justify-between mbe-4'>
          <div className='flex items-center gap-4'>
            <div
              className={`p-2 rounded flex items-center justify-center ${
                allDocumentsSigned ? 'bg-green-100' : hasDocuments ? 'bg-yellow-100' : 'bg-gray-100'
              }`}
            >
              {allDocumentsSigned ? (
                <CheckCircle size={20} className='text-green-600' />
              ) : hasDocuments ? (
                <Clock size={20} className='text-yellow-600' />
              ) : (
                <FileText size={20} className='text-textSecondary' />
              )}
            </div>
            <div>
              <Typography variant='h6' className='mbe-1'>
                Documenso文档签署
              </Typography>
              <div className='flex items-center gap-2'>
                <Chip
                  label={allDocumentsSigned ? '全部已签署' : hasDocuments ? '部分待签署' : '无文档'}
                  color={allDocumentsSigned ? 'success' : hasDocuments ? 'warning' : 'default'}
                  size='small'
                  variant='outlined'
                />
                <Typography variant='caption' color='text.secondary'>
                  {documents.length}
                </Typography>
              </div>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              size='small'
              onClick={() => {}}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={14} /> : <RefreshCw size={14} />}
            >
              刷新
            </Button>
            <Button
              size='small'
              variant='outlined'
              startIcon={<Plus size={14} />}
              onClick={() => setCreateDocumentOpen(true)}
            >
              创建文档
            </Button>
            {hasDocuments && (
              <Button size='small' variant='outlined' onClick={() => setDetailsOpen(true)}>
                查看详情
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}

        {/* 文档列表预览 */}
        {hasDocuments && (
          <div>
            <Typography variant='subtitle2' className='mbe-2'>
              最近文档
            </Typography>
            <div className='flex flex-col gap-2'>
              {documents.slice(0, 3).map(doc => {
                const statusInfo = getStatusInfo(doc.status)
                const StatusIcon = statusInfo.icon

                return (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200'
                  >
                    <div className='flex items-center gap-4'>
                      <StatusIcon
                        size={16}
                        className={
                          statusInfo.color === 'success'
                            ? 'text-green-600'
                            : statusInfo.color === 'warning'
                              ? 'text-yellow-600'
                              : statusInfo.color === 'error'
                                ? 'text-red-600'
                                : 'text-textSecondary'
                        }
                      />
                      <div>
                        <Typography variant='body2' className='font-medium'>
                          {doc.title}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {new Date(doc.createdAt).toLocaleDateString('zh-CN')}
                        </Typography>
                      </div>
                    </div>
                    <div className='flex gap-1'>
                      <Tooltip title='查看文档'>
                        <IconButton size='small' onClick={() => viewDocument(doc)}>
                          <Eye size={14} />
                        </IconButton>
                      </Tooltip>
                      {doc.status === 'COMPLETED' && (
                        <Tooltip title='下载文档'>
                          <IconButton size='small' onClick={() => downloadDocument(doc)}>
                            <Download size={14} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </>

      {/* 文档详情对话框 */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth='lg' fullWidth>
        <DialogTitle>Documenso文档详情</DialogTitle>
        <DialogContent>
          <TableContainer className='mts-2'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>文档标题</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>创建时间</TableCell>
                  <TableCell>完成时间</TableCell>
                  <TableCell>签署人</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map(doc => {
                  const statusInfo = getStatusInfo(doc.status)

                  return (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          color={statusInfo.color as any}
                          size='small'
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell>{new Date(doc.createdAt).toLocaleString('zh-CN')}</TableCell>
                      <TableCell>{doc.completedAt ? new Date(doc.completedAt).toLocaleString('zh-CN') : '-'}</TableCell>
                      <TableCell>
                        <div className='flex flex-col gap-1'>
                          {doc.signers.map((signer: any) => (
                            <div key={signer.id} className='flex items-center gap-2'>
                              <Typography variant='caption'>{signer.name}</Typography>
                              <Chip
                                label={
                                  signer.status === 'SIGNED'
                                    ? '已签署'
                                    : signer.status === 'VIEWED'
                                      ? '已查看'
                                      : '未签署'
                                }
                                color={
                                  signer.status === 'SIGNED'
                                    ? 'success'
                                    : signer.status === 'VIEWED'
                                      ? 'info'
                                      : 'default'
                                }
                                size='small'
                                variant='outlined'
                              />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          <Tooltip title='查看文档'>
                            <IconButton size='small' onClick={() => viewDocument(doc)}>
                              <Eye size={14} />
                            </IconButton>
                          </Tooltip>
                          {doc.status === 'COMPLETED' && (
                            <Tooltip title='下载文档'>
                              <IconButton size='small' onClick={() => downloadDocument(doc)}>
                                <Download size={14} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {doc.status === 'DRAFT' && (
                            <Tooltip title='发送签署邀请'>
                              <IconButton size='small' onClick={() => sendSigningInvitation(doc.id)}>
                                <Send size={14} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>关闭</Button>
          <Button
            variant='outlined'
            startIcon={<Plus size={16} />}
            onClick={() => {
              setDetailsOpen(false)
              setCreateDocumentOpen(true)
            }}
          >
            创建新文档
          </Button>
        </DialogActions>
      </Dialog>

      {/* 创建文档对话框 */}
      <Dialog open={createDocumentOpen} onClose={() => setCreateDocumentOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>创建新文档</DialogTitle>
        <DialogContent>
          <Typography variant='body2' className='mbe-4 text-textSecondary'>
            为用户创建需要签署的KYC相关文档
          </Typography>
          {/* 这里可以添加模板选择、文档配置等选项 */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDocumentOpen(false)}>取消</Button>
          <Button
            variant='contained'
            onClick={() => createDocument()}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Plus size={16} />}
          >
            创建文档
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
