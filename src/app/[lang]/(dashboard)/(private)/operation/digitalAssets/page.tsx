'use client'

import type React from 'react'

import { useState, useEffect, useRef } from 'react'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Grid2 as Grid,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  Drawer,
  Divider,
  Autocomplete,
  useTheme,
  Checkbox,
  Tooltip,
  TablePagination,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar
} from '@mui/material'

// API Imports
import {
  getCoinOverview,
  getCustomerAssets,
  getTransactionFlow,
  manualDeposit,
  manualWithdraw,
  uploadSingleFile,
  memberSearch,
  getUserCoins,
  getDefaultCreateCoins,
  getDefaultCreateChains,
  getCoinWithdrawalList,
  coinWithdrawalApprove,
  coinWithdrawalReject,
  type DigitalAssetsOverviewResponse,
  type CustomerAssetsResponse,
  type TransactionFlowResponse,
  type MemberSearchItem,
  type MemberSearchResponse,
  type UserCoinsResponse,
  type DefaultCreateCoinItem,
  type DefaultCreateChainItem,
  type CoinWithdrawalListResponse,
  type CoinWithdrawalListItem
} from '@server/digitalAssets'

// Materialize Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Styles
import tableStyles from '@core/styles/table.module.css'
import Link from 'next/link'
import ManualTransactionDrawers from './ManualTransactionDrawers'
import CustomerDigitalAssetDetail from './CustomerDigitalAssetDetail'
import { useRouter } from 'next/navigation'

// Charts
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts'

type DisplayMode = 'equity' | 'physical'
type TabValue = 'overview' | 'by-customer' | 'transactions' | 'withdrawal-audit'

const TAB_VALUES: TabValue[] = ['overview', 'by-customer', 'transactions', 'withdrawal-audit']

