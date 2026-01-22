'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

interface DeleteConfirmDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认删除回调 */
  onConfirm: () => void
  /** 删除项名称 */
  title: string
  /** 删除项描述 */
  description: string
  /** 加载状态 */
  loading?: boolean
}

/**
 * 删除确认对话框组件
 */
const DeleteConfirmDialog = memo(
  ({ open, onClose, onConfirm, title, description, loading = false }: DeleteConfirmDialogProps) => {
    const t = useTranslate()
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography>{description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant='outlined'>
            {t('admin.cancel')}
          </Button>
          <Button onClick={onConfirm} variant='contained' color='error' disabled={loading}>
            {t('admin.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
)

DeleteConfirmDialog.displayName = 'DeleteConfirmDialog'

export default DeleteConfirmDialog
