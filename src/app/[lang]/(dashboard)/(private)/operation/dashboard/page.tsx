"use client"

import { useState, useEffect } from "react"

// Third-party Imports
import classnames from 'classnames'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import { useTheme } from '@mui/material/styles'

// Component Imports
import CardStatWithImage from '@components/card-statistics/Character'
import CardStatVertical from '@components/card-statistics/Vertical'
import CardStatWithChart from '@components/card-statistics/CardStatWithChart'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'
import Link from "next/link"

// Server Imports
import { 
  getDashboardOverview, 
  type DashboardOverviewResponse,
  type TrendCard,
  type TodoItem,
  type RecentActivity
} from '@server/operationDashboard'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

export default function OverviewPage() {
  const [trendPeriod, setTrendPeriod] = useState<"7d" | "30d">("7d")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overviewData, setOverviewData] = useState<DashboardOverviewResponse | null>(null)
  const theme = useTheme()

  // 加载概览数据
  const loadOverviewData = async (range: "7d" | "30d") => {
    try {
      setLoading(true)
      setError(null)
      const response = await getDashboardOverview(range)
      
      // 从 ServerResponse 中提取数据
      let actualData: any = response.data
      
      // 处理嵌套的 data 结构
      if (actualData && typeof actualData === 'object' && 'data' in actualData) {
        actualData = actualData.data
      }
      
      // 确保数据结构完整，添加默认值
      const safeData: DashboardOverviewResponse = {
        trendCards: (actualData as DashboardOverviewResponse)?.trendCards || [],
        assetPie: (actualData as DashboardOverviewResponse)?.assetPie || { totalAmount: 0, items: [] },
        aumTrend: (actualData as DashboardOverviewResponse)?.aumTrend || { 
          unit: 'USD', 
          today: 0, 
          monthlyChange: 0, 
          sevenDays: { dateAxis: [], values: [] },
          thirtyDays: { dateAxis: [], values: [] }
        },
        todoList: (actualData as DashboardOverviewResponse)?.todoList || [],
        recentActivities: (actualData as DashboardOverviewResponse)?.recentActivities || [],
        currencyBars: (actualData as DashboardOverviewResponse)?.currencyBars || []
      }
      
      setOverviewData(safeData)
    } catch (err) {
      console.error('Failed to load dashboard overview:', err)
      setError('数据加载失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  // 只在初始加载时请求数据，切换7天/30天不再重新请求
  useEffect(() => {
    loadOverviewData("7d")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 格式化货币
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }

  // 格式化百分比 - 数据已经包含 + - 符号，不需要再添加
  const formatPercent = (value: number | string) => {
    // 如果已经是字符串且包含 %，需要提取数字并重新格式化
    if (typeof value === 'string' && value.includes('%')) {
      const numValue = parseFloat(value.replace('%', '').trim())
      if (!isNaN(numValue)) {
        return `${numValue.toFixed(2)}%`
      }
      return value
    }
    // 如果是数字，格式化为字符串，不添加 + 号（数据会提供符号）
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return `${numValue.toFixed(2)}%`
  }

  // 格式化完整金额 - 不截取，显示所有小数位
  const formatFullAmount = (value: number | string | undefined | null) => {
    if (value === undefined || value === null) return '$0'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return '$0'
    // 使用 toLocaleString 保留所有小数位
    return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 20 })}`
  }

  // 转换趋势卡片数据为图表格式
  const transformTrendCardToChartData = (card: TrendCard) => {
    return {
      categories: card.dateAxis || [],
      series: card.values || []
    }
  }

  // 获取状态颜色和图标 - 明确区分成功和失败
  const getStatusColorAndIcon = (status: string | undefined, statusTag: string | undefined) => {
    const statusLower = (status || '').toLowerCase()
    const tagLower = (statusTag || '').toLowerCase()
    
    // 成功状态 - 绿色
    if (statusLower.includes('完成') || statusLower.includes('已确认') || statusLower.includes('成功') || 
        tagLower.includes('success') || tagLower.includes('completed') || tagLower.includes('成功')) {
      return { color: 'success' as const, icon: 'ri-check-line' }
    }
    
    // 失败状态 - 红色
    if (statusLower.includes('失败') || statusLower.includes('错误') || statusLower.includes('拒绝') ||
        tagLower.includes('error') || tagLower.includes('failed') || tagLower.includes('rejected') || tagLower.includes('失败')) {
      return { color: 'error' as const, icon: 'ri-error-warning-line' }
    }
    
    // 待处理/审批状态 - 橙色/警告色
    if (statusLower.includes('审批') || statusLower.includes('待处理') || statusLower.includes('处理中') ||
        tagLower.includes('pending') || tagLower.includes('warning') || tagLower.includes('processing')) {
      return { color: 'warning' as const, icon: 'ri-time-line' }
    }
    
    // 认领状态 - 紫色/次要色
    if (statusLower.includes('认领') || tagLower.includes('claim')) {
      return { color: 'secondary' as const, icon: 'ri-mail-line' }
    }
    
    // 其他状态 - 蓝色/主要色
    return { color: 'primary' as const, icon: 'ri-file-check-line' }
  }

  // 获取类型颜色
  const getTypeColor = (type: string | undefined, color?: string) => {
    // 如果接口返回了颜色，优先使用
    if (color) return color
    
    if (!type) return 'primary'
    const typeLower = type.toLowerCase()
    
    // 法币转入
    if (type.includes('入金') || type.includes('转入') || typeLower.includes('deposit') || typeLower.includes('in')) {
      return 'success'
    }
    // 法币转出
    if (type.includes('出金') || type.includes('转出') || typeLower.includes('withdraw') || typeLower.includes('out')) {
      return 'warning'
    }
    // 兑换
    if (type.includes('兑换') || typeLower.includes('exchange') || typeLower.includes('swap')) {
      return 'info'
    }
    // 理财
    if (type.includes('理财') || typeLower.includes('product') || typeLower.includes('investment')) {
      return 'primary'
    }
    
    return 'primary'
  }

  // 获取待办事项链接
  const getTodoLink = (type: string | undefined) => {
    if (!type) return '#'
    const typeLower = type.toLowerCase()
    if (typeLower.includes('认领') || typeLower.includes('claim')) {
      return '/operation/fiatAssets?tab=deposits'
    }
    if (typeLower.includes('审批') || typeLower.includes('approval')) {
      return '/operation/fiatAssets?tab=withdrawals'
    }
    if (typeLower.includes('理财') || typeLower.includes('product')) {
      return '/operation/financialProducts?tab=orders'
    }
    if (typeLower.includes('卡') || typeLower.includes('card')) {
      return '/operation/creditCard'
    }
    return '#'
  }

  // 获取待办事项图标
  const getTodoIcon = (type: string | undefined) => {
    if (!type) return 'ri-file-list-line'
    const typeLower = type.toLowerCase()
    // 入账认领 - warning (橙色) - 使用 ri-time-line (Schedule)
    if (typeLower.includes('认领') || typeLower.includes('claim') || typeLower === 'inbound') {
      return 'ri-time-line'
    }
    // 出金审批 - primary (蓝色) - 使用 ri-check-line (CheckCircle)
    if (typeLower.includes('审批') || typeLower.includes('approval') || typeLower === 'withdraw') {
      return 'ri-check-line'
    }
    // 理财订单 - success (绿色) - 使用 ri-bar-chart-line (Assessment)
    if (typeLower.includes('理财') || typeLower.includes('product') || typeLower.includes('investment')) {
      return 'ri-bar-chart-line'
    }
    // 卡异常 - error (红色) - 使用 ri-error-warning-line (ErrorIcon)
    if (typeLower.includes('卡') || typeLower.includes('card')) {
      return 'ri-error-warning-line'
    }
    return 'ri-file-list-line'
  }

  // 将十六进制颜色转换为 MUI 颜色名称
  const hexToMuiColor = (hexColor: string | undefined, type: string | undefined): string => {
    if (!hexColor) {
      // 如果没有颜色，根据类型返回默认颜色
      if (!type) return 'primary'
      const typeLower = type.toLowerCase()
      if (typeLower === 'inbound') return 'warning'      // 入账认领 - warning
      if (typeLower === 'withdraw') return 'primary'     // 出金审批 - primary
      if (typeLower.includes('product') || typeLower.includes('investment')) return 'success'  // 理财订单 - success
      if (typeLower.includes('card')) return 'error'     // 卡异常 - error
      return 'primary'
    }
    
    // 将十六进制颜色映射到 MUI 颜色名称
    const colorMap: Record<string, string> = {
      '#FFB400': 'warning',      // 橙色 - 入账认领
      '#7CDB86': 'primary',      // 绿色 - 出金审批（根据参考代码，出金审批是 primary）
      '#1976d2': 'primary',      // 蓝色 - 出金审批
      '#55D187': 'success',      // 绿色 - 理财订单
      '#d32f2f': 'error',        // 红色 - 卡异常
    }
    
    // 如果颜色在映射表中，返回对应的 MUI 颜色
    const upperHex = hexColor.toUpperCase()
    if (colorMap[upperHex]) {
      return colorMap[upperHex]
    }
    
    // 根据类型返回默认颜色
    if (!type) return 'primary'
    const typeLower = type.toLowerCase()
    if (typeLower === 'inbound') return 'warning'
    if (typeLower === 'withdraw') return 'primary'
    return 'primary'
  }

  // 如果没有数据，显示加载或错误状态
  if (loading && !overviewData) {
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

  if (error && !overviewData) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      </Grid>
    )
  }

  if (!overviewData) {
    return null
  }

  // 转换数据（添加安全检查）
  const assetDistributionData = (overviewData.assetPie?.items || []).map(item => ({
    name: item.label,
    value: item.percent,
    amount: item.amount,
    color: item.color || (item.category === '法币' ? theme.palette.primary.main : theme.palette.success.main)
  }))

  const totalAssets = overviewData.assetPie?.totalAmount || 0

  const currencyDistributionData = (overviewData.currencyBars || []).map(bar => ({
    name: bar.currency,
    value: bar.amount,
    percent: bar.percent,
    color: bar.color || theme.palette.primary.main
  }))

  // AUM 趋势数据 - 根据 trendPeriod 选择对应的数据
  const aumTrendPeriod = trendPeriod === "7d" 
    ? (overviewData.aumTrend?.sevenDays || { dateAxis: [], values: [] })
    : (overviewData.aumTrend?.thirtyDays || { dateAxis: [], values: [] })
  
  // 30天时减少标签显示，避免过于密集
  const processCategories = (categories: string[]) => {
    if (trendPeriod === "30d" && categories.length > 8) {
      const step = Math.ceil(categories.length / 8)
      return categories.map((cat, index) => {
        // 显示第一个、最后一个，以及每隔step个显示
        if (index === 0 || index === categories.length - 1 || index % step === 0) {
          return cat
        }
        return ''
      })
    }
    return categories
  }
  
  const aumTrendData = {
    categories: processCategories(aumTrendPeriod.dateAxis || []),
    series: aumTrendPeriod.values || []
  }

  // 趋势卡片数据（最多4个）
  const trendCards = (overviewData.trendCards || []).slice(0, 4)
  const hkdTrendCard = trendCards.find(card => card.assetKey === 'HKD' || (card.title && card.title.includes('HKD')))
  const usdTrendCard = trendCards.find(card => card.assetKey === 'USD' || (card.title && card.title.includes('USD')))
  const usdtTrendCard = trendCards.find(card => card.assetKey === 'USDT' || (card.title && card.title.includes('USDT')))
  const digitalAssetTrendCard = trendCards.find(card => card.assetKey === 'DIGITAL' || (card.title && card.title.includes('数字')))

  const hkdTrendData = hkdTrendCard ? transformTrendCardToChartData(hkdTrendCard) : { categories: [], series: [] }
  const usdTrendData = usdTrendCard ? transformTrendCardToChartData(usdTrendCard) : { categories: [], series: [] }
  const usdtTrendData = usdtTrendCard ? transformTrendCardToChartData(usdtTrendCard) : { categories: [], series: [] }
  const digitalAssetTrendData = digitalAssetTrendCard ? transformTrendCardToChartData(digitalAssetTrendCard) : { categories: [], series: [] }

  return (
    <Grid container spacing={6}>
      {/* Key Metrics Cards with Images */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
        <CardStatWithImage
          stats='$2.85B'
          title='资产管理规模 (AUM)'
          trendNumber='12.5%'
          chipColor='primary'
          src='/images/illustrations/characters/9.png'
          chipText='较上月增长'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
        <CardStatWithImage
          stats='$8.42M'
          title='今日净流入'
          trendNumber='15.8%'
          chipColor='success'
          src='/images/illustrations/characters/10.png'
          chipText='入金 $12.3M'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
        <CardStatWithImage
          stats='1,284'
          title='活跃客户'
          trendNumber='8.2%'
          chipColor='info'
          src='/images/illustrations/characters/11.png'
          chipText='本月新增 47'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
        <CardStatWithImage
          stats='28'
          title='待办事项'
          trendNumber='5'
          trend='negative'
          chipColor='warning'
          src='/images/illustrations/characters/12.png'
          chipText='需要处理'
        />
      </Grid> */}

      {/* Quick Actions */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='快捷操作'
            action={<OptionsMenu iconButtonProps={{ color: 'default' }} options={['Today', 'This Week', 'This Month']} />}
          />
          <CardContent>
            <Grid container spacing={4}>
              {[
                { href: "/operation/fiatAssets", icon: "ri-bank-line", text: "法币资产管理", color: "primary" },
                { href: "/operation/digitalAssets", icon: "ri-exchange-line", text: "数字资产管理", color: "success" },
                { href: "/operation/financialProducts", icon: "ri-bar-chart-line", text: "理财产品", color: "info" },
                { href: "/operation/clients", icon: "ri-bank-card-line", text: "客户管理", color: "warning" }
            ].map((item, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Link href={item.href} className='block'>
                    <div className='flex items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-md hover:border-primary transition-all cursor-pointer'>
                      <div className='flex items-center gap-4'>
                        <CustomAvatar color={item.color as any} skin='light' variant='rounded' size={48}>
                          <i className={item.icon} />
                        </CustomAvatar>
                        <div className='flex flex-col'>
                          <Typography className='font-medium'>{item.text}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            查看详情
                          </Typography>
                        </div>
                      </div>
                      <i className='ri-arrow-right-s-line text-xl text-textSecondary' />
                    </div>
                  </Link>
                </Grid>
              ))}
            </Grid>
            </CardContent>
          </Card>
        </Grid>

      {/* Currency Stats Cards with Charts */}
      {hkdTrendCard && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardStatWithChart
            stats={formatCurrency(hkdTrendCard.amount)}
            title={hkdTrendCard.title || 'HKD 资产'}
            subtitle={hkdTrendCard.desc || '港币资产总额'}
            trendNumber={formatPercent(hkdTrendCard.changePercent)}
            trend={hkdTrendCard.changePercent >= 0 ? 'positive' : 'negative'}
            chartData={hkdTrendData}
            chartType='line'
            chartColor={theme.palette.success.main}
          />
        </Grid>
      )}
      {usdTrendCard && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardStatWithChart
            stats={formatCurrency(usdTrendCard.amount)}
            title={usdTrendCard.title || 'USD 资产'}
            subtitle={usdTrendCard.desc || '美元资产总额'}
            trendNumber={formatPercent(usdTrendCard.changePercent)}
            trend={usdTrendCard.changePercent >= 0 ? 'positive' : 'negative'}
            chartData={usdTrendData}
            chartType='line'
            chartColor={theme.palette.info.main}
          />
        </Grid>
      )}
      {usdtTrendCard && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardStatWithChart
            stats={formatCurrency(usdtTrendCard.amount)}
            title={usdtTrendCard.title || 'USDT-ERC20 资产'}
            subtitle={usdtTrendCard.desc || 'USDT-ERC20 总额'}
            trendNumber={formatPercent(usdtTrendCard.changePercent)}
            trend={usdtTrendCard.changePercent >= 0 ? 'positive' : 'negative'}
            chartData={usdtTrendData}
            chartType='line'
            chartColor={theme.palette.primary.main}
          />
        </Grid>
      )}
      {digitalAssetTrendCard && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardStatWithChart
            stats={formatCurrency(digitalAssetTrendCard.amount)}
            title={digitalAssetTrendCard.title || '数字资产'}
            subtitle={digitalAssetTrendCard.desc || '加密货币总额'}
            trendNumber={formatPercent(digitalAssetTrendCard.changePercent)}
            trend={digitalAssetTrendCard.changePercent >= 0 ? 'positive' : 'negative'}
            chartData={digitalAssetTrendData}
            chartType='line'
            chartColor={theme.palette.warning.main}
          />
        </Grid>
      )}

      {/* Asset Distribution Overview - Donut Chart */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card className='bs-full'>
          <CardHeader
            title='资产分布概览'
          />
          <CardContent className='flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <Typography variant='h4'>{formatCurrency(totalAssets)}</Typography>
                <Typography>总资产规模</Typography>
              </div>
              <AppReactApexCharts 
                type='donut' 
                width={150} 
                height={150} 
                options={{
                  chart: {
                    sparkline: { enabled: true },
                    animations: {
                      enabled: true,
                      speed: 800,
                      animateGradually: {
                        enabled: true,
                        delay: 150
                      }
                    },
                    dropShadow: {
                      enabled: true,
                      top: 2,
                      left: 0,
                      blur: 4,
                      opacity: 0.15
                    }
                  },
                  stroke: {
                    width: 0
                  },
                  labels: assetDistributionData.map(item => item.name),
                  colors: assetDistributionData.map(item => item.color),
                  legend: { show: false },
                  dataLabels: {
                    enabled: true,
                    formatter: (val: number) => `${val.toFixed(2)}%`,
                    style: {
                      fontSize: '11px',
                      fontWeight: 600,
                      colors: ['#fff']
                    },
                    dropShadow: {
                      enabled: false
                    }
                  },
                  states: {
                    hover: {
                      filter: {
                        type: 'lighten',
                        value: 0.05
                      }
                    },
                    active: {
                      filter: {
                        type: 'darken',
                        value: 0.05
                      }
                    }
                  },
                  plotOptions: {
                    pie: {
                      expandOnClick: true,
                      customScale: 0.98,
                      donut: {
                        size: '68%',
                        labels: {
                          show: true,
                          name: {
                            offsetY: 22,
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--mui-palette-text-secondary)'
                          },
                          value: {
                            offsetY: -18,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            formatter: (value: string) => `${value}%`,
                            color: 'var(--mui-palette-text-primary)'
                          },
                          total: {
                            show: true,
                            showAlways: true,
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            label: '总资产',
                            formatter: () => '100%',
                            color: 'var(--mui-palette-text-disabled)'
                          }
                        }
                      }
                    }
                  },
                  tooltip: {
                    enabled: true,
                    y: {
                      formatter: (value: number, opts?: any) => {
                        const item = assetDistributionData[opts?.seriesIndex || 0]
                        return formatCurrency(item.amount)
                      }
                    }
                  }
                } as ApexOptions}
                series={assetDistributionData.map(item => item.value)}
              />
            </div>
            <div className='flex flex-col gap-5'>
              {assetDistributionData.map((item, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <CustomAvatar skin='light' variant='rounded' color={index === 0 ? 'primary' : 'success'} size={40}>
                    <i className={index === 0 ? 'ri-bank-line' : 'ri-exchange-line'} />
                  </CustomAvatar>
                  <div className='flex justify-between items-center is-full'>
                    <div className='flex flex-col gap-0.5'>
                      <Typography className='font-medium' color='text.primary'>
                        {item.name}
                      </Typography>
                      <Typography variant='body2'>{item.value.toFixed(2)}%</Typography>
                    </div>
                    <Typography className='font-medium' color='text.primary'>
                      {formatCurrency(item.amount)}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* AUM Trend Chart - Area Chart */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card className='bs-full'>
          <CardHeader
            title='AUM 趋势'
            subheader='总资产管理规模变化'
          />
          <CardContent>
            <AppReactApexCharts
              type='area'
              height={240}
              width='100%'
              options={{
                chart: {
                  parentHeightOffset: 0,
                  toolbar: { show: false },
                  animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                  },
                  dropShadow: {
                    enabled: true,
                    top: 12,
                    left: 0,
                    blur: 3,
                    color: theme.palette.primary.main,
                    opacity: 0.12
                  }
                },
                tooltip: {
                  shared: false,
                  y: {
                    formatter: (value) => formatCurrency(value)
                  },
                  style: {
                    fontSize: '12px'
                  }
                },
                dataLabels: { enabled: false },
                stroke: {
                  show: true,
                  curve: 'smooth',
                  width: 3,
                  lineCap: 'round'
                },
                legend: { show: false },
                grid: {
                  strokeDashArray: 6,
                  borderColor: 'var(--mui-palette-divider)',
                  xaxis: {
                    lines: { show: true }
                  },
                  yaxis: {
                    lines: { show: false }
                  },
                  padding: {
                    top: -18,
                    left: 10,
                    right: 12,
                    bottom: 0
                  }
                },
                fill: {
                  type: 'gradient',
                  gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.5,
                    gradientToColors: [theme.palette.primary.light],
                    inverseColors: false,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                    stops: [0, 85, 100]
                  }
                },
                colors: [theme.palette.primary.main],
                markers: {
                  size: 0,
                  hover: {
                    size: 5,
                    sizeOffset: 3
                  }
                },
                xaxis: {
                  categories: aumTrendData.categories,
                  labels: {
                    style: {
                      colors: 'var(--mui-palette-text-secondary)',
                      fontSize: '13px',
                      fontWeight: 400
                    },
                    // 30天时旋转标签，避免重叠
                    rotate: trendPeriod === "30d" ? -45 : 0,
                    rotateAlways: trendPeriod === "30d",
                    // 隐藏空字符串标签
                    formatter: (value: string) => value || ''
                  },
                  axisTicks: { show: false },
                  axisBorder: { show: false },
                  tooltip: {
                    enabled: false
                  }
                },
                yaxis: {
                  labels: {
                    formatter: (value) => {
                      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      return `${(value / 1000).toFixed(1)}K`
                    },
                    style: {
                      colors: 'var(--mui-palette-text-secondary)',
                      fontSize: '13px',
                      fontWeight: 400
                    }
                  }
                },
                states: {
                  hover: {
                    filter: {
                      type: 'lighten',
                      value: 0.05
                    }
                  },
                  active: {
                    filter: {
                      type: 'none'
                    }
                  }
                }
              } as ApexOptions}
              series={[{ name: 'AUM', data: aumTrendData.series }]}
            />
            <div className='flex items-center justify-around mbs-4'>
              <div className='flex items-center gap-3'>
                <CustomAvatar skin='light' color='primary' variant='rounded' size={38}>
                  <i className='ri-trending-up-line text-xl' />
                </CustomAvatar>
                <div className='flex flex-col'>
                  <Typography className='font-medium' color='text.primary'>
                    {formatCurrency(overviewData.aumTrend?.today || 0)}
                  </Typography>
                  <Typography variant='body2'>当前 AUM</Typography>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <CustomAvatar skin='light' color={(overviewData.aumTrend?.monthlyChange || 0) >= 0 ? 'success' : 'error'} variant='rounded' size={38}>
                  <i className={(overviewData.aumTrend?.monthlyChange || 0) >= 0 ? 'ri-arrow-up-line text-xl' : 'ri-arrow-down-line text-xl'} />
                </CustomAvatar>
                <div className='flex flex-col'>
                  <Typography className='font-medium' color='text.primary'>
                    {formatPercent(overviewData.aumTrend?.monthlyChange || 0)}
                  </Typography>
                  <Typography variant='body2'>月度增长</Typography>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
        </Grid>

      {/* Todo Items - CRM Style */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card className='bs-full'>
          <CardHeader
            title='待办事项'
          />
          <CardContent className='flex flex-col gap-[1.1rem]'>
            {(overviewData.todoList || []).map((item, index) => {
              const link = getTodoLink(item?.type)
              const icon = getTodoIcon(item?.type)
              const label = item?.label || ''
              const type = item?.type || ''
              const count = item?.count || 0
              // 将十六进制颜色转换为 MUI 颜色名称
              const muiColor = hexToMuiColor(item?.color, item?.type)
              return (
                <div key={index} className='flex items-center gap-4'>
                  <CustomAvatar color={muiColor as any} skin='light' variant='rounded' size={40}>
                    <i className={icon} />
                  </CustomAvatar>
                  <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                    <div className='flex flex-col gap-0.5'>
                      <Typography className='font-medium' color='text.primary'>
                        {label}
                      </Typography>
                      <Typography variant='body2'>{type}</Typography>
                    </div>
                    <Chip
                      label={`${count} 项`}
                      component={Link}
                      href={link}
                      color={muiColor as any}
                      size='medium'
                      variant='tonal'
                      clickable
                      className='font-medium'
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity - Left side 2/3 */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <Card>
          <CardContent className='flex justify-between gap-4 flex-wrap flex-col sm:flex-row items-center'>
            <div className='flex flex-col'>
              <Typography variant='h5' className='font-semibold'>
              最近活动
            </Typography>
              <Typography variant='body2' color='text.secondary'>
                最新交易记录
              </Typography>
            </div>
            <Button 
              component={Link} 
              href="/operation/fiatAssets?tab=transactions" 
              variant='contained'
              startIcon={<i className='ri-external-link-line' />}
              className='max-sm:is-full'
            >
              查看全部交易
            </Button>
          </CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>类型</TableCell>
                  <TableCell>客户</TableCell>
                  <TableCell align="right">金额</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>时间</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(overviewData.recentActivities || []).map((activity, index) => {
                  // 从 detail 中获取状态信息
                  const detailStatus = activity?.detail?.status || activity?.status || ''
                  const detailStatusLabel = activity?.detail?.statusLabel || activity?.statusTag || ''
                  const { color: statusColor } = getStatusColorAndIcon(detailStatus, detailStatusLabel)
                  // 使用接口返回的 color，如果没有则根据类型判断
                  const typeColor = getTypeColor(activity?.typeLabel, activity?.color)
                  const customer = activity?.customer || ''
                  const email = activity?.email || ''
                  const userId = activity?.userId
                  const typeLabel = activity?.typeLabel || ''
                  // 优先使用 detail.amount，如果没有则使用 amount
                  const amount = activity?.detail?.amount ?? activity?.amount ?? 0
                  // 优先使用 detail.currency，如果没有则使用 currency
                  const currency = activity?.detail?.currency || activity?.currency || ''
                  // 优先使用 detail.time，如果没有则使用 timeDesc
                  const timeDesc = activity?.detail?.time || activity?.timeDesc || ''
                  const status = detailStatusLabel || detailStatus
                  return (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Chip 
                          label={typeLabel} 
                          size='small' 
                          variant='outlined'
                          color={typeColor as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                            {customer ? customer[0] : '?'}
                          </Avatar>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant='body2'>{customer}</Typography>
                            {userId && (
                              <Typography variant='body2' color='text.secondary'>
                                ID: {userId}
                              </Typography>
                            )}
                            {email && (
                              <Typography variant='caption' color='text.secondary'>
                                {email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant='body2' 
                          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                        >
                          {formatFullAmount(amount)} {currency}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={status} 
                          size='small' 
                          color={statusColor as any} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {timeDesc}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
      </Card>
      </Grid>

      {/* Currency Distribution - Right side 1/3 */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card className='bs-full'>
          <CardHeader
            title='币种分布'
          />
          <CardContent className='flex flex-col gap-6'>
            {currencyDistributionData.map((currency, index) => {
              const icons: Record<string, string> = {
                'USD': 'ri-money-dollar-box-line',
                'HKD': 'ri-money-dollar-circle-line',
                'CNY': 'ri-yuan-line',
                'USDT': 'ri-coins-line'
              }
              const icon = icons[currency.name] || 'ri-money-dollar-circle-line'
              const colors: any[] = ['primary', 'success', 'warning', 'info']
              const color = colors[index % colors.length]
              return (
                <div key={currency.name}>
                  <div className='flex items-center justify-between mbe-3'>
                    <div className='flex items-center gap-3'>
                      <CustomAvatar color={color} skin='light' variant='rounded' size={38}>
                        <i className={icon} />
                      </CustomAvatar>
                      <div className='flex flex-col gap-0.5'>
                        <Typography className='font-medium' color='text.primary'>{currency.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>{currency.percent.toFixed(1)}% 总资产</Typography>
                      </div>
                    </div>
                    <Typography className='font-medium' color='text.primary'>
                      {formatCurrency(currency.value)}
                    </Typography>
                  </div>
                  <LinearProgress
                    variant='determinate'
                    value={currency.percent}
                    className='bs-2'
                    sx={{ 
                      '& .MuiLinearProgress-bar': { 
                        backgroundColor: currency.color,
                        borderRadius: '4px'
                      },
                      backgroundColor: 'var(--mui-palette-customColors-trackBg)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
