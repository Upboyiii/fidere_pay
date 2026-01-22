"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"

// Third-party Imports
import classnames from 'classnames'

// API Imports
import {
  getAssetOverview,
  getCustomerList,
  getCustomerFiatAssets,
  getCustomerDigitalAssets,
  type AssetOverviewResponse,
  type CustomerListResponse,
  type CustomerFiatAssetsResponse,
  type CustomerDigitalAssetsResponse
} from "@server/assets"

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import { useTheme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports
import CardStatWithImage from '@components/card-statistics/Character'
import CardStatVertical from '@components/card-statistics/Vertical'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// 使用 Remix Icons 替代 MUI Icons
const TrendingUpIcon = () => <i className="ri-trending-up-line" />
const TrendingDownIcon = () => <i className="ri-trending-down-line" />
const AccountBalanceIcon = () => <i className="ri-bank-line" />
const CurrencyBitcoinIcon = () => <i className="ri-coin-line" />
const PersonIcon = () => <i className="ri-user-line" />
const VisibilityIcon = () => <i className="ri-eye-line" />
const RefreshIcon = () => <i className="ri-refresh-line" />
const DownloadIcon = () => <i className="ri-download-line" />
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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import Link from "next/link"
import CustomerAssetDetail from "./CustomerAssetDetail"

type TabValue = "overview" | "by-customer"

const TAB_VALUES: TabValue[] = ["overview", "by-customer"]

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("overview")
  const [trendPeriod, setTrendPeriod] = useState<"7d" | "30d">("7d")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [showCustomerDetail, setShowCustomerDetail] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const theme = useTheme()

  // API data states
  const [overviewData, setOverviewData] = useState<AssetOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true) // 初始为 true，显示加载状态
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("")

  // Customer list data states
  const [customerListData, setCustomerListData] = useState<CustomerListResponse | null>(null)
  const [customerListLoading, setCustomerListLoading] = useState(false)
  const [customerListError, setCustomerListError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchInput, setSearchInput] = useState("") // 临时输入值，用于防抖
  
  // Expanded customer detail data states - 不再需要单独加载，直接使用列表数据
  const [expandedCustomerDetails, setExpandedCustomerDetails] = useState<Record<string, {
    fiatAssets: any[]
    digitalAssets: any[]
    cardAssets: any[]
    loading: boolean
    error: string | null
  }>>({})

  // Handle customer row click to expand/collapse
  const handleCustomerRowClick = useCallback((customerId: string) => {
    if (selectedCustomerId === customerId) {
      // 收起
      setSelectedCustomerId(null)
    } else {
      // 展开
      setSelectedCustomerId(customerId)
      // 从客户列表数据中获取详情数据
      const customer = customerListData?.list?.find(c => String(c.userId) === customerId)
      if (customer) {
        setExpandedCustomerDetails(prev => ({
          ...prev,
          [customerId]: {
            fiatAssets: customer.fiatDetails || [],
            digitalAssets: customer.digitalDetails || [],
            cardAssets: customer.cardDetails || [],
            loading: false,
            error: null
          }
        }))
      }
    }
  }, [selectedCustomerId, customerListData])

  // Load overview data
  const loadOverviewData = useCallback(async (statDate?: string) => {
    try {
      console.log('loadOverviewData: Starting...', { statDate })
      setLoading(true)
      setError(null)
      const response = await getAssetOverview(statDate)
      console.log('loadOverviewData: Response received', response)

      // clientRequestInternal 已经处理了嵌套数据，response.data 应该就是实际数据
      const actualData = response.data

      console.log('loadOverviewData: Actual data', actualData)

      // 验证数据格式
      if (!actualData || typeof actualData !== 'object') {
        console.error('loadOverviewData: Invalid data format', actualData)
        setError('数据格式错误：接口返回的数据为空或格式不正确')
        return
      }

      // 检查必要字段是否存在
      if (!('summary' in actualData) || !('assetTypePie' in actualData)) {
        console.error('loadOverviewData: Missing required fields', actualData)
        setError('数据格式错误：缺少必要字段')
        return
      }

      const overviewData = actualData as AssetOverviewResponse
      setOverviewData(overviewData)
      setLastUpdateTime(overviewData?.updatedAt || "")
    } catch (err) {
      console.error('Failed to load asset overview:', err)
      setError('数据加载失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load - only load when not showing customer detail
  useEffect(() => {
    if (!showCustomerDetail) {
      console.log('Initial load triggered', { showCustomerDetail })
      loadOverviewData()
    }
  }, [showCustomerDetail, loadOverviewData])

  // Transform API data to component format
  const assetTypeData = overviewData?.assetTypePie?.items?.map(item => ({
    name: item.label,
    value: item.amount,
    color: item.color || theme.palette.primary.main,
  })) || []

  const currencyData = overviewData?.coinBars?.map((bar, index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.secondary.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ]
    return {
      name: bar.currency,
      value: bar.amount,
      percentage: bar.percent,
      color: colors[index % colors.length],
      fill: colors[index % colors.length], // 用于 BarChart
    }
  }) || []

  // 计算币种分布Y轴的最大值，用于动态格式化
  const currencyYAxisMaxValue = useMemo(() => {
    if (!currencyData || currencyData.length === 0) return 0
    const maxValue = Math.max(...currencyData.map(item => item.value || 0))
    return maxValue > 0 ? maxValue * 1.1 : 1000000 // 增加10%的padding
  }, [currencyData])

  // 币种分布Y轴格式化函数，根据最大值动态调整单位
  const formatCurrencyYAxisTick = useMemo(() => {
    return (value: number) => {
      if (value === 0) return '0'
      if (currencyYAxisMaxValue >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`
      } else if (currencyYAxisMaxValue >= 1000000) {
        return `${(value / 1000000).toFixed(0)}M`
      } else if (currencyYAxisMaxValue >= 1000) {
        return `${(value / 1000).toFixed(0)}K`
      }
      return value.toLocaleString()
    }
  }, [currencyYAxisMaxValue])

  // Transform trend data based on selected period
  const trendData = useMemo(() => {
    if (!overviewData?.aumTrend) return []

    const periodData = trendPeriod === "7d"
      ? overviewData.aumTrend.sevenDays
      : overviewData.aumTrend.thirtyDays

    if (!periodData?.dateAxis || !periodData?.values) return []

    return periodData.dateAxis.map((date, index) => {
      const value = periodData.values[index] || 0
      // 确保值不为负，资产不能为负值
      return {
      date: date,
        total: Math.max(0, value),
      }
    })
  }, [overviewData, trendPeriod])

  // 计算Y轴的范围，用于动态格式化和domain设置
  // 强制最小值始终为0，避免曲线掉到X轴下方
  const yAxisRange = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      return { min: 0, max: 0, isValid: false }
    }
    
    // 过滤并确保所有值都是非负数
    const values = trendData
      .map(item => Math.max(0, item.total || 0)) // 确保值不为负
      .filter(v => !isNaN(v) && isFinite(v))
    
    if (values.length === 0) {
      return { min: 0, max: 0, isValid: false }
    }
    
    const maxValue = Math.max(...values)
    
    // 如果最大值为0，设置一个默认范围
    if (maxValue === 0) {
      return { min: 0, max: 1000, isValid: true }
    }
    
    // 最小值始终为0，最大值加上适当的padding
    // 使用15%的padding，确保曲线不会贴边，也不会掉到X轴下方
    const padding = maxValue * 0.15
    
    return {
      min: 0, // 强制最小值为0
      max: maxValue + padding,
      isValid: true
    }
  }, [trendData])

  // Y轴格式化函数，根据最大值动态调整单位
  const formatYAxisTick = useMemo(() => {
    return (value: number) => {
      if (value === 0) return '0'
      const maxValue = yAxisRange.max || 0
      if (maxValue >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`
      } else if (maxValue >= 1000000) {
        return `${(value / 1000000).toFixed(0)}M`
      } else if (maxValue >= 1000) {
        return `${(value / 1000).toFixed(0)}K`
      }
      return value.toLocaleString()
    }
  }, [yAxisRange])

  // Transform top customers
  const topCustomers = overviewData?.topCustomers?.slice(0, 5).map(customer => ({
    id: String(customer.userId),
    name: customer.name,
    email: customer.email,
    avatar: customer.name.charAt(0),
    totalAsset: customer.totalAsset,
    fiatAsset: customer.fiatAsset,
    digitalAsset: customer.digitalAsset,
    change: customer.changePercent,
    riskLevel: "低风险", // 接口未返回风险等级，使用默认值
  })) || []

  // Load customer list data
  const loadCustomerList = useCallback(async (currentPage: number, currentRowsPerPage: number, currentKeyword: string) => {
    try {
      console.log('loadCustomerList: Starting...', { currentPage, currentRowsPerPage, currentKeyword })
      setCustomerListLoading(true)
      setCustomerListError(null)
      const response = await getCustomerList({
        pageNum: currentPage + 1,
        pageSize: currentRowsPerPage,
        keyword: currentKeyword || undefined,
      })
      console.log('loadCustomerList: Response received', response)

      const actualData = response.data
      console.log('loadCustomerList: Actual data', actualData)

      if (!actualData || typeof actualData !== 'object') {
        console.error('loadCustomerList: Invalid data format', actualData)
        setCustomerListError('数据格式错误')
        return
      }

      setCustomerListData(actualData as CustomerListResponse)
    } catch (err: any) {
      console.error('Failed to load customer list:', err)
      const errorMessage = err?.message || err?.toString() || '数据加载失败，请刷新重试'
      setCustomerListError(errorMessage)
    } finally {
      setCustomerListLoading(false)
    }
  }, [])

  // Load customer list when tab changes to "by-customer" or page/search changes
  useEffect(() => {
    if (activeTab === "by-customer") {
      loadCustomerList(page, rowsPerPage, searchKeyword)
    }
  }, [activeTab, page, rowsPerPage, searchKeyword, loadCustomerList])

  // Transform customer list data
  const allCustomers = customerListData?.list?.map(customer => ({
    id: String(customer.userId),
    name: customer.name,
    email: customer.email,
    avatar: customer.name.charAt(0),
    totalAsset: customer.totalAsset,
    fiatAsset: customer.fiatAsset,
    digitalAsset: customer.digitalAsset,
    change: customer.changePercent,
    riskLevel: "低风险", // 接口未返回风险等级，使用默认值
    fiatDetails: customer.fiatDetails || [],
    digitalDetails: customer.digitalDetails || [],
    cardDetails: customer.cardDetails || [],
  })) || []

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(TAB_VALUES[newValue])
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "低风险":
        return "success"
      case "中风险":
        return "warning"
      case "高风险":
        return "error"
      default:
        return "default"
    }
  }


  const renderOverview = () => {
    // Show loading state
    if (loading) {
      return (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex items-center justify-center' style={{ minHeight: '400px' }}>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      )
    }

    // Show error state
    if (error) {
      return (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Alert severity="error">{error}</Alert>
            </CardContent>
          </Card>
        </Grid>
      )
    }

    // Show empty state
    if (!overviewData) {
      return (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Alert severity="info">暂无数据</Alert>
            </CardContent>
          </Card>
        </Grid>
      )
    }

    return (
      <>
        {/* Quick Actions */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='快捷操作'
              action={<OptionsMenu iconButtonProps={{ color: 'default' }} options={['Refresh', 'Export', 'Settings']} />}
            />
            <CardContent>
              <div className='flex gap-4 items-center flex-wrap'>
                <Button
                  variant='contained'
                  startIcon={<i className='ri-refresh-line' />}
                  onClick={() => loadOverviewData()}
                  disabled={loading}
                >
                  刷新数据
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-download-line' />}
                >
                  导出报表
                </Button>
                <div className='ml-auto'>
                  <Typography variant='body2' color='text.secondary' className='font-medium'>
                    最后更新: {lastUpdateTime || "暂无数据"}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Metrics Cards with Images */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
          <CardStatWithImage
            stats={formatCurrency(overviewData.summary.totalAsset)}
            title='总资产管理规模'
            trendNumber={`${Math.abs(overviewData.summary.totalChangePct).toFixed(1)}%`}
            chipColor='primary'
            src='/images/illustrations/characters/9.png'
            chipText='较昨日增长'
            trend={overviewData.summary.totalChangePct > 0 ? 'positive' : overviewData.summary.totalChangePct < 0 ? 'negative' : 'positive'}
            trendColor={
              Math.abs(overviewData.summary.totalChangePct) < 0.05 || overviewData.summary.totalChangePct === 0
                ? 'secondary'
                : overviewData.summary.totalChangePct > 0
                  ? 'success'
                  : 'error'
            }
            showSign={Math.abs(overviewData.summary.totalChangePct) >= 0.05 && overviewData.summary.totalChangePct !== 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
          <CardStatWithImage
            stats={formatCurrency(overviewData.summary.fiatAsset)}
            title='法币资产'
            trendNumber={`${((overviewData.summary.fiatAsset / overviewData.summary.totalAsset) * 100).toFixed(1)}%`}
            chipColor='success'
            src='/images/illustrations/characters/10.png'
            chipText='占比'
            showSign={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
          <CardStatWithImage
            stats={formatCurrency(overviewData.summary.digitalAsset)}
            title='数字资产'
            trendNumber={`${((overviewData.summary.digitalAsset / overviewData.summary.totalAsset) * 100).toFixed(1)}%`}
            chipColor='warning'
            src='/images/illustrations/characters/11.png'
            chipText='占比'
            showSign={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
          <CardStatWithImage
            stats={overviewData.summary.customerCount.toLocaleString()}
            title='客户总数'
            trendNumber={`${overviewData.summary.customerChangePct.toFixed(0)}%`}
            chipColor='info'
            src='/images/illustrations/characters/12.png'
            chipText='较昨日增长'
            showSign={false}
          />
        </Grid>

        {/* Asset Type Distribution */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='资产类型分布'
            />
            <CardContent className='flex items-center justify-center'>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.95} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.75} />
                    </linearGradient>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.95} />
                      <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={assetTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    labelLine={{ strokeWidth: 2 }}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    fill={theme.palette.primary.main}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {assetTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || (index === 0 ? theme.palette.primary.main : theme.palette.success.main)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      border: '1px solid var(--mui-palette-divider)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Distribution */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='币种分布'
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={currencyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={theme.palette.primary.light} stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--mui-palette-divider)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'var(--mui-palette-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatCurrencyYAxisTick}
                    tick={{ fontSize: 11, fill: 'var(--mui-palette-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    domain={[0, currencyYAxisMaxValue]}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      border: '1px solid var(--mui-palette-divider)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                    cursor={{ fill: 'var(--mui-palette-action-hover)' }}
                  />
                  <Bar
                    dataKey="value"
                    maxBarSize={50}
                    shape={(props: any) => {
                      const { payload, x, y, width, height } = props
                      const fillColor = payload.fill || theme.palette.primary.main
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={fillColor}
                          rx={8}
                          ry={8}
                        />
                      )
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Trend */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className='bs-full'>
            <CardHeader
              title='资产趋势'
              subheader='总资产变化'
              action={
                <ToggleButtonGroup
                  value={trendPeriod}
                  exclusive
                  onChange={(_e, value) => value && setTrendPeriod(value)}
                  size='small'
                >
                  <ToggleButton value='7d'>7天</ToggleButton>
                  <ToggleButton value='30d'>30天</ToggleButton>
                </ToggleButtonGroup>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--mui-palette-divider)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--mui-palette-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxisTick}
                    tick={{ fontSize: 11, fill: 'var(--mui-palette-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    domain={yAxisRange.isValid ? [0, yAxisRange.max] : [0, 'auto']}
                    allowDataOverflow={false}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      border: '1px solid var(--mui-palette-divider)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line
                    type="natural"
                    dataKey="total"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2.5}
                    name="总资产"
                    dot={{ fill: theme.palette.primary.main, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  {trendData.length === 0 && (
                    <text x="50%" y="50%" textAnchor="middle" fill={theme.palette.text.secondary}>
                      暂无数据
                    </text>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='资产排名 Top 5'
              subheader='客户资产排行榜'
            // action={
            //   <Button 
            //     variant='contained'
            //     startIcon={<i className='ri-external-link-line' />}
            //     size='small'
            //   >
            //     查看全部
            //   </Button>
            // }
            />
            <CardContent className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>
                      <div className='flex items-center cursor-pointer select-none'>
                        客户
                      </div>
                    </th>
                    <th>
                      <div className='flex items-center cursor-pointer select-none'>
                        总资产
                      </div>
                    </th>
                    <th>
                      <div className='flex items-center cursor-pointer select-none'>
                        法币资产
                      </div>
                    </th>
                    <th>
                      <div className='flex items-center cursor-pointer select-none'>
                        数字资产
                      </div>
                    </th>
                    {/* <th>
                      <div className='flex items-center cursor-pointer select-none'>
                        24h变化
                      </div>
                    </th> */}
                    {/* <th>
                    <div className='flex items-center cursor-pointer select-none'>
                      风险等级
                    </div>
                  </th> */}
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer) => (
                    <tr key={customer.id} className={classnames('hover:bg-actionHover')}>
                      <td>
                        <div className='flex items-center gap-3'>
                          <CustomAvatar skin='light' size={34}>
                            {customer.avatar}
                          </CustomAvatar>
                          <div className='flex flex-col'>
                            <Typography className='font-medium' color='text.primary'>
                              {customer.name}
                            </Typography>
                            <Typography variant='body2'>ID: {customer.id}</Typography>
                            {customer.email && (
                              <Typography variant='body2' color='text.secondary'>
                                {customer.email}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Typography className='font-medium'>
                          {formatCurrency(customer.totalAsset)}
                        </Typography>
                      </td>
                      <td>
                        <Typography className='font-medium'>
                          {formatCurrency(customer.fiatAsset)}
                        </Typography>
                      </td>
                      <td>
                        <Typography className='font-medium'>
                          {formatCurrency(customer.digitalAsset)}
                        </Typography>
                      </td>
                      {/* <td>
                        <div className='flex items-center gap-1'>
                          {customer.change > 0 ? (
                            <i className='ri-trending-up-line text-success' />
                          ) : (
                            <i className='ri-trending-down-line text-error' />
                          )}
                          <Typography
                            color={customer.change > 0 ? 'success.main' : 'error.main'}
                            className='font-medium'
                          >
                            {customer.change.toFixed(2)}%
                          </Typography>
                        </div>
                      </td> */}
                      {/* <td>
                      <Chip
                        label={customer.riskLevel}
                        color={getRiskColor(customer.riskLevel) as any}
                        size='small'
                        variant='tonal'
                      />
                    </td> */}
                      <td>
                        <div className='flex items-center'>
                          <IconButton
                            size='small'
                            onClick={() =>{
                              setShowCustomerDetail(customer.id)
                            }}
                          >
                            <i className='ri-eye-line text-textSecondary' />
                          </IconButton>
                          {/* <OptionsMenu
                            iconButtonProps={{ size: 'small' }}
                            iconClassName='text-textSecondary'
                            options={[
                              {
                                text: '查看详情',
                                icon: 'ri-eye-line',
                                menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                              },
                              {
                                text: '编辑信息',
                                icon: 'ri-edit-line',
                                menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                              }
                            ]}
                          /> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Grid>
      </>
    )
  }

  // 处理搜索按钮点击
  const handleSearch = () => {
    setSearchKeyword(searchInput)
    setPage(0) // 搜索时重置到第一页
  }

  // 处理重置按钮点击
  const handleReset = () => {
    setSearchInput("")
    setSearchKeyword("")
    setPage(0)
  }

  const renderByCustomer = () => {
    if (customerListLoading) {
      return (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex items-center justify-center' style={{ minHeight: '400px' }}>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      )
    }

    if (customerListError) {
      return (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Alert severity="error">{customerListError}</Alert>
            </CardContent>
          </Card>
        </Grid>
      )
    }

    return (
      <>
        {/* Customer List */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='客户资产列表'
              subheader='按客户查看资产详情'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='ri-download-line' />}
                  size='small'
                >
                  导出数据
                </Button>
              }
            />
            <CardContent>
              {/* Search Bar */}
              <div className='flex items-center gap-3 mbe-4'>
                <TextField
                  placeholder='搜索客户（姓名、邮箱、ID）'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  size='small'
                  sx={{ width: '400px', maxWidth: '100%' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <i className='ri-search-line' />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchInput("")}
                        >
                          <i className='ri-close-line' />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant='contained'
                  startIcon={<i className='ri-search-line' />}
                  onClick={handleSearch}
                  disabled={customerListLoading}
                >
                  搜索
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-restart-line' />}
                  onClick={handleReset}
                  disabled={customerListLoading}
                >
                  重置
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-refresh-line' />}
                  onClick={() => loadCustomerList(page, rowsPerPage, searchKeyword)}
                  disabled={customerListLoading}
                  sx={{ ml: 'auto' }}
                >
                  刷新
                </Button>
              </div>
            </CardContent>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th className='text-center' style={{ width: '50px' }}></th>
                    <th className='text-left'>客户</th>
                    <th className='text-left'>总资产</th>
                    <th className='text-left'>法币资产</th>
                    <th className='text-left'>数字资产</th>
                    {/* <th className='text-left'>24h变化</th> */}
                    {/* <th className='text-left'>风险等级</th> */}
                    <th className='text-center'>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {allCustomers.map((customer) => {
                    const isExpanded = selectedCustomerId === customer.id
                    const detailData = expandedCustomerDetails[customer.id]
                    
                    return (
                      <React.Fragment key={customer.id}>
                        <tr
                          className={classnames(
                            'hover:bg-actionHover',
                            { 'bg-actionSelected': isExpanded }
                          )}
                        >
                      {/* 展开/收起箭头列 */}
                      <td className='text-center' onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size='small'
                          onClick={() => handleCustomerRowClick(customer.id)}
                        >
                          <i className={isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                        </IconButton>
                      </td>
                      <td>
                        <div className='flex items-center gap-3'>
                          <CustomAvatar skin='light' size={34}>
                            {customer.avatar}
                          </CustomAvatar>
                          <div className='flex flex-col'>
                            <Typography className='font-medium' color='text.primary'>
                              {customer.name}
                            </Typography>
                            <Typography variant='body2'>ID: {customer.id}</Typography>
                            {customer.email && (
                              <Typography variant='body2' color='text.secondary'>
                                {customer.email}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Typography className='font-medium'>
                          {formatCurrency(customer.totalAsset)}
                        </Typography>
                      </td>
                      <td>
                        <Typography className='font-medium'>
                          {formatCurrency(customer.fiatAsset)}
                        </Typography>
                      </td>
                      <td>
                        <Typography className='font-medium'>
                          {formatCurrency(customer.digitalAsset)}
                        </Typography>
                      </td>
                      {/* <td>
                        <div className='flex items-center gap-1'>
                          {customer.change > 0 ? (
                            <i className='ri-trending-up-line text-success' />
                          ) : (
                            <i className='ri-trending-down-line text-error' />
                          )}
                          <Typography
                            color={customer.change > 0 ? 'success.main' : 'error.main'}
                            className='font-medium'
                          >
                            {customer.change.toFixed(2)}%
                          </Typography>
                        </div>
                      </td> */}
                      {/* <td>
                      <Chip
                        label={customer.riskLevel}
                        color={getRiskColor(customer.riskLevel) as any}
                        size='small'
                        variant='tonal'
                      />
                    </td> */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className='flex items-center justify-center gap-1'>
                          <IconButton
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowCustomerDetail(customer.id)
                              setCustomerName(customer.name)
                            }}
                          >
                            <i className='ri-eye-line text-textSecondary' />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${customer.id}-detail`}>
                        <td colSpan={7} className='p-0'>
                          <div className='p-4 bg-actionHover'>
                            {detailData?.loading ? (
                              <div className='flex items-center justify-center py-8'>
                                <CircularProgress size={24} />
                                <Typography variant='body2' className='ml-3'>
                                  加载中...
                                </Typography>
                              </div>
                            ) : detailData?.error ? (
                              <Alert severity='error'>{detailData.error}</Alert>
                            ) : (
                              <Grid container spacing={3}>
                                {/* 左侧：法币资产明细和卡片详情 */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <div className='flex flex-col gap-3'>
                                    {/* 法币资产明细 */}
                                    <Card className='bs-full'>
                                      <CardHeader
                                        title={
                                          <div className='flex items-center gap-2'>
                                            <i className='ri-bank-line text-primary' />
                                            <Typography variant='h6' className='font-semibold'>
                                              法币资产明细
                                            </Typography>
                                          </div>
                                        }
                                        className='pbe-2'
                                      />
                                      <CardContent>
                                        {detailData?.fiatAssets && detailData.fiatAssets.length > 0 ? (
                                          <div className='overflow-x-auto'>
                                            <table className={tableStyles.table}>
                                              <thead>
                                                <tr>
                                                  <th>币种</th>
                                                  <th className='text-right'>余额</th>
                                                  <th className='text-right'>估值(USD)</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {detailData.fiatAssets.map((asset: any, idx: number) => (
                                                  <tr key={idx} className='hover:bg-actionHover'>
                                                    <td>
                                                      <Chip 
                                                        label={asset.currency} 
                                                        size='small' 
                                                        variant='tonal'
                                                        color='success'
                                                      />
                                                    </td>
                                                    <td className='text-right font-mono'>
                                                      {asset.available?.toLocaleString('en-US', { 
                                                        minimumFractionDigits: 2, 
                                                        maximumFractionDigits: 2 
                                                      }) || '0.00'}
                                                    </td>
                                                    <td className='text-right font-mono font-semibold'>
                                                      {formatCurrency(asset.valueUsd || 0)}
                                                    </td>
                                                  </tr>
                                                ))}
                                                <tr className='font-semibold border-t border-divider'>
                                                  <td>合计</td>
                                                  <td></td>
                                                  <td className='text-right font-mono font-semibold text-primary'>
                                                    {formatCurrency(
                                                      detailData.fiatAssets.reduce((sum: number, asset: any) => 
                                                        sum + (asset.valueUsd || 0), 0
                                                      )
                                                    )}
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <div className='flex items-center justify-center py-8'>
                                            <Typography variant='body2' color='text.secondary'>
                                              <i className='ri-inbox-line mie-2' />
                                              暂无法币资产
                                            </Typography>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>

                                    {/* 卡片详情 */}
                                    <Card className='bs-full'>
                                      <CardHeader
                                        title={
                                          <div className='flex items-center gap-2'>
                                            <i className='ri-bank-card-line text-warning' />
                                            <Typography variant='h6' className='font-semibold'>
                                              卡片详情
                                            </Typography>
                                          </div>
                                        }
                                        className='pbe-2'
                                      />
                                      <CardContent>
                                        {detailData?.cardAssets && detailData.cardAssets.length > 0 ? (
                                          <div className='overflow-x-auto'>
                                            <table className={tableStyles.table}>
                                              <thead>
                                                <tr>
                                                  <th>币种</th>
                                                  <th className='text-right'>卡片金额</th>
                                                  <th className='text-right'>估值(USD)</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {detailData.cardAssets.map((asset: any, idx: number) => (
                                                  <tr key={idx} className='hover:bg-actionHover'>
                                                    <td>
                                                      <Chip 
                                                        label={asset.currency} 
                                                        size='small' 
                                                        variant='tonal'
                                                        color='warning'
                                                      />
                                                    </td>
                                                    <td className='text-right font-mono'>
                                                      {asset.cardAmount?.toLocaleString('en-US', { 
                                                        minimumFractionDigits: 2, 
                                                        maximumFractionDigits: 2 
                                                      }) || '0.00'}
                                                    </td>
                                                    <td className='text-right font-mono font-semibold'>
                                                      {formatCurrency(asset.valueUsd || 0)}
                                                    </td>
                                                  </tr>
                                                ))}
                                                <tr className='font-semibold border-t border-divider'>
                                                  <td>合计</td>
                                                  <td></td>
                                                  <td className='text-right font-mono font-semibold text-warning'>
                                                    {formatCurrency(
                                                      detailData.cardAssets.reduce((sum: number, asset: any) => 
                                                        sum + (asset.valueUsd || 0), 0
                                                      )
                                                    )}
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <div className='flex items-center justify-center py-8'>
                                            <Typography variant='body2' color='text.secondary'>
                                              <i className='ri-inbox-line mie-2' />
                                              暂无卡片数据
                                            </Typography>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>
                                </Grid>

                                {/* 右侧：数字资产明细 */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <Card className='bs-full'>
                                    <CardHeader
                                      title={
                                        <div className='flex items-center gap-2'>
                                          <i className='ri-coin-line text-info' />
                                          <Typography variant='h6' className='font-semibold'>
                                            数字资产明细
                                          </Typography>
                                        </div>
                                      }
                                      className='pbe-2'
                                    />
                                    <CardContent>
                                      {detailData?.digitalAssets && detailData.digitalAssets.length > 0 ? (
                                        <div className='overflow-x-auto'>
                                          <table className={tableStyles.table}>
                                            <thead>
                                              <tr>
                                                <th>币种-链</th>
                                                <th className='text-right'>数量</th>
                                                <th className='text-right'>估值(USD)</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {detailData.digitalAssets.map((asset: any, idx: number) => (
                                                <tr key={idx} className='hover:bg-actionHover'>
                                                  <td>
                                                    <Chip 
                                                      label={asset.coinKey || asset.symbol} 
                                                      size='small' 
                                                      variant='tonal'
                                                      color='info'
                                                    />
                                                  </td>
                                                  <td className='text-right font-mono'>
                                                    {asset.balance?.toLocaleString('en-US', { 
                                                      minimumFractionDigits: 4, 
                                                      maximumFractionDigits: 8 
                                                    }) || '0.00'}
                                                  </td>
                                                  <td className='text-right font-mono font-semibold'>
                                                    {formatCurrency(asset.valueUsd || 0)}
                                                  </td>
                                                </tr>
                                              ))}
                                              <tr className='font-semibold border-t border-divider'>
                                                <td>合计</td>
                                                <td></td>
                                                <td className='text-right font-mono font-semibold text-info'>
                                                  {formatCurrency(
                                                    detailData.digitalAssets.reduce((sum: number, asset: any) => 
                                                      sum + (asset.valueUsd || 0), 0
                                                    )
                                                  )}
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </div>
                                      ) : (
                                        <div className='flex items-center justify-center py-8'>
                                          <Typography variant='body2' color='text.secondary'>
                                            <i className='ri-inbox-line mie-2' />
                                            暂无数字资产
                                          </Typography>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  )
                  })}
                </tbody>
              </table>
            </div>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component='div'
              className='border-bs'
              count={customerListData?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => {
                setPage(newPage)
              }}
              onRowsPerPageChange={(e) => {
                const newRowsPerPage = parseInt(e.target.value, 10)
                setRowsPerPage(newRowsPerPage)
                setPage(0)
              }}
            />
          </Card>
        </Grid>
      </>
    )
  }
  // 如果显示客户详情，则渲染客户详情组件
  if (showCustomerDetail) {
    return (
      <CustomerAssetDetail
        customerId={showCustomerDetail}
        customerName={customerName}
        onBack={() => {
          setShowCustomerDetail(null)
          setCustomerName(null)
        }}
      />
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Page Header */}
      <Grid size={{ xs: 12 }}>
        <div>
          <Typography variant='h4' className='font-semibold text-textPrimary mbe-1'>
            资产中心
          </Typography>
          <Typography color='text.secondary'>
            全面管理客户资产，实时监控资产分布和变化趋势
          </Typography>
        </div>
      </Grid>

      {/* Tabs */}
      <Grid size={{ xs: 12 }}>
        <Card
          sx={{
            borderRadius: 0,
            boxShadow: 'none'
          }}
        >
          <Tabs
            value={TAB_VALUES.indexOf(activeTab)}
            onChange={handleTabChange}
            className='border-be'
            sx={{
              minHeight: 64,
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
                py: 3,
                px: 5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.02em',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                height: 3
              }
            }}
          >
            <Tab
              icon={<i className='ri-dashboard-3-line text-xl' />}
              iconPosition='start'
              label='资产总览'
            />
            <Tab
              icon={<i className='ri-team-line text-xl' />}
              iconPosition='start'
              label='按客户查看'
            />
          </Tabs>
        </Card>
      </Grid>

      {activeTab === "overview" && renderOverview()}
      {activeTab === "by-customer" && renderByCustomer()}
    </Grid>
  )
}
