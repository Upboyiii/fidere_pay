'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { Controller, useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { getMenuParams } from '@server/admin'

// Component Imports
import MenuSelect from './MenuSelect'
import PermissionSelect from './PermissionSelect'
import IconPickerDialog from '@components/dialogs/icon-picker'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { MenuItemData, MenuNode } from './utils'
import type { RoleTreeNode } from '@/views/admin/authRoles/components/utils'
import { findMenuNode } from './utils'

interface MenuDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 菜单数据（编辑时传入） */
  menuData?: MenuItemData | null
  /** 父菜单数据（新增子菜单时传入） */
  parentMenu?: MenuItemData | null
  /** 菜单树数据 */
  menuTree: MenuNode[]
  /** 角色树数据 */
  roleTree: RoleTreeNode[]
}

const codeObjs = (menuType = '0', objs = {}) => ({
  pid: '',
  menuType: String(menuType) || '0',
  title: '',
  menuNameEn: '',
  menuNameTw: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  linkUrl: '',
  redirect: '',
  weigh: 0,
  isCached: '1',
  isLink: '0',
  isHide: '0',
  isAffix: '0',
  isIframe: '0',
  remark: '',
  permission: [],
  ...objs
})

/**
 * 菜单编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param menuData - 菜单数据
 * @param parentMenu - 父菜单数据
 * @param menuTree - 菜单树数据
 * @param roleTree - 角色树数据
 */
