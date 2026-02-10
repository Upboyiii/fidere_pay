"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardHeader,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Grid2 as Grid,
  useTheme,
  CircularProgress,
  Alert,
  TablePagination,
  InputAdornment,
} from "@mui/material"
import Link from "next/link"

// Charts
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts"

// API Imports
import { 
  getCustomerTransactionFlow,
  getCustomerDetail,
  getAddressList,
  getDefaultCreateCoins,
  getDefaultCreateChains,
  type TransactionFlowResponse,
  type CustomerDetailResponse,
  type AddressListResponse,
  type DefaultCreateCoinItem,
  type DefaultCreateChainItem
} from "@server/digitalAssets"

// Materialize Components
import OptionsMenu from '@core/components/option-menu'

// Styles
import tableStyles from '@core/styles/table.module.css'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const theme = useTheme()
  const customerId = params.customerId as string

  // const [displayMode, setDisplayMode] = useState<"equity" | "physical">("equity")
  const [includeInternal, setIncludeInternal] = useState(false)
  const [externalLinkDialog, setExternalLinkDialog] = useState<string | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<any>(null)

  // Customer detail data states
  const [customerDetailData, setCustomerDetailData] = useState<CustomerDetailResponse | null>(null)
  const [customerDetailLoading, setCustomerDetailLoading] = useState(true)
  const [customerDetailError, setCustomerDetailError] = useState<string | null>(null)

  // Address list data states
  const [addressListData, setAddressListData] = useState<AddressListResponse | null>(null)
  const [addressListLoading, setAddressListLoading] = useState(false)
  const [addressListError, setAddressListError] = useState<string | null>(null)
  
  // 币种和链列表状态（用于地址列表和交易流水筛选）
  const [coinOptions, setCoinOptions] = useState<DefaultCreateCoinItem[]>([])
  const [chainOptions, setChainOptions] = useState<DefaultCreateChainItem[]>([])
  const [loadingCoinChainOptions, setLoadingCoinChainOptions] = useState(false)

  // Address list filters and pagination
  const [addressFilters, setAddressFilters] = useState({
    coinKey: "all",
    chain: "all",
    keyword: "",
  })
  
  // 实际用于查询的筛选条件（只有点击查询时才更新）
  const [activeAddressFilters, setActiveAddressFilters] = useState({
    coinKey: "all",
    chain: "all",
    keyword: "",
  })
  
  // Address list pagination
  const [addressPage, setAddressPage] = useState(0)
  const [addressRowsPerPage, setAddressRowsPerPage] = useState(10)

  // Transaction flow data states
  const [transactionFlowData, setTransactionFlowData] = useState<TransactionFlowResponse | null>(null)
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  
  // Transaction filters
  const [txFilters, setTxFilters] = useState({
    currency: "all",
    chain: "all",
    direction: "all",
    status: "all",
    startTime: "",
    endTime: "",
    minAmount: "",
    maxAmount: "",
    keyword: "",
  })
  
  // 实际用于查询的筛选条件（只有点击查询时才更新）
  const [activeTxFilters, setActiveTxFilters] = useState({
    currency: "all",
    chain: "all",
    direction: "all",
    status: "all",
    startTime: "",
    endTime: "",
    minAmount: "",
    maxAmount: "",
    keyword: "",
  })
  
  // Pagination
  const [txPage, setTxPage] = useState(0)
  const [txRowsPerPage, setTxRowsPerPage] = useState(10)

  // 防止重复调用的 ref
  const customerDetailLoadedRef = useRef<string | null>(null)
  const coinChainOptionsLoadedRef = useRef(false)

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

  // 格式化客户详情数据
  const customerData = customerDetailData ? {
    id: customerId,
    name: `客户 ${customerId}`, // 如果没有客户名称，使用ID
    totalValue: `$${customerDetailData.totalValuation.toLocaleString()}`,
    assetTypes: customerDetailData.assetTypes,
    addressCount: customerDetailData.addressCount,
    change24h: `${customerDetailData.change24h >= 0 ? '+' : ''}${customerDetailData.change24h.toFixed(2)}%`,
    change24hValue: customerDetailData.change24h,
  } : {
    id: customerId,
    name: `客户 ${customerId}`,
    totalValue: "$0",
    assetTypes: 0,
    addressCount: 0,
    change24h: "+0.00%",
    change24hValue: 0,
  }

  // 格式化持仓数据
  const customerHoldings = customerDetailData?.holdings?.map(holding => ({
    currency: holding.coinKey,
    chain: holding.chain,
    quantity: holding.equityQuantity.toLocaleString(),
    value: `$${holding.valuation.toLocaleString()}`,
    addresses: holding.addressCount,
    lastTx: holding.recentTransaction || "-",
    valuation: holding.valuation, // 保留原始数值用于计算
  })) || []

  // 格式化资产分布数据（用于图表）- 使用持仓表数据
  const assetDistributionData = useMemo(() => {
    if (!customerDetailData?.holdings || customerDetailData.holdings.length === 0) {
      return []
    }
    
    // 计算总估值
    const totalValuation = customerDetailData.holdings.reduce((sum, holding) => sum + (holding.valuation || 0), 0)
    
    // 定义颜色数组
    const colors = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
      '#8B8B8B',
      '#FF6B9D',
      '#4ECDC4',
      '#FFE66D',
      '#95E1D3',
    ]
    
    // 将持仓数据转换为饼图数据格式
    return customerDetailData.holdings.map((holding, index) => {
      const valuation = holding.valuation || 0
      const percentage = totalValuation > 0 ? (valuation / totalValuation) * 100 : 0
      
      return {
        name: `${holding.coinKey}-${holding.chain}`,
        value: valuation,
        percentage: percentage,
        color: colors[index % colors.length]
      }
    })
  }, [customerDetailData?.holdings, theme])

  // 格式化地址列表数据
  const customerAddresses = addressListData?.list?.map(addr => {
    // 判断是否为主钱包（根据 tagType 或 tag 内容）
    const isMainWallet = addr.tagType === 'main' || addr.tag?.includes('主') || addr.tag?.toLowerCase().includes('main')
    // 判断是否在白名单（根据 tagType）
    const isWhitelist = addr.tagType === 'whitelist' || addr.tagType === 'white'
    
    return {
      address: addr.address,
      label: addr.tag || '-',
      isMainWallet,
      isWhitelist,
      currencyChain: `${addr.coinKey}-${addr.chain}`,
      balance: `${addr.balance.toLocaleString()} ${addr.coinKey}`,
      deposit7d: `${addr.deposit7Days.toLocaleString()} ${addr.coinKey}`,
      withdrawal7d: `${addr.withdrawal7Days.toLocaleString()} ${addr.coinKey}`,
      lastTx: addr.recentTransaction || '-',
      riskAlert: addr.riskWarning || null,
    }
  }) || []

  const allTransactions = [
    {
      time: "2024-01-15 14:23:15",
      currencyChain: "BTC-Bitcoin",
      amount: "0.5 BTC",
      direction: "入金",
      from: "bc1q...xyz",
      to: "bc1q...wlh",
      fromWhitelist: false,
      toMainWallet: true,
      fee: "0.0001 BTC",
      confirmations: 6,
      status: "完成",
      txHash: "0x1234...5678",
      source: "客户发起",
      affectsEquity: true,
    },
    {
      time: "2024-01-15 10:45:32",
      currencyChain: "ETH-Ethereum",
      amount: "10.0 ETH",
      direction: "出金",
      from: "0x742d...bEb",
      to: "0xabcd...efgh",
      fromWhitelist: true,
      toMainWallet: false,
      fee: "0.002 ETH",
      confirmations: 12,
      status: "完成",
      txHash: "0xabcd...efgh",
      source: "后台发起",
      affectsEquity: true,
    },
    {
      time: "2024-01-15 09:15:20",
      currencyChain: "BTC-Bitcoin",
      amount: "0.3 BTC",
      direction: "归集",
      from: "bc1q...abc",
      to: "bc1q...main",
      fromWhitelist: true,
      toMainWallet: true,
      fee: "0.00005 BTC",
      confirmations: 6,
      status: "完成",
      txHash: "0x5678...9012",
      source: "系统自动",
      affectsEquity: false,
    },
    {
      time: "2024-01-14 16:12:08",
      currencyChain: "USDT-Ethereum",
      amount: "50,000 USDT",
      direction: "入金",
      from: "0x9876...5432",
      to: "0x742d...bEb",
      fromWhitelist: false,
      toMainWallet: false,
      fee: "5.2 USDT",
      confirmations: 20,
      status: "完成",
      txHash: "0x9876...5432",
      source: "客户发起",
      affectsEquity: true,
    },
  ]

  const handleExternalLink = (url: string) => {
    setExternalLinkDialog(url)
  }

  const handleConfirmExternalLink = () => {
    if (externalLinkDialog) {
      window.open(externalLinkDialog, "_blank")
      setExternalLinkDialog(null)
    }
  }

  const handleCopyAddress = async (address: string) => {
    // 检查 clipboard API 是否可用
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(address)

        return
      } catch (err) {
        console.error('复制失败:', err)
        // 如果失败，继续使用备用方法
      }
    }
    
    // 使用备用方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = address
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      textArea.remove()
      
      if (successful) {

      } else {
        throw new Error('execCommand failed')
      }
    } catch (err) {
      console.error('复制失败（备用方法）:', err)
      // 最后的备用方案：提示用户手动复制
      alert('复制失败，请手动复制地址：' + address)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "完成":
        return "success"
      case "失败":
        return "error"
      case "在途":
        return "info"
      default:
        return "default"
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "入金":
        return "success"
      case "出金":
        return "error"
      case "内部":
        return "default"
      case "归集":
        return "info"
      default:
        return "default"
    }
  }

  const openTxDetail = (tx: any) => {
    setSelectedTx(tx)
    setDetailDrawerOpen(true)
  }
  
  // 加载客户详情数据
  const loadCustomerDetail = async () => {
    // 防止重复调用
    if (customerDetailLoadedRef.current === customerId) {

      return
    }
    
    try {
      setCustomerDetailLoading(true)
      setCustomerDetailError(null)
      
      const userId = parseInt(customerId, 10)
      if (isNaN(userId) || userId <= 0) {
        setCustomerDetailError('无效的客户ID')
        setCustomerDetailLoading(false)
        return
      }
      
      // 标记为已加载
      customerDetailLoadedRef.current = customerId
      

      const response = await getCustomerDetail({ userId })

      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      
      setCustomerDetailData(actualData as CustomerDetailResponse)
    } catch (err) {
      console.error('Failed to load customer detail:', err)
      setCustomerDetailError('客户详情数据加载失败，请刷新重试')
      // 如果加载失败，重置标志以便重试
      customerDetailLoadedRef.current = null
    } finally {
      setCustomerDetailLoading(false)
    }
  }

  // 加载地址列表数据
  const loadAddressList = async () => {
    try {
      setAddressListLoading(true)
      setAddressListError(null)
      
      const userId = parseInt(customerId, 10)
      if (isNaN(userId) || userId <= 0) {
        setAddressListError('无效的客户ID')
        setAddressListLoading(false)
        return
      }
      
      // 构建请求参数
      const params: any = {
        userId: userId,
        pageNum: addressPage + 1,
        pageSize: addressRowsPerPage,
      }
      
      // 添加筛选参数
      if (activeAddressFilters.coinKey && activeAddressFilters.coinKey !== 'all') {
        params.coinKey = activeAddressFilters.coinKey
      }
      if (activeAddressFilters.chain && activeAddressFilters.chain !== 'all') {
        params.chain = activeAddressFilters.chain
      }
      if (activeAddressFilters.keyword && activeAddressFilters.keyword.trim() !== '') {
        params.keyword = activeAddressFilters.keyword.trim()
      }
      

      const response = await getAddressList(params)

      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      
      setAddressListData(actualData as AddressListResponse)
    } catch (err) {
      console.error('Failed to load address list:', err)
      setAddressListError('地址列表数据加载失败，请刷新重试')
    } finally {
      setAddressListLoading(false)
    }
  }
  
  // 加载币种和链列表
  const loadCoinChainOptions = async () => {
    // 防止重复调用
    if (coinChainOptionsLoadedRef.current) {
      return
    }
    
    try {
      setLoadingCoinChainOptions(true)
      coinChainOptionsLoadedRef.current = true
      
      // 并行请求币种和链列表
      const [coinsResponse, chainsResponse] = await Promise.all([
        getDefaultCreateCoins(),
        getDefaultCreateChains()
      ])
      
      // 从 ServerResponse 中提取数据
      const coinsData = coinsResponse.data && typeof coinsResponse.data === 'object' && 'data' in coinsResponse.data 
        ? coinsResponse.data.data 
        : coinsResponse.data
      const chainsData = chainsResponse.data && typeof chainsResponse.data === 'object' && 'data' in chainsResponse.data 
        ? chainsResponse.data.data 
        : chainsResponse.data
      
      const coinsList = (coinsData && typeof coinsData === 'object' && 'list' in coinsData) 
        ? (coinsData as { list: DefaultCreateCoinItem[] }).list 
        : []
      const chainsList = (chainsData && typeof chainsData === 'object' && 'list' in chainsData) 
        ? (chainsData as { list: DefaultCreateChainItem[] }).list 
        : []
      
      setCoinOptions(coinsList)
      setChainOptions(chainsList)
    } catch (err) {
      console.error('Failed to load coin and chain options:', err)
      // 失败时使用空数组，不影响页面显示
      setCoinOptions([])
      setChainOptions([])
      // 如果加载失败，重置标志以便重试
      coinChainOptionsLoadedRef.current = false
    } finally {
      setLoadingCoinChainOptions(false)
    }
  }
  
  // 加载客户交易流水数据
  const loadCustomerTransactionFlow = async () => {
    try {
      setTxLoading(true)
      setTxError(null)
      
      const userId = parseInt(customerId, 10)
      if (isNaN(userId) || userId <= 0) {
        setTxError('无效的客户ID')
        setTxLoading(false)
        return
      }
      
      // 映射页面筛选值到API参数
      const directionMap: Record<string, string> = {
        '入金': 'inflow',
        '出金': 'outflow',
        '归集': 'collection',
        '内部': 'internal'
      }
      
      const statusMap: Record<string, string> = {
        '完成': 'completed',
        '失败': 'failed',
        '待处理': 'pending'
      }
      
      // 只传有值的参数，空值不传
      const params: any = {
        userId: userId,
      }
      
      // 分页参数
      if (txPage !== undefined && txPage !== null) {
        params.pageNum = txPage + 1
      }
      if (txRowsPerPage !== undefined && txRowsPerPage !== null) {
        params.pageSize = txRowsPerPage
      }
      
      // 可选筛选参数 - 只传有值的
      if (activeTxFilters.currency && activeTxFilters.currency !== 'all') {
        params.coinKey = activeTxFilters.currency
      }
      if (activeTxFilters.chain && activeTxFilters.chain !== 'all') {
        params.chain = activeTxFilters.chain
      }
      if (activeTxFilters.direction && activeTxFilters.direction !== 'all') {
        params.direction = directionMap[activeTxFilters.direction]
      }
      if (activeTxFilters.status && activeTxFilters.status !== 'all') {
        params.status = statusMap[activeTxFilters.status]
      }
      if (activeTxFilters.startTime && activeTxFilters.startTime.trim() !== '') {
        params.startTime = activeTxFilters.startTime
      }
      if (activeTxFilters.endTime && activeTxFilters.endTime.trim() !== '') {
        params.endTime = activeTxFilters.endTime
      }
      if (activeTxFilters.minAmount && activeTxFilters.minAmount.trim() !== '') {
        params.minAmount = activeTxFilters.minAmount
      }
      if (activeTxFilters.maxAmount && activeTxFilters.maxAmount.trim() !== '') {
        params.maxAmount = activeTxFilters.maxAmount
      }
      if (activeTxFilters.keyword && activeTxFilters.keyword.trim() !== '') {
        params.keyword = activeTxFilters.keyword
      }
      
      // includeInternal 只在为 true 时传递
      // if (includeInternal === true) {
      //   params.includeInternal = true
      // }
      

      const response = await getCustomerTransactionFlow(params)

      // 从 ServerResponse 中提取数据
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      
      setTransactionFlowData(actualData as TransactionFlowResponse)
    } catch (err) {
      console.error('Failed to load customer transaction flow:', err)
      setTxError('交易流水数据加载失败，请刷新重试')
    } finally {
      setTxLoading(false)
    }
  }
  
  // Load customer detail and coin/chain options on mount
  useEffect(() => {
    // 当 customerId 变化时，重置 ref，允许重新加载
    if (customerDetailLoadedRef.current !== customerId) {
      customerDetailLoadedRef.current = null
    }
    
    loadCustomerDetail()
    // 加载币种和链列表（只加载一次）
    loadCoinChainOptions()
  }, [customerId])
  
  // Load address list when filters/page change
  useEffect(() => {
    loadAddressList()
  }, [
    customerId,
    addressPage,
    addressRowsPerPage,
    activeAddressFilters.coinKey,
    activeAddressFilters.chain,
    activeAddressFilters.keyword
  ])
  
  // Load transaction flow when filters/page change
  useEffect(() => {
    loadCustomerTransactionFlow()
  }, [
    customerId,
    txPage,
    txRowsPerPage,
    // includeInternal,
    activeTxFilters.currency,
    activeTxFilters.chain,
    activeTxFilters.direction,
    activeTxFilters.status,
    activeTxFilters.startTime,
    activeTxFilters.endTime,
    activeTxFilters.minAmount,
    activeTxFilters.maxAmount,
    activeTxFilters.keyword
  ])
  
  // 处理地址列表查询按钮点击
  const handleAddressQuery = () => {
    setActiveAddressFilters({ ...addressFilters })
    setAddressPage(0) // 重置到第一页
  }
  
  // 处理地址列表筛选重置
  const handleAddressFiltersReset = () => {
    const resetFilters = {
      coinKey: "all",
      chain: "all",
      keyword: "",
    }
    setAddressFilters(resetFilters)
    setActiveAddressFilters(resetFilters)
    setAddressPage(0)
  }
  
  // 处理查询按钮点击
  const handleTxQuery = () => {
    setActiveTxFilters({ ...txFilters })
    setTxPage(0) // 重置到第一页
  }
  
  // 处理筛选重置
  const handleTxFiltersReset = () => {
    const resetFilters = {
      currency: "all",
      chain: "all",
      direction: "all",
      status: "all",
      startTime: "",
      endTime: "",
      minAmount: "",
      maxAmount: "",
      keyword: "",
    }
    setTxFilters(resetFilters)
    setActiveTxFilters(resetFilters)
    setTxPage(0)
  }
  
  // 格式化交易流水数据
  const formattedTransactions = transactionFlowData?.list?.map(tx => {
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
      currencyChain: `${tx.coinKey}-${tx.chain}`,
      amount: `${formatAmount(tx.amount)} ${tx.coinKey}`,
      direction: tx.directionLabel,
      from: tx.fromAddress,
      to: tx.toAddress,
      fromWhitelist: !!tx.fromLabel,  // 有标签说明在白名单
      toMainWallet: tx.toLabel?.includes('主') || false,  // 标签包含"主"说明是主钱包
      fee: `${tx.fee} ${tx.coinKey}`,
      confirmations: tx.confirmations,
      status: tx.statusLabel,
      txHash: tx.txHash,
      source: getSourceLabel(tx.operatorType),
      affectsEquity,
    }
  }) || []

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <Card>
        <CardHeader
          title={
            <div className='flex items-center gap-4'>
              <IconButton 
                onClick={() => router.push('/operation/digitalAssets')}
                color='default'
              >
                <i className='ri-arrow-left-line' />
              </IconButton>
              <div>
                <Typography variant='h5' className='font-medium mb-1'>
                  {customerData.name} - 资产详情
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  客户ID: {customerData.id}
                </Typography>
              </div>
            </div>
          }
          action={
            <div className='flex gap-4 items-center'>
              {/* <ToggleButtonGroup
                value={displayMode}
                exclusive
                onChange={(_: React.MouseEvent<HTMLElement>, v: string) => v && setDisplayMode(v as "equity" | "physical")}
                size='small'
              >
                <ToggleButton value='equity'>权益</ToggleButton>
                <ToggleButton value='physical'>物理</ToggleButton>
              </ToggleButtonGroup>
              <Divider orientation='vertical' flexItem /> */}
              <Button 
                startIcon={<i className='ri-refresh-line' />} 
                size='small' 
                variant='outlined'
                onClick={() => {
                  // 重置 ref，允许重新加载
                  customerDetailLoadedRef.current = null
                  loadCustomerDetail()
                  loadAddressList()
                  loadCustomerTransactionFlow()
                }}
                disabled={customerDetailLoading || addressListLoading || txLoading}
              >
                刷新
              </Button>
              <Button startIcon={<i className='ri-file-download-line' />} size='small' variant='outlined'>
                导出 CSV
              </Button>
            </div>
          }
        />
      </Card>

      {/* Customer Summary */}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card className='bs-full'>
            <CardContent>
              <Typography variant='body2' color='text.secondary' className='mb-1'>
                总资产估值
              </Typography>
              <Typography variant='h5' className='font-semibold font-mono'>
                {customerData.totalValue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card className='bs-full'>
            <CardContent>
              <Typography variant='body2' color='text.secondary' className='mb-1'>
                资产种类
              </Typography>
              <Typography variant='h5' className='font-semibold'>
                {customerData.assetTypes} 种
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card className='bs-full'>
            <CardContent>
              <Typography variant='body2' color='text.secondary' className='mb-1'>
                24h 变化
              </Typography>
              <Typography
                variant='h5'
                className={`font-semibold ${
                  customerData.change24hValue >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                {customerData.change24h}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Asset Distribution & Holdings */}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card className='bs-full'>
            <CardHeader
              title='资产分布'
              // subheader={displayMode === 'equity' ? '权益视图' : '托管位置（主钱包/客户地址）'}
            />
            <CardContent>
              {customerDetailLoading ? (
                <div className='h-[300px] flex items-center justify-center'>
                  <CircularProgress />
                </div>
              ) : customerDetailError ? (
                <div className='h-[300px] flex items-center justify-center'>
                  <Alert severity='error'>{customerDetailError}</Alert>
                </div>
              ) : assetDistributionData.length > 0 ? (
                <>
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
                        formatter={(value: number, name: string, props: any) => [
                          `$${(value / 1000000).toFixed(2)}M`,
                          props.payload.name
                        ]}
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
                          ${(item.value / 1000000).toFixed(2)}M
                        </Typography>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className='h-[300px] flex items-center justify-center text-textSecondary'>
                  暂无资产分布数据
                  {/* {displayMode === 'equity' ? '暂无资产分布数据' : '条形图：主钱包 vs 客户地址'} */}
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card className='bs-full'>
            <CardHeader title='持仓表' />
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>币种-链</th>
                    {/* <th className='text-right'>权益数量</th> */}
                    <th className='text-right'>数量</th>
                    <th className='text-right'>估值</th>
                    <th>最近交易</th>
                  </tr>
                </thead>
                <tbody>
                  {customerHoldings.length > 0 ? (
                    customerHoldings.map((row, idx) => (
                      <tr key={idx} className='hover:bg-actionHover'>
                        <td className='font-semibold'>
                          {row.currency}-{row.chain}
                        </td>
                        <td className='text-right font-mono'>
                          {row.quantity}
                        </td>
                        <td className='text-right font-mono font-semibold'>
                          {row.value}
                        </td>
                        <td className='text-sm text-textSecondary'>{row.lastTx}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className='text-center py-8'>
                        <Typography variant='body2' color='text.secondary'>
                          {customerDetailLoading ? '加载中...' : '暂无持仓数据'}
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Grid>
      </Grid>

      {/* Address List */}
      <Card>
        <CardHeader title='地址列表' />
        {/* <CardHeader title='地址列表（物理）' /> */}
        
        {/* Filters */}
        <CardContent>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>币种</InputLabel>
                <Select
                  value={addressFilters.coinKey}
                  onChange={(e) => setAddressFilters({ ...addressFilters, coinKey: e.target.value })}
                  label='币种'
                  disabled={loadingCoinChainOptions}
                >
                  <MenuItem value='all'>全部</MenuItem>
                  {coinOptions.map((coin) => (
                    <MenuItem key={coin.id} value={coin.coinKey}>
                      {coin.coinKey}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>链</InputLabel>
                <Select
                  value={addressFilters.chain}
                  onChange={(e) => setAddressFilters({ ...addressFilters, chain: e.target.value })}
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
                fullWidth
                size='small'
                label='关键词搜索'
                placeholder='地址'
                value={addressFilters.keyword}
                onChange={(e) => setAddressFilters({ ...addressFilters, keyword: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<i className='ri-search-line' />} 
                onClick={handleAddressQuery}
                disabled={addressListLoading}
                sx={{ fontWeight: 600, height: "40px" }}
              >
                查询
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<i className='ri-close-circle-line' />}
                onClick={handleAddressFiltersReset}
                disabled={addressListLoading}
                sx={{ height: "40px" }}
              >
                重置
              </Button>
            </Grid>
          </Grid>
        </CardContent>
        
        {/* Loading State */}
        {addressListLoading && (
          <CardContent className='flex justify-center items-center py-12'>
            <CircularProgress />
          </CardContent>
        )}

        {/* Error State */}
        {addressListError && !addressListLoading && (
          <CardContent>
            <Alert 
              severity='error' 
              action={
                <Button color='inherit' size='small' onClick={loadAddressList}>
                  重试
                </Button>
              }
            >
              {addressListError}
            </Alert>
          </CardContent>
        )}

        {!addressListLoading && !addressListError && (
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>地址</th>
                  <th>标签</th>
                  <th>币种-链</th>
                  <th className='text-right'>余额</th>
                  <th className='text-right'>近7日入金</th>
                  <th className='text-right'>近7日出金</th>
                  <th>最近交易</th>
                  {/* <th>风险提示</th> */}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {customerAddresses.length > 0 ? (
                  customerAddresses.map((row, idx) => (
                    <tr key={idx} className='hover:bg-actionHover'>
                      <td className='font-mono text-sm'>
                        {row.address.slice(0, 10)}...{row.address.slice(-6)}
                      </td>
                      <td>
                        <div className='flex gap-1 items-center flex-wrap'>
                          {row.label}
                          {row.isMainWallet && <Chip label='主钱包' size='small' color='primary' />}
                          {row.isWhitelist && <Chip label='白名单' size='small' color='success' />}
                        </div>
                      </td>
                      <td>{row.currencyChain}</td>
                      <td className='text-right font-mono font-semibold'>
                        {row.balance}
                      </td>
                      <td className='text-right font-mono text-success'>
                        {row.deposit7d}
                      </td>
                      <td className='text-right font-mono text-error'>
                        {row.withdrawal7d}
                      </td>
                      <td className='text-sm text-textSecondary'>{row.lastTx}</td>
                      {/* <td>{row.riskAlert && <Chip label={row.riskAlert} size='small' color='warning' />}</td> */}
                      <td>
                        <div className='flex gap-1'>
                          <Tooltip title='复制地址'>
                            <IconButton size='small' onClick={() => handleCopyAddress(row.address)}>
                              <i className='ri-file-copy-line text-xl' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='区块浏览器'>
                            <IconButton
                              size='small'
                              onClick={() => handleExternalLink(`https://explorer.example.com/${row.address}`)}
                            >
                              <i className='ri-external-link-line text-xl' />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className='text-center py-8'>
                      <Typography variant='body2' color='text.secondary'>
                        暂无地址数据
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!addressListLoading && !addressListError && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component='div'
            className='border-bs'
            count={addressListData?.total || 0}
            rowsPerPage={addressRowsPerPage}
            page={addressPage}
            onPageChange={(_, newPage) => setAddressPage(newPage)}
            onRowsPerPageChange={(e) => {
              setAddressRowsPerPage(parseInt(e.target.value, 10))
              setAddressPage(0)
            }}
          />
        )}
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader
          title='交易流水'
        />

        {/* Filters */}
        <CardContent>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size='small'
                label='开始时间'
                type='datetime-local'
                value={txFilters.startTime}
                onChange={(e) => setTxFilters({ ...txFilters, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size='small'
                label='结束时间'
                type='datetime-local'
                value={txFilters.endTime}
                onChange={(e) => setTxFilters({ ...txFilters, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>币种</InputLabel>
                <Select
                  value={txFilters.currency}
                  onChange={(e) => setTxFilters({ ...txFilters, currency: e.target.value })}
                  label='币种'
                  disabled={loadingCoinChainOptions}
                >
                  <MenuItem value='all'>全部</MenuItem>
                  {coinOptions.map((coin) => (
                    <MenuItem key={coin.id} value={coin.coinKey}>
                      {coin.coinKey}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>链</InputLabel>
                <Select
                  value={txFilters.chain}
                  onChange={(e) => setTxFilters({ ...txFilters, chain: e.target.value })}
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
              <FormControl fullWidth size='small'>
                <InputLabel>方向</InputLabel>
                <Select
                  value={txFilters.direction}
                  onChange={(e) => setTxFilters({ ...txFilters, direction: e.target.value })}
                  label='方向'
                >
                  <MenuItem value='all'>全部</MenuItem>
                  <MenuItem value='入金'>入金</MenuItem>
                  <MenuItem value='出金'>出金</MenuItem>
                  <MenuItem value='内部'>内部</MenuItem>
                  <MenuItem value='归集'>归集</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>状态</InputLabel>
                <Select
                  value={txFilters.status}
                  onChange={(e) => setTxFilters({ ...txFilters, status: e.target.value })}
                  label='状态'
                >
                  <MenuItem value='all'>全部</MenuItem>
                  <MenuItem value='完成'>完成</MenuItem>
                  <MenuItem value='待处理'>待处理</MenuItem>
                  <MenuItem value='失败'>失败</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size='small'
                label='最小金额'
                type='number'
                value={txFilters.minAmount}
                onChange={(e) => setTxFilters({ ...txFilters, minAmount: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size='small'
                label='最大金额'
                type='number'
                value={txFilters.maxAmount}
                onChange={(e) => setTxFilters({ ...txFilters, maxAmount: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size='small'
                label='关键词搜索'
                placeholder='TxHash / 地址'
                value={txFilters.keyword}
                onChange={(e) => setTxFilters({ ...txFilters, keyword: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<i className='ri-search-line' />} 
                onClick={handleTxQuery}
                disabled={txLoading}
                sx={{ fontWeight: 600, height: "40px" }}
              >
                查询
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<i className='ri-close-circle-line' />}
                onClick={handleTxFiltersReset}
                disabled={txLoading}
                sx={{ height: "40px" }}
              >
                重置
              </Button>
            </Grid>
          </Grid>
        </CardContent>
        
        {/* Loading State */}
        {txLoading && (
          <CardContent className='flex justify-center items-center py-12'>
            <CircularProgress />
          </CardContent>
        )}

        {/* Error State */}
        {txError && !txLoading && (
          <CardContent>
            <Alert 
              severity='error' 
              action={
                <Button color='inherit' size='small' onClick={loadCustomerTransactionFlow}>
                  重试
                </Button>
              }
            >
              {txError}
            </Alert>
          </CardContent>
        )}

        {!txLoading && !txError && (
          <>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead className='bg-backgroundDefault'>
                  <tr>
                    <th>时间</th>
                    <th>币种-链</th>
                    <th className='text-right'>金额</th>
                    <th>方向</th>
                    <th>From → To</th>
                    <th className='text-right'>手续费</th>
                    <th className='text-right'>确认数</th>
                    <th>状态</th>
                    <th>TxHash</th>
                    <th>发起</th>
                    {/* <th>影响权益</th> */}
                    <th className='text-center'>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {formattedTransactions.length > 0 ? (
                    formattedTransactions.map((row, idx) => (
                      <tr key={idx} className='hover:bg-actionHover'>
                        <td className='text-sm text-textSecondary'>{row.time}</td>
                        <td>{row.currencyChain}</td>
                        <td className='text-right font-mono font-semibold'>
                          {row.amount}
                        </td>
                        <td>
                          <Chip
                            label={row.direction}
                            size='small'
                            color={getDirectionColor(row.direction)}
                            variant='outlined'
                          />
                        </td>
                        <td className='font-mono text-sm'>
                          <div className='flex items-center gap-1'>
                            {row.from}
                            {row.fromWhitelist && <Chip label='白' size='small' />}
                            {' → '}
                            {row.to}
                            {row.toMainWallet && <Chip label='主' size='small' color='primary' />}
                          </div>
                        </td>
                        <td className='text-right font-mono text-sm'>
                          {row.fee}
                        </td>
                        <td className='text-right'>{row.confirmations}</td>
                        <td>
                          <Chip label={row.status} size='small' color={getStatusColor(row.status)} />
                        </td>
                        <td>
                          <div className='flex items-center gap-1'>
                            <Typography variant='body2' className='font-mono text-sm'>
                              {row.txHash || '-'}
                            </Typography>
                            {row.txHash && (
                              <IconButton
                                size='small'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleExternalLink(`https://tronscan.org/#/transaction/${row.txHash}`)
                                }}
                                color='primary'
                              >
                                <i className='ri-external-link-line' />
                              </IconButton>
                            )}
                          </div>
                        </td>
                        <td className='text-sm'>{row.source}</td>
                        {/* <td>
                          <Chip
                            label={row.affectsEquity ? '是' : '否'}
                            size='small'
                            color={row.affectsEquity ? 'success' : 'default'}
                          />
                        </td> */}
                        {/* <td className='text-center'>
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
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className='text-center py-12'>
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
              onRowsPerPageChange={(e) => {
                setTxRowsPerPage(parseInt(e.target.value, 10))
                setTxPage(0)
              }}
            />
          </>
        )}
      </Card>

      {/* Transaction Detail Drawer */}
      <Drawer anchor='right' open={detailDrawerOpen} onClose={() => setDetailDrawerOpen(false)} PaperProps={{ className: 'w-[500px]' }}>
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
                  <Chip label={selectedTx.status} size='small' color={getStatusColor(selectedTx.status)} />
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
              {/* <div>
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
              </div> */}
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

      {/* External Link Confirmation Dialog */}
      <Dialog open={!!externalLinkDialog} onClose={() => setExternalLinkDialog(null)}>
        <DialogTitle>打开外部链接</DialogTitle>
        <DialogContent>
          <DialogContentText>您即将访问外部区块浏览器。请确认您信任此链接。</DialogContentText>
          <Typography variant='body2' className='mt-4 font-mono break-all'>
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
    </div>
  )
}

