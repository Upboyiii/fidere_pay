"use client"

import type React from "react"
import { useState } from "react"
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
  LinearProgress,
} from "@mui/material"

// Materialize Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Styles
import tableStyles from '@core/styles/table.module.css'

type TabValue = "applications" | "transactions" | "reconciliation"

const TAB_VALUES: TabValue[] = ["applications", "transactions", "reconciliation"]

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

export default function CardsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("applications")
  const [searchQuery, setSearchQuery] = useState("")

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(TAB_VALUES[newValue])
  }

  const applications = [
    {
      id: "A20240115001",
      client: "张三",
      clientId: "C001",
      cardType: "白金卡",
      applyDate: "2024-01-15",
      status: "审核中",
      progress: 60,
    },
    {
      id: "A20240114002",
      client: "李四",
      clientId: "C002",
      cardType: "金卡",
      applyDate: "2024-01-14",
      status: "制卡中",
      progress: 80,
    },
    {
      id: "A20240113003",
      client: "王五",
      clientId: "C003",
      cardType: "普通卡",
      applyDate: "2024-01-13",
      status: "已发卡",
      progress: 100,
    },
    {
      id: "A20240112004",
      client: "赵六",
      clientId: "C004",
      cardType: "白金卡",
      applyDate: "2024-01-12",
      status: "待审核",
      progress: 20,
    },
  ]

  const transactions = [
    {
      id: "T20240115001",
      cardNumber: "**** **** **** 1234",
      client: "张三",
      merchant: "Apple Store",
      amount: "¥12,999",
      time: "2024-01-15 14:23:15",
      status: "成功",
      type: "消费",
    },
    {
      id: "T20240115002",
      cardNumber: "**** **** **** 5678",
      client: "李四",
      merchant: "星巴克",
      amount: "¥45",
      time: "2024-01-15 10:45:32",
      status: "成功",
      type: "消费",
    },
    {
      id: "T20240115003",
      cardNumber: "**** **** **** 9012",
      client: "王五",
      merchant: "京东商城",
      amount: "¥3,580",
      time: "2024-01-15 09:12:08",
      status: "失败",
      type: "消费",
    },
    {
      id: "T20240114004",
      cardNumber: "**** **** **** 1234",
      client: "张三",
      merchant: "ATM取现",
      amount: "¥5,000",
      time: "2024-01-14 16:30:45",
      status: "成功",
      type: "取现",
    },
  ]

  const reconciliation = [
    {
      date: "2024-01-15",
      totalTransactions: 1247,
      totalAmount: "¥8,456,780",
      successRate: "99.2%",
      status: "已对账",
    },
    {
      date: "2024-01-14",
      totalTransactions: 1189,
      totalAmount: "¥7,892,340",
      successRate: "99.5%",
      status: "已对账",
    },
    {
      date: "2024-01-13",
      totalTransactions: 1056,
      totalAmount: "¥6,234,560",
      successRate: "99.1%",
      status: "已对账",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "已发卡":
        return "success"
      case "审核中":
      case "制卡中":
        return "info"
      case "待审核":
        return "warning"
      case "成功":
        return "success"
      case "失败":
        return "error"
      case "已对账":
        return "success"
      default:
        return "default"
    }
  }

  // KPI Metrics
  const metrics = [
    { label: "总申请数", value: "156", icon: "ri-file-list-line", color: "primary", trend: "up", change: "+12" },
    { label: "今日交易", value: "1,247", icon: "ri-exchange-line", color: "success", trend: "up", change: "+8.5%" },
    { label: "成功率", value: "99.2%", icon: "ri-check-line", color: "info", trend: "up", change: "+0.3%" },
    { label: "待审核", value: "8", icon: "ri-time-line", color: "warning", trend: "down", change: "-2" },
  ]

  return (
    <Box>
      {/* Page Header */}
      <Card className='mb-6'>
        <CardHeader
          title={
            <div>
              <Typography variant='h4' className='font-medium mb-1'>
                信用卡管理
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                管理信用卡申请、交易和对账
              </Typography>
            </div>
          }
        />
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
          <Tab label='开卡进度' />
          <Tab label='交易流水' />
          <Tab label='对账管理' />
        </Tabs>
      </Card>

      {/* Search Bar */}
      <Card className='mb-6'>
        <CardContent>
          <TextField
            placeholder={
              activeTab === "applications"
                ? "搜索客户、申请号..."
                : activeTab === "transactions"
                  ? "搜索卡号、商户..."
                  : "搜索日期、状态..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            className='max-w-[400px]'
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className='ri-search-line' />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <Card>
          <CardHeader 
            title='开卡申请进度'
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
          <CardContent>
            <div className='flex flex-col gap-4'>
              {applications.map((app) => (
                <Card 
                  key={app.id}
                  className='border hover:shadow-md transition-shadow'
                  variant='outlined'
                >
                  <CardContent>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-4'>
                        <CustomAvatar color='primary' skin='light' size={48}>
                          <i className='ri-bank-card-line text-2xl' />
                        </CustomAvatar>
                        <div>
                          <Typography variant='body1' className='font-semibold mb-1'>
                            {app.client} - {app.cardType}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' className='font-mono'>
                            申请号: {app.id} | 客户ID: {app.clientId}
                          </Typography>
                        </div>
                      </div>
                      <Chip
                        label={app.status}
                        size='small'
                        color={getStatusColor(app.status)}
                      />
                    </div>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center justify-between'>
                        <Typography variant='caption' color='text.secondary'>
                          申请日期: {app.applyDate}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' className='font-semibold'>
                          {app.progress}%
                        </Typography>
                      </div>
                      <LinearProgress 
                        variant='determinate' 
                        value={app.progress} 
                        className='h-2 rounded-full'
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <Card>
          <CardHeader 
            title='交易流水'
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
                  <th>交易ID</th>
                  <th>卡号</th>
                  <th>商户</th>
                  <th className='text-right'>金额</th>
                  <th>类型</th>
                  <th>时间</th>
                  <th className='text-center'>状态</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className='hover:bg-actionHover'>
                    <td>
                      <Typography variant='body2' className='font-mono' color='text.secondary'>
                        {tx.id}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' className='font-mono'>
                        {tx.cardNumber}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{tx.merchant}</Typography>
                    </td>
                    <td className='text-right'>
                      <Typography variant='body2' className='font-semibold'>
                        {tx.amount}
                      </Typography>
                    </td>
                    <td>
                      <Chip label={tx.type} size='small' variant='outlined' />
                    </td>
                    <td>
                      <Typography variant='body2' color='text.secondary' className='text-sm'>
                        {tx.time}
                      </Typography>
                    </td>
                    <td className='text-center'>
                      <Chip 
                        label={tx.status} 
                        size='small' 
                        color={getStatusColor(tx.status)}
                        icon={tx.status === "失败" ? <i className='ri-alert-line' /> : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reconciliation Tab */}
      {activeTab === "reconciliation" && (
        <Card>
          <CardHeader 
            title='对账管理'
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
                  <th>日期</th>
                  <th className='text-right'>交易笔数</th>
                  <th className='text-right'>交易总额</th>
                  <th className='text-right'>成功率</th>
                  <th className='text-center'>状态</th>
                </tr>
              </thead>
              <tbody>
                {reconciliation.map((record, i) => (
                  <tr key={i} className='hover:bg-actionHover'>
                    <td>
                      <Typography variant='body2' className='font-semibold'>
                        {record.date}
                      </Typography>
                    </td>
                    <td className='text-right'>
                      <Typography variant='body2'>
                        {record.totalTransactions.toLocaleString()}
                      </Typography>
                    </td>
                    <td className='text-right'>
                      <Typography variant='body2' className='font-semibold'>
                        {record.totalAmount}
                      </Typography>
                    </td>
                    <td className='text-right'>
                      <Typography variant='body2' className='text-success font-semibold'>
                        {record.successRate}
                      </Typography>
                    </td>
                    <td className='text-center'>
                      <Chip label={record.status} size='small' color={getStatusColor(record.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Box>
  )
}
