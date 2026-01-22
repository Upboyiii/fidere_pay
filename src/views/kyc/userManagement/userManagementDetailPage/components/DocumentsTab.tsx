// React Imports
import React from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// Icon Imports
import { FileText } from 'lucide-react'
import { useTranslate } from '@/contexts/DictionaryContext'

// Types
interface Document {
  title: string
  status: number
  statusLabel: string
  signingUrl: string
}

interface ProcessDocumentsTabProps {
  documents: Document[]
}

/**
 * 文档审核 Tab 组件
 * @param documents 文档列表
 */
const DocumentsTab = ({ documents }: ProcessDocumentsTabProps) => {
  const t = useTranslate()
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FileText size={20} className='text-primary' />
              <Typography variant='h6' className='font-semibold'>
                {t('userManagement.documentReview')} {/* 文档审核 */}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {documents?.length ? (
                documents?.map((doc, index) => {
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Box
                        className='rounded-lg border p-4'
                        sx={{
                          border: '1px solid #e0e0e0',
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FileText size={16} color='#666' />
                            <Typography variant='body2' className='font-medium'>
                              {doc?.title}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0 }}>
                          <Chip
                            label={doc.statusLabel}
                            size='small'
                            color={doc.status == 1 ? 'success' : 'warning'}
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Button
                            size='small'
                            variant='text'
                            sx={{ fontSize: '0.7rem' }}
                            onClick={() => window?.open(doc?.signingUrl, '_blank')}
                          >
                            {t('userManagement.viewDocument')} {/* 查看文档 */}
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  )
                })
              ) : (
                <Box
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    flex: 1,
                    backgroundColor: 'var(--mui-palette-customColors-infoCardBg)'
                  }}
                >
                  <Typography variant='body1' sx={{ color: '#64748b', fontSize: '0.9375rem' }}>
                    {t('userManagement.noDocuments')} {/* 暂无文档 */}
                  </Typography>
                </Box>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DocumentsTab
