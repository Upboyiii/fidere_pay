'use client'

// React Imports
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Component Imports
import SearchFilters from './components/SearchFilters'
import DeptTable from './components/DeptTable'
import DeptDialog from './components/DeptDialog'
import { TableInstance } from '@/components/table'
import type { DepartmentNode } from '@/views/admin/authUser/components/DepartmentTree'

// Utils Imports
import { buildDeptTree, flattenDeptTree, type FlatDeptData, type DeptListItem } from './components/utils'

// API Imports
import { getDeptList, addDeptApi, editDeptApi, deleteDeptApi, getDepartmentTree } from '@server/admin'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

/**
 * 部门管理页面
 */
export default function AuthDept() {
  const t = useTranslate()
  // States
  const [searchParams, setSearchParams] = useState({
    deptName: '',
    status: ''
  })
  const [deptTree, setDeptTree] = useState<DepartmentNode[]>([])
  const [deptData, setDeptData] = useState<FlatDeptData[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<FlatDeptData | null>(null)
  const [parentDept, setParentDept] = useState<FlatDeptData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteDept, setDeleteDept] = useState<FlatDeptData | null>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const tableRef = useRef<TableInstance>(null)
  /**
   * 加载部门数据
   */
  const loadDeptData = async (params = {}) => {
    setLoading(true)
    setDeptData([])
    try {
      const res = await getDeptList({ ...searchParams, ...params })
      const listData: DeptListItem[] = res.data?.deptList ?? []

      // 将扁平数组转换为树形结构
      const treeData = buildDeptTree(listData)
      setDeptTree(treeData)

      // 扁平化树形数据用于表格显示
      const flatData = flattenDeptTree(treeData)
      setDeptData(flatData)
    } catch (error) {
      console.error('加载部门数据失败:', error)
      toast.error(t('admin.loadDeptDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 搜索变化
   */
  const handleSearchChange = (params: typeof searchParams) => {
    setSearchParams(params)
    loadDeptData()
  }

  /**
   * 新增部门
   */
  const handleAddDept = useCallback(() => {
    setEditingDept(null)
    setParentDept(null)
    setDialogOpen(true)
  }, [])

  /**
   * 新增子部门
   */
  const handleAddChild = useCallback((dept: FlatDeptData) => {
    setEditingDept(null)
    setParentDept(dept)
    setDialogOpen(true)
  }, [])

  /**
   * 编辑部门
   */
  const handleEditDept = useCallback((dept: FlatDeptData) => {
    setEditingDept(dept)
    setParentDept(null)
    setDialogOpen(true)
  }, [])

  /**
   * 删除部门
   */
  const handleDeleteDept = useCallback((dept: FlatDeptData) => {
    setDeleteDept(dept)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除部门
   */
  const handleConfirmDelete = async () => {
    try {
      setBtnLoading(true)
      await deleteDeptApi({ id: deleteDept?.deptId })
      setDeleteDialogOpen(false)
      setDeleteDept(null)
      loadDeptData()
      toast.success(t('admin.operationSuccess'))
    } catch (error: any) {
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }

  /**
   * 保存部门
   */
  const handleSaveDept = async (data: Partial<FlatDeptData>) => {
    try {
      setBtnLoading(true)
      const api = data?.deptId ? editDeptApi : addDeptApi
      await api(data)
      setDialogOpen(false)
      setEditingDept(null)
      setParentDept(null)
      toast.success(t('admin.operationSuccess'))
      loadDeptData()
    } catch (error: any) {
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }

  /**
   * 分页变化
   */
  const handlePageChange = (params: { pageNum: number; pageSize: number }) => {
    // 部门列表通常不需要分页，但保留接口
    loadDeptData()
  }

  // 初始化加载数据
  useEffect(() => {
    loadDeptData()
  }, [])

  return (
    <Box className='flex flex-col gap-4'>
      <Card>
        {/* 搜索筛选栏 */}
        <SearchFilters params={searchParams} onSearchChange={handleSearchChange} onAddDept={handleAddDept} />

        {/* 部门表格 */}
        <DeptTable
          data={deptData}
          loading={loading}
          onPageChange={handlePageChange}
          onAdd={handleAddChild}
          onEdit={handleEditDept}
          onDelete={handleDeleteDept}
          tableRef={tableRef}
        />
      </Card>

      {/* 部门编辑对话框 */}
      <DeptDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingDept(null)
          setParentDept(null)
        }}
        onSave={handleSaveDept}
        deptData={editingDept}
        parentDept={parentDept}
        deptTree={deptTree}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.confirmDeleteDept')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.confirmDeleteDeptMessagePrefix')} <strong>{deleteDept?.deptName}</strong>{' '}
            {t('admin.confirmDeleteDeptMessageSuffix')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('admin.cancel')}</Button>
          <Button onClick={handleConfirmDelete} variant='contained' color='error' disabled={btnLoading}>
            {t('admin.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
