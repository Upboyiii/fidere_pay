// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { formatDate } from 'date-fns/format'
import CircularProgress from '@mui/material/CircularProgress'
// Component Imports
import { UserLeftOverviewCode } from '@views/kyc/userManagement/userManagementDetailPage/components/UserLeftOverview'
import { useTranslate } from '@/contexts/DictionaryContext'

// Icon Imports
import { User, Calendar, Send } from 'lucide-react'

// Types
interface ProcessLeftOverviewProps {
  userData: any
  reviewDecision: string
  reviewNotes: string
  onReviewDecisionChange: (decision: string) => void
  onReviewNotesChange: (notes: string) => void
  onSubmitDecision: () => void
  careerList: any
  btnLoading: boolean
}

/**
 * 处理审核左侧概览组件
 * @param userData 用户数据
 * @param reviewDecision 审核决定
 * @param reviewNotes 审核说明
 * @param onReviewDecisionChange 修改审核决定回调
 * @param onReviewNotesChange 修改审核说明回调
 * @param onSubmitDecision 提交审核决定回调
 */
const ProcessLeftOverview = ({
  userData,
  reviewDecision,
  reviewNotes,
  onReviewDecisionChange,
  onReviewNotesChange,
  onSubmitDecision,
  careerList,
  btnLoading
}: ProcessLeftOverviewProps) => {
  const t = useTranslate()
  // const errorFieldsCount = Object.values(fieldErrors).filter(Boolean).length

  return (
    <Grid container spacing={6}>
      {/* User Details Card */}
      <UserLeftOverviewCode
        userData={{
          ...userData,
          nameLabel: userData?.nickName,
          updateTime: userData?.kycTime,
          kycTime: userData?.createdAt
        }}
        careerList={careerList}
      />

      {/* 审核决定 Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Send size={20} className='text-primary' />
              <Typography variant='h6' className='font-semibold'>
                {t('processingReviews.reviewDecision')} {/* 审核决定 */}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                {t('processingReviews.selectReviewDecision')} {/* 请选择审核决定 */}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>{t('processingReviews.reviewDecision')}</InputLabel> {/* 审核决定 */}
                <Select
                  label={t('processingReviews.reviewDecision')}
                  value={reviewDecision}
                  onChange={e => onReviewDecisionChange(e.target.value)}
                >
                  {' '}
                  {/* 审核决定 */}
                  <MenuItem value='approve'>{t('processingReviews.approveReview')}</MenuItem> {/* 通过审核 */}
                  <MenuItem value='reject'>{t('processingReviews.rejectApplication')}</MenuItem> {/* 拒绝申请 */}
                  {/* <MenuItem value='return'>打回修改</MenuItem> */}
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('processingReviews.decisionNotes')} // 决定说明
              placeholder={t('processingReviews.decisionNotesPlaceholder')} // 请说明审核决定的原因...
              value={reviewNotes}
              onChange={e => onReviewNotesChange(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              variant='contained'
              startIcon={<Send size={16} />}
              onClick={onSubmitDecision}
              disabled={!reviewDecision}
              color={reviewDecision === 'approve' ? 'success' : reviewDecision === 'reject' ? 'error' : 'primary'}
              fullWidth
            >
              {btnLoading && <CircularProgress size={16} />} {t('processingReviews.confirmSubmit')} {/* 确认提交 */}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProcessLeftOverview
