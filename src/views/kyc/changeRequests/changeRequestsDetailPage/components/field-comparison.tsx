'use client'

import { Typography, Card, CardContent, Chip, Checkbox, FormControlLabel, TextField, Collapse } from '@mui/material'
import { AlertCircle, ArrowRight } from 'lucide-react'

interface FieldChange {
  fieldName: string
  fieldLabel: string
  oldValue: string
  newValue: string
  changeType: 'modify' | 'add' | 'delete'
  category?: string
}

interface FieldComparisonProps {
  changes: FieldChange[]
  fieldIssues: Record<string, { hasIssue: boolean; reason: string }>
  onFieldIssueToggle: (fieldName: string) => void
  onFieldReasonChange: (fieldName: string, reason: string) => void
  readOnly?: boolean
}

export function FieldComparison({
  changes,
  fieldIssues,
  onFieldIssueToggle,
  onFieldReasonChange,
  readOnly = false
}: FieldComparisonProps) {
  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'modify':
        return 'primary'
      case 'add':
        return 'success'
      case 'delete':
        return 'error'
      default:
        return 'default'
    }
  }

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'modify':
        return '修改'
      case 'add':
        return '新增'
      case 'delete':
        return '删除'
      default:
        return type
    }
  }

  const groupedChanges = changes.reduce(
    (acc, change) => {
      const category = change.category || '其他'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(change)
      return acc
    },
    {} as Record<string, FieldChange[]>
  )

  return (
    <div>
      {Object.entries(groupedChanges).map(([category, categoryChanges]) => (
        <div key={category} className='mbe-8'>
          <div className='flex flex-col gap-4'>
            {categoryChanges.map((change, index) => {
              const hasIssue = fieldIssues[change.fieldName]?.hasIssue

              return (
                <Card
                  key={index}
                  className={`transition-all hover:shadow-md ${
                    hasIssue ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-200'
                  }`}
                >
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between mbe-4'>
                      <div className='flex items-center gap-4'>
                        <Typography variant='body1' className='font-semibold'>
                          {change.fieldLabel}
                        </Typography>
                        <Chip
                          label={getChangeTypeLabel(change.changeType)}
                          size='small'
                          color={getChangeTypeColor(change.changeType) as any}
                        />
                      </div>
                      {!readOnly && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={hasIssue || false}
                              onChange={() => onFieldIssueToggle(change.fieldName)}
                              size='small'
                              color={hasIssue ? 'error' : 'default'}
                            />
                          }
                          label={
                            <Typography variant='body2' color={hasIssue ? 'error' : 'text.secondary'}>
                              标记问题
                            </Typography>
                          }
                        />
                      )}
                    </div>

                    <Typography variant='caption' color='text.secondary' className='block mbe-4'>
                      字段名: {change.fieldName}
                    </Typography>

                    <div className='flex items-center gap-4'>
                      <div className='flex-1'>
                        <Typography variant='caption' color='text.secondary' className='block mbe-2'>
                          原始值
                        </Typography>
                        <div className='p-4 bg-gray-50 rounded border border-gray-200 min-h-[60px] flex items-center'>
                          <Typography
                            variant='body2'
                            className={change.changeType === 'delete' ? 'text-red-500 line-through' : 'text-gray-600'}
                          >
                            {change.oldValue || '-'}
                          </Typography>
                        </div>
                      </div>

                      <div className='flex items-center justify-center w-10'>
                        <ArrowRight size={20} className='text-gray-400' />
                      </div>

                      <div className='flex-1'>
                        <Typography variant='caption' color='text.secondary' className='block mbe-2'>
                          新值
                        </Typography>
                        <div
                          className={`p-4 rounded border min-h-[60px] flex items-center ${
                            change.changeType === 'add'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <Typography variant='body2' className='text-green-700 font-medium'>
                            {change.newValue || '-'}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <Collapse in={hasIssue}>
                      <div className='mts-4 p-4 bg-red-50 rounded border border-red-200'>
                        <div className='flex items-center gap-2 mbe-2'>
                          <AlertCircle size={16} className='text-red-500' />
                          <Typography variant='body2' className='font-semibold text-red-500'>
                            问题说明
                          </Typography>
                        </div>
                        {readOnly ? (
                          <Typography variant='body2' className='text-red-700'>
                            {fieldIssues[change.fieldName]?.reason || '未填写问题原因'}
                          </Typography>
                        ) : (
                          <TextField
                            fullWidth
                            size='small'
                            multiline
                            rows={2}
                            placeholder='请详细说明此字段存在的问题...'
                            value={fieldIssues[change.fieldName]?.reason || ''}
                            onChange={e => onFieldReasonChange(change.fieldName, e.target.value)}
                          />
                        )}
                      </div>
                    </Collapse>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
