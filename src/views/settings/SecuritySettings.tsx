'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

// QR Code Import
import { QRCodeCanvas } from 'qrcode.react'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import {
  getGoogleAuthStatus,
  generateGoogleAuth,
  bindGoogleAuth,
  unbindGoogleAuth,
  getPayPasswordStatus,
  setPayPassword,
  resetPayPassword,
  verifyPayPassword
} from '@server/otc-api'
import { toast } from 'react-toastify'

const SecuritySettings = ({ mode }: { mode: Mode }) => {
  const [googleAuthBound, setGoogleAuthBound] = useState(false)
  const [payPasswordSet, setPayPasswordSet] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Google验证相关
  const [googleAuthDialogOpen, setGoogleAuthDialogOpen] = useState(false)
  const [unbindGoogleAuthDialogOpen, setUnbindGoogleAuthDialogOpen] = useState(false)
  const [googleAuthSecret, setGoogleAuthSecret] = useState('')
  const [googleAuthQrCodeUrl, setGoogleAuthQrCodeUrl] = useState('')
  const [googleAuthCode, setGoogleAuthCode] = useState('')
  const [generating, setGenerating] = useState(false)
  
  // 支付密码相关
  const [setPayPasswordDialogOpen, setSetPayPasswordDialogOpen] = useState(false)
  const [resetPayPasswordDialogOpen, setResetPayPasswordDialogOpen] = useState(false)
  const [newPayPassword, setNewPayPassword] = useState('')
  const [confirmPayPassword, setConfirmPayPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  })

  // 加载状态
  const loadStatus = async () => {
    setLoading(true)
    try {
      const [googleStatus, payPasswordStatus] = await Promise.all([
        getGoogleAuthStatus(),
        getPayPasswordStatus()
      ])
      // API 返回结构：{ code: 0, message: "", data: { bound: boolean } }
      // clientRequest 返回：{ data: { code: 0, message: "", data: { bound: boolean } } }
      const googleData = googleStatus.data?.data || googleStatus.data
      const payPasswordData = payPasswordStatus.data?.data || payPasswordStatus.data
      setGoogleAuthBound(googleData?.bound || false)
      setPayPasswordSet(payPasswordData?.isSet || false)
    } catch (error) {
      console.error('加载状态失败:', error)
      toast.error('加载状态失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  // 生成Google验证密钥
  const handleGenerateGoogleAuth = async () => {
    // 如果已绑定，不允许再次生成
    if (googleAuthBound) {
      toast.error('谷歌验证已绑定，请先解绑')
      return
    }
    
    setGenerating(true)
    try {
      const res = await generateGoogleAuth()
      // API 返回结构：{ code: 0, message: "", data: { secret: string, qrCodeUrl: string } }
      // clientRequest 返回：{ data: { code: 0, message: "", data: { secret: string, qrCodeUrl: string } } }
      const responseData = res.data?.data || res.data
      setGoogleAuthSecret(responseData?.secret || '')
      setGoogleAuthQrCodeUrl(responseData?.qrCodeUrl || '')
      setGoogleAuthDialogOpen(true)
    } catch (error: any) {
      console.error('生成密钥失败:', error)
      // 显示API返回的错误信息
      const errorMessage = error?.response?.data?.message || error?.message || '生成密钥失败'
      toast.error(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  // 绑定Google验证
  const handleBindGoogleAuth = async () => {
    if (!googleAuthCode || googleAuthCode.length !== 6) {
      toast.error('请输入6位验证码')
      return
    }
    try {
      await bindGoogleAuth({
        secret: googleAuthSecret,
        code: googleAuthCode
      })
      toast.success('绑定成功')
      setGoogleAuthDialogOpen(false)
      setGoogleAuthCode('')
      setGoogleAuthSecret('')
      setGoogleAuthQrCodeUrl('')
      loadStatus()
    } catch (error: any) {
      console.error('绑定失败:', error)
      toast.error(error?.message || '绑定失败')
    }
  }

  // 解绑Google验证
  const handleUnbindGoogleAuth = async () => {
    if (!googleAuthCode || googleAuthCode.length !== 6) {
      toast.error('请输入6位验证码')
      return
    }
    try {
      await unbindGoogleAuth({
        code: googleAuthCode
      })
      toast.success('解绑成功')
      setUnbindGoogleAuthDialogOpen(false)
      setGoogleAuthCode('')
      loadStatus()
    } catch (error: any) {
      console.error('解绑失败:', error)
      toast.error(error?.message || '解绑失败')
    }
  }

  // 设置支付密码
  const handleSetPayPassword = async () => {
    if (!newPayPassword || newPayPassword.length < 6) {
      toast.error('密码长度至少6位')
      return
    }
    if (newPayPassword !== confirmPayPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    try {
      await setPayPassword({
        password: newPayPassword
      })
      toast.success('设置成功')
      setSetPayPasswordDialogOpen(false)
      setNewPayPassword('')
      setConfirmPayPassword('')
      loadStatus()
    } catch (error: any) {
      console.error('设置失败:', error)
      toast.error(error?.message || '设置失败')
    }
  }

  // 重置支付密码
  const handleResetPayPassword = async () => {
    // 根据接口定义，resetPayPassword 只需要 newPassword 和可选的 googleCode
    // 如果已绑定谷歌验证，需要谷歌验证码
    if (googleAuthBound && !verificationCode) {
      toast.error('请输入谷歌验证码')
      return
    }
    
    if (!newPayPassword || newPayPassword.length < 6) {
      toast.error('新密码长度至少6位')
      return
    }
    if (newPayPassword !== confirmPayPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    
    try {
      await resetPayPassword({
        newPassword: newPayPassword,
        googleCode: googleAuthBound ? verificationCode : undefined
      })
      toast.success('重置成功')
      setResetPayPasswordDialogOpen(false)
      setOldPayPassword('')
      setNewPayPassword('')
      setConfirmPayPassword('')
      setVerificationCode('')
      loadStatus()
    } catch (error: any) {
      console.error('重置失败:', error)
      toast.error(error?.message || '重置失败')
    }
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
          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              安全设置
            </Typography>
            <Typography color='text.secondary'>
              管理您的账户安全设置，保护您的资金安全
            </Typography>
          </Box>
        </Grid>

        {/* Google验证器卡片 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
              border: '1px solid rgba(0,0,0,0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent sx={{ p: 5, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 4 }}>
                Google验证器
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* 图标和标题 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '16px',
                        bgcolor: 'primary.lightOpacity',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <i className='ri-smartphone-line text-primary' style={{ fontSize: '48px' }} />
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                      启用 Authenticator 应用程序
                    </Typography>
                  </Box>

                  {/* 描述文字 */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5, lineHeight: 1.6 }}>
                      Authenticator 应用程序是一个第三方应用程序,为您管理资金提供了额外的安全层,特别是在提款等活动期间。
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                      通过 Authenticator 应用程序,您将被提示输入应用程序生成的代码进行验证而不是依赖短信验证码。
                    </Typography>
                  </Box>

                  {googleAuthBound ? (
                    <>
                      {/* 已绑定状态 */}
                      <Box sx={{ 
                        bgcolor: 'success.lightOpacity', 
                        borderRadius: '8px', 
                        p: 2.5, 
                        mb: 3,
                        textAlign: 'center'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                          <i className='ri-checkbox-circle-fill text-success' style={{ fontSize: '20px' }} />
                          <Typography variant='subtitle2' sx={{ fontWeight: 700, color: 'success.main' }}>
                            已启用 Google 验证器
                          </Typography>
                        </Box>
                        <Typography variant='caption' color='text.secondary'>
                          您的账户已受到双重验证保护
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      {/* 未绑定状态 - 下载提示 */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
                          没有 Authenticator 应用程序?
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 2, lineHeight: 1.6 }}>
                          通过扫描下方的二维码或在应用商店或 Google Play 上搜索下载 Google Authenticator
                        </Typography>
                        
                        {/* 下载按钮 */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          <Button
                            variant='contained'
                            color='primary'
                            sx={{
                              borderRadius: '8px',
                              px: 5,
                              py: 1.5,
                              fontWeight: 600
                            }}
                            onClick={() => window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2', '_blank')}
                          >
                            Google
                          </Button>
                        </Box>

                        {/* 下载二维码 */}
                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 3 }}>
                          {/* iOS 下载二维码 */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Box
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '8px',
                                p: 1.5,
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <QRCodeCanvas 
                                value='https://apps.apple.com/app/google-authenticator/id388497605'
                                size={100}
                                level='M'
                              />
                            </Box>
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
                              iOS
                            </Typography>
                          </Box>
                          {/* Android 下载二维码 */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Box
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '8px',
                                p: 1.5,
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <QRCodeCanvas 
                                value='https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'
                                size={100}
                                level='M'
                              />
                            </Box>
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
                              Android
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 操作按钮 */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                    {googleAuthBound ? (
                      <Button
                        variant='outlined'
                        color='error'
                        fullWidth
                        sx={{
                          borderRadius: '8px',
                          px: 4,
                          py: 1.5,
                          fontWeight: 600
                        }}
                        onClick={() => setUnbindGoogleAuthDialogOpen(true)}
                      >
                        解除绑定
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        color='primary'
                        fullWidth
                        disabled={generating}
                        sx={{
                          borderRadius: '8px',
                          px: 4,
                          py: 2,
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                        onClick={handleGenerateGoogleAuth}
                        startIcon={generating ? <CircularProgress size={20} color='inherit' /> : null}
                      >
                        {generating ? '生成中...' : '启用'}
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 修改密码卡片 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
              border: '1px solid rgba(0,0,0,0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent sx={{ p: 5, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='ri-lock-line text-white' />
                </Box>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  支付密码
                </Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* 描述文字 */}
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 3, lineHeight: 1.7 }}>
                    定期修改支付密码有助于保护您的账户安全
                  </Typography>

                  {/* 安全提示 */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                      <i className='ri-search-line text-primary' style={{ fontSize: '18px', marginTop: '2px' }} />
                      <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                        使用强密码保护您的账户
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <i className='ri-edit-line text-primary' style={{ fontSize: '18px', marginTop: '2px' }} />
                      <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                        建议每3-6个月更换一次密码
                      </Typography>
                    </Box>
                  </Box>

                  {/* 操作按钮 */}
                  <Button
                    variant='contained'
                    color='primary'
                    fullWidth
                    sx={{
                      borderRadius: '8px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      mt: 'auto'
                    }}
                    startIcon={<i className='ri-lock-line' />}
                    onClick={() => {
                      if (payPasswordSet) {
                        setResetPayPasswordDialogOpen(true)
                      } else {
                        setSetPayPasswordDialogOpen(true)
                      }
                    }}
                  >
                    {payPasswordSet ? '修改密码' : '设置支付密码'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 绑定Google验证对话框 */}
      <Dialog 
        open={googleAuthDialogOpen} 
        onClose={() => {
          setGoogleAuthDialogOpen(false)
          setGoogleAuthCode('')
        }} 
        maxWidth='sm' 
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          绑定 Google 验证器
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            {/* 二维码显示 */}
            {googleAuthQrCodeUrl && (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  p: 2,
                  bgcolor: 'white'
                }}
              >
                <QRCodeCanvas 
                  value={googleAuthQrCodeUrl} 
                  size={200}
                  level='M'
                />
              </Box>
            )}
            
            {/* 密钥显示 */}
            {googleAuthSecret && (
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                  密钥 (如无法扫码，可手动输入):
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  bgcolor: '#f8fafc', 
                  p: 2, 
                  borderRadius: '8px'
                }}>
                  <Typography 
                    variant='body2' 
                    sx={{ 
                      fontFamily: 'monospace', 
                      wordBreak: 'break-all',
                      flex: 1
                    }}
                  >
                    {googleAuthSecret}
                  </Typography>
                  <IconButton
                    size='small'
                    onClick={() => {
                      navigator.clipboard.writeText(googleAuthSecret)
                      toast.success('密钥已复制')
                    }}
                    sx={{ ml: 1 }}
                  >
                    <i className='ri-file-copy-line' />
                  </IconButton>
                </Box>
              </Box>
            )}
            
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center' }}>
              1. 打开 Google Authenticator 应用<br />
              2. 扫描上方二维码或手动输入密钥<br />
              3. 输入应用中显示的6位验证码
            </Typography>
            
            <TextField
              fullWidth
              label='验证码'
              value={googleAuthCode}
              onChange={(e) => setGoogleAuthCode(e.target.value)}
              placeholder='请输入6位验证码'
              inputProps={{ maxLength: 6 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setGoogleAuthDialogOpen(false)
              setGoogleAuthCode('')
            }}
            sx={{ borderRadius: '8px' }}
          >
            取消
          </Button>
          <Button 
            variant='contained' 
            color='primary'
            onClick={handleBindGoogleAuth}
            disabled={!googleAuthCode || googleAuthCode.length !== 6}
            sx={{ 
              borderRadius: '8px'
            }}
          >
            确认绑定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 解绑Google验证对话框 */}
      <Dialog
        open={unbindGoogleAuthDialogOpen}
        onClose={() => {
          setUnbindGoogleAuthDialogOpen(false)
          setGoogleAuthCode('')
        }}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          解绑 Google 验证器
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              请输入6位验证码以确认解绑操作
            </Typography>
            <TextField
              fullWidth
              label='验证码'
              value={googleAuthCode}
              onChange={(e) => setGoogleAuthCode(e.target.value)}
              placeholder='请输入6位验证码'
              inputProps={{ maxLength: 6 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setUnbindGoogleAuthDialogOpen(false)
              setGoogleAuthCode('')
            }}
            sx={{ borderRadius: '8px' }}
          >
            取消
          </Button>
          <Button 
            variant='contained' 
            color='error'
            onClick={handleUnbindGoogleAuth}
            disabled={!googleAuthCode || googleAuthCode.length !== 6}
            sx={{ borderRadius: '8px' }}
          >
            确认解绑
          </Button>
        </DialogActions>
      </Dialog>

      {/* 设置支付密码对话框 */}
      <Dialog 
        open={setPayPasswordDialogOpen} 
        onClose={() => {
          setSetPayPasswordDialogOpen(false)
          setNewPayPassword('')
          setConfirmPayPassword('')
        }} 
        maxWidth='sm' 
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                bgcolor: 'primary.lightOpacity',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='ri-lock-line text-primary' />
            </Box>
            设置支付密码
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label={
                <Box>
                  新密码 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                </Box>
              }
              type={showPassword.new ? 'text' : 'password'}
              value={newPayPassword}
              onChange={(e) => setNewPayPassword(e.target.value)}
              placeholder='请输入新密码'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      edge='end'
                    >
                      <i className={showPassword.new ? 'ri-eye-line' : 'ri-eye-off-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              fullWidth
              label={
                <Box>
                  确认密码 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                </Box>
              }
              type={showPassword.confirm ? 'text' : 'password'}
              value={confirmPayPassword}
              onChange={(e) => setConfirmPayPassword(e.target.value)}
              placeholder='请输入确认密码'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      edge='end'
                    >
                      <i className={showPassword.confirm ? 'ri-eye-line' : 'ri-eye-off-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setSetPayPasswordDialogOpen(false)
              setNewPayPassword('')
              setConfirmPayPassword('')
            }}
            sx={{ borderRadius: '8px' }}
          >
            取消
          </Button>
          <Button 
            variant='contained' 
            color='primary'
            onClick={handleSetPayPassword}
            disabled={!newPayPassword || !confirmPayPassword}
            sx={{ 
              borderRadius: '8px'
            }}
          >
            确认设置
          </Button>
        </DialogActions>
      </Dialog>

      {/* 重置支付密码对话框 */}
      <Dialog
        open={resetPayPasswordDialogOpen}
        onClose={() => {
          setResetPayPasswordDialogOpen(false)
          setOldPayPassword('')
          setNewPayPassword('')
          setConfirmPayPassword('')
          setVerificationCode('')
        }}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                bgcolor: 'primary.lightOpacity',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='ri-lock-line text-primary' />
            </Box>
            修改支付密码
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {googleAuthBound && (
              <TextField
                fullWidth
                label={
                  <Box>
                    谷歌验证码 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Box>
                }
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder='请输入6位验证码'
                inputProps={{ maxLength: 6 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
            <TextField
              fullWidth
              label={
                <Box>
                  新密码 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                </Box>
              }
              type={showPassword.new ? 'text' : 'password'}
              value={newPayPassword}
              onChange={(e) => setNewPayPassword(e.target.value)}
              placeholder='请输入新密码'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      edge='end'
                    >
                      <i className={showPassword.new ? 'ri-eye-line' : 'ri-eye-off-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              fullWidth
              label={
                <Box>
                  确认密码 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                </Box>
              }
              type={showPassword.confirm ? 'text' : 'password'}
              value={confirmPayPassword}
              onChange={(e) => setConfirmPayPassword(e.target.value)}
              placeholder='请输入确认密码'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      edge='end'
                    >
                      <i className={showPassword.confirm ? 'ri-eye-line' : 'ri-eye-off-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setResetPayPasswordDialogOpen(false)
              setNewPayPassword('')
              setConfirmPayPassword('')
              setVerificationCode('')
            }}
            sx={{ borderRadius: '8px' }}
          >
            取消
          </Button>
          <Button 
            variant='contained' 
            color='primary'
            onClick={handleResetPayPassword}
            disabled={!newPayPassword || !confirmPayPassword || (googleAuthBound && !verificationCode)}
            sx={{ 
              borderRadius: '8px'
            }}
          >
            确认修改
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SecuritySettings
