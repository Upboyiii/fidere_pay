'use client'

// React Imports
import { useState, useRef, ChangeEvent } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SelectChangeEvent } from '@mui/material/Select'

// Third-party Imports
import { Upload } from 'lucide-react'

// Utils Imports
import { UPLOAD_TYPE_OPTIONS } from '../utils'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import { uploadSysAttachment } from '@server/admin'
import { toast } from 'react-toastify'

// Type Imports
interface UploadDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 上传成功回调 */
  onSuccess?: () => void
}

/**
 * 上传文件对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSuccess - 上传成功回调
 */
const UploadDialog = ({ open, onClose, onSuccess }: UploadDialogProps) => {
  const t = useTranslate()
  // States
  const [uploadType, setUploadType] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 处理上传类型变化
   */
  const handleUploadTypeChange = (event: SelectChangeEvent) => {
    setUploadType(event.target.value)
  }

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  /**
   * 处理上传
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      return
    }

    if (!uploadType) {
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('kind', uploadType)

      await uploadSysAttachment(formData)

      // 上传成功后重置状态
      setSelectedFile(null)
      setUploadType('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.success(t('admin.uploadSuccess'))
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('上传失败:', error)
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setUploading(false)
    }
  }

  /**
   * 处理关闭
   */
  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null)
      setUploadType('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>{t('admin.uploadFile')}</DialogTitle>
      <DialogContent>
        <Box className='flex flex-col gap-4 pt-2'>
          <FormControl fullWidth>
            <InputLabel id='upload-type-label'>{t('admin.uploadType')}</InputLabel>
            <Select
              labelId='upload-type-label'
              id='upload-type-select'
              value={uploadType}
              label={t('admin.uploadType')}
              onChange={handleUploadTypeChange}
            >
              {UPLOAD_TYPE_OPTIONS.filter(option => option.value !== '').map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {t(`admin.${option.value === 'doc' ? 'document' : option.value}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box className='flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-lg'>
            <Upload size={48} className='text-gray-400' />
            <Typography variant='body1' color='text.secondary'>
              {selectedFile ? selectedFile.name : t('admin.clickToSelectOrDrag')}
            </Typography>
            <Button variant='outlined' component='label' disabled={uploading}>
              {t('admin.selectFile')}
              <input ref={fileInputRef} type='file' hidden onChange={handleFileSelect} />
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          {t('admin.cancel')}
        </Button>
        <Button
          onClick={handleUpload}
          variant='contained'
          color='primary'
          disabled={!selectedFile || !uploadType || uploading}
        >
          {uploading ? t('admin.uploading') : t('admin.uploadFile')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UploadDialog
