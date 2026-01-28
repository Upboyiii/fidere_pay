'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import {
  getGoogleAuthStatus,
  generateGoogleAuth,
  bindGoogleAuth,
  unbindGoogleAuth,
  verifyGoogleAuth,
  getPayPasswordStatus,
  setPayPassword,
  resetPayPassword,
  verifyPayPassword
} from '@server/otc-api'
import { toast } from 'react-toastify'

const SecuritySettings = ({ mode }: { mode: Mode }) => {
  const [googleAuthBound, setGoogleAuthBound] = useState(false)
  const [payPasswordSet, setPayPasswordSet] = useState(false)
  const [googleAuthDialogOpen, setGoogleAuthDialogOpen] = useState(false)
  const [unbindGoogleAuthDialogOpen, setUnbindGoogleAuthDialogOpen] = useState(false)
  const [setPayPasswordDialogOpen, setSetPayPasswordDialogOpen] = useState(false)
  const [resetPayPasswordDialogOpen, setResetPayPasswordDialogOpen] = useState(false)
  const [googleAuthSecret, setGoogleAuthSecret] = useState('')
  const [googleAuthQrCode, setGoogleAuthQrCode] = useState('')
  const [googleAuthCode, setGoogleAuthCode] = useState('')
  const [payPassword, setPayPassword] = useState('')
  const [newPayPassword, setNewPayPassword] = useState('')
  const [confirmPayPassword, setConfirmPayPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const loadStatus = async () => {
    try {
      const [googleStatus, payPasswordStatus] = await Promise.all([
        getGoogleAuthStatus(),
        getPayPasswordStatus()
      ])
      setGoogleAuthBound(googleStatus.data?.isBound || false)
      setPayPasswordSet(payPasswordStatus.data?.isSet || false)
    } catch (error) {
      console.error('加载状态失败:', error)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const handleGenerateGoogleAuth = async () => {
    try {
      const res = await generateGoogleAuth()
      setGoogleAuthSecret(res.data?.secret || '')
      setGoogleAuthQrCode(res.data?.qrCode || '')
      setGoogleAuthDialogOpen(true)
    } catch (error) {
      console.error('生成密钥失败:', error)
      toast.error('生成密钥失败')
    }
  }

  const handleBindGoogleAuth = async () => {
    try {
      await bindGoogleAuth({
        secret: googleAuthSecret,
        code: googleAuthCode
      })
      toast.success('绑定成功')
      setGoogleAuthDialogOpen(false)
      setGoogleAuthCode('')
      loadStatus()
    } catch (error) {
      console.error('绑定失败:', error)
      toast.error('绑定失败')
    }
  }

  const handleUnbindGoogleAuth = async () => {
    try {
      await unbindGoogleAuth({
        code: googleAuthCode
      })
      toast.success('解绑成功')
      setUnbindGoogleAuthDialogOpen(false)
      setGoogleAuthCode('')
      loadStatus()
    } catch (error) {
      console.error('解绑失败:', error)
      toast.error('解绑失败')
    }
  }

  const handleSetPayPassword = async () => {
    if (payPassword !== confirmPayPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    try {
      await setPayPassword({
        password: payPassword
      })
      toast.success('设置成功')
      setSetPayPasswordDialogOpen(false)
      setPayPassword('')
      setConfirmPayPassword('')
      loadStatus()
    } catch (error) {
      console.error('设置失败:', error)
      toast.error('设置失败')
    }
  }

  const handleResetPayPassword = async () => {
    if (newPayPassword !== confirmPayPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    try {
      await resetPayPassword({
        newPassword: newPayPassword,
        googleCode: googleAuthBound ? googleAuthCode : undefined
      })
      toast.success('重置成功')
      setResetPayPasswordDialogOpen(false)
      setNewPayPassword('')
      setConfirmPayPassword('')
      setGoogleAuthCode('')
      loadStatus()
    } catch (error) {
      console.error('重置失败:', error)
      toast.error('重置失败')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid xs={12} md={6}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h6'>谷歌验证</Typography>
              <Chip
                label={googleAuthBound ? '已绑定' : '未绑定'}
                color={googleAuthBound ? 'success' : 'default'}
                size='small'
              />
            </Box>
            {googleAuthBound ? (
              <Button variant='outlined' color='error' onClick={() => setUnbindGoogleAuthDialogOpen(true)}>
                解绑谷歌验证
              </Button>
            ) : (
              <Button variant='contained' onClick={handleGenerateGoogleAuth}>
                绑定谷歌验证
              </Button>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} md={6}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h6'>支付密码</Typography>
              <Chip
                label={payPasswordSet ? '已设置' : '未设置'}
                color={payPasswordSet ? 'success' : 'default'}
                size='small'
              />
            </Box>
            {payPasswordSet ? (
              <Button variant='outlined' onClick={() => setResetPayPasswordDialogOpen(true)}>
                重置支付密码
              </Button>
            ) : (
              <Button variant='contained' onClick={() => setSetPayPasswordDialogOpen(true)}>
                设置支付密码
              </Button>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 绑定谷歌验证对话框 */}
      <Dialog open={googleAuthDialogOpen} onClose={() => setGoogleAuthDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>绑定谷歌验证</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            {googleAuthQrCode && (
              <Box className='flex justify-center'>
                <img src={googleAuthQrCode} alt='QR Code' />
              </Box>
            )}
            <Typography variant='body2' className='text-center'>
              密钥: {googleAuthSecret}
            </Typography>
            <Typography variant='body2' className='text-center text-gray-500'>
              请使用谷歌验证器扫描二维码，然后输入6位验证码
            </Typography>
            <TextField
              label='验证码'
              value={googleAuthCode}
              onChange={e => setGoogleAuthCode(e.target.value)}
              placeholder='请输入6位验证码'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoogleAuthDialogOpen(false)}>取消</Button>
          <Button variant='contained' onClick={handleBindGoogleAuth}>
            确认绑定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 解绑谷歌验证对话框 */}
      <Dialog
        open={unbindGoogleAuthDialogOpen}
        onClose={() => setUnbindGoogleAuthDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>解绑谷歌验证</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            <TextField
              label='验证码'
              value={googleAuthCode}
              onChange={e => setGoogleAuthCode(e.target.value)}
              placeholder='请输入6位验证码'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnbindGoogleAuthDialogOpen(false)}>取消</Button>
          <Button variant='contained' color='error' onClick={handleUnbindGoogleAuth}>
            确认解绑
          </Button>
        </DialogActions>
      </Dialog>

      {/* 设置支付密码对话框 */}
      <Dialog open={setPayPasswordDialogOpen} onClose={() => setSetPayPasswordDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>设置支付密码</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            <TextField
              label='支付密码'
              type={showPassword ? 'text' : 'password'}
              value={payPassword}
              onChange={e => setPayPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label='确认支付密码'
              type={showPassword ? 'text' : 'password'}
              value={confirmPayPassword}
              onChange={e => setConfirmPayPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetPayPasswordDialogOpen(false)}>取消</Button>
          <Button variant='contained' onClick={handleSetPayPassword}>
            确认设置
          </Button>
        </DialogActions>
      </Dialog>

      {/* 重置支付密码对话框 */}
      <Dialog
        open={resetPayPasswordDialogOpen}
        onClose={() => setResetPayPasswordDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>重置支付密码</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            {googleAuthBound && (
              <TextField
                label='谷歌验证码'
                value={googleAuthCode}
                onChange={e => setGoogleAuthCode(e.target.value)}
                placeholder='请输入6位验证码'
              />
            )}
            <TextField
              label='新支付密码'
              type={showPassword ? 'text' : 'password'}
              value={newPayPassword}
              onChange={e => setNewPayPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label='确认新支付密码'
              type={showPassword ? 'text' : 'password'}
              value={confirmPayPassword}
              onChange={e => setConfirmPayPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPayPasswordDialogOpen(false)}>取消</Button>
          <Button variant='contained' onClick={handleResetPayPassword}>
            确认重置
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default SecuritySettings
