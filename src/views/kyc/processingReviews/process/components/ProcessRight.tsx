'use client'

// React Imports
import { useState, useEffect } from 'react'
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
import { User, FileText, Shield } from 'lucide-react'

// Types
interface ProcessRightProps {
  tabContentList: { [key: string]: ReactElement }
  info?: any
}

/**
 * 处理审核右侧 Tab 组件
 * @param tabContentList Tab 内容列表
 */
const ProcessRight = ({ tabContentList, info }: ProcessRightProps) => {
  const t = useTranslate()
  // States
  const [activeTab, setActiveTab] = useState('basic-info')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }
  useEffect(() => {
    if (info && info?.reviewStep) {
      if (info?.reviewStep == 'doc_review') {
        setActiveTab('documents')
      } else if (info?.reviewStep == 'liveness_review') {
        setActiveTab('third-party')
      }
    }
  }, [info])
  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              {/* 基本信息 */}
              <Tab icon={<User size={16} />} value='basic-info' label={t('processingReviews.basicInfo')} iconPosition='start' />
              {/* 第三方验证 */}
              {(info?.reviewStep == 'liveness_review' || info?.reviewStep == 'doc_review') && (
                <Tab icon={<Shield size={16} />} value='third-party' label={t('processingReviews.thirdPartyVerification')} iconPosition='start' />
              )}
              {/* 文档资料 */}
              {info?.reviewStep == 'doc_review' && (
                <Tab icon={<FileText size={16} />} value='documents' label={t('processingReviews.documents')} iconPosition='start' />
              )}
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

export default ProcessRight
