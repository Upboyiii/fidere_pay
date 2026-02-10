"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { getFiatOverview, getCustomerAssets, getTransactionFlow, getCustomerRecentTransactions, getDepositClaimList, depositClaim, batchDepositClaim, getReconciliationStats, getReconciliationList, getWithdrawApprovalList, withdrawApproval, manualDeposit, manualWithdraw, uploadSingleFile, getChannelList, getBankList, memberSearch, getBankAccountList, getOutCashFee, type FiatOverviewResponse, type CustomerAssetsResponse, type CustomerAssetItem, type TransactionFlowResponse, type TransactionFlowItem, type CustomerRecentTransactionsResponse, type DepositClaimListResponse, type DepositClaimItem, type DepositClaimRequest, type BatchDepositClaimRequest, type ReconciliationStatsResponse, type ReconciliationListResponse, type ReconciliationItem, type WithdrawApprovalListResponse, type WithdrawApprovalItem, type WithdrawApprovalRequest, type ManualDepositRequest, type ManualWithdrawRequest, type UploadImageResponse, type DictItem, type MemberSearchItem, type BankAccountItem, type BankAccountListResponse, type OutCashFeeResponse } from "@server/operationDashboard"
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Grid2 as Grid,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Badge,
  LinearProgress,
  CircularProgress,
  Divider,
  TextField,
  Select,
  MenuItem,
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
  Autocomplete,
  useTheme,
  Checkbox,
  Tooltip,
  TablePagination,
  Paper,
  Collapse,
} from "@mui/material"

// Materialize Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'
// Simple Card Stat Components (inline definitions)
const CardStatWithImage = ({ stats, title, trendNumber, trend, chipText, chipColor, ...props }: any) => (
  <Card className='bs-full'>
    <CardContent className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <Typography variant='h4' className='font-semibold'>{stats}</Typography>
        {trendNumber && (
          <Chip 
            label={chipText || trendNumber} 
            color={chipColor || (trend === 'up' ? 'success' : 'error')} 
            size='small' 
            variant='tonal'
          />
        )}
      </div>
      <Typography variant='body2' color='text.secondary'>{title}</Typography>
      {trendNumber && (
        <div className='flex items-center gap-1'>
          <i className={`ri-trending-${trend === 'up' ? 'up' : 'down'}-line text-${trend === 'up' ? 'success' : 'error'}`} />
          <Typography variant='caption' color={trend === 'up' ? 'success.main' : 'error.main'}>
            {trendNumber}
          </Typography>
        </div>
      )}
    </CardContent>
  </Card>
)

const CardStatVertical = ({ title, stats, avatarIcon, avatarColor, trendNumber, trend, ...props }: any) => (
  <Card className='bs-full'>
    <CardContent className='flex flex-col gap-3'>
      <div className='flex items-center gap-3'>
        <CustomAvatar color={avatarColor} skin='light' size={40}>
          <i className={avatarIcon} />
        </CustomAvatar>
        <div>
          <Typography variant='h5' className='font-semibold'>{stats}</Typography>
          <Typography variant='body2' color='text.secondary'>{title}</Typography>
        </div>
      </div>
      {trendNumber && (
        <div className='flex items-center gap-1'>
          <i className={`ri-trending-${trend === 'up' ? 'up' : 'down'}-line text-${trend === 'up' ? 'success' : 'error'}`} />
          <Typography variant='caption' color={trend === 'up' ? 'success.main' : 'error.main'}>
            {trendNumber}
          </Typography>
        </div>
      )}
    </CardContent>
  </Card>
)

// Styles
import tableStyles from '@core/styles/table.module.css'
import classnames from 'classnames'
// 使用 Remix Icons 替代 MUI Icons
const TrendingUpIcon = () => <i className="ri-trending-up-line" />
const TrendingDownIcon = () => <i className="ri-trending-down-line" />
const AccountBalanceIcon = () => <i className="ri-bank-line" />
const WarningIcon = () => <i className="ri-error-warning-line" />
const InfoIcon = () => <i className="ri-information-line" />
const CancelIcon = () => <i className="ri-close-circle-line" />
const ArrowUpwardIcon = () => <i className="ri-arrow-up-line" />
const ArrowDownwardIcon = () => <i className="ri-arrow-down-line" />
const SwapHorizIcon = () => <i className="ri-exchange-line" />
const UploadIcon = () => <i className="ri-upload-line" />
const CloseIcon = () => <i className="ri-close-line" />
const AttachFileIcon = () => <i className="ri-attachment-line" />
const AddIcon = () => <i className="ri-add-line" />
const RemoveIcon = () => <i className="ri-subtract-line" />
const CalendarTodayIcon = () => <i className="ri-calendar-line" />
const SearchIcon = () => <i className="ri-search-line" />
const FileDownloadIcon = () => <i className="ri-download-line" />
const RefreshIcon = () => <i className="ri-refresh-line" />
const ContentCopyIcon = () => <i className="ri-file-copy-line" />
const CheckCircleIcon = () => <i className="ri-check-circle-line" />
const UploadFileIcon = () => <i className="ri-upload-2-line" />
const DescriptionIcon = () => <i className="ri-file-text-line" />
const ReceiptIcon = () => <i className="ri-receipt-line" />
const PrintIcon = () => <i className="ri-printer-line" />
const DownloadIcon = () => <i className="ri-download-2-line" />
const KeyboardArrowUpIcon = () => <i className="ri-arrow-up-s-line" />
const KeyboardArrowDownIcon = () => <i className="ri-arrow-down-s-line" />
const BusinessIcon = () => <i className="ri-building-line" />
const AddCircleOutlineIcon = () => <i className="ri-add-circle-line" />
const RemoveCircleOutlineIcon = () => <i className="ri-subtract-line" />
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"

type TabValue = "overview" | "customer-assets" | "transactions" | "deposits" | "withdrawals" | "reconciliation"

const TAB_VALUES = ["overview", "customer-assets", "transactions", "deposits", "withdrawals", "reconciliation"]

// Mock data types
interface MetricCard {
  label: string
  value: string
  change?: string
  trend?: "up" | "down"
}

interface TodoItem {
  title: string
  count: number
  color: "error" | "warning" | "info" | "success"
}

interface CustomerAsset {
  userId: number          // 用户ID（用于查询最近交易）
  customerId: string
  customerName: string
  customerEmail?: string   // 客户邮箱
  currency: string
  available: number
  frozen: number
  inTransit: number
  lastReconciliation: string
  deposit7Days?: number  // 近7天入金
  withdrawal7Days?: number  // 近7天出金
}

interface Transaction {
  id: string
  time: string | number  // 支持字符串和时间戳
  customer: string
  email?: string  // 客户邮箱
  userId?: number  // 用户ID
  accountId: string
  currency: string
  amount: number
  direction: "in" | "out"
  channel: string
  counterparty: string
  reference: string
  status: "completed" | "pending" | "failed" | string | number
  statusTag?: string  // 状态标签（用于显示和颜色判断）
  statusLabel?: string  // 状态标签（从接口返回的 statusLabel）
  hasAttachment: boolean
}

interface DepositClaim {
  id: string
  depositTime: string
  currency: string
  amount: number
  payer: string
  channel: string
  reference: string
  notes: string
  matchResult: "matched" | "unmatched" | "partial"
  status: "pending" | "deposited" | "rejected"
}

interface WithdrawalApproval {
  id: string
  applicationTime: string
  customer: string
  currency: string
  amount: number
  payee: string
  purpose: string
  status: "submitted" | "approved" | "paid" | "settled" | "failed" | "rejected"
}

// Mock data types for drawers
interface DepositItem {
  id: string
  depositTime: string
  currency: string
  amount: number
  payer: string
  channel: string
  reference: string
  notes: string
}

interface WithdrawalItem {
  id: string
  applicationTime: string
  customer: string
  currency: string
  amount: number
  payee: string
  purpose: string
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
  // 默认返回未知错误
  return '操作失败，请重试'
}

// 复制文本到剪贴板的辅助函数
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) {
    return false
  }

  try {
    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案：使用 document.execCommand
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        return successful
      } catch (err) {
        document.body.removeChild(textArea)
        return false
      }
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

