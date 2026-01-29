// Next Imports
import type { Metadata } from 'next'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '管理员配置',
  description: '管理员配置中心'
}

const menuItems = [
  {
    title: '转账管理',
    description: '管理转账申请和审核',
    href: '/Adminconfiguration/transfer',
    icon: 'ri-exchange-line'
  },
  {
    title: '资金流水',
    description: '查看资金流水记录',
    href: '/Adminconfiguration/financial',
    icon: 'ri-money-dollar-circle-line'
  },
  {
    title: '充值管理',
    description: '管理充值订单',
    href: '/Adminconfiguration/recharge',
    icon: 'ri-wallet-3-line'
  },
  {
    title: '手续费管理',
    description: '配置手续费规则',
    href: '/Adminconfiguration/fee',
    icon: 'ri-percent-line'
  },
  {
    title: '回调地址',
    description: '管理回调地址配置',
    href: '/Adminconfiguration/Callbackaddress',
    icon: 'ri-links-line'
  },
  {
    title: '资产管理',
    description: '管理数字资产配置',
    href: '/Adminconfiguration/AssetManagement',
    icon: 'ri-coin-line'
  }
]

const AdminConfigurationPage = async () => {
  const mode = await getServerMode()

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        管理员配置
      </Typography>
      <Grid container spacing={4}>
        {menuItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.href}>
            <Link href={item.href} style={{ textDecoration: 'none' }}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: 'primary.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <i className={item.icon} style={{ fontSize: 28, color: 'var(--mui-palette-primary-main)' }} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default AdminConfigurationPage
