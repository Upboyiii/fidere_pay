'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

// Next Imports
import { useRouter, useParams, usePathname } from 'next/navigation'

// Util Imports
import { getLocalizedPath, getCurrentLangFromPath } from '@/utils/routeUtils'

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
import Tooltip from '@mui/material/Tooltip'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { 
  getUserAssetList, 
  getUserRechargeList, 
  getCurrencyList,
  initCurrency,
  getUserAssetStatistics,
  type UserAssetListItem, 
  type RechargeDetailItem,
  type CurrencyListItem,
  type UserAssetStatistics
} from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

const MyAssets = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  
  // 使用 useMemo 确保 currentLang 随着 pathname 的变化而更新
  const currentLang = useMemo(() => {
    // 从路径中提取语言，确保获取当前页面的语言
    if (pathname) {
      const langMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/)
      if (langMatch && langMatch[1]) {
        return langMatch[1]
      }
    }
    // 如果路径中没有语言，则使用 params
    return (params?.lang as string) || undefined
  }, [pathname, params?.lang])
  
  const t = useTranslate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [rechargesLoading, setRechargesLoading] = useState(false)
  const [statistics, setStatistics] = useState<UserAssetStatistics | null>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(false)
  const [filters, setFilters] = useState({
    rechargeNo: '',
    currency: '',
    status: -1, // -1-全部 0-待确认 1-已到账 2-失败 3-已取消
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(true)

  // 资产数据
  const [assets, setAssets] = useState<UserAssetListItem[]>([])
  
  // 计算汇总数据
  // 计算总资产：优先使用统计接口数据，否则从资产列表计算
  const totalAvailableBalance = assets.reduce((sum, asset) => sum + (asset.availableBalance || 0), 0)
  const totalFrozenBalance = assets.reduce((sum, asset) => sum + (asset.frozenBalance || 0), 0)
  const totalBalance = statistics?.totalAsset ?? (totalAvailableBalance + totalFrozenBalance)
  
  // 今日收入和支出：使用统计接口数据
  const todayIncome = statistics?.todayIncome ?? 0
  const todayExpense = statistics?.todayExpense ?? 0

  // 充值记录
  const [recharges, setRecharges] = useState<RechargeDetailItem[]>([])
  const [total, setTotal] = useState(0)

  // 币种列表
  const [currencyList, setCurrencyList] = useState<CurrencyListItem[]>([])

  // 今日统计已移至统计接口，不再需要本地状态

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

  // 加载资产统计
  const loadStatistics = async () => {
    setStatisticsLoading(true)
    try {
      const res = await getUserAssetStatistics()
      const responseData = res.data as any
      const stats = responseData?.data || responseData || {}
      setStatistics(stats)
    } catch (error) {
      console.error('加载资产统计失败:', error)
    } finally {
      setStatisticsLoading(false)
    }
  }

  // 加载资产列表
  const loadAssets = async () => {
    setAssetsLoading(true)
    try {
      const res = await getUserAssetList()
      const responseData = res.data as any
      const assetList = responseData?.list || responseData?.data?.list || []
      setAssets(assetList)
    } catch (error) {
      console.error('加载资产失败:', error)
      toast.error(t('assets.loadAssetsFailed'))
    } finally {
      setAssetsLoading(false)
    }
  }

  // 加载充值记录
  const loadRecharges = async (customFilters?: typeof filters, customPage?: number) => {
    setRechargesLoading(true)
    try {
      const currentFilters = customFilters || filters
      const currentPage = customPage !== undefined ? customPage : page

      // 转换日期为时间戳（秒级）
      // 开始时间：当天的 00:00:00
      // 结束时间：当天的 23:59:59（包含整天的数据）
      let startTime: number | undefined
      let endTime: number | undefined
      if (currentFilters.startDate) {
        const [year, month, day] = currentFilters.startDate.split('-').map(Number)
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
        startTime = Math.floor(startDate.getTime() / 1000)
      }
      if (currentFilters.endDate) {
        const [year, month, day] = currentFilters.endDate.split('-').map(Number)
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
        endTime = Math.floor(endDate.getTime() / 1000)
      }

      const res = await getUserRechargeList({
        pageNum: currentPage + 1,
        pageSize: rowsPerPage,
        status: currentFilters.status !== -1 ? currentFilters.status : undefined,
        currencyCode: currentFilters.currency || undefined,
        rechargeNo: currentFilters.rechargeNo || undefined,
        startTime,
        endTime
      })
      
      const responseData = res.data as any
      const rechargeList = responseData?.list || responseData?.data?.list || []
      setRecharges(rechargeList)
      setTotal(responseData?.total || responseData?.data?.total || 0)
    } catch (error) {
      console.error('加载充值记录失败:', error)
      toast.error(t('assets.loadRechargesFailed'))
    } finally {
      setRechargesLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
    loadAssets()
    loadCurrencyList()
  }, [])

  useEffect(() => {
    loadRecharges()
  }, [page, rowsPerPage])

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
          backgroundImage: (theme) => theme.palette.mode === 'dark' 
            ? `
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
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
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              {t('assets.welcomeTitle')}
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600, fontSize: '0.875rem' }}>
                    {t('assets.accountInfo')}
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
                      $
                    </Box>
                    <Box>
                      <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', fontWeight: 500, fontSize: '0.75rem' }}>
                        {t('assets.totalAssets')}
                      </Typography>
                      {(assetsLoading || statisticsLoading) ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        <Typography variant='h4' sx={{ fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                          {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant='contained'
                  size='small'
                  onClick={() => {
                    // 实时获取当前语言，避免闭包问题
                    const realTimeLang = getCurrentLangFromPath()
                    router.push(getLocalizedPath('/assets/deposit', realTimeLang))
                  }}
                  startIcon={<i className='ri-add-circle-line' />}
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    borderRadius: '8px',
                    fontWeight: 600,
                    px: 3,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.95)', transform: 'scale(1.05)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' },
                    transition: 'all 0.2s'
                  }}
                >
                  {t('assets.recharge')}
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
                  {t('assets.available')}: {totalAvailableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  {t('assets.frozen')}: {totalFrozenBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.3)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', mb: 1, fontWeight: 500 }}>
                    {t('assets.todayIncome')}
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#a5f3a5', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                    +{todayIncome.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', mb: 1, fontWeight: 500 }}>
                    {t('assets.todayExpenditure')}
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#ffcc80', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                    -{todayExpense.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', mb: 1, fontWeight: 500 }}>
                    {t('assets.totalAssets')}
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                    {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            onClick={() => {
              // 实时获取当前语言，避免闭包问题
              const realTimeLang = getCurrentLangFromPath()
              router.push(getLocalizedPath('/remittance/create', realTimeLang))
            }}
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
                {t('assets.globalRemittance')}
              </Typography>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' color='primary' sx={{ fontWeight: 600, mb: 1 }}>
                  {t('assets.globalRemittanceDesc')}
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                  {t('assets.globalRemittanceFeature1')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                    {t('assets.realTimeRate')}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'info.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'info.main' }} />
                    {t('assets.securityGuarantee')}
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
            onClick={() => {
              // 实时获取当前语言，避免闭包问题
              const realTimeLang = getCurrentLangFromPath()
              router.push(getLocalizedPath('/remittance/recipients/new', realTimeLang))
            }}
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
                {t('assets.addRecipient')}
              </Typography>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' color='secondary' sx={{ fontWeight: 600, mb: 1 }}>
                  {t('assets.addRecipientDesc')}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {t('assets.addRecipientFeature')}
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
                    {t('assets.assetRecords')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton size='small' onClick={() => loadRecharges()} disabled={rechargesLoading}>
                      {rechargesLoading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                    </IconButton>
                    {/* <IconButton size='small'><i className='ri-fullscreen-line' /></IconButton> */}
                    {/* <IconButton size='small'><i className='ri-settings-3-line' /></IconButton> */}
                  </Box>
                </Box>

                {/* 筛选栏 */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('assets.transactionId')}</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder={t('assets.enterTransactionId')}
                      value={filters.rechargeNo}
                      onChange={(e) => setFilters({ ...filters, rechargeNo: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('assets.status')}</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: Number(e.target.value) })}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value={-1}>{t('assets.all')}</MenuItem>
                        <MenuItem value={0}>{t('assets.pending')}</MenuItem>
                        <MenuItem value={1}>{t('assets.completed')}</MenuItem>
                        <MenuItem value={2}>{t('assets.failed')}</MenuItem>
                        <MenuItem value={3}>{t('assets.cancelled')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('assets.currency')}</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.currency}
                        onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>{t('assets.selectCurrency')}</MenuItem>
                        {currencyList.map((currency, index) => (
                          <MenuItem key={`${currency.currencyCode}-${currency.chain || index}`} value={currency.currencyCode}>
                            {currency.currencyCode}{currency.chain ? `(${currency.chain})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('assets.startDate')}</Typography>
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
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('assets.endDate')}</Typography>
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
                      onClick={() => {
                        const resetFilters = { rechargeNo: '', currency: '', status: -1, startDate: '', endDate: '' }
                        setFilters(resetFilters)
                        setPage(0)
                        loadRecharges(resetFilters, 0)
                      }}
                      sx={{ color: 'text.secondary' }}
                    >
                      {t('assets.reset')}
                    </Button>
                    <Button 
                      variant='contained' 
                      size='small' 
                      startIcon={<i className='ri-search-line' />} 
                      sx={{ borderRadius: '8px', px: 6 }}
                      onClick={() => loadRecharges()}
                      disabled={rechargesLoading}
                    >
                      {t('assets.search')}
                    </Button>
                    {/* <Button variant='text' size='small' sx={{ color: 'primary.main' }}>
                      收起
                    </Button> */}
                  </Box>
                </Box>
              </Box>

              {/* 表格 */}
              <div className='overflow-x-auto'>
                <table className={tableStyles.table} style={{ border: 'none' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcfdfe' }}>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('assets.transactionId')}</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('assets.currency')}</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('assets.amount')}</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('assets.status')}</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('assets.address')}</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('assets.txHash')}</th>
                      <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('assets.createTime')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rechargesLoading ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                          <CircularProgress />
                        </td>
                      </tr>
                    ) : recharges.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                          {t('assets.noAssetRecords')}
                        </td>
                      </tr>
                    ) : (
                      recharges.map((recharge) => (
                        <tr key={recharge.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.8rem' }}>
                              {recharge.rechargeNo}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2'>{recharge.currencyCode}</Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 700,
                                color: '#4caf50'
                              }}
                            >
                              +{recharge.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Chip
                              label={
                                recharge.status === 0 ? t('assets.pending') :
                                recharge.status === 1 ? t('assets.completed') :
                                recharge.status === 2 ? t('assets.failed') :
                                recharge.status === 3 ? t('assets.cancelled') : t('assets.unknown')
                              }
                              size='small'
                              sx={{
                                bgcolor: recharge.status === 1 ? 'success.lightOpacity' :
                                         recharge.status === 2 ? 'error.lightOpacity' :
                                         recharge.status === 3 ? 'warning.lightOpacity' :
                                         'info.lightOpacity',
                                color: recharge.status === 1 ? 'success.main' :
                                       recharge.status === 2 ? 'error.main' :
                                       recharge.status === 3 ? 'warning.main' :
                                       'info.main',
                                fontWeight: 600
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px 24px', maxWidth: '200px' }}>
                            {(() => {
                              const rechargeAddress = (recharge as any).rechargeAddress
                              if (!rechargeAddress) return <Typography variant='body2' color='text.secondary'>-</Typography>
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Tooltip title={rechargeAddress} arrow>
                                    <Typography 
                                      variant='body2' 
                                      color='text.secondary'
                                      sx={{ 
                                        fontSize: '0.8rem', 
                                        fontFamily: 'monospace', 
                                        maxWidth: '200px', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap' 
                                      }}
                                    >
                                      {rechargeAddress}
                                    </Typography>
                                  </Tooltip>
                                  <IconButton 
                                    size='small' 
                                    onClick={() => {
                                      navigator.clipboard.writeText(rechargeAddress)
                                      toast.success(t('assets.copiedToClipboard'))
                                    }}
                                    sx={{ p: 0.5 }}
                                  >
                                    <i className='ri-file-copy-line' style={{ fontSize: '14px' }} />
                                  </IconButton>
                                </Box>
                              )
                            })()}
                          </td>
                          <td style={{ padding: '16px 24px', maxWidth: '200px' }}>
                            {(() => {
                              const txHash = (recharge as any).txHash
                              if (!txHash) return <Typography variant='body2' color='text.secondary'>-</Typography>
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Tooltip title={txHash} arrow>
                                    <Typography 
                                      variant='body2' 
                                      color='text.secondary'
                                      sx={{ 
                                        fontSize: '0.8rem', 
                                        fontFamily: 'monospace', 
                                        maxWidth: '200px', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap' 
                                      }}
                                    >
                                      {txHash}
                                    </Typography>
                                  </Tooltip>
                                  <IconButton 
                                    size='small' 
                                    onClick={() => {
                                      navigator.clipboard.writeText(txHash)
                                      toast.success(t('assets.copiedToClipboard'))
                                    }}
                                    sx={{ p: 0.5 }}
                                  >
                                    <i className='ri-file-copy-line' style={{ fontSize: '14px' }} />
                                  </IconButton>
                                </Box>
                              )
                            })()}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' color='text.secondary'>
                              {(() => {
                                const timestamp = (recharge as any).createTime || recharge.createdAt
                                if (!timestamp) return '-'
                                // 判断是秒级(10位)还是毫秒级(13位)时间戳
                                const ts = Number(timestamp)
                                const msTimestamp = ts > 9999999999 ? ts : ts * 1000
                                return new Date(msTimestamp).toLocaleString('zh-CN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })
                              })()}
                            </Typography>
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