export default function FiatAssetsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("overview")
  const theme = useTheme()
  const [claimDrawerOpen, setClaimDrawerOpen] = useState(false)
  const [approvalDrawerOpen, setApprovalDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DepositItem | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalItem | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [manualDepositOpen, setManualDepositOpen] = useState(false)
  const [manualWithdrawalOpen, setManualWithdrawalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"deposit" | "withdrawal" | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "info" | "warning" })
  const [actionType, setActionType] = useState<string | null>(null) // Added to handle different dialog actions
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false)

  // API 数据状态
  const [apiData, setApiData] = useState<FiatOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<string>('')

  // 客户资产列表状态
  const [customerAssetsData, setCustomerAssetsData] = useState<CustomerAssetsResponse | null>(null)
  const [customerAssetsLoading, setCustomerAssetsLoading] = useState(false)
  const [customerAssetsPage, setCustomerAssetsPage] = useState(0)
  const [customerAssetsPageSize, setCustomerAssetsPageSize] = useState(10)
  
  // 客户资产筛选条件
  const [customerAssetsKeyword, setCustomerAssetsKeyword] = useState('')
  const [customerAssetsCurrency, setCustomerAssetsCurrency] = useState('all')
  
  // 客户资产展开/折叠状态
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([])
  
  // 每个客户的最近3笔流水（用 customerId 作为 key）
  const [customerRecentTransactionsMap, setCustomerRecentTransactionsMap] = useState<Record<string, CustomerRecentTransactionsResponse | null>>({})
  const [loadingRecentTransactionsMap, setLoadingRecentTransactionsMap] = useState<Record<string, boolean>>({})

  // 资金流水查询状态
  const [transactionFlowData, setTransactionFlowData] = useState<TransactionFlowResponse | null>(null)
  const [transactionFlowLoading, setTransactionFlowLoading] = useState(false)
  const [transactionFlowPage, setTransactionFlowPage] = useState(0)
  const [transactionFlowPageSize, setTransactionFlowPageSize] = useState(10)

  // Form states for manual deposit
  const [depositForm, setDepositForm] = useState({
    customerId: null as number | null,  // 客户ID
    customerName: "",                    // 客户名称（用于显示）
    customerEmail: "",                   // 客户邮箱（用于显示）
    currency: "USD",
    amount: "",
    channel: "",                         // 打款渠道
    referenceNumber: "",
    notes: "",
    attachment: null as File | null,
    voucherUrl: "",  // 上传后的凭证URL
  })
  
  // 标记是否从列表传入客户信息（禁用客户选择）
  const [depositFormCustomerLocked, setDepositFormCustomerLocked] = useState(false)

  // 客户搜索相关状态（手动入金）
  const [customerSearchOptions, setCustomerSearchOptions] = useState<MemberSearchItem[]>([])
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
  const [customerSearchInput, setCustomerSearchInput] = useState("")
  const customerSearchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSelectingCustomerRef = useRef(false) // 标记是否正在选择客户（避免选择时触发搜索）

  // 客户搜索相关状态（手动出金）
  const [withdrawalCustomerSearchOptions, setWithdrawalCustomerSearchOptions] = useState<MemberSearchItem[]>([])
  const [withdrawalCustomerSearchLoading, setWithdrawalCustomerSearchLoading] = useState(false)
  const [withdrawalCustomerSearchInput, setWithdrawalCustomerSearchInput] = useState("")
  const withdrawalCustomerSearchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSelectingWithdrawalCustomerRef = useRef(false) // 标记是否正在选择客户（避免选择时触发搜索）

  // 防止重复调用接口的 ref
  const overviewDataLoadedRef = useRef(false) // 标记 overview 接口是否已调用
  const dictDataLoadedRef = useRef(false) // 标记字典数据接口是否已调用
  const drawerDataLoadingRef = useRef(false) // 标记抽屉打开时的数据加载状态，防止重复调用

  // Form states for manual withdrawal
  const [withdrawalForm, setWithdrawalForm] = useState({
    customerId: null as number | null,  // 客户ID
    customerName: "",                    // 客户名称（用于显示）
    customerEmail: "",                   // 客户邮箱（用于显示）
    currency: "USD",
    amount: "",
    channel: "",                         // 打款渠道
    referenceNumber: "",
    notes: "",
    attachment: null as File | null,
    voucherUrl: "",  // 上传后的凭证URL
    bankAccountId: null as number | null,  // 银行账号ID
  })
  
  // 标记是否从列表传入客户信息（禁用客户选择）
  const [withdrawalFormCustomerLocked, setWithdrawalFormCustomerLocked] = useState(false)

  // 银行账号白名单相关状态
  const [bankAccountList, setBankAccountList] = useState<BankAccountItem[]>([])
  const [bankAccountLoading, setBankAccountLoading] = useState(false)

  // 出金手续费相关状态
  const [outCashFee, setOutCashFee] = useState<string>("")
  const [outCashFeeLoading, setOutCashFeeLoading] = useState(false)
  const [outCashFeeCurrency, setOutCashFeeCurrency] = useState<string>("") // 手续费对应的币种

  // 资金流水筛选条件（对应 API 参数）
  const [transactionFilters, setTransactionFilters] = useState({
    startTime: "",           // 开始时间
    endTime: "",             // 结束时间
    userId: "",              // 客户ID
    type: "all",             // 类型：1现金入金，2现金出金
    amountType: "all",       // 资金类型：1美金，2港币
    status: "99",            // 状态：99全部，0待处理，2处理中，1处理完成，-3处理失败，-1客户取消
    keyword: "",             // 关键词（参考号、备注）
  })

  // 选中的客户和其最近交易
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [customerRecentTransactions, setCustomerRecentTransactions] = useState<CustomerRecentTransactionsResponse | null>(null)
  const [recentTransactionsLoading, setRecentTransactionsLoading] = useState(false)

  // 入账认领列表状态
  const [depositClaimData, setDepositClaimData] = useState<DepositClaimListResponse | null>(null)
  const [depositClaimLoading, setDepositClaimLoading] = useState(false)
  const [depositClaimPage, setDepositClaimPage] = useState(0)
  const [depositClaimPageSize, setDepositClaimPageSize] = useState(10)
  
  // 入账认领筛选条件
  const [depositClaimFilters, setDepositClaimFilters] = useState({
    status: "all",           // 状态：0待处理，2处理中，1处理完成，-3处理失败
    matchStatus: "all",      // 匹配状态：0未匹配，1已匹配
    startTime: "",           // 开始时间
    endTime: "",             // 结束时间
    keyword: "",             // 关键词（参考号、付款人、备注）
  })

  // 入账认领状态
  const [selectedClaim, setSelectedClaim] = useState<DepositClaimItem | null>(null)
  const [selectedClaimCustomer, setSelectedClaimCustomer] = useState<CustomerAsset | null>(null)
  const [claimForm, setClaimForm] = useState({
    remark: "",              // 认领备注
    voucherUrl: "",          // 凭证URL
  })
  const [claimSubmitting, setClaimSubmitting] = useState(false)
  const [uploadingVoucher, setUploadingVoucher] = useState(false)  // 凭证上传中
  const [claimVoucherFile, setClaimVoucherFile] = useState<File | null>(null)  // 选择的凭证文件
  const [uploadingDepositVoucher, setUploadingDepositVoucher] = useState(false)  // 手动入金凭证上传中
  const [uploadingWithdrawalVoucher, setUploadingWithdrawalVoucher] = useState(false)  // 手动出金凭证上传中
  const [claimRejectDialogOpen, setClaimRejectDialogOpen] = useState(false)  // 认领拒绝对话框
  const [claimRejectReason, setClaimRejectReason] = useState("")  // 认领拒绝原因
  
  // 批量认领状态
  const [selectedClaimIds, setSelectedClaimIds] = useState<number[]>([])  // 选中的认领ID列表
  const [isBatchMode, setIsBatchMode] = useState(false)  // 是否批量模式
  const [pendingSelectReferenceNo, setPendingSelectReferenceNo] = useState<string | null>(null)  // 待选中的参考号（从对账中心跳转过来）
  const hasSetSearchKeywordRef = useRef(false)  // 标记是否已设置搜索关键词

  const [approvalChannel, setApprovalChannel] = useState("")
  const [approvalBank, setApprovalBank] = useState("")
  const [approvalProof, setApprovalProof] = useState<File | null>(null)
  const [approvalVoucherUrl, setApprovalVoucherUrl] = useState("")  // 上传后的凭证URL
  const [uploadingApprovalVoucher, setUploadingApprovalVoucher] = useState(false)  // 凭证上传中
  const [approvalRemark, setApprovalRemark] = useState("")
  const [approvalSubmitting, setApprovalSubmitting] = useState(false)
  const [viewPaymentDrawerOpen, setViewPaymentDrawerOpen] = useState(false)
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState<any>(null)
  const [selectedWithdrawalApproval, setSelectedWithdrawalApproval] = useState<WithdrawApprovalItem | null>(null)

  // 出金审批状态
  const [withdrawalData, setWithdrawalData] = useState<WithdrawApprovalListResponse | null>(null)
  const [withdrawalLoading, setWithdrawalLoading] = useState(false)
  const [withdrawalPage, setWithdrawalPage] = useState(0)
  const [withdrawalPageSize, setWithdrawalPageSize] = useState(10)
  const [withdrawalFilters, setWithdrawalFilters] = useState({
    status: "all",           // 状态：all全部, 0待处理, 2处理中, 1处理完成, -3处理失败, -1客户取消
    keyword: "",             // 关键词（客户、收款人等）
    startTime: "",           // 开始时间
    endTime: "",             // 结束时间
  })

  // 对账管理状态
  const [reconciliationStats, setReconciliationStats] = useState<ReconciliationStatsResponse | null>(null)
  const [reconciliationList, setReconciliationList] = useState<ReconciliationListResponse | null>(null)
  const [reconciliationLoading, setReconciliationLoading] = useState(false)
  const [reconciliationPage, setReconciliationPage] = useState(0)
  const [reconciliationPageSize, setReconciliationPageSize] = useState(10)
  const [reconciliationFilters, setReconciliationFilters] = useState({
    matchStatus: "all",      // 匹配状态：all全部, 0未匹配, 1已匹配
    startTime: "",           // 开始时间
    endTime: "",             // 结束时间
    keyword: "",             // 关键词（参考号、备注）
  })

  // 字典数据状态（打款渠道和银行列表）
  const [channelList, setChannelList] = useState<DictItem[]>([])
  const [bankList, setBankList] = useState<DictItem[]>([])
  const [loadingDictData, setLoadingDictData] = useState(false)

  // 格式化同步时间
  const formatSyncTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (customerSearchDebounceTimerRef.current) {
        clearTimeout(customerSearchDebounceTimerRef.current)
      }
      if (withdrawalCustomerSearchDebounceTimerRef.current) {
        clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
      }
    }
  }, [])

  // 加载 API 数据
  useEffect(() => {
    // 防止重复调用
    if (overviewDataLoadedRef.current) {
      return
    }
    overviewDataLoadedRef.current = true

    const loadData = async () => {
      try {
        setLoading(true)
        const response = await getFiatOverview()
        // 从 ServerResponse 中提取数据
        const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
          ? response.data.data 
          : response.data
        setApiData(actualData as FiatOverviewResponse)
        // 更新同步时间
        setLastSyncTime(formatSyncTime())
      } catch (error) {
        console.error('❌ 加载总览数据失败:', error)
        setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
        // 如果加载失败，重置标志以便重试
        overviewDataLoadedRef.current = false
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 重置手动出金表单的函数
  const resetWithdrawalForm = () => {
    setWithdrawalForm({
      customerId: null,
      customerName: "",
      customerEmail: "",
      currency: "USD",
      amount: "",
      channel: "",
      referenceNumber: "",
      notes: "",
      attachment: null,
      voucherUrl: "",
      bankAccountId: null,
    })
    setWithdrawalCustomerSearchInput("")
    setWithdrawalCustomerSearchOptions([])
    setWithdrawalFormCustomerLocked(false)
    setBankAccountList([])
    setOutCashFee("")
    setOutCashFeeCurrency("")
  }

  // 当手动出金抽屉打开时，加载手续费（如果有默认币种）
  useEffect(() => {
    if (manualWithdrawalOpen) {
      // 加载手续费（如果有币种）
      const currency = withdrawalForm.currency || "USD"
      loadOutCashFee(currency)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualWithdrawalOpen]) // 只在抽屉打开时调用，币种变化时由币种选择器的 onChange 处理

  // 加载字典数据（打款渠道和银行列表）- 提取为独立函数以便按需调用
  const loadDictData = useCallback(async (forceReload: boolean = false) => {
    // 如果已加载且不强制重新加载，则跳过
    if (dictDataLoadedRef.current && !forceReload) {
      return
    }

    try {
      setLoadingDictData(true)
      const [channelResponse, bankResponse] = await Promise.all([
        getChannelList(),
        getBankList()
      ])
      
      
      // 从 ServerResponse 中提取数据
      // 接口返回格式: { code: 200, data: { list: [...] } }
      let channelData = null
      let bankData = null
      
      // 处理渠道数据
      if (channelResponse.data) {
        if (typeof channelResponse.data === 'object' && 'list' in channelResponse.data) {
          // 格式: { data: { list: [...] } }
          channelData = channelResponse.data.list
        } else if (Array.isArray(channelResponse.data)) {
          // 格式: { data: [...] }
          channelData = channelResponse.data
        } else if (typeof channelResponse.data === 'object' && 'data' in channelResponse.data) {
          // 格式: { data: { data: { list: [...] } } }
          const innerData = channelResponse.data.data
          channelData = (innerData && typeof innerData === 'object' && 'list' in innerData) 
            ? innerData.list 
            : (Array.isArray(innerData) ? innerData : [])
        }
      }
      
      // 处理银行数据
      if (bankResponse.data) {
        if (typeof bankResponse.data === 'object' && 'list' in bankResponse.data) {
          // 格式: { data: { list: [...] } }
          bankData = bankResponse.data.list
        } else if (Array.isArray(bankResponse.data)) {
          // 格式: { data: [...] }
          bankData = bankResponse.data
        } else if (typeof bankResponse.data === 'object' && 'data' in bankResponse.data) {
          // 格式: { data: { data: { list: [...] } } }
          const innerData = bankResponse.data.data
          bankData = (innerData && typeof innerData === 'object' && 'list' in innerData) 
            ? innerData.list 
            : (Array.isArray(innerData) ? innerData : [])
        }
      }
      
      
      const finalChannelList = Array.isArray(channelData) ? channelData : []
      const finalBankList = Array.isArray(bankData) ? bankData : []
      
      setChannelList(finalChannelList)
      setBankList(finalBankList)
      dictDataLoadedRef.current = true
      // 更新 ref 存储最新的数据长度，供 useEffect 使用
      drawerDataLoadingRef.current = false
      
    } catch (error) {
      console.error('出金审批：加载字典数据失败', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
      // 如果加载失败，重置标志以便重试
      dictDataLoadedRef.current = false
    } finally {
      setLoadingDictData(false)
    }
  }, [])

  // 组件挂载时加载字典数据
  useEffect(() => {
    loadDictData()
  }, [loadDictData])

  // 监听出金审批抽屉打开，确保字典数据已加载
  useEffect(() => {
    if (approvalDrawerOpen && !drawerDataLoadingRef.current) {
      // 抽屉打开时，如果数据为空且未在加载中，则加载数据
      // 使用最新的 state 值进行检查
      const currentChannelLength = channelList.length
      const currentBankLength = bankList.length
      
      if (currentChannelLength === 0 || currentBankLength === 0) {
        drawerDataLoadingRef.current = true
        loadDictData(true).finally(() => {
          drawerDataLoadingRef.current = false
        })
      } else {
      }
      
      // 加载手续费（如果有选中的出金审批记录）
      if (selectedWithdrawalApproval?.currency) {
        const currencyType = selectedWithdrawalApproval.currency === 'USD' ? 'USD' : selectedWithdrawalApproval.currency === 'HKD' ? 'HKD' : 'USD'
        loadOutCashFee(currencyType)
      }
    } else if (!approvalDrawerOpen) {
      // 抽屉关闭时重置加载标志
      drawerDataLoadingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalDrawerOpen, channelList.length, bankList.length, loadDictData, selectedWithdrawalApproval?.currency]) // 监听抽屉状态和数据长度

  // 监听手动入金抽屉打开，确保字典数据已加载
  useEffect(() => {
    if (manualDepositOpen && channelList.length === 0) {
      loadDictData(true)
    }
  }, [manualDepositOpen, channelList.length, loadDictData])

  // 监听手动出金抽屉打开，确保字典数据已加载
  useEffect(() => {
    if (manualWithdrawalOpen && channelList.length === 0) {
      loadDictData(true)
    }
  }, [manualWithdrawalOpen, channelList.length, loadDictData])

  // 监听查看打款信息抽屉打开，确保渠道列表和银行列表已加载
  useEffect(() => {
    if (viewPaymentDrawerOpen && (channelList.length === 0 || bankList.length === 0)) {
      loadDictData(true)
    }
  }, [viewPaymentDrawerOpen, channelList.length, bankList.length, loadDictData])

  // 加载客户资产列表数据（支持传入自定义筛选条件和页码）
  const loadCustomerAssets = async (customKeyword?: string, customCurrency?: string, customPage?: number) => {
    try {
      const keyword = customKeyword !== undefined ? customKeyword : customerAssetsKeyword
      const currency = customCurrency !== undefined ? customCurrency : customerAssetsCurrency
      const pageNum = customPage !== undefined ? customPage : customerAssetsPage
      
      setCustomerAssetsLoading(true)
      const params: any = {
        pageNum: pageNum + 1, // API 页码从 1 开始，UI 从 0 开始
        pageSize: customerAssetsPageSize
      }
      
      // 只在有值时才添加筛选参数
      if (keyword && keyword.trim()) {
        params.keyword = keyword.trim()
      }
      if (currency && currency !== 'all') {
        params.currency = currency
      }
      
      const response = await getCustomerAssets(params)
      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setCustomerAssetsData(actualData as CustomerAssetsResponse)
    } catch (error) {
      console.error('Failed to load customer assets:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setCustomerAssetsLoading(false)
    }
  }

  // 当进入客户资产标签页或分页改变时加载数据（不自动响应筛选条件）
  useEffect(() => {
    if (activeTab === 'customer-assets') {
      loadCustomerAssets()
    }
  }, [activeTab, customerAssetsPage, customerAssetsPageSize])

  // 加载资金流水数据（支持传入自定义筛选条件和页码）
  const loadTransactionFlow = async (customFilters?: typeof transactionFilters, customPage?: number) => {
    try {
      const filters = customFilters || transactionFilters
      const pageNum = customPage !== undefined ? customPage : transactionFlowPage
      setTransactionFlowLoading(true)
      const params: any = {
        pageNum: pageNum + 1,
        pageSize: transactionFlowPageSize
      }
      
      // 只在有值时才添加筛选参数
      if (filters.startTime) {
        params.startTime = filters.startTime
      }
      if (filters.endTime) {
        params.endTime = filters.endTime
      }
      if (filters.userId && filters.userId !== '') {
        params.userId = parseInt(filters.userId)
      }
      if (filters.type && filters.type !== 'all') {
        params.type = parseInt(filters.type)
      }
      if (filters.amountType && filters.amountType !== 'all') {
        params.amountType = parseInt(filters.amountType)
      }
      // 状态筛选：全部传99，其他传对应数字
      if (filters.status) {
        if (filters.status === '99' || filters.status === 'all') {
          params.status = 99
        } else {
          params.status = parseInt(filters.status)
        }
      }
      if (filters.keyword && filters.keyword.trim()) {
        params.keyword = filters.keyword.trim()
      }
      
      const response = await getTransactionFlow(params)
      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setTransactionFlowData(actualData as TransactionFlowResponse)
    } catch (error) {
      console.error('❌ 加载资金流水失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setTransactionFlowLoading(false)
    }
  }

  // 当进入流水查询标签页或分页改变时加载数据（不自动响应筛选条件）
  useEffect(() => {
    
    if (activeTab === 'transactions') {
      loadTransactionFlow()
    } else {
    }
  }, [activeTab, transactionFlowPage, transactionFlowPageSize])

  // 加载客户最近交易
  const loadCustomerRecentTransactions = async (userId: number) => {
    try {
      setRecentTransactionsLoading(true)
      const response = await getCustomerRecentTransactions(userId)
      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setCustomerRecentTransactions(actualData as CustomerRecentTransactionsResponse)
    } catch (error) {
      console.error('❌ 加载客户最近交易失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setRecentTransactionsLoading(false)
    }
  }

  // 当选中客户改变时加载其最近交易
  useEffect(() => {
    if (selectedCustomerId && activeTab === 'customer-assets') {
      loadCustomerRecentTransactions(selectedCustomerId)
    }
  }, [selectedCustomerId, activeTab])

  // 当客户资产数据加载完成后，自动选中第一个客户
  useEffect(() => {
    if (customerAssetsData && customerAssetsData.list && customerAssetsData.list.length > 0 && !selectedCustomerId) {
      const firstCustomerId = customerAssetsData.list[0].userId
      setSelectedCustomerId(firstCustomerId)
    }
  }, [customerAssetsData])

  // 加载入账认领列表数据（支持传入自定义筛选条件和页码）
  const loadDepositClaimList = async (customFilters?: typeof depositClaimFilters, customPage?: number) => {
    try {
      const filters = customFilters || depositClaimFilters
      const pageNum = customPage !== undefined ? customPage : depositClaimPage
      setDepositClaimLoading(true)
      const params: any = {
        pageNum: pageNum + 1,
        pageSize: depositClaimPageSize
      }
      
      // 状态筛选：全部传99，其他传对应数字
      if (filters.status) {
        if (filters.status === 'all') {
          params.status = 99
        } else {
          params.status = parseInt(filters.status)
        }
      }
      if (filters.matchStatus && filters.matchStatus !== 'all') {
        params.matchStatus = parseInt(filters.matchStatus)
      }
      if (filters.startTime) {
        // formatDateToString 返回格式: yyyy-MM-ddT00:00:00 或 yyyy-MM-ddT23:59:59
        // 需要转换为: yyyy-MM-dd HH:mm:ss
        const dateStr = filters.startTime.replace('T', ' ').replace(/:\d{2}$/, ':00')
        params.startTime = dateStr
      }
      if (filters.endTime) {
        const dateStr = filters.endTime.replace('T', ' ').replace(/:\d{2}$/, ':00')
        params.endTime = dateStr
      }
      if (filters.keyword && filters.keyword.trim()) {
        params.keyword = filters.keyword.trim()
      }
      
      const response = await getDepositClaimList(params)
      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setDepositClaimData(actualData as DepositClaimListResponse)
    } catch (error) {
      console.error('❌ 加载入账认领列表失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setDepositClaimLoading(false)
    }
  }

  // 当进入入账认领标签页或分页改变时加载数据（不自动响应筛选条件）
  useEffect(() => {
    if (activeTab === 'deposits') {
      loadDepositClaimList()
    }
  }, [activeTab, depositClaimPage, depositClaimPageSize])

  // 根据参考号自动选中对应的认领数据
  useEffect(() => {
    if (pendingSelectReferenceNo && depositClaimData && depositClaimData.list.length > 0) {
      const matchedClaim = depositClaimData.list.find(claim => claim.referenceNo === pendingSelectReferenceNo)
      if (matchedClaim) {
        // 选中对应的数据
        if (!selectedClaimIds.includes(matchedClaim.id)) {
          setSelectedClaimIds([...selectedClaimIds, matchedClaim.id])
        }
        // 清除待选中的参考号和标记
        setPendingSelectReferenceNo(null)
        hasSetSearchKeywordRef.current = false
      } else {
        // 如果当前页没找到，设置搜索条件帮助用户找到数据（只设置一次，避免循环）
        if (!hasSetSearchKeywordRef.current && depositClaimFilters.keyword !== pendingSelectReferenceNo) {
          hasSetSearchKeywordRef.current = true
          const newFilters = { ...depositClaimFilters, keyword: pendingSelectReferenceNo }
          setDepositClaimFilters(newFilters)
          setDepositClaimPage(0)
          // 使用新的筛选条件加载数据
          loadDepositClaimList(newFilters, 0)
        }
      }
    }
  }, [depositClaimData, pendingSelectReferenceNo, selectedClaimIds])

  // 转换日期时间格式：从 2025-11-11T17:43 转为 2025-11-11 17:43:00
  const formatDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return ''
    // datetime-local 格式: 2025-11-11T17:43
    // 目标格式: 2025-11-11 17:43:00
    const formatted = dateTimeStr.replace('T', ' ') + ':00'
    return formatted
  }

  // 将字符串日期转换为 Date 对象（用于 AppReactDatepicker）
  const parseDateTimeString = (dateTimeStr: string): Date | null => {
    if (!dateTimeStr) return null
    // 支持两种格式：2025-11-11T17:43 或 2025-11-11 17:43:00
    const dateStr = dateTimeStr.includes('T') ? dateTimeStr : dateTimeStr.replace(' ', 'T')
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }

  // 将 Date 对象转换为字符串格式（用于 API）
  // isStartTime: true 表示开始时间（00:00:00），false 表示结束时间（23:59:59）
  const formatDateToString = (date: Date | null, isStartTime: boolean = true): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    if (isStartTime) {
      // 开始时间：00:00:00
      return `${year}-${month}-${day}T00:00:00`
    } else {
      // 结束时间：23:59:59
      return `${year}-${month}-${day}T23:59:59`
    }
  }

  // 加载对账统计数据（支持传入自定义筛选条件）
  const loadReconciliationStats = async (customFilters?: typeof reconciliationFilters) => {
    try {
      const filters = customFilters || reconciliationFilters
      const params: any = {}
      
      if (filters.startTime) {
        // formatDateToString 返回格式: yyyy-MM-ddT00:00:00 或 yyyy-MM-ddT23:59:59
        // formatDateTime 需要转换为: yyyy-MM-dd HH:mm:ss
        const dateStr = filters.startTime.replace('T', ' ').replace(/:\d{2}$/, ':00')
        params.startTime = dateStr
      }
      if (filters.endTime) {
        const dateStr = filters.endTime.replace('T', ' ').replace(/:\d{2}$/, ':00')
        params.endTime = dateStr
      }
      
      const response = await getReconciliationStats(params)
      
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setReconciliationStats(actualData as ReconciliationStatsResponse)
    } catch (error) {
      console.error('❌ 加载对账统计失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    }
  }

  // 加载对账列表数据（支持传入自定义筛选条件和页码）
  const loadReconciliationList = async (customFilters?: typeof reconciliationFilters, customPage?: number) => {
    try {
      const filters = customFilters || reconciliationFilters
      const pageNum = customPage !== undefined ? customPage : reconciliationPage
      setReconciliationLoading(true)
      
      const params: any = {
        pageNum: pageNum + 1,
        pageSize: reconciliationPageSize,
      }
      
      if (filters.matchStatus !== 'all') {
        params.matchStatus = parseInt(filters.matchStatus)
      }
      if (filters.startTime) {
        // formatDateToString 返回格式: yyyy-MM-ddT00:00:00 或 yyyy-MM-ddT23:59:59
        // formatDateTime 需要转换为: yyyy-MM-dd HH:mm:ss
        const dateStr = filters.startTime.replace('T', ' ').replace(/:\d{2}$/, ':00')
        params.startTime = dateStr
      }
      if (filters.endTime) {
        const dateStr = filters.endTime.replace('T', ' ').replace(/:\d{2}$/, ':00')
        params.endTime = dateStr
      }
      if (filters.keyword) {
        params.keyword = filters.keyword
      }
      
      const response = await getReconciliationList(params)
      
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setReconciliationList(actualData as ReconciliationListResponse)
    } catch (error) {
      console.error('❌ 加载对账列表失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setReconciliationLoading(false)
    }
  }

  // 加载出金审批列表数据（支持传入自定义筛选条件和页码）
  const loadWithdrawalApprovalList = async (customFilters?: typeof withdrawalFilters, customPage?: number) => {
    try {
      const filters = customFilters || withdrawalFilters
      const pageNum = customPage !== undefined ? customPage : withdrawalPage
      setWithdrawalLoading(true)
      
      const params: any = {
        pageNum: pageNum + 1,
        pageSize: withdrawalPageSize,
      }
      
      // 状态筛选：全部传99，其他传对应数字（包括0）
      if (filters.status) {
        if (filters.status === 'all') {
          params.status = 99
        } else {
          params.status = parseInt(filters.status)
        }
      }
      if (filters.startTime) {
        // formatDateToString 返回格式: yyyy-MM-ddT00:00:00 或 yyyy-MM-ddT23:59:59
        // formatDateTime 需要转换为: yyyy-MM-dd HH:mm:ss
        const dateStr = filters.startTime.replace('T', ' ').replace(/:\d{2}$/, ':00')
        params.startTime = dateStr
      }
      if (filters.endTime) {
        const dateStr = filters.endTime.replace('T', ' ').replace(/:\d{2}$/, ':00')
        params.endTime = dateStr
      }
      if (filters.keyword && filters.keyword.trim()) {
        // 去除所有空格（包括中间的空格）
        params.keyword = filters.keyword.replace(/\s+/g, '')
      }
      
      const response = await getWithdrawApprovalList(params)
      
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setWithdrawalData(actualData as WithdrawApprovalListResponse)
    } catch (error) {
      console.error('❌ 加载出金审批列表失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setWithdrawalLoading(false)
    }
  }

  // 处理出金审批
  const handleWithdrawApproval = async (action: 'approve' | 'reject') => {
    if (!selectedWithdrawalApproval) return

    // 验证必填字段
    if (action === 'approve') {
      if (!approvalChannel || !approvalBank || !approvalVoucherUrl) {
        setSnackbar({ open: true, message: "请填写所有必填项（渠道、银行、凭证）", severity: "error" })
        return
      }
      if (!approvalRemark || !approvalRemark.trim()) {
        setSnackbar({ open: true, message: "请输入审批备注", severity: "error" })
        return
      }
    }

    if (action === 'reject' && !rejectReason) {
      setSnackbar({ open: true, message: "请输入拒绝原因", severity: "error" })
      return
    }

    setApprovalSubmitting(true)
    
    try {
      // 构建审批请求参数
      const requestData: WithdrawApprovalRequest = {
        id: selectedWithdrawalApproval.id,
        action: action,
        remark: action === 'approve' ? approvalRemark : rejectReason
      }

      // 如果是批准操作，添加打款信息（使用已上传的凭证URL）
      if (action === 'approve') {
        requestData.paymentChannel = approvalChannel
        requestData.paymentBank = approvalBank
        requestData.voucherUrl = approvalVoucherUrl
      }

      await withdrawApproval(requestData)

      setSnackbar({ 
        open: true, 
        message: action === 'approve' ? "出金审批成功" : "已拒绝出金申请", 
        severity: "success" 
      })

      // 关闭抽屉并重置状态
      setApprovalDrawerOpen(false)
      setRejectDialogOpen(false)
      setApprovalChannel("")
      setApprovalBank("")
      setApprovalProof(null)
      setApprovalVoucherUrl("")
      setApprovalRemark("")
      setRejectReason("")

      // 刷新列表
      loadWithdrawalApprovalList()
    } catch (error) {
      console.error('❌ 审批失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setApprovalSubmitting(false)
    }
  }

  // 当进入出金审批标签页或分页改变时加载数据（不自动响应筛选条件）
  useEffect(() => {
    if (activeTab === 'withdrawals') {
      loadWithdrawalApprovalList()
    }
  }, [activeTab, withdrawalPage, withdrawalPageSize])

  // 当进入对账中心标签页或分页改变时加载数据（不自动响应筛选条件）
  useEffect(() => {
    if (activeTab === 'reconciliation') {
      loadReconciliationStats()
      loadReconciliationList()
    }
  }, [activeTab, reconciliationPage, reconciliationPageSize])

  // 处理凭证图片上传（入账认领）
  const handleVoucherUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: "请选择图片文件", severity: "error" })
      return
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: "图片大小不能超过10MB", severity: "error" })
      return
    }

    // 先保存文件信息
    setClaimVoucherFile(file)
    setUploadingVoucher(true)

    try {
      const response = await uploadSingleFile(file)

      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data

      if (actualData) {
        const uploadData = actualData as UploadImageResponse
        // 使用相对路径（path）作为凭证URL
        const uploadedUrl = uploadData.path
        setClaimForm({ ...claimForm, voucherUrl: uploadedUrl })
        setSnackbar({ open: true, message: "凭证上传成功", severity: "success" })
      }
    } catch (error: any) {
      console.error('❌ 凭证上传失败:', error)
      setSnackbar({ 
        open: true, 
        message: getErrorMessage(error), 
        severity: "error" 
      })
      // 上传失败时清除文件
      setClaimVoucherFile(null)
    } finally {
      setUploadingVoucher(false)
      // 清空input，允许重新选择同一文件
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // 处理手动入金凭证上传
  const handleDepositVoucherUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: "请选择图片文件", severity: "error" })
      return
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: "图片大小不能超过10MB", severity: "error" })
      return
    }

    setUploadingDepositVoucher(true)

    try {
      const response = await uploadSingleFile(file)

      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data

      if (actualData) {
        const uploadData = actualData as UploadImageResponse
        // 使用相对路径（path）作为凭证URL
        const uploadedUrl = uploadData.path
        setDepositForm({ 
          ...depositForm, 
          attachment: file,
          voucherUrl: uploadedUrl 
        })
        setSnackbar({ open: true, message: "凭证上传成功", severity: "success" })
      }
    } catch (error: any) {
      console.error('❌ 凭证上传失败:', error)
      setSnackbar({ 
        open: true, 
        message: getErrorMessage(error), 
        severity: "error" 
      })
    } finally {
      setUploadingDepositVoucher(false)
      // 清空input，允许重新选择同一文件
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // 处理手动出金凭证上传
  const handleWithdrawalVoucherUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: "请选择图片文件", severity: "error" })
      return
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: "图片大小不能超过10MB", severity: "error" })
      return
    }

    setUploadingWithdrawalVoucher(true)

    try {
      const response = await uploadSingleFile(file)

      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data

      if (actualData) {
        const uploadData = actualData as UploadImageResponse
        // 使用相对路径（path）作为凭证URL
        const uploadedUrl = uploadData.path
        setWithdrawalForm({ 
          ...withdrawalForm, 
          attachment: file,
          voucherUrl: uploadedUrl 
        })
        setSnackbar({ open: true, message: "凭证上传成功", severity: "success" })
      }
    } catch (error: any) {
      console.error('❌ 凭证上传失败:', error)
      setSnackbar({ 
        open: true, 
        message: getErrorMessage(error), 
        severity: "error" 
      })
    } finally {
      setUploadingWithdrawalVoucher(false)
      // 清空input，允许重新选择同一文件
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // 处理出金审批凭证上传
  const handleApprovalVoucherUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: "请选择图片文件", severity: "error" })
      return
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: "图片大小不能超过10MB", severity: "error" })
      return
    }

    setUploadingApprovalVoucher(true)

    try {
      const response = await uploadSingleFile(file)

      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data

      if (actualData) {
        const uploadData = actualData as UploadImageResponse
        // 使用相对路径（path）作为凭证URL，并保存文件对象
        const uploadedUrl = uploadData.path
        setApprovalProof(file)
        setApprovalVoucherUrl(uploadedUrl)
        setSnackbar({ open: true, message: "凭证上传成功", severity: "success" })
      }
    } catch (error: any) {
      console.error('❌ 凭证上传失败:', error)
      setSnackbar({ 
        open: true, 
        message: getErrorMessage(error), 
        severity: "error" 
      })
    } finally {
      setUploadingApprovalVoucher(false)
      // 清空input，允许重新选择同一文件
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // 批量选择处理函数
  const handleSelectAllClaims = (checked: boolean) => {
    if (!depositClaimData) return
    
    if (checked) {
      // 只选择状态为待处理(status=0)的记录
      const pendingIds = depositClaimData.list
        .filter(claim => claim.status === 0)
        .map(claim => claim.id)
      setSelectedClaimIds(pendingIds)
    } else {
      setSelectedClaimIds([])
    }
  }

  const handleSelectClaim = (claimId: number, checked: boolean) => {
    if (checked) {
      setSelectedClaimIds(prev => [...prev, claimId])
    } else {
      setSelectedClaimIds(prev => prev.filter(id => id !== claimId))
    }
  }

  // 处理入账认领操作（单个）
  const handleDepositClaim = async (action: 'approve' | 'reject' | 'match', rejectReason?: string) => {
    if (!selectedClaim) {
      setSnackbar({ open: true, message: "请选择要操作的记录", severity: "error" })
      return
    }

    // 拒绝操作使用拒绝原因，其他操作使用认领备注
    const remark = action === 'reject' ? (rejectReason || '') : claimForm.remark.trim()

    // 验证必填项
    if (!remark) {
      setSnackbar({ open: true, message: action === 'reject' ? "请填写拒绝原因" : "请输入认领备注", severity: "error" })
      return
    }

    // 如果记录还没有匹配客户，需要选择客户（拒绝操作不需要选择客户）
    if (action !== 'reject' && (action === 'approve' || action === 'match') && !selectedClaim?.customerName && !selectedClaimCustomer) {
      setSnackbar({ open: true, message: "请选择客户", severity: "error" })
      return
    }

    try {
      setClaimSubmitting(true)

      const requestData: DepositClaimRequest = {
        id: selectedClaim.id,
        action: action,
        remark: remark,
      }

      // 拒绝操作不需要 userId 和 voucherUrl
      if (action !== 'reject') {
        // 优先使用已匹配的客户ID，如果没有匹配则使用选择的客户
        if (selectedClaim.userId) {
          requestData.userId = selectedClaim.userId
        } else if (selectedClaimCustomer) {
          requestData.userId = selectedClaimCustomer.userId
        }

        if (claimForm.voucherUrl) {
          requestData.voucherUrl = claimForm.voucherUrl
        }
      }


      await depositClaim(requestData)
      
      setSnackbar({ 
        open: true, 
        message: action === 'approve' ? "认领成功" : action === 'reject' ? "拒绝成功" : "匹配成功", 
        severity: "success" 
      })
      
      // 关闭抽屉并重置表单
      setClaimDrawerOpen(false)
      setSelectedClaim(null)
      setSelectedClaimCustomer(null)
      setClaimVoucherFile(null)
      setClaimForm({
        remark: "",
        voucherUrl: "",
      })
      
      // 重新加载列表
      loadDepositClaimList()
    } catch (error) {
      console.error('❌ 认领操作失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setClaimSubmitting(false)
    }
  }

  // 处理批量入账认领操作
  const handleBatchDepositClaim = async () => {
    // 验证必填项
    if (!claimForm.remark.trim()) {
      setSnackbar({ open: true, message: "请输入认领备注", severity: "error" })
      return
    }

    // 检查是否有未匹配的记录需要选择客户
    const selectedClaims = depositClaimData?.list.filter(claim => selectedClaimIds.includes(claim.id)) || []
    const unmatchedClaims = selectedClaims.filter(claim => !claim.customerName)
    
    if (unmatchedClaims.length > 0 && !selectedClaimCustomer) {
      setSnackbar({ open: true, message: "请为未匹配的记录选择客户", severity: "error" })
      return
    }

    try {
      setClaimSubmitting(true)

      const requestData: BatchDepositClaimRequest = {
        ids: selectedClaimIds,
        userId: selectedClaimCustomer ? selectedClaimCustomer.userId : (selectedClaims[0]?.userId || 0),
        remark: claimForm.remark.trim(),
      }


      await batchDepositClaim(requestData)
      
      setSnackbar({ 
        open: true, 
        message: `批量认领成功，共处理 ${selectedClaimIds.length} 条记录`, 
        severity: "success" 
      })
      
      // 关闭抽屉并重置表单
      setClaimDrawerOpen(false)
      setSelectedClaim(null)
      setSelectedClaimCustomer(null)
      setSelectedClaimIds([])
      setIsBatchMode(false)
      setClaimVoucherFile(null)
      setClaimForm({
        remark: "",
        voucherUrl: "",
      })
      
      // 重新加载列表
      loadDepositClaimList()
    } catch (error) {
      console.error('❌ 批量认领操作失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setClaimSubmitting(false)
    }
  }

  // 指标卡片数据 - 使用 API 数据（添加可选链保护）
  const metrics: MetricCard[] = (apiData && apiData.aum) ? [
    { 
      label: apiData.aum?.title || "AUM", 
      value: `$ ${(apiData.aum?.amount || 0).toLocaleString()}`, 
      change: `${(apiData.aum?.changePercent || 0) > 0 ? '+' : ''}${((apiData.aum?.changePercent || 0)).toFixed(2)}%`, 
      trend: (apiData.aum?.changePercent || 0) >= 0 ? "up" : "down" 
    },
    { 
      label: apiData.todayNetInflow?.title || "今日净流入", 
      value: `$ ${(apiData.todayNetInflow?.amount || 0).toLocaleString()}`, 
      change: `${(apiData.todayNetInflow?.changePercent || 0) > 0 ? '+' : ''}${((apiData.todayNetInflow?.changePercent || 0)).toFixed(2)}%`, 
      trend: (apiData.todayNetInflow?.changePercent || 0) >= 0 ? "up" : "down" 
    },
    { 
      label: apiData.pendingClaim?.title || "待认领", 
      value: (apiData.pendingClaim?.amount || 0).toString(), 
      change: `${(apiData.pendingClaim?.changeValue || 0) > 0 ? '+' : ''}${apiData.pendingClaim?.changeValue || 0}`, 
      trend: (apiData.pendingClaim?.changeValue || 0) >= 0 ? "up" : "down" 
    },
    { 
      label: apiData.pendingApproval?.title || "待审批", 
      value: (apiData.pendingApproval?.amount || 0).toString(), 
      change: `${(apiData.pendingApproval?.changeValue || 0) > 0 ? '+' : ''}${apiData.pendingApproval?.changeValue || 0}`, 
      trend: (apiData.pendingApproval?.changeValue || 0) >= 0 ? "up" : "down" 
    },
    { 
      label: apiData.unmatchedIncoming?.title || "未匹配来账", 
      value: (apiData.unmatchedIncoming?.amount || 0).toString() 
    },
    // { 
    //   label: apiData.discrepancies?.title || "差异数", 
    //   value: (apiData.discrepancies?.amount || 0).toString() 
    // },
  ] : [
    // Fallback mock data
    { label: "AUM", value: "$125,680,000", change: "+2.3%", trend: "up" },
    { label: "今日净流入", value: "$1,250,000", change: "+15.2%", trend: "up" },
    { label: "待认领", value: "12", change: "-3", trend: "down" },
    { label: "待审批", value: "8", change: "+2", trend: "up" },
    { label: "未匹配来账", value: "5" },
    // { label: "差异数", value: "2" },
  ]

  // 待办事项 - 使用 API 数据（添加可选链保护）
  const todoItems: TodoItem[] = (apiData && apiData.todoList) ? apiData.todoList.map(item => ({
    title: item?.label || '',
    count: item?.count || 0,
    color: (item?.color || 'info') as "warning" | "error" | "info" | "success"
  })) : [
    // Fallback mock data
    { title: "入账认领", count: 12, color: "warning" },
    { title: "出金审批", count: 8, color: "error" },
    { title: "未匹配来账", count: 5, color: "info" },
    { title: "对账差异", count: 2, color: "error" },
  ]

  // 客户资产列表 - 使用 API 数据（添加可选链保护）
  // 注意：新API返回的是汇总数据，不再需要展开为单个币种记录
  // 保留此变量以保持兼容性，但设置为空数组
  const customerAssets: CustomerAsset[] = []

  // 客户资产汇总数据（用于新表格结构）
  interface CurrencyBreakdown {
    currency: string
    available: number
    frozen: number
    inTransit: number
    recentDeposit7d: number
    recentWithdraw7d: number
    lastReconciliation: string
  }

  interface CustomerAssetSummary {
    customerId: string
    userId: number  // 用户ID
    customerName: string
    customerEmail?: string  // 客户邮箱
    customerType: "enterprise" | "individual"
    totalAssetUSD: number
    dayChangePercent: number
    currencyBreakdown: CurrencyBreakdown[]
    lastActivity: string
  }

  // 直接映射新API数据结构
  const customerAssetSummaries: CustomerAssetSummary[] = (customerAssetsData && customerAssetsData.list)
    ? customerAssetsData.list.map((item) => {
        // 映射币种明细
        const currencyBreakdown: CurrencyBreakdown[] = (item?.currencyDetails || []).map((detail: any) => ({
          currency: detail?.currency || '',
          available: detail?.balance || 0,
          frozen: detail?.frozenBalance || 0,
          inTransit: detail?.inTransit || 0,
          recentDeposit7d: detail?.deposit7Days || 0,
          recentWithdraw7d: detail?.withdrawal7Days || 0,
          lastReconciliation: detail?.lastReconciliation || '',
        }))

        return {
          customerId: item?.userId?.toString() || '',
          userId: item?.userId || 0,
          customerName: item?.customerName || '',
          customerEmail: item?.customerEmail || '',
          customerType: "individual", // 默认个人，后续可以从API获取
          totalAssetUSD: item?.totalAssetUSD || 0,
          dayChangePercent: item?.changePercent || 0,
          currencyBreakdown,
          lastActivity: item?.lastActivityTime || '',
        }
      })
    : []

  // 从客户资产汇总列表中提取唯一客户列表（用于下拉选择器等场景）
  const uniqueCustomers: CustomerAsset[] = customerAssetSummaries.map(customer => ({
    userId: customer.userId,
    customerId: customer.customerId,
    customerName: customer.customerName,
    customerEmail: customer.customerEmail,
    currency: '', // 汇总数据不包含单个币种
    available: 0,
    frozen: 0,
    inTransit: 0,
    lastReconciliation: customer.lastActivity,
  }))

  // 资金流水列表数据 - 用于流水查询页面
  const transactionFlowList: Transaction[] = (transactionFlowData && transactionFlowData.list)
    ? transactionFlowData.list.map((item) => {
        return {
          id: item?.id?.toString() || '',
          time: item?.createdAt || 0,  // 保留时间戳，在显示时转换
          customer: item?.customerName || '',
          accountId: item?.userId?.toString() || '',
          currency: item?.currency || '',
          amount: item?.amount || 0,
          direction: (item?.type === 1 ? "in" : "out") as "in" | "out",  // 1入金，2出金
          channel: item?.channelLabel || '',  // 使用 channelLabel
          counterparty: '',  // API 没有这个字段
          reference: item?.referenceNo || '',
          status: item?.status ?? 0,  // 保留原始状态值（数字）
          statusTag: item?.statusLabel || '',  // 保留状态标签（兼容旧代码）
          statusLabel: item?.statusLabel || '',  // 使用 statusLabel
          hasAttachment: false,
        }
      })
    : []

  // 最近活动 - 使用 API 数据（有些字段需要后端补充，添加可选链保护）
  const transactions: Transaction[] = (apiData && apiData.recentActivities) 
    ? apiData.recentActivities.map((activity, index) => ({
        id: `T${String(index + 1).padStart(3, '0')}`, // TODO: 后端补充 - 真实交易ID
        time: activity?.timeDesc || '',
        customer: activity?.customer || '',
        email: activity?.email || '', // 客户邮箱
        userId: (activity as any)?.userId || undefined, // 用户ID（如果接口返回）
        accountId: 'N/A', // TODO: 后端补充 - 账户ID字段
        currency: activity?.currency || '',
        amount: activity?.amount || 0,
        direction: (activity?.type === "in" || activity?.type === "deposit" ? "in" : "out") as "in" | "out",
        channel: activity?.channel || '', // 使用 channel 字段，根据值映射显示
        counterparty: 'N/A', // TODO: 后端补充 - counterparty 字段
        reference: 'N/A', // TODO: 后端补充 - reference 字段
        status: activity?.status || 'pending',
        statusTag: activity?.statusTag || '', // 保留状态标签字段
        hasAttachment: false, // TODO: 后端补充 - hasAttachment 字段
      })) 
    : [
    // Fallback mock data
    {
      id: "T001",
      time: "2025-01-10 14:30:25",
      customer: "张三",
      email: "zhangsan@example.com",
      accountId: "ACC001",
      currency: "USD",
      amount: 50000,
      direction: "in",
      channel: "电汇",
      counterparty: "ABC Bank",
      reference: "REF123456",
      status: "completed",
      statusTag: "完成",
      hasAttachment: true,
    },
    {
      id: "T002",
      time: "2025-01-10 11:15:30",
      customer: "李四",
      email: "lisi@example.com",
      accountId: "ACC002",
      currency: "HKD",
      amount: 100000,
      direction: "out",
      channel: "FPS",
      counterparty: "王五",
      reference: "REF123457",
      status: "pending",
      statusTag: "待处理",
      hasAttachment: false,
    },
  ]

  const depositClaims: DepositClaim[] = [
    {
      id: "D001",
      depositTime: "2025-01-10 14:30:25",
      currency: "USD",
      amount: 50000,
      payer: "ABC Bank",
      channel: "电汇",
      reference: "REF123456",
      notes: "投资款",
      matchResult: "matched",
      status: "pending",
    },
    {
      id: "D002",
      depositTime: "2025-01-10 10:20:15",
      currency: "HKD",
      amount: 200000,
      payer: "XYZ Company",
      channel: "FPS",
      reference: "REF123458",
      notes: "",
      matchResult: "unmatched",
      status: "pending",
    },
  ]

  const withdrawalApprovals: WithdrawalApproval[] = [
    {
      id: "W001",
      applicationTime: "2025-01-10 13:45:00",
      customer: "张三",
      currency: "USD",
      amount: 30000,
      payee: "John Doe",
      purpose: "投资回报",
      status: "submitted",
    },
    {
      id: "W002",
      applicationTime: "2025-01-10 09:30:00",
      customer: "李四",
      currency: "HKD",
      amount: 50000,
      payee: "Jane Smith",
      purpose: "赎回",
      status: "approved",
    },
  ]

  // 图表数据 - 使用 API 数据（添加可选链保护）
  // 资产分布饼图 - 过滤掉 CNY，根据币种分配颜色
  const assetDistributionData = (apiData && apiData.assetDistribution && apiData.assetDistribution.items) 
    ? apiData.assetDistribution.items
        .filter(item => item?.label !== 'CNY')
        .map((item, index) => {
          // 根据币种名称分配颜色
          const colorMap: Record<string, string> = {
            'USD': theme.palette.primary.main,
            'HKD': theme.palette.secondary.main,
            'CNY': theme.palette.warning.main,
            'EUR': theme.palette.success.main,
            'GBP': theme.palette.error.main,
          }
          const defaultColors = [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.warning.main,
            theme.palette.success.main,
            theme.palette.error.main,
            theme.palette.info.main,
          ]
          
          return {
            name: item?.label || '',
            value: item?.amount || 0,
            percentage: item?.percent || 0,
            todayInflow: item?.todayInflow || 0,
            todayOutflow: item?.todayOutflow || 0,
            available: item?.available || 0,
            color: item?.color || colorMap[item?.label || ''] || defaultColors[index % defaultColors.length]
          }
        }) 
    : []

  // AUM 趋势图
  const aumTrendData = (apiData && apiData.aumTrend && apiData.aumTrend.series) 
    ? apiData.aumTrend.series.map(item => ({
        date: item?.date || '',
        aum: item?.value || 0
      })) 
    : [
        // Fallback mock data
        { date: "01/05", aum: 118500000 },
        { date: "01/06", aum: 120200000 },
        { date: "01/07", aum: 119800000 },
        { date: "01/08", aum: 122100000 },
        { date: "01/09", aum: 123500000 },
        { date: "01/10", aum: 124200000 },
        { date: "01/11", aum: 125680000 },
      ]

  // 智能格式化数值函数（根据数值大小自动选择 K/M/B 单位，向下取整不四舍五入）
  const formatCurrencyValue = (value: number): string => {
    if (value >= 1000000000) {
      const billions = Math.floor(value / 1000000000 * 10) / 10
      return `${billions}B`
    }
    if (value >= 1000000) {
      const millions = Math.floor(value / 1000000 * 10) / 10
      return `${millions}M`
    }
    if (value >= 1000) {
      const thousands = Math.floor(value / 1000 * 10) / 10
      return `${thousands}K`
    }
    return Math.floor(value).toString()
  }

  // 资金流动图
  const flowTrendData = (apiData && apiData.fundFlow && apiData.fundFlow.inflow) 
    ? apiData.fundFlow.inflow.map((item, index) => ({
        date: item?.date || '',
        inflow: item?.value || 0,
        outflow: apiData.fundFlow?.outflow?.[index]?.value || 0
      })) 
    : [
        // Fallback mock data
        { date: "01/05", inflow: 2100000, outflow: 1800000 },
        { date: "01/06", inflow: 2500000, outflow: 2200000 },
        { date: "01/07", inflow: 1900000, outflow: 2100000 },
        { date: "01/08", inflow: 3200000, outflow: 1500000 },
        { date: "01/09", inflow: 2800000, outflow: 1900000 },
        { date: "01/10", inflow: 2400000, outflow: 2100000 },
        { date: "01/11", inflow: 3100000, outflow: 1850000 },
      ]

  // 客户搜索函数（带防抖）
  const handleCustomerSearch = async (email: string) => {
    if (!email || email.trim().length === 0) {
      setCustomerSearchOptions([])
      return
    }

    try {
      setCustomerSearchLoading(true)
      const response = await memberSearch({ email: email.trim(), limit: 50 })
      const actualData = response.data
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
        setDepositForm(prev => ({
          ...prev,
          customerId: null,
          customerName: "",
          customerEmail: ""
        }))
      }
      return
    }
    
    // 如果已经有选中的客户，且输入值匹配选中项的显示文本，不触发搜索
    if (depositForm.customerId) {
      const selectedOption = customerSearchOptions.find(opt => opt.id === depositForm.customerId)
      if (selectedOption && value === `${selectedOption.name} (${selectedOption.email})`) {
        setCustomerSearchInput(value)
        return
      }
      // 如果输入值不匹配选中项，说明用户正在输入新的搜索内容，清除选中状态
      if (selectedOption && value !== `${selectedOption.name} (${selectedOption.email})`) {
        setDepositForm(prev => ({
          ...prev,
          customerId: null,
          customerName: "",
          customerEmail: ""
        }))
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

  // 处理手动入金
  const handleManualDepositAction = async () => {
    try {
      // 验证必填字段
      if (!depositForm.customerId || !depositForm.amount || !depositForm.notes) {
        setSnackbar({ open: true, message: "请填写所有必填项", severity: "error" })
        return
      }

      // 构建请求参数（凭证已在选择时上传）
      // 将 channel 字符串转换为数字
      let channelNumber: number | undefined = undefined
      if (depositForm.channel) {
        const parsed = parseInt(depositForm.channel, 10)
        if (!isNaN(parsed)) {
          channelNumber = parsed
        }
      }
      const requestData: ManualDepositRequest = {
        userId: depositForm.customerId,
        amountType: depositForm.currency === 'USD' ? 1 : 2,  // 1美金，2港币
        amount: parseFloat(depositForm.amount),
        channel: channelNumber,  // 打款渠道（转换为数字）
        referenceNo: depositForm.referenceNumber || undefined,
        remark: depositForm.notes,
        voucherUrl: depositForm.voucherUrl || undefined,  // 使用已上传的凭证URL
      }

      await manualDeposit(requestData)
      
      setSnackbar({ open: true, message: "手动入金成功", severity: "success" })
      setManualDepositOpen(false)
      setConfirmDialogOpen(false)
      setConfirmAction(null)
      setDepositForm({
        customerId: null,
        customerName: "",
        customerEmail: "",
        currency: "USD",
        amount: "",
        channel: "",
        referenceNumber: "",
        notes: "",
        attachment: null,
        voucherUrl: "",
      })
      setCustomerSearchInput("")
      setCustomerSearchOptions([])
    } catch (error) {
      console.error('❌ 手动入金失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    }
  }

  // 手动出金客户搜索函数（带防抖）
  const handleWithdrawalCustomerSearch = async (email: string) => {
    if (!email || email.trim().length === 0) {
      setWithdrawalCustomerSearchOptions([])
      return
    }

    try {
      setWithdrawalCustomerSearchLoading(true)
      const response = await memberSearch({ email: email.trim(), limit: 50 })
      const actualData = response.data
      const memberList = actualData?.list || []
      setWithdrawalCustomerSearchOptions(memberList)
    } catch (error) {
      console.error('客户搜索失败:', error)
      setWithdrawalCustomerSearchOptions([])
    } finally {
      setWithdrawalCustomerSearchLoading(false)
    }
  }

  // 处理手动出金客户搜索输入变化（防抖）
  const handleWithdrawalCustomerSearchInputChange = (value: string, reason: string) => {
    // 如果正在选择客户（onChange触发），不触发搜索
    if (isSelectingWithdrawalCustomerRef.current) {
      isSelectingWithdrawalCustomerRef.current = false
      setWithdrawalCustomerSearchInput(value)
      // 清除定时器，确保不会触发搜索
      if (withdrawalCustomerSearchDebounceTimerRef.current) {
        clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
        withdrawalCustomerSearchDebounceTimerRef.current = null
      }
      return
    }
    
    // 如果是重置、清除或失去焦点操作，不触发搜索
    if (reason === 'reset' || reason === 'clear' || reason === 'blur') {
      setWithdrawalCustomerSearchInput(value)
      // 清除定时器
      if (withdrawalCustomerSearchDebounceTimerRef.current) {
        clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
        withdrawalCustomerSearchDebounceTimerRef.current = null
      }
      return
    }
    
    // 如果已经有选中的客户，且输入值匹配选中项的显示文本，不触发搜索
    if (withdrawalForm.customerId) {
      const selectedOption = withdrawalCustomerSearchOptions.find(opt => opt.id === withdrawalForm.customerId)
      if (selectedOption && value === `${selectedOption.name} (${selectedOption.email})`) {
        setWithdrawalCustomerSearchInput(value)
        return
      }
    }
    
    setWithdrawalCustomerSearchInput(value)
    
    // 清除之前的定时器
    if (withdrawalCustomerSearchDebounceTimerRef.current) {
      clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
    }
    
    // 如果输入为空，清空选项列表
    if (!value || value.trim().length === 0) {
      setWithdrawalCustomerSearchOptions([])
      withdrawalCustomerSearchDebounceTimerRef.current = null
      return
    }
    
    // 设置新的定时器
    withdrawalCustomerSearchDebounceTimerRef.current = setTimeout(() => {
      handleWithdrawalCustomerSearch(value)
    }, 300) // 300ms 防抖
  }

  // 加载客户银行账号白名单
  const loadBankAccountList = async (userId: number) => {
    if (!userId) {
      setBankAccountList([])
      setWithdrawalForm((prev) => ({ ...prev, bankAccountId: null }))
      return
    }

    try {
      setBankAccountLoading(true)
      const response = await getBankAccountList({ userId })
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      const bankAccountData = actualData as BankAccountListResponse
      const accountList = bankAccountData?.list || []
      setBankAccountList(accountList)
      
      // 如果只有一个银行账号，自动选择
      if (accountList.length === 1) {
        setWithdrawalForm((prev) => ({ ...prev, bankAccountId: accountList[0].id }))
      } else if (accountList.length === 0) {
        // 如果没有银行账号，只清空银行账号选择，保持客户选择不变
        setWithdrawalForm((prev) => ({ ...prev, bankAccountId: null }))
      }
    } catch (error) {
      console.error('❌ 加载银行账号列表失败:', error)
      setBankAccountList([])
      // 错误时也只清空银行账号选择，保持客户选择不变
      setWithdrawalForm((prev) => ({ ...prev, bankAccountId: null }))
      setSnackbar({ open: true, message: getErrorMessage(error) || "加载银行账号列表失败，请稍后重试", severity: "error" })
    } finally {
      setBankAccountLoading(false)
    }
  }

  // 加载出金手续费
  const loadOutCashFee = async (currencyType: string) => {
    if (!currencyType) {
      setOutCashFee("")
      setOutCashFeeCurrency("")
      return
    }

    try {
      setOutCashFeeLoading(true)
      const response = await getOutCashFee({ currencyType })
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      const feeData = actualData as OutCashFeeResponse
      // 保存手续费和对应的币种
      setOutCashFee(feeData?.fee || "0")
      setOutCashFeeCurrency(feeData?.currencyType || currencyType)
    } catch (error) {
      console.error('❌ 加载出金手续费失败:', error)
      setOutCashFee("0")
      setOutCashFeeCurrency("")
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setOutCashFeeLoading(false)
    }
  }

  // 处理手动出金
  const handleManualWithdrawalAction = async () => {
    try {
      // 验证必填字段
      if (!withdrawalForm.customerId) {
        setSnackbar({ open: true, message: "请选择客户", severity: "error" })
        return
      }
      if (!withdrawalForm.amount) {
        setSnackbar({ open: true, message: "请输入出金金额", severity: "error" })
        return
      }
      if (!withdrawalForm.notes) {
        setSnackbar({ open: true, message: "请输入备注说明", severity: "error" })
        return
      }
      if (!withdrawalForm.bankAccountId) {
        setSnackbar({ open: true, message: "请选择银行账号", severity: "error" })
        return
      }

      // 验证手续费是否存在且对应当前币种
      if (!outCashFee || parseFloat(outCashFee) < 0) {
        setSnackbar({ open: true, message: "手续费信息缺失，请稍后重试", severity: "error" })
        return
      }
      
      // 验证手续费是否对应当前币种，如果正在加载则等待
      if (outCashFeeLoading) {
        setSnackbar({ open: true, message: "手续费正在加载中，请稍后重试", severity: "info" })
        return
      }
      
      // 如果手续费币种不匹配，重新加载
      if (outCashFeeCurrency !== withdrawalForm.currency) {
        console.warn('⚠️ 手续费币种不匹配，重新加载:', { 
          currentCurrency: withdrawalForm.currency, 
          feeCurrency: outCashFeeCurrency 
        })
        try {
          await loadOutCashFee(withdrawalForm.currency)
          // 重新验证加载后的手续费
          if (!outCashFee || parseFloat(outCashFee) < 0) {
            setSnackbar({ open: true, message: "手续费加载失败，请稍后重试", severity: "error" })
            return
          }
        } catch (error) {
          console.error('❌ 重新加载手续费失败:', error)
          setSnackbar({ open: true, message: "手续费加载失败，请稍后重试", severity: "error" })
          return
        }
      }

      // 验证银行账号是否在列表中（防止数据不一致）
      const selectedAccount = bankAccountList.find(acc => acc.id === withdrawalForm.bankAccountId)
      if (!selectedAccount) {
        setSnackbar({ open: true, message: "所选银行账号无效，请重新选择", severity: "error" })
        return
      }

      // 构建请求参数（凭证已在选择时上传）
      const requestData: ManualWithdrawRequest = {
        userId: withdrawalForm.customerId,
        amountType: withdrawalForm.currency === 'USD' ? 1 : 2,  // 1美金，2港币
        amount: parseFloat(withdrawalForm.amount),
        bankAccountId: withdrawalForm.bankAccountId,
        fee: parseFloat(outCashFee),
        paymentChannel: withdrawalForm.channel || undefined,  // 打款渠道
        referenceNo: withdrawalForm.referenceNumber || undefined,
        remark: withdrawalForm.notes,
        voucherUrl: withdrawalForm.voucherUrl || undefined,  // 使用已上传的凭证URL
      }

      await manualWithdraw(requestData)
      
      setSnackbar({ open: true, message: "手动出金成功", severity: "success" })
      setManualWithdrawalOpen(false)
      setConfirmDialogOpen(false)
      setConfirmAction(null)
      setWithdrawalForm({
        customerId: null,
        customerName: "",
        customerEmail: "",
        currency: "USD",
        amount: "",
        channel: "",
        referenceNumber: "",
        notes: "",
        attachment: null,
        voucherUrl: "",
        bankAccountId: null,
      })
      setWithdrawalCustomerSearchInput("")
      setWithdrawalCustomerSearchOptions([])
      setBankAccountList([])
      setOutCashFee("")
    } catch (error) {
      console.error('❌ 手动出金失败:', error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    }
  }

  const handleConfirmAction = () => {
    if (actionType === "confirm-deposit") {
      setSnackbar({ open: true, message: "入账认领成功", severity: "success" })
      setClaimDrawerOpen(false)
      setSelectedItem(null)
      setSelectedCustomer(null)
      setUploadedFile(null)
    } else if (actionType === "approve-withdrawal") {
      setSnackbar({ open: true, message: "出金审批成功", severity: "success" })
      setApprovalDrawerOpen(false)
      setApprovalChannel("")
      setApprovalBank("")
      setApprovalProof(null)
      setSelectedWithdrawal(null)
    } else if (confirmAction === "deposit") {
      // Process manual deposit
      handleManualDepositAction()
      return  // 让异步函数自己处理对话框关闭
    } else if (confirmAction === "withdrawal") {
      // Process manual withdrawal
      handleManualWithdrawalAction()
      return  // 让异步函数自己处理对话框关闭
    } else if (actionType === "mark-paid") {
      setSnackbar({ open: true, message: "已标记为已支付", severity: "success" })
      setConfirmDialogOpen(false)
      setSelectedWithdrawal(null)
    } else if (actionType === "mark-settled") {
      setSnackbar({ open: true, message: "已标记为已结算", severity: "success" })
      setConfirmDialogOpen(false)
      setSelectedWithdrawal(null)
    }
    setConfirmAction(null)
    setActionType(null)
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("请填写拒绝原因")
      return
    }
    
    // 如果是出金审批的拒绝操作，调用新的处理函数
    if (selectedWithdrawalApproval) {
      handleWithdrawApproval('reject')
      return
    }
    
    if (actionType === "approve-withdrawal") {
      setSnackbar({ open: true, message: "出金已拒绝", severity: "error" })
      setApprovalDrawerOpen(false)
      setRejectDialogOpen(false)
      setSelectedWithdrawal(null)
    } else {
      // For deposit claims
      setRejectDialogOpen(false)
      setClaimDrawerOpen(false)
      setRejectReason("")
      setSelectedItem(null)
    }
    setRejectReason("")
  }

  const getStatusChip = (status: string | number | undefined) => {
    // 将状态转换为字符串进行处理
    const statusStr = String(status || '')
    const statusLower = statusStr.toLowerCase()
    
    // 根据 status 判断颜色和显示文本
    let color: "success" | "error" | "warning" | "info" | "default" = "default"
    let displayLabel = statusStr
    
    // 成功/完成状态 - 绿色
    if (statusLower === '1' || statusLower === 'completed' || statusLower === '完成' || 
        statusLower.includes('成功') || statusLower.includes('已确认') ||
        statusLower.includes('处理完成')) {
      color = "success"
      if (statusLower.includes('处理完成')) {
        displayLabel = "处理完成"
      } else {
        displayLabel = "完成"
      }
    }
    // 失败/拒绝状态 - 红色
    else if (statusLower === '-3' || statusLower === '-1' || statusLower === 'failed' || statusLower === 'rejected' ||
             statusLower.includes('失败') || statusLower.includes('错误') || statusLower.includes('拒绝')) {
      color = "error"
      displayLabel = statusLower.includes('拒绝') || statusLower === 'rejected' ? "拒绝" : "失败"
    }
    // 待处理/处理中/审批中状态 - 橙色/警告色
    else if (statusLower === '0' || statusLower === 'pending' ||
             (statusLower.includes('待处理') && !statusLower.includes('处理完成')) ||
             (statusLower.includes('处理中') && !statusLower.includes('处理完成')) ||
             statusLower.includes('审批')) {
      color = "warning"
      if (statusLower.includes('审批')) {
        displayLabel = "审批中"
      } else if (statusLower.includes('处理中') && !statusLower.includes('处理完成')) {
        displayLabel = "处理中"
      } else {
        displayLabel = "待处理"
      }
    }
    // 处理中状态（状态码2）- 橙色/警告色
    else if (statusLower === '2' || statusLower === 'processing') {
      color = "warning"
      displayLabel = "处理中"
    }
    // 已提交/已批准/已支付状态 - 蓝色/信息色
    else if (statusLower === 'submitted' || statusLower === 'approved' || statusLower === 'paid' ||
             statusLower.includes('已提交') || statusLower.includes('已批准') || statusLower.includes('已支付')) {
      color = "info"
      if (statusLower.includes('已支付') || statusLower === 'paid') {
        displayLabel = "已支付"
      } else if (statusLower.includes('已批准') || statusLower === 'approved') {
        displayLabel = "已批准"
      } else {
        displayLabel = "已提交"
      }
    }
    // 已结算/已匹配/已入账状态 - 绿色
    else if (statusLower === 'settled' || statusLower === 'matched' || statusLower === 'deposited' ||
             statusLower.includes('已结算') || statusLower.includes('已匹配') || statusLower.includes('已入账')) {
      color = "success"
      if (statusLower.includes('已入账') || statusLower === 'deposited') {
        displayLabel = "已入账"
      } else if (statusLower.includes('已匹配') || statusLower === 'matched') {
        displayLabel = "已匹配"
      } else {
        displayLabel = "已结算"
      }
    }
    // 未匹配/部分匹配状态 - 橙色/警告色
    else if (statusLower === 'unmatched' || statusLower === 'partial' ||
             statusLower.includes('未匹配') || statusLower.includes('部分匹配')) {
      color = "warning"
      displayLabel = statusLower.includes('部分') || statusLower === 'partial' ? "部分匹配" : "未匹配"
    }
    // 如果还是没有匹配到，使用默认配置
    else {
      displayLabel = statusStr || "未知"
    }
    
    return <Chip label={displayLabel} color={color} size="small" variant="tonal" />
  }

  // 根据 status 值判断颜色，显示 statusLabel 文字
  const getStatusChipWithLabel = (status: string | number | undefined, statusLabel?: string) => {
    const statusNum = typeof status === 'number' ? status : parseInt(String(status || '0'), 10)
    let color: "success" | "error" | "warning" | "info" | "default" = "default"
    
    // 成功状态 - 绿色 (status === 1)
    if (statusNum === 1) {
      color = "success"
    }
    // 失败状态 - 红色 (status === -3 或 -1)
    else if (statusNum === -3 || statusNum === -1) {
      color = "error"
    }
    // 其他状态 - 使用 warning 颜色
    else {
      color = "warning"
    }
    
    const displayLabel = statusLabel || String(status || '未知')
    return <Chip label={displayLabel} color={color} size="small" variant="tonal" />
  }

  const formatAmount = (amount: number, currency: string) => {
    return (
      <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 500 }}>
        {currency} {amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Box>
    )
  }

  // 时间戳转换函数
  const formatTimestamp = (timestamp: number | string | undefined): string => {
    if (!timestamp) return ''
    
    // 如果是字符串，尝试转换为数字
    let ts: number
    if (typeof timestamp === 'string') {
      ts = parseInt(timestamp, 10)
      if (isNaN(ts)) {
        // 如果不是数字字符串，直接返回原字符串
        return timestamp
      }
    } else {
      ts = timestamp
    }
    
    // 判断是秒级还是毫秒级时间戳（大于 10^10 的是秒级）
    const date = ts > 10000000000 ? new Date(ts) : new Date(ts * 1000)
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const formatTime = (time: string | number | undefined) => {
    // 如果是数字，当作时间戳处理
    if (typeof time === 'number') {
      return formatTimestamp(time)
    }
    // 如果是字符串，检查是否是纯数字（时间戳字符串）
    if (typeof time === 'string' && /^\d+$/.test(time)) {
      return formatTimestamp(parseInt(time, 10))
    }
    // 否则直接返回字符串（已经是格式化好的时间）
    return time || ''
  }

  // 格式化渠道显示
  const formatChannel = (channel: string | number | undefined): string => {
    if (channel === undefined || channel === null) return '-'
    
    // 转换为数字进行比较
    const channelNum = typeof channel === 'string' ? parseInt(channel, 10) : channel
    
    // 如果转换失败，返回原值
    if (isNaN(channelNum)) return String(channel)
    
    // 根据渠道值返回对应文本
    switch (channelNum) {
      case 1:
        return '电汇'
      case 2:
        return 'FPS'
      case 3:
        return 'SWIFT'
      case 4:
        return 'Others'
      default:
        return String(channel)
    }
  }

  // 格式化用途显示（根据资金来源ID映射）
  const formatPurpose = (purpose: string | number | undefined): string => {
    if (purpose === undefined || purpose === null || purpose === '') return '-'
    
    // 转换为数字进行比较
    const purposeNum = typeof purpose === 'string' ? parseInt(purpose, 10) : purpose
    
    // 如果转换失败，返回原值
    if (isNaN(purposeNum)) return String(purpose)
    
    // 根据用途ID返回对应中文文本（对应 source_of_funds_data）
    switch (purposeNum) {
      case 0:
        return '未知'
      case 1:
        return '工资'
      case 2:
        return '继承'
      case 3:
        return '离婚协议'
      case 4:
        return '养老金/储蓄'
      case 5:
        return '出售财产'
      case 6:
        return '利息收入'
      case 7:
        return '资本收益'
      case 8:
        return '赌博'
      case 9:
        return '礼物'
      default:
        return String(purpose)
    }
  }

  // 根据币种返回不同的颜色配置
  const getCurrencyColor = (currency: string) => {
    const colorMap: Record<string, { bgcolor: string; color: string; borderColor: string }> = {
      USD: { bgcolor: '#e3f2fd', color: '#1976d2', borderColor: '#1976d2' }, // 蓝色
      HKD: { bgcolor: '#fff3e0', color: '#f57c00', borderColor: '#f57c00' }, // 橙色
      CNY: { bgcolor: '#ffebee', color: '#d32f2f', borderColor: '#d32f2f' }, // 红色
      EUR: { bgcolor: '#e8f5e9', color: '#2e7d32', borderColor: '#2e7d32' }, // 绿色
      GBP: { bgcolor: '#f3e5f5', color: '#7b1fa2', borderColor: '#7b1fa2' }, // 紫色
      JPY: { bgcolor: '#fff9c4', color: '#f9a825', borderColor: '#f9a825' }, // 黄色
    }
    return colorMap[currency] || { bgcolor: '#f5f5f5', color: '#757575', borderColor: '#bdbdbd' } // 默认灰色
  }

  // 加载指定客户的最近3笔流水
  const loadCustomerRecentTransactionsForExpand = async (customerId: string, userId: number) => {
    // 如果已经有数据，不再重复加载
    if (customerRecentTransactionsMap[customerId]) {
      return
    }
    
    try {
      setLoadingRecentTransactionsMap(prev => ({ ...prev, [customerId]: true }))
      const response = await getCustomerRecentTransactions(userId)
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setCustomerRecentTransactionsMap(prev => ({
        ...prev,
        [customerId]: actualData as CustomerRecentTransactionsResponse
      }))
    } catch (error) {
      console.error(`❌ 加载客户 ${customerId} 最近交易失败:`, error)
      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
    } finally {
      setLoadingRecentTransactionsMap(prev => ({ ...prev, [customerId]: false }))
    }
  }

  // 切换客户展开/折叠
  const toggleCustomerExpand = (customerId: string, userId: number) => {
    const isExpanding = !expandedCustomers.includes(customerId)
    
    // 计算展开后的客户列表
    const newExpandedCustomers = isExpanding
      ? [...expandedCustomers, customerId]
      : expandedCustomers.filter(id => id !== customerId)
    
    setExpandedCustomers(newExpandedCustomers)
    
    // 更新选中的客户ID，用于显示最近3笔流水
    if (isExpanding) {
      // 展开时，更新为当前点击的客户
      setSelectedCustomerId(userId)
      // 同时加载到 customerRecentTransactions 状态，用于下方显示
      loadCustomerRecentTransactions(userId)
      loadCustomerRecentTransactionsForExpand(customerId, userId)
    } else {
      // 如果收起，检查是否还有其他展开的客户
      // 如果有，切换到第一个展开的客户；如果没有，清除选中状态
      if (newExpandedCustomers.length > 0) {
        // 找到第一个剩余客户的userId
        const remainingCustomer = customerAssetSummaries.find(c => c.customerId === newExpandedCustomers[0])
        if (remainingCustomer) {
          setSelectedCustomerId(remainingCustomer.userId)
          loadCustomerRecentTransactions(remainingCustomer.userId)
        }
      } else {
        setSelectedCustomerId(null)
        setCustomerRecentTransactions(null)
      }
    }
  }

  const exportCSV = () => {
    alert("导出 CSV 功能")
  }

  // Tab 1: Overview - Materialize Style
  const renderOverview = () => (
    <div className='flex flex-col gap-6'>
      {/* Quick Actions - Compact Buttons */}
      <Card>
        <CardHeader title='快捷操作' />
        <CardContent>
          <div className='flex flex-wrap gap-3'>
            <Button
              variant='contained'
              color='success'
              startIcon={<i className='ri-add-circle-line' />}
              onClick={() => setManualDepositOpen(true)}
              className='font-medium'
            >
              手动入金
            </Button>
            <Button
              variant='contained'
              color='error'
              startIcon={<i className='ri-subtract-circle-line' />}
              onClick={() => {
                resetWithdrawalForm()
                setManualWithdrawalOpen(true)
              }}
              className='font-medium'
            >
              手动出金
            </Button>
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='ri-hand-coin-line' />}
              onClick={() => setActiveTab("deposits")}
              className='font-medium'
            >
              入账认领
            </Button>
            <Button
              variant='contained'
              color='warning'
              startIcon={<i className='ri-file-check-line' />}
              onClick={() => setActiveTab("withdrawals")}
              className='font-medium'
            >
              出金审批
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='ri-upload-cloud-line' />}
              className='font-medium'
            >
              导入对账单
            </Button>
            <Button
              variant='outlined'
              color='info'
              startIcon={<i className='ri-file-list-3-line' />}
              onClick={() => setActiveTab("transactions")}
              className='font-medium'
            >
              流水查询
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - 5 Cards in a Row */}
      <Grid container spacing={6}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={index}>
            <Card className='bs-full' sx={{ position: 'relative', overflow: 'visible' }}>
              <CardContent className='p-6'>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant='body2' color='text.secondary' className='mb-2'>
                      {metric.label}
                    </Typography>
                    <Tooltip title={metric.value} arrow placement="top">
                      <Typography 
                        variant='h4' 
                        className='font-bold'
                        sx={{ 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.2,
                          cursor: 'help'
                        }}
                      >
                        {metric.value}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: metric.trend === 'up' 
                        ? 'success.lighter'
                        : metric.trend === 'down'
                        ? 'error.lighter'
                        : 'primary.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: metric.trend === 'up' 
                        ? 'success.main'
                        : metric.trend === 'down'
                        ? 'error.main'
                        : 'primary.main',
                      flexShrink: 0,
                      ml: 2
                    }}
                  >
                    {index === 0 && <i className='ri-money-dollar-circle-line text-[28px]' />}
                    {index === 1 && <i className='ri-arrow-right-up-line text-[28px]' />}
                    {index === 2 && <i className='ri-alert-line text-[28px]' />}
                    {index === 3 && <i className='ri-file-list-line text-[28px]' />}
                    {index === 4 && <i className='ri-question-line text-[28px]' />}
                    {index === 5 && <i className='ri-error-warning-line text-[28px]' />}
                  </Box>
                </Box>
                
                {metric.change && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={metric.change}
                      size='small'
                      color={metric.trend === 'up' ? 'success' : 'error'}
                      variant='tonal'
                      icon={<i className={metric.trend === 'up' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      较昨日
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts - Three Column Layout */}
      <Grid container spacing={6}>
        {/* Asset Distribution Pie Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='资产分布'
            />
            <CardContent>
              <ResponsiveContainer width='100%' height={280}>
                <PieChart>
                  <Pie
                    data={assetDistributionData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey='value'
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(2)}%`}
                  >
                    {assetDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => {
                      // 根据数值大小动态格式化
                      if (value >= 1000000) {
                        const millions = Math.floor(value / 1000000 * 100) / 100
                        return `$${millions}M`
                      } else if (value >= 1000) {
                        const thousands = Math.floor(value / 1000 * 100) / 100
                        return `$${thousands}K`
                      } else {
                        return `$${Math.floor(value * 100) / 100}`
                      }
                    }}
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none',
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      boxShadow: 'var(--mui-customShadows-lg)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className='flex flex-col gap-2 mt-4'>
                {assetDistributionData.map((item) => (
                  <div key={item.name} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div 
                        className='w-3 h-3 rounded-full' 
                        style={{ backgroundColor: item.color }}
                      />
                      <Typography variant='body2'>{item.name}</Typography>
                    </div>
                    <Typography variant='body2' className='font-mono font-medium'>
                      {(() => {
                        if (item.value >= 1000000) {
                          return `$${Math.floor(item.value / 1000000 * 10) / 10}M`
                        } else if (item.value >= 1000) {
                          return `$${Math.floor(item.value / 1000 * 10) / 10}K`
                        } else {
                          return `$${Math.floor(item.value * 100) / 100}`
                        }
                      })()}
                    </Typography>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* AUM Trend Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='AUM 趋势'
              subheader='近7天'
            />
            <CardContent>
              <ResponsiveContainer width='100%' height={280}>
                <AreaChart data={aumTrendData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id='colorAum' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='var(--mui-palette-primary-main)' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='var(--mui-palette-primary-main)' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='var(--mui-palette-divider)' vertical={false} />
                  <XAxis 
                    dataKey='date' 
                    stroke='var(--mui-palette-text-secondary)' 
                    style={{ fontSize: '0.7rem' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke='var(--mui-palette-text-secondary)'
                    style={{ fontSize: '0.7rem' }}
                    tickFormatter={(value) => `$${formatCurrencyValue(value)}`}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`$${formatCurrencyValue(value)}`, 'AUM']}
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none',
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      boxShadow: 'var(--mui-customShadows-lg)'
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey='aum'
                    stroke='var(--mui-palette-primary-main)'
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill='url(#colorAum)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cash Flow Trend */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='资金流动'
              subheader='入金 vs 出金'
            />
            <CardContent>
              <ResponsiveContainer width='100%' height={280}>
                <LineChart data={flowTrendData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='var(--mui-palette-divider)' vertical={false} />
                  <XAxis 
                    dataKey='date' 
                    stroke='var(--mui-palette-text-secondary)' 
                    style={{ fontSize: '0.7rem' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke='var(--mui-palette-text-secondary)'
                    style={{ fontSize: '0.7rem' }}
                    tickFormatter={(value) => `$${formatCurrencyValue(value)}`}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => `$${formatCurrencyValue(value)}`}
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none',
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      boxShadow: 'var(--mui-customShadows-lg)'
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='inflow'
                    stroke='var(--mui-palette-success-main)'
                    strokeWidth={2.5}
                    name='入金'
                    dot={{ fill: 'var(--mui-palette-success-main)', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='outflow'
                    stroke='var(--mui-palette-error-main)'
                    strokeWidth={2.5}
                    name='出金'
                    dot={{ fill: 'var(--mui-palette-error-main)', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Currency Distribution */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' sx={{ mb: 3, fontWeight: 600, color: '#212121' }}>
          币种分布
        </Typography>
        <Grid container spacing={6}>
          {assetDistributionData.map((item, index) => {
            // 根据币种名称确定标签和颜色
            const currencyConfig: Record<string, { label: string; color: 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info' }> = {
              'USD': { label: '美元', color: 'primary' },
              'HKD': { label: '港币', color: 'secondary' },
              'CNY': { label: '人民币', color: 'warning' },
              'EUR': { label: '欧元', color: 'success' },
              'GBP': { label: '英镑', color: 'error' },
            }
            const config = currencyConfig[item.name] || { label: item.name, color: 'info' }
            
            return (
              <Grid key={item.name} size={{ xs: 12, md: 4 }}>
                <Card className='bs-full'>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Chip 
                        label={config.label} 
                        size='small' 
                        sx={{ 
                          bgcolor: `${config.color}.lighter`, 
                          color: `${config.color}.main`, 
                          fontWeight: 500 
                        }} 
                      />
                    </Box>
                    <Typography variant='h4' sx={{ fontFamily: 'monospace', mb: 2, fontWeight: 600, color: `${config.color}.main` }}>
                      ${item.value.toLocaleString()}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant='caption' color='text.secondary'>
                          占比
                        </Typography>
                        <Typography variant='caption' sx={{ fontWeight: 600 }}>
                          {item.percentage.toFixed(2)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant='determinate' 
                        value={item.percentage} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: `${config.color}.lighter`,
                          '& .MuiLinearProgress-bar': { bgcolor: `${config.color}.main` },
                        }} 
                      />
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' color='text.secondary'>
                          资产可用
                        </Typography>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          ${(item.available || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' color='text.secondary'>
                          今日入金
                        </Typography>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', color: 'success.main', fontWeight: 500 }}>
                          +${(item.todayInflow || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' color='text.secondary'>
                          今日出金
                        </Typography>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', color: 'error.main', fontWeight: 500 }}>
                          -${(item.todayOutflow || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      {/* Channel Statistics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' sx={{ mb: 3, fontWeight: 600, color: '#212121' }}>
          渠道统计
        </Typography>
        <Grid container spacing={6}>
          {apiData?.channelStats?.map((stat, index) => {
            // 根据渠道类型映射图标、颜色等
            const channelConfig = {
              wire: {
                icon: 'ri-bank-line',
                color: 'primary'
              },
              fps: {
                icon: 'ri-exchange-line',
                color: 'secondary'
              },
              swift: {
                icon: 'ri-arrow-up-line',
                color: 'warning'
              },
              other: {
                icon: 'ri-arrow-down-line',
                color: 'success'
              }
            }[stat.channel] || {
              icon: 'ri-arrow-down-line',
              color: 'success'
            }

            return (
              <Grid key={stat.channel} size={{ xs: 12, md: 3 }}>
                <Card className='bs-full' sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${channelConfig.color}.lighter`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className={`${channelConfig.icon} text-[28px]`} style={{ color: `var(--mui-palette-${channelConfig.color}-main)` }} />
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          {stat.label}
                        </Typography>
                        <Typography variant='h5' sx={{ fontWeight: 600, color: `${channelConfig.color}.main` }}>
                          {stat.totalCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='caption' color='text.secondary'>
                        今日交易
                      </Typography>
                      {stat.todayCount > 0 ? (
                        <Chip label={`+${stat.todayCount}`} size='small' color='success' sx={{ fontWeight: 600 }} />
                      ) : (
                        <Chip label="0" size='small' color='default' sx={{ fontWeight: 600 }} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      {/* Recent Activity & Todo Items Row */}
      <Grid container spacing={6}>
        {/* Recent Activity - Left side 2/3 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card className='bs-full'>
            <CardHeader
              title='最近活动'
              action={
                <OptionsMenu
                  iconButtonProps={{ color: 'default' }}
                  options={[
                    { text: '查看全部', icon: 'ri-eye-line' },
                    { text: '导出数据', icon: 'ri-download-line' }
                  ]}
                />
              }
            />
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>客户</th>
                    <th>币种/金额</th>
                    <th>类型</th>
                    <th>渠道</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className='hover:bg-actionHover cursor-pointer'>
                      <td className='text-sm'>{formatTime(tx.time)}</td>
                      <td>
                        <div className='flex items-center gap-3'>
                          <CustomAvatar skin='light' size={34}>
                            {tx.customer[0]}
                          </CustomAvatar>
                          <div className='flex flex-col'>
                            <Typography className='font-medium' color='text.primary'>
                              {tx.customer}
                            </Typography>
                            {tx.userId && (
                              <Typography variant='body2'>ID: {tx.userId}</Typography>
                            )}
                            {tx.email && (
                              <Typography variant='body2' color='text.secondary'>
                                {tx.email}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatAmount(tx.amount, tx.currency)}</td>
                      <td>
                      <Chip
                          label={tx.direction === 'in' ? '入金' : '出金'}
                          size='small'
                          variant='tonal'
                          color={tx.direction === 'in' ? 'success' : 'error'}
                          icon={<i className={tx.direction === 'in' ? 'ri-arrow-down-line' : 'ri-arrow-up-line'} />}
                        />
                      </td>
                      <td className='text-sm'>{formatChannel(tx.channel)}</td>
                      <td>{getStatusChip(tx.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Grid>

        {/* Todo Items - Right side 1/3 */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='待办事项'
              subheader='点击跳转到对应页面'
              action={
                <Chip 
                  label={`${todoItems.reduce((sum, item) => sum + item.count, 0)} 项待处理`}
                  color='primary'
                  size='small'
                  variant='tonal'
                />
              }
            />
            <CardContent className='flex flex-col gap-1'>
              {todoItems.map((item, index) => (
                <Box
                  key={index}
                  onClick={() => {
                    if (item.title === "入账认领") setActiveTab("deposits")
                    else if (item.title === "出金审批") setActiveTab("withdrawals")
                    else if (item.title === "未匹配来账" || item.title === "对账差异") setActiveTab("reconciliation")
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: `${item.color}.lighter`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.title === "入账认领" && <i className='ri-hand-coin-line text-xl' style={{ color: 'var(--mui-palette-warning-main)' }} />}
                      {item.title === "出金审批" && <i className='ri-file-check-line text-xl' style={{ color: 'var(--mui-palette-error-main)' }} />}
                      {item.title === "未匹配来账" && <i className='ri-question-line text-xl' style={{ color: 'var(--mui-palette-info-main)' }} />}
                      {item.title === "对账差异" && <i className='ri-error-warning-line text-xl' style={{ color: 'var(--mui-palette-error-main)' }} />}
                    </Box>
                    <Typography variant='body1' className='font-medium'>
                      {item.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={item.count}
                      color={item.color}
                      size='small'
                      sx={{ 
                        fontWeight: 700, 
                        minWidth: 32,
                        height: 24
                      }}
                    />
                    <i className='ri-arrow-right-s-line text-xl text-textSecondary' />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )

  // Tab 2: Customer Assets - Materialize Style
  const renderCustomerAssets = () => (
    <div className='flex flex-col gap-6'>
      {/* Filters */}
      <Card>
        <CardHeader title='筛选条件' />
        <CardContent>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>币种</InputLabel>
                <Select 
                  value={customerAssetsCurrency} 
                  onChange={(e) => {
                    setCustomerAssetsCurrency(e.target.value)
                  }}
                  label='币种'
                >
                  <MenuItem value='all'>全部币种</MenuItem>
                  <MenuItem value='USD'>USD - 美元</MenuItem>
                  <MenuItem value='HKD'>HKD - 港币</MenuItem>
                  {/* <MenuItem value='CNY'>CNY - 人民币</MenuItem> */}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='搜索'
                fullWidth
                placeholder='客户ID、邮箱、姓名'
                value={customerAssetsKeyword}
                onChange={(e) => setCustomerAssetsKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setCustomerAssetsPage(0)
                    loadCustomerAssets()
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<i className='ri-upload-2-line text-xl' />}
            onClick={exportCSV}
            className='max-sm:is-full'
          >
            导出 Excel
          </Button>
          <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
            <Button 
              variant='outlined' 
              startIcon={<i className='ri-restart-line' />}
              onClick={() => {
                setCustomerAssetsKeyword('')
                setCustomerAssetsCurrency('all')
                setCustomerAssetsPage(0)
                // 直接传入重置后的参数，避免状态更新延迟问题
                loadCustomerAssets('', 'all', 0)
              }}
              className='max-sm:is-full'
            >
              重置
            </Button>
            <Button 
              variant='contained' 
              startIcon={<i className='ri-search-line' />}
              onClick={() => {
                setCustomerAssetsPage(0)
                loadCustomerAssets()
              }}
              className='max-sm:is-full'
            >
              查询
            </Button>
          </div>
        </div>
        <Divider />

      <Card sx={{ boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600, width: 50 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>客户信息</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  总资产 (USD)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  较昨日
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>币种数</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>最后活动</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerAssetsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <CircularProgress size={30} />
                      <Typography variant='body1' color='text.secondary'>
                        加载客户资产数据中...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : customerAssetSummaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant='body1' color='text.secondary'>
                      暂无数据
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customerAssetSummaries.map((customer) => (
                  <React.Fragment key={customer.customerId}>
                    {/* Customer Summary Row */}
                    <TableRow
                      hover
                      sx={{
                        cursor: "pointer",
                        bgcolor: expandedCustomers.includes(customer.customerId) ? "#e3f2fd" : "inherit",
                        "&:hover": { bgcolor: expandedCustomers.includes(customer.customerId) ? "#bbdefb" : "#f5f5f5" },
                      }}
                      onClick={() => toggleCustomerExpand(customer.customerId, customer.userId)}
                    >
                      <TableCell>
                        <IconButton size="small">
                          {expandedCustomers.includes(customer.customerId) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: customer.customerType === "enterprise" ? "#7c3aed" : "#1976d2",
                              fontSize: "0.95rem",
                            }}
                          >
                            {customer.customerType === "enterprise" ? <BusinessIcon /> : customer.customerName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {customer.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.customerId}
                              {" · "}
                              {customer.customerType === "enterprise" ? "企业" : "个人"}
                            </Typography>
                            {customer.customerEmail && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                {customer.customerEmail}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", color: "#1976d2" }}>
                          ${customer.totalAssetUSD.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                          {customer.dayChangePercent > 0 ? (
                            <i className="ri-trending-up-line" style={{ fontSize: 18, color: "#2e7d32" }} />
                          ) : customer.dayChangePercent < 0 ? (
                            <i className="ri-trending-down-line" style={{ fontSize: 18, color: "#d32f2f" }} />
                          ) : null}
                          <Typography
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              color:
                                customer.dayChangePercent > 0
                                  ? "#2e7d32"
                                  : customer.dayChangePercent < 0
                                    ? "#d32f2f"
                                    : "#757575",
                            }}
                          >
                            {customer.dayChangePercent > 0 ? "+" : ""}
                            {customer.dayChangePercent.toFixed(2)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {customer.currencyBreakdown.map((cb, index) => {
                            const currencyColor = getCurrencyColor(cb.currency)
                            return (
                              <Chip
                                key={`${customer.customerId}-${cb.currency}-${index}`}
                                label={cb.currency}
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  height: 22,
                                  bgcolor: currencyColor.bgcolor,
                                  color: currencyColor.color,
                                  borderColor: currencyColor.borderColor,
                                  fontWeight: 600,
                                  '&:hover': {
                                    bgcolor: currencyColor.bgcolor,
                                    opacity: 0.8,
                                  },
                                }}
                              />
                            )
                          })}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(customer.lastActivity)}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="流水查询">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setTransactionFilters({
                                  ...transactionFilters,
                                  userId: customer.userId.toString()
                                })
                                setTransactionFlowPage(0)
                                setTimeout(() => {
                                  setActiveTab("transactions")
                                }, 100)
                              }}
                              sx={{ color: "#1976d2" }}
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="手动入金">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                // 设置客户信息并锁定
                                setDepositForm({
                                  ...depositForm,
                                  customerId: customer.userId,
                                  customerName: customer.customerName,
                                  customerEmail: customer.customerEmail || '',
                                })
                                setDepositFormCustomerLocked(true)
                                // 设置搜索选项以便显示
                                if (customer.customerEmail) {
                                  setCustomerSearchOptions([{
                                    id: customer.userId,
                                    name: customer.customerName,
                                    email: customer.customerEmail,
                                  }])
                                  setCustomerSearchInput(`${customer.customerName} (${customer.customerEmail})`)
                                }
                                setManualDepositOpen(true)
                              }} 
                              sx={{ color: "#2e7d32" }}
                            >
                              <AddCircleOutlineIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="手动出金">
                            <IconButton
                              size="small"
                              onClick={() => {
                                // 设置客户信息并锁定，清空其他字段
                                setWithdrawalForm({
                                  customerId: customer.userId,
                                  customerName: customer.customerName,
                                  customerEmail: customer.customerEmail || '',
                                  currency: "USD",
                                  amount: "",
                                  channel: "",
                                  referenceNumber: "",
                                  notes: "",
                                  attachment: null,
                                  voucherUrl: "",
                                  bankAccountId: null,
                                })
                                setWithdrawalFormCustomerLocked(true)
                                // 设置搜索选项以便显示
                                if (customer.customerEmail) {
                                  setWithdrawalCustomerSearchOptions([{
                                    id: customer.userId,
                                    name: customer.customerName,
                                    email: customer.customerEmail,
                                  }])
                                  setWithdrawalCustomerSearchInput(`${customer.customerName} (${customer.customerEmail})`)
                                }
                                // 清空银行账号列表和手续费，重新加载
                                setBankAccountList([])
                                setOutCashFee("")
                                // 加载银行账号列表和手续费
                                loadBankAccountList(customer.userId)
                                loadOutCashFee("USD")
                                setManualWithdrawalOpen(true)
                              }}
                              sx={{ color: "#ed6c02" }}
                            >
                              <RemoveCircleOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Currency Details */}
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ py: 0, borderBottom: expandedCustomers.includes(customer.customerId) ? 1 : 0 }}
                      >
                        <Collapse in={expandedCustomers.includes(customer.customerId)} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 2, bgcolor: "#fafafa" }}>
                            {customer.currencyBreakdown.length === 0 ? (
                              <div className='flex items-center justify-center py-8'>
                                <Typography variant='body2' color='text.secondary'>
                                  <i className='ri-inbox-line mie-2' />
                                  暂无币种数据
                                </Typography>
                              </div>
                            ) : (
                              <Card className='bs-full'>
                                <CardHeader
                                  title={
                                    <div className='flex items-center gap-2'>
                                      <i className='ri-bank-line text-primary' />
                                      <Typography variant='h6' className='font-semibold'>
                                        币种明细
                                      </Typography>
                                    </div>
                                  }
                                  className='pbe-2'
                                />
                                <CardContent>
                                  <div className='overflow-x-auto'>
                                    <table className={tableStyles.table}>
                                      <thead>
                                        <tr>
                                          <th>币种</th>
                                          <th className='text-right'>可用</th>
                                          <th className='text-right'>冻结</th>
                                          <th className='text-right'>在途</th>
                                          <th className='text-right'>总计</th>
                                          <th className='text-right'>近7日入金</th>
                                          <th className='text-right'>近7日出金</th>
                                          {/* <th>上次对账</th> */}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {customer.currencyBreakdown.map((cb, index) => {
                                          const currencyColor = getCurrencyColor(cb.currency)
                                          return (
                                            <tr key={`${customer.customerId}-${cb.currency}-${index}`} className='hover:bg-actionHover'>
                                              <td>
                                                <Chip 
                                                  label={cb.currency} 
                                                  size='small' 
                                                  variant='tonal'
                                                  sx={{
                                                    bgcolor: currencyColor.bgcolor,
                                                    color: currencyColor.color,
                                                    fontWeight: 600,
                                                  }}
                                                />
                                              </td>
                                              <td className='text-right font-mono'>
                                                <Typography sx={{ color: "#2e7d32", fontWeight: 500 }}>
                                                  {cb.available.toLocaleString('en-US', { 
                                                    minimumFractionDigits: 2, 
                                                    maximumFractionDigits: 2 
                                                  })}
                                                </Typography>
                                              </td>
                                              <td className='text-right font-mono'>
                                                <Typography sx={{ color: "#ed6c02", fontWeight: 500 }}>
                                                  {cb.frozen.toLocaleString('en-US', { 
                                                    minimumFractionDigits: 2, 
                                                    maximumFractionDigits: 2 
                                                  })}
                                                </Typography>
                                              </td>
                                              <td className='text-right font-mono'>
                                                <Typography sx={{ color: "#1976d2", fontWeight: 500 }}>
                                                  {cb.inTransit.toLocaleString('en-US', { 
                                                    minimumFractionDigits: 2, 
                                                    maximumFractionDigits: 2 
                                                  })}
                                                </Typography>
                                              </td>
                                              <td className='text-right font-mono font-semibold'>
                                                {(cb.available + cb.frozen + cb.inTransit).toLocaleString('en-US', { 
                                                  minimumFractionDigits: 2, 
                                                  maximumFractionDigits: 2 
                                                })}
                                              </td>
                                              <td className='text-right font-mono'>
                                                <Typography sx={{ color: "#2e7d32", fontWeight: 500 }}>
                                                  +{cb.recentDeposit7d.toLocaleString('en-US', { 
                                                    minimumFractionDigits: 2, 
                                                    maximumFractionDigits: 2 
                                                  })}
                                                </Typography>
                                              </td>
                                              <td className='text-right font-mono'>
                                                <Typography sx={{ color: "#d32f2f", fontWeight: 500 }}>
                                                  -{cb.recentWithdraw7d.toLocaleString('en-US', { 
                                                    minimumFractionDigits: 2, 
                                                    maximumFractionDigits: 2 
                                                  })}
                                                </Typography>
                                              </td>
                                              {/* <td>
                                                <Typography variant='body2' color='text.secondary'>
                                                  {formatTime(cb.lastReconciliation)}
                                                </Typography>
                                              </td> */}
                                            </tr>
                                          )
                                        })}
                                        {/* <tr className='font-semibold border-t border-divider'>
                                          <td>合计</td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                          <td className='text-right font-mono font-semibold text-primary'>
                                            {customer.currencyBreakdown.reduce((sum, cb) => 
                                              sum + cb.available + cb.frozen + cb.inTransit, 0
                                            ).toLocaleString('en-US', { 
                                              minimumFractionDigits: 2, 
                                              maximumFractionDigits: 2 
                                            })}
                                          </td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                        </tr> */}
                                      </tbody>
                                    </table>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component='div'
        className='border-bs'
        count={customerAssetsData?.total || customerAssetSummaries.length}
        rowsPerPage={customerAssetsPageSize}
        page={customerAssetsPage}
        onPageChange={(_event, newPage) => setCustomerAssetsPage(newPage)}
        onRowsPerPageChange={(event) => {
          setCustomerAssetsPageSize(parseInt(event.target.value, 10))
          setCustomerAssetsPage(0)
        }}
      />
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader 
          title='最近3笔流水' 
          subheader={selectedCustomerId ? `客户ID: ${selectedCustomerId}` : '请点击上方客户列表选择客户'}
        />
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className='text-left'>时间</th>
                <th className='text-left'>币种/金额</th>
                <th className='text-left'>方向</th>
                <th className='text-left'>渠道</th>
                <th className='text-left'>状态</th>
              </tr>
            </thead>
            <tbody>
            {!selectedCustomerId ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <i className='ri-information-line text-4xl' style={{ color: 'var(--mui-palette-text-secondary)' }} />
                    <Typography variant='body1' color='text.secondary'>
                      请点击上方客户列表选择客户查看其最近3笔流水
                    </Typography>
                  </Box>
                </td>
              </tr>
            ) : recentTransactionsLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant='body1' color='text.secondary'>
                      加载客户流水中...
                    </Typography>
                  </Box>
                </td>
              </tr>
            ) : !customerRecentTransactions || customerRecentTransactions.list.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <Typography variant='body1' color='text.secondary'>
                    该客户暂无流水记录
                  </Typography>
                </td>
              </tr>
            ) : (
              customerRecentTransactions.list.slice(0, 3).map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <Typography variant='body2' color='text.secondary'>
                      {formatTime(tx.time)}
                    </Typography>
                  </td>
                  <td>{formatAmount(tx.amount, tx.currency)}</td>
                  <td>
                    <Chip
                      label={tx.directionLabel || (tx.direction === 'in' ? '入金' : '出金')}
                      size='small'
                      color={tx.direction === 'in' ? 'success' : 'error'}
                      sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  </td>
                  <td>
                    <Typography variant='body2'>{tx.channel}</Typography>
                  </td>
                  <td>
                    <Chip
                      label={tx.status}
                      size='small'
                      color={
                        tx.status === 'completed' || tx.status === '1' ? 'success' : 
                        tx.status === 'failed' || tx.status === '-3' || tx.status === '-1' ? 'error' : 
                        'warning'
                      }
                      sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  // Tab 3: Transaction Query
  const renderTransactions = () => {
    // 查找当前筛选的客户信息
    const filteredCustomer = transactionFilters.userId 
      ? customerAssetSummaries.find(customer => customer.userId.toString() === transactionFilters.userId)
      : null

    return (
      <Box>
        {/* 客户筛选提示 */}
        {filteredCustomer && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            onClose={() => {
              setTransactionFilters({ ...transactionFilters, userId: '' })
              setTransactionFlowPage(0)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-user-line' />
              <Typography variant='body2'>
                正在查看客户 <strong>{filteredCustomer.customerName}</strong> (ID: {filteredCustomer.customerId}) 的流水记录
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardHeader title='筛选条件' />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AppReactDatepicker
                  selected={parseDateTimeString(transactionFilters.startTime)}
                  onChange={(date: Date | null) => {
                    setTransactionFilters({ 
                      ...transactionFilters, 
                      startTime: formatDateToString(date, true) 
                    })
                  }}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="选择开始日期"
                  isClearable
                  customInput={
                    <TextField
                      fullWidth
                      label="开始日期"
                      InputLabelProps={{ shrink: true }}
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AppReactDatepicker
                  selected={parseDateTimeString(transactionFilters.endTime)}
                  onChange={(date: Date | null) => {
                    setTransactionFilters({ 
                      ...transactionFilters, 
                      endTime: formatDateToString(date, false) 
                    })
                  }}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="选择结束日期"
                  isClearable
                  minDate={parseDateTimeString(transactionFilters.startTime) || undefined}
                  customInput={
                    <TextField
                      fullWidth
                      label="结束日期"
                      InputLabelProps={{ shrink: true }}
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="客户ID"
                  fullWidth
                  placeholder="输入客户ID"
                  value={transactionFilters.userId}
                  onChange={(e) => setTransactionFilters({ ...transactionFilters, userId: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>交易类型</InputLabel>
                  <Select 
                    value={transactionFilters.type} 
                    onChange={(e) => setTransactionFilters({ ...transactionFilters, type: e.target.value })}
                    label='交易类型'
                  >
                    <MenuItem value="all">全部</MenuItem>
                    <MenuItem value="1">现金入金</MenuItem>
                    <MenuItem value="2">现金出金</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>资金类型</InputLabel>
                  <Select 
                    value={transactionFilters.amountType} 
                    onChange={(e) => setTransactionFilters({ ...transactionFilters, amountType: e.target.value })}
                    label='资金类型'
                  >
                    <MenuItem value="all">全部</MenuItem>
                    <MenuItem value="1">美金 (USD)</MenuItem>
                    <MenuItem value="2">港币 (HKD)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>状态</InputLabel>
                  <Select 
                    value={transactionFilters.status} 
                    onChange={(e) => setTransactionFilters({ ...transactionFilters, status: e.target.value })}
                    label='状态'
                  >
                    <MenuItem value="99">全部</MenuItem>
                    <MenuItem value="1">处理完成</MenuItem>
                    <MenuItem value="0">待处理</MenuItem>
                    <MenuItem value="2">处理中</MenuItem>
                    <MenuItem value="-3">处理失败</MenuItem>
                    <MenuItem value="-1">客户取消</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="关键词搜索"
                  fullWidth
                  placeholder="参考号、备注..."
                  value={transactionFilters.keyword}
                  onChange={(e) => setTransactionFilters({ ...transactionFilters, keyword: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', height: '100%' }}>
                  <Button 
                    variant="outlined"
                    color="secondary"
                    startIcon={<i className='ri-restart-line' />}
                    onClick={() => {
                      const resetFilters = {
                        startTime: "",
                        endTime: "",
                        userId: "",
                        type: "all",
                        amountType: "all",
                        status: "99",
                        keyword: "",
                      }
                      setTransactionFilters(resetFilters)
                      setTransactionFlowPage(0)
                      // 直接传入重置后的筛选条件和页码，避免状态更新延迟问题
                      loadTransactionFlow(resetFilters, 0)
                    }}
                  >
                    重置
                  </Button>
                  <Button 
                    variant="contained"
                    startIcon={<i className='ri-search-line' />}
                    onClick={() => {
                      setTransactionFlowPage(0)
                      loadTransactionFlow()
                    }}
                  >
                    查询
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600 }}>时间</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>客户</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>客户ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>币种/金额</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>类型</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>渠道</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>参考号</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactionFlowLoading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                    加载中...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : transactionFlowList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant='body2' color='text.secondary'>
                    暂无数据
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactionFlowList.map((tx) => (
                <TableRow
                  key={tx.id}
                  hover
                  sx={{
                    "&:hover": { bgcolor: "#f8f9fa" },
                    "&:nth-of-type(even)": { bgcolor: "#fafafa" },
                  }}
                >
                  <TableCell sx={{ fontSize: "0.875rem" }}>{formatTime(tx.time)}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{tx.customer}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", fontFamily: "monospace", color: "#666" }}>
                    {tx.accountId}
                  </TableCell>
                  <TableCell>{formatAmount(tx.amount, tx.currency)}</TableCell>
                  <TableCell>
                    <Chip
                      label={tx.direction === "in" ? "入金" : "出金"}
                      size="small"
                      icon={tx.direction === "in" ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      sx={{
                        bgcolor: tx.direction === "in" ? "#e8f5e9" : "#ffebee",
                        color: tx.direction === "in" ? "#2e7d32" : "#d32f2f",
                        fontWeight: 500,
                        border: "none",
                      }}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>{tx.channel}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                        {tx.reference || '-'}
                      </Typography>
                      {tx.reference && (
                        <Tooltip title="复制参考号">
                          <IconButton
                            size="small"
                            onClick={async () => {
                              const success = await copyToClipboard(tx.reference)
                              if (success) {
                                setSnackbar({ open: true, message: "已复制到剪贴板", severity: "success" })
                              } else {
                                setSnackbar({ open: true, message: "复制失败，请手动复制", severity: "error" })
                              }
                            }}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChipWithLabel(tx.status, tx.statusLabel)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component='div'
          className='border-bs'
          count={transactionFlowData?.total || 0}
          rowsPerPage={transactionFlowPageSize}
          page={transactionFlowPage}
          onPageChange={(_event, newPage) => setTransactionFlowPage(newPage)}
          onRowsPerPageChange={(event) => {
            setTransactionFlowPageSize(parseInt(event.target.value, 10))
            setTransactionFlowPage(0)
          }}
        />
      </TableContainer>
    </Box>
    )
  }

  // Tab 4: Deposit Claims - Materialize Style
  const renderDepositClaims = () => (
    <div className='flex flex-col gap-6'>
      {/* Filters */}
      <Card>
        <CardHeader title='筛选条件' />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>状态</InputLabel>
                <Select 
                  value={depositClaimFilters.status} 
                  onChange={(e) => {
                    setDepositClaimFilters({ ...depositClaimFilters, status: e.target.value })
                  }}
                  label='状态'
                >
                  <MenuItem value='all'>全部</MenuItem>
                  <MenuItem value='0'>待处理</MenuItem>
                  <MenuItem value='2'>处理中</MenuItem>
                  <MenuItem value='1'>处理完成</MenuItem>
                  <MenuItem value='-3'>处理失败</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>匹配状态</InputLabel>
                <Select 
                  value={depositClaimFilters.matchStatus} 
                  onChange={(e) => {
                    setDepositClaimFilters({ ...depositClaimFilters, matchStatus: e.target.value })
                  }}
                  label='匹配状态'
                >
                  <MenuItem value='all'>全部</MenuItem>
                  <MenuItem value='0'>未匹配</MenuItem>
                  <MenuItem value='1'>已匹配</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppReactDatepicker
                selected={parseDateTimeString(depositClaimFilters.startTime)}
                onChange={(date: Date | null) => {
                  setDepositClaimFilters({ 
                    ...depositClaimFilters, 
                    startTime: formatDateToString(date, true) 
                  })
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择开始日期"
                isClearable
                customInput={
                  <TextField
                    fullWidth
                    label="开始日期"
                    InputLabelProps={{ shrink: true }}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppReactDatepicker
                selected={parseDateTimeString(depositClaimFilters.endTime)}
                onChange={(date: Date | null) => {
                  setDepositClaimFilters({ 
                    ...depositClaimFilters, 
                    endTime: formatDateToString(date, false) 
                  })
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择结束日期"
                isClearable
                minDate={parseDateTimeString(depositClaimFilters.startTime) || undefined}
                customInput={
                  <TextField
                    fullWidth
                    label="结束日期"
                    InputLabelProps={{ shrink: true }}
                  />
                }
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
          <Button
            variant='contained'
            color='primary'
            startIcon={<i className='ri-checkbox-multiple-line' />}
            className='max-sm:is-full'
            disabled={selectedClaimIds.length === 0}
            onClick={() => {
              setIsBatchMode(true)
              setSelectedClaimCustomer(null)
              setClaimForm({
                remark: "",
                voucherUrl: "",
              })
              setClaimDrawerOpen(true)
            }}
          >
            批量认领 {selectedClaimIds.length > 0 && `(${selectedClaimIds.length})`}
          </Button>
          <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
            <TextField
              size='small'
              placeholder='参考号、付款人、备注...'
              value={depositClaimFilters.keyword}
              onChange={(e) => setDepositClaimFilters({ ...depositClaimFilters, keyword: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-line' />
                  </InputAdornment>
                ),
              }}
              className='max-sm:is-full'
            />
            <Button 
              variant='outlined'
              color='secondary'
              startIcon={<i className='ri-restart-line' />}
              onClick={() => {
                const resetFilters = {
                  status: "all",
                  matchStatus: "all",
                  startTime: "",
                  endTime: "",
                  keyword: "",
                }
                setDepositClaimFilters(resetFilters)
                setDepositClaimPage(0)
                // 直接传入重置后的筛选条件和页码，避免状态更新延迟问题
                loadDepositClaimList(resetFilters, 0)
              }}
              className='max-sm:is-full'
            >
              重置
            </Button>
            <Button 
              variant='contained'
              startIcon={<i className='ri-search-line' />}
              onClick={() => {
                setDepositClaimPage(0)
                loadDepositClaimList()
              }}
              className='max-sm:is-full'
            >
              查询
            </Button>
          </div>
        </div>
        <Divider />

      <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>
                  <Checkbox 
                    size='small' 
                    checked={
                      !!depositClaimData && 
                      depositClaimData.list.filter(claim => claim.status === 0).length > 0 &&
                      depositClaimData.list.filter(claim => claim.status === 0).every(claim => selectedClaimIds.includes(claim.id))
                    }
                    indeterminate={
                      !!depositClaimData &&
                      selectedClaimIds.length > 0 && 
                      !depositClaimData.list.filter(claim => claim.status === 0).every(claim => selectedClaimIds.includes(claim.id))
                    }
                    onChange={(e) => handleSelectAllClaims(e.target.checked)}
                  />
                </th>
                <th className='text-left'>提交时间</th>
                <th className='text-left'>币种/金额</th>
                <th className='text-left'>付款人</th>
                <th className='text-left'>渠道</th>
                <th className='text-left'>参考号</th>
                <th className='text-left'>匹配客户</th>
                <th className='text-left'>匹配状态</th>
                <th className='text-left'>状态</th>
                <th className='text-center'>操作</th>
              </tr>
            </thead>
            <tbody>
            {depositClaimLoading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <CircularProgress size={30} />
                    <Typography variant='body1' color='text.secondary'>
                      加载入账认领数据中...
                    </Typography>
                  </Box>
                </td>
              </tr>
            ) : !depositClaimData || depositClaimData.list.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>
                  <Typography variant='body1' color='text.secondary'>
                    暂无数据
                  </Typography>
                </td>
              </tr>
            ) : (
              depositClaimData.list.map((claim) => (
                <tr 
                  key={claim.id}
                  className={classnames({
                    'bg-actionSelected': selectedClaimIds.includes(claim.id)
                  })}
                >
                  <td>
                    <Checkbox 
                      size='small' 
                      checked={selectedClaimIds.includes(claim.id)}
                      disabled={claim.status !== 0}
                      onChange={(e) => handleSelectClaim(claim.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <Typography variant='body2' color='text.secondary'>
                      {formatTime(claim.createdAt)}
                    </Typography>
                  </td>
                  <td>{formatAmount(claim.amount, claim.currency)}</td>
                  <td>
                    <Typography variant='body2' fontWeight={500}>{claim.accountHolderName || claim.payer}</Typography>
                  </td>
                  <td>
                    <Typography variant='body2'>{formatChannel(claim.channel)}</Typography>
                  </td>
                  <td>
                    <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                      {claim.referenceNo || '-'}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant='body2' fontWeight={500}>
                      {claim.customerName || '-'}
                    </Typography>
                  </td>
                  <td>
                    <Chip
                      label={claim.matchStatusLabel || (claim.matchStatus === 1 ? '已匹配' : '未匹配')}
                      size='small'
                      color={claim.matchStatus === 1 ? 'success' : 'warning'}
                      sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  </td>
                  <td>
                    <Chip
                      label={claim.statusLabel || '未知'}
                      size='small'
                      color={
                        claim.status === 1 ? 'success' : 
                        claim.status === -3 ? 'error' : 
                        claim.status === 2 ? 'info' :
                        'warning'
                      }
                      sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  </td>
                  <td className='text-center'>
                    {claim.status === 0 && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title='认领'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setSelectedClaim(claim)
                              // 如果还没有匹配客户，清空选择
                              if (!claim.customerName) {
                                setSelectedClaimCustomer(null)
                              }
                              setClaimForm({
                                remark: "",
                                voucherUrl: "",
                              })
                              setClaimDrawerOpen(true)
                            }}
                            sx={{ 
                              color: theme.palette.success.main,
                              '&:hover': {
                                bgcolor: `${theme.palette.success.main}10`,
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <i className='ri-check-line' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='拒绝'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setSelectedClaim(claim)
                              setClaimRejectReason("")
                              setClaimRejectDialogOpen(true)
                            }}
                            sx={{ 
                              color: theme.palette.error.main,
                              '&:hover': {
                                bgcolor: `${theme.palette.error.main}10`,
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <i className='ri-close-line' />
                          </IconButton>
                        </Tooltip>
                        {/* <Tooltip title='查看详情'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              // TODO: 打开详情弹窗
                            }}
                            sx={{ 
                              color: theme.palette.info.main,
                              '&:hover': {
                                bgcolor: `${theme.palette.info.main}10`,
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <i className='ri-eye-line' />
                          </IconButton>
                        </Tooltip> */}
                      </Box>
                    )}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component='div'
          className='border-bs'
          count={depositClaimData?.total || 0}
          rowsPerPage={depositClaimPageSize}
          page={depositClaimPage}
          onPageChange={(_event, newPage) => setDepositClaimPage(newPage)}
          onRowsPerPageChange={(event) => {
            setDepositClaimPageSize(parseInt(event.target.value, 10))
            setDepositClaimPage(0)
          }}
        />
      </Card>
    </div>
  )

  // Tab 5: Withdrawal Approvals - Materialize Style
  const renderWithdrawalApprovals = () => (
    <div className='flex flex-col gap-6'>
      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>状态</InputLabel>
                <Select 
                  value={withdrawalFilters.status} 
                  onChange={(e) => setWithdrawalFilters({ ...withdrawalFilters, status: e.target.value })}
                  label='状态'
                >
                  <MenuItem value='all'>全部</MenuItem>
                  <MenuItem value='0'>待处理</MenuItem>
                  <MenuItem value='2'>处理中</MenuItem>
                  <MenuItem value='1'>处理完成</MenuItem>
                  <MenuItem value='-3'>处理失败</MenuItem>
                  <MenuItem value='-1'>客户取消</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppReactDatepicker
                selected={parseDateTimeString(withdrawalFilters.startTime)}
                onChange={(date: Date | null) => {
                  setWithdrawalFilters({ 
                    ...withdrawalFilters, 
                    startTime: formatDateToString(date, true) 
                  })
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择开始日期"
                isClearable
                customInput={
                  <TextField
                    fullWidth
                    label="开始日期"
                    InputLabelProps={{ shrink: true }}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppReactDatepicker
                selected={parseDateTimeString(withdrawalFilters.endTime)}
                onChange={(date: Date | null) => {
                  setWithdrawalFilters({ 
                    ...withdrawalFilters, 
                    endTime: formatDateToString(date, false) 
                  })
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择结束日期"
                isClearable
                minDate={parseDateTimeString(withdrawalFilters.startTime) || undefined}
                customInput={
                  <TextField
                    fullWidth
                    label="结束日期"
                    InputLabelProps={{ shrink: true }}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                size='medium'
                placeholder='客户、收款人...'
                fullWidth
                value={withdrawalFilters.keyword}
                onChange={(e) => setWithdrawalFilters({ ...withdrawalFilters, keyword: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
          <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
            <Button
              variant='contained'
              startIcon={<i className='ri-search-line' />}
              onClick={() => {
                if (withdrawalPage === 0) {
                  loadWithdrawalApprovalList()
                } else {
                  setWithdrawalPage(0)
                }
              }}
            >
              查询
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='ri-restart-line' />}
              onClick={() => {
                const resetFilters = {
                  status: "all",
                  startTime: "",
                  endTime: "",
                  keyword: "",
                }
                setWithdrawalFilters(resetFilters)
                setWithdrawalPage(0)
                loadWithdrawalApprovalList(resetFilters, 0)
              }}
            >
              重置
            </Button>
            <Button
              variant='outlined'
              startIcon={<i className='ri-refresh-line' />}
              onClick={() => loadWithdrawalApprovalList()}
            >
              刷新
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                {/* <th><Checkbox size='small' /></th> */}
                <th className='text-left'>申请时间</th>
                <th className='text-left'>客户</th>
                <th className='text-left'>币种/金额</th>
                <th className='text-left'>收款人</th>
                <th className='text-left'>用途</th>
                <th className='text-left'>状态</th>
                <th className='text-center'>操作</th>
              </tr>
            </thead>
            <tbody>
            {withdrawalLoading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <CircularProgress size={30} />
                    <Typography variant='body1' color='text.secondary'>
                      加载出金审批数据中...
                    </Typography>
                  </Box>
                </td>
              </tr>
            ) : !withdrawalData || withdrawalData.list.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  <Typography variant='body1' color='text.secondary'>
                    暂无数据
                  </Typography>
                </td>
              </tr>
            ) : (
              withdrawalData.list.map((approval) => (
                <tr key={approval.id}>
                  {/* <td><Checkbox size='small' /></td> */}
                  <td>
                    <Typography variant='body2' color='text.secondary'>
                      {formatTime(approval.createdAt)}
                    </Typography>
                  </td>
                  <td>
                    <div>
                      <Typography variant='body2' fontWeight={500}>{approval.customerName}</Typography>
                      <Typography variant='caption' color='text.secondary'>ID: {approval.userId}</Typography>
                      {approval.customerEmail && (
                        <Typography variant='caption' color='text.secondary' sx={{ display: "block" }}>
                          {approval.customerEmail}
                        </Typography>
                      )}
                    </div>
                  </td>
                  <td>{formatAmount(approval.amount, approval.currency)}</td>
                  <td>
                    <Typography variant='body2'>{approval.recipient}</Typography>
                  </td>
                  <td>
                    <Typography variant='body2' color='text.secondary'>{formatPurpose(approval.purpose)}</Typography>
                  </td>
                  <td>
                    <Chip
                      label={approval.statusLabel}
                      color={
                        approval.status === 1 ? 'success' :
                        approval.status === 0 ? 'warning' :
                        approval.status === 2 ? 'info' :
                        'error'
                      }
                      size='small'
                      variant='tonal'
                    />
                  </td>
                  <td className='text-center'>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {approval.status === 0 && (
                        <Tooltip title='审批'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setSelectedWithdrawalApproval(approval)
                              // 直接打开抽屉，useEffect 会监听并确保数据加载
                              setApprovalDrawerOpen(true)
                            }}
                            sx={{ 
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: `${theme.palette.primary.main}10`,
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <i className='ri-file-check-line' />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(approval.status === 1 || approval.status === 2) && (
                        <Tooltip title='查看打款'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setSelectedWithdrawalApproval(approval)
                              setSelectedPaymentInfo({
                                customer: approval.customerName,
                                amount: approval.amount,
                                currency: approval.currency,
                                payee: approval.recipient,
                                channel: approval.paymentChannel || '',
                                bank: approval.paymentBank || '',
                                voucherUrl: approval.voucherUrl || '',
                                approvalTime: formatTime(approval.createdAt),
                              })
                              setViewPaymentDrawerOpen(true)
                            }}
                            sx={{ 
                              color: theme.palette.success.main,
                              '&:hover': {
                                bgcolor: `${theme.palette.success.main}10`,
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <i className='ri-eye-line' />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* {approval.hasAttachment && (
                        <Tooltip title='查看附件'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setSnackbar({ open: true, message: "查看附件功能待实现", severity: "info" })
                            }}
                            sx={{ 
                              color: theme.palette.info.main,
                              '&:hover': {
                                bgcolor: `${theme.palette.info.main}10`,
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <i className='ri-attachment-2' />
                          </IconButton>
                        </Tooltip>
                      )} */}
                    </Box>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={withdrawalData?.total || 0}
          rowsPerPage={withdrawalPageSize}
          page={withdrawalPage}
          onPageChange={(_, newPage) => setWithdrawalPage(newPage)}
          onRowsPerPageChange={(e) => {
            setWithdrawalPageSize(parseInt(e.target.value, 10))
            setWithdrawalPage(0)
          }}
        />
      </Card>
    </div>
  )

  // Tab 6: Reconciliation Center - 对账中心
  const renderReconciliation = () => (
    <div className='flex flex-col gap-6'>
      {/* Reconciliation Stats - 对账统计 */}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CardStatVertical
            title='总数量'
            stats={reconciliationStats?.totalCount.toString() || '0'}
            avatarIcon='ri-file-list-3-line'
            avatarColor='primary'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CardStatVertical
            title='已匹配'
            stats={reconciliationStats?.matchedCount.toString() || '0'}
            avatarIcon='ri-check-circle-line'
            avatarColor='success'
            trendNumber={reconciliationStats ? `${reconciliationStats.matchedPercent.toFixed(1)}%` : '0%'}
            trend='neutral'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CardStatVertical
            title='未匹配'
            stats={reconciliationStats?.unmatchedCount.toString() || '0'}
            avatarIcon='ri-error-warning-line'
            avatarColor='warning'
            trendNumber={reconciliationStats ? `${reconciliationStats.unmatchedPercent.toFixed(1)}%` : '0%'}
            trend='neutral'
          />
        </Grid>
      </Grid>

      {/* Reconciliation List - 对账列表 */}
      <Card>
        <CardHeader title='对账列表' />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>匹配状态</InputLabel>
                <Select 
                  value={reconciliationFilters.matchStatus} 
                  onChange={(e) => {
                    setReconciliationFilters({ ...reconciliationFilters, matchStatus: e.target.value })
                    setReconciliationPage(0)
                  }}
                  label='匹配状态'
                >
                  <MenuItem value='all'>全部</MenuItem>
                  <MenuItem value='0'>未匹配</MenuItem>
                  <MenuItem value='1'>已匹配</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppReactDatepicker
                selected={parseDateTimeString(reconciliationFilters.startTime)}
                onChange={(date: Date | null) => {
                  setReconciliationFilters({ 
                    ...reconciliationFilters, 
                    startTime: formatDateToString(date, true) 
                  })
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择开始日期"
                isClearable
                customInput={
                  <TextField
                    fullWidth
                    label="开始日期"
                    InputLabelProps={{ shrink: true }}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppReactDatepicker
                selected={parseDateTimeString(reconciliationFilters.endTime)}
                onChange={(date: Date | null) => {
                  setReconciliationFilters({ 
                    ...reconciliationFilters, 
                    endTime: formatDateToString(date, false) 
                  })
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择结束日期"
                isClearable
                minDate={parseDateTimeString(reconciliationFilters.startTime) || undefined}
                customInput={
                  <TextField
                    fullWidth
                    label="结束日期"
                    InputLabelProps={{ shrink: true }}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                size='medium'
                placeholder='参考号、备注...'
                fullWidth
                value={reconciliationFilters.keyword}
                onChange={(e) => setReconciliationFilters({ ...reconciliationFilters, keyword: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
          <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='ri-upload-cloud-line' />}
              onClick={() => {
                // TODO: 实现导入对账单逻辑
              }}
            >
              导入对账单
            </Button>
            <Button
              variant='outlined'
              color='error'
              startIcon={<i className='ri-file-warning-line' />}
              onClick={() => {
                // TODO: 实现导出差异逻辑
              }}
            >
              导出差异
            </Button>
          </div>
          <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
            <Button
              variant='contained'
              startIcon={<i className='ri-search-line' />}
              onClick={() => {
                // 如果当前在第一页，直接加载数据
                if (reconciliationPage === 0) {
                  loadReconciliationStats()
                  loadReconciliationList()
                } else {
                  // 否则设置为第一页，useEffect会自动触发加载
                  setReconciliationPage(0)
                }
              }}
            >
              查询
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<i className='ri-restart-line' />}
              onClick={() => {
                const resetFilters = {
                  matchStatus: "all",
                  startTime: "",
                  endTime: "",
                  keyword: "",
                }
                setReconciliationFilters(resetFilters)
                setReconciliationPage(0)
                // 直接传入重置后的筛选条件和页码，避免读取旧状态
                loadReconciliationStats(resetFilters)
                loadReconciliationList(resetFilters, 0)
              }}
            >
              重置
            </Button>
            <Button
              variant='outlined'
              startIcon={<i className='ri-refresh-line' />}
              onClick={() => {
                loadReconciliationStats()
                loadReconciliationList()
              }}
            >
              刷新
            </Button>
            {/* <Button
              variant='outlined'
              startIcon={<i className='ri-download-line' />}
              onClick={exportCSV}
            >
              导出
            </Button> */}
          </div>
        </div>
        <Divider />

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className='text-left'>日期</th>
                <th className='text-left'>币种/金额</th>
                <th className='text-left'>金额类型</th>
                <th className='text-left'>参考号</th>
                <th className='text-left'>类型</th>
                <th className='text-left'>匹配状态</th>
                <th className='text-left'>备注</th>
                <th className='text-center'>操作</th>
              </tr>
            </thead>
            <tbody>
            {reconciliationLoading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <CircularProgress size={30} />
                    <Typography variant='body1' color='text.secondary'>
                      加载对账数据中...
                    </Typography>
                  </Box>
                </td>
              </tr>
            ) : !reconciliationList || reconciliationList.list.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <Typography variant='body1' color='text.secondary'>
                    暂无数据
                  </Typography>
                </td>
              </tr>
            ) : (
              reconciliationList.list.map((item) => (
                <tr key={item.id} className='hover:bg-actionHover'>
                  <td>
                    <Typography variant='body2' color='text.secondary'>
                      {formatTime(item.createdAt)}
                    </Typography>
                  </td>
                  <td>{formatAmount(item.amount, item.currency)}</td>
                  <td>
                    <Chip 
                      label={Number(item.type) === 1 ? '收入' : '支出'}
                      color={Number(item.type) === 1 ? 'success' : 'error'}
                      size='small'
                      variant='tonal'
                    />
                  </td>
                  <td>
                    <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                      {item.referenceNo || '-'}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant='body2'>
                      {item.typeLabel || item.type}
                    </Typography>
                  </td>
                  <td>
                    <Chip
                      label={item.matchStatus === 1 ? '已匹配' : '未匹配'}
                      color={item.matchStatus === 1 ? 'success' : 'warning'}
                      size='small'
                      variant='tonal'
                    />
                  </td>
                  <td>
                    <Typography variant='body2' color='text.secondary'>
                      {item.remark || '-'}
                    </Typography>
                  </td>
                  <td className='text-center'>
                    {item.matchStatus === 0 ? (
                      <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => {
                          // 保存参考号，用于在入账认领列表中自动选中
                          if (item.referenceNo) {
                            hasSetSearchKeywordRef.current = false  // 重置标记
                            setPendingSelectReferenceNo(item.referenceNo)
                          }
                          setActiveTab('deposits')
                        }}
                      >
                        去认领
                      </Button>
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        -
                      </Typography>
                    )}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component='div'
          className='border-bs'
          count={reconciliationList?.total || 0}
          rowsPerPage={reconciliationPageSize}
          page={reconciliationPage}
          onPageChange={(_, newPage) => setReconciliationPage(newPage)}
          onRowsPerPageChange={(e) => {
            setReconciliationPageSize(parseInt(e.target.value, 10))
            setReconciliationPage(0)
          }}
        />
      </Card>
    </div>
  )

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const tabValue = TAB_VALUES[newValue] as TabValue
    setActiveTab(tabValue)
  }

  const handleManualDepositSubmit = () => {
    setConfirmAction("deposit")
    setConfirmDialogOpen(true)
  }

  const handleManualWithdrawalSubmit = () => {
    setConfirmAction("withdrawal")
    setConfirmDialogOpen(true)
  }

  return (
    <Box>
        {/* Page Header */}
        <Card sx={{ borderRadius: 0, boxShadow: 'none' }}>
          <CardHeader
            title={
              <Typography variant='h4' className='font-medium'>
              法币资产管理
            </Typography>
            }
            action={
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2 bg-actionHover px-3 py-2 rounded'>
                  <i className='ri-calendar-line text-lg' />
                  <Typography variant='body2' color='text.secondary'>
                    最后同步: {lastSyncTime || '加载中...'}
                  </Typography>
                </div>
              <Button 
                  variant='outlined' 
                  startIcon={<i className='ri-refresh-line' />}
                  onClick={async () => {
                    try {
                      setLoading(true)
                      const response = await getFiatOverview()
                      // 从 ServerResponse 中提取数据
                      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
                        ? response.data.data 
                        : response.data
                      setApiData(actualData as FiatOverviewResponse)
                      // 更新同步时间
                      setLastSyncTime(formatSyncTime())
                      setSnackbar({ open: true, message: "数据刷新成功", severity: "success" })
                    } catch (error) {
                      console.error('Failed to refresh data:', error)
                      setSnackbar({ open: true, message: getErrorMessage(error), severity: "error" })
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  className='font-medium'
              >
                {loading ? '刷新中...' : '刷新'}
              </Button>
              <Button 
                  variant='outlined' 
                  startIcon={<i className='ri-download-line' />}
                onClick={exportCSV} 
                  className='font-medium'
              >
                导出 CSV
              </Button>
              </div>
            }
          />
        </Card>

        {/* Materialize Tabs */}
        <Card className='mbe-6' sx={{ borderRadius: 0, boxShadow: 'none' }}>
          <Tabs
            value={TAB_VALUES.indexOf(activeTab)}
            onChange={handleTabChange}
            sx={{
              minHeight: 64,
              '& .MuiTab-root': {
                minHeight: 64,
                py: 3,
                px: 6,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                color: 'var(--mui-palette-text-secondary)',
                '&:hover': {
                  color: 'var(--mui-palette-primary-main)'
                }
              },
              '& .Mui-selected': {
                color: 'var(--mui-palette-primary-main) !important',
                fontWeight: 600
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--mui-palette-primary-main)'
              }
            }}
          >
            <Tab label="总览" />
            <Tab label="客户资产" />
            <Tab label="流水查询" />
            <Tab label="入账认领" />
            <Tab label="出金审批" />
            <Tab label="对账中心" />
          </Tabs>
        </Card>

        <Box sx={{ minHeight: "400px" }}>
          {loading ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <i className='ri-loader-4-line text-4xl animate-spin' style={{ color: 'var(--mui-palette-primary-main)' }} />
                    <Typography variant='h6' color='text.secondary'>
                      加载数据中...
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    正在获取法币资产数据
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
              {activeTab === "overview" && renderOverview()}
              {activeTab === "customer-assets" && renderCustomerAssets()}
              {activeTab === "transactions" && renderTransactions()}
              {activeTab === "deposits" && renderDepositClaims()}
              {activeTab === "withdrawals" && renderWithdrawalApprovals()}
              {activeTab === "reconciliation" && renderReconciliation()}
            </>
          )}
        </Box>

        <Drawer
          anchor="right"
          open={claimDrawerOpen}
          onClose={() => {
            if (!claimSubmitting) {
              setClaimDrawerOpen(false)
              setSelectedClaim(null)
              setSelectedClaimCustomer(null)
              setSelectedClaimIds([])
              setIsBatchMode(false)
              setClaimVoucherFile(null)
              setClaimForm({
                remark: "",
                voucherUrl: "",
              })
            }
          }}
          PaperProps={{
            sx: { width: 500 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#212121" }}>
              {isBatchMode ? `批量入账认领 (${selectedClaimIds.length}条)` : '入账认领'}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {isBatchMode ? (
              // 批量模式：显示选中的记录列表
              (() => {
                const selectedClaims = depositClaimData?.list.filter(claim => selectedClaimIds.includes(claim.id)) || []
                const matchedClaims = selectedClaims.filter(claim => claim.customerName)
                const unmatchedClaims = selectedClaims.filter(claim => !claim.customerName)
                
                return (
                  <Box sx={{ mb: 3 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        已选择 {selectedClaimIds.length} 条待认领记录
                        {matchedClaims.length > 0 && ` (${matchedClaims.length}条已匹配客户)`}
                      </Typography>
                    </Alert>
                    <Card sx={{ bgcolor: "#f5f5f5", maxHeight: 300, overflow: 'auto' }}>
                      <table style={{ width: '100%' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>付款人</th>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem' }}>匹配客户</th>
                            <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem' }}>金额</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClaims.map(claim => (
                            <tr key={claim.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '8px', fontSize: '0.875rem' }}>{claim.accountHolderName || claim.payer}</td>
                              <td style={{ padding: '8px', fontSize: '0.875rem' }}>
                                {claim.customerName ? (
                                  <span style={{ color: '#2e7d32', fontWeight: 500 }}>✓ {claim.customerName}</span>
                                ) : (
                                  <span style={{ color: '#ed6c02' }}>待匹配</span>
                                )}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                {formatAmount(claim.amount, claim.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  </Box>
                )
              })()
            ) : (
              // 单个模式：显示单条记录详情
              selectedClaim && (
                <Box sx={{ mb: 3 }}>
                  <Alert
                    severity="info"
                    sx={{
                      mb: 2,
                      "& .MuiAlert-message": { width: "100%" },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        来账金额
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                        {formatAmount(selectedClaim.amount, selectedClaim.currency)}
                      </Typography>
                    </Box>
                  </Alert>
                  <Card sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          付款人:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedClaim.accountHolderName || selectedClaim.payer}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          渠道:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatChannel(selectedClaim.channel)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          参考号:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                          {selectedClaim.referenceNo || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          提交时间:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatTime(selectedClaim.createdAt)}
                        </Typography>
                      </Box>
                      {selectedClaim.customerName && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            匹配客户:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {selectedClaim.customerName}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                </Box>
              )
            )}

            <Stack spacing={3}>
              {(() => {
                // 批量模式：检查所有记录是否都已匹配客户
                if (isBatchMode) {
                  const selectedClaims = depositClaimData?.list.filter(claim => selectedClaimIds.includes(claim.id)) || []
                  const unmatchedClaims = selectedClaims.filter(claim => !claim.customerName)
                  
                  // 如果所有记录都已匹配客户，隐藏客户选择器
                  if (unmatchedClaims.length === 0) {
                    return null
                  }
                  
                  // 有未匹配的记录，显示客户选择器
                  return (
                    <Autocomplete
                      options={uniqueCustomers}
                      value={selectedClaimCustomer}
                      onChange={(_, newValue) => {
                        setSelectedClaimCustomer(newValue)
                      }}
                      getOptionLabel={(option) => `${option.customerName} (ID: ${option.customerId})`}
                      isOptionEqualToValue={(option, value) => option.userId === value.userId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="选择客户"
                          required
                          placeholder="请为未匹配的记录选择客户"
                          helperText={`有 ${unmatchedClaims.length} 条记录需要匹配客户`}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.userId}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                              }}
                            >
                              {option.customerName[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {option.customerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {option.customerId}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    />
                  )
                }
                
                // 单个模式：已经匹配了客户，显示只读客户名称
                if (selectedClaim && selectedClaim.customerName) {
                  return (
                    <TextField
                      label="匹配客户"
                      fullWidth
                      value={selectedClaim.customerName}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.success.main,
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                              }}
                            >
                              {selectedClaim.customerName[0]}
                            </Avatar>
                          </InputAdornment>
                        ),
                      }}
                      helperText="该记录已匹配客户"
                    />
                  )
                }
                
                // 单个模式：未匹配客户，显示客户选择器
                return (
                  <Autocomplete
                    options={uniqueCustomers}
                    value={selectedClaimCustomer}
                    onChange={(_, newValue) => {
                      setSelectedClaimCustomer(newValue)
                    }}
                    getOptionLabel={(option) => `${option.customerName} (ID: ${option.customerId})`}
                    isOptionEqualToValue={(option, value) => option.userId === value.userId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="选择客户"
                        required
                        placeholder="请选择要认领的客户"
                        helperText="认领时必填"
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.userId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem',
                            }}
                          >
                            {option.customerName[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {option.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {option.customerId}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  />
                )
              })()}
              <TextField
                label="认领备注"
                fullWidth
                required
                multiline
                rows={3}
                value={claimForm.remark}
                onChange={(e) => setClaimForm({ ...claimForm, remark: e.target.value })}
                placeholder="请输入认领备注说明..."
              />
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  disabled={uploadingVoucher}
                  startIcon={uploadingVoucher ? <CircularProgress size={20} /> : <i className="ri-upload-cloud-line" />}
                  sx={{ py: 1.5 }}
                >
                  {uploadingVoucher ? "上传中..." : (claimVoucherFile ? claimVoucherFile.name : "上传凭证（可选）")}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleVoucherUpload}
                    disabled={uploadingVoucher}
                  />
                </Button>
                {claimVoucherFile && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 1, display: "block" }}>
                    已选择文件: {claimVoucherFile.name}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                disabled={claimSubmitting}
                onClick={() => {
                  setClaimDrawerOpen(false)
                  setSelectedClaim(null)
                  setSelectedClaimCustomer(null)
                  setSelectedClaimIds([])
                  setIsBatchMode(false)
                  setClaimVoucherFile(null)
                  setClaimForm({
                    remark: "",
                    voucherUrl: "",
                  })
                }}
              >
                取消
              </Button>
              <Button
                variant="contained"
                color="success"
                fullWidth
                disabled={(() => {
                  if (claimSubmitting || !claimForm.remark.trim()) {
                    return true
                  }
                  
                  if (isBatchMode) {
                    // 批量模式：检查是否有未匹配的记录需要选择客户
                    const selectedClaims = depositClaimData?.list.filter(claim => selectedClaimIds.includes(claim.id)) || []
                    const unmatchedClaims = selectedClaims.filter(claim => !claim.customerName)
                    // 如果有未匹配的记录但没选择客户，禁用按钮
                    return unmatchedClaims.length > 0 && !selectedClaimCustomer
                  } else {
                    // 单个模式：如果记录没有匹配客户且没选择客户，禁用按钮
                    return !selectedClaim?.customerName && !selectedClaimCustomer
                  }
                })()}
                onClick={() => isBatchMode ? handleBatchDepositClaim() : handleDepositClaim('approve')}
              >
                {claimSubmitting ? '提交中...' : (isBatchMode ? `确认批量认领(${selectedClaimIds.length})` : '确认认领')}
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 入账认领拒绝对话框 */}
        <Dialog 
          open={claimRejectDialogOpen} 
          onClose={() => setClaimRejectDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600, color: "#212121" }}>
            拒绝入账认领
          </DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                拒绝此笔入账认领必须填写原因
              </Typography>
            </Alert>
            <TextField
              label="拒绝原因"
              multiline
              rows={4}
              fullWidth
              required
              value={claimRejectReason}
              onChange={(e) => setClaimRejectReason(e.target.value)}
              placeholder="请详细说明拒绝的原因..."
              sx={{ mt: 2 }}
              error={claimRejectReason.trim() === ""}
              helperText={claimRejectReason.trim() === "" ? "此字段为必填项" : ""}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => {
                setClaimRejectDialogOpen(false)
                setClaimRejectReason("")
              }}
              variant="outlined"
              sx={{ minWidth: "100px" }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                if (!claimRejectReason.trim()) {
                  setSnackbar({ 
                    open: true, 
                    message: "请填写拒绝原因", 
                    severity: "error" 
                  })
                  return
                }
                
                // 关闭拒绝对话框
                setClaimRejectDialogOpen(false)
                
                // 调用拒绝接口
                await handleDepositClaim('reject', claimRejectReason.trim())
                
                // 清空拒绝原因
                setClaimRejectReason("")
              }}
              disabled={!claimRejectReason.trim() || claimSubmitting}
              sx={{ minWidth: "100px", fontWeight: 600 }}
            >
              {claimSubmitting ? "处理中..." : "确认拒绝"}
            </Button>
          </DialogActions>
        </Dialog>

        <Drawer
          anchor="right"
          open={approvalDrawerOpen}
          onClose={() => {
            setApprovalDrawerOpen(false)
            // Reset form fields
            setApprovalChannel("")
            setApprovalBank("")
            setApprovalProof(null)
          }}
          PaperProps={{
            sx: { width: 500 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#212121" }}>
              出金审批
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {selectedWithdrawal && (
              <Box sx={{ mb: 3 }}>
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      出金金额
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {formatAmount(selectedWithdrawal.amount, selectedWithdrawal.currency)}
                    </Typography>
                  </Box>
                </Alert>
                <Card sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        客户
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedWithdrawal.customer}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        收款人
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedWithdrawal.payee}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        用途
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatPurpose(selectedWithdrawal.purpose)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        申请时间
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatTime(selectedWithdrawal.applicationTime)}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Box>
            )}

            <Stack spacing={3}>
              <TextField
                select
                label="打款渠道"
                value={approvalChannel}
                onChange={(e) => setApprovalChannel(e.target.value)}
                required
                helperText="请选择打款渠道"
                disabled={loadingDictData}
              >
                {loadingDictData ? (
                  <MenuItem disabled>加载中...</MenuItem>
                ) : channelList.length === 0 ? (
                  <MenuItem disabled>暂无数据</MenuItem>
                ) : (
                  channelList.map((item) => (
                    <MenuItem key={item.dictValue} value={item.dictValue}>
                      {item.dictLabel}
                    </MenuItem>
                  ))
                )}
              </TextField>

              <TextField
                select
                label="打款银行"
                value={approvalBank}
                onChange={(e) => setApprovalBank(e.target.value)}
                required
                helperText="请选择打款银行"
                disabled={loadingDictData}
              >
                {loadingDictData ? (
                  <MenuItem disabled>加载中...</MenuItem>
                ) : bankList.length === 0 ? (
                  <MenuItem disabled>暂无数据</MenuItem>
                ) : (
                  bankList.map((item) => (
                    <MenuItem key={item.dictValue} value={item.dictValue}>
                      {item.dictLabel}
                    </MenuItem>
                  ))
                )}
              </TextField>

              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: "#212121" }}>
                  上传打款凭证 *
                </Typography>
                <Button 
                  variant="outlined" 
                  component="label" 
                  fullWidth 
                  sx={{ py: 1.5, justifyContent: "flex-start" }}
                  disabled={uploadingApprovalVoucher}
                  startIcon={uploadingApprovalVoucher ? <CircularProgress size={20} /> : <UploadFileIcon />}
                >
                  {uploadingApprovalVoucher ? "上传中..." : (approvalProof ? approvalProof.name : "选择文件")}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleApprovalVoucherUpload}
                    disabled={uploadingApprovalVoucher}
                  />
                </Button>
                {approvalProof && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: "block" }}>
                    ✓ 已上传: {approvalProof.name}
                  </Typography>
                )}
                {!approvalProof && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    支持 JPG, PNG 格式，最大 10MB
                  </Typography>
                )}
              </Box>

              <TextField 
                label="审批备注" 
                multiline 
                rows={4} 
                required
                placeholder="请输入审批备注"
                value={approvalRemark}
                onChange={(e) => setApprovalRemark(e.target.value)}
                error={approvalRemark.trim() === ""}
                helperText={approvalRemark.trim() === "" ? "此字段为必填项" : ""}
              />
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  if (!approvalChannel || !approvalBank || !approvalProof) {
                    alert("请填写所有必填项（渠道、银行、凭证）")
                    return
                  }
                  if (!approvalRemark || !approvalRemark.trim()) {
                    alert("请输入审批备注")
                    return
                  }
                  setActionType("approve-withdrawal")
                  setConfirmDialogOpen(true)
                }}
                disabled={!approvalChannel || !approvalBank || !approvalProof || !approvalRemark || !approvalRemark.trim()}
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                批准
              </Button>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => {
                  setRejectDialogOpen(true)
                }}
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                拒绝
              </Button>
            </Stack>
          </Box>
        </Drawer>

        <Drawer
          anchor="right"
          open={viewPaymentDrawerOpen}
          onClose={() => setViewPaymentDrawerOpen(false)}
          PaperProps={{
            sx: { width: 500 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#212121" }}>
              打款信息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {selectedPaymentInfo && (
              <Stack spacing={3}>
                <Card sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        客户
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedPaymentInfo.customer}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        出金金额
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600, color: "#1976d2" }}>
                        {formatAmount(selectedPaymentInfo.amount, selectedPaymentInfo.currency)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        收款人
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedPaymentInfo.payee}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    打款详情
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          打款渠道
                        </Typography>
                        <Chip
                          label={
                            selectedPaymentInfo.channel === "wire"
                              ? "电汇"
                              : selectedPaymentInfo.channel === "fps"
                                ? "FPS"
                                : selectedPaymentInfo.channel === "swift"
                                  ? "SWIFT"
                                  : selectedPaymentInfo.channel === "local"
                                    ? "本地转账"
                                    : "其他"
                          }
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          打款银行
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {selectedPaymentInfo.bank === "hsbc"
                            ? "汇丰银行 (HSBC)"
                            : selectedPaymentInfo.bank === "scb"
                              ? "渣打银行 (Standard Chartered)"
                              : selectedPaymentInfo.bank === "boc"
                                ? "中国银行 (Bank of China)"
                                : selectedPaymentInfo.bank === "icbc"
                                  ? "工商银行 (ICBC)"
                                  : selectedPaymentInfo.bank === "citi"
                                    ? "花旗银行 (Citibank)"
                                    : selectedPaymentInfo.bank === "dbs"
                                      ? "星展银行 (DBS)"
                                      : "其他银行"}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          打款凭证
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Button variant="outlined" size="small" startIcon={<DescriptionIcon />}>
                            查看凭证
                          </Button>
                        </Box>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          审批时间
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {formatTime(selectedPaymentInfo.approvalTime || new Date().toISOString())}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              </Stack>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ReceiptIcon />}
                onClick={() => {
                  setInvoiceDrawerOpen(true)
                }}
              >
                查看转账Invoice
              </Button>
              <Button variant="outlined" fullWidth onClick={() => setViewPaymentDrawerOpen(false)}>
                关闭
              </Button>
            </Box>
          </Box>
        </Drawer>

        <Drawer
          anchor="right"
          open={invoiceDrawerOpen}
          onClose={() => setInvoiceDrawerOpen(false)}
          PaperProps={{
            sx: { width: 600 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#212121" }}>
                转账Invoice
              </Typography>
              <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                打印
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {selectedPaymentInfo && (
              <Stack spacing={3}>
                {/* Invoice Header */}
                <Card sx={{ bgcolor: "#f5f5f5", p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                    信托资产管理有限公司
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trust Asset Management Limited
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Invoice编号
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                        INV-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(6, "0")}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" color="text.secondary">
                        开具日期
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatTime(new Date().toISOString()).split(" ")[0]}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Transaction Details */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    交易详情
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          交易类型
                        </Typography>
                        <Chip label="出金转账" size="small" color="primary" />
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          转账金额
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600, color: "#1976d2" }}>
                          {formatAmount(selectedPaymentInfo.amount, selectedPaymentInfo.currency)}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          手续费
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          {selectedPaymentInfo.currency} 0.00
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          总计
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 700, color: "#212121" }}>
                          {formatAmount(selectedPaymentInfo.amount, selectedPaymentInfo.currency)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Sender Information */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    付款方信息
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          公司名称
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          信托资产管理有限公司
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          账户名称
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          Trust Asset Management Ltd.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          账户号码
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          {selectedPaymentInfo.currency === "USD"
                            ? "1234567890"
                            : selectedPaymentInfo.currency === "HKD"
                              ? "987-654321-001"
                              : "6228480012345678"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          开户银行
                        </Typography>
                        <Typography variant="body1">
                          {selectedPaymentInfo.bank === "hsbc"
                            ? "汇丰银行 (HSBC)"
                            : selectedPaymentInfo.bank === "scb"
                              ? "渣打银行 (Standard Chartered)"
                              : selectedPaymentInfo.bank === "boc"
                                ? "中国银行 (Bank of China)"
                                : "其他银行"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Receiver Information */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    收款方信息
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          客户名称
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedPaymentInfo.customer}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          收款人
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedPaymentInfo.payee}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          收款账号
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          ****{String(Math.floor(Math.random() * 10000)).padStart(4, "0")}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Payment Method */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    转账方式
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          转账渠道
                        </Typography>
                        <Chip
                          label={
                            selectedPaymentInfo.channel === "wire"
                              ? "电汇"
                              : selectedPaymentInfo.channel === "fps"
                                ? "FPS"
                                : selectedPaymentInfo.channel === "swift"
                                  ? "SWIFT"
                                  : "本地转账"
                          }
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          参考号
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          REF{new Date().getFullYear()}
                          {String(Math.floor(Math.random() * 1000000)).padStart(8, "0")}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          状态
                        </Typography>
                        <Chip label="已完成" size="small" color="success" />
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Footer */}
                <Card sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    备注
                  </Typography>
                  <Typography variant="body2">
                    本Invoice由系统自动生成，作为转账记录凭证。如有疑问，请联系客户服务部门。
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    生成时间: {formatTime(new Date().toISOString())}
                  </Typography>
                </Card>
              </Stack>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button variant="outlined" fullWidth startIcon={<DownloadIcon />}>
                下载PDF
              </Button>
              <Button variant="outlined" fullWidth onClick={() => setInvoiceDrawerOpen(false)}>
                关闭
              </Button>
            </Box>
          </Box>
        </Drawer>

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, color: "#212121" }}>
            {confirmAction === "deposit"
              ? "确认手动入金"
              : confirmAction === "withdrawal"
                ? "确认手动出金"
                : actionType === "confirm-deposit"
                  ? "确认入账"
                  : actionType === "approve-withdrawal"
                    ? "确认批准出金"
                    : actionType === "mark-paid"
                      ? "确认标记已支付"
                      : actionType === "mark-settled"
                        ? "确认标记已结算"
                        : "确认操作"}
          </DialogTitle>
          <DialogContent>
            <Alert
              severity={confirmAction === "deposit" || actionType === "confirm-deposit" ? "info" : "warning"}
              sx={{ mb: 2 }}
            >
              {confirmAction === "deposit" || actionType === "confirm-deposit"
                ? "此操作将直接增加客户账户余额，请确认信息无误后继续。"
                : confirmAction === "withdrawal" || actionType === "approve-withdrawal"
                  ? "此操作将直接扣减客户账户余额，请确认信息无误后继续。"
                  : "此操作将改变资金状态，请仔细确认"}
            </Alert>
            <Stack spacing={2}>
              {(actionType === "confirm-deposit" || confirmAction === "deposit") && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      客户
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {confirmAction === "deposit" 
                        ? depositForm.customerEmail 
                          ? `${depositForm.customerName} (${depositForm.customerEmail})` 
                          : depositForm.customerName
                        : selectedCustomer}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      币种/金额
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {confirmAction === "deposit"
                        ? `${depositForm.currency} ${depositForm.amount}`
                        : formatAmount(selectedItem?.amount || 0, selectedItem?.currency || "USD")}
                    </Typography>
                  </Box>
                  {confirmAction === "deposit" && depositForm.notes && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        备注说明
                      </Typography>
                      <Typography variant="body1">{depositForm.notes}</Typography>
                    </Box>
                  )}
                </>
              )}

              {(actionType === "approve-withdrawal" || confirmAction === "withdrawal") && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      客户
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {confirmAction === "withdrawal" 
                        ? `${withdrawalForm.customerName}${withdrawalForm.customerEmail ? ` (${withdrawalForm.customerEmail})` : ''}` 
                        : selectedWithdrawal?.customer}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      币种/金额
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {confirmAction === "withdrawal"
                        ? `${withdrawalForm.currency} ${withdrawalForm.amount}`
                        : formatAmount(selectedWithdrawal?.amount || 0, selectedWithdrawal?.currency || "USD")}
                    </Typography>
                  </Box>
                  {confirmAction === "withdrawal" && withdrawalForm.bankAccountId && (() => {
                    const selectedAccount = bankAccountList.find(acc => acc.id === withdrawalForm.bankAccountId)
                    return selectedAccount ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          银行账号
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedAccount.bankName} - {selectedAccount.bankAccount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          账户持有人: {selectedAccount.accountHolderName}
                        </Typography>
                      </Box>
                    ) : null
                  })()}
                  {confirmAction === "withdrawal" && withdrawalForm.notes && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        备注说明
                      </Typography>
                      <Typography variant="body1">{withdrawalForm.notes}</Typography>
                    </Box>
                  )}
                </>
              )}

              {actionType === "mark-paid" && selectedWithdrawal && (
                <Typography variant="body1">确认将编号 {selectedWithdrawal.id} 的出金申请标记为已支付？</Typography>
              )}

              {actionType === "mark-settled" && selectedWithdrawal && (
                <Typography variant="body1">确认将编号 {selectedWithdrawal.id} 的出金申请标记为已结算？</Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button variant="outlined" onClick={() => setConfirmDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="contained"
              color={
                actionType === "confirm-deposit" || confirmAction === "deposit"
                  ? "success"
                  : confirmAction === "withdrawal" ||
                      actionType === "approve-withdrawal" ||
                      actionType === "mark-paid" ||
                      actionType === "mark-settled"
                    ? "error"
                    : "primary"
              }
              onClick={handleConfirmAction}
            >
              确认
              {confirmAction === "deposit"
                ? "入金"
                : confirmAction === "withdrawal"
                  ? "出金"
                  : actionType === "confirm-deposit"
                    ? "入账"
                    : actionType === "approve-withdrawal"
                      ? "批准"
                      : actionType === "mark-paid"
                        ? "已支付"
                        : actionType === "mark-settled"
                          ? "已结算"
                          : ""}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, color: "#212121" }}>
            {actionType === "approve-withdrawal" ? "拒绝原因" : "拒绝/失败原因"}
          </DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {actionType === "approve-withdrawal" ? "拒绝出金必须填写原因" : "拒绝或标记失败必须填写原因"}
              </Typography>
            </Alert>
            <TextField
              label="原因"
              multiline
              rows={4}
              fullWidth
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={`请详细说明${actionType === "approve-withdrawal" ? "拒绝" : "拒绝或失败"}的原因...`}
              sx={{ mt: 2 }}
              error={rejectReason.trim() === ""}
              helperText={rejectReason.trim() === "" ? "此字段为必填项" : ""}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectReason("")
              }}
              variant="outlined"
              sx={{ minWidth: "100px" }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              sx={{ minWidth: "100px", fontWeight: 600 }}
            >
              确认{actionType === "approve-withdrawal" ? "拒绝" : "操作"}
            </Button>
          </DialogActions>
        </Dialog>

        <Drawer anchor="right" open={manualDepositOpen} onClose={() => {
          setManualDepositOpen(false)
          // 重置表单和搜索状态
          setDepositForm({
            customerId: null,
            customerName: "",
            customerEmail: "",
            currency: "USD",
            amount: "",
            channel: "",
            referenceNumber: "",
            notes: "",
            attachment: null,
            voucherUrl: "",
          })
          setCustomerSearchInput("")
          setCustomerSearchOptions([])
          setDepositFormCustomerLocked(false)
          // 清除防抖定时器
          if (customerSearchDebounceTimerRef.current) {
            clearTimeout(customerSearchDebounceTimerRef.current)
            customerSearchDebounceTimerRef.current = null
          }
          // 重置选择标记
          isSelectingCustomerRef.current = false
        }}>
          <Box sx={{ width: 480, p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                手动入金
              </Typography>
              <IconButton onClick={() => {
                setManualDepositOpen(false)
                // 重置表单和搜索状态
                setDepositForm({
                  customerId: null,
                  customerName: "",
                  customerEmail: "",
                  currency: "USD",
                  amount: "",
                  channel: "",
                  referenceNumber: "",
                  notes: "",
                  attachment: null,
                  voucherUrl: "",
                })
                setCustomerSearchInput("")
                setCustomerSearchOptions([])
                setDepositFormCustomerLocked(false)
                // 清除防抖定时器
                if (customerSearchDebounceTimerRef.current) {
                  clearTimeout(customerSearchDebounceTimerRef.current)
                  customerSearchDebounceTimerRef.current = null
                }
                // 重置选择标记
                isSelectingCustomerRef.current = false
              }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              手动入金将直接增加客户账户余额，请谨慎操作并确保信息准确。
            </Alert>

            <Stack spacing={3}>
              <Autocomplete
                fullWidth
                disabled={depositFormCustomerLocked}
                options={customerSearchOptions}
                loading={customerSearchLoading}
                inputValue={depositForm.customerId ? (customerSearchOptions.find(opt => opt.id === depositForm.customerId) ? `${depositForm.customerName} (${customerSearchOptions.find(opt => opt.id === depositForm.customerId)?.email || depositForm.customerEmail || ''})` : depositForm.customerEmail ? `${depositForm.customerName} (${depositForm.customerEmail})` : customerSearchInput) : customerSearchInput}
                onInputChange={(_, newInputValue, reason) => {
                  if (!depositFormCustomerLocked) {
                    handleCustomerSearchInputChange(newInputValue, reason)
                  }
                }}
                value={depositForm.customerId ? customerSearchOptions.find(opt => opt.id === depositForm.customerId) || (depositForm.customerEmail ? { id: depositForm.customerId!, name: depositForm.customerName, email: depositForm.customerEmail } : null) : null}
                onChange={(_, newValue) => {
                  if (depositFormCustomerLocked) return
                  
                  // 清除搜索定时器，防止触发搜索
                  if (customerSearchDebounceTimerRef.current) {
                    clearTimeout(customerSearchDebounceTimerRef.current)
                    customerSearchDebounceTimerRef.current = null
                  }
                  
                  if (newValue) {
                    // 标记正在选择，避免触发搜索
                    isSelectingCustomerRef.current = true
                    setDepositForm({
                      ...depositForm,
                      customerId: newValue.id,
                      customerName: newValue.name,
                      customerEmail: newValue.email
                    })
                    // 选择后设置inputValue为显示文本
                    setCustomerSearchInput(`${newValue.name} (${newValue.email})`)
                  } else {
                    // 清除时，重置选择标记，允许后续搜索
                    isSelectingCustomerRef.current = false
                    setDepositForm({
                      ...depositForm,
                      customerId: null,
                      customerName: "",
                      customerEmail: ""
                    })
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
                    placeholder={depositFormCustomerLocked ? "客户已锁定" : "输入邮箱搜索客户"}
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

              <FormControl fullWidth required>
                <InputLabel>币种</InputLabel>
                <Select
                  value={depositForm.currency}
                  label="币种"
                  onChange={(e) => setDepositForm({ ...depositForm, currency: e.target.value })}
                >
                  <MenuItem value="USD">USD - 美元</MenuItem>
                  <MenuItem value="HKD">HKD - 港币</MenuItem>
                  {/* <MenuItem value="CNY">CNY - 人民币</MenuItem> */}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>打款渠道</InputLabel>
                <Select
                  value={depositForm.channel}
                  label="打款渠道"
                  onChange={(e) => setDepositForm({ ...depositForm, channel: e.target.value })}
                >
                  {channelList.length === 0 ? (
                    <MenuItem disabled>加载中...</MenuItem>
                  ) : (
                    channelList.map((item) => (
                      <MenuItem key={item.dictValue} value={item.dictValue}>
                        {item.dictLabel}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                required
                label="入金金额"
                type="number"
                value={depositForm.amount}
                onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{depositForm.currency}</InputAdornment>,
                }}
                helperText="请输入正确的金额"
              />

              {/* <TextField
                fullWidth
                label="参考号"
                value={depositForm.referenceNumber}
                onChange={(e) => setDepositForm({ ...depositForm, referenceNumber: e.target.value })}
                placeholder="例如：TXN20240115001"
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
                  disabled={uploadingDepositVoucher}
                >
                  {uploadingDepositVoucher ? "上传中..." : (depositForm.attachment ? "重新上传凭证" : "上传凭证（可选）")}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleDepositVoucherUpload}
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

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => {
                setManualDepositOpen(false)
                // 重置表单和搜索状态
                setDepositForm({
                  customerId: null,
                  customerName: "",
                  customerEmail: "",
                  currency: "USD",
                  amount: "",
                  channel: "",
                  referenceNumber: "",
                  notes: "",
                  attachment: null,
                  voucherUrl: "",
                })
                setCustomerSearchInput("")
                setCustomerSearchOptions([])
                setDepositFormCustomerLocked(false)
                // 清除防抖定时器
                if (customerSearchDebounceTimerRef.current) {
                  clearTimeout(customerSearchDebounceTimerRef.current)
                  customerSearchDebounceTimerRef.current = null
                }
                // 重置选择标记
                isSelectingCustomerRef.current = false
              }}>
                取消
              </Button>
              <Button variant="contained" color="success" fullWidth onClick={handleManualDepositSubmit}>
                确认入金
              </Button>
            </Box>
          </Box>
        </Drawer>

        <Drawer anchor="right" open={manualWithdrawalOpen} onClose={() => {
          setManualWithdrawalOpen(false)
          // 重置搜索状态和锁定状态
          setWithdrawalCustomerSearchInput("")
          setWithdrawalCustomerSearchOptions([])
          setWithdrawalFormCustomerLocked(false)
          // 清除防抖定时器
          if (withdrawalCustomerSearchDebounceTimerRef.current) {
            clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
            withdrawalCustomerSearchDebounceTimerRef.current = null
          }
        }}>
          <Box sx={{ width: 480, p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                手动出金
              </Typography>
              <IconButton onClick={() => {
                setManualWithdrawalOpen(false)
                // 重置搜索状态和锁定状态
                setWithdrawalCustomerSearchInput("")
                setWithdrawalCustomerSearchOptions([])
                setWithdrawalFormCustomerLocked(false)
                setBankAccountList([])
                setOutCashFee("")
                setOutCashFeeCurrency("")
                // 清除防抖定时器
                if (withdrawalCustomerSearchDebounceTimerRef.current) {
                  clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
                  withdrawalCustomerSearchDebounceTimerRef.current = null
                }
              }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              手动出金将直接扣减客户账户余额，请谨慎操作并确保客户有足够余额。
            </Alert>

            <Stack spacing={3}>
              <Autocomplete
                fullWidth
                disabled={withdrawalFormCustomerLocked}
                options={withdrawalCustomerSearchOptions}
                loading={withdrawalCustomerSearchLoading}
                inputValue={withdrawalForm.customerId ? (withdrawalCustomerSearchOptions.find(opt => opt.id === withdrawalForm.customerId) ? `${withdrawalForm.customerName} (${withdrawalCustomerSearchOptions.find(opt => opt.id === withdrawalForm.customerId)?.email || withdrawalForm.customerEmail || ''})` : withdrawalForm.customerEmail ? `${withdrawalForm.customerName} (${withdrawalForm.customerEmail})` : withdrawalCustomerSearchInput) : withdrawalCustomerSearchInput}
                onInputChange={(_, newInputValue, reason) => {
                  if (!withdrawalFormCustomerLocked) {
                    handleWithdrawalCustomerSearchInputChange(newInputValue, reason)
                  }
                }}
                value={withdrawalForm.customerId ? (withdrawalCustomerSearchOptions.find(opt => opt.id === withdrawalForm.customerId) || (withdrawalForm.customerName && withdrawalForm.customerEmail ? { id: withdrawalForm.customerId!, name: withdrawalForm.customerName, email: withdrawalForm.customerEmail } : null)) : null}
                onChange={(_, newValue) => {
                  if (withdrawalFormCustomerLocked) return
                  
                  // 清除搜索定时器，防止触发搜索
                  if (withdrawalCustomerSearchDebounceTimerRef.current) {
                    clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
                    withdrawalCustomerSearchDebounceTimerRef.current = null
                  }
                  
                  // 标记正在选择，避免触发搜索
                  isSelectingWithdrawalCustomerRef.current = true
                  
                  if (newValue) {
                    setWithdrawalForm({
                      ...withdrawalForm,
                      customerId: newValue.id,
                      customerName: newValue.name,
                      customerEmail: newValue.email,
                      bankAccountId: null,  // 重置银行账号选择
                    })
                    // 选择后设置inputValue为显示文本
                    setWithdrawalCustomerSearchInput(`${newValue.name} (${newValue.email})`)
                    // 确保已选择的客户保留在选项中，避免被清空
                    setWithdrawalCustomerSearchOptions((prev) => {
                      const exists = prev.find(opt => opt.id === newValue.id)
                      if (exists) {
                        return prev
                      }
                      return [...prev, newValue]
                    })
                    // 加载银行账号列表
                    loadBankAccountList(newValue.id)
                  } else {
                    setWithdrawalForm({
                      ...withdrawalForm,
                      customerId: null,
                      customerName: "",
                      customerEmail: "",
                      bankAccountId: null,
                    })
                    setWithdrawalCustomerSearchInput("")
                    setWithdrawalCustomerSearchOptions([])
                    setBankAccountList([])
                  }
                }}
                getOptionLabel={(option) => option ? `${option.name} (${option.email})` : ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="选择客户"
                    required
                    placeholder={withdrawalFormCustomerLocked ? "客户已锁定" : "输入邮箱搜索客户"}
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
                noOptionsText={withdrawalCustomerSearchInput ? "未找到匹配的客户" : "请输入邮箱搜索客户"}
                filterOptions={(x) => x} // 禁用客户端过滤，使用服务器端搜索
              />

              <FormControl fullWidth required>
                <InputLabel>币种</InputLabel>
                <Select
                  value={withdrawalForm.currency}
                  label="币种"
                  onChange={(e) => {
                    const newCurrency = e.target.value
                    setWithdrawalForm({ ...withdrawalForm, currency: newCurrency })
                    // 加载出金手续费
                    loadOutCashFee(newCurrency)
                  }}
                >
                  <MenuItem value="USD">USD - 美元</MenuItem>
                  <MenuItem value="HKD">HKD - 港币</MenuItem>
                  {/* <MenuItem value="CNY">CNY - 人民币</MenuItem> */}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>打款渠道</InputLabel>
                <Select
                  value={withdrawalForm.channel}
                  label="打款渠道"
                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, channel: e.target.value })}
                >
                  {channelList.length === 0 ? (
                    <MenuItem disabled>加载中...</MenuItem>
                  ) : (
                    channelList.map((item) => (
                      <MenuItem key={item.dictValue} value={item.dictValue}>
                        {item.dictLabel}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* 银行账号白名单选择 */}
              <FormControl fullWidth required>
                <InputLabel>银行账号</InputLabel>
                <Select
                  value={withdrawalForm.bankAccountId || ""}
                  label="银行账号"
                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, bankAccountId: e.target.value as number })}
                  disabled={!withdrawalForm.customerId || bankAccountLoading}
                >
                  {!withdrawalForm.customerId ? (
                    <MenuItem disabled>请先选择客户</MenuItem>
                  ) : bankAccountLoading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2">加载中...</Typography>
                      </Box>
                    </MenuItem>
                  ) : bankAccountList.length === 0 ? (
                    <MenuItem disabled>暂无银行账号</MenuItem>
                  ) : (
                    bankAccountList.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {account.bankName} - {account.bankAccount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {account.accountHolderName}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                {!withdrawalForm.customerId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    请先选择客户以加载银行账号列表
                  </Typography>
                )}
                {withdrawalForm.customerId && bankAccountList.length === 0 && !bankAccountLoading && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    该客户暂无银行账号白名单，请先添加银行账号白名单后再进行出金操作
                  </Typography>
                )}
                {withdrawalForm.customerId && bankAccountLoading && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    正在加载银行账号列表...
                  </Typography>
                )}
              </FormControl>

              {/* 出金手续费显示 */}
              {withdrawalForm.currency && (
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      出金手续费：
                    </Typography>
                    {outCashFeeLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {outCashFeeCurrency || withdrawalForm.currency} {outCashFee || "0"}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              <TextField
                fullWidth
                required
                label="出金金额"
                type="number"
                value={withdrawalForm.amount}
                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{withdrawalForm.currency}</InputAdornment>,
                }}
                helperText="请确保客户有足够余额"
              />

              {/* <TextField
                fullWidth
                label="参考号"
                value={withdrawalForm.referenceNumber}
                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, referenceNumber: e.target.value })}
                placeholder="例如：WD20240115001"
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
                  disabled={uploadingWithdrawalVoucher}
                >
                  {uploadingWithdrawalVoucher ? "上传中..." : (withdrawalForm.attachment ? "重新上传凭证" : "上传凭证（可选）")}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleWithdrawalVoucherUpload}
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

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setManualWithdrawalOpen(false)}>
                取消
              </Button>
              <Button variant="contained" color="error" fullWidth onClick={handleManualWithdrawalSubmit}>
                确认出金
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 出金审批抽屉 */}
        <Drawer
          anchor="right"
          open={approvalDrawerOpen}
          onClose={() => {
            if (!approvalSubmitting) {
              setApprovalDrawerOpen(false)
              setApprovalChannel("")
              setApprovalBank("")
              setApprovalProof(null)
              setApprovalRemark("")
              setSelectedWithdrawalApproval(null)
            }
          }}
          PaperProps={{
            sx: { width: 500 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#212121" }}>
              出金审批
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {selectedWithdrawalApproval && (
              <Box sx={{ mb: 3 }}>
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      出金金额
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {formatAmount(selectedWithdrawalApproval.amount, selectedWithdrawalApproval.currency)}
                    </Typography>
                  </Box>
                </Alert>
                <Card sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        客户
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedWithdrawalApproval.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedWithdrawalApproval.customerEmail}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        收款人
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedWithdrawalApproval.recipient}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        用途
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatPurpose(selectedWithdrawalApproval.purpose)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        申请时间
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatTime(selectedWithdrawalApproval.createdAt)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        出金手续费
                      </Typography>
                      {outCashFeeLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" color="text.secondary">加载中...</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                          {outCashFeeCurrency || selectedWithdrawalApproval.currency} {outCashFee || "0"}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Card>
              </Box>
            )}

            <Stack spacing={3}>
              <TextField
                select
                label="打款渠道"
                value={approvalChannel}
                onChange={(e) => setApprovalChannel(e.target.value)}
                required
                helperText="请选择打款渠道"
                disabled={loadingDictData}
              >
                {loadingDictData ? (
                  <MenuItem disabled>加载中...</MenuItem>
                ) : channelList.length === 0 ? (
                  <MenuItem disabled>暂无数据</MenuItem>
                ) : (
                  channelList.map((item) => (
                    <MenuItem key={item.dictValue} value={item.dictValue}>
                      {item.dictLabel}
                    </MenuItem>
                  ))
                )}
              </TextField>

              <TextField
                select
                label="打款银行"
                value={approvalBank}
                onChange={(e) => setApprovalBank(e.target.value)}
                required
                helperText="请选择打款银行"
                disabled={loadingDictData}
              >
                {loadingDictData ? (
                  <MenuItem disabled>加载中...</MenuItem>
                ) : bankList.length === 0 ? (
                  <MenuItem disabled>暂无数据</MenuItem>
                ) : (
                  bankList.map((item) => (
                    <MenuItem key={item.dictValue} value={item.dictValue}>
                      {item.dictLabel}
                    </MenuItem>
                  ))
                )}
              </TextField>

              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: "#212121" }}>
                  上传打款凭证 *
                </Typography>
                <Button 
                  variant="outlined" 
                  component="label" 
                  fullWidth 
                  sx={{ py: 1.5, justifyContent: "flex-start" }}
                  disabled={uploadingApprovalVoucher}
                  startIcon={uploadingApprovalVoucher ? <CircularProgress size={20} /> : <UploadFileIcon />}
                >
                  {uploadingApprovalVoucher ? "上传中..." : (approvalProof ? approvalProof.name : "选择文件")}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleApprovalVoucherUpload}
                    disabled={uploadingApprovalVoucher}
                  />
                </Button>
                {approvalProof && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: "block" }}>
                    ✓ 已上传: {approvalProof.name}
                  </Typography>
                )}
                {!approvalProof && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    支持 JPG, PNG 格式，最大 10MB
                  </Typography>
                )}
              </Box>

              <TextField 
                label="审批备注" 
                multiline 
                rows={4} 
                required
                placeholder="请输入审批备注"
                value={approvalRemark}
                onChange={(e) => setApprovalRemark(e.target.value)}
                error={approvalRemark.trim() === ""}
                helperText={approvalRemark.trim() === "" ? "此字段为必填项" : ""}
              />
            </Stack>

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                disabled={approvalSubmitting}
                onClick={() => {
                  setRejectDialogOpen(true)
                }}
              >
                拒绝
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={approvalSubmitting || !approvalChannel || !approvalBank || !approvalVoucherUrl || !approvalRemark || !approvalRemark.trim()}
                onClick={() => handleWithdrawApproval('approve')}
              >
                {approvalSubmitting ? '提交中...' : '批准'}
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 查看打款信息抽屉 */}
        <Drawer
          anchor="right"
          open={viewPaymentDrawerOpen}
          onClose={() => setViewPaymentDrawerOpen(false)}
          PaperProps={{
            sx: { width: 500 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#212121" }}>
              打款信息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {selectedPaymentInfo && (
              <Stack spacing={3}>
                <Card sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        客户
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedPaymentInfo.customer}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        出金金额
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600, color: "#1976d2" }}>
                        {formatAmount(selectedPaymentInfo.amount, selectedPaymentInfo.currency)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        收款人
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedPaymentInfo.payee}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    打款详情
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          打款渠道
                        </Typography>
                        {selectedPaymentInfo.channel ? (
                          <Chip
                            label={
                              channelList.find(item => item.dictValue === selectedPaymentInfo.channel)?.dictLabel || 
                              selectedPaymentInfo.channel
                            }
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            -
                          </Typography>
                        )}
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          打款银行
                        </Typography>
                        {selectedPaymentInfo.bank ? (
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                            {bankList.find(item => item.dictValue === selectedPaymentInfo.bank)?.dictLabel || 
                             selectedPaymentInfo.bank}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            -
                          </Typography>
                        )}
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          打款凭证
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {selectedPaymentInfo.voucherUrl ? (
                            <Box>
                              {(() => {
                                // 根据环境变量拼接图片URL
                                const getImageUrl = (voucherUrl: string) => {
                                  if (voucherUrl.startsWith('http')) {
                                    return voucherUrl
                                  }
                                  // 根据 NODE_ENV 拼接基础URL
                                  const baseUrl = process.env.NODE_ENV === 'production'
                                    ? 'https://dev_go_server.oditrust.com'
                                    : 'http://192.168.5.36:8808'
                                  
                                  // 如果路径以 / 开头，直接拼接；否则添加 /
                                  const path = voucherUrl.startsWith('/') 
                                    ? voucherUrl 
                                    : `/${voucherUrl}`
                                  
                                  return `${baseUrl}${path}`
                                }
                                
                                const imageUrl = getImageUrl(selectedPaymentInfo.voucherUrl)
                                
                                return (
                                  <>
                                    <img 
                                      src={imageUrl}
                                      alt="打款凭证"
                                      style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '300px', 
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0',
                                        cursor: 'pointer'
                                      }}
                                      onError={(e) => {
                                        console.error('图片加载失败:', imageUrl)
                                        e.currentTarget.style.display = 'none'
                                      }}
                                      onClick={() => {
                                        window.open(imageUrl, '_blank')
                                      }}
                                    />
                                    <Button 
                                      variant="outlined" 
                                      size="small" 
                                      startIcon={<DescriptionIcon />}
                                      sx={{ mt: 1 }}
                                      onClick={() => {
                                        window.open(imageUrl, '_blank')
                                      }}
                                    >
                                      查看大图
                                    </Button>
                                  </>
                                )
                              })()}
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              暂无凭证
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          审批时间
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {selectedPaymentInfo.approvalTime || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              </Stack>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ReceiptIcon />}
                onClick={() => {
                  setInvoiceDrawerOpen(true)
                }}
              >
                查看转账Invoice
              </Button>
              <Button variant="outlined" fullWidth onClick={() => setViewPaymentDrawerOpen(false)}>
                关闭
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 转账Invoice抽屉 */}
        <Drawer
          anchor="right"
          open={invoiceDrawerOpen}
          onClose={() => setInvoiceDrawerOpen(false)}
          PaperProps={{
            sx: { width: 600 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#212121" }}>
                转账Invoice
              </Typography>
              <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                打印
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {selectedPaymentInfo && (
              <Stack spacing={3}>
                {/* Invoice Header */}
                <Card sx={{ bgcolor: "#f5f5f5", p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                    信托资产管理有限公司
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trust Asset Management Limited
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Invoice编号
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                        INV-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(6, "0")}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" color="text.secondary">
                        开具日期
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date().toLocaleDateString('zh-CN')}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Transaction Details */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    交易详情
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          交易类型
                        </Typography>
                        <Chip label="出金转账" size="small" color="primary" />
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          转账金额
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600, color: "#1976d2" }}>
                          {formatAmount(selectedPaymentInfo.amount, selectedPaymentInfo.currency)}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          手续费
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          {selectedPaymentInfo.currency} 0.00
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          总计
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 700, color: "#212121" }}>
                          {formatAmount(selectedPaymentInfo.amount, selectedPaymentInfo.currency)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Sender Information */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    付款方信息
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          公司名称
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          信托资产管理有限公司
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          账户名称
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          Trust Asset Management Ltd.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          账户号码
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          {selectedPaymentInfo.currency === "USD"
                            ? "1234567890"
                            : selectedPaymentInfo.currency === "HKD"
                              ? "987-654321-001"
                              : "6228480012345678"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          开户银行
                        </Typography>
                        <Typography variant="body1">
                          {selectedPaymentInfo.bank === "hsbc"
                            ? "汇丰银行 (HSBC)"
                            : selectedPaymentInfo.bank === "scb"
                              ? "渣打银行 (Standard Chartered)"
                              : selectedPaymentInfo.bank === "boc"
                                ? "中国银行 (Bank of China)"
                                : "其他银行"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Receiver Information */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    收款方信息
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          客户名称
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedPaymentInfo.customer}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          收款人
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedPaymentInfo.payee}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          收款账号
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          ****{String(Math.floor(Math.random() * 10000)).padStart(4, "0")}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Payment Method */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#212121" }}>
                    转账方式
                  </Typography>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          转账渠道
                        </Typography>
                        <Chip
                          label={
                            selectedPaymentInfo.channel === "wire"
                              ? "电汇"
                              : selectedPaymentInfo.channel === "fps"
                                ? "FPS"
                                : selectedPaymentInfo.channel === "swift"
                                  ? "SWIFT"
                                  : "本地转账"
                          }
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          参考号
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          REF{new Date().getFullYear()}
                          {String(Math.floor(Math.random() * 1000000)).padStart(8, "0")}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          状态
                        </Typography>
                        <Chip label="已完成" size="small" color="success" />
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Footer */}
                <Card sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    备注
                  </Typography>
                  <Typography variant="body2">
                    本Invoice由系统自动生成，作为转账记录凭证。如有疑问，请联系客户服务部门。
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    生成时间: {new Date().toLocaleString('zh-CN')}
                  </Typography>
                </Card>
              </Stack>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button variant="outlined" fullWidth startIcon={<DownloadIcon />}>
                下载PDF
              </Button>
              <Button variant="outlined" fullWidth onClick={() => setInvoiceDrawerOpen(false)}>
                关闭
              </Button>
            </Box>
          </Box>
        </Drawer>

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
      </Box>
  )
}
