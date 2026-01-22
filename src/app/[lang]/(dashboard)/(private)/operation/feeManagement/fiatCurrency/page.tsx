"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  TablePagination,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material"

// Styles
import tableStyles from '@core/styles/table.module.css'

// Toast
import { toast } from 'react-toastify'

// API Imports
import {
  getFiatFeeManageList,
  editFiatFeeManage,
  type FiatFeeManageItem,
  type FiatFeeManageListParams,
  type FiatFeeManageEditRequest
} from '@server/operationDashboard'

export default function FiatCurrencyFeeManagementPage() {
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FiatFeeManageItem | null>(null)
  
  // 搜索状态
  const [searchCurrencyKey, setSearchCurrencyKey] = useState("")
  
  // 分页状态
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  
  // 列表数据
  const [feeList, setFeeList] = useState<FiatFeeManageItem[]>([])
  
  // 表单状态
  const [formFee, setFormFee] = useState("")
  const [formIsFiatWithdrawalFee, setFormIsFiatWithdrawalFee] = useState(false)
  
  // 加载列表数据
  const loadFeeList = useCallback(async () => {
    setLoading(true)
    try {
      const params: FiatFeeManageListParams = {
        pageSize: rowsPerPage,
        currentPage: page + 1, // API 使用 1 开始的页码
      }
      
      if (searchCurrencyKey) {
        params.coinName = searchCurrencyKey
      }
      
      const response = await getFiatFeeManageList(params)
      
      if (response?.data) {
        setFeeList(response.data.list || [])
        setTotal(response.data.total || 0)
      }
    } catch (error: any) {
      // 提取错误信息
      const errorMessage = error?.message || error?.data?.message || error?.response?.data?.message || '加载数据失败'
      toast.error(errorMessage)
      console.error('加载法币手续费列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, searchCurrencyKey])
  
  useEffect(() => {
    loadFeeList()
  }, [loadFeeList])
  
  // 打开编辑对话框
  const handleEdit = (item: FiatFeeManageItem) => {
    setSelectedItem(item)
    setFormFee(item.fee)
    setFormIsFiatWithdrawalFee(item.isWithdrawFee === 1)
    setEditDialogOpen(true)
  }
  
  // 提取错误信息的辅助函数
  const getErrorMessage = (error: any): string => {
    // 如果有 message 属性，直接使用
    if (error?.message) {
      return error.message
    }
    // 如果有 data.message，使用这个
    if (error?.data?.message) {
      return error.data.message
    }
    // 如果有 response.data.message，使用这个
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    // 如果是字符串，直接返回
    if (typeof error === 'string') {
      return error
    }
    // 默认错误消息
    return '修改失败'
  }

  // 保存修改
  const handleSave = async () => {
    if (!selectedItem) return
    
    try {
      const editData: FiatFeeManageEditRequest = {
        id: selectedItem.id,
        fee: formFee,
        is_withdraw_fee: formIsFiatWithdrawalFee ? 1 : 0
      }
      
      await editFiatFeeManage(editData)
      
      toast.success('修改成功')
      setEditDialogOpen(false)
      loadFeeList()
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
      console.error('修改法币手续费失败:', error)
    }
  }
  
  // 重置搜索
  const handleReset = () => {
    setSearchCurrencyKey("")
  }
  
  return (
    <Box>
      <Card>
        <CardHeader title="法币手续费管理" />
        <CardContent>
          {/* 搜索区域 */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="币种key"
              placeholder="币种key"
              value={searchCurrencyKey}
              onChange={(e) => setSearchCurrencyKey(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              onClick={loadFeeList}
              startIcon={<i className="ri-search-line" />}
            >
              搜索
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
            >
              重置
            </Button>
          </Box>
          
          {/* 表格 */}
          <TableContainer component={Paper} className={tableStyles.table}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>编号</TableCell>
                  <TableCell>图标</TableCell>
                  <TableCell>币种Key</TableCell>
                  <TableCell>币种简称</TableCell>
                  <TableCell>币种全称</TableCell>
                  <TableCell>手续费</TableCell>
                  <TableCell>法币出金手续费</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : feeList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  feeList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {item.currencyName?.charAt(0) || item.currencyType?.charAt(0) || ''}
                          </Avatar>
                        </TableCell>
                  <TableCell>{item.currencyType}</TableCell>
                  <TableCell>{item.currencyName}</TableCell>
                  <TableCell>{item.currencyFullName}</TableCell>
                  <TableCell>{item.fee}</TableCell>
                  <TableCell>{item.isWithdrawFee === 1 ? '是' : '否'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleEdit(item)}
                            startIcon={<i className="ri-edit-line" />}
                          >
                            修改
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* 分页 */}
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            labelRowsPerPage="条/页"
            labelDisplayedRows={({ from, to, count }) => `共${count}条`}
          />
        </CardContent>
      </Card>
      
      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>修改手续费</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="币种Key"
              value={selectedItem?.currencyType || ""}
              disabled
              fullWidth
            />
            <TextField
              label="币种全称"
              value={selectedItem?.currencyFullName || ""}
              disabled
              fullWidth
            />
            <TextField
              label="币种简称"
              value={selectedItem?.currencyName || ""}
              disabled
              fullWidth
            />
            <TextField
              label="手续费"
              type="number"
              value={formFee}
              onChange={(e) => setFormFee(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formIsFiatWithdrawalFee}
                  onChange={(e) => setFormIsFiatWithdrawalFee(e.target.checked)}
                  color="primary"
                  size="medium"
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      padding: '9px',
                    },
                    '& .MuiSwitch-thumb': {
                      width: 20,
                      height: 20,
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      height: 24,
                    },
                  }}
                />
              }
              label="是否设置为法币出金手续费币种"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button onClick={handleSave} variant="contained">确定</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
