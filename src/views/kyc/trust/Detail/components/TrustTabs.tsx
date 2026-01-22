'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import { useTranslate } from '@/contexts/DictionaryContext'

// Icon Imports
import { Users, FileText } from 'lucide-react'

interface TrustTabsProps {
  /** 标签页内容列表 */
  tabContentList: { [key: string]: ReactElement }
}

/**
 * 信托标签页组件
 * @param tabContentList - 标签页内容列表
 */
const TrustTabs = ({ tabContentList }: TrustTabsProps) => {
  const t = useTranslate()
  const [activeTab, setActiveTab] = useState('documents')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList
            onChange={handleChange}
            variant='scrollable'
            pill='true'
            sx={{
              '& .MuiTabs-flexContainer': {
                gap: 2
              },
              '& .MuiTab-root': {
                minHeight: 40,
                padding: '8px 20px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
                  color: 'var(--mui-palette-primary-main)'
                },
                '& .MuiTab-icon': {
                  marginRight: 0.75,
                  fontSize: '1rem'
                }
              },
              '& .Mui-selected': {
                backgroundColor: 'var(--mui-palette-primary-main) !important',
                color: 'var(--mui-palette-primary-contrastText) !important',
                boxShadow: '0 2px 8px rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
                '&:hover': {
                  backgroundColor: 'var(--mui-palette-primary-dark) !important',
                  boxShadow: '0 4px 12px rgba(var(--mui-palette-primary-mainChannel) / 0.4)'
                },
                '& .MuiTab-icon': {
                  color: 'var(--mui-palette-primary-contrastText)'
                }
              }
            }}
          >
            <Tab
              icon={<FileText size={16} />}
              value='documents'
              label={t('kycDashboard.trustDocuments')}
              iconPosition='start'
            />
            <Tab
              icon={<Users size={16} />}
              value='beneficiaries'
              label={t('kycDashboard.beneficiaryManagement')}
              iconPosition='start'
            />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default TrustTabs