export default function DigitalAssetsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('overview')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('equity')
  const theme = useTheme()
  const [externalLinkDialog, setExternalLinkDialog] = useState<string | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<any>(null)
  const [showCustomerDetail, setShowCustomerDetail] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string | null>(null)

  // API data states
  const [overviewData, setOverviewData] = useState<DigitalAssetsOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Customer assets data states
  const [customerAssetsData, setCustomerAssetsData] = useState<CustomerAssetsResponse | null>(null)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [customerKeyword, setCustomerKeyword] = useState('') // 实际用于API请求
  const [customerSearchInput, setCustomerSearchInput] = useState('') // 临时输入值

  // Transaction flow data states
  const [transactionFlowData, setTransactionFlowData] = useState<TransactionFlowResponse | null>(null)
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  // Manual transaction states
  const [manualDepositOpen, setManualDepositOpen] = useState(false)
  const [manualWithdrawalOpen, setManualWithdrawalOpen] = useState(false)

  // Form states for manual deposit
  const [depositForm, setDepositForm] = useState({
    customer: '',
    customerId: null as number | null,
    customerName: '',
    customerEmail: '',
    currency: 'BTC',
    amount: '',
    referenceNumber: '',
    notes: '',
    attachment: null as File | null,
    voucherUrl: '' // 上传后的凭证URL
  })

  // Form states for manual withdrawal
  const [withdrawalForm, setWithdrawalForm] = useState({
    customer: '',
    customerId: null as number | null,
    customerName: '',
    customerEmail: '',
    currency: 'BTC',
    amount: '',
    referenceNumber: '',
    notes: '',
    attachment: null as File | null,
    voucherUrl: '' // 上传后的凭证URL
  })

  // 客户搜索相关状态（手动入金）
  const [depositCustomerSearchOptions, setDepositCustomerSearchOptions] = useState<MemberSearchItem[]>([])
  const [depositCustomerSearchLoading, setDepositCustomerSearchLoading] = useState(false)
  const [depositCustomerSearchInput, setDepositCustomerSearchInput] = useState('')
  const depositCustomerSearchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSelectingDepositCustomerRef = useRef(false)

  // 客户搜索相关状态（手动出金）
  const [withdrawalCustomerSearchOptions, setWithdrawalCustomerSearchOptions] = useState<MemberSearchItem[]>([])
  const [withdrawalCustomerSearchLoading, setWithdrawalCustomerSearchLoading] = useState(false)
  const [withdrawalCustomerSearchInput, setWithdrawalCustomerSearchInput] = useState('')
  const withdrawalCustomerSearchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSelectingWithdrawalCustomerRef = useRef(false)

  // 币种列表状态（手动入金）
  const [depositCurrencyOptions, setDepositCurrencyOptions] = useState<Array<{ coinKey: string; coinName?: string }>>(
    []
  )
  const [depositCurrencyLoading, setDepositCurrencyLoading] = useState(false)

  // 币种列表状态（手动出金）
  const [withdrawalCurrencyOptions, setWithdrawalCurrencyOptions] = useState<
    Array<{ coinKey: string; coinName?: string }>
  >([])
  const [withdrawalCurrencyLoading, setWithdrawalCurrencyLoading] = useState(false)

  // 上传状态
  const [uploadingDepositVoucher, setUploadingDepositVoucher] = useState(false)
  const [uploadingWithdrawalVoucher, setUploadingWithdrawalVoucher] = useState(false)

  // Snackbar 提示
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  })

  // Filters for "By Customer" tab
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null)
  const [includeInternal, setIncludeInternal] = useState(false)

  // 客户搜索相关状态（流水筛选）
  const [txCustomerSearchOptions, setTxCustomerSearchOptions] = useState<MemberSearchItem[]>([])
  const [txCustomerSearchLoading, setTxCustomerSearchLoading] = useState(false)
  const [txCustomerSearchInput, setTxCustomerSearchInput] = useState('')
  const txCustomerSearchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSelectingTxCustomerRef = useRef(false)

  // 币种和链列表状态（用于流水筛选）
  const [coinOptions, setCoinOptions] = useState<DefaultCreateCoinItem[]>([])
  const [chainOptions, setChainOptions] = useState<DefaultCreateChainItem[]>([])
  const [loadingCoinChainOptions, setLoadingCoinChainOptions] = useState(false)
  const coinChainOptionsLoadedRef = useRef(false)

  // Filters for "Transactions" tab
  const [txFilters, setTxFilters] = useState({
    timeRange: 'all',
    customer: null as MemberSearchItem | null,
    currency: 'all',
    chain: 'all',
    direction: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    addressLabel: '',
    source: 'all',
    keyword: ''
  })

  // 实际用于查询的筛选条件（只有点击查询时才更新）
  const [activeTxFilters, setActiveTxFilters] = useState({
    timeRange: 'all',
    startTime: undefined as string | undefined,
    endTime: undefined as string | undefined,
    customerId: null as number | null, // 存储客户ID
    currency: 'all',
    chain: 'all',
    direction: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    addressLabel: '',
    source: 'all',
    keyword: ''
  })

  // Pagination and selection for transactions
  const [txPage, setTxPage] = useState(0)
  const [txRowsPerPage, setTxRowsPerPage] = useState(10)
  const [selectedTxs, setSelectedTxs] = useState<number[]>([])

  // Pagination and selection for customers
  const [customerPage, setCustomerPage] = useState(0)
  const [customerRowsPerPage, setCustomerRowsPerPage] = useState(10)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  // 出金审核状态
  const [withdrawalAuditPage, setWithdrawalAuditPage] = useState(0)
  const [withdrawalAuditPageSize, setWithdrawalAuditPageSize] = useState(10)
  const [withdrawalAuditFilters, setWithdrawalAuditFilters] = useState({
    status: 'all',           // 状态：all全部, 0待审核, 2已审核, 3提交
    keyword: '',             // 关键词（交易哈希、地址）
    coinKey: 'all',          // 币种
    chain: 'all',            // 链
    startTime: '',           // 开始时间
    endTime: '',             // 结束时间
  })
  const [withdrawalAuditLoading, setWithdrawalAuditLoading] = useState(false)
  const [withdrawalAuditData, setWithdrawalAuditData] = useState<CoinWithdrawalListResponse | null>(null)
  const [withdrawalAuditError, setWithdrawalAuditError] = useState<string | null>(null)
  
  // 出金审核操作相关状态
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<number | null>(null)
  const [processingAction, setProcessingAction] = useState(false)

  // 跟踪弹窗之前的状态，用于判断是否是从打开变为关闭
  const prevManualDepositOpenRef = useRef(manualDepositOpen)
  const prevManualWithdrawalOpenRef = useRef(manualWithdrawalOpen)

  const lastSyncTime = '2024-01-15 15:30:25'

  // Load overview data
  const loadOverviewData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCoinOverview()

      // 从 ServerResponse 中提取数据
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data

      setOverviewData(actualData as DigitalAssetsOverviewResponse)
    } catch (err) {
      console.error('Failed to load coin overview:', err)
      setError('数据加载失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  // Load customer assets data
  const loadCustomerAssets = async () => {
    try {
      setCustomerLoading(true)
      setCustomerError(null)
      const response = await getCustomerAssets({
        pageNum: customerPage + 1, // 后端从1开始计数
        pageSize: customerRowsPerPage,
        keyword: customerKeyword || undefined
      })

      // 从 ServerResponse 中提取数据
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data

      setCustomerAssetsData(actualData as CustomerAssetsResponse)
    } catch (err) {
      console.error('Failed to load customer assets:', err)
      setCustomerError('客户资产数据加载失败，请刷新重试')
    } finally {
      setCustomerLoading(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    loadOverviewData()
  }, [])

  // Load customer assets when tab switches to "by-customer" or pagination/filter changes
  useEffect(() => {
    if (activeTab === 'by-customer') {
      loadCustomerAssets()
    }
  }, [activeTab, customerPage, customerRowsPerPage, customerKeyword])

  // 清空手动入金表单数据（当弹窗关闭时）
  useEffect(() => {
    // 如果弹窗从打开变为关闭，清空表单数据
    if (prevManualDepositOpenRef.current && !manualDepositOpen) {
      setDepositForm({
        customer: '',
        customerId: null,
        customerName: '',
        customerEmail: '',
        currency: 'BTC',
        amount: '',
        referenceNumber: '',
        notes: '',
        attachment: null,
        voucherUrl: ''
      })
      setDepositCustomerSearchInput('')
      setDepositCustomerSearchOptions([])
      setDepositCurrencyOptions([])
    }
    prevManualDepositOpenRef.current = manualDepositOpen
  }, [manualDepositOpen])

  // 清空手动出金表单数据（当弹窗关闭时）
  useEffect(() => {
    // 如果弹窗从打开变为关闭，清空表单数据
    if (prevManualWithdrawalOpenRef.current && !manualWithdrawalOpen) {
      setWithdrawalForm({
        customer: '',
        customerId: null,
        customerName: '',
        customerEmail: '',
        currency: 'BTC',
        amount: '',
        referenceNumber: '',
        notes: '',
        attachment: null,
        voucherUrl: ''
      })
      setWithdrawalCustomerSearchInput('')
      setWithdrawalCustomerSearchOptions([])
      setWithdrawalCurrencyOptions([])
    }
    prevManualWithdrawalOpenRef.current = manualWithdrawalOpen
  }, [manualWithdrawalOpen])

  // Handle customer search
  const handleCustomerSearch = () => {
    // 去掉空格后设置关键词
    const trimmedKeyword = customerSearchInput.trim()
    setCustomerKeyword(trimmedKeyword)
    setCustomerPage(0) // 重置到第一页
  }

  // Handle customer search reset
  const handleCustomerSearchReset = () => {
    setCustomerSearchInput('')
    setCustomerKeyword('')
    setCustomerPage(0) // 重置到第一页
  }

  // 流水筛选客户搜索函数（带防抖）
  const handleTxCustomerSearch = async (email: string) => {
    if (!email || email.trim().length === 0) {
      setTxCustomerSearchOptions([])
      return
    }

    try {
      setTxCustomerSearchLoading(true)
      const response = await memberSearch({ email: email.trim(), limit: 50 })
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data
      const memberList =
        actualData && typeof actualData === 'object' && 'list' in actualData
          ? (actualData as MemberSearchResponse).list
          : []
      setTxCustomerSearchOptions(memberList)
    } catch (error) {
      console.error('客户搜索失败:', error)
      setTxCustomerSearchOptions([])
    } finally {
      setTxCustomerSearchLoading(false)
    }
  }

  // 处理流水筛选客户搜索输入变化（防抖）
  const handleTxCustomerSearchInputChange = (value: string, reason: string) => {
    // 如果正在选择客户（onChange触发），不触发搜索
    if (isSelectingTxCustomerRef.current) {
      isSelectingTxCustomerRef.current = false
      setTxCustomerSearchInput(value)
      // 清除定时器，确保不会触发搜索
      if (txCustomerSearchDebounceTimerRef.current) {
        clearTimeout(txCustomerSearchDebounceTimerRef.current)
        txCustomerSearchDebounceTimerRef.current = null
      }
      return
    }

    // 如果是重置、清除或失去焦点操作，不触发搜索
    if (reason === 'reset' || reason === 'clear' || reason === 'blur') {
      setTxCustomerSearchInput(value)
      // 清除定时器
      if (txCustomerSearchDebounceTimerRef.current) {
        clearTimeout(txCustomerSearchDebounceTimerRef.current)
        txCustomerSearchDebounceTimerRef.current = null
      }
      return
    }

    setTxCustomerSearchInput(value)

    // 清除之前的定时器
    if (txCustomerSearchDebounceTimerRef.current) {
      clearTimeout(txCustomerSearchDebounceTimerRef.current)
    }

    // 如果输入为空，清空选项列表
    if (!value || value.trim().length === 0) {
      setTxCustomerSearchOptions([])
      txCustomerSearchDebounceTimerRef.current = null
      return
    }

    // 设置新的定时器
    txCustomerSearchDebounceTimerRef.current = setTimeout(() => {
      handleTxCustomerSearch(value)
    }, 300) // 300ms 防抖
  }

  // 将时间范围转换为开始时间和结束时间
  const convertTimeRangeToDates = (timeRange: string): { startTime?: string; endTime?: string } => {
    if (timeRange === 'all') {
      return {}
    }

    const now = new Date()
    const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    let startTime: Date

    switch (timeRange) {
      case 'today':
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        break
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        startTime.setHours(0, 0, 0, 0)
        break
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        startTime.setHours(0, 0, 0, 0)
        break
      default:
        return {}
    }

    // 格式化为 YYYY-MM-DD HH:mm:ss 格式
    const formatDateTime = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    return {
      startTime: formatDateTime(startTime),
      endTime: formatDateTime(endTime)
    }
  }

  // Handle transaction filters reset
  const handleTxFiltersReset = () => {
    const resetFilters = {
      timeRange: 'all',
      customer: null as MemberSearchItem | null,
      currency: 'all',
      chain: 'all',
      direction: 'all',
      status: 'all',
      minAmount: '',
      maxAmount: '',
      addressLabel: '',
      source: 'all',
      keyword: ''
    }
    setTxFilters(resetFilters)
    setActiveTxFilters({
      ...resetFilters,
      customerId: null,
      startTime: undefined,
      endTime: undefined
    })
    setTxCustomerSearchInput('')
    setTxCustomerSearchOptions([])
    setTxPage(0) // 重置到第一页
  }

  // Load transaction flow data
  const loadTransactionFlow = async () => {
    try {
      setTxLoading(true)
      setTxError(null)

      // 映射页面筛选值到API参数
      const directionMap: Record<string, string> = {
        入金: 'inflow',
        出金: 'outflow',
        归集: 'collection',
        内部: 'internal'
      }

      const statusMap: Record<string, string> = {
        完成: 'completed',
        失败: 'failed',
        在途: 'pending'
      }

      // 获取选中的客户ID
      const userId = activeTxFilters.customerId || undefined

      // 映射发起来源：'1' -> 'customer', '2' -> 'backend'
      const sourceMap: Record<string, string> = {
        '1': 'customer',
        '2': 'backend'
      }

      const response = await getTransactionFlow({
        pageNum: txPage + 1,
        pageSize: txRowsPerPage,
        userId: userId,
        coinKey: activeTxFilters.currency !== 'all' ? activeTxFilters.currency : undefined,
        chain: activeTxFilters.chain !== 'all' ? activeTxFilters.chain : undefined,
        direction: activeTxFilters.direction !== 'all' ? directionMap[activeTxFilters.direction] : undefined,
        status: activeTxFilters.status !== 'all' ? statusMap[activeTxFilters.status] : undefined,
        source: activeTxFilters.source !== 'all' ? sourceMap[activeTxFilters.source] : undefined,
        minAmount: activeTxFilters.minAmount || undefined,
        maxAmount: activeTxFilters.maxAmount || undefined,
        addressLabel: activeTxFilters.addressLabel || undefined,
        keyword: activeTxFilters.keyword || undefined,
        startTime: activeTxFilters.startTime,
        endTime: activeTxFilters.endTime
      })

      // 从 ServerResponse 中提取数据
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data

      setTransactionFlowData(actualData as TransactionFlowResponse)
    } catch (err) {
      console.error('Failed to load transaction flow:', err)
      setTxError('交易流水数据加载失败，请刷新重试')
    } finally {
      setTxLoading(false)
    }
  }

  // Load coin and chain options for transaction filters
  const loadCoinChainOptions = async () => {
    try {
      setLoadingCoinChainOptions(true)

      // 并行请求币种和链列表
      const [coinsResponse, chainsResponse] = await Promise.all([getDefaultCreateCoins(), getDefaultCreateChains()])

      // 从 ServerResponse 中提取数据
      const coinsData =
        coinsResponse.data && typeof coinsResponse.data === 'object' && 'data' in coinsResponse.data
          ? coinsResponse.data.data
          : coinsResponse.data
      const chainsData =
        chainsResponse.data && typeof chainsResponse.data === 'object' && 'data' in chainsResponse.data
          ? chainsResponse.data.data
          : chainsResponse.data

      const coinsList =
        coinsData && typeof coinsData === 'object' && 'list' in coinsData
          ? (coinsData as { list: DefaultCreateCoinItem[] }).list
          : []
      const chainsList =
        chainsData && typeof chainsData === 'object' && 'list' in chainsData
          ? (chainsData as { list: DefaultCreateChainItem[] }).list
          : []

      setCoinOptions(coinsList)
      setChainOptions(chainsList)
    } catch (err) {
      console.error('Failed to load coin and chain options:', err)
      // 失败时使用空数组，不影响页面显示
      setCoinOptions([])
      setChainOptions([])
    } finally {
      setLoadingCoinChainOptions(false)
    }
  }

  // Load coin and chain options when switching to transactions or withdrawal-audit tab
  useEffect(() => {
    if ((activeTab === 'transactions' || activeTab === 'withdrawal-audit') && !coinChainOptionsLoadedRef.current) {
      loadCoinChainOptions()
      coinChainOptionsLoadedRef.current = true
    }
  }, [activeTab])

  // Load transaction flow when tab switches to "transactions" or active filters/page change
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactionFlow()
    }
  }, [
    activeTab,
    txPage,
    txRowsPerPage,
    activeTxFilters.customerId,
    activeTxFilters.currency,
    activeTxFilters.chain,
    activeTxFilters.direction,
    activeTxFilters.status,
    activeTxFilters.source,
    activeTxFilters.minAmount,
    activeTxFilters.maxAmount,
    activeTxFilters.addressLabel,
    activeTxFilters.keyword,
    activeTxFilters.startTime,
    activeTxFilters.endTime
  ])

  // 处理查询按钮点击
  const handleTxQuery = () => {
    // 将选中的客户转换为ID
    const customerId = txFilters.customer?.id || null

    // 将时间范围转换为开始时间和结束时间
    const { startTime, endTime } = convertTimeRangeToDates(txFilters.timeRange)

    setActiveTxFilters({
      ...txFilters,
      customerId: customerId,
      startTime: startTime,
      endTime: endTime
    })
    setTxPage(0) // 重置到第一页
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const tabValue = TAB_VALUES[newValue]
    setActiveTab(tabValue)
  }

  const handleExternalLink = (url: string) => {
    setExternalLinkDialog(url)
  }

  const handleConfirmExternalLink = () => {
    if (externalLinkDialog) {
      window.open(externalLinkDialog, '_blank')
      setExternalLinkDialog(null)
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const handleExportCSV = () => {
    console.log('Exporting CSV...')
  }

  // 日期格式化函数（用于出金审核）
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

  // 格式化金额显示（用于出金审核）
  const formatWithdrawalAmount = (amount: number, currency: string) => {
    return (
      <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 500 }}>
        {currency} {amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Box>
    )
  }

  // 格式化时间显示（用于出金审核）
  const formatTime = (time: string | number | undefined) => {
    if (!time) return ''
    
    // 如果是数字，当作时间戳处理
    if (typeof time === 'number') {
      const date = time > 10000000000 ? new Date(time) : new Date(time * 1000)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    // 如果是字符串，检查是否是纯数字（时间戳字符串）
    if (typeof time === 'string' && /^\d+$/.test(time)) {
      const timestamp = parseInt(time, 10)
      const date = timestamp > 10000000000 ? new Date(timestamp) : new Date(timestamp * 1000)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    // 否则直接返回字符串（已经是格式化好的时间）
    return time
  }

  // 格式化用途显示（用于出金审核）
  const formatPurpose = (purpose: string | number | undefined): string => {
    if (purpose === undefined || purpose === null || purpose === '') return '-'
    
    // 转换为数字进行比较
    const purposeNum = typeof purpose === 'string' ? parseInt(purpose, 10) : purpose
    
    // 如果转换失败，返回原值
    if (isNaN(purposeNum)) return String(purpose)
    
    // 根据用途ID返回对应中文文本
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
        return '投资收益'
      case 7:
        return '其他'
      default:
        return String(purpose)
    }
  }

  // 出金审核：加载列表数据
  const loadWithdrawalAuditList = async () => {
    try {
      setWithdrawalAuditLoading(true)
      setWithdrawalAuditError(null)

      // 映射状态值到API参数
      const statusMap: Record<string, string> = {
        '0': '0',      // 待审核
        '2': '2',      // 已审核
        '3': '3'       // 提交
      }

      // 格式化时间
      const startTime = withdrawalAuditFilters.startTime || undefined
      const endTime = withdrawalAuditFilters.endTime || undefined

      const response = await getCoinWithdrawalList({
        pageNum: withdrawalAuditPage + 1,
        pageSize: withdrawalAuditPageSize,
        coinKey: withdrawalAuditFilters.coinKey !== 'all' ? withdrawalAuditFilters.coinKey : undefined,
        chain: withdrawalAuditFilters.chain !== 'all' ? withdrawalAuditFilters.chain : undefined,
        status: withdrawalAuditFilters.status !== 'all' 
          ? statusMap[withdrawalAuditFilters.status] 
          : undefined,
        keyword: withdrawalAuditFilters.keyword || undefined,
        startTime: startTime,
        endTime: endTime
      })

      // 从 ServerResponse 中提取数据
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data

      setWithdrawalAuditData(actualData as CoinWithdrawalListResponse)
    } catch (err) {
      console.error('Failed to load withdrawal audit list:', err)
      setWithdrawalAuditError('出金审核数据加载失败，请刷新重试')
    } finally {
      setWithdrawalAuditLoading(false)
    }
  }

  // 出金审核：处理查询
  const handleWithdrawalAuditSearch = () => {
    setWithdrawalAuditPage(0)
    // loadWithdrawalAuditList 会在 useEffect 中自动调用
  }

  // 出金审核：处理重置
  const handleWithdrawalAuditReset = () => {
    const resetFilters = {
      status: 'all',
      startTime: '',
      endTime: '',
      keyword: '',
      coinKey: 'all',
      chain: 'all',
    }
    setWithdrawalAuditFilters(resetFilters)
    setWithdrawalAuditPage(0)
  }

  // 加载出金审核数据（当标签页切换或筛选条件/分页变化时）
  useEffect(() => {
    if (activeTab === 'withdrawal-audit') {
      loadWithdrawalAuditList()
    }
  }, [
    activeTab,
    withdrawalAuditPage,
    withdrawalAuditPageSize,
    withdrawalAuditFilters.status,
    withdrawalAuditFilters.keyword,
    withdrawalAuditFilters.coinKey,
    withdrawalAuditFilters.chain,
    withdrawalAuditFilters.startTime,
    withdrawalAuditFilters.endTime
  ])

  // 处理出金审核通过
  const handleWithdrawalApprove = async () => {
    if (!selectedWithdrawalId) return

    try {
      setProcessingAction(true)
      await coinWithdrawalApprove({ id: selectedWithdrawalId })
      setSnackbar({ open: true, message: '审核通过成功', severity: 'success' })
      setApproveDialogOpen(false)
      setSelectedWithdrawalId(null)
      // 刷新列表
      loadWithdrawalAuditList()
    } catch (err) {
      console.error('审核通过失败:', err)
      setSnackbar({ open: true, message: getErrorMessage(err), severity: 'error' })
    } finally {
      setProcessingAction(false)
    }
  }

  // 处理出金审核拒绝
  const handleWithdrawalReject = async () => {
    if (!selectedWithdrawalId) return

    try {
      setProcessingAction(true)
      await coinWithdrawalReject({ id: selectedWithdrawalId })
      setSnackbar({ open: true, message: '审核拒绝成功', severity: 'success' })
      setRejectDialogOpen(false)
      setSelectedWithdrawalId(null)
      // 刷新列表
      loadWithdrawalAuditList()
    } catch (err) {
      console.error('审核拒绝失败:', err)
      setSnackbar({ open: true, message: getErrorMessage(err), severity: 'error' })
    } finally {
      setProcessingAction(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '完成':
        return 'success'
      case '失败':
        return 'error'
      case '在途':
        return 'info'
      default:
        return 'default'
    }
  }

  // 获取状态样式（包含背景颜色和文字颜色）
  const getStatusStyle = (status: string) => {
    switch (status) {
      case '完成':
      case '处理完成':
      case '已审核':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.12)',
          color: '#2e7d32',
          fontWeight: 600
        }
      case '失败':
      case '处理失败':
        return {
          backgroundColor: 'rgba(244, 67, 54, 0.12)',
          color: '#c62828',
          fontWeight: 600
        }
      case '在途':
      case '待处理':
      case '处理中':
        return {
          backgroundColor: 'rgba(33, 150, 243, 0.12)',
          color: '#1565c0',
          fontWeight: 600
        }
      case '待审核':
        return {
          backgroundColor: 'rgba(255, 152, 0, 0.12)',
          color: '#e65100',
          fontWeight: 600
        }
      case '客户取消':
        return {
          backgroundColor: 'rgba(158, 158, 158, 0.12)',
          color: '#616161',
          fontWeight: 600
        }
      default:
        return {
          backgroundColor: 'rgba(158, 158, 158, 0.12)',
          color: '#616161',
          fontWeight: 500
        }
    }
  }

  // 根据 status 原始值获取状态样式（用于出金审核列表）
  const getStatusStyleByStatus = (status: string) => {
    switch (String(status)) {
      case '0':  // 待审核 - 橙色（需要关注）
        return {
          backgroundColor: 'rgba(255, 152, 0, 0.12)',
          color: '#e65100',
          fontWeight: 600
        }
      case '2':  // 已审核 - 绿色（成功）
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.12)',
          color: '#2e7d32',
          fontWeight: 600
        }
      case '3':  // 提交 - 蓝色（进行中）
        return {
          backgroundColor: 'rgba(33, 150, 243, 0.12)',
          color: '#1565c0',
          fontWeight: 600
        }
      default:
        return {
          backgroundColor: 'rgba(158, 158, 158, 0.12)',
          color: '#616161',
          fontWeight: 500
        }
    }
  }

  const openTxDetail = (tx: any) => {
    setSelectedTx(tx)
    setDetailDrawerOpen(true)
  }

  // KPI data from API
  const kpiData = overviewData
    ? {
        totalValue: `$${overviewData.totalAssetValuation.amount.toLocaleString()}`,
        netInflow24h: `${overviewData.netInflow24h.amount >= 0 ? '+' : ''}$${overviewData.netInflow24h.amount.toLocaleString()}`,
        todayDeposit: `$${overviewData.todayDeposit.amount.toLocaleString()}`,
        todayWithdrawal: `$${overviewData.todayWithdrawal.amount.toLocaleString()}`,
        totalValueChange: overviewData.totalAssetValuation.changePercent,
        netInflowChange: overviewData.netInflow24h.changePercent,
        depositCount: overviewData.todayDeposit.transactionCount,
        withdrawalCount: overviewData.todayWithdrawal.transactionCount
      }
    : {
        totalValue: '$0',
        netInflow24h: '+$0',
        todayDeposit: '$0',
        todayWithdrawal: '$0',
        totalValueChange: 0,
        netInflowChange: 0,
        depositCount: 0,
        withdrawalCount: 0
      }

  // Currency-Chain Summary from API
  const currencyChainSummary =
    overviewData?.coinChainSummary?.map(item => ({
      currency: item.coinKey,
      chain: item.chain,
      balance: item.balance.toLocaleString(),
      value: `$${item.valuation.toLocaleString()}`,
      change24h: `${item.change24h >= 0 ? '+' : ''}${item.change24h.toFixed(1)}%`
    })) || []

  // 格式化金额：显示完整数值格式
  const formatValue = (value: number): string => {
    return `$${value.toLocaleString()}`
  }

  // 格式化交易金额：显示完整数值，不四舍五入
  const formatAmount = (amount: number): string => {
    // 直接转换为字符串，JavaScript 会自动处理精度
    // 如果数字太小可能显示为科学计数法，则使用 toFixed 避免
    const str = String(amount)
    // 如果包含科学计数法（如 1e-6），使用 toFixed 转换
    if (str.includes('e') || str.includes('E')) {
      // 对于科学计数法，使用足够的小数位数来避免精度丢失
      return amount.toFixed(20).replace(/\.?0+$/, '')
    }
    // 否则直接返回字符串（已经是完整数值）
    return str
  }

  // Chart data from API
  const assetDistributionData =
    overviewData?.assetDistribution?.items?.map(item => ({
      name: item.label,
      value: item.amount,
      percentage: item.percent,
      color: item.color || '#8B8B8B'
    })) || []

  const assetTrendData =
    overviewData?.aumTrend?.series?.map(item => ({
      date: item.date,
      value: item.value
    })) || []

  const cashFlowData =
    overviewData?.fundFlow?.inflow?.map((inflowItem, index) => ({
      date: inflowItem.date,
      deposit: inflowItem.value,
      withdrawal: overviewData.fundFlow?.outflow?.[index]?.value || 0
    })) || []

  const mainWalletData = {
    balance: '¥3,200,000',
    lastCollection: '2024-01-15 10:30',
    top3Sources: [
      { name: '客户A', amount: '¥500,000' },
      { name: '客户B', amount: '¥350,000' },
      { name: '客户C', amount: '¥280,000' }
    ],
    recentCollections: [
      { time: '2024-01-15 10:30', from: '客户A地址', amount: '0.5 BTC', type: '归集' },
      { time: '2024-01-15 09:15', from: '客户B地址', amount: '10 ETH', type: '归集' },
      { time: '2024-01-14 16:45', from: '内部钱包', amount: '50,000 USDT', type: '内部' }
    ]
  }

  const customerHoldings = [
    {
      currency: 'BTC',
      chain: 'Bitcoin',
      quantity: '5.2847',
      value: '¥2,198,450',
      addresses: 3,
      lastTx: '2024-01-15 14:23'
    },
    {
      currency: 'ETH',
      chain: 'Ethereum',
      quantity: '125.892',
      value: '¥1,996,225',
      addresses: 5,
      lastTx: '2024-01-15 10:45'
    },
    {
      currency: 'USDT',
      chain: 'Ethereum',
      quantity: '500,000',
      value: '¥3,500,000',
      addresses: 2,
      lastTx: '2024-01-14 16:12'
    }
  ]

  const customerAddresses = [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      label: '交易钱包',
      isMainWallet: false,
      isWhitelist: true,
      currencyChain: 'ETH-Ethereum',
      balance: '125.892 ETH',
      lastTx: '2024-01-15 10:45'
    },
    {
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      label: '主钱包',
      isMainWallet: true,
      isWhitelist: true,
      currencyChain: 'BTC-Bitcoin',
      balance: '5.2847 BTC',
      lastTx: '2024-01-15 14:23'
    }
  ]

  // 格式化交易流水数据
  const formattedTransactions =
    transactionFlowData?.list?.map(tx => {
      // 发起方映射：operatorType 1=客户发起，2=后台发起
      const getSourceLabel = (operatorType: number): string => {
        switch (operatorType) {
          case 1:
            return '客户发起'
          case 2:
            return '后台发起'
          default:
            return '未知'
        }
      }

      // 判断是否影响权益（归集和内部转账不影响权益）
      const affectsEquity = tx.direction !== 'collection' && tx.direction !== 'internal'

      return {
        time: tx.time,
        sourceCustomer: tx.sourceCustomer, // 发起方客户信息
        targetCustomer: tx.targetCustomer, // 接受方客户信息
        currencyChain: `${tx.coinKey}-${tx.chain}`,
        amount: `${formatAmount(tx.amount)} ${tx.coinKey}`,
        direction: tx.directionLabel,
        from: tx.fromAddress,
        to: tx.toAddress,
        fromWhitelist: !!tx.fromLabel, // 有标签说明在白名单
        toMainWallet: tx.toLabel?.includes('主') || false, // 标签包含"主"说明是主钱包
        fee: `${tx.fee}`,
        confirmations: tx.confirmations,
        status: tx.statusLabel,
        txHash: tx.txHash,
        source: getSourceLabel(tx.operatorType),
        affectsEquity
      }
    }) || []

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case '入金':
        return 'success'
      case '出金':
        return 'error'
      case '内部':
        return 'default'
      case '归集':
        return 'info'
      default:
        return 'default'
    }
  }

  // 交易统计数据（从API获取）
  const txStats = transactionFlowData?.stats
    ? {
        total: transactionFlowData.stats.totalCount,
        totalAmount: `$${transactionFlowData.stats.totalAmount.toLocaleString()}`,
        deposits: transactionFlowData.stats.inflowCount,
        withdrawals: transactionFlowData.stats.outflowCount,
        failed: transactionFlowData.stats.failedCount
      }
    : {
        total: 0,
        totalAmount: '¥0',
        deposits: 0,
        withdrawals: 0,
        failed: 0
      }

  // 格式化时间戳为可读的日期时间格式
  const formatTimestamp = (timestamp: string | number | null | undefined): string => {
    if (!timestamp) return "-"
    
    // 如果是字符串，尝试转换为数字
    let ts: number
    if (typeof timestamp === 'string') {
      // 如果已经是日期时间字符串格式，直接返回
      if (timestamp.includes('-') || timestamp.includes('/')) {
        return timestamp
      }
      ts = parseInt(timestamp, 10)
    } else {
      ts = timestamp
    }
    
    // 检查是否为有效的时间戳
    if (isNaN(ts) || ts <= 0) {
      return "-"
    }
    
    // 如果是秒级时间戳（小于13位），转换为毫秒级
    if (ts < 10000000000) {
      ts = ts * 1000
    }
    
    try {
      const date = new Date(ts)
      if (isNaN(date.getTime())) {
        return "-"
      }
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } catch (error) {
      console.error('格式化时间戳失败:', error)
      return "-"
    }
  }

  // 格式化客户资产数据
  const formattedCustomers =
    customerAssetsData?.list.map(customer => ({
      id: customer.userId.toString(),
      name: customer.customerName,
      userId: customer.userId,
      email: customer.email, // 添加email字段
      totalValue: `$${customer.totalValuation.toLocaleString()}`,
      assetTypes: customer.assetTypes,
      lastTx: formatTimestamp(customer.recentTransaction),
      change24h: `${customer.change24h >= 0 ? '+' : ''}${customer.change24h.toFixed(1)}%`,
      change24hValue: customer.change24h // 用于判断正负
    })) || []

  const handleCustomerClick = (customerId: string) => {
    setExpandedCustomerId(expandedCustomerId === customerId ? null : customerId)
  }

  // 手动入金客户搜索函数（带防抖）
  const handleDepositCustomerSearch = async (email: string) => {
    if (!email || email.trim().length === 0) {
      setDepositCustomerSearchOptions([])
      return
    }

    try {
      setDepositCustomerSearchLoading(true)
      const response = await memberSearch({ email: email.trim(), limit: 50 })
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data
      const memberList =
        actualData && typeof actualData === 'object' && 'list' in actualData
          ? (actualData as MemberSearchResponse).list
          : []
      setDepositCustomerSearchOptions(memberList)
    } catch (error) {
      console.error('客户搜索失败:', error)
      setDepositCustomerSearchOptions([])
    } finally {
      setDepositCustomerSearchLoading(false)
    }
  }

  // 处理手动入金客户搜索输入变化（防抖）
  const handleDepositCustomerSearchInputChange = (value: string, reason: string) => {
    // 如果正在选择客户（onChange触发），不触发搜索
    if (isSelectingDepositCustomerRef.current) {
      isSelectingDepositCustomerRef.current = false
      setDepositCustomerSearchInput(value)
      // 清除定时器，确保不会触发搜索
      if (depositCustomerSearchDebounceTimerRef.current) {
        clearTimeout(depositCustomerSearchDebounceTimerRef.current)
        depositCustomerSearchDebounceTimerRef.current = null
      }
      return
    }

    // 如果是重置、清除或失去焦点操作，不触发搜索
    if (reason === 'reset' || reason === 'clear' || reason === 'blur') {
      setDepositCustomerSearchInput(value)
      // 清除定时器
      if (depositCustomerSearchDebounceTimerRef.current) {
        clearTimeout(depositCustomerSearchDebounceTimerRef.current)
        depositCustomerSearchDebounceTimerRef.current = null
      }
      return
    }

    // 如果已经有选中的客户，且输入值匹配选中项的显示文本，不触发搜索
    if (depositForm.customerId) {
      const selectedOption = depositCustomerSearchOptions.find(opt => opt.id === depositForm.customerId)
      // 检查输入值是否匹配已选中客户的显示格式
      if (selectedOption) {
        const displayText = `${selectedOption.name} (${selectedOption.email})`
        if (value === displayText || value === selectedOption.name || value === selectedOption.email) {
          setDepositCustomerSearchInput(value)
          // 清除定时器，不触发搜索
          if (depositCustomerSearchDebounceTimerRef.current) {
            clearTimeout(depositCustomerSearchDebounceTimerRef.current)
            depositCustomerSearchDebounceTimerRef.current = null
          }
          return
        }
      }
      // 如果没有找到匹配的选项，但表单中有客户信息，也检查表单中的信息
      if (depositForm.customerName && depositForm.customerEmail) {
        const displayText = `${depositForm.customerName} (${depositForm.customerEmail})`
        if (value === displayText || value === depositForm.customerName || value === depositForm.customerEmail) {
          setDepositCustomerSearchInput(value)
          // 清除定时器，不触发搜索
          if (depositCustomerSearchDebounceTimerRef.current) {
            clearTimeout(depositCustomerSearchDebounceTimerRef.current)
            depositCustomerSearchDebounceTimerRef.current = null
          }
          return
        }
      }
    }

    setDepositCustomerSearchInput(value)

    // 清除之前的定时器
    if (depositCustomerSearchDebounceTimerRef.current) {
      clearTimeout(depositCustomerSearchDebounceTimerRef.current)
    }

    // 如果输入为空，清空选项列表
    if (!value || value.trim().length === 0) {
      setDepositCustomerSearchOptions([])
      depositCustomerSearchDebounceTimerRef.current = null
      return
    }

    // 设置新的定时器
    depositCustomerSearchDebounceTimerRef.current = setTimeout(() => {
      handleDepositCustomerSearch(value)
    }, 300) // 300ms 防抖
  }

  // 加载用户的币种列表（手动入金）
  const loadDepositUserCoins = async (userId: number) => {
    try {
      setDepositCurrencyLoading(true)
      const response = await getUserCoins({ userId })
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data
      const coins =
        actualData && typeof actualData === 'object' && 'list' in actualData
          ? (actualData as UserCoinsResponse).list
          : []
      setDepositCurrencyOptions(coins)

      // 如果当前币种不在列表中，且列表不为空，则设置为第一个币种
      if (coins.length > 0) {
        const currentCoinExists = coins.some(
          (coin: { coinKey: string; coinName?: string }) => coin.coinKey === depositForm.currency
        )
        if (!currentCoinExists) {
          setDepositForm({ ...depositForm, currency: coins[0].coinKey })
        }
      }
    } catch (error) {
      console.error('加载用户币种列表失败:', error)
      setDepositCurrencyOptions([])
    } finally {
      setDepositCurrencyLoading(false)
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
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data
      const memberList =
        actualData && typeof actualData === 'object' && 'list' in actualData
          ? (actualData as MemberSearchResponse).list
          : []
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
      // 检查输入值是否匹配已选中客户的显示格式
      if (selectedOption) {
        const displayText = `${selectedOption.name} (${selectedOption.email})`
        if (value === displayText || value === selectedOption.name || value === selectedOption.email) {
          setWithdrawalCustomerSearchInput(value)
          // 清除定时器，不触发搜索
          if (withdrawalCustomerSearchDebounceTimerRef.current) {
            clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
            withdrawalCustomerSearchDebounceTimerRef.current = null
          }
          return
        }
      }
      // 如果没有找到匹配的选项，但表单中有客户信息，也检查表单中的信息
      if (withdrawalForm.customerName && withdrawalForm.customerEmail) {
        const displayText = `${withdrawalForm.customerName} (${withdrawalForm.customerEmail})`
        if (value === displayText || value === withdrawalForm.customerName || value === withdrawalForm.customerEmail) {
          setWithdrawalCustomerSearchInput(value)
          // 清除定时器，不触发搜索
          if (withdrawalCustomerSearchDebounceTimerRef.current) {
            clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
            withdrawalCustomerSearchDebounceTimerRef.current = null
          }
          return
        }
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

  // 加载用户的币种列表（手动出金）
  const loadWithdrawalUserCoins = async (userId: number) => {
    try {
      setWithdrawalCurrencyLoading(true)
      const response = await getUserCoins({ userId })
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data
      const coins =
        actualData && typeof actualData === 'object' && 'list' in actualData
          ? (actualData as UserCoinsResponse).list
          : []
      setWithdrawalCurrencyOptions(coins)

      // 如果当前币种不在列表中，且列表不为空，则设置为第一个币种
      if (coins.length > 0) {
        const currentCoinExists = coins.some(
          (coin: { coinKey: string; coinName?: string }) => coin.coinKey === withdrawalForm.currency
        )
        if (!currentCoinExists) {
          setWithdrawalForm({ ...withdrawalForm, currency: coins[0].coinKey })
        }
      }
    } catch (error) {
      console.error('加载用户币种列表失败:', error)
      setWithdrawalCurrencyOptions([])
    } finally {
      setWithdrawalCurrencyLoading(false)
    }
  }

  // 处理手动入金凭证上传
  const handleDepositVoucherUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: '图片大小不能超过10MB', severity: 'error' })
      return
    }

    setUploadingDepositVoucher(true)
    console.log('📤 开始上传手动入金凭证:', file.name, '大小:', (file.size / 1024).toFixed(2), 'KB')

    try {
      const response = await uploadSingleFile(file)
      console.log('✅ 凭证上传成功:', response)

      // 从 ServerResponse 中提取数据
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data

      if (actualData && typeof actualData === 'object' && 'path' in actualData) {
        // 使用相对路径（path）作为凭证URL
        const uploadedUrl = (actualData as any).path
        setDepositForm({
          ...depositForm,
          attachment: file,
          voucherUrl: uploadedUrl
        })
        setSnackbar({ open: true, message: '凭证上传成功', severity: 'success' })
        console.log('✅ 手动入金凭证URL已设置:', uploadedUrl)
      }
    } catch (error: any) {
      console.error('❌ 凭证上传失败:', error)
      setSnackbar({ open: true, message: '凭证上传失败，请重试', severity: 'error' })
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
    if (!file) {
      return
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: '图片大小不能超过10MB', severity: 'error' })
      return
    }

    setUploadingWithdrawalVoucher(true)
    console.log('📤 开始上传手动出金凭证:', file.name, '大小:', (file.size / 1024).toFixed(2), 'KB')

    try {
      const response = await uploadSingleFile(file)
      console.log('✅ 凭证上传成功:', response)

      // 从 ServerResponse 中提取数据
      const actualData =
        response.data && typeof response.data === 'object' && 'data' in response.data
          ? response.data.data
          : response.data

      if (actualData && typeof actualData === 'object' && 'path' in actualData) {
        // 使用相对路径（path）作为凭证URL
        const uploadedUrl = (actualData as any).path
        setWithdrawalForm({
          ...withdrawalForm,
          attachment: file,
          voucherUrl: uploadedUrl
        })
        setSnackbar({ open: true, message: '凭证上传成功', severity: 'success' })
        console.log('✅ 手动出金凭证URL已设置:', uploadedUrl)
      }
    } catch (error: any) {
      console.error('❌ 凭证上传失败:', error)
      setSnackbar({ open: true, message: '凭证上传失败，请重试', severity: 'error' })
    } finally {
      setUploadingWithdrawalVoucher(false)
      // 清空input，允许重新选择同一文件
      if (event.target) {
        event.target.value = ''
      }
    }
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

  // Handle manual transaction functions
  const handleDepositSubmit = async () => {
    try {
      // 验证必填字段
      console.log('📋 手动入金表单数据:', {
        customerId: depositForm.customerId,
        currency: depositForm.currency,
        amount: depositForm.amount,
        notes: depositForm.notes,
        customerName: depositForm.customerName,
        customerEmail: depositForm.customerEmail
      })

      if (!depositForm.customerId || !depositForm.currency || !depositForm.amount || !depositForm.notes) {
        const missingFields = []
        if (!depositForm.customerId) missingFields.push('客户')
        if (!depositForm.currency) missingFields.push('币种')
        if (!depositForm.amount) missingFields.push('入金数量')
        if (!depositForm.notes) missingFields.push('备注说明')
        setSnackbar({ open: true, message: `请填写所有必填字段：${missingFields.join('、')}`, severity: 'error' })
        return
      }

      // 调用手动入金接口，使用已上传的voucherUrl
      const requestData = {
        userId: depositForm.customerId,
        coinKey: depositForm.currency,
        amount: depositForm.amount,
        referenceNo: depositForm.referenceNumber || undefined,
        remark: depositForm.notes,
        voucherUrl: depositForm.voucherUrl || undefined
      }

      console.log('📤 提交手动入金请求:', requestData)

      const response = await manualDeposit(requestData)

      // 检查响应是否成功
      if (response && response.data) {
        const responseData = response.data
        // 检查是否有错误码
        if (responseData.code && responseData.code !== 200 && responseData.code !== 0) {
          setSnackbar({ open: true, message: responseData.message || '手动入金失败', severity: 'error' })
          return
        }
      }

      setSnackbar({ open: true, message: '手动入金成功', severity: 'success' })

      // 重置表单
      setDepositForm({
        customer: '',
        customerId: null,
        customerName: '',
        customerEmail: '',
        currency: 'BTC',
        amount: '',
        referenceNumber: '',
        notes: '',
        attachment: null,
        voucherUrl: ''
      })
      setDepositCustomerSearchInput('')
      setDepositCustomerSearchOptions([])
      setDepositCurrencyOptions([])

      // 关闭抽屉
      setManualDepositOpen(false)

      // 刷新数据
      if (activeTab === 'transactions') {
        loadTransactionFlow()
      }
    } catch (err) {
      console.error('手动入金失败:', err)
      setSnackbar({ open: true, message: getErrorMessage(err), severity: 'error' })
    }
  }

  const handleWithdrawalSubmit = async () => {
    try {
      // 验证必填字段
      console.log('📋 手动出金表单数据:', {
        customerId: withdrawalForm.customerId,
        currency: withdrawalForm.currency,
        amount: withdrawalForm.amount,
        notes: withdrawalForm.notes,
        customerName: withdrawalForm.customerName,
        customerEmail: withdrawalForm.customerEmail
      })

      if (!withdrawalForm.customerId || !withdrawalForm.currency || !withdrawalForm.amount || !withdrawalForm.notes) {
        const missingFields = []
        if (!withdrawalForm.customerId) missingFields.push('客户')
        if (!withdrawalForm.currency) missingFields.push('币种')
        if (!withdrawalForm.amount) missingFields.push('出金数量')
        if (!withdrawalForm.notes) missingFields.push('备注说明')
        setSnackbar({ open: true, message: `请填写所有必填字段：${missingFields.join('、')}`, severity: 'error' })
        return
      }

      // 调用手动出金接口，使用已上传的voucherUrl
      const response = await manualWithdraw({
        userId: withdrawalForm.customerId,
        coinKey: withdrawalForm.currency,
        amount: withdrawalForm.amount,
        referenceNo: withdrawalForm.referenceNumber || undefined,
        remark: withdrawalForm.notes,
        voucherUrl: withdrawalForm.voucherUrl || undefined
      })

      // 检查响应是否成功
      if (response && response.data) {
        const responseData = response.data
        // 检查是否有错误码
        if (responseData.code && responseData.code !== 200 && responseData.code !== 0) {
          setSnackbar({ open: true, message: responseData.message || '手动出金失败', severity: 'error' })
          return
        }
      }

      setSnackbar({ open: true, message: '手动出金成功', severity: 'success' })

      // 重置表单
      setWithdrawalForm({
        customer: '',
        customerId: null,
        customerName: '',
        customerEmail: '',
        currency: 'BTC',
        amount: '',
        referenceNumber: '',
        notes: '',
        attachment: null,
        voucherUrl: ''
      })
      setWithdrawalCustomerSearchInput('')
      setWithdrawalCustomerSearchOptions([])
      setWithdrawalCurrencyOptions([])

      // 关闭抽屉
      setManualWithdrawalOpen(false)

      // 刷新数据
      if (activeTab === 'transactions') {
        loadTransactionFlow()
      }
    } catch (err) {
      console.error('手动出金失败:', err)
      setSnackbar({ open: true, message: getErrorMessage(err), severity: 'error' })
    }
  }

  const router = useRouter()

  // 如果显示客户详情，则渲染客户详情组件
  if (showCustomerDetail) {
    return (
      <CustomerDigitalAssetDetail
        customerId={showCustomerDetail}
        customerName={customerName}
        onBack={() => setShowCustomerDetail(null)}
      />
    )
  }

  return (
    <Box>
      {/* Page Header */}
      <Card sx={{ borderRadius: 0, boxShadow: 'none' }}>
        <CardHeader
          title={
            <div>
              <Typography variant='h4' className='font-medium mb-1'>
                数字资产管理
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                与 Safeheron 对接的资产管理系统
              </Typography>
            </div>
          }
          action={
            <div className='flex items-center gap-4'>
              {/* Display Mode Toggle */}
              {/* <ToggleButtonGroup
                value={displayMode}
                exclusive
                onChange={(_: React.MouseEvent<HTMLElement>, v: string) => v && setDisplayMode(v as DisplayMode)}
                size='small'
              >
                <ToggleButton value='equity'>权益</ToggleButton>
                <ToggleButton value='physical'>物理</ToggleButton>
              </ToggleButtonGroup>

              <Divider orientation='vertical' flexItem />

              <div className='flex items-center gap-2 text-textSecondary'>
                <i className='ri-calendar-line' />
                <Typography variant='caption' color='text.secondary'>
                  最后同步: {lastSyncTime}
                </Typography>
              </div> */}
              <Button
                startIcon={<i className='ri-refresh-line' />}
                variant='outlined'
                className='font-medium'
                onClick={loadOverviewData}
                disabled={loading}
              >
                刷新
              </Button>
              <Button
                startIcon={<i className='ri-download-line' />}
                variant='outlined'
                onClick={handleExportCSV}
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
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '0.02em',
              color: 'var(--mui-palette-text-secondary)',
              transition: 'none'
            },
            '& .Mui-selected': {
              color: 'var(--mui-palette-primary-main) !important',
              fontWeight: 600
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              boxShadow: 'none',
              transition: 'none'
            }
          }}
        >
          <Tab label='总览' icon={<i className='ri-dashboard-3-line' />} iconPosition='start' />
          <Tab label='按客户' icon={<i className='ri-team-line' />} iconPosition='start' />
          <Tab label='流水' icon={<i className='ri-exchange-line' />} iconPosition='start' />
          <Tab label='出金审核' icon={<i className='ri-file-check-line' />} iconPosition='start' />
        </Tabs>
      </Card>

      {/* Tab 0: Overview */}
      {activeTab === 'overview' && (
        <div className='flex flex-col gap-6'>
          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className='flex justify-center items-center py-12'>
                <CircularProgress />
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert
              severity='error'
              action={
                <Button color='inherit' size='small' onClick={loadOverviewData}>
                  重试
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Content - Only show when data is loaded */}
          {!loading && !error && overviewData && (
            <>
              {/* Quick Actions */}
              <Card>
                <CardContent className='p-5'>
                  <div className='flex flex-wrap gap-3'>
                    <Button
                      variant='contained'
                      startIcon={<i className='ri-add-line' />}
                      onClick={() => setManualDepositOpen(true)}
                      color='success'
                    >
                      手动入金
                    </Button>
                    <Button
                      variant='contained'
                      startIcon={<i className='ri-subtract-line' />}
                      onClick={() => setManualWithdrawalOpen(true)}
                      color='error'
                    >
                      手动出金
                    </Button>
                    <Button variant='outlined' startIcon={<i className='ri-upload-line' />} color='primary'>
                      导入对账单
                    </Button>
                    <Button
                      variant='outlined'
                      startIcon={<i className='ri-search-line' />}
                      onClick={() => setActiveTab('transactions')}
                      color='info'
                    >
                      流水查询
                    </Button>
                    {/* <Button 
                  variant='outlined' 
                  startIcon={<i className='ri-refresh-line' />}
                  color='secondary'
                >
                  同步钱包
                </Button>
                <Button 
                  variant='outlined' 
                  startIcon={<i className='ri-settings-3-line' />}
                  color='secondary'
                >
                  钱包设置
                </Button> */}
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics - 4 Column Layout */}
              <Grid container spacing={6}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card className='bs-full' sx={{ position: 'relative', overflow: 'visible' }}>
                    <CardContent className='p-6'>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography variant='body2' color='text.secondary' className='mb-2'>
                            总资产估值
                          </Typography>
                          <Typography variant='h4' className='font-bold'>
                            {kpiData.totalValue}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'primary.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main'
                          }}
                        >
                          <i className='ri-wallet-3-line text-[28px]' />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${kpiData.totalValueChange >= 0 ? '+' : ''}${kpiData.totalValueChange.toFixed(1)}%`}
                          size='small'
                          color={kpiData.totalValueChange >= 0 ? 'success' : 'error'}
                          variant='tonal'
                          icon={<i className={`ri-arrow-${kpiData.totalValueChange >= 0 ? 'up' : 'down'}-line`} />}
                        />
                        <Typography variant='caption' color='text.secondary'>
                          较昨日
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card className='bs-full' sx={{ position: 'relative', overflow: 'visible' }}>
                    <CardContent className='p-6'>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography variant='body2' color='text.secondary' className='mb-2'>
                            24h 净流入
                          </Typography>
                          <Typography variant='h4' className='font-bold'>
                            {kpiData.netInflow24h}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'success.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'success.main'
                          }}
                        >
                          <i className='ri-arrow-right-up-line text-[28px]' />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${kpiData.netInflowChange >= 0 ? '+' : ''}${kpiData.netInflowChange.toFixed(1)}%`}
                          size='small'
                          color={kpiData.netInflowChange >= 0 ? 'success' : 'error'}
                          variant='tonal'
                          icon={<i className={`ri-arrow-${kpiData.netInflowChange >= 0 ? 'up' : 'down'}-line`} />}
                        />
                        <Typography variant='caption' color='text.secondary'>
                          较昨日
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card className='bs-full' sx={{ position: 'relative', overflow: 'visible' }}>
                    <CardContent className='p-6'>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography variant='body2' color='text.secondary' className='mb-2'>
                            今日入金
                          </Typography>
                          <Typography variant='h4' className='font-bold'>
                            {kpiData.todayDeposit}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'success.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'success.main'
                          }}
                        >
                          <i className='ri-add-circle-line text-[28px]' />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='caption' color='text.secondary'>
                          {kpiData.depositCount} 笔交易
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card className='bs-full' sx={{ position: 'relative', overflow: 'visible' }}>
                    <CardContent className='p-6'>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography variant='body2' color='text.secondary' className='mb-2'>
                            今日出金
                          </Typography>
                          <Typography variant='h4' className='font-bold'>
                            {kpiData.todayWithdrawal}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'error.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'error.main'
                          }}
                        >
                          <i className='ri-indeterminate-circle-line text-[28px]' />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='caption' color='text.secondary'>
                          {kpiData.withdrawalCount} 笔交易
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card className='bs-full' sx={{ position: 'relative', overflow: 'visible' }}>
                <CardContent className='p-6'>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                      <Typography variant='body2' color='text.secondary' className='mb-2'>
                        主钱包余额
                      </Typography>
                      <Typography variant='h4' className='font-bold'>
                        {kpiData.mainWalletBalance}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'info.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'info.main'
                      }}
                    >
                      <i className='ri-safe-2-line text-[28px]' />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      上次归集: 10:30
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid> */}

                {/* <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card className='bs-full' sx={{ position: 'relative', overflow: 'visible' }}>
                <CardContent className='p-6'>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                      <Typography variant='body2' color='text.secondary' className='mb-2'>
                        待归集余额
                      </Typography>
                      <Typography variant='h4' className='font-bold'>
                        {kpiData.pendingCollection}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'warning.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'warning.main'
                      }}
                    >
                      <i className='ri-time-line text-[28px]' />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label='需归集'
                      size='small'
                      color='warning'
                      variant='tonal'
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid> */}
              </Grid>

              {/* Charts - Three Column Layout */}
              <Grid container spacing={6}>
                {/* Asset Distribution Pie Chart */}
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Card className='bs-full'>
                    <CardHeader
                      title='资产分布'
                      subheader='按币种'
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
                            label={({ name, percentage, value }) => `${name}\n${percentage.toFixed(1)}%`}
                          >
                            {assetDistributionData.map(entry => (
                              <Cell key={`cell-${entry.name}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: number) => formatValue(value)}
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
                        {assetDistributionData.map(item => (
                          <div key={item.name} className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                              <Typography variant='body2'>{item.name}</Typography>
                            </div>
                            <Typography variant='body2' className='font-mono font-medium'>
                              {formatValue(item.value)}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Asset Trend Area Chart */}
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Card className='bs-full'>
                    <CardHeader
                      title='资产估值曲线'
                      subheader='近7天'
                    />
                    <CardContent>
                      <ResponsiveContainer width='100%' height={400}>
                        <AreaChart data={assetTrendData}>
                          <defs>
                            <linearGradient id='colorAsset' x1='0' y1='0' x2='0' y2='1'>
                              <stop offset='5%' stopColor='var(--mui-palette-primary-main)' stopOpacity={0.3} />
                              <stop offset='95%' stopColor='var(--mui-palette-primary-main)' stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='var(--mui-palette-divider)' />
                          <XAxis
                            dataKey='date'
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 12 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 12 }}
                            tickFormatter={value => {
                              if (value === 0) return '0'
                              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                              return value.toFixed(0)
                            }}
                          />
                          <RechartsTooltip
                            formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, '估值']}
                            contentStyle={{
                              borderRadius: 8,
                              border: 'none',
                              backgroundColor: 'var(--mui-palette-background-paper)',
                              boxShadow: 'var(--mui-customShadows-lg)'
                            }}
                            cursor={{
                              stroke: 'var(--mui-palette-primary-main)',
                              strokeWidth: 1,
                              strokeDasharray: '5 5'
                            }}
                          />
                          <Area
                            type='monotone'
                            dataKey='value'
                            stroke='var(--mui-palette-primary-main)'
                            strokeWidth={2.5}
                            fill='url(#colorAsset)'
                            dot={{ r: 3, fill: 'var(--mui-palette-primary-main)' }}
                            activeDot={{ r: 5 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Cash Flow Bar Chart */}
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Card className='bs-full'>
                    <CardHeader
                      title='资金流动趋势'
                      subheader='入金 vs 出金'
                    />
                    <CardContent>
                      <ResponsiveContainer width='100%' height={400}>
                        <BarChart data={cashFlowData}>
                          <defs>
                            <linearGradient id='colorDeposit' x1='0' y1='0' x2='0' y2='1'>
                              <stop offset='5%' stopColor='var(--mui-palette-success-main)' stopOpacity={0.8} />
                              <stop offset='95%' stopColor='var(--mui-palette-success-main)' stopOpacity={0.4} />
                            </linearGradient>
                            <linearGradient id='colorWithdrawal' x1='0' y1='0' x2='0' y2='1'>
                              <stop offset='5%' stopColor='var(--mui-palette-error-main)' stopOpacity={0.8} />
                              <stop offset='95%' stopColor='var(--mui-palette-error-main)' stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='var(--mui-palette-divider)' />
                          <XAxis
                            dataKey='date'
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 12 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 12 }}
                            tickFormatter={value => {
                              if (value === 0) return '0'
                              if (value < 1000) return `${value.toFixed(0)}`
                              return `${(value / 1000).toFixed(0)}K`
                            }}
                          />
                          <RechartsTooltip
                            formatter={(value: number, name: string) => [
                              `$${(value / 1000).toFixed(1)}K`,
                              name === 'deposit' ? '入金' : '出金'
                            ]}
                            contentStyle={{
                              borderRadius: 8,
                              border: 'none',
                              backgroundColor: 'var(--mui-palette-background-paper)',
                              boxShadow: 'var(--mui-customShadows-lg)'
                            }}
                            cursor={{ fill: 'var(--mui-palette-action-hover)' }}
                          />
                          <Legend
                            formatter={value => (value === 'deposit' ? '入金' : '出金')}
                            wrapperStyle={{ paddingTop: '10px' }}
                          />
                          <Bar dataKey='deposit' fill='url(#colorDeposit)' radius={[8, 8, 0, 0]} maxBarSize={50} />
                          <Bar
                            dataKey='withdrawal'
                            fill='url(#colorWithdrawal)'
                            radius={[8, 8, 0, 0]}
                            maxBarSize={50}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Currency-Chain Summary Table */}
              <Card>
                <CardHeader
                  title='币种-链汇总表'
                />
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>币种</th>
                        <th>链</th>
                        <th className='text-right'>余额</th>
                        <th className='text-right'>估值</th>
                        {/* <th className='text-right'>地址数</th> */}
                        {/* <th className='text-right'>24h 变化</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {currencyChainSummary.map((row, idx) => (
                        <tr key={idx} className='hover:bg-actionHover'>
                          <td className='font-semibold'>{row.currency}</td>
                          <td>{row.chain}</td>
                          <td className='text-right font-mono'>{row.balance}</td>
                          <td className='text-right font-mono font-semibold'>{row.value}</td>
                          {/* <td className='text-right'>{row.addresses}</td> */}
                          {/* <td className='text-right'>
                            <div className='flex items-center justify-end gap-1'>
                              {row.change24h.startsWith('+') ? (
                                <i className='ri-trending-up-line text-success' />
                              ) : (
                                <i className='ri-trending-down-line text-error' />
                              )}
                              <Typography
                                variant='body2'
                                className={`font-semibold ${
                                  row.change24h.startsWith('+') ? 'text-success' : 'text-error'
                                }`}
                              >
                                {row.change24h}
                              </Typography>
                            </div>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Main Wallet Card */}
              {/* <Card>
            <CardHeader
              title={
                <div className='flex items-center gap-2'>
                  <i className='ri-bank-line text-2xl text-primary' />
                  <Typography variant='h5' className='font-medium'>主钱包</Typography>
                </div>
              }
              action={
                <OptionsMenu
                  iconButtonProps={{ color: 'default' }}
                  options={[
                    { text: '查看详情', icon: 'ri-eye-line' },
                    { text: '归集记录', icon: 'ri-history-line' },
                    { text: '导出数据', icon: 'ri-download-line' }
                  ]}
                />
              }
            />
            <CardContent>
              <Grid container spacing={6} className='mb-6'>
                <Grid size={{ xs: 12, lg: 3 }}>
                  <Typography variant='body2' color='text.secondary' className='mb-1'>
                    余额
                  </Typography>
                  <Typography variant='h5' className='font-semibold font-mono'>
                    {mainWalletData.balance}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, lg: 3 }}>
                  <Typography variant='body2' color='text.secondary' className='mb-1'>
                    最近归集时间
                  </Typography>
                  <Typography variant='body1'>{mainWalletData.lastCollection}</Typography>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Typography variant='body2' color='text.secondary' className='mb-2'>
                    近7日来源 Top 3
                  </Typography>
                  <div className='flex gap-2 flex-wrap'>
                    {mainWalletData.top3Sources.map((source, idx) => (
                      <Chip key={idx} label={`${source.name}: ${source.amount}`} size='small' />
                    ))}
                  </div>
                </Grid>
              </Grid>
              
              <Divider className='my-6' />
              
              <Typography variant='body2' color='text.secondary' className='mb-4'>
                归集明细（仅显示内部/归集）
              </Typography>
              
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>来源</th>
                      <th className='text-right'>金额</th>
                      <th>类型</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainWalletData.recentCollections.map((row, idx) => (
                      <tr key={idx}>
                        <td className='text-sm text-textSecondary'>{row.time}</td>
                        <td className='text-sm'>{row.from}</td>
                        <td className='text-right font-mono font-semibold'>
                          {row.amount}
                        </td>
                        <td>
                          <Chip label={row.type} size='small' color={row.type === '归集' ? 'info' : 'default'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card> */}
            </>
          )}
        </div>
      )}

      {/* Tab 1: By Customer */}
      {activeTab === 'by-customer' && (
        <div className='flex flex-col gap-6'>
          {/* Search and Filter */}
          <Card>
            <CardContent className='p-5'>
              <div className='flex gap-4 items-center'>
                <TextField
                  placeholder='搜索客户（ID、邮箱、姓名）'
                  value={customerSearchInput}
                  onChange={e => setCustomerSearchInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleCustomerSearch()
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-search-line' />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 300, maxWidth: 500 }}
                />
                <Button
                  variant='contained'
                  startIcon={<i className='ri-search-line' />}
                  onClick={handleCustomerSearch}
                  disabled={customerLoading}
                >
                  搜索
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-close-circle-line' />}
                  onClick={handleCustomerSearchReset}
                  disabled={customerLoading}
                >
                  重置
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-refresh-line' />}
                  onClick={loadCustomerAssets}
                  disabled={customerLoading}
                >
                  刷新
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {customerLoading && (
            <Card>
              <CardContent className='flex justify-center items-center py-12'>
                <CircularProgress />
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {customerError && !customerLoading && (
            <Alert
              severity='error'
              action={
                <Button color='inherit' size='small' onClick={loadCustomerAssets}>
                  重试
                </Button>
              }
            >
              {customerError}
            </Alert>
          )}

          {/* Customer Table */}
          {!customerLoading && !customerError && (
            <Card>
              <CardHeader
                title='客户资产汇总'
                subheader='查看客户详细资产信息和交易流水'
              />
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      {/* <th>
                        <Checkbox
                          size='small'
                          checked={selectedCustomers.length === formattedCustomers.length && formattedCustomers.length > 0}
                          indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < formattedCustomers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCustomers(formattedCustomers.map(c => c.id))
                            } else {
                              setSelectedCustomers([])
                            }
                          }}
                        />
                      </th> */}
                      <th className='text-left'>客户名称</th>
                      <th className='text-right'>总资产估值</th>
                      <th className='text-right'>资产种类</th>
                      <th className='text-left'>最近交易</th>
                      {/* <th className='text-right'>24h 变化</th> */}
                      <th className='text-center'>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedCustomers.length > 0 ? (
                      formattedCustomers.map(customer => (
                        <tr key={customer.id}>
                          {/* <td>
                            <Checkbox
                              size='small'
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCustomers([...selectedCustomers, customer.id])
                                } else {
                                  setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id))
                                }
                              }}
                            />
                          </td> */}
                          <td>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <CustomAvatar color='primary' skin='light' size={40}>
                                {customer.name[0]}
                              </CustomAvatar>
                              <Box>
                                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                  {customer.name}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {customer.userId}
                                </Typography>
                                {customer.email && (
                                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                                    {customer.email}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </td>
                          <td className='text-right'>
                            <Typography
                              variant='body2'
                              sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9375rem' }}
                            >
                              {customer.totalValue}
                            </Typography>
                          </td>
                          <td className='text-right'>
                            <Typography variant='body2'>{customer.assetTypes} 种</Typography>
                          </td>
                          <td>
                            <Typography variant='body2' color='text.secondary'>
                              {customer.lastTx}
                            </Typography>
                          </td>
                          {/* <td className='text-right'>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              {customer.change24hValue >= 0 ? (
                                <i className='ri-trending-up-line text-success' />
                              ) : (
                                <i className='ri-trending-down-line text-error' />
                              )}
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 600,
                                  color: customer.change24hValue >= 0 ? 'success.main' : 'error.main'
                                }}
                              >
                                {customer.change24h}
                              </Typography>
                            </Box>
                          </td> */}
                          <td className='text-center'>
                            <Tooltip title='查看详情'>
                              <IconButton
                                onClick={() => {
                                  setShowCustomerDetail(customer.id)
                                  setCustomerName(customer.name)
                                }}
                                size='small'
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    bgcolor: `${theme.palette.primary.main}10`,
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <i className='ri-eye-line' />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className='text-center py-12'>
                          <Typography variant='body1' color='text.secondary'>
                            暂无客户资产数据
                          </Typography>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component='div'
                className='border-bs'
                count={customerAssetsData?.total || 0}
                rowsPerPage={customerRowsPerPage}
                page={customerPage}
                onPageChange={(_, newPage) => setCustomerPage(newPage)}
                onRowsPerPageChange={e => {
                  setCustomerRowsPerPage(parseInt(e.target.value, 10))
                  setCustomerPage(0)
                }}
              />
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Transactions */}
      {activeTab === 'transactions' && (
        <div className='flex flex-col gap-6'>
          {/* Filters */}
          <Card>
            <CardHeader title='筛选条件' />
            <CardContent>
              <Grid container spacing={5}>
                {/* First Row */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>时间范围</InputLabel>
                    <Select
                      value={txFilters.timeRange}
                      onChange={e => setTxFilters({ ...txFilters, timeRange: e.target.value })}
                      label='时间范围'
                    >
                      <MenuItem value='all'>全部时间</MenuItem>
                      <MenuItem value='today'>今天</MenuItem>
                      <MenuItem value='week'>最近7天</MenuItem>
                      <MenuItem value='month'>最近30天</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Autocomplete
                    options={txCustomerSearchOptions}
                    loading={txCustomerSearchLoading}
                    inputValue={
                      txFilters.customer
                        ? txCustomerSearchOptions.find(opt => opt.id === txFilters.customer?.id)
                          ? `${txFilters.customer.name} (${txFilters.customer.email})`
                          : txFilters.customer.email
                            ? `${txFilters.customer.name} (${txFilters.customer.email})`
                            : txCustomerSearchInput
                        : txCustomerSearchInput
                    }
                    onInputChange={(_, newInputValue, reason) => {
                      // 如果是选择操作（reason === 'reset'），不触发搜索
                      if (reason === 'reset') {
                        return
                      }
                      handleTxCustomerSearchInputChange(newInputValue, reason)
                    }}
                    value={txFilters.customer}
                    onChange={(_, newValue) => {
                      // 清除搜索定时器，防止触发搜索
                      if (txCustomerSearchDebounceTimerRef.current) {
                        clearTimeout(txCustomerSearchDebounceTimerRef.current)
                        txCustomerSearchDebounceTimerRef.current = null
                      }

                      // 标记正在选择客户，防止触发搜索
                      isSelectingTxCustomerRef.current = true

                      setTxFilters({ ...txFilters, customer: newValue })

                      // 更新搜索输入为显示文本
                      if (newValue) {
                        setTxCustomerSearchInput(`${newValue.name} (${newValue.email})`)
                      } else {
                        setTxCustomerSearchInput('')
                      }

                      // 延迟清除标记
                      setTimeout(() => {
                        isSelectingTxCustomerRef.current = false
                      }, 100)
                    }}
                    getOptionLabel={option => (option ? `${option.name} (${option.email})` : '')}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label='选择客户'
                        placeholder='输入邮箱搜索客户'
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {txCustomerSearchLoading ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component='li' {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem'
                            }}
                          >
                            {option.name[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant='body2' fontWeight={500}>
                              {option.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {option.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    noOptionsText={txCustomerSearchInput ? '未找到匹配的客户' : '请输入邮箱搜索客户'}
                    filterOptions={x => x} // 禁用客户端过滤，使用服务器端搜索
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>币种</InputLabel>
                    <Select
                      value={txFilters.currency}
                      onChange={e => setTxFilters({ ...txFilters, currency: e.target.value })}
                      label='币种'
                      disabled={loadingCoinChainOptions}
                    >
                      <MenuItem value='all'>全部</MenuItem>
                      {coinOptions.map(coin => (
                        <MenuItem key={coin.id} value={coin.coinKey}>
                          {coin.coinKey}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>链</InputLabel>
                    <Select
                      value={txFilters.chain}
                      onChange={e => setTxFilters({ ...txFilters, chain: e.target.value })}
                      label='链'
                      disabled={loadingCoinChainOptions}
                    >
                      <MenuItem value='all'>全部</MenuItem>
                      {chainOptions.map((chain, index) => (
                        <MenuItem key={`${chain.blockChain}-${chain.network}-${index}`} value={chain.blockChain}>
                          {chain.blockChain}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>方向</InputLabel>
                    <Select
                      value={txFilters.direction}
                      onChange={e => setTxFilters({ ...txFilters, direction: e.target.value })}
                      label='方向'
                    >
                      <MenuItem value='all'>全部</MenuItem>
                      <MenuItem value='入金'>入金</MenuItem>
                      <MenuItem value='出金'>出金</MenuItem>
                      {/* <MenuItem value='内部'>内部</MenuItem>
                      <MenuItem value='归集'>归集</MenuItem> */}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Second Row */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>状态</InputLabel>
                    <Select
                      value={txFilters.status}
                      onChange={e => setTxFilters({ ...txFilters, status: e.target.value })}
                      label='状态'
                    >
                      <MenuItem value='all'>全部</MenuItem>
                      <MenuItem value='完成'>完成</MenuItem>
                      <MenuItem value='在途'>在途</MenuItem>
                      <MenuItem value='失败'>失败</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    label='最小金额'
                    type='number'
                    value={txFilters.minAmount}
                    onChange={e => setTxFilters({ ...txFilters, minAmount: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    label='最大金额'
                    type='number'
                    value={txFilters.maxAmount}
                    onChange={e => setTxFilters({ ...txFilters, maxAmount: e.target.value })}
                  />
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    label='地址标签'
                    value={txFilters.addressLabel}
                    onChange={(e) => setTxFilters({ ...txFilters, addressLabel: e.target.value })}
                  />
                </Grid> */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>发起来源</InputLabel>
                    <Select
                      value={txFilters.source}
                      onChange={e => setTxFilters({ ...txFilters, source: e.target.value })}
                      label='发起来源'
                    >
                      <MenuItem value='all'>全部</MenuItem>
                      <MenuItem value='1'>客户发起</MenuItem>
                      <MenuItem value='2'>后台发起</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    label='关键词搜索'
                    placeholder='TxHash / 地址'
                    value={txFilters.keyword}
                    onChange={e => setTxFilters({ ...txFilters, keyword: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-line' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Button
                    variant='contained'
                    fullWidth
                    startIcon={<i className='ri-search-line' />}
                    onClick={handleTxQuery}
                    disabled={txLoading}
                    sx={{ fontWeight: 600, height: '56px' }}
                  >
                    查询
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Button
                    variant='outlined'
                    fullWidth
                    startIcon={<i className='ri-close-circle-line' />}
                    onClick={handleTxFiltersReset}
                    disabled={txLoading}
                    sx={{ height: '56px' }}
                  >
                    重置
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Loading State */}
          {txLoading && (
            <Card>
              <CardContent className='flex justify-center items-center py-12'>
                <CircularProgress />
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {txError && !txLoading && (
            <Alert
              severity='error'
              action={
                <Button color='inherit' size='small' onClick={loadTransactionFlow}>
                  重试
                </Button>
              }
            >
              {txError}
            </Alert>
          )}

          {/* Statistics Bar */}
          {!txLoading && !txError && (
            <>
              <Card>
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                      <Typography variant='body2' color='text.secondary' className='mb-1'>
                        总笔数
                      </Typography>
                      <Typography variant='h6' className='font-semibold'>
                        {txStats.total}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                      <Typography variant='body2' color='text.secondary' className='mb-1'>
                        总金额
                      </Typography>
                      <Typography variant='h6' className='font-semibold font-mono'>
                        {txStats.totalAmount}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                      <Typography variant='body2' color='text.secondary' className='mb-1'>
                        入金笔数
                      </Typography>
                      <Typography variant='h6' className='font-semibold text-success'>
                        {txStats.deposits}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                      <Typography variant='body2' color='text.secondary' className='mb-1'>
                        出金笔数
                      </Typography>
                      <Typography variant='h6' className='font-semibold text-error'>
                        {txStats.withdrawals}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                      <Typography variant='body2' color='text.secondary' className='mb-1'>
                        失败笔数
                      </Typography>
                      <Typography variant='h6' className='font-semibold text-error'>
                        {txStats.failed}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Transactions Table */}
              <Card>
                <CardHeader
                  title='交易流水列表'
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
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th className='text-left'>时间</th>
                        <th className='text-left'>发起方</th>
                        <th className='text-left'>接受方</th>
                        <th className='text-left'>币种-链</th>
                        <th className='text-right'>金额</th>
                        <th className='text-left'>方向</th>
                        <th className='text-left'>From → To</th>
                        <th className='text-right'>手续费</th>
                        {/* <th className='text-right'>确认数</th> */}
                        <th className='text-left'>状态</th>
                        <th className='text-left'>TxHash</th>
                        <th className='text-left'>发起</th>
                        {/* <th className='text-left'>影响权益</th> */}
                        <th className='text-center'>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formattedTransactions.length > 0 ? (
                        formattedTransactions.map((row, idx) => (
                          <tr key={idx}>
                            <td>
                              <Typography variant='body2' color='text.secondary'>
                                {row.time}
                              </Typography>
                            </td>
                            <td>
                              {row.sourceCustomer ? (
                                <Box>
                                  <Typography variant='body2' fontWeight={500}>
                                    {row.sourceCustomer.nickName || '未知用户'}
                                  </Typography>
                                  {row.sourceCustomer.userId !== 0 && (
                                    <>
                                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                        ID: {row.sourceCustomer.userId}
                                      </Typography>
                                      {row.sourceCustomer.email && (
                                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                          {row.sourceCustomer.email}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant='body2' color='text.secondary'>
                                  -
                                </Typography>
                              )}
                            </td>
                            <td>
                              {row.targetCustomer ? (
                                <Box>
                                  <Typography variant='body2' fontWeight={500}>
                                    {row.targetCustomer.nickName || '未知用户'}
                                  </Typography>
                                  {row.targetCustomer.userId !== 0 && (
                                    <>
                                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                        ID: {row.targetCustomer.userId}
                                      </Typography>
                                      {row.targetCustomer.email && (
                                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                          {row.targetCustomer.email}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant='body2' color='text.secondary'>
                                  -
                                </Typography>
                              )}
                            </td>
                            <td>
                              <Typography variant='body2'>{row.currencyChain}</Typography>
                            </td>
                            <td className='text-right'>
                              <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                {row.amount}
                              </Typography>
                            </td>
                            <td>
                              <Chip
                                label={row.direction}
                                size='small'
                                color={getDirectionColor(row.direction)}
                                sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 500 }}
                              />
                            </td>
                            <td>
                              <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                {row.from}
                                {row.fromWhitelist && <Chip label='白' size='small' sx={{ ml: 0.5 }} />}
                                {' → '}
                                {row.to}
                                {row.toMainWallet && <Chip label='主' size='small' color='primary' sx={{ ml: 0.5 }} />}
                              </Typography>
                            </td>
                            <td className='text-right'>
                              <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                                {row.fee} USD
                              </Typography>
                            </td>
                            {/* <td className='text-right'>
                              <Typography variant='body2'>{row.confirmations}</Typography>
                            </td> */}
                            <td>
                              <Chip
                                label={row.status}
                                size='small'
                                sx={{
                                  ...getStatusStyle(row.status),
                                  borderRadius: 1.5,
                                  fontSize: '0.75rem',
                                  height: '24px',
                                  '& .MuiChip-label': {
                                    px: 1.5,
                                    py: 0.5
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                  {row.txHash || '-'}
                                </Typography>
                                {row.txHash && (
                                  <Tooltip title='在浏览器中查看'>
                                    <IconButton
                                      size='small'
                                      onClick={e => {
                                        e.stopPropagation()
                                        handleExternalLink(`https://tronscan.org/#/transaction/${row.txHash}`)
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
                                      <i className='ri-external-link-line' />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </td>
                            <td>
                              <Typography variant='body2'>{row.source}</Typography>
                            </td>
                            {/* <td>
                              <Chip
                                label={row.affectsEquity ? '是' : '否'}
                                size='small'
                                color={row.affectsEquity ? 'success' : 'default'}
                                sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 500 }}
                              />
                            </td> */}
                            <td className='text-center'>
                              <Tooltip title='查看详情'>
                                <IconButton
                                  size='small'
                                  onClick={() => openTxDetail(row)}
                                  sx={{
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                      bgcolor: `${theme.palette.primary.main}10`,
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <i className='ri-eye-line' />
                                </IconButton>
                              </Tooltip>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={14} className='text-center py-12'>
                            <Typography variant='body1' color='text.secondary'>
                              暂无符合条件的交易记录
                            </Typography>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component='div'
                  className='border-bs'
                  count={transactionFlowData?.total || 0}
                  rowsPerPage={txRowsPerPage}
                  page={txPage}
                  onPageChange={(_, newPage) => setTxPage(newPage)}
                  onRowsPerPageChange={e => {
                    setTxRowsPerPage(parseInt(e.target.value, 10))
                    setTxPage(0)
                  }}
                />
              </Card>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Withdrawal Audit */}
      {activeTab === 'withdrawal-audit' && (
        <div className='flex flex-col gap-6'>
          {/* Filters */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>状态</InputLabel>
                    <Select 
                      value={withdrawalAuditFilters.status} 
                      onChange={(e) => setWithdrawalAuditFilters({ ...withdrawalAuditFilters, status: e.target.value })}
                      label='状态'
                    >
                      <MenuItem value='all'>全部</MenuItem>
                      <MenuItem value='0'>待审核</MenuItem>
                      <MenuItem value='2'>已审核</MenuItem>
                      <MenuItem value='3'>已提交</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>币种</InputLabel>
                    <Select
                      value={withdrawalAuditFilters.coinKey}
                      onChange={e => setWithdrawalAuditFilters({ ...withdrawalAuditFilters, coinKey: e.target.value })}
                      label='币种'
                      disabled={loadingCoinChainOptions}
                    >
                      <MenuItem value='all'>全部</MenuItem>
                      {coinOptions.map(coin => (
                        <MenuItem key={coin.id} value={coin.coinKey}>
                          {coin.coinKey}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>链</InputLabel>
                    <Select
                      value={withdrawalAuditFilters.chain}
                      onChange={e => setWithdrawalAuditFilters({ ...withdrawalAuditFilters, chain: e.target.value })}
                      label='链'
                      disabled={loadingCoinChainOptions}
                    >
                      <MenuItem value='all'>全部</MenuItem>
                      {chainOptions.map((chain, index) => (
                        <MenuItem key={`${chain.blockChain}-${chain.network}-${index}`} value={chain.blockChain}>
                          {chain.blockChain}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    size='medium'
                    placeholder='地址'
                    fullWidth
                    value={withdrawalAuditFilters.keyword}
                    onChange={(e) => setWithdrawalAuditFilters({ ...withdrawalAuditFilters, keyword: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-line' />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <AppReactDatepicker
                    selected={parseDateTimeString(withdrawalAuditFilters.startTime)}
                    onChange={(date: Date | null) => {
                      setWithdrawalAuditFilters({ 
                        ...withdrawalAuditFilters, 
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
                    selected={parseDateTimeString(withdrawalAuditFilters.endTime)}
                    onChange={(date: Date | null) => {
                      setWithdrawalAuditFilters({ 
                        ...withdrawalAuditFilters, 
                        endTime: formatDateToString(date, false) 
                      })
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="选择结束日期"
                    isClearable
                    minDate={parseDateTimeString(withdrawalAuditFilters.startTime) || undefined}
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
              <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
                <Button
                  variant='contained'
                  startIcon={<i className='ri-search-line' />}
                  onClick={handleWithdrawalAuditSearch}
                  disabled={withdrawalAuditLoading}
                >
                  查询
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-restart-line' />}
                  onClick={handleWithdrawalAuditReset}
                  disabled={withdrawalAuditLoading}
                >
                  重置
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-refresh-line' />}
                  onClick={loadWithdrawalAuditList}
                  disabled={withdrawalAuditLoading}
                >
                  刷新
                </Button>
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {withdrawalAuditLoading && (
            <Card>
              <CardContent className='flex justify-center items-center py-12'>
                <CircularProgress />
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {withdrawalAuditError && !withdrawalAuditLoading && (
            <Alert
              severity='error'
              action={
                <Button color='inherit' size='small' onClick={loadWithdrawalAuditList}>
                  重试
                </Button>
              }
            >
              {withdrawalAuditError}
            </Alert>
          )}

          {/* List Table */}
          {!withdrawalAuditLoading && !withdrawalAuditError && (
            <Card>
              <CardHeader
                title='出金审核列表'
                subheader='查看出金交易记录'
              />
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      <th className='text-left'>时间</th>
                      <th className='text-left'>发起方</th>
                      <th className='text-left'>接受方</th>
                      <th className='text-left'>币种-链</th>
                      <th className='text-right'>金额</th>
                      <th className='text-left'>方向</th>
                      <th className='text-left'>From → To</th>
                      <th className='text-left'>状态</th>
                      <th className='text-center'>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalAuditData?.list && withdrawalAuditData.list.length > 0 ? (
                      withdrawalAuditData.list.map((item: CoinWithdrawalListItem, idx: number) => (
                        <tr key={idx}>
                          <td>
                            <Typography variant='body2' color='text.secondary'>
                              {formatTimestamp(item.time)}
                            </Typography>
                          </td>
                          <td>
                            {item.sourceCustomer ? (
                              <Box>
                                <Typography variant='body2' fontWeight={500}>
                                  {item.sourceCustomer.nickName || '未知用户'}
                                </Typography>
                                {item.sourceCustomer.userId !== 0 && (
                                  <>
                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                      ID: {item.sourceCustomer.userId}
                                    </Typography>
                                    {item.sourceCustomer.email && (
                                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                        {item.sourceCustomer.email}
                                      </Typography>
                                    )}
                                  </>
                                )}
                              </Box>
                            ) : (
                              <Typography variant='body2' color='text.secondary'>
                                -
                              </Typography>
                            )}
                          </td>
                          <td>
                            {item.targetCustomer ? (
                              <Box>
                                <Typography variant='body2' fontWeight={500}>
                                  {item.targetCustomer.nickName || '未知用户'}
                                </Typography>
                                {item.targetCustomer.userId !== 0 && (
                                  <>
                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                      ID: {item.targetCustomer.userId}
                                    </Typography>
                                    {item.targetCustomer.email && (
                                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                        {item.targetCustomer.email}
                                      </Typography>
                                    )}
                                  </>
                                )}
                              </Box>
                            ) : (
                              <Typography variant='body2' color='text.secondary'>
                                -
                              </Typography>
                            )}
                          </td>
                          <td>
                            <Typography variant='body2'>{`${item.coinKey}-${item.chain}`}</Typography>
                          </td>
                          <td className='text-right'>
                            <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                              {formatAmount(item.amount)} {item.coinKey}
                            </Typography>
                          </td>
                          <td>
                            <Chip
                              label={item.directionLabel}
                              size='small'
                              color={getDirectionColor(item.directionLabel)}
                              sx={{ borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 500 }}
                            />
                          </td>
                          <td>
                            <Box>
                              <Typography 
                                variant='body2' 
                                sx={{ 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.75rem',
                                  color: 'text.secondary',
                                  wordBreak: 'break-all'
                                }}
                              >
                                {item.fromAddress || '-'} → {item.toAddress || '-'}
                              </Typography>
                            </Box>
                          </td>
                          <td>
                            <Chip
                              label={item.statusLabel}
                              size='small'
                              sx={{
                                ...getStatusStyleByStatus(item.status),
                                borderRadius: 1.5,
                                fontSize: '0.75rem',
                                height: '24px',
                                '& .MuiChip-label': {
                                  px: 1.5,
                                  py: 0.5
                                }
                              }}
                            />
                          </td>
                          <td className='text-center'>
                            {/* 只有 status = 0 (待处理) 时显示审核和拒绝按钮 */}
                            {String(item.status) === '0' || item.status === 'pending' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                                <Button
                                  size='small'
                                  variant='contained'
                                  color='success'
                                  startIcon={<i className='ri-check-line' />}
                                  onClick={() => {
                                    setSelectedWithdrawalId(item.id)
                                    setApproveDialogOpen(true)
                                  }}
                                  disabled={processingAction}
                                  sx={{
                                    minWidth: '80px',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    py: 0.75,
                                    px: 2,
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    boxShadow: '0 2px 4px rgba(76, 175, 80, 0.2)',
                                    '&:hover': {
                                      boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                                      transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease',
                                    '&:disabled': {
                                      opacity: 0.6
                                    }
                                  }}
                                >
                                  审核
                                </Button>
                                <Button
                                  size='small'
                                  variant='contained'
                                  color='error'
                                  startIcon={<i className='ri-close-line' />}
                                  onClick={() => {
                                    setSelectedWithdrawalId(item.id)
                                    setRejectDialogOpen(true)
                                  }}
                                  disabled={processingAction}
                                  sx={{
                                    minWidth: '80px',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    py: 0.75,
                                    px: 2,
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    boxShadow: '0 2px 4px rgba(244, 67, 54, 0.2)',
                                    '&:hover': {
                                      boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
                                      transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease',
                                    '&:disabled': {
                                      opacity: 0.6
                                    }
                                  }}
                                >
                                  拒绝
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                                -
                              </Typography>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className='text-center py-12'>
                          <Typography variant='body1' color='text.secondary'>
                            暂无出金审核数据
                          </Typography>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component='div'
                className='border-bs'
                count={withdrawalAuditData?.total || 0}
                rowsPerPage={withdrawalAuditPageSize}
                page={withdrawalAuditPage}
                onPageChange={(_, newPage) => setWithdrawalAuditPage(newPage)}
                onRowsPerPageChange={e => {
                  setWithdrawalAuditPageSize(parseInt(e.target.value, 10))
                  setWithdrawalAuditPage(0)
                }}
              />
            </Card>
          )}
        </div>
      )}

      {/* Transaction Detail Drawer */}
      <Drawer
        anchor='right'
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        PaperProps={{ className: 'w-[500px]' }}
      >
        <div className='p-6'>
          <Typography variant='h5' className='font-medium mb-6'>
            交易详情
          </Typography>
          {selectedTx && (
            <div className='flex flex-col gap-4'>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  交易哈希
                </Typography>
                <div className='flex items-center gap-2 mt-1'>
                  <Typography variant='body2' className='font-mono break-all'>
                    {selectedTx.txHash || '-'}
                  </Typography>
                  {selectedTx.txHash && (
                    <IconButton size='small' onClick={() => handleCopyAddress(selectedTx.txHash)} color='primary'>
                      <i className='ri-file-copy-line' />
                    </IconButton>
                  )}
                </div>
              </div>
              <Divider />
              <div>
                <Typography variant='caption' color='text.secondary'>
                  时间
                </Typography>
                <Typography variant='body1' className='mt-1'>
                  {selectedTx.time}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  客户
                </Typography>
                <Typography variant='body1' className='mt-1 font-semibold'>
                  {selectedTx.customer}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  币种-链
                </Typography>
                <Typography variant='body1' className='mt-1'>
                  {selectedTx.currencyChain}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  金额
                </Typography>
                <Typography variant='h6' className='mt-1 font-mono font-semibold'>
                  {selectedTx.amount}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  方向
                </Typography>
                <div className='mt-1'>
                  <Chip label={selectedTx.direction} size='small' color={getDirectionColor(selectedTx.direction)} />
                </div>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  From
                </Typography>
                <Typography variant='body2' className='mt-1 font-mono break-all'>
                  {selectedTx.from}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  To
                </Typography>
                <Typography variant='body2' className='mt-1 font-mono break-all'>
                  {selectedTx.to}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  手续费
                </Typography>
                <Typography variant='body1' className='mt-1 font-mono'>
                  {selectedTx.fee}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  确认数
                </Typography>
                <Typography variant='body1' className='mt-1'>
                  {selectedTx.confirmations}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  状态
                </Typography>
                <div className='mt-1'>
                  <Chip
                    label={selectedTx.status}
                    size='small'
                    sx={{
                      ...getStatusStyle(selectedTx.status),
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      height: '24px',
                      '& .MuiChip-label': {
                        px: 1.5,
                        py: 0.5
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  发起来源
                </Typography>
                <Typography variant='body1' className='mt-1'>
                  {selectedTx.source}
                </Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  影响权益
                </Typography>
                <div className='mt-1'>
                  <Chip
                    label={selectedTx.affectsEquity ? '是' : '否'}
                    size='small'
                    color={selectedTx.affectsEquity ? 'success' : 'default'}
                  />
                </div>
              </div>
              {selectedTx.txHash && (
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-external-link-line' />}
                  onClick={() => handleExternalLink(`https://tronscan.org/#/transaction/${selectedTx.txHash}`)}
                  className='mt-4'
                >
                  在区块浏览器中查看
                </Button>
              )}
            </div>
          )}
        </div>
      </Drawer>

      {/* Manual Transaction Drawers Component */}
      <ManualTransactionDrawers
        manualDepositOpen={manualDepositOpen}
        manualWithdrawalOpen={manualWithdrawalOpen}
        setManualDepositOpen={setManualDepositOpen}
        setManualWithdrawalOpen={setManualWithdrawalOpen}
        depositForm={depositForm}
        withdrawalForm={withdrawalForm}
        setDepositForm={setDepositForm}
        setWithdrawalForm={setWithdrawalForm}
        onDepositSubmit={handleDepositSubmit}
        onWithdrawalSubmit={handleWithdrawalSubmit}
        uploadingDepositVoucher={uploadingDepositVoucher}
        uploadingWithdrawalVoucher={uploadingWithdrawalVoucher}
        onDepositVoucherUpload={handleDepositVoucherUpload}
        onWithdrawalVoucherUpload={handleWithdrawalVoucherUpload}
        // 客户搜索相关
        depositCustomerSearchOptions={depositCustomerSearchOptions}
        depositCustomerSearchLoading={depositCustomerSearchLoading}
        depositCustomerSearchInput={depositCustomerSearchInput}
        onDepositCustomerSearchInputChange={handleDepositCustomerSearchInputChange}
        onDepositCustomerChange={customer => {
          // 清除搜索定时器，防止触发搜索
          if (depositCustomerSearchDebounceTimerRef.current) {
            clearTimeout(depositCustomerSearchDebounceTimerRef.current)
            depositCustomerSearchDebounceTimerRef.current = null
          }

          // 标记正在选择客户，防止触发搜索
          isSelectingDepositCustomerRef.current = true

          if (customer) {
            setDepositForm({
              ...depositForm,
              customerId: customer.id,
              customerName: customer.name,
              customerEmail: customer.email
            })
            // 更新搜索输入为显示文本
            setDepositCustomerSearchInput(`${customer.name} (${customer.email})`)
            loadDepositUserCoins(customer.id)
          } else {
            setDepositForm({
              ...depositForm,
              customerId: null,
              customerName: '',
              customerEmail: ''
            })
            setDepositCustomerSearchInput('')
            setDepositCurrencyOptions([])
          }

          // 延迟清除标记，确保 onInputChange 能够检测到
          setTimeout(() => {
            isSelectingDepositCustomerRef.current = false
          }, 100)
        }}
        withdrawalCustomerSearchOptions={withdrawalCustomerSearchOptions}
        withdrawalCustomerSearchLoading={withdrawalCustomerSearchLoading}
        withdrawalCustomerSearchInput={withdrawalCustomerSearchInput}
        onWithdrawalCustomerSearchInputChange={handleWithdrawalCustomerSearchInputChange}
        onWithdrawalCustomerChange={customer => {
          // 清除搜索定时器，防止触发搜索
          if (withdrawalCustomerSearchDebounceTimerRef.current) {
            clearTimeout(withdrawalCustomerSearchDebounceTimerRef.current)
            withdrawalCustomerSearchDebounceTimerRef.current = null
          }

          // 标记正在选择客户，防止触发搜索
          isSelectingWithdrawalCustomerRef.current = true

          if (customer) {
            setWithdrawalForm({
              ...withdrawalForm,
              customerId: customer.id,
              customerName: customer.name,
              customerEmail: customer.email
            })
            // 更新搜索输入为显示文本
            setWithdrawalCustomerSearchInput(`${customer.name} (${customer.email})`)
            loadWithdrawalUserCoins(customer.id)
          } else {
            setWithdrawalForm({
              ...withdrawalForm,
              customerId: null,
              customerName: '',
              customerEmail: ''
            })
            setWithdrawalCustomerSearchInput('')
            setWithdrawalCurrencyOptions([])
          }

          // 延迟清除标记，确保 onInputChange 能够检测到
          setTimeout(() => {
            isSelectingWithdrawalCustomerRef.current = false
          }, 100)
        }}
        // 币种列表相关
        depositCurrencyOptions={depositCurrencyOptions}
        depositCurrencyLoading={depositCurrencyLoading}
        withdrawalCurrencyOptions={withdrawalCurrencyOptions}
        withdrawalCurrencyLoading={withdrawalCurrencyLoading}
      />

      {/* External Link Confirmation Dialog */}
      <Dialog open={!!externalLinkDialog} onClose={() => setExternalLinkDialog(null)}>
        <DialogTitle>打开外部链接</DialogTitle>
        <DialogContent>
          <DialogContentText>您即将访问外部区块浏览器。请确认您信任此链接。</DialogContentText>
          <Typography variant='body2' sx={{ mt: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {externalLinkDialog}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExternalLinkDialog(null)}>取消</Button>
          <Button onClick={handleConfirmExternalLink} variant='contained'>
            确认打开
          </Button>
        </DialogActions>
      </Dialog>

      {/* 出金审核通过确认对话框 */}
      <Dialog open={approveDialogOpen} onClose={() => !processingAction && setApproveDialogOpen(false)}>
        <DialogTitle>确认审核通过</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要通过此出金申请的审核吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)} disabled={processingAction}>
            取消
          </Button>
          <Button onClick={handleWithdrawalApprove} variant='contained' color='success' disabled={processingAction}>
            {processingAction ? <CircularProgress size={20} /> : '确认通过'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 出金审核拒绝确认对话框 */}
      <Dialog open={rejectDialogOpen} onClose={() => !processingAction && setRejectDialogOpen(false)}>
        <DialogTitle>确认审核拒绝</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要拒绝此出金申请吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={processingAction}>
            取消
          </Button>
          <Button onClick={handleWithdrawalReject} variant='contained' color='error' disabled={processingAction}>
            {processingAction ? <CircularProgress size={20} /> : '确认拒绝'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar 提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
