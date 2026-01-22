"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"

// API Imports
import {
  getCustomerAssetOverview,
  getCustomerFiatAssets,
  getCustomerDigitalAssets,
  getCustomerTrades,
  getCustomerInvest,
  type CustomerAssetOverviewResponse,
  type CustomerFiatAssetsResponse,
  type CustomerDigitalAssetsResponse,
  type CustomerTradeResponse,
  type CustomerInvestResponse,
} from "@server/assets"
import {
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  IconButton,
  LinearProgress,
  useTheme,
  Divider,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
} from "@mui/material"

// Materialize imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'
import classnames from 'classnames'
import tableStyles from '@core/styles/table.module.css'

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useRouter } from "next/navigation"
import { formatDate } from 'date-fns/format'

// 获取客户信息（需要从父组件或通过接口获取）
async function getCustomerInfo(userId: string) {
  // TODO: 如果需要客户详细信息，可以添加接口
  return {
    id: userId,
    name: `客户 ${userId}`,
    avatar: userId.charAt(0),
  }
}


// Mock wealth products data
const wealthProducts = [
  {
    id: "P001",
    name: "稳健增长基金",
    type: "固定收益",
    subscriptionAmount: 500000,
    currentValue: 525000,
    returnRate: 5.0,
    subscriptionDate: "2023-10-15",
    status: "持有中",
    maturityDate: "2024-10-15",
  },
  {
    id: "P002",
    name: "高收益债券",
    type: "债券型",
    subscriptionAmount: 300000,
    currentValue: 318000,
    returnRate: 6.0,
    subscriptionDate: "2023-11-01",
    status: "持有中",
    maturityDate: "2024-11-01",
  },
  {
    id: "P003",
    name: "平衡配置基金",
    type: "混合型",
    subscriptionAmount: 200000,
    currentValue: 0,
    returnRate: 4.5,
    subscriptionDate: "2023-08-20",
    status: "已赎回",
    maturityDate: "2024-08-20",
    redemptionDate: "2024-01-05",
    redemptionAmount: 209000,
  },
]

// Mock credit card data
const creditCards = [
  {
    id: "C001",
    cardNumber: "**** **** **** 1234",
    cardType: "Visa Platinum",
    status: "正常",
    creditLimit: 100000,
    availableLimit: 75000,
    balance: 25000,
    billingDate: "每月15日",
    paymentDate: "每月25日",
    issueDate: "2023-06-01",
  },
  {
    id: "C002",
    cardNumber: "**** **** **** 5678",
    cardType: "Mastercard Gold",
    status: "正常",
    creditLimit: 50000,
    availableLimit: 48000,
    balance: 2000,
    billingDate: "每月10日",
    paymentDate: "每月20日",
    issueDate: "2023-09-15",
  },
]

// Mock card transactions
const cardTransactions = [
  {
    id: "1",
    cardNumber: "**** 1234",
    time: "2024-01-10 15:30",
    merchant: "Amazon",
    amount: -1500,
    currency: "USD",
    status: "已入账",
  },
  {
    id: "2",
    cardNumber: "**** 5678",
    time: "2024-01-10 12:20",
    merchant: "Starbucks",
    amount: -50,
    currency: "HKD",
    status: "已入账",
  },
  {
    id: "3",
    cardNumber: "**** 1234",
    time: "2024-01-09 18:45",
    merchant: "Apple Store",
    amount: -8000,
    currency: "USD",
    status: "已入账",
  },
]

type TabValue = "overview" | "fiat" | "digital" | "transactions" | "wealth" | "cards"

const TAB_VALUES: TabValue[] = ["overview", "fiat", "digital", "transactions", "wealth", "cards"]

