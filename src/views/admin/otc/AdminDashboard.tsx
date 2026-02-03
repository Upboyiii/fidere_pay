'use client'

// React Imports
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { Mode } from '@core/types'

// Util Imports
import { getLocalizedPath } from '@/utils/routeUtils'

// API Imports
import {
  getAdminAssetList,
  getAdminTransferList,
  getAdminTransactionList,
  getAdminRechargeList,
  type AdminAssetListItem,
  type AdminTransferListItem,
  type AdminTransactionListItem
} from '@server/otc-api'

const AdminDashboard = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const currentLang = (params?.lang as string) || undefined

  // 统计数据
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    // 资产统计
    totalAssets: 0,
    totalUsers: 0,
    // 转账统计
    pendingTransfers: 0,
    processingTransfers: 0,
    totalTransferAmount: 0,
    // 流水统计
    todayIncome: 0,
    todayExpenditure: 0,
    // 充值统计
    pendingRecharges: 0
  })

  // 最近待处理的转账
  const [recentTransfers, setRecentTransfers] = useState<AdminTransferListItem[]>([])
  // 最近的交易流水
  const [recentTransactions, setRecentTransactions] = useState<AdminTransactionListItem[]>([])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // 并行加载所有数据
      const [assetRes, transferRes, transactionRes, rechargeRes] = await Promise.all([
        getAdminAssetList({ pageNum: 1, pageSize: 100 }),
        getAdminTransferList({ pageNum: 1, pageSize: 10 }),
        getAdminTransactionList({ pageNum: 1, pageSize: 5 }),
        getAdminRechargeList({ pageNum: 1, pageSize: 10 })
      ])

      // 资产统计
      const assetList = assetRes.data?.list || []
      const totalAssets = assetList.reduce((sum, item) => sum + (item.balance || 0), 0)
      const uniqueUsers = new Set(assetList.map(item => item.userId))

      // 转账统计
      const transferList = transferRes.data?.list || []
      const pendingTransfers = transferList.filter(item => item.status === 0).length
      const processingTransfers = transferList.filter(item => item.status === 1).length
      const totalTransferAmount = transferList.reduce((sum, item) => sum + item.transferAmount, 0)

      // 流水统计 - 今日
      const transactionList = transactionRes.data?.list || []
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = today.getTime()
      
      const todayTransactions = transactionList.filter(item => {
        const createTime = item.createTime || item.createdAt
        return createTime && createTime >= todayTimestamp
      })
      const todayIncome = todayTransactions
        .filter(item => item.direction === 1)
        .reduce((sum, item) => sum + Math.abs(item.changeAmount), 0)
      const todayExpenditure = todayTransactions
        .filter(item => item.direction === 2)
        .reduce((sum, item) => sum + Math.abs(item.changeAmount), 0)

      // 充值统计
      const rechargeList = rechargeRes.data?.list || []
      const pendingRecharges = rechargeList.filter(item => item.status === 0).length

      setStats({
        totalAssets,
        totalUsers: uniqueUsers.size,
        pendingTransfers,
        processingTransfers,
        totalTransferAmount,
        todayIncome,
        todayExpenditure,
        pendingRecharges
      })

      // 设置最近数据
      setRecentTransfers(transferList.slice(0, 5))
      setRecentTransactions(transactionList.slice(0, 5))
    } catch (error) {
      console.error('加载仪表板数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const menuItems = [
    {
      title: '转账管理',
      description: '管理转账申请和审核',
      href: '/Adminconfiguration/transfer',
      icon: 'ri-exchange-line',
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      badge: stats.pendingTransfers > 0 ? stats.pendingTransfers : undefined,
      badgeColor: 'warning' as const
    },
    {
      title: '资金流水',
      description: '查看资金流水记录',
      href: '/Adminconfiguration/financial',
      icon: 'ri-money-dollar-circle-line',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: '充值管理',
      description: '管理充值订单',
      href: '/Adminconfiguration/recharge',
      icon: 'ri-wallet-3-line',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      badge: stats.pendingRecharges > 0 ? stats.pendingRecharges : undefined,
      badgeColor: 'error' as const
    },
    {
      title: '手续费管理',
      description: '配置手续费规则',
      href: '/Adminconfiguration/fee',
      icon: 'ri-percent-line',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: '回调地址',
      description: '管理回调地址配置',
      href: '/Adminconfiguration/Callbackaddress',
      icon: 'ri-links-line',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
    },
    {
      title: '资产管理',
      description: '管理用户资产配置',
      href: '/Adminconfiguration/AssetManagement',
      icon: 'ri-coin-line',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    }
  ]

  const formatTime = (timestamp: number | undefined) => {
    if (!timestamp) return '-'
    // 处理秒级和毫秒级时间戳
    const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000
    return new Date(ts).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box
      sx={{
        p: 6,
        position: 'relative',
        minHeight: '100%',
        bgcolor: 'background.default'
      }}
    >
      {/* 现代感网格背景 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage:
            mode === 'dark'
              ? `
              linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `
              : `
              linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
            `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
        }}
      />

      <Grid container spacing={6} sx={{ position: 'relative', zIndex: 1 }}>
        {/* 页面标题 */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                管理员控制台
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                欢迎回来，这里是您的业务数据概览
              </Typography>
            </Box>
            <IconButton onClick={loadDashboardData} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <i className='ri-refresh-line' />}
            </IconButton>
          </Box>
        </Grid>

        {/* 主统计卡片 - 参考 assets/my-assets 风格 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #0052d4 0%, #4364f7 50%, #6fb1fc 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0, 97, 255, 0.2)',
              height: '100%'
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                  <Typography variant='body2' sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                    平台总资产
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 700
                      }}
                    >
                      <i className='ri-wallet-3-line' />
                    </Box>
                    {loading ? (
                      <CircularProgress size={32} sx={{ color: 'white' }} />
                    ) : (
                      <Typography variant='h3' sx={{ fontWeight: 700, textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                        {stats.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Chip
                  label={`${stats.totalUsers} 用户`}
                  size='small'
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 600 }}
                />
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mb: 0.5 }}>
                    今日入账
                  </Typography>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: '#a5f3a5' }}>
                    +{stats.todayIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mb: 0.5 }}>
                    今日出账
                  </Typography>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: '#ffcc80' }}>
                    -{stats.todayExpenditure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mb: 0.5 }}>
                    转账总额
                  </Typography>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: 'white' }}>
                    {stats.totalTransferAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>

              {/* 背景装饰 */}
              <Box
                sx={{
                  position: 'absolute',
                  right: -30,
                  bottom: -30,
                  fontSize: '140px',
                  opacity: 0.06,
                  fontWeight: 900,
                  zIndex: 0
                }}
              >
                $
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 待处理事项卡片 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
                待处理事项
              </Typography>
              
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '10px',
                    bgcolor: stats.pendingTransfers > 0 ? 'warning.lighter' : 'action.hover'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 36, height: 36, borderRadius: '8px', 
                      bgcolor: 'warning.main', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <i className='ri-time-line' style={{ fontSize: 18 }} />
                    </Box>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>待审核转账</Typography>
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {stats.pendingTransfers}
                  </Typography>
                </Box>

                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '10px',
                    bgcolor: stats.processingTransfers > 0 ? 'info.lighter' : 'action.hover'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 36, height: 36, borderRadius: '8px', 
                      bgcolor: 'info.main', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <i className='ri-loader-4-line' style={{ fontSize: 18 }} />
                    </Box>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>处理中转账</Typography>
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: 'info.main' }}>
                    {stats.processingTransfers}
                  </Typography>
                </Box>

                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '10px',
                    bgcolor: stats.pendingRecharges > 0 ? 'error.lighter' : 'action.hover'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 36, height: 36, borderRadius: '8px', 
                      bgcolor: 'error.main', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <i className='ri-wallet-3-line' style={{ fontSize: 18 }} />
                    </Box>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>待确认充值</Typography>
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: 'error.main' }}>
                    {stats.pendingRecharges}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 快捷功能菜单 */}
        <Grid size={{ xs: 12 }}>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 3, mt: 2 }}>
            快捷功能
          </Typography>
        </Grid>

        {menuItems.map(item => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.href}>
            <Link href={getLocalizedPath(item.href, currentLang)} style={{ textDecoration: 'none' }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                    '& .icon-box': { bgcolor: item.color, color: 'white' }
                  }
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box
                      className='icon-box'
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '14px',
                        bgcolor: item.bgColor,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        transition: 'all 0.3s'
                      }}
                    >
                      <i className={item.icon} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size='small'
                          color={item.badgeColor}
                          sx={{ fontWeight: 600, minWidth: 28 }}
                        />
                      )}
                      <i className='ri-arrow-right-up-line text-xl text-textDisabled' />
                    </Box>
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}

        {/* 最近转账申请 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    最近转账申请
                  </Typography>
                  <Link
                    href={getLocalizedPath('/Adminconfiguration/transfer', currentLang)}
                    style={{ textDecoration: 'none' }}
                  >
                    <Typography variant='body2' color='primary' sx={{ fontWeight: 600 }}>
                      查看全部 →
                    </Typography>
                  </Link>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : recentTransfers.length === 0 ? (
                  <Typography color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
                    暂无转账申请
                  </Typography>
                ) : (
                  recentTransfers.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor:
                              item.status === 0
                                ? 'warning.lighter'
                                : item.status === 1
                                  ? 'info.lighter'
                                  : item.status === 2
                                    ? 'success.lighter'
                                    : 'error.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i
                            className={
                              item.status === 0
                                ? 'ri-time-line'
                                : item.status === 1
                                  ? 'ri-loader-4-line'
                                  : item.status === 2
                                    ? 'ri-check-line'
                                    : 'ri-close-line'
                            }
                            style={{
                              color:
                                item.status === 0
                                  ? 'var(--mui-palette-warning-main)'
                                  : item.status === 1
                                    ? 'var(--mui-palette-info-main)'
                                    : item.status === 2
                                      ? 'var(--mui-palette-success-main)'
                                      : 'var(--mui-palette-error-main)'
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {item.userName}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {formatTime(item.createTime)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant='body2' sx={{ fontWeight: 700, color: '#ff5252' }}>
                          -{item.transferAmount}
                        </Typography>
                        <Chip
                          label={
                            item.status === 0
                              ? '待审核'
                              : item.status === 1
                                ? '处理中'
                                : item.status === 2
                                  ? '已完成'
                                  : item.status === 3
                                    ? '已驳回'
                                    : '失败'
                          }
                          size='small'
                          color={
                            item.status === 2 ? 'success' : item.status === 3 || item.status === 4 ? 'error' : 'warning'
                          }
                          variant='outlined'
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 最近资金流水 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    最近资金流水
                  </Typography>
                  <Link
                    href={getLocalizedPath('/Adminconfiguration/financial', currentLang)}
                    style={{ textDecoration: 'none' }}
                  >
                    <Typography variant='body2' color='primary' sx={{ fontWeight: 600 }}>
                      查看全部 →
                    </Typography>
                  </Link>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : recentTransactions.length === 0 ? (
                  <Typography color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
                    暂无流水记录
                  </Typography>
                ) : (
                  recentTransactions.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: item.direction === 1 ? 'success.lighter' : 'error.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i
                            className={item.direction === 1 ? 'ri-arrow-down-line' : 'ri-arrow-up-line'}
                            style={{
                              color:
                                item.direction === 1
                                  ? 'var(--mui-palette-success-main)'
                                  : 'var(--mui-palette-error-main)'
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {item.userName || `用户${item.userId}`}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {item.bizType === 1
                              ? '充值'
                              : item.bizType === 2
                                ? '提现'
                                : item.bizType === 3
                                  ? '转账'
                                  : item.bizType === 5
                                    ? '调整'
                                    : '其他'}{' '}
                            · {item.currencyCode}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 700,
                            color: item.direction === 1 ? '#4caf50' : '#ff5252'
                          }}
                        >
                          {item.direction === 1 ? '+' : '-'}
                          {Math.abs(item.changeAmount)}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {(() => {
                            const timestamp = item.createTime || item.createdAt
                            if (!timestamp) return '-'
                            return new Date(timestamp).toLocaleString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          })()}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard
