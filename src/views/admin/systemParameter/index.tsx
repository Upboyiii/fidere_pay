'use client'

// React Imports
import { useState, useCallback, useRef, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

// Component Imports
import SearchFilters from './components/SearchFilters'
import ConfigTable from './components/ConfigTable'
import ConfigDialog from './components/ConfigDialog'
import { TableInstance } from '@/components/table'
import { useTranslate } from '@/contexts/DictionaryContext'
import {
  getSystemConfigList,
  getSystemConfig,
  addSystemConfig,
  editSystemConfig,
  type SystemConfigItem,
  type SystemConfigListResponse
} from '@server/systemConfig'
import { formatDateToString, cleanRequestParams, SEARCH_PARAMS_DEFAULT } from './utils'

export interface ConfigData extends SystemConfigItem {
  createTime?: string
}

export default function SystemParameter() {
  const t = useTranslate()
  const [searchParams, setSearchParams] = useState(SEARCH_PARAMS_DEFAULT)
  const [configData, setConfigData] = useState<ConfigData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ConfigData | null>(null)
  const tableRef = useRef<TableInstance>(null)

  const getPageSize = useCallback(() => {
    return tableRef?.current?.getState()?.pagination?.pageSize || 10
  }, [])

  const loadConfigData = useCallback(
    async (params = {}) => {
      setLoading(true)
      setConfigData([])
      try {
        const startDate = formatDateToString((params as any).startDate ?? searchParams.startDate)
        const endDate = formatDateToString((params as any).endDate ?? searchParams.endDate)
        const dateRange = [startDate, endDate].filter(Boolean) as string[]
        const requestParams = {
          ...searchParams,
          ...params,
          ...(dateRange.length ? { dateRange } : {}),
          startDate: undefined,
          endDate: undefined
        }
        delete (requestParams as any).startDate
        delete (requestParams as any).endDate
        const cleanedParams = cleanRequestParams(requestParams)

        const res = await getSystemConfigList(cleanedParams)
        const data = res.data as SystemConfigListResponse | undefined
        const list = data?.list || (res as any)?.data?.list || []
        const totalCount = data?.total ?? (res as any)?.data?.total ?? list.length

        setConfigData(
          list.map((item: any) => ({
            ...item,
            configType: String(item.configType ?? 0),
            createTime: item.createdAt || item.createTime
          }))
        )
        setTotal(totalCount)
      } catch (error) {
        console.error('加载参数数据失败:', error)
        toast.error(t('admin.loadConfigDataFailed'))
      } finally {
        setLoading(false)
      }
    },
    [searchParams, t]
  )

  const handleSearchChange = useCallback(
    (params: typeof searchParams) => {
      setSearchParams(params)
      tableRef?.current?.resetPage?.()
      loadConfigData({ pageNum: 1, pageSize: getPageSize(), ...params })
    },
    [loadConfigData, getPageSize]
  )

  const handleReset = useCallback(() => {
    setSearchParams(SEARCH_PARAMS_DEFAULT)
    tableRef?.current?.resetPage?.()
    loadConfigData({ pageNum: 1, pageSize: getPageSize(), ...SEARCH_PARAMS_DEFAULT })
  }, [loadConfigData, getPageSize])

  const handleAddConfig = useCallback(() => {
    setEditingConfig(null)
    setDialogOpen(true)
  }, [])

  const handleEditConfig = useCallback(
    async (config: ConfigData) => {
      try {
        const res = await getSystemConfig({ id: config.configId })
        const raw = (res as any)?.data
        const detail = raw?.data ?? raw ?? res
        const configDetail: ConfigData = detail
          ? {
              ...detail,
              configId: detail.configId ?? config.configId,
              configType: detail.configType ?? 0,
              createTime: detail.createdAt || detail.createTime
            }
          : config
        setEditingConfig(configDetail)
        setDialogOpen(true)
      } catch (error) {
        console.error('获取参数详情失败:', error)
        toast.error(t('admin.loadConfigDataFailed'))
      }
    },
    [t]
  )

  const handleSaveConfig = useCallback(
    async (data: Partial<ConfigData>) => {
      try {
        const submitData = {
          ...data,
          configType: Number(data.configType) ?? 0
        }

        if (data.configId) {
          await editSystemConfig({
            configId: data.configId,
            configName: submitData.configName!,
            configKey: submitData.configKey!,
            configValue: submitData.configValue!,
            configType: submitData.configType,
            remark: submitData.remark
          })
        } else {
          await addSystemConfig({
            configName: submitData.configName!,
            configKey: submitData.configKey!,
            configValue: submitData.configValue!,
            configType: submitData.configType,
            remark: submitData.remark
          })
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

  const handlePageChange = useCallback(
    (params: { pageNum: number; pageSize: number }) => {
      loadConfigData({ pageNum: params?.pageNum, pageSize: params?.pageSize, ...searchParams })
    },
    [loadConfigData, searchParams]
  )

  useEffect(() => {
    loadConfigData({ pageNum: 1, pageSize: 10 })
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <SearchFilters params={searchParams} onSearchChange={handleSearchChange} onReset={handleReset} onAddConfig={handleAddConfig} />
          <Box sx={{ p: 4, pt: 0 }}>
            <Divider sx={{ px: 2 }} />
            <Box sx={{ pt: 4 }}>
              <ConfigTable
                data={configData}
                loading={loading}
                total={total}
                onPageChange={handlePageChange}
                onEdit={handleEditConfig}
                tableRef={tableRef}
              />
            </Box>
          </Box>
        </Card>
      </Grid>

      <ConfigDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingConfig(null)
        }}
        onSave={handleSaveConfig}
        configData={editingConfig}
      />
    </Grid>
  )
}
