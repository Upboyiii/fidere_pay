"use client"

import React, { useState } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Snackbar,
  InputAdornment,
  Stack,
  useTheme,
  CircularProgress,
  Autocomplete,
  Avatar,
} from "@mui/material"

// 使用 Remix Icons
const CloseIcon = () => <i className="ri-close-line" />
const AttachFileIcon = () => <i className="ri-attachment-line" />
const AddIcon = () => <i className="ri-add-line" />
const RemoveIcon = () => <i className="ri-subtract-line" />

interface MemberSearchItem {
  id: number
  name: string
  email: string
}

interface ManualTransactionDrawersProps {
  // 抽屉状态
  manualDepositOpen: boolean
  manualWithdrawalOpen: boolean
  setManualDepositOpen: (open: boolean) => void
  setManualWithdrawalOpen: (open: boolean) => void
  
  // 表单数据
  depositForm: {
    customer: string
    customerId: number | null
    customerName: string
    customerEmail: string
    currency: string
    amount: string
    referenceNumber: string
    notes: string
    attachment: File | null
    voucherUrl: string
  }
  withdrawalForm: {
    customer: string
    customerId: number | null
    customerName: string
    customerEmail: string
    currency: string
    amount: string
    referenceNumber: string
    notes: string
    attachment: File | null
    voucherUrl: string
  }
  
  // 表单更新函数
  setDepositForm: (form: any) => void
  setWithdrawalForm: (form: any) => void
  
  // 提交处理函数
  onDepositSubmit: () => Promise<void>
  onWithdrawalSubmit: () => Promise<void>
  
  // 文件上传
  uploadingDepositVoucher: boolean
  uploadingWithdrawalVoucher: boolean
  onDepositVoucherUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onWithdrawalVoucherUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  
  // 客户搜索相关（手动入金）
  depositCustomerSearchOptions: MemberSearchItem[]
  depositCustomerSearchLoading: boolean
  depositCustomerSearchInput: string
  onDepositCustomerSearchInputChange: (value: string, reason: string) => void
  onDepositCustomerChange: (customer: MemberSearchItem | null) => void
  
  // 客户搜索相关（手动出金）
  withdrawalCustomerSearchOptions: MemberSearchItem[]
  withdrawalCustomerSearchLoading: boolean
  withdrawalCustomerSearchInput: string
  onWithdrawalCustomerSearchInputChange: (value: string, reason: string) => void
  onWithdrawalCustomerChange: (customer: MemberSearchItem | null) => void
  
  // 币种列表相关（手动入金）
  depositCurrencyOptions: Array<{coinKey: string, coinName?: string}>
  depositCurrencyLoading: boolean
  
  // 币种列表相关（手动出金）
  withdrawalCurrencyOptions: Array<{coinKey: string, coinName?: string}>
  withdrawalCurrencyLoading: boolean
}

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  action: "deposit" | "withdrawal" | null
  depositForm?: any
  withdrawalForm?: any
}

