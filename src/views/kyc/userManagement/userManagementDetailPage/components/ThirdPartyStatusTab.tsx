// React Imports
import React from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Icon Imports
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useTranslate } from '@/contexts/DictionaryContext'

// Types
interface SumsubLivenessData {
  sumsub?: {
    reviewRejectType?: string
    rejectLabels?: string | string[]
    applicantId?: string
    correlationId?: string
    inspectionId?: string
    reviewAnswer?: string
    reviewStatus?: string
  }
}

interface ProcessThirdPartyTabProps {
  applicantId?: string
  sumsubData?: SumsubLivenessData
}

/**
 * 解析 rejectLabels 字符串
 * @param rejectLabels rejectLabels 值，可能是字符串或数组
 */
const parseRejectLabels = (rejectLabels: string | string[] | undefined): string[] => {
  if (!rejectLabels) return []
  if (Array.isArray(rejectLabels)) return rejectLabels
  try {
    const parsed = JSON.parse(rejectLabels)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * 获取审核状态信息
 * @param reviewAnswer 审核答案
 * @param reviewStatus 审核状态
 */
const getReviewStatusInfo = (reviewAnswer?: string, reviewStatus?: string, t?: any) => {
  if (reviewAnswer === 'RED') {
    return { color: 'error' as const, label: t('userManagement.verificationFailed'), icon: XCircle, bg: '#fef2f2' } // 验证失败
  }
  if (reviewAnswer === 'GREEN') {
    return { color: 'success' as const, label: t('userManagement.verificationPassed'), icon: CheckCircle, bg: '#ecfdf5' } // 验证通过
  }
  if (reviewAnswer === 'YELLOW') {
    return { color: 'warning' as const, label: t('userManagement.needsReview'), icon: AlertTriangle, bg: '#fffbeb' } // 需要复审
  }
  if (reviewStatus === 'onHold') {
    return { color: 'warning' as const, label: t('userManagement.verificationPaused'), icon: Clock, bg: '#fffbeb' } // 暂停验证
  }
  return { color: 'default' as const, label: t('userManagement.unknownStatus'), icon: Clock, bg: '#f9fafb' } // 未知状态
}

/**
 * 字段配置类型
 */
interface FieldConfig {
  /** 字段键名 */
  key: string
  /** 字段标签 */
  label: string
  /** 获取字段值的函数 */
  getValue: (data: any) => any
  /** Grid 大小配置 */
  gridSize: { xs: number; sm: number }
  /** 所在行数（1-4），用于判断是否需要添加上边距 */
  row: number
  /** 是否高亮显示（关联ID特殊样式） */
  isHighlight?: boolean
  /** 渲染类型：text-文本，chip-Chip组件，labels-标签数组 */
  renderType: 'text' | 'chip' | 'labels'
  /** 是否显示（用于条件渲染） */
  shouldShow?: (data: any) => boolean
}

/**
 * 第三方验证状态 Tab 组件
 * @param userId 用户ID
 * @param applicantId 申请人ID
 * @param sumsubData Sumsub 数据
 */
const ProcessThirdPartyTab = ({ sumsubData }: ProcessThirdPartyTabProps) => {
  const t = useTranslate()
  const sumsub = sumsubData?.sumsub
  const rejectLabels = parseRejectLabels(sumsub?.rejectLabels)
  const statusInfo = getReviewStatusInfo(sumsub?.reviewAnswer, sumsub?.reviewStatus, t)

  /**
   * 字段配置数组
   */
  const fieldConfigs: FieldConfig[] = React.useMemo(() => [
    {
      key: 'applicantId',
      label: t('userManagement.applicantId'), // 申请人ID
      getValue: data => data?.applicantId,
      gridSize: { xs: 12, sm: 6 },
      row: 1,
      renderType: 'text',
      shouldShow: data => !!data?.applicantId
    },
    {
      key: 'correlationId',
      label: t('userManagement.correlationId'), // 关联ID
      getValue: data => data?.correlationId,
      gridSize: { xs: 12, sm: 6 },
      row: 1,
      isHighlight: true,
      renderType: 'text',
      shouldShow: data => !!data?.correlationId
    },
    {
      key: 'inspectionId',
      label: t('userManagement.inspectionId'), // 检查ID
      getValue: data => data?.inspectionId,
      gridSize: { xs: 12, sm: 6 },
      row: 2,
      renderType: 'text',
      shouldShow: data => !!data?.inspectionId
    },
    {
      key: 'reviewAnswer',
      label: t('userManagement.reviewConclusion'), // 审核结论
      getValue: data => data?.reviewAnswer,
      gridSize: { xs: 12, sm: 6 },
      row: 2,
      renderType: 'chip',
      shouldShow: data => !!data?.reviewAnswer
    },
    {
      key: 'reviewStatus',
      label: t('userManagement.reviewStatus'), // 审核状态
      getValue: data => data?.reviewStatus,
      gridSize: { xs: 12, sm: 6 },
      row: 3,
      renderType: 'text',
      shouldShow: data => !!data?.reviewStatus
    },
    {
      key: 'reviewRejectType',
      label: t('userManagement.rejectType'), // 拒绝类型
      getValue: data => data?.reviewRejectType,
      gridSize: { xs: 12, sm: 6 },
      row: 3,
      renderType: 'text',
      shouldShow: data => !!data?.reviewRejectType
    },
    {
      key: 'rejectLabels',
      label: t('userManagement.rejectReason'), // 拒绝原因
      getValue: () => rejectLabels,
      gridSize: { xs: 12, sm: 12 },
      row: 5,
      renderType: 'labels',
      shouldShow: () => rejectLabels.length > 0
    }
  ], [t, rejectLabels])

  /**
   * 渲染字段值
   * @param config 字段配置
   * @param value 字段值
   */
  const renderFieldValue = (config: FieldConfig, value: any) => {
    if (config.renderType === 'chip') {
      return value === 'RED' ? (
        <Chip
          label={value}
          sx={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '20px',
            borderRadius: '12px',
            '& .MuiChip-label': {
              px: 2,
              py: 1
            }
          }}
        />
      ) : (
        <Chip
          label={value}
          color={statusInfo.color}
          size='medium'
          sx={{
            height: '20px',
            borderRadius: '12px',
            '& .MuiChip-label': {
              px: 2,
              py: 1
            }
          }}
        />
      )
    }

    if (config.renderType === 'labels') {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {(value as string[]).map((label, index) => (
            <Chip
              key={index}
              label={label}
              sx={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '0.75rem',
                height: '24px',
                borderRadius: '12px',
                '& .MuiChip-label': {
                  px: 1.5,
                  py: 0
                }
              }}
            />
          ))}
        </Box>
      )
    }

    return (
      <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
        {value}
      </Typography>
    )
  }

  /**
   * 渲染字段
   * @param config 字段配置
   */
  const renderField = (config: FieldConfig) => {
    const value = config.getValue(sumsub)
    if (!config.shouldShow || !config.shouldShow(sumsub)) {
      return null
    }

    const boxSx = {
      p: 4,
      border: config.isHighlight ? '1px solid #bfdbfe' : '1px solid #e5e7eb',
      borderRadius: 'var(--mui-shape-customBorderRadius-lg)',
      backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
      minHeight: '80px'
    }

    const gridSx = config.row === 2 ? { mt: 1 } : {}

    return (
      <Grid key={config.key} size={config.gridSize} sx={gridSx}>
        <Box sx={boxSx}>
          <Typography
            variant='body2'
            // color='text.secondary'
            sx={{
              display: 'block',
              mb: config.renderType === 'labels' ? 2 : 2,
              fontSize: '0.8125rem',
              fontWeight: 500
            }}
          >
            {config.label}
          </Typography>
          {renderFieldValue(config, value)}
        </Box>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card
          sx={{
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', flex: 1, pb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Shield size={24} className='text-primary' />
              <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                {t('userManagement.thirdPartyVerificationStatus')} {/* 第三方验证状态 */}
              </Typography>
            </Box>

            <Typography variant='body1' sx={{ mb: 5, fontSize: '0.9375rem' }}>
              {t('userManagement.viewCustomerVerificationStatus')} {/* 查看客户在Sumsub平台的验证状态 */}
            </Typography>

            {/* Sumsub身份验证状态 */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
                  {t('userManagement.sumsubIdentityVerification')} {/* Sumsub 身份验证 */}
                </Typography>
                {sumsub && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5
                    }}
                  >
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color}
                      size='medium'
                      variant='outlined'
                      sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {sumsub ? (
                  <Grid container spacing={4}>
                    {fieldConfigs.map(renderField)}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      borderRadius: 3,
                      backgroundColor: 'var(--mui-palette-customColors-infoCardBg)'
                    }}
                  >
                    <Typography variant='body1' sx={{ color: '#64748b', fontSize: '0.9375rem' }}>
                      {t('userManagement.noSumsubVerificationData')} {/* 暂无 Sumsub 验证数据 */}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProcessThirdPartyTab
