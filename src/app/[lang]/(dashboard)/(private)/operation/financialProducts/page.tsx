"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid2 as Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Button,
  Drawer,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from "@mui/material"

// Materialize Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Styles
import tableStyles from '@core/styles/table.module.css'

type TabValue = "products" | "subscriptions" | "redemptions"

const TAB_VALUES: TabValue[] = ["products", "subscriptions", "redemptions"]

// Card Stat Component
const CardStatVertical = ({ title, stats, avatarIcon, avatarColor, trendNumber, trend }: any) => (
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

export default function WealthPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("products")
  const [searchQuery, setSearchQuery] = useState("")

  const [approvalDrawerOpen, setApprovalDrawerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "settle" | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(TAB_VALUES[newValue])
  }

  const handleOpenApproval = (order: any) => {
    setSelectedOrder(order)
    setApprovalDrawerOpen(true)
  }

  const handleCloseApproval = () => {
    setApprovalDrawerOpen(false)
    setSelectedOrder(null)
    setRejectReason("")
  }

  const handleConfirmAction = (action: "approve" | "reject" | "settle") => {
    setConfirmAction(action)
    setConfirmDialogOpen(true)
  }

  const handleExecuteAction = () => {
    console.log(`[v0] Executing ${confirmAction} for order ${selectedOrder?.id}`)
    // Execute the action here
    setConfirmDialogOpen(false)
    setApprovalDrawerOpen(false)
    setConfirmAction(null)
    setRejectReason("")
  }

  // Mock data
  const metrics = [
    { label: "产品总数", value: "12", change: "+2", trend: "up", icon: "ri-bank-line", color: "primary" },
    { label: "管理规模", value: "¥2.8亿", change: "+15.2%", trend: "up", icon: "ri-line-chart-line", color: "success" },
    { label: "活跃客户", value: "156", change: "+8", trend: "up", icon: "ri-group-line", color: "warning" },
    { label: "待处理订单", value: "8", change: "-3", trend: "down", icon: "ri-shopping-cart-line", color: "error" },
  ]

  const subscriptionMetrics = [
    { label: "待审批", value: "5", change: "+2", trend: "up", icon: "ri-shopping-cart-line", color: "warning" },
    { label: "今日认购", value: "¥850万", change: "+12.5%", trend: "up", icon: "ri-money-dollar-circle-line", color: "success" },
    { label: "本月认购", value: "¥3,200万", change: "+8.3%", trend: "up", icon: "ri-line-chart-line", color: "primary" },
    { label: "认购客户", value: "23", change: "+5", trend: "up", icon: "ri-group-line", color: "info" },
  ]

  const redemptionMetrics = [
    { label: "待审批", value: "3", change: "-1", trend: "down", icon: "ri-shopping-cart-line", color: "warning" },
    { label: "今日赎回", value: "¥420万", change: "-5.2%", trend: "down", icon: "ri-money-dollar-circle-line", color: "error" },
    { label: "本月赎回", value: "¥1,800万", change: "+3.1%", trend: "up", icon: "ri-line-chart-line", color: "primary" },
    { label: "待结算", value: "2", change: "0", trend: "neutral", icon: "ri-bank-line", color: "info" },
  ]

  const products = [
    {
      id: "P001",
      name: "稳健增长1号",
      type: "固定收益",
      riskLevel: "低风险",
      expectedReturn: "5.2%",
      actualReturn: "5.4%",
      minAmount: 100000,
      duration: "180天",
      status: "在售",
      aum: 15000000,
      subscribers: 45,
      channels: ["线上", "私人银行"],
      description: "稳健型固定收益产品，适合风险偏好较低的投资者",
    },
    {
      id: "P002",
      name: "进取型2号",
      type: "混合型",
      riskLevel: "中风险",
      expectedReturn: "8.5%",
      actualReturn: "9.2%",
      minAmount: 500000,
      duration: "365天",
      status: "在售",
      aum: 28000000,
      subscribers: 32,
      channels: ["私人银行", "财富管理"],
      description: "混合型投资策略，追求较高收益",
    },
    {
      id: "P003",
      name: "保守型3号",
      type: "货币基金",
      riskLevel: "低风险",
      expectedReturn: "3.8%",
      actualReturn: "3.9%",
      minAmount: 50000,
      duration: "活期",
      status: "在售",
      aum: 42000000,
      subscribers: 128,
      channels: ["线上", "线下", "私人银行"],
      description: "货币市场基金，流动性强，随时可赎回",
    },
    {
      id: "P004",
      name: "高收益4号",
      type: "股票型",
      riskLevel: "高风险",
      expectedReturn: "12.0%",
      actualReturn: "11.5%",
      minAmount: 1000000,
      duration: "730天",
      status: "售罄",
      aum: 50000000,
      subscribers: 18,
      channels: ["私人银行"],
      description: "股票型产品，高风险高收益，适合风险承受能力强的投资者",
    },
  ]

  const subscriptionOrders = [
    {
      id: "S20240115001",
      client: "张三",
      clientId: "C001",
      product: "稳健增长1号",
      productId: "P001",
      amount: 1000000,
      applicationTime: "2024-01-15 14:23:15",
      approvalTime: null,
      status: "待审批",
      riskLevel: "低风险",
      channel: "线上",
    },
    {
      id: "S20240115002",
      client: "李四",
      clientId: "C002",
      product: "进取型2号",
      productId: "P002",
      amount: 2000000,
      applicationTime: "2024-01-15 10:45:32",
      approvalTime: null,
      status: "待审批",
      riskLevel: "中风险",
      channel: "私人银行",
    },
    {
      id: "S20240114003",
      client: "钱七",
      clientId: "C005",
      product: "稳健增长1号",
      productId: "P001",
      amount: 1500000,
      applicationTime: "2024-01-14 09:30:22",
      approvalTime: "2024-01-14 10:15:30",
      status: "已批准",
      riskLevel: "低风险",
      channel: "线上",
    },
    {
      id: "S20240113004",
      client: "赵六",
      clientId: "C004",
      product: "保守型3号",
      productId: "P003",
      amount: 500000,
      applicationTime: "2024-01-13 15:20:10",
      approvalTime: "2024-01-13 16:05:22",
      status: "已完成",
      riskLevel: "低风险",
      channel: "线下",
    },
  ]

  const redemptionOrders = [
    {
      id: "R20240115001",
      client: "王五",
      clientId: "C003",
      product: "保守型3号",
      productId: "P003",
      amount: 500000,
      holdingAmount: 800000,
      applicationTime: "2024-01-15 16:12:08",
      approvalTime: null,
      settlementTime: null,
      status: "待审批",
      reason: "资金周转",
    },
    {
      id: "R20240114002",
      client: "孙八",
      clientId: "C006",
      product: "稳健增长1号",
      productId: "P001",
      amount: 1000000,
      holdingAmount: 1000000,
      applicationTime: "2024-01-14 11:30:45",
      approvalTime: "2024-01-14 14:20:15",
      settlementTime: null,
      status: "已批准",
      reason: "到期赎回",
    },
    {
      id: "R20240113003",
      client: "周九",
      clientId: "C007",
      product: "进取型2号",
      productId: "P002",
      amount: 2000000,
      holdingAmount: 2000000,
      applicationTime: "2024-01-13 09:15:20",
      approvalTime: "2024-01-13 10:30:45",
      settlementTime: "2024-01-13 15:45:30",
      status: "已结算",
      reason: "投资调整",
    },
  ]

  const expiringProducts = [
    {
      id: "P005",
      name: "季度理财5号",
      type: "固定收益",
      expiryDate: "2024-02-15",
      daysRemaining: 15,
      aum: 8500000,
      subscribers: 28,
      expectedReturn: "4.8%",
    },
    {
      id: "P006",
      name: "短期增值6号",
      type: "混合型",
      expiryDate: "2024-02-28",
      daysRemaining: 28,
      aum: 12000000,
      subscribers: 35,
      expectedReturn: "6.2%",
    },
    {
      id: "P007",
      name: "稳健配置7号",
      type: "固定收益",
      expiryDate: "2024-02-10",
      daysRemaining: 10,
      aum: 6800000,
      subscribers: 19,
      expectedReturn: "5.5%",
    },
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "在售":
        return "success"
      case "售罄":
        return "default"
      case "暂停":
        return "warning"
      default:
        return "default"
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "待审批":
        return "warning"
      case "已批准":
        return "info"
      case "已完成":
      case "已结算":
        return "success"
      case "已拒绝":
        return "error"
      default:
        return "default"
    }
  }

  const getExpiryUrgency = (days: number) => {
    if (days <= 10) return { colorClass: "text-error", bgClass: "bg-error", label: "紧急", severity: "error" as const }
    if (days <= 20) return { colorClass: "text-warning", bgClass: "bg-warning", label: "即将到期", severity: "warning" as const }
    return { colorClass: "text-primary", bgClass: "bg-primary", label: "正常", severity: "info" as const }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredSubscriptions = subscriptionOrders.filter(
    (order) =>
      order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredRedemptions = redemptionOrders.filter(
    (order) =>
      order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Box>
      {/* Page Header */}
      <Card className='mb-6'>
        <CardHeader
          title={
            <div>
              <Typography variant='h4' className='font-medium mb-1'>
                理财产品
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                管理理财产品和客户订单
              </Typography>
            </div>
          }
        />
      </Card>

      {/* Metrics - Show different metrics based on active tab */}
      <Grid container spacing={6} className='mb-6'>
        {(activeTab === "products"
          ? metrics
          : activeTab === "subscriptions"
            ? subscriptionMetrics
            : redemptionMetrics
        ).map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <CardStatVertical
              title={metric.label}
              stats={metric.value}
              avatarIcon={metric.icon}
              avatarColor={metric.color}
              trendNumber={metric.change}
              trend={metric.trend}
            />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card className='mb-6'>
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
          <Tab label='产品列表' />
          <Tab label='认购管理' />
          <Tab label='赎回管理' />
        </Tabs>
      </Card>

      {/* Search and Filters */}
      <Card className='mb-6'>
        <CardContent>
          <div className='flex gap-4 items-center'>
            <TextField
              placeholder={
                activeTab === "products"
                  ? "搜索产品名称、ID..."
                  : activeTab === "subscriptions"
                    ? "搜索客户、订单号、产品..."
                    : "搜索客户、订单号、产品..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              className='flex-grow max-w-[400px]'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className='ri-search-line' />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" startIcon={<i className='ri-filter-line' />}>
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className='flex flex-col gap-6'>
            <Card>
              <CardHeader 
                title='产品列表'
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
                      <th>产品信息</th>
                      <th>类型/风险</th>
                      <th className='text-right'>预期/实际收益</th>
                      <th className='text-right'>管理规模</th>
                      <th className='text-center'>认购人数</th>
                      <th>渠道</th>
                      <th className='text-center'>状态</th>
                      <th className='text-center'>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className='hover:bg-actionHover'>
                        <td>
                          <div>
                            <Typography variant="body2" className='font-semibold mb-1'>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" className='font-mono'>
                              {product.id}
                            </Typography>
                          </div>
                        </td>
                        <td>
                          <div>
                            <Typography variant="body2" className='mb-1'>
                              {product.type}
                            </Typography>
                            <Chip label={product.riskLevel} size="small" color={getRiskColor(product.riskLevel)} />
                          </div>
                        </td>
                        <td className='text-right'>
                          <div>
                            <Typography
                              variant="body2"
                              className='font-semibold text-success font-mono'
                            >
                              {product.expectedReturn}
                            </Typography>
                            {product.actualReturn && (
                              <Typography variant="caption" color="text.secondary" className='font-mono'>
                                实际: {product.actualReturn}
                              </Typography>
                            )}
                          </div>
                        </td>
                        <td className='text-right'>
                          <Typography variant="body2" className='font-semibold font-mono'>
                            {formatCurrency(product.aum)}
                          </Typography>
                        </td>
                        <td className='text-center'>
                          <Chip label={product.subscribers} size="small" variant="outlined" />
                        </td>
                        <td>
                          <div className='flex gap-1 flex-wrap'>
                            {product.channels.map((channel) => (
                              <Chip key={channel} label={channel} size="small" variant="outlined" />
                            ))}
                          </div>
                        </td>
                        <td className='text-center'>
                          <Chip label={product.status} size="small" color={getStatusColor(product.status)} />
                        </td>
                        <td className='text-center'>
                          <IconButton 
                            component={Link} 
                            href={`/operation/financialProducts/${product.id}`} 
                            size="small" 
                            color="primary"
                          >
                            <i className='ri-eye-line' />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Expiring products section */}
            <Card>
              <CardHeader 
                title={
                  <div className='flex items-center gap-2'>
                    <i className='ri-alarm-warning-line text-2xl text-warning' />
                    <Typography variant="h5" className='font-medium'>
                      快到期产品
                    </Typography>
                    <Chip label={expiringProducts.length} size="small" color="warning" />
                  </div>
                }
                action={
                  <OptionsMenu
                    iconButtonProps={{ color: 'default' }}
                    options={[
                      { text: '导出列表', icon: 'ri-download-line' },
                      { text: '设置提醒', icon: 'ri-notification-line' }
                    ]}
                  />
                }
              />
              <CardContent>
                <Grid container spacing={6}>
                  {expiringProducts.map((product) => {
                    const urgency = getExpiryUrgency(product.daysRemaining)
                    return (
                      <Grid size={{ xs: 12, md: 4 }} key={product.id}>
                        <Card className='relative overflow-visible bs-full'>
                          <div
                            className={`absolute -top-3 right-4 ${urgency.bgClass} text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1`}
                          >
                            <i className='ri-calendar-line text-sm' />
                            {product.daysRemaining}天后到期
                          </div>
                          <CardContent className='pt-4'>
                            <div className='mb-3'>
                              <Typography variant="h6" className='font-semibold mb-1'>
                                {product.name}
                              </Typography>
                              <div className='flex gap-2 items-center'>
                                <Typography variant="caption" color="text.secondary" className='font-mono'>
                                  {product.id}
                                </Typography>
                                <Chip label={product.type} size="small" variant="outlined" />
                              </div>
                            </div>

                            <Alert severity={urgency.severity} className='mb-3'>
                              <Typography variant="body2" className='font-semibold'>
                                到期日期: {product.expiryDate}
                              </Typography>
                            </Alert>

                            <div className='flex flex-col gap-3'>
                              <div className='flex justify-between items-center'>
                                <Typography variant="body2" color="text.secondary">
                                  预期收益:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  className='font-semibold text-success font-mono'
                                >
                                  {product.expectedReturn}
                                </Typography>
                              </div>
                              <div className='flex justify-between items-center'>
                                <Typography variant="body2" color="text.secondary">
                                  管理规模:
                                </Typography>
                                <Typography variant="body2" className='font-semibold font-mono'>
                                  {formatCurrency(product.aum)}
                                </Typography>
                              </div>
                              <div className='flex justify-between items-center'>
                                <Typography variant="body2" color="text.secondary">
                                  认购人数:
                                </Typography>
                                <Chip label={`${product.subscribers}人`} size="small" />
                              </div>
                            </div>

                            <Divider className='my-4' />

                            <Button 
                              component={Link} 
                              href={`/operation/financialProducts/${product.id}`} 
                              variant="outlined" 
                              fullWidth 
                              startIcon={<i className='ri-eye-line' />}
                            >
                              查看详情
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <Card>
            <CardHeader 
              title='认购订单'
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
                    <th>订单号</th>
                    <th>客户信息</th>
                    <th>产品</th>
                    <th>渠道</th>
                    <th className='text-right'>认购金额</th>
                    <th>申请时间</th>
                    <th>审批时间</th>
                    <th className='text-center'>状态</th>
                    <th className='text-center'>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((order) => (
                    <tr key={order.id} className='hover:bg-actionHover'>
                      <td>
                        <Typography variant="body2" className='font-mono'>
                          {order.id}
                        </Typography>
                      </td>
                      <td>
                        <div>
                          <Typography variant="body2" className='font-semibold mb-1'>
                            {order.client}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" className='font-mono'>
                            {order.clientId}
                          </Typography>
                        </div>
                      </td>
                      <td>
                        <div>
                          <Typography variant="body2" className='mb-1'>
                            {order.product}
                          </Typography>
                          <Chip label={order.riskLevel} size="small" color={getRiskColor(order.riskLevel)} />
                        </div>
                      </td>
                      <td>
                        <Chip label={order.channel} size="small" variant="outlined" />
                      </td>
                      <td className='text-right'>
                        <Typography variant="body2" className='font-semibold font-mono'>
                          {formatCurrency(order.amount)}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant="body2" color="text.secondary" className='text-sm'>
                          {order.applicationTime}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant="body2" color="text.secondary" className='text-sm'>
                          {order.approvalTime || "-"}
                        </Typography>
                      </td>
                      <td className='text-center'>
                        <Chip label={order.status} size="small" color={getOrderStatusColor(order.status)} />
                      </td>
                      <td className='text-center'>
                        <IconButton size="small" color="primary" onClick={() => handleOpenApproval(order)}>
                          <i className='ri-eye-line' />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Redemptions Tab */}
        {activeTab === "redemptions" && (
          <Card>
            <CardHeader 
              title='赎回订单'
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
                    <th>订单号</th>
                    <th>客户信息</th>
                    <th>产品</th>
                    <th className='text-right'>赎回金额</th>
                    <th className='text-right'>持有金额</th>
                    <th>申请时间</th>
                    <th>审批时间</th>
                    <th>结算时间</th>
                    <th className='text-center'>状态</th>
                    <th className='text-center'>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRedemptions.map((order) => (
                    <tr key={order.id} className='hover:bg-actionHover'>
                      <td>
                        <Typography variant="body2" className='font-mono'>
                          {order.id}
                        </Typography>
                      </td>
                      <td>
                        <div>
                          <Typography variant="body2" className='font-semibold mb-1'>
                            {order.client}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" className='font-mono'>
                            {order.clientId}
                          </Typography>
                        </div>
                      </td>
                      <td>
                        <Typography variant="body2">{order.product}</Typography>
                      </td>
                      <td className='text-right'>
                        <Typography variant="body2" className='font-semibold font-mono text-error'>
                          {formatCurrency(order.amount)}
                        </Typography>
                      </td>
                      <td className='text-right'>
                        <Typography variant="body2" className='font-mono' color="text.secondary">
                          {formatCurrency(order.holdingAmount)}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant="body2" color="text.secondary" className='text-sm'>
                          {order.applicationTime}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant="body2" color="text.secondary" className='text-sm'>
                          {order.approvalTime || "-"}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant="body2" color="text.secondary" className='text-sm'>
                          {order.settlementTime || "-"}
                        </Typography>
                      </td>
                      <td className='text-center'>
                        <Chip label={order.status} size="small" color={getOrderStatusColor(order.status)} />
                      </td>
                      <td className='text-center'>
                        <IconButton size="small" color="primary" onClick={() => handleOpenApproval(order)}>
                          <i className='ri-eye-line' />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      {/* Approval Drawer */}
      <Drawer
        anchor="right"
        open={approvalDrawerOpen}
        onClose={handleCloseApproval}
        PaperProps={{
          className: 'w-[480px]',
        }}
      >
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <Typography variant="h6" className='font-semibold'>
              {activeTab === "subscriptions" ? "认购审批" : "赎回审批"}
            </Typography>
            <IconButton onClick={handleCloseApproval} size="small">
              <i className='ri-close-line' />
            </IconButton>
          </div>

          {selectedOrder && (
            <div className='flex flex-col gap-4'>
              {/* Order Information */}
              <Card className='bg-actionHover'>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" className='mb-2'>
                    订单信息
                  </Typography>
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">
                        订单号:
                      </Typography>
                      <Typography variant="body2" className='font-mono font-semibold'>
                        {selectedOrder.id}
                      </Typography>
                    </div>
                    <div className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">
                        客户:
                      </Typography>
                      <Typography variant="body2" className='font-semibold'>
                        {selectedOrder.client}
                      </Typography>
                    </div>
                    <div className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">
                        产品:
                      </Typography>
                      <Typography variant="body2">{selectedOrder.product}</Typography>
                    </div>
                    <div className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">
                        金额:
                      </Typography>
                      <Typography variant="body2" className='font-mono font-semibold'>
                        {formatCurrency(selectedOrder.amount)}
                      </Typography>
                    </div>
                    {activeTab === "redemptions" && (
                      <div className='flex justify-between'>
                        <Typography variant="body2" color="text.secondary">
                          持有金额:
                        </Typography>
                        <Typography variant="body2" className='font-mono'>
                          {formatCurrency(selectedOrder.holdingAmount)}
                        </Typography>
                      </div>
                    )}
                    <div className='flex justify-between'>
                      <Typography variant="body2" color="text.secondary">
                        申请时间:
                      </Typography>
                      <Typography variant="body2">{selectedOrder.applicationTime}</Typography>
                    </div>
                    <div className='flex justify-between items-center'>
                      <Typography variant="body2" color="text.secondary">
                        状态:
                      </Typography>
                      <Chip label={selectedOrder.status} size="small" color={getOrderStatusColor(selectedOrder.status)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment (for subscriptions) */}
              {activeTab === "subscriptions" && (
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" className='mb-3'>
                      风险评估
                    </Typography>
                    <div className='flex flex-col gap-3'>
                      <div className='flex justify-between items-center'>
                        <Typography variant="body2" color="text.secondary">
                          产品风险等级:
                        </Typography>
                        <Chip
                          label={selectedOrder.riskLevel}
                          size="small"
                          color={getRiskColor(selectedOrder.riskLevel)}
                        />
                      </div>
                      <div className='flex justify-between items-center'>
                        <Typography variant="body2" color="text.secondary">
                          客户风险承受能力:
                        </Typography>
                        <Chip label="中风险" size="small" color="warning" />
                      </div>
                      <Alert severity="success" className='mt-2'>
                        风险匹配度: 适合
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Redemption Reason (for redemptions) */}
              {activeTab === "redemptions" && selectedOrder.reason && (
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" className='mb-2'>
                      赎回原因
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedOrder.reason}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Reject Reason Input */}
              {selectedOrder.status === "待审批" && (
                <FormControl fullWidth>
                  <TextField
                    label="拒绝原因（如需拒绝请填写）"
                    multiline
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="请输入拒绝原因..."
                  />
                </FormControl>
              )}

              {/* Action Buttons */}
              <div className='flex gap-2'>
                {selectedOrder.status === "待审批" && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<i className='ri-check-line' />}
                      onClick={() => handleConfirmAction("approve")}
                    >
                      批准
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<i className='ri-close-circle-line' />}
                      onClick={() => handleConfirmAction("reject")}
                      disabled={!rejectReason.trim()}
                    >
                      拒绝
                    </Button>
                  </>
                )}
                {selectedOrder.status === "已批准" && activeTab === "redemptions" && (
                  <Button variant="contained" color="success" fullWidth onClick={() => handleConfirmAction("settle")}>
                    标记为已结算
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {confirmAction === "approve" && "确认批准"}
          {confirmAction === "reject" && "确认拒绝"}
          {confirmAction === "settle" && "确认结算"}
        </DialogTitle>
        <DialogContent>
          <Alert severity={confirmAction === "reject" ? "error" : "warning"} className='mb-4'>
            此操作将影响客户资金状态，请仔细确认
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {confirmAction === "approve" && `确认批准订单 ${selectedOrder?.id}？`}
            {confirmAction === "reject" && `确认拒绝订单 ${selectedOrder?.id}？拒绝原因: ${rejectReason}`}
            {confirmAction === "settle" && `确认标记订单 ${selectedOrder?.id} 为已结算？`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleExecuteAction}
            variant="contained"
            color={confirmAction === "reject" ? "error" : "primary"}
          >
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
