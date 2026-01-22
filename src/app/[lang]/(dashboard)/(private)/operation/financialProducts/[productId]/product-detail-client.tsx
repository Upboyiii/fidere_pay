"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid2 as Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  IconButton,
  Drawer,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from "@mui/material"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Materialize Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Styles
import tableStyles from '@core/styles/table.module.css'

type TabValue = "overview" | "performance" | "subscribers" | "orders" | "netvalue"

const TAB_VALUES: TabValue[] = ["overview", "performance", "subscribers", "orders", "netvalue"]

// Card Stat Component
const CardStatVertical = ({ title, stats, avatarIcon, avatarColor }: any) => (
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
    </CardContent>
  </Card>
)

interface ProductDetailClientProps {
  product: any
  performanceData: any[]
  assetAllocation: any[]
  subscribers: any[]
  orders: any[]
  metrics: any[]
}

export default function ProductDetailClient({
  product,
  performanceData,
  assetAllocation,
  subscribers,
  orders,
  metrics,
}: ProductDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("overview")
  const [netValueDrawerOpen, setNetValueDrawerOpen] = useState(false)
  const [netValueForm, setNetValueForm] = useState({
    date: "",
    value: "",
    notes: "",
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedNetValue, setSelectedNetValue] = useState<any>(null)

  const [netValueHistory, setNetValueHistory] = useState([
    { id: 1, date: "2024-01-31", value: 1.0542, change: 0.42, notes: "1月净值更新" },
    { id: 2, date: "2023-12-31", value: 1.0498, change: 0.38, notes: "12月净值更新" },
    { id: 3, date: "2023-11-30", value: 1.0458, change: 0.35, notes: "11月净值更新" },
    { id: 4, date: "2023-10-31", value: 1.0421, change: 0.31, notes: "10月净值更新" },
    { id: 5, date: "2023-09-30", value: 1.0389, change: 0.28, notes: "9月净值更新" },
  ])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(TAB_VALUES[newValue])
  }

  const handleOpenNetValueDrawer = (netValue?: any) => {
    if (netValue) {
      setNetValueForm({
        date: netValue.date,
        value: netValue.value.toString(),
        notes: netValue.notes,
      })
      setSelectedNetValue(netValue)
    } else {
      setNetValueForm({
        date: new Date().toISOString().split("T")[0],
        value: "",
        notes: "",
      })
      setSelectedNetValue(null)
    }
    setNetValueDrawerOpen(true)
  }

  const handleCloseNetValueDrawer = () => {
    setNetValueDrawerOpen(false)
    setNetValueForm({ date: "", value: "", notes: "" })
    setSelectedNetValue(null)
  }

  const handleSaveNetValue = () => {
    console.log("Saving net value:", netValueForm)
    handleCloseNetValueDrawer()
  }

  const handleDeleteNetValue = () => {
    console.log("Deleting net value:", selectedNetValue)
    setDeleteConfirmOpen(false)
    setSelectedNetValue(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Box>
      {/* Header */}
      <Card className='mb-6'>
        <CardContent>
          <Button 
            component={Link} 
            href="/operation/financialProducts" 
            startIcon={<i className='ri-arrow-left-line' />}
            className='mb-4'
          >
            返回产品列表
          </Button>
          <div className='flex items-center gap-3 mb-2'>
            <Typography variant='h4' className='font-semibold'>
              {product.name}
            </Typography>
            <Chip label={product.status} color="success" />
            <Chip label={product.riskLevel} color="warning" variant="outlined" />
          </div>
          <Typography variant='body2' color='text.secondary' className='font-mono'>
            产品编号: {product.id}
          </Typography>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Grid container spacing={6} className='mb-6'>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <CardStatVertical
              title={metric.label}
              stats={metric.value}
              avatarIcon={metric.icon}
              avatarColor={metric.color}
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
          <Tab label='产品概览' icon={<i className='ri-file-list-line' />} iconPosition="start" />
          <Tab label='业绩表现' icon={<i className='ri-bar-chart-line' />} iconPosition="start" />
          <Tab label='认购客户' icon={<i className='ri-group-line' />} iconPosition="start" />
          <Tab label='订单记录' icon={<i className='ri-calendar-line' />} iconPosition="start" />
          <Tab label='净值管理' icon={<i className='ri-line-chart-line' />} iconPosition="start" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className='flex flex-col gap-6'>
          <Grid container spacing={6}>
            {/* Basic Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className='bs-full'>
                <CardHeader title='基本信息' />
                <CardContent>
                  <div className='flex flex-col gap-3'>
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>产品类型</Typography>
                      <Typography variant='body2' className='font-semibold'>{product.type}</Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between items-center'>
                      <Typography variant='body2' color='text.secondary'>风险等级</Typography>
                      <Chip label={product.riskLevel} size='small' color='warning' />
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>预期收益率</Typography>
                      <Typography variant='body2' className='font-semibold text-success font-mono'>
                        {product.expectedReturn}
                      </Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>实际收益率</Typography>
                      <Typography variant='body2' className='font-semibold text-success font-mono'>
                        {product.actualReturn}
                      </Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>起购金额</Typography>
                      <Typography variant='body2' className='font-semibold font-mono'>
                        {formatCurrency(product.minAmount)}
                      </Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>产品期限</Typography>
                      <Typography variant='body2' className='font-semibold'>{product.duration}</Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>成立日期</Typography>
                      <Typography variant='body2' className='font-semibold'>{product.establishedDate}</Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>到期日期</Typography>
                      <Typography variant='body2' className='font-semibold'>{product.maturityDate}</Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Product Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className='bs-full'>
                <CardHeader title='产品详情' />
                <CardContent>
                  <div className='flex flex-col gap-4'>
                    <div>
                      <Typography variant='subtitle2' className='mb-2 font-semibold'>产品描述</Typography>
                      <Typography variant='body2' color='text.secondary'>{product.description}</Typography>
                    </div>
                    <div>
                      <Typography variant='subtitle2' className='mb-2 font-semibold'>投资策略</Typography>
                      <Typography variant='body2' color='text.secondary'>{product.investmentStrategy}</Typography>
                    </div>
                    <div>
                      <Typography variant='subtitle2' className='mb-2 font-semibold'>产品特点</Typography>
                      <div className='flex gap-2 flex-wrap'>
                        {product.features.map((feature: string) => (
                          <Chip key={feature} label={feature} size='small' variant='outlined' />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Typography variant='subtitle2' className='mb-2 font-semibold'>销售渠道</Typography>
                      <div className='flex gap-2 flex-wrap'>
                        {product.channels.map((channel: string) => (
                          <Chip key={channel} label={channel} size='small' color='primary' variant='outlined' />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Typography variant='subtitle2' className='mb-2 font-semibold'>产品经理</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {product.manager} · {product.managerExperience}从业经验
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Risk Warning */}
            <Grid size={{ xs: 12 }}>
              <Alert severity='warning'>
                <Typography variant='subtitle2' className='mb-1 font-semibold'>风险提示</Typography>
                <Typography variant='body2'>{product.riskWarning}</Typography>
              </Alert>
            </Grid>
          </Grid>
        </div>
      )}

      {activeTab === "performance" && (
        <div className='flex flex-col gap-6'>
          <Grid container spacing={6}>
            {/* Net Value Chart */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader 
                  title='净值走势'
                  action={
                    <OptionsMenu
                      iconButtonProps={{ color: 'default' }}
                      options={[
                        { text: '导出数据', icon: 'ri-download-line' },
                        { text: '打印', icon: 'ri-printer-line' }
                      ]}
                    />
                  }
                />
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type='monotone' dataKey='value' stroke='#1976d2' strokeWidth={2} name='产品净值' />
                      <Line
                        type='monotone'
                        dataKey='benchmark'
                        stroke='#9e9e9e'
                        strokeWidth={2}
                        name='业绩基准'
                        strokeDasharray='5 5'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Asset Allocation */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className='bs-full'>
                <CardHeader title='资产配置' />
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={assetAllocation}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {assetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Financial Metrics */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className='bs-full'>
                <CardHeader title='财务指标' />
                <CardContent>
                  <div className='flex flex-col gap-3'>
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>年化收益率</Typography>
                      <Typography variant='body2' className='font-semibold text-success font-mono'>5.4%</Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>最大回撤</Typography>
                      <Typography variant='body2' className='font-semibold font-mono'>-0.8%</Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>夏普比率</Typography>
                      <Typography variant='body2' className='font-semibold font-mono'>1.85</Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>波动率</Typography>
                      <Typography variant='body2' className='font-semibold font-mono'>2.3%</Typography>
                    </div>
                    <Divider />
                    <div className='flex justify-between'>
                      <Typography variant='body2' color='text.secondary'>累计收益</Typography>
                      <Typography variant='body2' className='font-semibold text-success font-mono'>+6.5%</Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      )}

      {activeTab === "subscribers" && (
        <Card>
          <CardHeader 
            title='认购客户列表'
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
                  <th>客户编号</th>
                  <th>客户姓名</th>
                  <th className='text-right'>认购金额</th>
                  <th>认购日期</th>
                  <th className='text-center'>状态</th>
                  <th className='text-center'>操作</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className='hover:bg-actionHover'>
                    <td>
                      <Typography variant='body2' className='font-mono'>{subscriber.id}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2' className='font-semibold'>{subscriber.name}</Typography>
                    </td>
                    <td className='text-right'>
                      <Typography variant='body2' className='font-semibold font-mono'>
                        {formatCurrency(subscriber.amount)}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' color='text.secondary'>{subscriber.date}</Typography>
                    </td>
                    <td className='text-center'>
                      <Chip
                        label={subscriber.status}
                        size='small'
                        color={subscriber.status === "持有中" ? "success" : "default"}
                      />
                    </td>
                    <td className='text-center'>
                      <Button size='small' variant='outlined'>查看详情</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "orders" && (
        <Card>
          <CardHeader 
            title='订单记录'
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
                  <th>客户</th>
                  <th>类型</th>
                  <th className='text-right'>金额</th>
                  <th>时间</th>
                  <th className='text-center'>状态</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className='hover:bg-actionHover'>
                    <td>
                      <Typography variant='body2' className='font-mono'>{order.id}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2' className='font-semibold'>{order.client}</Typography>
                    </td>
                    <td>
                      <Chip
                        label={order.type}
                        size='small'
                        color={order.type === "认购" ? "primary" : "secondary"}
                        variant='outlined'
                      />
                    </td>
                    <td className='text-right'>
                      <Typography variant='body2' className='font-semibold font-mono'>
                        {formatCurrency(order.amount)}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' color='text.secondary'>{order.date}</Typography>
                    </td>
                    <td className='text-center'>
                      <Chip label={order.status} size='small' color='success' />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "netvalue" && (
        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader 
              title='净值管理'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='ri-add-line' />}
                  onClick={() => handleOpenNetValueDrawer()}
                >
                  添加净值
                </Button>
              }
            />
            <CardContent>
              <Alert severity='info' className='mb-6'>
                当前净值: <strong className='font-mono'>1.0542</strong> | 更新时间: 2024-01-31 | 本月涨幅:{" "}
                <strong className='text-success'>+0.42%</strong>
              </Alert>

              {/* Net Value Chart */}
              <div className='mb-6'>
                <Typography variant='subtitle1' className='mb-4 font-semibold'>净值走势图</Typography>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={netValueHistory.slice().reverse()}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis domain={['dataMin - 0.01', 'dataMax + 0.01']} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='value'
                      stroke='#1976d2'
                      strokeWidth={2}
                      name='产品净值'
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <Divider className='my-6' />

              {/* Net Value History */}
              <div>
                <Typography variant='subtitle1' className='mb-4 font-semibold'>历史净值记录</Typography>
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>日期</th>
                        <th className='text-right'>净值</th>
                        <th className='text-right'>涨跌幅</th>
                        <th>备注</th>
                        <th className='text-center'>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {netValueHistory.map((record) => (
                        <tr key={record.id} className='hover:bg-actionHover'>
                          <td>
                            <Typography variant='body2' className='font-semibold'>{record.date}</Typography>
                          </td>
                          <td className='text-right'>
                            <Typography variant='body2' className='font-mono font-semibold'>
                              {record.value.toFixed(4)}
                            </Typography>
                          </td>
                          <td className='text-right'>
                            <Typography
                              variant='body2'
                              className={`font-mono font-semibold ${record.change >= 0 ? 'text-success' : 'text-error'}`}
                            >
                              {record.change >= 0 ? "+" : ""}
                              {record.change.toFixed(2)}%
                            </Typography>
                          </td>
                          <td>
                            <Typography variant='body2' color='text.secondary'>{record.notes}</Typography>
                          </td>
                          <td className='text-center'>
                            <IconButton
                              size='small'
                              onClick={() => handleOpenNetValueDrawer(record)}
                              className='mr-2'
                            >
                              <i className='ri-edit-line' />
                            </IconButton>
                            <IconButton
                              size='small'
                              onClick={() => {
                                setSelectedNetValue(record)
                                setDeleteConfirmOpen(true)
                              }}
                              color='error'
                            >
                              <i className='ri-delete-bin-line' />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Net Value Drawer */}
      <Drawer 
        anchor='right' 
        open={netValueDrawerOpen} 
        onClose={handleCloseNetValueDrawer}
        PaperProps={{ className: 'w-[500px]' }}
      >
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <Typography variant='h6' className='font-semibold'>
              {selectedNetValue ? "编辑净值" : "添加净值"}
            </Typography>
            <IconButton onClick={handleCloseNetValueDrawer}>
              <i className='ri-close-line' />
            </IconButton>
          </div>

          <div className='flex flex-col gap-4'>
            <TextField
              label='日期'
              type='date'
              value={netValueForm.date}
              onChange={(e) => setNetValueForm({ ...netValueForm, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label='净值'
              type='number'
              value={netValueForm.value}
              onChange={(e) => setNetValueForm({ ...netValueForm, value: e.target.value })}
              fullWidth
              required
              inputProps={{ step: "0.0001", min: "0" }}
              helperText='请输入产品净值，保留4位小数'
            />

            <TextField
              label='备注说明'
              value={netValueForm.notes}
              onChange={(e) => setNetValueForm({ ...netValueForm, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder='例如：1月净值更新，市场表现良好'
            />

            <Alert severity='info'>净值更新后将自动计算涨跌幅，并通知所有认购客户。</Alert>

            <div className='flex gap-2 mt-4'>
              <Button
                variant='contained'
                fullWidth
                onClick={handleSaveNetValue}
                disabled={!netValueForm.date || !netValueForm.value}
              >
                保存净值
              </Button>
              <Button variant='outlined' fullWidth onClick={handleCloseNetValueDrawer}>
                取消
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除 {selectedNetValue?.date} 的净值记录吗？此操作不可撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={handleDeleteNetValue} color='error' variant='contained'>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