interface SnackbarState {
  open: boolean
  message: string
  severity: "success" | "error"
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  action,
  depositForm,
  withdrawalForm
}) => {
  const theme = useTheme()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
        {action === "deposit" ? "确认手动入金" : "确认手动出金"}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Alert
          severity={action === "deposit" ? "info" : "warning"}
          sx={{ mb: 3 }}
        >
          {action === "deposit"
            ? "此操作将直接增加客户数字资产余额，请确认信息无误后继续。"
            : "此操作将直接扣减客户数字资产余额，请确认信息无误后继续。"}
        </Alert>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              客户
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {action === "deposit" 
                ? (depositForm?.customerName ? `${depositForm.customerName} (${depositForm.customerEmail})` : depositForm?.customer)
                : (withdrawalForm?.customerName ? `${withdrawalForm.customerName} (${withdrawalForm.customerEmail})` : withdrawalForm?.customer)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              币种/数量
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
              {action === "deposit" 
                ? `${depositForm?.currency} ${depositForm?.amount}`
                : `${withdrawalForm?.currency} ${withdrawalForm?.amount}`}
            </Typography>
          </Box>
          {((action === "deposit" && depositForm?.notes) || (action === "withdrawal" && withdrawalForm?.notes)) && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                备注说明
              </Typography>
              <Typography variant="body1">
                {action === "deposit" ? depositForm?.notes : withdrawalForm?.notes}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          取消
        </Button>
        <Button
          variant="contained"
          color={action === "deposit" ? "success" : "error"}
          onClick={onConfirm}
          sx={{
            bgcolor: action === "deposit" ? theme.palette.success.main : theme.palette.error.main,
            '&:hover': {
              bgcolor: action === "deposit" ? theme.palette.success.dark : theme.palette.error.dark
            }
          }}
        >
          确认{action === "deposit" ? "入金" : "出金"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function ManualTransactionDrawers({
  manualDepositOpen,
  manualWithdrawalOpen,
  setManualDepositOpen,
  setManualWithdrawalOpen,
  depositForm,
  withdrawalForm,
  setDepositForm,
  setWithdrawalForm,
  onDepositSubmit,
  onWithdrawalSubmit,
  uploadingDepositVoucher,
  uploadingWithdrawalVoucher,
  onDepositVoucherUpload,
  onWithdrawalVoucherUpload,
  depositCustomerSearchOptions,
  depositCustomerSearchLoading,
  depositCustomerSearchInput,
  onDepositCustomerSearchInputChange,
  onDepositCustomerChange,
  withdrawalCustomerSearchOptions,
  withdrawalCustomerSearchLoading,
  withdrawalCustomerSearchInput,
  onWithdrawalCustomerSearchInputChange,
  onWithdrawalCustomerChange,
  depositCurrencyOptions,
  depositCurrencyLoading,
  withdrawalCurrencyOptions,
  withdrawalCurrencyLoading,
}: ManualTransactionDrawersProps) {
  const theme = useTheme()
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"deposit" | "withdrawal" | null>(null)
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: "", severity: "success" })

  const handleDepositSubmit = () => {
    setConfirmAction("deposit")
    setConfirmDialogOpen(true)
  }

  const handleWithdrawalSubmit = () => {
    setConfirmAction("withdrawal")
    setConfirmDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (confirmAction === "deposit") {
      try {
        await onDepositSubmit()
        // 成功消息和关闭操作在 onDepositSubmit 中处理
      } catch (error) {
        // 错误处理在 onDepositSubmit 中处理
      }
    } else if (confirmAction === "withdrawal") {
      try {
        await onWithdrawalSubmit()
        // 成功消息和关闭操作在 onWithdrawalSubmit 中处理
      } catch (error) {
        // 错误处理在 onWithdrawalSubmit 中处理
      }
    }
    setConfirmAction(null)
    setConfirmDialogOpen(false)
  }

  return (
    <>
      {/* Manual Deposit Drawer */}
      <Drawer anchor="right" open={manualDepositOpen} onClose={() => setManualDepositOpen(false)}>
        <Box sx={{ width: 560, p: 5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              手动入金
            </Typography>
            <IconButton onClick={() => setManualDepositOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Alert severity="info" sx={{ mb: 5 }}>
            手动入金将直接增加客户数字资产余额，请谨慎操作并确保信息准确。
          </Alert>

          <Stack spacing={0} data-vertical="true">
            <Autocomplete
              fullWidth
              options={depositCustomerSearchOptions}
              loading={depositCustomerSearchLoading}
              inputValue={depositForm.customerId ? (depositCustomerSearchOptions.find(opt => opt.id === depositForm.customerId) ? `${depositForm.customerName} (${depositCustomerSearchOptions.find(opt => opt.id === depositForm.customerId)?.email || depositForm.customerEmail || ''})` : depositForm.customerEmail ? `${depositForm.customerName} (${depositForm.customerEmail})` : depositCustomerSearchInput) : depositCustomerSearchInput}
              onInputChange={(_, newInputValue, reason) => {
                // 如果是选择操作（reason === 'reset'），不触发搜索
                if (reason === 'reset') {
                  return
                }
                onDepositCustomerSearchInputChange(newInputValue, reason)
              }}
              value={depositForm.customerId ? depositCustomerSearchOptions.find(opt => opt.id === depositForm.customerId) || (depositForm.customerEmail ? { id: depositForm.customerId!, name: depositForm.customerName, email: depositForm.customerEmail } : null) : null}
              onChange={(_, newValue) => {
                onDepositCustomerChange(newValue)
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
                        {depositCustomerSearchLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                      }}
                    >
                      {option.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              noOptionsText={depositCustomerSearchInput ? "未找到匹配的客户" : "请输入邮箱搜索客户"}
              filterOptions={(x) => x} // 禁用客户端过滤，使用服务器端搜索
              sx={{ '& .MuiInputBase-root': { minHeight: 64, height: 64 } }}
            />

            <FormControl fullWidth required>
              <InputLabel>币种</InputLabel>
              <Select
                value={depositForm.currency}
                label="币种"
                onChange={(e) => setDepositForm({ ...depositForm, currency: e.target.value })}
                disabled={depositCurrencyLoading || depositCurrencyOptions.length === 0}
                sx={{ minHeight: 64, height: 64 }}
              >
                {depositCurrencyLoading ? (
                  <MenuItem disabled>加载中...</MenuItem>
                ) : depositCurrencyOptions.length === 0 ? (
                  <MenuItem disabled>请先选择客户</MenuItem>
                ) : (
                  depositCurrencyOptions.map((coin) => (
                    <MenuItem key={coin.coinKey} value={coin.coinKey}>
                      {coin.coinKey} {coin.coinName ? `- ${coin.coinName}` : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="入金数量"
              type="number"
              value={depositForm.amount}
              onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
              helperText="请输入正确的数字资产数量"
              sx={{ '& .MuiInputBase-root': { minHeight: 64, height: 64 } }}
            />

            {/* <TextField
              fullWidth
              label="参考号"
              value={depositForm.referenceNumber}
              onChange={(e) => setDepositForm({ ...depositForm, referenceNumber: e.target.value })}
              placeholder="例如：TXN20240115001"
              sx={{ '& .MuiInputBase-root': { minHeight: 64, height: 64 } }}
            /> */}

            <TextField
              fullWidth
              required
              label="备注说明"
              multiline
              rows={4}
              value={depositForm.notes}
              onChange={(e) => setDepositForm({ ...depositForm, notes: e.target.value })}
              placeholder="请详细说明入金原因和来源"
              helperText="必填项，用于审计追踪"
            />

            <Box>
              <Button 
                variant="outlined" 
                component="label" 
                startIcon={uploadingDepositVoucher ? <CircularProgress size={20} /> : <AttachFileIcon />} 
                fullWidth 
                sx={{ height: 64, py: 2 }}
                disabled={uploadingDepositVoucher}
              >
                {uploadingDepositVoucher ? "上传中..." : (depositForm.attachment ? "重新上传凭证" : "上传凭证（可选）")}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={onDepositVoucherUpload}
                  disabled={uploadingDepositVoucher}
                />
              </Button>
              {depositForm.attachment && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: "block" }}>
                  ✓ 已上传: {depositForm.attachment.name}
                </Typography>
              )}
            </Box>
          </Stack>

          <Box sx={{ mt: 6, display: "flex", gap: 4 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setManualDepositOpen(false)}
              sx={{ height: 52 }}
            >
              取消
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              fullWidth 
              onClick={handleDepositSubmit}
              sx={{
                height: 52,
                bgcolor: theme.palette.success.main,
                '&:hover': {
                  bgcolor: theme.palette.success.dark
                }
              }}
            >
              确认入金
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Manual Withdrawal Drawer */}
      <Drawer anchor="right" open={manualWithdrawalOpen} onClose={() => setManualWithdrawalOpen(false)}>
        <Box sx={{ width: 560, p: 5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              手动出金
            </Typography>
            <IconButton onClick={() => setManualWithdrawalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Alert severity="warning" sx={{ mb: 5 }}>
            手动出金将直接扣减客户数字资产余额，请谨慎操作并确保客户有足够余额。
          </Alert>

          <Stack spacing={0} data-vertical="true">
            <Autocomplete
              fullWidth
              options={withdrawalCustomerSearchOptions}
              loading={withdrawalCustomerSearchLoading}
              inputValue={withdrawalForm.customerId ? (withdrawalCustomerSearchOptions.find(opt => opt.id === withdrawalForm.customerId) ? `${withdrawalForm.customerName} (${withdrawalCustomerSearchOptions.find(opt => opt.id === withdrawalForm.customerId)?.email || withdrawalForm.customerEmail || ''})` : withdrawalForm.customerEmail ? `${withdrawalForm.customerName} (${withdrawalForm.customerEmail})` : withdrawalCustomerSearchInput) : withdrawalCustomerSearchInput}
              onInputChange={(_, newInputValue, reason) => {
                // 如果是选择操作（reason === 'reset'），不触发搜索
                if (reason === 'reset') {
                  return
                }
                onWithdrawalCustomerSearchInputChange(newInputValue, reason)
              }}
              value={withdrawalForm.customerId ? withdrawalCustomerSearchOptions.find(opt => opt.id === withdrawalForm.customerId) || (withdrawalForm.customerEmail ? { id: withdrawalForm.customerId!, name: withdrawalForm.customerName, email: withdrawalForm.customerEmail } : null) : null}
              onChange={(_, newValue) => {
                onWithdrawalCustomerChange(newValue)
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
                        {withdrawalCustomerSearchLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                      }}
                    >
                      {option.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              noOptionsText={withdrawalCustomerSearchInput ? "未找到匹配的客户" : "请输入邮箱搜索客户"}
              filterOptions={(x) => x} // 禁用客户端过滤，使用服务器端搜索
              sx={{ '& .MuiInputBase-root': { minHeight: 64, height: 64 } }}
            />

            <FormControl fullWidth required>
              <InputLabel>币种</InputLabel>
              <Select
                value={withdrawalForm.currency}
                label="币种"
                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, currency: e.target.value })}
                disabled={withdrawalCurrencyLoading || withdrawalCurrencyOptions.length === 0}
                sx={{ minHeight: 64, height: 64 }}
              >
                {withdrawalCurrencyLoading ? (
                  <MenuItem disabled>加载中...</MenuItem>
                ) : withdrawalCurrencyOptions.length === 0 ? (
                  <MenuItem disabled>请先选择客户</MenuItem>
                ) : (
                  withdrawalCurrencyOptions.map((coin) => (
                    <MenuItem key={coin.coinKey} value={coin.coinKey}>
                      {coin.coinKey} {coin.coinName ? `- ${coin.coinName}` : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="出金数量"
              type="number"
              value={withdrawalForm.amount}
              onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
              helperText="请确保客户有足够余额"
              sx={{ '& .MuiInputBase-root': { minHeight: 64, height: 64 } }}
            />

            {/* <TextField
              fullWidth
              label="参考号"
              value={withdrawalForm.referenceNumber}
              onChange={(e) => setWithdrawalForm({ ...withdrawalForm, referenceNumber: e.target.value })}
              placeholder="例如：WD20240115001"
              sx={{ '& .MuiInputBase-root': { minHeight: 64, height: 64 } }}
            /> */}

            <TextField
              fullWidth
              required
              label="备注说明"
              multiline
              rows={4}
              value={withdrawalForm.notes}
              onChange={(e) => setWithdrawalForm({ ...withdrawalForm, notes: e.target.value })}
              placeholder="请详细说明出金原因和用途"
              helperText="必填项，用于审计追踪"
            />

            <Box>
              <Button 
                variant="outlined" 
                component="label" 
                startIcon={uploadingWithdrawalVoucher ? <CircularProgress size={20} /> : <AttachFileIcon />} 
                fullWidth 
                sx={{ height: 64, py: 2 }}
                disabled={uploadingWithdrawalVoucher}
              >
                {uploadingWithdrawalVoucher ? "上传中..." : (withdrawalForm.attachment ? "重新上传凭证" : "上传凭证（可选）")}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={onWithdrawalVoucherUpload}
                  disabled={uploadingWithdrawalVoucher}
                />
              </Button>
              {withdrawalForm.attachment && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: "block" }}>
                  ✓ 已上传: {withdrawalForm.attachment.name}
                </Typography>
              )}
            </Box>
          </Stack>

          <Box sx={{ mt: 6, display: "flex", gap: 4 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setManualWithdrawalOpen(false)}
              sx={{ height: 52 }}
            >
              取消
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              fullWidth 
              onClick={handleWithdrawalSubmit}
              sx={{
                height: 52,
                bgcolor: theme.palette.error.main,
                '&:hover': {
                  bgcolor: theme.palette.error.dark
                }
              }}
            >
              确认出金
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
        action={confirmAction}
        depositForm={depositForm}
        withdrawalForm={withdrawalForm}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
