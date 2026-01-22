'use client'

import { Typography, Card, CardContent, Chip, LinearProgress, Alert } from '@mui/material'
import { AlertTriangle, Shield, TrendingUp, AlertCircle } from 'lucide-react'

interface RiskFactor {
  name: string
  level: 'low' | 'medium' | 'high' | 'critical'
  description: string
  score: number
}

interface RiskAssessmentProps {
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  factors: RiskFactor[]
  recommendations?: string[]
}

export function RiskAssessment({ overallRisk, riskScore, factors, recommendations }: RiskAssessmentProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical':
        return '严重风险'
      case 'high':
        return '高风险'
      case 'medium':
        return '中风险'
      case 'low':
        return '低风险'
      default:
        return level
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return AlertCircle
      case 'high':
        return AlertTriangle
      case 'medium':
        return TrendingUp
      case 'low':
        return Shield
      default:
        return Shield
    }
  }

  const OverallRiskIcon = getRiskIcon(overallRisk)

  return (
    <div>
      <Card
        className={`mbe-6 border-2 ${
          overallRisk === 'critical'
            ? 'border-red-500 bg-red-50'
            : overallRisk === 'high'
              ? 'border-orange-500 bg-orange-50'
              : overallRisk === 'medium'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-green-500 bg-green-50'
        }`}
      >
        <CardContent className='p-6'>
          <div className='flex items-center justify-between mbe-4'>
            <div className='flex items-center gap-4'>
              <OverallRiskIcon
                size={32}
                className={
                  overallRisk === 'critical'
                    ? 'text-red-500'
                    : overallRisk === 'high'
                      ? 'text-orange-500'
                      : overallRisk === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                }
              />
              <div>
                <Typography
                  variant='h6'
                  className={`font-semibold ${
                    overallRisk === 'critical'
                      ? 'text-red-500'
                      : overallRisk === 'high'
                        ? 'text-orange-500'
                        : overallRisk === 'medium'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                  }`}
                >
                  {getRiskLabel(overallRisk)}
                </Typography>
                <Typography
                  variant='caption'
                  className={
                    overallRisk === 'critical'
                      ? 'text-red-500'
                      : overallRisk === 'high'
                        ? 'text-orange-500'
                        : overallRisk === 'medium'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                  }
                >
                  综合风险评分
                </Typography>
              </div>
            </div>
            <div className='text-right'>
              <Typography
                variant='h4'
                className={`font-bold ${
                  overallRisk === 'critical'
                    ? 'text-red-500'
                    : overallRisk === 'high'
                      ? 'text-orange-500'
                      : overallRisk === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                }`}
              >
                {riskScore}
              </Typography>
              <Typography
                variant='caption'
                className={
                  overallRisk === 'critical'
                    ? 'text-red-500'
                    : overallRisk === 'high'
                      ? 'text-orange-500'
                      : overallRisk === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                }
              >
                / 100
              </Typography>
            </div>
          </div>
          <LinearProgress
            variant='determinate'
            value={riskScore}
            color={getRiskColor(overallRisk) as any}
            className='h-2 rounded'
          />
        </CardContent>
      </Card>

      <Typography variant='h6' className='font-semibold mbe-4'>
        风险因素分析
      </Typography>

      <div className='flex flex-col gap-4 mbe-6'>
        {factors.map((factor, index) => {
          const FactorIcon = getRiskIcon(factor.level)

          return (
            <Card key={index} className='border border-gray-200'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between mbe-2'>
                  <div className='flex items-center gap-2'>
                    <FactorIcon
                      size={18}
                      className={
                        factor.level === 'critical'
                          ? 'text-red-500'
                          : factor.level === 'high'
                            ? 'text-orange-500'
                            : factor.level === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                      }
                    />
                    <Typography variant='body2' className='font-semibold'>
                      {factor.name}
                    </Typography>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Chip label={getRiskLabel(factor.level)} size='small' color={getRiskColor(factor.level) as any} />
                    <Typography
                      variant='body2'
                      className={`font-semibold ${
                        factor.level === 'critical'
                          ? 'text-red-500'
                          : factor.level === 'high'
                            ? 'text-orange-500'
                            : factor.level === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                      }`}
                    >
                      {factor.score}分
                    </Typography>
                  </div>
                </div>
                <Typography variant='body2' color='text.secondary' className='leading-relaxed'>
                  {factor.description}
                </Typography>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {recommendations && recommendations.length > 0 && (
        <Alert severity='info'>
          <Typography variant='body2' className='font-semibold mbe-2'>
            审核建议:
          </Typography>
          <ul className='m-0 pl-4'>
            {recommendations.map((rec, index) => (
              <li key={index} className='mbe-1'>
                <Typography variant='body2'>{rec}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  )
}
