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
import MenuTable from './components/MenuTable'
import MenuDialog from './components/MenuDialog'
import { TableInstance } from '@/components/table'
import type { MenuItemData, MenuNode, MenuData } from './components/utils'
import type { RoleTreeNode, RoleData } from '@/views/admin/authRoles/components/utils'
import { buildMenuTree, flattenMenuTree } from './components/utils'
import { buildRoleTree } from '@/views/admin/authRoles/components/utils'

// API Imports
import { getMenuList, addMenuApi, editMenuApi, deleteMenuApi, getRoleList } from '@server/admin'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

/**
 * 菜单管理页面
 */
export default function AuthMenu() {
  const t = useTranslate()
  // States
  const [searchParams, setSearchParams] = useState({
    title: '',
    component: ''
  })
  const [menuTree, setMenuTree] = useState<MenuNode[]>([])
  const [menuData, setMenuData] = useState<MenuItemData[]>([])
  const [roleTree, setRoleTree] = useState<RoleTreeNode[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItemData | null>(null)
  const [parentMenu, setParentMenu] = useState<MenuItemData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteMenu, setDeleteMenu] = useState<MenuItemData | null>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const tableRef = useRef<TableInstance>(null)

  /**
   * 加载菜单数据
   */
  const loadMenuData = async (params = {}) => {
    setLoading(true)
    setMenuData([])
    try {
      const res = await getMenuList({ ...searchParams, ...params })
      const listData: MenuData[] = res.data?.rules ?? res.data?.list ?? []

      // 将扁平数组转换为树形结构
      const treeData = buildMenuTree(listData)
      setMenuTree(treeData)

      // 扁平化树形数据用于表格显示
      const flatData = flattenMenuTree(treeData)
      setMenuData(flatData)
    } catch (error) {
      toast.error(t('admin.loadDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载角色数据
   */
  const loadRoleData = async () => {
    try {
      const res = await getRoleList({})
      const listData: RoleData[] = res.data?.rows ?? res.data?.list ?? []
      // 将扁平数组转换为树形结构
      const treeData = buildRoleTree(listData)
      setRoleTree(treeData)
    } catch (error) {
      toast.error(t('admin.loadRoleDataFailed'))
    }
  }

  /**
   * 搜索变化
   */
  const handleSearchChange = (params: typeof searchParams) => {
    setSearchParams(params)
    loadMenuData()
  }

  /**
   * 新增菜单
   */
  const handleAddMenu = useCallback(() => {
    setEditingMenu(null)
    setParentMenu(null)
    setDialogOpen(true)
  }, [])

  /**
   * 新增子菜单
   */
  const handleAddChild = useCallback((menu: MenuItemData) => {
    console.log('menu', menu)

    setEditingMenu(null)
    setParentMenu(menu)
    setDialogOpen(true)
  }, [])

  /**
   * 编辑菜单
   */
  const handleEditMenu = useCallback((menu: MenuItemData) => {
    setEditingMenu(menu)
    setParentMenu(null)
    setDialogOpen(true)
  }, [])

  /**
   * 删除菜单
   */
  const handleDeleteMenu = useCallback((menu: MenuItemData) => {
    setDeleteMenu(menu)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除菜单
   */
  const handleConfirmDelete = async () => {
    try {
      setBtnLoading(true)
      await deleteMenuApi({ ids: [deleteMenu?.id] })
      setDeleteDialogOpen(false)
      setDeleteMenu(null)
      loadMenuData()
      toast.success(t('admin.operationSuccess'))
    } catch (error: any) {
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }

  /**
   * 保存菜单
   */
  const handleSaveMenu = async (data: Partial<MenuItemData>) => {
    try {
      setBtnLoading(true)
      const api = data?.id ? editMenuApi : addMenuApi
      await api(data)
      setDialogOpen(false)
      setEditingMenu(null)
      setParentMenu(null)
      toast.success(t('admin.operationSuccess'))
      loadMenuData()
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
    // 菜单列表通常不需要分页，但保留接口
    loadMenuData()
  }

  // 初始化加载数据
  useEffect(() => {
    loadMenuData()
    loadRoleData()
  }, [])

  return (
    <Box className='flex flex-col gap-4'>
      <Card>
        {/* 搜索筛选栏 */}
        <SearchFilters params={searchParams} onSearchChange={handleSearchChange} onAddMenu={handleAddMenu} />

        {/* 菜单表格 */}
        <MenuTable
          data={menuData}
          loading={loading}
          onPageChange={handlePageChange}
          onAdd={handleAddChild}
          onEdit={handleEditMenu}
          onDelete={handleDeleteMenu}
          tableRef={tableRef}
        />
      </Card>

      {/* 菜单编辑对话框 */}
      <MenuDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingMenu(null)
          setParentMenu(null)
        }}
        onSave={handleSaveMenu}
        menuData={editingMenu}
        parentMenu={parentMenu}
        menuTree={menuTree}
        roleTree={roleTree}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.confirmDeleteMessagePrefix')} <strong>{deleteMenu?.title ?? deleteMenu?.name}</strong>{' '}
            {t('admin.confirmDeleteMessageSuffix')}
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
