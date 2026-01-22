'use client'

// React Imports
import type { ReactElement } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

interface ReviewRightProps {
  tabContentList: { [key: string]: ReactElement }
}

const ReviewRight = ({ tabContentList }: ReviewRightProps) => {
  return (
    <Grid container spacing={6}>
      {/* 审核进度 */}
      <Grid size={{ xs: 12 }}>{tabContentList.progress}</Grid>

      {/* 第三方验证 */}
      <Grid size={{ xs: 12 }}>{tabContentList.verification}</Grid>

      {/* 审核步骤 */}
      <Grid size={{ xs: 12 }}>{tabContentList.steps}</Grid>
    </Grid>
  )
}

export default ReviewRight
