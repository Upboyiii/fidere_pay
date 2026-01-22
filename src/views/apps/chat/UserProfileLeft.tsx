// React Imports
import { useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'

// MUI Import
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Switch from '@mui/material/Switch'
import Backdrop from '@mui/material/Backdrop'
import Button from '@mui/material/Button'

// Third Party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Type Imports
import type { AppDispatch } from '@/redux-store'
import type { ProfileUserType, StatusType } from '@/types/apps/chatTypes'

// Slice Imports
import { setUserStatus } from '@/redux-store/slices/chat'

// Component Imports
import AvatarWithBadge from './AvatarWithBadge'
import { statusObj } from '@views/apps/chat/SidebarLeft'

type Props = {
  userSidebar: boolean
  setUserSidebar: (open: boolean) => void
  profileUserData: ProfileUserType
  dispatch: AppDispatch
  isBelowLgScreen: boolean
  isBelowSmScreen: boolean
}

const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-x-hidden overflow-y-auto'>{children}</div>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const UserProfileLeft = (props: Props) => {
  // Props
  const { userSidebar, setUserSidebar, profileUserData, dispatch, isBelowLgScreen, isBelowSmScreen } = props

  // Hooks
  const router = useRouter()

  // States
  const [twoStepVerification, setTwoStepVerification] = useState<boolean>(true)
  const [notification, setNotification] = useState<boolean>(false)

  const handleTwoStepVerification = () => {
    setTwoStepVerification(!twoStepVerification)
  }

  const handleNotification = () => {
    setNotification(!notification)
  }

  const handleLogout = async () => {
    try {
      // 清理本地存储的token和用户数据（先清理，避免signOut过程中的状态冲突）
      localStorage.removeItem('auth_tokens')
      localStorage.removeItem('userRole')

      // 清理验证码状态
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('resetCaptcha', 'true')
      }

      // 使用setTimeout确保状态清理完成后再调用signOut
      setTimeout(async () => {
        try {
          // 调用NextAuth的signOut清除session
          await signOut({
            redirect: false, // 不自动重定向，我们手动处理
            callbackUrl: '/login'
          })
        } catch (signOutError) {
          console.warn('signOut调用失败，但继续清理流程:', signOutError)
        }

        // 确保跳转到登录页面
        router.replace('/login')
      }, 100) // 短暂延迟确保状态清理完成
    } catch (error) {
      console.error('退出登录错误:', error)

      // 即使发生错误，也要确保清理和跳转
      try {
        localStorage.removeItem('auth_tokens')
        localStorage.removeItem('userRole')
        sessionStorage.setItem('resetCaptcha', 'true')
        router.replace('/login')
      } catch (fallbackError) {
        console.error('退出登录fallback错误:', fallbackError)
        // 最后的fallback：直接刷新页面到登录页
        window.location.href = '/login'
      }
    }
  }

  const handleUserStatus = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserStatus({ status: e.target.value as StatusType }))
  }

  return profileUserData ? (
    <>
      <Drawer
        open={userSidebar}
        anchor='left'
        variant='persistent'
        ModalProps={{ keepMounted: true }}
        onClose={() => setUserSidebar(false)}
        sx={{
          zIndex: 13,
          '& .MuiDrawer-paper': { width: isBelowSmScreen ? '100%' : '370px', position: 'absolute', border: 0 }
        }}
      >
        <IconButton size='small' className='absolute block-start-4 inline-end-4' onClick={() => setUserSidebar(false)}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
        <div className='flex flex-col justify-center items-center gap-4 mbs-6 pli-5 pbs-5 pbe-1'>
          <AvatarWithBadge
            alt={profileUserData.fullName}
            src={profileUserData.avatar}
            badgeColor={statusObj[profileUserData.status]}
            className='bs-[84px] is-[84px]'
            badgeSize={12}
          />
          <div className='text-center'>
            <Typography variant='h5'>{profileUserData.fullName}</Typography>
            <Typography>{profileUserData.role}</Typography>
          </div>
        </div>
        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
          <div className='flex flex-col gap-6 p-5'>
            <div className='flex flex-col gap-1'>
              <Typography className='uppercase' color='text.disabled'>
                About
              </Typography>
              <TextField fullWidth rows={3} multiline id='about-textarea' defaultValue={profileUserData.about} />
            </div>
            <div className='flex flex-col gap-1'>
              <FormLabel id='status-radio-buttons-group-label' className='uppercase text-textDisabled'>
                Status
              </FormLabel>
              <RadioGroup
                value={profileUserData.status}
                name='radio-buttons-group'
                onChange={handleUserStatus}
                aria-labelledby='status-radio-buttons-group-label'
              >
                <FormControlLabel value='online' control={<Radio color='success' />} label='Online' />
                <FormControlLabel value='away' control={<Radio color='warning' />} label='Away' />
                <FormControlLabel value='busy' control={<Radio color='error' />} label='Do not disturb' />
                <FormControlLabel value='offline' control={<Radio color='secondary' />} label='Offline' />
              </RadioGroup>
            </div>
            <div className='flex flex-col gap-1'>
              <Typography className='uppercase' color='text.disabled'>
                Settings
              </Typography>
              <List>
                <ListItem
                  disablePadding
                  secondaryAction={<Switch checked={twoStepVerification} onChange={handleTwoStepVerification} />}
                >
                  <ListItemButton onClick={handleTwoStepVerification} className='p-2 gap-2'>
                    <ListItemIcon>
                      <i className='ri-lock-password-line' />
                    </ListItemIcon>
                    <ListItemText primary='Two-step Verification' />
                  </ListItemButton>
                </ListItem>
                <ListItem
                  disablePadding
                  secondaryAction={<Switch checked={notification} onChange={handleNotification} />}
                >
                  <ListItemButton onClick={handleNotification} className='p-2 gap-2'>
                    <ListItemIcon>
                      <i className='ri-notification-line' />
                    </ListItemIcon>
                    <ListItemText primary='Notification' />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton className='p-2 gap-2'>
                    <ListItemIcon>
                      <i className='ri-user-add-line' />
                    </ListItemIcon>
                    <ListItemText primary='Invite Friends' />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton className='p-2 gap-2'>
                    <ListItemIcon>
                      <i className='ri-delete-bin-7-line' />
                    </ListItemIcon>
                    <ListItemText primary='Delete Account' />
                  </ListItemButton>
                </ListItem>
              </List>
            </div>
            <Button
              variant='contained'
              fullWidth
              className='mbs-auto'
              endIcon={<i className='ri-logout-box-r-line' />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </ScrollWrapper>
      </Drawer>
      <Backdrop open={userSidebar} onClick={() => setUserSidebar(false)} className='absolute z-[12]' />
    </>
  ) : null
}

export default UserProfileLeft
