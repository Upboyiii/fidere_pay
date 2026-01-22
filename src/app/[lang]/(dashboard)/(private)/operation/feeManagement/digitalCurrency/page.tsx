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
  Avatar,
  TablePagination,
  CircularProgress,
} from "@mui/material"

// Materialize Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Styles
import tableStyles from '@core/styles/table.module.css'

// Toast
import { toast } from 'react-toastify'

// API Imports
import {
  getCoinFeeManageList,
  editCoinFeeManage,
  type CoinFeeManageItem,
  type CoinFeeManageListParams,
  type CoinFeeManageEditRequest
} from '@server/operationDashboard'

export default function DigitalCurrencyFeeManagementPage() {
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CoinFeeManageItem | null>(null)
  
  // 搜索状态
  const [searchCoinName, setSearchCoinName] = useState("")
  
  // 分页状态
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  
  // 列表数据
  const [feeList, setFeeList] = useState<CoinFeeManageItem[]>([])
  
  // 表单状态
  const [formFee, setFormFee] = useState("")
  const [formFeeCoinKey, setFormFeeCoinKey] = useState("")
  const [formFeeUnit, setFormFeeUnit] = useState("")
  const [formFeeDecimal, setFormFeeDecimal] = useState(0)
  
  // 提取错误信息的辅助函数
  const getErrorMessage = (error: any): string => {
    if (error?.message) {
      return error.message
    }
    if (error?.data?.message) {
      return error.data.message
    }
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    if (typeof error === 'string') {
      return error
    }
    return '操作失败'
  }

  // 加载列表数据
  const loadFeeList = useCallback(async () => {
    setLoading(true)
    try {
      const params: CoinFeeManageListParams = {
        pageSize: rowsPerPage,
        currentPage: page + 1, // API 使用 1 开始的页码
      }
      
      if (searchCoinName) {
        params.coinName = searchCoinName
      }
      
      const response = await getCoinFeeManageList(params)
      
      if (response?.data) {
        setFeeList(response.data.list || [])
        setTotal(response.data.total || 0)
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
      console.error('加载数字币手续费列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, searchCoinName])
  
  useEffect(() => {
    loadFeeList()
  }, [loadFeeList])
  
  // 打开编辑对话框
  const handleEdit = (item: CoinFeeManageItem) => {
    setSelectedItem(item)
    setFormFee(item.fee || "")
    setFormFeeCoinKey(item.feeCoinKey || "")
    setFormFeeUnit(item.feeUnit || "")
    setFormFeeDecimal(item.feeDecimal || 0)
    setEditDialogOpen(true)
  }
  
  // 保存修改
  const handleSave = async () => {
    if (!selectedItem) return
    
    try {
      const editData: CoinFeeManageEditRequest = {
        id: selectedItem.id,
        fee: formFee || undefined,
        feecoinkey: formFeeCoinKey || undefined,
        feeunit: formFeeUnit || undefined,
        feedecimal: formFeeDecimal || undefined,
      }
      
      await editCoinFeeManage(editData)
      
      toast.success('修改成功')
      setEditDialogOpen(false)
      loadFeeList()
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
      console.error('修改数字币手续费失败:', error)
    }
  }
  
  // 重置搜索
  const handleReset = () => {
    setSearchCoinName("")
  }
  
  return (
    <Box>
      <Card>
        <CardHeader title="数字币手续费管理" />
        <CardContent>
          {/* 搜索区域 */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="币种名称"
              placeholder="币种名称"
              value={searchCoinName}
              onChange={(e) => setSearchCoinName(e.target.value)}
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
                  <TableCell>币种全称</TableCell>
                  <TableCell>币种简称</TableCell>
                  <TableCell>币种单位</TableCell>
                  <TableCell>手续费</TableCell>
                  <TableCell>手续费币种</TableCell>
                  <TableCell>手续费单位</TableCell>
                  <TableCell>区块链</TableCell>
                  <TableCell>区块链网络</TableCell>
                  <TableCell>区块链类型</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : feeList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  feeList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          {item.logoUrl ? (
                            <Avatar src={item.logoUrl} sx={{ width: 32, height: 32 }} />
                          ) : (
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {item.coinName?.charAt(0) || item.coinKey?.charAt(0) || ''}
                            </Avatar>
                          )}
                        </TableCell>
                        <TableCell>{item.coinKey}</TableCell>
                        <TableCell>{item.coinFullName}</TableCell>
                        <TableCell>{item.coinName}</TableCell>
                        <TableCell>{item.symbol}</TableCell>
                        <TableCell>{item.fee}</TableCell>
                        <TableCell>{item.feeCoinKey}</TableCell>
                        <TableCell>{item.feeUnit}</TableCell>
                        <TableCell>{item.blockChain}</TableCell>
                        <TableCell>{item.network}</TableCell>
                        <TableCell>{item.blockchainType}</TableCell>
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
            {/* 币种Key - 不可编辑 */}
            <TextField
              label="币种Key"
              value={selectedItem?.coinKey || ""}
              disabled
              fullWidth
            />
            {/* 币种简称 - 不可编辑 */}
            <TextField
              label="币种简称"
              value={selectedItem?.coinName || ""}
              disabled
              fullWidth
            />
            {/* 手续费币种 - 可编辑 */}
            <TextField
              label="手续费币种"
              value={formFeeCoinKey}
              onChange={(e) => setFormFeeCoinKey(e.target.value)}
              fullWidth
            />
            {/* 手续费精度 - 可编辑 */}
            <TextField
              label="手续费精度"
              type="number"
              value={formFeeDecimal}
              onChange={(e) => setFormFeeDecimal(parseInt(e.target.value) || 0)}
              fullWidth
              inputProps={{ min: 0 }}
            />
            {/* 币种全称 - 不可编辑 */}
            <TextField
              label="币种全称"
              value={selectedItem?.coinFullName || ""}
              disabled
              fullWidth
            />
            {/* 手续费 - 可编辑 */}
            <TextField
              label="手续费"
              type="number"
              value={formFee}
              onChange={(e) => setFormFee(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
            {/* 手续费单位 - 可编辑 */}
            <TextField
              label="手续费单位"
              value={formFeeUnit}
              onChange={(e) => setFormFeeUnit(e.target.value)}
              fullWidth
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
