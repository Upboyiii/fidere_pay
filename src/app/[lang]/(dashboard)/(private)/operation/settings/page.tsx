"use client"

import {
  Box,
  Typography,
  Grid2 as Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
} from "@mui/material"

// Materialize Components
import CustomAvatar from '@core/components/mui/Avatar'

export default function SettingsPage() {
  const settingsCards = [
    {
      title: "账户设置",
      description: "账户管理功能开发中",
      icon: "ri-user-settings-line",
      color: "primary",
    },
    {
      title: "权限管理",
      description: "权限配置功能开发中",
      icon: "ri-shield-user-line",
      color: "success",
    },
    {
      title: "系统日志",
      description: "日志查看功能开发中",
      icon: "ri-file-list-3-line",
      color: "info",
    },
    {
      title: "通知设置",
      description: "通知配置功能开发中",
      icon: "ri-notification-3-line",
      color: "warning",
    },
  ]

  return (
    <Box>
      {/* Page Header */}
      <Card className='mb-6'>
        <CardHeader
          title={
            <div>
              <Typography variant='h4' className='font-medium mb-1'>
                系统设置
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                配置系统参数和权限
              </Typography>
            </div>
          }
        />
      </Card>

      {/* Development Notice */}
      <Alert severity='info' className='mb-6'>
        <Typography variant='body2'>
          系统设置功能正在开发中，敬请期待...
        </Typography>
      </Alert>

      {/* Settings Cards */}
      <Grid container spacing={6}>
        {settingsCards.map((card, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Card className='bs-full hover:shadow-md transition-shadow cursor-pointer'>
              <CardContent>
                <div className='flex items-start gap-4'>
                  <CustomAvatar color={card.color as any} skin='light' size={56}>
                    <i className={`${card.icon} text-3xl`} />
                  </CustomAvatar>
                  <div className='flex-1'>
                    <Typography variant='h6' className='font-semibold mb-2'>
                      {card.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {card.description}
                    </Typography>
                  </div>
                  <i className='ri-arrow-right-s-line text-2xl text-textSecondary' />
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
