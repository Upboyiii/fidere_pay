"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  TablePagination,
  Checkbox,
  CircularProgress,
  Autocomplete,
} from "@mui/material"

// API Imports
import {
  getOtcRateList,
  createOtcRate,
  updateOtcRate,
  deleteOtcRate,
  type OtcRateItem,
  type CreateOtcRateRequest,
  type UpdateOtcRateRequest,
} from "@server/otcRate"
import {
  memberSearch,
  type MemberSearchItem,
} from "@server/operationDashboard"

// Materialize Components
import OptionsMenu from '@core/components/option-menu'

// Styles
import tableStyles from '@core/styles/table.module.css'

// Toast
import { toast } from 'react-toastify'

export default function FeeCenterPage() {
  const [searchUserId, setSearchUserId] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFeeRate, setSelectedFeeRate] = useState<OtcRateItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  
  // 分页状态
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  
  // 列表数据
  const [feeRateList, setFeeRateList] = useState<OtcRateItem[]>([])
  
  // 表单状态
  const [formUserId, setFormUserId] = useState<number | "">("")
  const [formFaitToCoin, setFormFaitToCoin] = useState("")
  const [formCoinToFait, setFormCoinToFait] = useState("")
  
  // 客户搜索相关状态（新增弹窗）
  const [customerSearchOptions, setCustomerSearchOptions] = useState<MemberSearchItem[]>([])
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
  const [customerSearchInput, setCustomerSearchInput] = useState("")
  const customerSearchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSelectingCustomerRef = useRef(false)

  // 加载费率列表
  const loadFeeRateList = useCallback(async () => {
    setLoading(true)
    try {
      const params: {
        pageNum?: number
        pageSize?: number
        userId?: number
        email?: string
      } = {
        pageNum: page + 1,
        pageSize: rowsPerPage,
      }
      
      if (searchUserId) {
        const userId = Number(searchUserId)
        if (!isNaN(userId)) {
          params.userId = userId
        }
      }
      
      if (searchEmail) {
        params.email = searchEmail
      }
      
      const response = await getOtcRateList(params)
      const data = response.data as any
      
      setFeeRateList(data?.list || [])
      setTotal(data?.total || 0)
    } catch (error) {
      console.error('加载费率列表失败:', error)
      toast.error('加载费率列表失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, searchUserId, searchEmail])

  // 初始加载和搜索条件变化时重新加载
  useEffect(() => {
    loadFeeRateList()
  }, [loadFeeRateList])

  // 客户搜索函数（带防抖）
  const handleCustomerSearch = async (email: string) => {
    if (!email || email.trim().length === 0) {
      setCustomerSearchOptions([])
      return
    }

    try {
      setCustomerSearchLoading(true)
      const response = await memberSearch({ email: email.trim(), limit: 50 })
      const actualData = response.data as any
      const memberList = actualData?.list || []
      setCustomerSearchOptions(memberList)
    } catch (error) {
      console.error('客户搜索失败:', error)
      setCustomerSearchOptions([])
    } finally {
      setCustomerSearchLoading(false)
    }
  }

  // 处理客户搜索输入变化（防抖）
  const handleCustomerSearchInputChange = (value: string, reason: string) => {
    // 如果正在选择客户（onChange触发），不触发搜索
    if (isSelectingCustomerRef.current) {
      isSelectingCustomerRef.current = false
      setCustomerSearchInput(value)
      // 清除定时器，确保不会触发搜索
      if (customerSearchDebounceTimerRef.current) {
        clearTimeout(customerSearchDebounceTimerRef.current)
        customerSearchDebounceTimerRef.current = null
      }
      return
    }
    
    // 如果是重置、清除或失去焦点操作
    if (reason === 'reset' || reason === 'clear' || reason === 'blur') {
      setCustomerSearchInput(value)
      // 清除定时器
      if (customerSearchDebounceTimerRef.current) {
        clearTimeout(customerSearchDebounceTimerRef.current)
        customerSearchDebounceTimerRef.current = null
      }
      // 如果是清除操作，清空选项列表和表单中的客户信息
      if (reason === 'clear') {
        setCustomerSearchOptions([])
        setFormUserId("")
      }
      return
    }
    
    // 如果已经有选中的客户，且输入值匹配选中项的显示文本，不触发搜索
    if (formUserId) {
      const selectedOption = customerSearchOptions.find(opt => opt.id === formUserId)
      if (selectedOption && value === `${selectedOption.name} (${selectedOption.email})`) {
        setCustomerSearchInput(value)
        return
      }
      // 如果输入值不匹配选中项，说明用户正在输入新的搜索内容，清除选中状态
      if (selectedOption && value !== `${selectedOption.name} (${selectedOption.email})`) {
        setFormUserId("")
      }
    }
    
    setCustomerSearchInput(value)
    
    // 清除之前的定时器
    if (customerSearchDebounceTimerRef.current) {
      clearTimeout(customerSearchDebounceTimerRef.current)
    }
    
    // 如果输入为空，清空选项列表
    if (!value || value.trim().length === 0) {
      setCustomerSearchOptions([])
      customerSearchDebounceTimerRef.current = null
      return
    }
    
    // 设置新的定时器
    customerSearchDebounceTimerRef.current = setTimeout(() => {
      handleCustomerSearch(value)
    }, 300) // 300ms 防抖
  }

  // 打开新增弹窗
  const handleOpenCreate = () => {
    setFormUserId("")
    setFormFaitToCoin("")
    setFormCoinToFait("")
    setCustomerSearchInput("")
    setCustomerSearchOptions([])
    // 清除防抖定时器
    if (customerSearchDebounceTimerRef.current) {
      clearTimeout(customerSearchDebounceTimerRef.current)
      customerSearchDebounceTimerRef.current = null
    }
    // 重置选择标记
    isSelectingCustomerRef.current = false
    setCreateDialogOpen(true)
  }

  // 关闭新增弹窗
  const handleCloseCreate = () => {
    setCreateDialogOpen(false)
    setFormUserId("")
    setFormFaitToCoin("")
    setFormCoinToFait("")
    setCustomerSearchInput("")
    setCustomerSearchOptions([])
    // 清除防抖定时器
    if (customerSearchDebounceTimerRef.current) {
      clearTimeout(customerSearchDebounceTimerRef.current)
      customerSearchDebounceTimerRef.current = null
    }
    // 重置选择标记
    isSelectingCustomerRef.current = false
  }

  // 打开编辑弹窗
  const handleOpenEdit = (feeRate: OtcRateItem) => {
    setSelectedFeeRate(feeRate)
    setFormUserId(feeRate.userId)
    setFormFaitToCoin(feeRate.faitToCoin)
    setFormCoinToFait(feeRate.coinToFait)
    setEditDialogOpen(true)
  }

  // 关闭编辑弹窗
  const handleCloseEdit = () => {
    setEditDialogOpen(false)
    setSelectedFeeRate(null)
    setFormUserId("")
    setFormFaitToCoin("")
    setFormCoinToFait("")
  }

  // 打开删除确认弹窗
  const handleOpenDelete = (ids: number[]) => {
    setSelectedIds(ids)
    setDeleteDialogOpen(true)
  }

  // 关闭删除确认弹窗
  const handleCloseDelete = () => {
    setDeleteDialogOpen(false)
    setSelectedIds([])
  }

  // 保存新增费率
  const handleSaveCreate = async () => {
    if (!formUserId || !formFaitToCoin || !formCoinToFait) {
      toast.error('请填写完整信息')
      return
    }

    setLoading(true)
    try {
      const data: CreateOtcRateRequest = {
        userId: Number(formUserId),
        faitToCoin: formFaitToCoin,
        coinToFait: formCoinToFait,
      }
      
      await createOtcRate(data)
      handleCloseCreate()
      loadFeeRateList()
      toast.success('新增费率配置成功')
    } catch (error: any) {
      console.error('新增费率配置失败:', error)
      toast.error(error?.message || '新增费率配置失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 保存编辑费率
  const handleSaveEdit = async () => {
    if (!selectedFeeRate || !formUserId || !formFaitToCoin || !formCoinToFait) {
      toast.error('请填写完整信息')
      return
    }

    setLoading(true)
    try {
      const data: UpdateOtcRateRequest = {
        id: selectedFeeRate.id,
        userId: Number(formUserId),
        faitToCoin: formFaitToCoin,
        coinToFait: formCoinToFait,
      }
      
      await updateOtcRate(data)
      handleCloseEdit()
      loadFeeRateList()
      toast.success('更新费率配置成功')
    } catch (error: any) {
      console.error('更新费率配置失败:', error)
      toast.error(error?.message || '更新费率配置失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return

    setLoading(true)
    try {
      await deleteOtcRate({ ids: selectedIds })
      handleCloseDelete()
      setSelectedIds([])
      loadFeeRateList()
      toast.success('删除费率配置成功')
    } catch (error: any) {
      console.error('删除费率配置失败:', error)
      toast.error(error?.message || '删除费率配置失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 重置搜索
  const handleResetSearch = () => {
    setSearchUserId("")
    setSearchEmail("")
    setPage(0)
  }

  // 处理分页变化
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // 处理全选
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(feeRateList.map(item => item.id))
    } else {
      setSelectedIds([])
    }
  }

  // 处理单个选择
  const handleSelectOne = (id: number) => {
    const selectedIndex = selectedIds.indexOf(id)
    let newSelected: number[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedIds.slice(1))
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = newSelected.concat(selectedIds.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1)
      )
    }

    setSelectedIds(newSelected)
  }

  return (
    <Box>
      {/* Page Header */}
      <Card className='mb-6'>
        <CardHeader
          title={
            <div>
              <Typography variant='h4' className='font-medium mb-1'>
                费率中心
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                管理用户数币兑法币和法币兑数币的费率设置
              </Typography>
            </div>
          }
        />
      </Card>

      {/* Search Section */}
      <Card className='mb-6'>
        <CardContent>
          <div className='flex gap-4 items-center flex-wrap'>
            <TextField
              placeholder="搜索用户ID"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              size="small"
              className='flex-grow max-w-[300px]'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className='ri-user-line' />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="搜索用户邮箱"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              size="small"
              type="email"
              className='flex-grow max-w-[300px]'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className='ri-mail-line' />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<i className='ri-search-line' />}
              onClick={() => {
                setPage(0)
                loadFeeRateList()
              }}
            >
              搜索
            </Button>
            <Button
              variant="outlined"
              startIcon={<i className='ri-restart-line' />}
              onClick={handleResetSearch}
            >
              重置
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<i className='ri-add-line' />}
              onClick={handleOpenCreate}
            >
              新增
            </Button>
            {selectedIds.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<i className='ri-delete-bin-line' />}
                onClick={() => handleOpenDelete(selectedIds)}
              >
                删除 ({selectedIds.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Rate List */}
      <Card>
        <CardHeader 
          title='兑换费率列表'
          action={
            <OptionsMenu
              iconButtonProps={{ color: 'default' }}
              options={[
                { text: '导出Excel', icon: 'ri-file-excel-line' },
                { text: '刷新数据', icon: 'ri-refresh-line' }
              ]}
            />
          }
        />
        {loading && (
          <div className='flex justify-center items-center py-8'>
            <CircularProgress size={40} />
          </div>
        )}
        {!loading && (
          <>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>
                      <Checkbox
                        indeterminate={selectedIds.length > 0 && selectedIds.length < feeRateList.length}
                        checked={feeRateList.length > 0 && selectedIds.length === feeRateList.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>ID</th>
                    <th>用户信息</th>
                    <th className='text-center'>数币兑法币费率</th>
                    <th className='text-center'>法币兑数币费率</th>
                    <th className='text-center'>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {feeRateList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='text-center py-8'>
                        <Typography variant="body2" color="text.secondary">
                          暂无数据
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    feeRateList.map((feeRate) => (
                      <tr key={feeRate.id} className='hover:bg-actionHover'>
                        <td>
                          <Checkbox
                            checked={selectedIds.indexOf(feeRate.id) !== -1}
                            onChange={() => handleSelectOne(feeRate.id)}
                          />
                        </td>
                        <td>
                          <Typography variant="body2" className='font-mono'>
                            {feeRate.id}
                          </Typography>
                        </td>
                        <td>
                          <div>
                            <Typography variant="body2" className='font-semibold mb-1'>
                              {feeRate.nick_name || '未设置'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" className='font-mono'>
                              ID: {feeRate.userId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" className='block mt-1'>
                              {feeRate.email}
                            </Typography>
                          </div>
                        </td>
                        <td className='text-center'>
                          <Typography variant="body2" className='font-semibold text-primary'>
                            {feeRate.coinToFait}
                          </Typography>
                        </td>
                        <td className='text-center'>
                          <Typography variant="body2" className='font-semibold text-primary'>
                            {feeRate.faitToCoin}
                          </Typography>
                        </td>
                        <td className='text-center'>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEdit(feeRate)}
                          >
                            <i className='ri-edit-line' />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenDelete([feeRate.id])}
                          >
                            <i className='ri-delete-bin-line' />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="每页行数:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} 共 ${count} 条`}
            />
          </>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCloseCreate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div className='flex items-center gap-2'>
            <i className='ri-add-line text-xl' />
            <Typography variant="h6" className='font-semibold'>
              新增费率配置
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 pt-2'>
            <Autocomplete
              fullWidth
              options={customerSearchOptions}
              loading={customerSearchLoading}
              inputValue={formUserId ? (customerSearchOptions.find(opt => opt.id === formUserId) ? `${customerSearchOptions.find(opt => opt.id === formUserId)?.name} (${customerSearchOptions.find(opt => opt.id === formUserId)?.email || ''})` : customerSearchInput) : customerSearchInput}
              onInputChange={(_, newInputValue, reason) => {
                handleCustomerSearchInputChange(newInputValue, reason)
              }}
              value={formUserId ? customerSearchOptions.find(opt => opt.id === formUserId) || null : null}
              onChange={(_, newValue) => {
                // 清除搜索定时器，防止触发搜索
                if (customerSearchDebounceTimerRef.current) {
                  clearTimeout(customerSearchDebounceTimerRef.current)
                  customerSearchDebounceTimerRef.current = null
                }
                
                if (newValue) {
                  // 标记正在选择，避免触发搜索
                  isSelectingCustomerRef.current = true
                  setFormUserId(newValue.id)
                  // 选择后设置inputValue为显示文本
                  setCustomerSearchInput(`${newValue.name} (${newValue.email})`)
                } else {
                  // 清除时，重置选择标记，允许后续搜索
                  isSelectingCustomerRef.current = false
                  setFormUserId("")
                  setCustomerSearchInput("")
                  setCustomerSearchOptions([])
                }
              }}
              getOptionLabel={(option) => option ? `${option.name} (${option.email})` : ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="选择客户"
                  required
                  placeholder="输入邮箱搜索客户"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {customerSearchLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText={customerSearchInput ? "未找到匹配的客户" : "请输入邮箱搜索客户"}
              filterOptions={(x) => x} // 禁用客户端过滤，使用服务器端搜索
            />
            
            <FormControl fullWidth>
              <InputLabel htmlFor="create-fait-to-coin">法币兑换数字币费率</InputLabel>
              <OutlinedInput
                id="create-fait-to-coin"
                value={formFaitToCoin}
                onChange={(e) => setFormFaitToCoin(e.target.value)}
                label="法币兑换数字币费率"
                required
                placeholder="例如: 0.5%"
              />
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel htmlFor="create-coin-to-fait">数字币兑换法币费率</InputLabel>
              <OutlinedInput
                id="create-coin-to-fait"
                value={formCoinToFait}
                onChange={(e) => setFormCoinToFait(e.target.value)}
                label="数字币兑换法币费率"
                required
                placeholder="例如: 0.6%"
              />
            </FormControl>

            <Alert severity="info" className='mt-2'>
              新增费率配置后，将影响该用户的交易手续费计算
            </Alert>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleSaveCreate}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-save-line' />}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div className='flex items-center gap-2'>
            <i className='ri-edit-line text-xl' />
            <Typography variant="h6" className='font-semibold'>
              编辑费率设置
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          {selectedFeeRate && (
            <div className='flex flex-col gap-4 pt-2'>
              {/* 用户信息展示 */}
              <Card className='bg-actionHover'>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" className='mb-2'>
                    用户信息
                  </Typography>
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">
                        用户ID:
                      </Typography>
                      <Typography variant="body2" className='font-mono font-semibold'>
                        {selectedFeeRate.userId}
                      </Typography>
                    </div>
                    <div className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">
                        用户邮箱:
                      </Typography>
                      <Typography variant="body2" className='font-semibold'>
                        {selectedFeeRate.email}
                      </Typography>
                    </div>
                    <div className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">
                        用户昵称:
                      </Typography>
                      <Typography variant="body2">
                        {selectedFeeRate.nick_name || '未设置'}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Divider />

              {/* 编辑表单 */}
              <div>
                <Typography variant="subtitle2" className='mb-3'>
                  费率设置
                </Typography>
                <div className='flex flex-col gap-4'>
                  {/* <FormControl fullWidth>
                    <InputLabel htmlFor="edit-user-id">客户ID</InputLabel>
                    <OutlinedInput
                      id="edit-user-id"
                      value={formUserId}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || /^\d+$/.test(value)) {
                          setFormUserId(value ? Number(value) : "")
                        }
                      }}
                      label="客户ID"
                      required
                    />
                  </FormControl> */}
                  
                  <FormControl fullWidth>
                    <InputLabel htmlFor="edit-fait-to-coin">法币兑换数字币费率</InputLabel>
                    <OutlinedInput
                      id="edit-fait-to-coin"
                      value={formFaitToCoin}
                      onChange={(e) => setFormFaitToCoin(e.target.value)}
                      label="法币兑换数字币费率"
                      required
                      placeholder="例如: 0.5%"
                    />
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel htmlFor="edit-coin-to-fait">数字币兑换法币费率</InputLabel>
                    <OutlinedInput
                      id="edit-coin-to-fait"
                      value={formCoinToFait}
                      onChange={(e) => setFormCoinToFait(e.target.value)}
                      label="数字币兑换法币费率"
                      required
                      placeholder="例如: 0.6%"
                    />
                  </FormControl>
                </div>
              </div>

              <Alert severity="info" className='mt-2'>
                修改费率设置后，将影响该用户的交易手续费计算
              </Alert>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-save-line' />}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <div className='flex items-center gap-2'>
            <i className='ri-delete-bin-line text-xl text-error' />
            <Typography variant="h6" className='font-semibold'>
              确认删除
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" className='mb-4'>
            此操作将永久删除选中的费率配置，且无法恢复
          </Alert>
          <Typography variant="body2" color="text.secondary">
            确定要删除 {selectedIds.length} 条费率配置吗？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-delete-bin-line' />}
          >
            {loading ? '删除中...' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
