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
import { User, FileText, Shield, History, Wallet } from 'lucide-react'

interface UserRightProps {
  tabContentList: { [key: string]: ReactElement }
}

const UserRight = ({ tabContentList }: UserRightProps) => {
  const t = useTranslate()
  // States
  const [activeTab, setActiveTab] = useState('basic-info')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              {/* 基本信息 */}
              <Tab icon={<User size={16} />} value='basic-info' label={t('userManagement.basicInfo')} iconPosition='start' />
              {/* 文档资料 */}
              <Tab icon={<FileText size={16} />} value='documents' label={t('userManagement.documents')} iconPosition='start' />
              {/* 白名单 */}
              <Tab icon={<Wallet size={16} />} value='whitelist' label={t('userManagement.whitelist')} iconPosition='start' />
              {/* 三方状态 */}
              <Tab icon={<Shield size={16} />} value='third-party' label={t('userManagement.thirdPartyStatus')} iconPosition='start' />
              {/* 操作记录 */}
              <Tab icon={<History size={16} />} value='operation-history' label={t('userManagement.operationHistory')} iconPosition='start' />
            </CustomTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default UserRight
