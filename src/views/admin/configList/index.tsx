'use client'

// React Imports
import { useState, useCallback, useRef, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

// Component Imports
import SearchFilters from './components/SearchFilters'
import ConfigTable, { type ConfigData } from './components/ConfigTable'
import ConfigDialog from './components/ConfigDialog'
import { TableInstance } from '@/components/table'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import { getConfigList, addConfigApi, editConfigApi, deleteConfigApi } from '@server/admin'

// Utils Imports
import { formatDateToString, cleanRequestParams, SEARCH_PARAMS_DEFAULT } from './utils'

/**
 * 系统参数管理页面
 */
export default function ConfigList() {
  const t = useTranslate()
  // States
  const [searchParams, setSearchParams] = useState(SEARCH_PARAMS_DEFAULT)
  const [configData, setConfigData] = useState<ConfigData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ConfigData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfig, setDeleteConfig] = useState<ConfigData | null>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const tableRef = useRef<TableInstance>(null)

  /**
   * 获取当前分页大小
   */
  const getPageSize = useCallback(() => {
    return tableRef?.current?.getState()?.pagination?.pageSize || 10
  }, [])

  /**
   * 加载参数数据
   */
  const loadConfigData = useCallback(
    async (params = {}) => {
      setLoading(true)
      setConfigData([])
      try {
        // 构建请求参数
        const requestParams = {
          ...searchParams,
          ...params,
          startDate: formatDateToString(searchParams.startDate),
          endDate: formatDateToString(searchParams.endDate)
        }

        // 清理空值
        const cleanedParams = cleanRequestParams(requestParams)

        const res = await getConfigList(cleanedParams)

        // 处理返回数据
        const list = res.data?.list || res.data?.rows || res.data || []
        const total = res.data?.total || list.length

        setConfigData(list as ConfigData[])
        setTotal(total)
      } catch (error) {
        console.error('加载参数数据失败:', error)
        toast.error(t('admin.loadConfigDataFailed'))
      } finally {
        setLoading(false)
      }
    },
    [searchParams, t]
  )

  /**
   * 搜索变化
   */
  const handleSearchChange = useCallback(
    (params: typeof searchParams) => {
      setSearchParams(params)
      tableRef?.current?.resetPage?.()
      loadConfigData({ pageNum: 1, pageSize: getPageSize(), ...params })
    },
    [loadConfigData, getPageSize]
  )

  /**
   * 重置搜索
   */
  const handleReset = useCallback(() => {
    setSearchParams(SEARCH_PARAMS_DEFAULT)
    tableRef?.current?.resetPage?.()
    loadConfigData({ pageNum: 1, pageSize: getPageSize(), ...SEARCH_PARAMS_DEFAULT })
  }, [loadConfigData, getPageSize])

  /**
   * 新增参数
   */
  const handleAddConfig = useCallback(() => {
    setEditingConfig(null)
    setDialogOpen(true)
  }, [])

  /**
   * 编辑参数
   */
  const handleEditConfig = useCallback((config: ConfigData) => {
    setEditingConfig(config)
    setDialogOpen(true)
  }, [])

  /**
   * 删除参数
   */
  const handleDeleteConfig = useCallback((config: ConfigData) => {
    setDeleteConfig(config)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除参数
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfig) return

    try {
      setBtnLoading(true)
      await deleteConfigApi({ ids: [deleteConfig.configId] })
      setDeleteDialogOpen(false)
      setDeleteConfig(null)
      toast.success(t('admin.operationSuccess'))
      loadConfigData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }, [deleteConfig, loadConfigData, searchParams, getPageSize, t])

  /**
   * 保存参数
   */
  const handleSaveConfig = useCallback(
    async (data: Partial<ConfigData>) => {
      try {
        // 转换数据格式，configType 需要转换为数字
        const submitData = {
          ...data,
          configType: Number(data.configType) || 0
        }

        // 调用对应的 API
        if (data.configId) {
          await editConfigApi(submitData)
        } else {
          await addConfigApi(submitData)
        }

        setDialogOpen(false)
        setEditingConfig(null)
        toast.success(t('admin.operationSuccess'))
        loadConfigData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
      } catch (error: any) {
        toast.error(error?.message || t('admin.operationFailed'))
      }
    },
    [loadConfigData, searchParams, getPageSize, t]
  )

  /**
   * 分页变化
   */
  const handlePageChange = useCallback(
    (params: { pageNum: number; pageSize: number }) => {
      loadConfigData({ pageNum: params?.pageNum, pageSize: params?.pageSize, ...searchParams })
    },
    [loadConfigData, searchParams]
  )

  // 初始化加载数据
  useEffect(() => {
    loadConfigData({ pageNum: 1, pageSize: 10 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          {/* 搜索筛选栏 */}
          <SearchFilters
            params={searchParams}
            onSearchChange={handleSearchChange}
            onReset={handleReset}
            onAddConfig={handleAddConfig}
          />
          <Box sx={{ p: 4, pt: 0 }}>
            <Divider sx={{ px: 2 }} />
            <Box sx={{ pt: 4 }}>
              {/* 参数表格 */}
              <ConfigTable
                data={configData}
                loading={loading}
                total={total}
                onPageChange={handlePageChange}
                onEdit={handleEditConfig}
                onDelete={handleDeleteConfig}
                tableRef={tableRef}
              />
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* 参数编辑对话框 */}
      <ConfigDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingConfig(null)
        }}
        onSave={handleSaveConfig}
        configData={editingConfig}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.confirmDeleteConfig')}</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteConfig &&
              `${t('admin.confirmDeleteConfigMessagePrefix')} "${deleteConfig.configName}" ${t('admin.confirmDeleteConfigMessageSuffix')}`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('admin.cancel')}</Button>
          <Button onClick={handleConfirmDelete} variant='contained' color='error' disabled={btnLoading}>
            {t('admin.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
