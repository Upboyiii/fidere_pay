'use client'

// React Imports
import { useState, useCallback, useRef, useEffect } from 'react'

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
import RoleTable from './components/RoleTable'
import RoleDialog from './components/RoleDialog'
import { TableInstance } from '@/components/table'
import type { RoleData, RoleTreeNode, MenuNode, MenuData } from './components/utils'
import { buildRoleTree, buildMenuTree } from './components/utils'

// API Imports
import { getRoleList, addRoleApi, editRoleApi, deleteRoleApi, getMenuTree } from '@server/admin'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

/**
 * 角色管理页面
 */
export default function AuthRoles() {
  const t = useTranslate()
  // States
  const [searchParams, setSearchParams] = useState({
    roleName: '',
    status: ''
  })
  const [roleTree, setRoleTree] = useState<RoleTreeNode[]>([])
  const [roleData, setRoleData] = useState<RoleData[]>([])
  const [menuTree, setMenuTree] = useState<MenuNode[]>([])
  const [entranceOptions, setEntranceOptions] = useState<Array<{ key: string; remark: string }>>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteRole, setDeleteRole] = useState<RoleData | null>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const tableRef = useRef<TableInstance>(null)

  /**
   * 加载角色数据
   */
  const loadRoleData = async (params = {}) => {
    setLoading(true)
    setRoleData([])
    try {
      const res = await getRoleList({ ...searchParams, ...params })
      const listData: RoleData[] = res.data?.rows ?? res.data?.list ?? []

      // 将扁平数组转换为树形结构
      const treeData = buildRoleTree(listData)
      setRoleTree(treeData)

      setRoleData(listData)
    } catch (error) {
      console.error('加载角色数据失败:', error)
      toast.error(t('admin.loadDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载菜单树数据
   */
  const loadMenuTree = async () => {
    try {
      const res = await getMenuTree()
      const menuList: MenuData[] = res.data?.menu ?? []
      // 将扁平数组转换为树形结构
      const treeData = buildMenuTree(menuList)
      setMenuTree(treeData)
      // 保存入口配置数据
      const values = res?.data?.loginEntrance?.values || []
      setEntranceOptions(values)
    } catch (error) {
      console.error('加载菜单树失败:', error)
      toast.error(t('admin.loadMenuTreeFailed'))
    }
  }

  /**
   * 搜索变化
   */
  const handleSearchChange = (params: typeof searchParams) => {
    setSearchParams(params)
    tableRef?.current?.resetPage?.()
    loadRoleData({ pageNum: 1, pageSize: tableRef?.current?.getState()?.pagination?.pageSize, ...params })
  }

  /**
   * 新增角色
   */
  const handleAddRole = useCallback(() => {
    setEditingRole(null)
    setDialogOpen(true)
  }, [])

  /**
   * 编辑角色
   */
  const handleEditRole = useCallback((role: RoleData) => {
    setEditingRole(role)
    setDialogOpen(true)
  }, [])

  /**
   * 授权角色（暂不实现）
   */
  const handleAuthRole = useCallback((role: RoleData) => {
    toast.info(t('admin.authFeaturePending'))
  }, [t])

  /**
   * 删除角色
   */
  const handleDeleteRole = useCallback((role: RoleData) => {
    setDeleteRole(role)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除角色
   */
  const handleConfirmDelete = async () => {
    try {
      setBtnLoading(true)
      const roleId = deleteRole?.roleId ?? deleteRole?.id
      await deleteRoleApi({ ids: [roleId] })
      setDeleteDialogOpen(false)
      setDeleteRole(null)
      const currentPage = tableRef?.current?.getState()?.pagination?.pageIndex ?? 0
      const currentPageSize = tableRef?.current?.getState()?.pagination?.pageSize ?? 10
      loadRoleData({
        pageNum: currentPage + 1,
        pageSize: currentPageSize,
        ...searchParams
      })
      toast.success(t('admin.operationSuccess'))
    } catch (error: any) {
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }

  /**
   * 保存角色
   */
  const handleSaveRole = async (data: Partial<RoleData>) => {
    try {
      setBtnLoading(true)
      const roleId = data?.roleId ?? data?.id
      const api = roleId ? editRoleApi : addRoleApi
      await api(data)
      setDialogOpen(false)
      setEditingRole(null)
      toast.success(t('admin.operationSuccess'))
      const currentPage = tableRef?.current?.getState()?.pagination?.pageIndex ?? 0
      const currentPageSize = tableRef?.current?.getState()?.pagination?.pageSize ?? 10
      loadRoleData({
        pageNum: currentPage + 1,
        pageSize: currentPageSize,
        ...searchParams
      })
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
    loadRoleData({ pageNum: params?.pageNum, pageSize: params?.pageSize, ...searchParams })
  }

  // 初始化加载数据
  useEffect(() => {
    loadRoleData({ pageNum: 1, pageSize: 10 })
    loadMenuTree()
  }, [])

  return (
    <Box className='flex flex-col gap-4'>
      <Card>
        {/* 搜索筛选栏 */}
        <SearchFilters params={searchParams} onSearchChange={handleSearchChange} onAddRole={handleAddRole} />

        {/* 角色表格 */}
        <RoleTable
          data={roleData}
          loading={loading}
          onPageChange={handlePageChange}
          onEdit={handleEditRole}
          onAuth={handleAuthRole}
          onDelete={handleDeleteRole}
          tableRef={tableRef}
        />
      </Card>

      {/* 角色编辑对话框 */}
      <RoleDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingRole(null)
        }}
        onSave={handleSaveRole}
        roleData={editingRole}
        roleTree={roleTree}
        menuTree={menuTree}
        entranceOptions={entranceOptions}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.confirmDeleteRole')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.confirmDeleteRoleMessagePrefix')} <strong>{deleteRole?.roleName ?? deleteRole?.name}</strong>{' '}
            {t('admin.confirmDeleteRoleMessageSuffix')}
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
