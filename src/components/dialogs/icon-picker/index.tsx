'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'
import React from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Icon Imports
import { Search, X } from 'lucide-react'

/**
 * 图标选择器对话框组件
 * @param open - 是否打开对话框
 * @param onClose - 关闭回调
 * @param onSelect - 选择图标回调，参数为图标名称（如 'ri-time-line'）
 * @param selectedIcon - 当前选中的图标名称
 */
interface IconPickerDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 选择图标回调 */
  onSelect: (iconName: string) => void
  /** 当前选中的图标名称 */
  selectedIcon?: string
}

/**
 * 从本地 API 路由加载 Remix Icon 图标列表
 * 优先使用本地 API，如果失败则使用在线 API 作为备用
 */
const loadRemixIcons = async (): Promise<string[]> => {
  try {
    // 优先使用本地 API 路由
    const response = await fetch('/api/icons/ri')
    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    // 如果本地 API 失败，尝试使用 Iconify 在线 API
    const onlineResponse = await fetch('https://api.iconify.design/collection?prefix=ri')
    const onlineData = await onlineResponse.json()

    if (onlineData.uncategorized) {
      const iconNames = onlineData.uncategorized
        .filter((name: string) => name.includes('-line'))
        .map((name: string) => `ri-${name}`)
        .sort()

      return iconNames
    }

    return []
  } catch (error) {
    console.error('加载图标列表失败:', error)
    // 如果都失败，返回一些常用图标作为备用
    return [
      'ri-home-line',
      'ri-user-line',
      'ri-settings-line',
      'ri-menu-line',
      'ri-search-line',
      'ri-time-line',
      'ri-briefcase-line',
      'ri-wallet-line',
      'ri-file-line',
      'ri-folder-line'
    ]
  }
}

/**
 * 图标选择器对话框组件
 */
// 每次显示的图标数量
const ICONS_PER_PAGE = 100

// 图标项组件，使用 React.memo 优化性能
const IconItem = React.memo(
  ({
    iconName,
    isSelected,
    isHovered,
    onSelect,
    onHover
  }: {
    iconName: string
    isSelected: boolean
    isHovered: boolean
    onSelect: (iconName: string) => void
    onHover: (iconName: string | null) => void
  }) => {
    return (
      <Box
        className={classnames('flex flex-col items-center justify-center p-4 rounded cursor-pointer transition-all', {
          'bg-primary/10 border-2 border-primary': isSelected,
          'bg-action-hover border-2 border-transparent': isHovered && !isSelected,
          'border-2 border-transparent hover:bg-action-hover': !isSelected && !isHovered
        })}
        onClick={e => {
          e.stopPropagation()
          onSelect(iconName)
        }}
        onMouseEnter={() => onHover(iconName)}
        onMouseLeave={() => onHover(null)}
        title={iconName}
      >
        <i className={classnames(iconName, 'text-2xl mbe-2')} />
        <Typography
          variant='caption'
          className='text-center truncate w-full'
          sx={{
            fontSize: '0.7rem',
            color: isSelected ? 'primary.main' : 'text.secondary'
          }}
        >
          {iconName.replace('ri-', '').replace('-line', '')}
        </Typography>
      </Box>
    )
  }
)

IconItem.displayName = 'IconItem'

const IconPickerDialog = ({ open, onClose, onSelect, selectedIcon }: IconPickerDialogProps) => {
  const theme = useTheme()
  const [searchValue, setSearchValue] = useState('')
  const [iconList, setIconList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(ICONS_PER_PAGE)

  /**
   * 加载图标列表
   */
  useEffect(() => {
    if (open && iconList.length === 0) {
      setLoading(true)
      loadRemixIcons()
        .then(icons => {
          setIconList(icons)
        })
        .catch(error => {
          console.error('加载图标失败:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, iconList.length])

  /**
   * 当 Dialog 关闭时，清空搜索值和重置显示数量
   */
  useEffect(() => {
    if (!open) {
      setSearchValue('')
      setHoveredIcon(null)
      setDisplayCount(ICONS_PER_PAGE)
    }
  }, [open])

  /**
   * 当搜索值变化时，重置显示数量
   */
  useEffect(() => {
    setDisplayCount(ICONS_PER_PAGE)
  }, [searchValue])

  /**
   * 过滤图标列表
   */
  const filteredIcons = useMemo(() => {
    if (!searchValue.trim()) {
      return iconList
    }
    const searchLower = searchValue.toLowerCase()
    return iconList.filter(icon => icon.toLowerCase().includes(searchLower))
  }, [iconList, searchValue])

  /**
   * 当前显示的图标列表（分页）
   */
  const displayedIcons = useMemo(() => {
    return filteredIcons.slice(0, displayCount)
  }, [filteredIcons, displayCount])

  /**
   * 是否还有更多图标
   */
  const hasMore = filteredIcons.length > displayCount

  /**
   * 加载更多图标
   */
  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + ICONS_PER_PAGE)
  }, [])

  /**
   * 处理图标选择
   */
  const handleIconSelect = useCallback(
    (iconName: string) => {
      onSelect(iconName)
      // 不在这里调用 onClose，让父组件在 onSelect 回调中处理关闭
    },
    [onSelect]
  )

  /**
   * 处理关闭
   */
  const handleClose = (event?: {}, reason?: string) => {
    // 关闭时清空搜索值
    setSearchValue('')
    onClose()
  }

  // 如果 Dialog 未打开，不渲染任何内容，确保完全卸载
  if (!open) {
    return null
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      open={open}
      onClose={handleClose}
      closeAfterTransition={false}
      disableEscapeKeyDown={false}
      disableRestoreFocus={true}
    >
      <DialogTitle className='flex items-center justify-between'>
        选择图标
        <IconButton size='small' onClick={handleClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* 搜索框 */}
        <TextField
          fullWidth
          placeholder='搜索图标...'
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className='mbe-4'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search size={20} />
              </InputAdornment>
            ),
            endAdornment: searchValue ? (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={() => setSearchValue('')}>
                  <X size={16} />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />

        {/* 图标列表 */}
        {loading ? (
          <Box className='flex items-center justify-center p-8'>
            <Typography color='text.secondary'>加载中...</Typography>
          </Box>
        ) : filteredIcons.length === 0 ? (
          <Box className='flex items-center justify-center p-8'>
            <Typography color='text.secondary'>{searchValue ? '未找到匹配的图标' : '暂无图标'}</Typography>
          </Box>
        ) : (
          <>
            <Box
              className='grid gap-2'
              sx={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: theme.spacing(1)
              }}
            >
              {displayedIcons.map(iconName => (
                <IconItem
                  key={iconName}
                  iconName={iconName}
                  isSelected={iconName === selectedIcon}
                  isHovered={iconName === hoveredIcon}
                  onSelect={handleIconSelect}
                  onHover={setHoveredIcon}
                />
              ))}
            </Box>
            {hasMore && (
              <Box className='flex justify-center mts-4'>
                <Button variant='outlined' onClick={loadMore} size='small'>
                  加载更多 ({filteredIcons.length - displayCount} 个剩余)
                </Button>
              </Box>
            )}
          </>
        )}

        {/* 显示统计信息 */}
        {!loading && filteredIcons.length > 0 && (
          <Typography variant='caption' color='text.secondary' className='mts-2'>
            共找到 {filteredIcons.length} 个图标
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
      </DialogActions>
    </Dialog>
  )
}

export default IconPickerDialog