export default function CustomerAssetDetailClient({ 
  customerId,
  customerName,
  onBack 
}: { 
  customerId: string
  customerName: string | null
  onBack?: () => void
}) {
  const router = useRouter()
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<TabValue>("overview")
  
  // Customer info state
  const [customerInfo, setCustomerInfo] = useState<{ id: string; name: string; avatar: string } | null>(null)
  
  // Overview data states
  const [overviewData, setOverviewData] = useState<CustomerAssetOverviewResponse | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)
  
  // Fiat assets data states
  const [fiatData, setFiatData] = useState<CustomerFiatAssetsResponse | null>(null)
  const [fiatLoading, setFiatLoading] = useState(false)
  const [fiatError, setFiatError] = useState<string | null>(null)
  
  // Digital assets data states
  const [digitalData, setDigitalData] = useState<CustomerDigitalAssetsResponse | null>(null)
  const [digitalLoading, setDigitalLoading] = useState(false)
  const [digitalError, setDigitalError] = useState<string | null>(null)
  
  // Trade data states
  const [tradeData, setTradeData] = useState<CustomerTradeResponse | null>(null)
  const [tradeLoading, setTradeLoading] = useState(false)
  const [tradeError, setTradeError] = useState<string | null>(null)
  const [tradePage, setTradePage] = useState(0)
  const [tradeRowsPerPage, setTradeRowsPerPage] = useState(10)

  // Invest (wealth products) data states
  const [investData, setInvestData] = useState<CustomerInvestResponse | null>(null)
  const [investLoading, setInvestLoading] = useState(false)
  const [investError, setInvestError] = useState<string | null>(null)
  const [investPage, setInvestPage] = useState(0)
  const [investRowsPerPage, setInvestRowsPerPage] = useState(10)

  const userId = parseInt(customerId, 10)
  const isValidUserId = !isNaN(userId) && userId > 0

  // Debug log
  useEffect(() => {
    // console.log('CustomerAssetDetail mounted:', { customerId, userId, isValidUserId })
  }, [customerId, userId, isValidUserId])

  // Load customer info
  useEffect(() => {
    if (customerId) {
      getCustomerInfo(customerId).then(setCustomerInfo)
    }
  }, [customerId])

  // Load overview data
  const loadOverviewData = useCallback(async () => {
    if (!isValidUserId) {
      // console.warn('loadOverviewData: Invalid userId', { userId, isValidUserId })
      return
    }
    try {
      // console.log('loadOverviewData: Starting...', { userId })
      setOverviewLoading(true)
      setOverviewError(null)
      const response = await getCustomerAssetOverview(userId)
      // console.log('loadOverviewData: Response received', response)
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      // console.log('loadOverviewData: Actual data', actualData)
      setOverviewData(actualData as CustomerAssetOverviewResponse)
    } catch (err) {
      // console.error('Failed to load customer asset overview:', err)
      setOverviewError('数据加载失败，请刷新重试')
    } finally {
      setOverviewLoading(false)
    }
  }, [userId, isValidUserId])

  // Load fiat assets data
  const loadFiatData = useCallback(async () => {
    if (!isValidUserId) return
    try {
      setFiatLoading(true)
      setFiatError(null)
      const response = await getCustomerFiatAssets(userId)
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setFiatData(actualData as CustomerFiatAssetsResponse)
    } catch (err) {
      // console.error('Failed to load customer fiat assets:', err)
      setFiatError('数据加载失败，请刷新重试')
    } finally {
      setFiatLoading(false)
    }
  }, [userId, isValidUserId])

  // Load digital assets data
  const loadDigitalData = useCallback(async () => {
    if (!isValidUserId) return
    try {
      setDigitalLoading(true)
      setDigitalError(null)
      const response = await getCustomerDigitalAssets(userId)
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setDigitalData(actualData as CustomerDigitalAssetsResponse)
    } catch (err) {
      // console.error('Failed to load customer digital assets:', err)
      setDigitalError('数据加载失败，请刷新重试')
    } finally {
      setDigitalLoading(false)
    }
  }, [userId, isValidUserId])

  // Load trade data
  const loadTradeData = useCallback(async () => {
    if (!isValidUserId) return
    try {
      setTradeLoading(true)
      setTradeError(null)
      const response = await getCustomerTrades({
        userId: userId,
        pageNum: tradePage + 1,
        pageSize: tradeRowsPerPage,
      })
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setTradeData(actualData as CustomerTradeResponse)
    } catch (err) {
      // console.error('Failed to load customer trades:', err)
      setTradeError('数据加载失败，请刷新重试')
    } finally {
      setTradeLoading(false)
    }
  }, [userId, isValidUserId, tradePage, tradeRowsPerPage])

  // Load invest (wealth products) data
  const loadInvestData = useCallback(async () => {
    if (!isValidUserId) return
    try {
      setInvestLoading(true)
      setInvestError(null)
      const response = await getCustomerInvest(userId, {
        pageNum: investPage + 1,
        pageSize: investRowsPerPage,
      })
      const actualData = response.data && typeof response.data === 'object' && 'data' in response.data 
        ? response.data.data 
        : response.data
      setInvestData(actualData as CustomerInvestResponse)
    } catch (err) {
      // console.error('Failed to load customer invest:', err)
      setInvestError('数据加载失败，请刷新重试')
    } finally {
      setInvestLoading(false)
    }
  }, [userId, isValidUserId, investPage, investRowsPerPage])

  // Load data when tab changes - use ref to prevent duplicate calls
  const loadingRef = useRef<{ tab: string; userId: number; tradePage?: number; tradeRowsPerPage?: number; investPage?: number; investRowsPerPage?: number } | null>(null)
  
  useEffect(() => {
    if (!isValidUserId) {
      // console.warn('Invalid userId:', customerId)
      return
    }
    
    // Prevent duplicate calls for the same tab, userId, and pagination params
    const currentKey = { 
      tab: activeTab, 
      userId,
      tradePage: activeTab === "transactions" ? tradePage : undefined,
      tradeRowsPerPage: activeTab === "transactions" ? tradeRowsPerPage : undefined,
      investPage: activeTab === "wealth" ? investPage : undefined,
      investRowsPerPage: activeTab === "wealth" ? investRowsPerPage : undefined,
    }
    
    // Only skip if all relevant keys match
    if (loadingRef.current && 
        loadingRef.current.tab === currentKey.tab && 
        loadingRef.current.userId === currentKey.userId &&
        (currentKey.tab !== "transactions" || 
         (loadingRef.current.tradePage === currentKey.tradePage && 
          loadingRef.current.tradeRowsPerPage === currentKey.tradeRowsPerPage)) &&
        (currentKey.tab !== "wealth" || 
         (loadingRef.current.investPage === currentKey.investPage && 
          loadingRef.current.investRowsPerPage === currentKey.investRowsPerPage))) {
      console.log('Skipping duplicate load for:', currentKey)
      return
    }
    
    loadingRef.current = currentKey
    
    if (activeTab === "overview") {
      loadOverviewData()
    } else if (activeTab === "fiat") {
      loadFiatData()
    } else if (activeTab === "digital") {
      loadDigitalData()
    } else if (activeTab === "transactions") {
      loadTradeData()
    } else if (activeTab === "wealth") {
      loadInvestData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userId, tradePage, tradeRowsPerPage, investPage, investRowsPerPage])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(TAB_VALUES[newValue])
  }

  // 格式化货币，只显示$符号，不显示US
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  // 格式化货币，只显示$符号，不显示US（用于tooltip）
  const formatCurrencyTooltip = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  // 格式化货币，保留小数点（用于交易记录明细）
  const formatCurrencyWithDecimals = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`
  }

  // Transform chart data from API
  const assetTypeData = useMemo(() => {
    if (!overviewData?.assetPie?.items) return []
    return overviewData.assetPie.items.map(item => ({
      name: item.label,
      value: item.amount,
      color: item.color || theme.palette.primary.main,
    }))
  }, [overviewData, theme])

  const fiatCurrencyData = useMemo(() => {
    if (!overviewData?.fiatBars) return []
    const colors = [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.secondary.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ]
    return overviewData.fiatBars.map((bar, index) => ({
      name: bar.currency,
      amount: bar.amount,
      percentage: bar.percent,
      color: colors[index % colors.length],
      fill: colors[index % colors.length],
    }))
  }, [overviewData, theme])

  // 计算法币币种分布Y轴的最大值，用于动态格式化
  const fiatYAxisMaxValue = useMemo(() => {
    if (!fiatCurrencyData || fiatCurrencyData.length === 0) return 0
    const maxValue = Math.max(...fiatCurrencyData.map(item => item.amount || 0))
    return maxValue > 0 ? maxValue * 1.1 : 1000000 // 增加10%的padding
  }, [fiatCurrencyData])

  // 法币币种分布Y轴格式化函数，根据最大值动态调整单位
  const formatFiatYAxisTick = useMemo(() => {
    return (value: number) => {
      if (value === 0) return '0'
      if (fiatYAxisMaxValue >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`
      } else if (fiatYAxisMaxValue >= 1000000) {
        return `${(value / 1000000).toFixed(0)}M`
      } else if (fiatYAxisMaxValue >= 1000) {
        return `${(value / 1000).toFixed(0)}K`
      }
      return value.toLocaleString()
    }
  }, [fiatYAxisMaxValue])

  const digitalCoinData = useMemo(() => {
    if (!overviewData?.digitalBars) return []
    const colors = [
      theme.palette.warning.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ]
    return overviewData.digitalBars.map((bar, index) => ({
      name: bar.currency,
      amount: bar.amount,
      percentage: bar.percent,
      color: colors[index % colors.length],
      fill: colors[index % colors.length],
    }))
  }, [overviewData, theme])

  // 计算数字资产分布Y轴的最大值，用于动态格式化
  const digitalYAxisMaxValue = useMemo(() => {
    if (!digitalCoinData || digitalCoinData.length === 0) return 0
    const maxValue = Math.max(...digitalCoinData.map(item => item.amount || 0))
    return maxValue > 0 ? maxValue * 1.1 : 1000000 // 增加10%的padding
  }, [digitalCoinData])

  // 数字资产分布Y轴格式化函数，根据最大值动态调整单位
  const formatDigitalYAxisTick = useMemo(() => {
    return (value: number) => {
      if (value === 0) return '0'
      if (digitalYAxisMaxValue >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`
      } else if (digitalYAxisMaxValue >= 1000000) {
        return `${(value / 1000000).toFixed(0)}M`
      } else if (digitalYAxisMaxValue >= 1000) {
        return `${(value / 1000).toFixed(0)}K`
      }
      return value.toLocaleString()
    }
  }, [digitalYAxisMaxValue])

  const assetTrendData = useMemo(() => {
    if (!overviewData?.trend7d) return []
    const { dateAxis, totalValues, fiatValues, digitalValues } = overviewData.trend7d
    return dateAxis.map((date, index) => ({
      date: date,
      total: totalValues[index] || 0,
      fiat: fiatValues[index] || 0,
      digital: digitalValues[index] || 0,
    }))
  }, [overviewData])

  // 检查是否有总资产数据（所有值都不为0）
  const hasTotalAssetData = useMemo(() => {
    if (!assetTrendData || assetTrendData.length === 0) return false
    return assetTrendData.some(item => item.total && item.total > 0)
  }, [assetTrendData])

  // 计算Y轴的最大值（排除total如果hasTotalAssetData为false）
  const yAxisMaxValue = useMemo(() => {
    if (!assetTrendData || assetTrendData.length === 0) return 0
    let maxValue = 0
    assetTrendData.forEach(item => {
      if (hasTotalAssetData && item.total > maxValue) {
        maxValue = item.total
      }
      if (item.fiat > maxValue) {
        maxValue = item.fiat
      }
      if (item.digital > maxValue) {
        maxValue = item.digital
      }
    })
    // 如果最大值为0，返回一个默认值避免显示问题
    return maxValue > 0 ? maxValue * 1.1 : 1000000 // 增加10%的padding，如果为0则默认1M
  }, [assetTrendData, hasTotalAssetData])

  // Y轴格式化函数，根据最大值动态调整单位
  const formatYAxisTick = useMemo(() => {
    return (value: number) => {
      if (value === 0) return '0'
      if (yAxisMaxValue >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`
      } else if (yAxisMaxValue >= 1000000) {
        return `${(value / 1000000).toFixed(0)}M`
      } else if (yAxisMaxValue >= 1000) {
        return `${(value / 1000).toFixed(0)}K`
      }
      return value.toLocaleString()
    }
  }, [yAxisMaxValue])

  const renderOverview = () => {
    console.log('renderOverview called:', { overviewLoading, overviewError, overviewData: !!overviewData })
    
    if (overviewLoading) {
      return (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent className='flex items-center justify-center' style={{ minHeight: '400px' }}>
                <CircularProgress />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    }

    if (overviewError) {
      return (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Alert severity="error">{overviewError}</Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    }

    if (!overviewData) {
      return (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Alert severity="info">暂无数据</Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    }

    const { summary } = overviewData
    console.log('renderOverview: Rendering with data', { summary })

    return (
    <Grid container spacing={6}>
      {/* Key Metrics */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" className='mbe-1'>
                总资产
              </Typography>
              <Typography variant="h5" className='font-mono font-semibold mbe-2'>
                {formatCurrencyTooltip(summary.totalAsset)}
              </Typography>
              <div className='flex items-center gap-1'>
                {summary.totalChangePct >= 0 ? (
                  <i className='ri-trending-up-line text-success' />
                ) : (
                  <i className='ri-trending-down-line text-error' />
                )}
                <Typography variant="caption" color={summary.totalChangePct >= 0 ? "success.main" : "error.main"}>
                  {summary.totalChangePct.toFixed(1)}% 24h
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" className='mbe-1'>
                法币资产
              </Typography>
              <Typography variant="h5" className='font-mono font-semibold mbe-2'>
                {formatCurrencyTooltip(summary.fiatAsset)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                占比 {summary.totalAsset > 0 ? ((summary.fiatAsset / summary.totalAsset) * 100).toFixed(1) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" className='mbe-1'>
                数字资产
              </Typography>
              <Typography variant="h5" className='font-mono font-semibold mbe-2'>
                {formatCurrencyTooltip(summary.digitalAsset)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                占比 {summary.totalAsset > 0 ? ((summary.digitalAsset / summary.totalAsset) * 100).toFixed(1) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" className='mbe-1'>
                币种
              </Typography>
              <div className='mbs-2 mbe-2'>
                <Chip label={summary.currency || "USD"} color="primary" variant='tonal' />
              </div>
              <Typography variant="caption" color="text.secondary">
                基础币种
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      {/* Charts */}
        {/* Asset Type Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='资产类型分布'
              subheader='各类型资产占比'
            />
            <CardContent>
              <div className='flex flex-col gap-6'>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={assetTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assetTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => formatCurrencyTooltip(Number(value))}
                      contentStyle={{
                        backgroundColor: 'var(--mui-palette-background-paper)',
                        border: '1px solid var(--mui-palette-divider)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className='flex flex-col gap-3'>
                  {assetTypeData.map((item, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div 
                          className='w-3 h-3 rounded-full' 
                          style={{ backgroundColor: item.color }}
                        />
                        <Typography variant='body2'>{item.name}</Typography>
                      </div>
                      <Typography variant='body2' className='font-semibold'>
                        {formatCurrencyTooltip(item.value)}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Fiat Currency Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='法币币种分布'
              subheader='各币种金额占比'
            />
            <CardContent>
              <div className='flex flex-col gap-6'>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart 
                    data={fiatCurrencyData}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="var(--mui-palette-divider)"
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 13 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 13 }}
                      tickFormatter={formatFiatYAxisTick}
                      domain={[0, fiatYAxisMaxValue]}
                    />
                    <RechartsTooltip 
                      formatter={(value) => formatCurrencyTooltip(Number(value))}
                      contentStyle={{
                        backgroundColor: 'var(--mui-palette-background-paper)',
                        border: '1px solid var(--mui-palette-divider)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      cursor={{ fill: 'var(--mui-palette-action-hover)' }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill={theme.palette.primary.main}
                      radius={[6, 6, 0, 0]}
                    >
                      {fiatCurrencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className='flex flex-wrap gap-4'>
                  {fiatCurrencyData.map((item, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <div 
                        className='w-3 h-3 rounded-full' 
                        style={{ backgroundColor: item.color }}
                      />
                      <Typography variant='body2' color='text.secondary'>
                        {item.name}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Digital Coin Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='数字资产分布'
              subheader='各币种持仓占比'
            />
            <CardContent>
              <div className='flex flex-col gap-6'>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart 
                    data={digitalCoinData}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="var(--mui-palette-divider)"
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 13 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 13 }}
                      tickFormatter={formatDigitalYAxisTick}
                      domain={[0, digitalYAxisMaxValue]}
                    />
                    <RechartsTooltip 
                      formatter={(value) => formatCurrencyTooltip(Number(value))}
                      contentStyle={{
                        backgroundColor: 'var(--mui-palette-background-paper)',
                        border: '1px solid var(--mui-palette-divider)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      cursor={{ fill: 'var(--mui-palette-action-hover)' }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill={theme.palette.success.main}
                      radius={[6, 6, 0, 0]}
                    >
                      {digitalCoinData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className='flex flex-wrap gap-4'>
                  {digitalCoinData.map((item, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <div 
                        className='w-3 h-3 rounded-full' 
                        style={{ backgroundColor: item.color }}
                      />
                      <Typography variant='body2' color='text.secondary'>
                        {item.name}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Trend */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='资产趋势'
              subheader='近7天资产变化情况'
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart 
                  data={assetTrendData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="var(--mui-palette-divider)"
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 13 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 13 }}
                    tickFormatter={formatYAxisTick}
                    domain={[0, yAxisMaxValue]}
                  />
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      border: '1px solid var(--mui-palette-divider)',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '14px'
                    }}
                    iconType='circle'
                  />
                  {hasTotalAssetData && (
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke={theme.palette.primary.main}
                      strokeWidth={3} 
                      name="总资产"
                      dot={{ fill: theme.palette.primary.main, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="fiat" 
                    stroke={theme.palette.success.main}
                    strokeWidth={2.5} 
                    name="法币资产"
                    dot={{ fill: theme.palette.success.main, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="digital" 
                    stroke={theme.palette.warning.main}
                    strokeWidth={2.5} 
                    name="数字资产"
                    dot={{ fill: theme.palette.warning.main, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  const renderFiatAssets = () => {
    if (fiatLoading) {
      return (
        <Card>
          <CardContent className='flex items-center justify-center' style={{ minHeight: '200px' }}>
            <CircularProgress />
          </CardContent>
        </Card>
      )
    }

    if (fiatError) {
      return (
        <Card>
          <CardContent>
            <Alert severity="error">{fiatError}</Alert>
          </CardContent>
        </Card>
      )
    }

    if (!fiatData || !fiatData.list || fiatData.list.length === 0) {
      return (
        <Card>
          <CardContent>
            <Alert severity="info">暂无数据</Alert>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader
          title='法币资产明细'
          action={<OptionsMenu iconButtonProps={{ color: 'default' }} options={['刷新', '导出', '设置']} />}
        />
        <CardContent className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>币种</th>
                <th>可用余额</th>
                <th>卡片金额</th>
                <th>冻结金额</th>
                <th>在途金额</th>
                <th>估值 ($)</th>
              </tr>
            </thead>
            <tbody>
              {fiatData.list.map((asset) => (
                <tr key={asset.currency} className={classnames('hover:bg-actionHover')}>
                  <td>
                    <Chip label={asset.currency} size="small" variant='tonal' />
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono'>
                      {asset.available.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono'>
                      {asset.cardAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono'>
                      {asset.frozen.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono'>
                      {asset.pending.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono font-medium'>
                      {formatCurrency(asset.valueUsd)}
                    </Typography>
                  </td>
                </tr>
              ))}
              <tr className='font-semibold'>
                <td colSpan={5}>
                  <Typography variant="body2" className='font-semibold'>合计</Typography>
                </td>
                <td>
                  <Typography variant="body2" className='font-mono font-semibold'>
                    {formatCurrency(fiatData.totalUsd)}
                  </Typography>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    )
  }

  const renderDigitalAssets = () => {
    if (digitalLoading) {
      return (
        <Card>
          <CardContent className='flex items-center justify-center' style={{ minHeight: '200px' }}>
            <CircularProgress />
          </CardContent>
        </Card>
      )
    }

    if (digitalError) {
      return (
        <Card>
          <CardContent>
            <Alert severity="error">{digitalError}</Alert>
          </CardContent>
        </Card>
      )
    }

    if (!digitalData || !digitalData.list || digitalData.list.length === 0) {
      return (
        <Card>
          <CardContent>
            <Alert severity="info">暂无数据</Alert>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader
          title='数字资产明细'
          action={<OptionsMenu iconButtonProps={{ color: 'default' }} options={['刷新', '导出', '设置']} />}
        />
        <CardContent className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>币种</th>
                <th>余额</th>
                <th>估值 ($)</th>
                <th>24h变化</th>
              </tr>
            </thead>
            <tbody>
              {digitalData.list.map((asset) => (
                <tr key={asset.coinKey} className={classnames('hover:bg-actionHover')}>
                  <td>
                    <Chip label={asset.coinKey || asset.symbol} size="small" color="warning" variant='tonal' />
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono'>
                      {asset.balance.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 8 })}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono font-medium'>
                      {formatCurrency(asset.valueUsd)}
                    </Typography>
                  </td>
                  <td>
                    <div className='flex items-center gap-1'>
                      {asset.changePercent >= 0 ? (
                        <i className='ri-trending-up-line text-success' />
                      ) : (
                        <i className='ri-trending-down-line text-error' />
                      )}
                      <Typography variant="body2" color={asset.changePercent >= 0 ? "success.main" : "error.main"}>
                        {asset.changePercent.toFixed(2)}%
                      </Typography>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className='font-semibold'>
                <td colSpan={2}>
                  <Typography variant="body2" className='font-semibold'>合计</Typography>
                </td>
                <td>
                  <Typography variant="body2" className='font-mono font-semibold'>
                    {formatCurrency(digitalData.totalUsd)}
                  </Typography>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    )
  }

  const renderTransactions = () => {
    if (tradeLoading) {
      return (
        <Card>
          <CardContent className='flex items-center justify-center' style={{ minHeight: '200px' }}>
            <CircularProgress />
          </CardContent>
        </Card>
      )
    }

    if (tradeError) {
      return (
        <Card>
          <CardContent>
            <Alert severity="error">{tradeError}</Alert>
          </CardContent>
        </Card>
      )
    }

    if (!tradeData || !tradeData.list || tradeData.list.length === 0) {
      return (
        <Card>
          <CardContent>
            <Alert severity="info">暂无数据</Alert>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader
          title='交易记录明细'
          action={
            <Button variant="outlined" startIcon={<i className='ri-download-line' />} size="small">
              导出明细
            </Button>
          }
        />
        <CardContent className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>事件ID</th>
                <th>时间</th>
                <th>类型</th>
                <th>币种</th>
                <th>金额</th>
                <th>来源</th>
                <th>参考号</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {tradeData.list.map((tx) => (
                <tr key={tx.eventId} className={classnames('hover:bg-actionHover')}>
                  <td>
                    <Typography variant="body2" className='font-mono'>
                      {tx.eventId}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2">{formatDate(new Date(parseInt(tx.time, 10)), 'yyyy-MM-dd HH:mm:ss')}</Typography>
                  </td>
                  <td>
                    {(() => {
                      // 根据类型标签或事件类型设置颜色
                      const getTypeColor = () => {
                        const typeLabel = tx.typeLabel || ''
                        const eventType = tx.eventType || ''
                        
                        // 法币转入
                        if (typeLabel.includes('法币转入') || eventType.includes('fiat_in') || eventType.includes('deposit') || eventType === '1') {
                          return 'success' // 绿色
                        }
                        // 法币转出
                        if (typeLabel.includes('法币转出') || eventType.includes('fiat_out') || eventType.includes('withdraw') || eventType === '2') {
                          return 'error' // 红色
                        }
                        // 数字币转入
                        if (typeLabel.includes('数字币转入') || typeLabel.includes('数字资产转入') || eventType.includes('digital_in') || eventType === '3') {
                          return 'info' // 蓝色
                        }
                        // 数字币转出
                        if (typeLabel.includes('数字币转出') || typeLabel.includes('数字资产转出') || eventType.includes('digital_out') || eventType === '4') {
                          return 'warning' // 橙色
                        }
                        // 兑换
                        if (typeLabel.includes('兑换') || eventType.includes('convert') || eventType === '5') {
                          return 'convert' // 特殊标记，使用自定义颜色
                        }
                        // 默认
                        return 'default'
                      }
                      
                      const chipColor = getTypeColor()
                      
                      return (
                        <Chip
                          label={tx.typeLabel}
                          size="small"
                          color={chipColor === 'convert' ? undefined : (chipColor as any)}
                          variant="tonal"
                          sx={chipColor === 'convert' ? {
                            bgcolor: 'rgba(255, 193, 7, 0.16)', // 金色背景
                            color: '#f57c00', // 深橙色文字
                            '&:hover': {
                              bgcolor: 'rgba(255, 193, 7, 0.24)',
                            }
                          } : undefined}
                        />
                      )
                    })()}
                  </td>
                  <td>
                    <Chip label={tx.currency} size="small" variant='tonal' />
                  </td>
                  <td>
                    <Typography
                      variant="body2"
                      className='font-mono'
                      color={tx.amount > 0 ? "success.main" : "text.primary"}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatCurrencyWithDecimals(Math.abs(tx.amount))}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2" color="text.secondary">
                      {tx.source}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono' color="text.secondary">
                      {tx.reference || "-"}
                    </Typography>
                  </td>
                  <td>
                    {(() => {
                      // 根据状态设置颜色
                      const getStatusColor = () => {
                        const status = tx.status || ''
                        const statusLabel = tx.statusLabel || ''
                        
                        // 成功/已完成
                        if (status === '1' || status === 'completed' || status === 'success' || statusLabel.includes('成功') || statusLabel.includes('完成')) {
                          return 'success' // 绿色
                        }
                        // 处理中
                        if (status === '2' || status === 'processing' || status === 'pending' || statusLabel.includes('处理中') || statusLabel.includes('进行中')) {
                          return 'info' // 蓝色
                        }
                        // 失败
                        if (status === '-3' || status === 'failed' || statusLabel.includes('失败')) {
                          return 'error' // 红色
                        }
                        // 取消
                        if (status === '-1' || status === 'cancelled' || statusLabel.includes('取消')) {
                          return 'warning' // 橙色
                        }
                        // 拒绝
                        if (status === '-2' || status === 'rejected' || statusLabel.includes('拒绝')) {
                          return 'error' // 红色
                        }
                        // 待处理
                        if (status === '0' || status === 'submitted' || statusLabel.includes('待处理') || statusLabel.includes('提交')) {
                          return 'default' // 灰色
                        }
                        // 默认
                        return 'default'
                      }
                      
                      return (
                        <Chip 
                          label={tx.statusLabel} 
                          size="small" 
                          color={getStatusColor() as any} 
                          variant='tonal' 
                        />
                      )
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component='div'
            className='border-bs'
            count={tradeData?.total || 0}
            rowsPerPage={tradeRowsPerPage}
            page={tradePage}
            onPageChange={(_, newPage) => {
              setTradePage(newPage)
            }}
            onRowsPerPageChange={(e) => {
              const newRowsPerPage = parseInt(e.target.value, 10)
              setTradeRowsPerPage(newRowsPerPage)
              setTradePage(0)
            }}
          />
        </CardContent>
      </Card>
    )
  }

  const renderWealthProducts = () => {
    if (investLoading) {
      return (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent className='flex items-center justify-center' style={{ minHeight: '400px' }}>
                <CircularProgress />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    }

    if (investError) {
      return (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Alert severity="error">{investError}</Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    }

    if (!investData || !investData.list || investData.list.length === 0) {
      return (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Alert severity="info">暂无数据</Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    }

    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={6} className='mbe-6'>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" className='mbe-1'>
                  持有产品数
                </Typography>
                <Typography variant="h5" className='font-semibold'>
                  {investData.count || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" className='mbe-1'>
                  总投资金额
                </Typography>
                <Typography variant="h5" className='font-mono font-semibold'>
                  {formatCurrency(investData.totalInvest || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" className='mbe-1'>
                  当前市值
                </Typography>
                <Typography variant="h5" className='font-mono font-semibold'>
                  {formatCurrency(investData.totalValue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Product List */}
        <Card>
          <CardHeader title='理财产品列表' />
          <CardContent className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>产品名称</th>
                  <th>产品类型</th>
                  <th>投资金额</th>
                  <th>当前市值</th>
                  <th>收益</th>
                  <th>年化收益率</th>
                  <th>购买日期</th>
                  <th>到期日期</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {investData.list.map((product) => (
                  <tr key={product.orderId} className={classnames('hover:bg-actionHover')}>
                    <td>
                      <div className='flex flex-col'>
                        <Typography variant="body2" className='font-medium'>
                          {product.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.productCode}
                        </Typography>
                      </div>
                    </td>
                    <td>
                      <Chip label={product.productType} size="small" variant="tonal" />
                    </td>
                    <td>
                      <Typography variant="body2" className='font-mono'>
                        {formatCurrency(product.investAmount)}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant="body2" className='font-mono'>
                        {formatCurrency(product.marketValue)}
                      </Typography>
                    </td>
                    <td>
                      <div className='flex items-center gap-1'>
                        {product.yield >= 0 ? (
                          <i className='ri-trending-up-line text-success' />
                        ) : (
                          <i className='ri-trending-down-line text-error' />
                        )}
                        <Typography 
                          variant="body2" 
                          color={product.yield >= 0 ? "success.main" : "error.main"}
                        >
                          {product.yield >= 0 ? '+' : ''}{formatCurrency(product.yield)}
                        </Typography>
                      </div>
                    </td>
                    <td>
                      <Typography variant="body2" className='font-medium'>
                        {product.apr.toFixed(2)}%
                      </Typography>
                    </td>
                    <td>
                      <Typography variant="body2">{product.buyDate}</Typography>
                    </td>
                    <td>
                      <Typography variant="body2">{product.expireDate}</Typography>
                    </td>
                    <td>
                      <Chip
                        label={product.status}
                        size="small"
                        color={product.status === "持有中" || product.status === "生效中" ? "success" : "default"}
                        variant='tonal'
                      />
                    </td>
                    <td>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<i className='ri-eye-line' />}
                        onClick={() => router.push(`/operation/financialProducts/${product.productId}`)}
                      >
                        详情
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component='div'
            className='border-bs'
            count={investData.total || 0}
            rowsPerPage={investRowsPerPage}
            page={investPage}
            onPageChange={(_, newPage) => {
              setInvestPage(newPage)
            }}
            onRowsPerPageChange={(e) => {
              setInvestRowsPerPage(parseInt(e.target.value, 10))
              setInvestPage(0)
            }}
          />
        </Card>
      </Box>
    )
  }

  const renderCreditCards = () => (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={6} className='mbe-6'>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" className='mbe-1'>
                信用卡数量
              </Typography>
              <Typography variant="h5" className='font-semibold'>
                {creditCards.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" className='mbe-1'>
                总信用额度
              </Typography>
              <Typography variant="h5" className='font-mono font-semibold'>
                {formatCurrency(creditCards.reduce((sum, card) => sum + card.creditLimit, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" className='mbe-1'>
                可用额度
              </Typography>
              <Typography variant="h5" className='font-mono font-semibold'>
                {formatCurrency(creditCards.reduce((sum, card) => sum + card.availableLimit, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" className='mbe-1'>
                当前欠款
              </Typography>
              <Typography variant="h5" className='font-mono font-semibold'>
                {formatCurrency(creditCards.reduce((sum, card) => sum + card.balance, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Card List */}
      <Card className='mbe-6'>
        <CardHeader title='信用卡列表' />
        <CardContent>
        <Grid container spacing={6}>
          {creditCards.map((card) => (
            <Grid size={{ xs: 12, md: 6 }} key={card.id}>
              <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <CardContent>
                  <div className='flex justify-between items-start mbe-6'>
                    <div>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {card.cardType}
                      </Typography>
                      <Typography variant="h6" className='font-mono mbs-1'>
                        {card.cardNumber}
                      </Typography>
                    </div>
                    <i className='ri-bank-card-line text-2xl' />
                  </div>

                  <Grid container spacing={4} className='mbe-4'>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        信用额度
                      </Typography>
                      <Typography variant="body1" className='font-mono font-semibold'>
                        {formatCurrency(card.creditLimit)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        可用额度
                      </Typography>
                      <Typography variant="body1" className='font-mono font-semibold'>
                        {formatCurrency(card.availableLimit)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        额度使用率
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {((card.balance / card.creditLimit) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(card.balance / card.creditLimit) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.3)",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: "white",
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        账单日
                      </Typography>
                      <Typography variant="body2">{card.billingDate}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        还款日
                      </Typography>
                      <Typography variant="body2">{card.paymentDate}</Typography>
                    </Box>
                    <Chip label={card.status} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        </CardContent>
      </Card>

      {/* Recent Card Transactions */}
      <Card>
        <CardHeader title='最近交易' />
        <CardContent className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>卡号</th>
                <th>时间</th>
                <th>商户</th>
                <th>币种</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {cardTransactions.map((tx) => (
                <tr key={tx.id} className={classnames('hover:bg-actionHover')}>
                  <td>
                    <Typography variant="body2" className='font-mono'>
                      {tx.cardNumber}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2">{tx.time}</Typography>
                  </td>
                  <td>
                    <Typography variant="body2">{tx.merchant}</Typography>
                  </td>
                  <td>
                    <Chip label={tx.currency} size="small" variant='tonal' />
                  </td>
                  <td>
                    <Typography variant="body2" className='font-mono'>
                      {formatCurrency(Math.abs(tx.amount))}
                    </Typography>
                  </td>
                  <td>
                    <Chip label={tx.status} size="small" color="success" variant='tonal' />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </Box>
  )
  // Show error if userId is invalid
  if (!isValidUserId) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            无效的客户ID: {customerId}
          </Alert>
          <Button 
            variant="outlined" 
            startIcon={<i className='ri-arrow-left-line' />}
            onClick={() => {
              if (onBack) {
                onBack()
              } else {
                router.back()
              }
            }}
            className='mts-4'
          >
            返回
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Header */}
      <Card className='mbe-6'>
        <CardContent>
          <div className='flex items-center gap-4'>
            <IconButton onClick={() => {
              if (onBack) {
                onBack()
              } else {
                router.back()
              }
            }}>
              <i className='ri-arrow-left-line' />
            </IconButton>
            <CustomAvatar skin='light' size={48}>
              {customerInfo?.avatar || customerId.charAt(0)}
            </CustomAvatar>
            <div className='flex-1'>
              <Typography variant="h5" className='font-semibold'>
              {customerName || customerInfo?.name || `客户 ${customerId}`}
              </Typography>
              <Typography color="text.secondary">
                客户编号: {customerId}
              </Typography>
            </div>
            <Button 
              variant="outlined" 
              startIcon={<i className='ri-refresh-line' />}
              onClick={() => {
                if (activeTab === "overview") {
                  loadOverviewData()
                } else if (activeTab === "fiat") {
                  loadFiatData()
                } else if (activeTab === "digital") {
                  loadDigitalData()
                } else if (activeTab === "transactions") {
                  loadTradeData()
                }
              }}
            >
              刷新
            </Button>
            <Button variant="outlined" startIcon={<i className='ri-download-line' />}>
              导出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className='mbe-6'>
        <Tabs
          value={TAB_VALUES.indexOf(activeTab)}
          onChange={handleTabChange}
          className='border-be'
          sx={{
            minHeight: 64,
            '& .MuiTab-root': {
              minHeight: 64,
              py: 3,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '0.15px'
            }
          }}
        >
          <Tab label="资产概览" />
          <Tab label="法币资产" />
          <Tab label="数字资产" />
          <Tab label="交易记录" />
          <Tab label="理财产品" />
          {/* <Tab label="信用卡" /> */}
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "fiat" && renderFiatAssets()}
      {activeTab === "digital" && renderDigitalAssets()}
      {activeTab === "transactions" && renderTransactions()}
      {activeTab === "wealth" && renderWealthProducts()}
      {activeTab === "cards" && renderCreditCards()}
    </>
  )
}
