'use client'

// React Imports
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// Util Imports
import { getLocalizedPath } from '@/utils/routeUtils'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { 
  getUserAssetList, 
  getUserTransactionList, 
  getCurrencyList,
  initCurrency,
  type UserAssetListItem, 
  type UserTransactionListItem,
  type CurrencyListItem
} from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const MyAssets = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const currentLang = (params?.lang as string) || undefined
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [filters, setFilters] = useState({
    transactionId: '',
    currency: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(true)

  // 资产数据
  const [assets, setAssets] = useState<UserAssetListItem[]>([])
  const [selectedAsset, setSelectedAsset] = useState<UserAssetListItem | null>(null)

  // 交易记录
  const [transactions, setTransactions] = useState<UserTransactionListItem[]>([])
  const [total, setTotal] = useState(0)

  // 币种列表
  const [currencyList, setCurrencyList] = useState<CurrencyListItem[]>([])

  // 今日统计
  const [todayStats, setTodayStats] = useState({
    income: 0,
    expenditure: 0,
    totalAssets: 0
  })

  // 初始化币种并加载币种列表
  const loadCurrencyList = async () => {
    try {
      // 先初始化默认币种
      await initCurrency()
      // 再获取币种列表
      const res = await getCurrencyList()
      const responseData = res.data as any
      const list = responseData?.list || responseData?.data?.list || []
      setCurrencyList(list)
    } catch (error) {
      console.error('加载币种列表失败:', error)
    }
  }

  // 加载资产列表
  const loadAssets = async () => {
    setAssetsLoading(true)
    try {
      const res = await getUserAssetList()
      const assetList = res.data?.list || []
      setAssets(assetList)
      // 默认选择第一个资产，如果没有则选择USDT
      if (assetList.length > 0) {
        const usdtAsset = assetList.find(a => a.currencyCode === 'USDT') || assetList[0]
        setSelectedAsset(usdtAsset)
      }
    } catch (error) {
      console.error('加载资产失败:', error)
      toast.error('加载资产失败')
    } finally {
      setAssetsLoading(false)
    }
  }

  // 加载交易记录
  const loadTransactions = async () => {
    setTransactionsLoading(true)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const res = await getUserTransactionList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        currencyCode: filters.currency || undefined,
        startTime: filters.startDate ? new Date(filters.startDate).getTime() : undefined,
        endTime: filters.endDate ? new Date(filters.endDate).getTime() + 86400000 - 1 : undefined
      })
      
      const transactionList = res.data?.list || []
      setTransactions(transactionList)
      setTotal(res.data?.total || 0)

      // 计算今日统计
      const todayTransactions = transactionList.filter(tx => {
        const txDate = new Date(tx.createdAt)
        return txDate >= today && txDate < tomorrow
      })

      const income = todayTransactions
        .filter(tx => tx.direction === 1)
        .reduce((sum, tx) => sum + tx.amount, 0)
      
      const expenditure = todayTransactions
        .filter(tx => tx.direction === 2)
        .reduce((sum, tx) => sum + tx.amount, 0)

      setTodayStats({
        income,
        expenditure,
        totalAssets: assets.reduce((sum, asset) => sum + asset.balance, 0)
      })
    } catch (error) {
      console.error('加载交易记录失败:', error)
      toast.error('加载交易记录失败')
    } finally {
      setTransactionsLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
    loadCurrencyList()
  }, [])

  useEffect(() => {
    if (selectedAsset) {
      loadTransactions()
    }
  }, [page, rowsPerPage, filters, selectedAsset])

  // 当前显示的资产数据
  const currentAsset = selectedAsset || {
    currencyCode: 'USDT',
    balance: 0,
    frozenBalance: 0,
    availableBalance: 0
  }

  return (
    <Box 
      sx={{ 
        p: 6, 
        position: 'relative', 
        minHeight: '100%',
        bgcolor: mode === 'dark' ? 'background.default' : '#f8fafc'
      }}
    >
      {/* 现代感网格背景 */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: mode === 'dark' 
            ? `
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
        }}
      />

      <Grid container spacing={6} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              欢迎使用 Fidere Pay
            </Typography>
          </Box>
        </Grid>

        {/* 账户信息卡片 */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                  <Typography variant='body2' sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600, fontSize: '0.875rem' }}>
                    账户信息
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      T
                    </Box>
                    <Box>
                      <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', fontWeight: 500, fontSize: '0.75rem' }}>
                        {currentAsset.currencyCode}
                      </Typography>
                      {assetsLoading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        <Typography variant='h4' sx={{ fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                          {(currentAsset.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant='contained'
                  size='small'
                  onClick={() => router.push(getLocalizedPath(`/assets/deposit?currency=${currentAsset.currencyCode}`, currentLang))}
                  startIcon={<i className='ri-add-circle-line' />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    borderRadius: '8px',
                    fontWeight: 600,
                    px: 3,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.95)', transform: 'scale(1.05)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' },
                    transition: 'all 0.2s'
                  }}
                >
                  充值
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
                <Typography 
                  variant='body2' 
                  sx={{ 
                    color: '#a5f3a5', 
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    fontSize: '0.875rem'
                  }}
                >
                  可用: {(currentAsset.availableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })}
                </Typography>
                <Typography 
                  variant='body2' 
                  sx={{ 
                    color: '#ffcc80', 
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    fontSize: '0.875rem'
                  }}
                >
                  冻结: {(currentAsset.frozenBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 8 })}
                </Typography>
              </Box>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.3)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', mb: 1, fontWeight: 500 }}>
                    今日收入
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#a5f3a5', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                    +{todayStats.income.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', mb: 1, fontWeight: 500 }}>
                    今日支出
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#ffcc80', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                    -{todayStats.expenditure.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', mb: 1, fontWeight: 500 }}>
                    总资产
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                    {todayStats.totalAssets.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* 背景装饰 */}
              <Box
                sx={{
                  position: 'absolute',
                  right: -20,
                  bottom: -20,
                  fontSize: '120px',
                  opacity: 0.08,
                  fontWeight: 900,
                  zIndex: 0
                }}
              >
                T
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 全球汇款卡片 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: '16px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                transform: 'translateY(-6px)',
                '& .icon-box': { bgcolor: 'primary.main', color: 'white' }
              },
              border: '1px solid rgba(0,0,0,0.05)'
            }}
            onClick={() => router.push(getLocalizedPath('/remittance/create', currentLang))}
          >
            {/* 背景装饰 - 货币符号和地球图标 */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                opacity: 0.05,
                pointerEvents: 'none',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                p: 4
              }}
            >
              <i className='ri-money-dollar-circle-line text-6xl' style={{ color: 'var(--mui-palette-primary-main)' }} />
              <i className='ri-euro-line text-5xl' style={{ color: 'var(--mui-palette-primary-main)' }} />
              <i className='ri-yen-line text-5xl' style={{ color: 'var(--mui-palette-primary-main)' }} />
              <i className='ri-global-line text-6xl' style={{ color: 'var(--mui-palette-primary-main)' }} />
            </Box>

            <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box
                  className='icon-box'
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '14px',
                    bgcolor: 'primary.lightOpacity',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className='ri-global-line' />
                </Box>
                <i className='ri-arrow-right-up-line text-2xl text-textDisabled' />
              </Box>
              
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
                全球汇款
              </Typography>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' color='primary' sx={{ fontWeight: 600, mb: 1 }}>
                  美元汇款，安全可靠
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                  ● 支持全球200+国家和地区
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                    实时汇率
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'info.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'info.main' }} />
                    安全保障
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 添加收款方卡片 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: '16px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                transform: 'translateY(-6px)',
                '& .icon-box': { bgcolor: 'secondary.main', color: 'white' }
              },
              border: '1px solid rgba(0,0,0,0.05)'
            }}
            onClick={() => router.push(getLocalizedPath('/remittance/recipients/new', currentLang))}
          >
            {/* 背景装饰 - 人物连接网络图标 */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                opacity: 0.05,
                pointerEvents: 'none',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                p: 4
              }}
            >
              <i className='ri-user-line text-5xl' style={{ color: 'var(--mui-palette-secondary-main)' }} />
              <i className='ri-user-add-line text-5xl' style={{ color: 'var(--mui-palette-secondary-main)' }} />
              <i className='ri-team-line text-6xl' style={{ color: 'var(--mui-palette-secondary-main)' }} />
              <i className='ri-user-settings-line text-5xl' style={{ color: 'var(--mui-palette-secondary-main)' }} />
              <i className='ri-group-line text-5xl' style={{ color: 'var(--mui-palette-secondary-main)' }} />
            </Box>

            <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box
                  className='icon-box'
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '14px',
                    bgcolor: 'secondary.lightOpacity',
                    color: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className='ri-user-add-line' />
                </Box>
                <i className='ri-arrow-right-up-line text-2xl text-textDisabled' />
              </Box>
              
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
                添加收款方
              </Typography>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' color='secondary' sx={{ fontWeight: 600, mb: 1 }}>
                  一键添加，随时调用
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  ● 管理您的收款人信息
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 资产记录表格 */}
        <Grid size={{ xs: 12 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 6, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                  <Typography variant='h6' sx={{ fontWeight: 700 }}>
                    资产记录
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton size='small' onClick={loadTransactions} disabled={transactionsLoading}>
                      {transactionsLoading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                    </IconButton>
                    <IconButton size='small'><i className='ri-fullscreen-line' /></IconButton>
                    <IconButton size='small'><i className='ri-settings-3-line' /></IconButton>
                  </Box>
                </Box>

                {/* 筛选栏 */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>交易ID</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='请输入交易ID'
                      value={filters.transactionId}
                      onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>币种</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.currency}
                        onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>请选择币种</MenuItem>
                        {currencyList.map((currency, index) => (
                          <MenuItem key={`${currency.currencyCode}-${currency.chain || index}`} value={currency.currencyCode}>
                            {currency.currencyCode}{currency.chain ? `(${currency.chain})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>开始日期</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      type='date'
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>结束日期</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      type='date'
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignSelf: 'flex-end' }}>
                    <Button 
                      variant='text' 
                      size='small'
                      onClick={() => setFilters({ transactionId: '', currency: '', startDate: '', endDate: '' })}
                      sx={{ color: 'text.secondary' }}
                    >
                      重置
                    </Button>
                    <Button 
                      variant='contained' 
                      size='small' 
                      startIcon={<i className='ri-search-line' />} 
                      sx={{ borderRadius: '8px', px: 6 }}
                      onClick={loadTransactions}
                      disabled={transactionsLoading}
                    >
                      查询
                    </Button>
                    <Button variant='text' size='small' sx={{ color: 'primary.main' }}>
                      收起
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* 表格 */}
              <div className='overflow-x-auto'>
                <table className={tableStyles.table} style={{ border: 'none' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcfdfe' }}>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>交易ID</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>交易类型</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>币种</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>金额</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>创建时间</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsLoading ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                          <CircularProgress />
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                          暂无交易记录
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
                              {tx.id}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' sx={{ color: 'primary.main', fontWeight: 600 }}>
                              {tx.bizType === 1 ? '充值' : tx.bizType === 2 ? '提现' : tx.bizType === 3 ? '转账' : '其他'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2'>{tx.currencyCode}</Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 700,
                                color: tx.direction === 1 ? '#4caf50' : '#ff5252'
                              }}
                            >
                              {tx.direction === 1 ? '+' : '-'}{tx.amount}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' color='text.secondary'>
                              {new Date(tx.createdAt).toLocaleString()}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Button 
                              size='small' 
                              variant='text' 
                              sx={{ fontWeight: 600 }}
                              component={Link}
                              href={getLocalizedPath('/assets/transactions', currentLang)}
                            >
                              详情
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='caption' color='text.disabled'>
                  共 {total} 条记录
                </Typography>
                <TablePagination
                  component='div'
                  count={total}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10))
                    setPage(0)
                  }}
                  rowsPerPageOptions={[10, 25, 50]}
                  labelRowsPerPage=''
                  sx={{ border: 'none' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MyAssets
