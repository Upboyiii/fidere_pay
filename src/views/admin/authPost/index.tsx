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
import PostTable, { type PostData } from './components/PostTable'
import PostDialog from './components/PostDialog'
import { TableInstance } from '@/components/table'

// API Imports
import { getPostList, addPostApi, editPostApi, deletePostApi } from '@server/admin'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

/**
 * 岗位管理页面
 */
export default function AuthPost() {
  const t = useTranslate()
  // States
  const [searchParams, setSearchParams] = useState({
    postName: '',
    postCode: '',
    status: ''
  })
  const [postData, setPostData] = useState<PostData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<PostData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePost, setDeletePost] = useState<PostData | null>(null)
  const [selectedRows, setSelectedRows] = useState<PostData[]>([])
  const [btnLoading, setBtnLoading] = useState(false)
  const tableRef = useRef<TableInstance>(null)

  /**
   * 加载岗位数据
   */
  const loadPostData = async (params = {}) => {
    setLoading(true)
    setPostData([])
    try {
      const res = await getPostList({ ...searchParams, ...params })
      setPostData(res.data?.postList ?? [])
      setTotal(res.data?.total ?? 0)
    } catch (error) {
      console.error('加载岗位数据失败:', error)
      toast.error(t('admin.loadPostDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 搜索变化
   */
  const handleSearchChange = (params: typeof searchParams) => {
    setSearchParams(params)
    tableRef?.current?.resetPage?.()
    loadPostData({ pageNum: 1, pageSize: tableRef?.current?.getState()?.pagination?.pageSize, ...params })
  }

  /**
   * 新增岗位
   */
  const handleAddPost = useCallback(() => {
    setEditingPost(null)
    setDialogOpen(true)
  }, [])

  /**
   * 编辑岗位
   */
  const handleEditPost = useCallback((post: PostData) => {
    setEditingPost(post)
    setDialogOpen(true)
  }, [])

  /**
   * 删除岗位
   */
  const handleDeletePost = useCallback((post: PostData) => {
    setDeletePost(post)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除岗位
   */
  const handleConfirmDelete = async () => {
    try {
      setBtnLoading(true)
      const ids = [deletePost?.postId]
      await deletePostApi({ ids })
      setDeleteDialogOpen(false)
      setDeletePost(null)
      const currentPage = tableRef?.current?.getState()?.pagination?.pageIndex ?? 0
      const currentPageSize = tableRef?.current?.getState()?.pagination?.pageSize ?? 10
      loadPostData({
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
   * 保存岗位
   */
  const handleSavePost = async (data: Partial<PostData>) => {
    try {
      setBtnLoading(true)
      const api = data?.postId ? editPostApi : addPostApi
      await api(data)
      setDialogOpen(false)
      setEditingPost(null)
      toast.success(t('admin.operationSuccess'))
      const currentPage = tableRef?.current?.getState()?.pagination?.pageIndex ?? 0
      const currentPageSize = tableRef?.current?.getState()?.pagination?.pageSize ?? 10
      loadPostData({
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
    loadPostData({ pageNum: params?.pageNum, pageSize: params?.pageSize, ...searchParams })
  }

  // 初始化加载数据
  useEffect(() => {
    loadPostData({ pageNum: 1, pageSize: 10 })
  }, [])

  return (
    <Box className='flex flex-col gap-4'>
      <Card>
        {/* 搜索筛选栏 */}
        <SearchFilters params={searchParams} onSearchChange={handleSearchChange} onAddPost={handleAddPost} />

        {/* 岗位表格 */}
        <PostTable
          data={postData}
          loading={loading}
          total={total}
          onPageChange={handlePageChange}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          tableRef={tableRef}
        />
      </Card>

      {/* 岗位编辑对话框 */}
      <PostDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingPost(null)
        }}
        onSave={handleSavePost}
        postData={editingPost}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.confirmDeletePost')}</DialogTitle>
        <DialogContent>
          <Typography>
            {deletePost
              ? `${t('admin.confirmDeletePostMessagePrefix')} "${deletePost.postName}" ${t('admin.confirmDeletePostMessageSuffix')}`
              : t('admin.confirmDeletePostsMessage').replace('{count}', String(selectedRows.length))}
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