const MenuDialog = ({ open, onClose, onSave, menuData, parentMenu, menuTree, roleTree }: MenuDialogProps) => {
  const t = useTranslate()
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: codeObjs('0')
  })

  const menuType = watch('menuType') ?? '0'
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  // 确保 menuType 是字符串类型，用于条件判断
  const isButtonType = String(menuType) === '2'

  /**
   * 构建菜单路径
   */
  const buildMenuPathString = (targetId: string | number, nodes: MenuNode[], path: string[] = []): string[] | null => {
    for (const node of nodes) {
      const currentPath = [...path, node.label]
      if (String(node.id) === String(targetId)) {
        return currentPath
      }
      if (node.children) {
        const found = buildMenuPathString(targetId, node.children, currentPath)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (!open) return

    if (menuData) {
      // 编辑模式：查找父菜单路径
      let parentPath = ''
      if (menuData.pid) {
        const path = buildMenuPathString(menuData.pid, menuTree)
        if (path) {
          parentPath = path.join(' / ')
        }
      }

      reset({
        pid: parentPath,
        menuType: String(menuData.menuType ?? '0'),
        title: menuData.title ?? '',
        menuNameEn: (menuData as any).titleEn ?? '',
        menuNameTw: (menuData as any).titleTw ?? '',
        name: menuData.name ?? '',
        path: menuData.path ?? '',
        component: menuData.component ?? '',
        icon: menuData.icon ?? '',
        linkUrl: menuData.linkUrl ?? '',
        redirect: menuData.redirect ?? '',
        weigh: menuData.weigh ?? 0,
        isCached: String(menuData.isCached ?? '1'),
        isLink: String(menuData.isLink ?? '0'),
        isHide: String(menuData.isHide ?? '0'),
        isAffix: String(menuData.isAffix ?? '0'),
        isIframe: String(menuData.isIframe ?? '0'),
        remark: menuData.remark ?? '',
        permission: []
      })

      // 异步加载权限数据
      getMenuParams({ id: menuData.id })
        .then(res => {
          reset(
            {
              permission: res?.data?.roleIds ?? []
            },
            { keepValues: true }
          )
        })
        .catch(() => {})
    } else if (parentMenu) {
      // 新增子菜单模式：设置父菜单路径
      let parentPath = ''

      // 判断父菜单层级：pid为0或level为0表示一级菜单
      const isFirstLevel = parentMenu.pid === 0 || parentMenu.pid === '0' || parentMenu.level === 0

      if (isFirstLevel) {
        // 一级菜单：直接使用父菜单标题
        parentPath = parentMenu.title || parentMenu.name || ''
      } else if (parentMenu.level === 1) {
        // 二级菜单：需要构建 "一级菜单 / 二级菜单" 的路径
        const pathParts: string[] = []

        // 先查找一级菜单（通过parentMenu.pid）
        if (parentMenu.pid) {
          const firstLevelMenu = findMenuNode(menuTree, parentMenu.pid)
          if (firstLevelMenu) {
            pathParts.push(firstLevelMenu.label || firstLevelMenu.title || '')
          }
        }

        // 添加二级菜单标题
        const secondLevelTitle = parentMenu.title || parentMenu.name || ''
        if (secondLevelTitle) {
          pathParts.push(secondLevelTitle)
        }

        parentPath = pathParts.join(' / ')
      } else {
        // 其他情况：尝试在menuTree中查找完整路径
        const path = buildMenuPathString(parentMenu.id!, menuTree)
        if (path) {
          parentPath = path.join(' / ')
        } else {
          // 如果找不到，至少使用父菜单标题
          parentPath = parentMenu.title || parentMenu.name || ''
        }
      }

      reset(codeObjs('1', { pid: parentPath }))
    } else {
      // 新增根菜单
      reset(codeObjs('0'))
    }
  }, [menuData, parentMenu, menuTree, reset, open])

  /**
   * 根据菜单路径字符串找到菜单ID（按层级顺序查找）
   * @param pathString - 菜单路径字符串，例如 "一级菜单 / 二级菜单"
   * @returns 菜单ID或null
   */
  const findMenuIdByPath = (pathString: string): number | null => {
    if (!pathString || !menuTree.length) return null

    const pathParts = pathString.split(' / ').filter(part => part.trim())
    if (pathParts.length === 0) return null

    /**
     * 递归查找菜单节点（按路径层级顺序）
     * @param nodes - 当前层级的菜单节点数组
     * @param pathIndex - 当前查找的路径索引
     * @returns 找到的菜单节点或null
     */
    const findNodeByPath = (nodes: MenuNode[], pathIndex: number): MenuNode | null => {
      if (pathIndex >= pathParts.length) return null

      const targetName = pathParts[pathIndex].trim()

      // 在当前层级查找匹配的节点
      for (const node of nodes) {
        // 同时匹配 label 和 title，确保能找到正确的节点
        const nodeLabel = node.label || node.title || ''
        const nodeTitle = node.title || node.label || ''

        if (nodeLabel === targetName || nodeTitle === targetName) {
          // 如果这是路径的最后一部分，返回当前节点
          if (pathIndex === pathParts.length - 1) {
            return node
          }
          // 否则继续在子节点中查找下一级
          if (node.children && node.children.length > 0) {
            const found = findNodeByPath(node.children, pathIndex + 1)
            if (found) return found
          }
        }
      }

      return null
    }

    const node = findNodeByPath(menuTree, 0)
    return node ? Number(node.id) : null
  }

  /**
   * 提交表单
   */
  const onSubmit = (data: any) => {
    // 根据路径字符串查找菜单ID
    let pid: number | null = null
    if (data.pid) {
      pid = findMenuIdByPath(data.pid)
    }

    // 如果通过路径找不到，且是新增子菜单模式，使用parentMenu.id作为备选
    if (!pid && parentMenu && parentMenu.id) {
      pid = Number(parentMenu.id)
    }

    const submitData: any = {
      pid: pid || 0,
      menuType: Number(data.menuType) || 0,
      menuName: data.title || '',
      menuNameEn: data.menuNameEn || '',
      menuNameTw: data.menuNameTw || '',
      name: data.name || data.path || '',
      path: data.path || '',
      component: data?.path || '',
      icon: data.icon || '',
      linkUrl: data.linkUrl || '',
      redirect: data.redirect || '',
      menuSort: Number(data.weigh) || 0,
      isCached: Number(data.isCached) || 0,
      isLink: Number(data.isLink) || 0,
      isHide: Number(data.isHide) || 0,
      isAffix: Number(data.isAffix) || 0,
      isIframe: Number(data.isIframe) || 0,
      remark: data.remark || '',
      roles: data?.permission ?? []
    }

    if (menuData) {
      submitData.id = menuData.id
    }

    onSave?.(submitData)
  }

  const _onClose = () => {
    onClose()
    // reset()
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={_onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {menuData ? t('admin.editMenu') : t('admin.addMenu')}
        <IconButton size='small' onClick={_onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* 第一行：上级菜单、菜单类型 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <MenuSelect control={control} menuTree={menuTree} name='pid' excludeMenuId={menuData?.id} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormLabel component='legend' required>
                {t('admin.menuType')}
              </FormLabel>
              <Controller
                name='menuType'
                control={control}
                rules={{ required: t('admin.selectMenuType') }}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel value='0' control={<Radio />} label={t('admin.directory')} />
                    <FormControlLabel value='1' control={<Radio />} label={t('admin.menu')} />
                    <FormControlLabel value='2' control={<Radio />} label={t('admin.button')} />
                  </RadioGroup>
                )}
              />
            </Grid>

            {/* 第二行：菜单名称、接口规则 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='title'
                control={control}
                rules={{ required: t('admin.enterMenuName') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.menuName')}
                    required
                    placeholder={t('admin.fillMenuName')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            {/* 英文菜单名称 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='menuNameEn'
                control={control}
                rules={{ required: t('admin.enterMenuNameEn') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.menuNameEn')}
                    required
                    placeholder={t('admin.fillMenuNameEn')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            {/* 繁体菜单名称 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='menuNameTw'
                control={control}
                rules={{ required: t('admin.enterMenuNameTw') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.menuNameTw')}
                    required
                    placeholder={t('admin.fillMenuNameTw')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            {/* {!isButtonType && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: '请输入接口规则' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      fullWidth
                      label='接口规则'
                      required
                      placeholder='后端 aip 地址'
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            )} */}

            {/* 第三行：路由路径、重定向 */}
            {!isButtonType && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='path'
                    control={control}
                    rules={{ required: t('admin.enterRoutePath') }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label={t('admin.routePath')}
                        required
                        placeholder={t('admin.routePathPlaceholder')}
                        disabled={!!menuData}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='redirect'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='重定向'
                        placeholder='请输入路由重定向'
                      />
                    )}
                  />
                </Grid> */}

                {/* 第四行：菜单图标、组件路径 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='icon'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label={t('admin.menuIcon')}
                        placeholder={t('admin.selectMenuIcon')}
                        InputProps={{
                          readOnly: true,
                          endAdornment: field.value ? (
                            <InputAdornment position='end'>
                              <IconButton size='small' onClick={() => setIconPickerOpen(true)} className='mie-2'>
                                <i className={field.value} />
                              </IconButton>
                            </InputAdornment>
                          ) : null
                        }}
                        onClick={() => setIconPickerOpen(true)}
                        onFocus={e => e.target.blur()}
                      />
                    )}
                  />
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='component'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='组件路径'
                        placeholder='组件路径'
                      />
                    )}
                  />
                </Grid> */}

                {/* 第五行：链接地址 */}
                {/* <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='linkUrl'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='链接地址'
                        placeholder='外链链接地址 (http:xxx.com)'
                      />
                    )}
                  />
                </Grid> */}
              </>
            )}

            {/* 权限标识 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <PermissionSelect control={control} roleTree={roleTree} name='permission' />
            </Grid>

            {/* 第六行：菜单排序、是否隐藏 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='weigh'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? 0}
                    fullWidth
                    type='number'
                    label={t('admin.menuSort')}
                    placeholder={t('admin.enterSort')}
                  />
                )}
              />
            </Grid>
            {!isButtonType && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormLabel component='legend'>{t('admin.isHide')}</FormLabel>
                <Controller
                  name='isHide'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value='0' control={<Radio />} label={t('admin.show')} />
                      <FormControlLabel value='1' control={<Radio />} label={t('admin.hide')} />
                    </RadioGroup>
                  )}
                />
              </Grid>
            )}

            {/* 第八行：是否外链 */}
            {/* {!isButtonType && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormLabel component='legend'>是否外链</FormLabel>
                <Controller
                  name='isLink'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value='1' control={<Radio />} label='是' />
                      <FormControlLabel value='0' control={<Radio />} label='否' />
                    </RadioGroup>
                  )}
                />
              </Grid>
            )} */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={_onClose}>{t('admin.cancel')}</Button>
          <Button type='submit' variant='contained'>
            {menuData ? t('admin.save') : t('admin.add')}
          </Button>
        </DialogActions>
      </form>

      {/* 图标选择器对话框 - 使用条件渲染确保完全卸载 */}
      {iconPickerOpen && (
        <IconPickerDialog
          key='icon-picker'
          open={iconPickerOpen}
          onClose={() => {
            setIconPickerOpen(false)
          }}
          onSelect={iconName => {
            setValue('icon', iconName)
            setIconPickerOpen(false)
          }}
          selectedIcon={watch('icon')}
        />
      )}
    </Dialog>
  )
}

export default MenuDialog
