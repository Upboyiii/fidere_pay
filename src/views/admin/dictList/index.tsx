'use client'

// React Imports
import { useState, useCallback, useRef, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'

// Component Imports
import DictTypeTree from './components/DictTypeTree'
import SearchFilters from './components/SearchFilters'
import DictTable, { type DictData } from './components/DictTable'
import DictDialog from './components/DictDialog'
import DictTypeDialog from './components/DictTypeDialog'
import DeleteConfirmDialog from './components/DeleteConfirmDialog'
import { TableInstance } from '@/components/table'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import {
  getDictDataList,
  addDictDataApi,
  editDictDataApi,
  deleteDictDataApi,
  getDictTypeList,
  editDictTypeApi,
  addDictTypeApi,
  deleteDictTypeApi
} from '@server/admin'

// Utils Imports
import { cleanRequestParams, SEARCH_PARAMS_DEFAULT, buildDictTypeTree, findNodeById, type DictTypeNode } from './utils'

/**
 * 字典管理页面
 */
export default function DictList() {
  const t = useTranslate()
  // States
  const [searchParams, setSearchParams] = useState(SEARCH_PARAMS_DEFAULT)
  const [dictData, setDictData] = useState<DictData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDict, setEditingDict] = useState<DictData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteDict, setDeleteDict] = useState<DictData | null>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const [dictTypeTree, setDictTypeTree] = useState<DictTypeNode[]>([])
  const [typeTreeLoading, setTypeTreeLoading] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<string | number>('')
  const [editingTypeNode, setEditingTypeNode] = useState<DictTypeNode | null>(null)
  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [deleteTypeDialogOpen, setDeleteTypeDialogOpen] = useState(false)
  const [deleteTypeNode, setDeleteTypeNode] = useState<DictTypeNode | null>(null)
  const tableRef = useRef<TableInstance>(null)

  /**
   * 获取当前分页大小
   */
  const getPageSize = useCallback(() => {
    return tableRef?.current?.getState()?.pagination?.pageSize || 10
  }, [])

  /**
   * 加载字典类型树
   */
  const loadDictTypeTree = useCallback(async () => {
    setTypeTreeLoading(true)
    try {
      const res = await getDictTypeList({})
      const list = res.data?.dictType || res.data || []
      // 转换为树形结构
      const treeData = buildDictTypeTree(list)
      setDictTypeTree(treeData)
    } catch (error) {
      console.error('加载字典类型失败:', error)
      toast.error(t('admin.loadDictTypeFailed'))
    } finally {
      setTypeTreeLoading(false)
    }
  }, [t])

  /**
   * 加载字典数据
   */
  const loadDictData = useCallback(
    async (params: any = {}) => {
      setLoading(true)
      setDictData([])
      try {
        // 构建请求参数，优先使用传入的 typeId，其次使用 selectedTypeId，最后使用 searchParams.typeId
        const requestParams = {
          ...searchParams,
          ...params,
          typeId:
            params.typeId !== undefined
              ? params.typeId
              : selectedTypeId
                ? String(selectedTypeId)
                : searchParams.typeId || ''
        }

        // 清理空值
        const cleanedParams = cleanRequestParams(requestParams)

        const res = await getDictDataList(cleanedParams)

        // 处理返回数据
        const list = res.data?.list || res.data?.rows || res.data || []
        const total = res.data?.total || list.length

        setDictData(list as DictData[])
        setTotal(total)
      } catch (error) {
        console.error('加载字典数据失败:', error)
        toast.error(t('admin.loadDictDataFailed'))
      } finally {
        setLoading(false)
      }
    },
    [searchParams, selectedTypeId, t]
  )

  /**
   * 搜索变化
   */
  const handleSearchChange = useCallback(
    (params: typeof searchParams) => {
      setSearchParams(params)
      tableRef?.current?.resetPage?.()
      loadDictData({ pageNum: 1, pageSize: getPageSize(), ...params })
    },
    [loadDictData, getPageSize]
  )

  /**
   * 重置搜索
   */
  const handleReset = useCallback(() => {
    setSearchParams(SEARCH_PARAMS_DEFAULT)
    tableRef?.current?.resetPage?.()
    loadDictData({ pageNum: 1, pageSize: getPageSize(), ...SEARCH_PARAMS_DEFAULT })
  }, [loadDictData, getPageSize])

  /**
   * 字典类型选择变化
   */
  const handleTypeSelect = useCallback(
    (typeId: string | number, node: DictTypeNode) => {
      // 使用 dictId 作为 typeId 参数
      const dictId = node.dictId
      if (!dictId) return

      setSelectedTypeId(dictId)
      setSearchParams(prev => ({ ...prev, typeId: String(dictId) }))
      tableRef?.current?.resetPage?.()
      loadDictData({ pageNum: 1, pageSize: getPageSize(), typeId: String(dictId) })
    },
    [loadDictData, getPageSize]
  )

  /**
   * 新增字典
   */
  const handleAddDict = useCallback(() => {
    setEditingDict(null)
    setDialogOpen(true)
  }, [])

  /**
   * 编辑字典
   */
  const handleEditDict = useCallback((dict: DictData) => {
    setEditingDict(dict)
    setDialogOpen(true)
  }, [])

  /**
   * 删除字典
   */
  const handleDeleteDict = useCallback((dict: DictData) => {
    setDeleteDict(dict)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除字典
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDict) {
      toast.error(t('admin.noDictToDelete'))
      return
    }
    try {
      setBtnLoading(true)
      await deleteDictDataApi({ ids: [deleteDict.dictCode] })
      setDeleteDialogOpen(false)
      setDeleteDict(null)
      toast.success(t('admin.operationSuccess'))
      loadDictData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }, [deleteDict, loadDictData, searchParams, getPageSize, t])

  /**
   * 新增字典类型
   */
  const handleAddDictType = useCallback(() => {
    setEditingTypeNode(null)
    setTypeDialogOpen(true)
  }, [])

  /**
   * 编辑字典类型
   */
  const handleEditType = useCallback((node: DictTypeNode) => {
    setEditingTypeNode(node)
    setTypeDialogOpen(true)
  }, [])

  /**
   * 删除字典类型
   */
  const handleDeleteType = useCallback((node: DictTypeNode) => {
    setDeleteTypeNode(node)
    setDeleteTypeDialogOpen(true)
  }, [])

  /**
   * 确认删除字典类型
   */
  const handleConfirmDeleteType = useCallback(async () => {
    if (!deleteTypeNode?.dictId) {
      toast.error(t('admin.noDictTypeToDelete'))
      return
    }
    try {
      setBtnLoading(true)
      await deleteDictTypeApi({ dictIds: [deleteTypeNode.dictId] })
      setDeleteTypeDialogOpen(false)
      setDeleteTypeNode(null)
      toast.success(t('admin.operationSuccess'))
      loadDictTypeTree()
      // 如果删除的是当前选中的类型，清空选择并重新加载数据
      if (selectedTypeId === deleteTypeNode.dictId) {
        setSelectedTypeId('')
        setSearchParams(SEARCH_PARAMS_DEFAULT)
        loadDictData({ pageNum: 1, pageSize: getPageSize(), ...SEARCH_PARAMS_DEFAULT })
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }, [deleteTypeNode, selectedTypeId, loadDictTypeTree, loadDictData, getPageSize, t])

  /**
   * 保存字典类型
   */
  const handleSaveType = useCallback(
    async (data: any) => {
      try {
        if (data.dictId) {
          await editDictTypeApi(data)
        } else {
          await addDictTypeApi(data)
        }
        setTypeDialogOpen(false)
        setEditingTypeNode(null)
        toast.success(t('admin.operationSuccess'))
        loadDictTypeTree()
      } catch (error: any) {
        toast.error(error?.message || t('admin.operationFailed'))
      }
    },
    [loadDictTypeTree, t]
  )

  /**
   * 保存字典
   */
  const handleSaveDict = useCallback(
    async (data: Partial<DictData>) => {
      try {
        // 调用对应的 API
        if (data.dictCode) {
          await editDictDataApi(data)
        } else {
          await addDictDataApi(data)
        }

        setDialogOpen(false)
        setEditingDict(null)
        toast.success(t('admin.operationSuccess'))
        loadDictData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
      } catch (error: any) {
        toast.error(error?.message || t('admin.operationFailed'))
      }
    },
    [loadDictData, searchParams, getPageSize, t]
  )

  /**
   * 分页变化
   */
  const handlePageChange = useCallback(
    (params: { pageNum: number; pageSize: number }) => {
      loadDictData({ pageNum: params?.pageNum, pageSize: params?.pageSize, ...searchParams })
    },
    [loadDictData, searchParams]
  )

  // 初始化加载数据
  useEffect(() => {
    loadDictTypeTree()
    loadDictData({ pageNum: 1, pageSize: 10 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      {/* 左侧字典类型树 */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Box className='h-[calc(100vh-200px)] flex flex-col'>
          <DictTypeTree
            data={dictTypeTree}
            selectedId={selectedTypeId}
            loading={typeTreeLoading}
            onSelect={handleTypeSelect}
            onAdd={handleAddDictType}
            onEdit={handleEditType}
            onDelete={handleDeleteType}
          />
        </Box>
      </Grid>

      {/* 右侧内容区 */}
      <Grid size={{ xs: 12, md: 9 }}>
        <Card>
          {/* 搜索筛选栏 */}
          <SearchFilters
            params={searchParams}
            onSearchChange={handleSearchChange}
            onReset={handleReset}
            onAddDict={handleAddDict}
          />
          <Box sx={{ p: 4, pt: 0 }}>
            <Divider sx={{ px: 2 }} />
            <Box sx={{ pt: 4 }}>
              {/* 字典表格 */}
              <DictTable
                data={dictData}
                loading={loading}
                total={total}
                onPageChange={handlePageChange}
                onEdit={handleEditDict}
                onDelete={handleDeleteDict}
                tableRef={tableRef}
              />
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* 字典编辑对话框 */}
      <DictDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingDict(null)
        }}
        onSave={handleSaveDict}
        dictData={editingDict}
        dictTypeTree={dictTypeTree}
        selectedTypeId={selectedTypeId}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('admin.confirmDeleteDict')}
        description={
          deleteDict
            ? `${t('admin.confirmDeleteDictMessagePrefix')} "${deleteDict.dictLabel}" ${t('admin.confirmDeleteDictMessageSuffix')}`
            : ''
        }
        loading={btnLoading}
      />

      {/* 字典类型编辑对话框 */}
      <DictTypeDialog
        open={typeDialogOpen}
        onClose={() => {
          setTypeDialogOpen(false)
          setEditingTypeNode(null)
        }}
        onSave={handleSaveType}
        dictTypeData={editingTypeNode}
        dictTypeTree={dictTypeTree}
      />

      {/* 字典类型删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteTypeDialogOpen}
        onClose={() => setDeleteTypeDialogOpen(false)}
        onConfirm={handleConfirmDeleteType}
        title={t('admin.confirmDeleteDict')}
        description={
          deleteTypeNode
            ? `${t('admin.confirmDeleteDictTypeMessagePrefix')} "${deleteTypeNode.dictName}" ${t('admin.confirmDeleteDictTypeMessageSuffix')}`
            : ''
        }
        loading={btnLoading}
      />
    </Grid>
  )
}
