'use client'

import type React from 'react'

import { useState } from 'react'
import {
  Typography,
  Button,
  TextField,
  Chip,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  IconButton,
  FormControlLabel,
  Paper,
  TableContainer,
  Menu
} from '@mui/material'
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react'

// Mock data for Documenso templates
const documensoTemplates = [
  {
    id: 'tpl_001',
    name: '个人开户协议',
    purpose: '开户协议',
    variables: ['fullName', 'idType', 'idNumber', 'address', 'clientNoOrTemp', 'caseId'],
    lastUpdated: '2024-01-10'
  },
  {
    id: 'tpl_002',
    name: '隐私政策确认',
    purpose: '隐私政策',
    variables: ['fullName', 'email', 'caseId'],
    lastUpdated: '2024-01-08'
  },
  {
    id: 'tpl_003',
    name: '风险披露声明',
    purpose: '风险披露',
    variables: ['fullName', 'clientNoOrTemp', 'riskLevel'],
    lastUpdated: '2024-01-05'
  }
]

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [docTemplateDialogOpen, setDocTemplateDialogOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, template: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEditTemplate = () => {
    handleMenuClose()
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label='Documenso 模板' />
        </Tabs>
      </Box>

      {/* Documenso Templates */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 3 }}>
          {/* <Typography variant='h6'>Documenso 模板管理</Typography> */}
          <Button variant='contained' startIcon={<Plus size={16} />} onClick={() => setDocTemplateDialogOpen(true)}>
            新建模板
          </Button>
        </Box>

        <TableContainer component={Paper} variant='outlined'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>模板ID</TableCell>
                <TableCell>用途</TableCell>
                <TableCell>变量映射</TableCell>
                <TableCell>最后更新</TableCell>
                <TableCell width={48}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documensoTemplates.map(template => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Typography variant='body2'>{template.id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {template.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {template.purpose}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {template.variables.slice(0, 3).map(variable => (
                        <Chip key={variable} label={variable} variant='outlined' size='small' />
                      ))}
                      {template.variables.length > 3 && (
                        <Chip label={`+${template.variables.length - 3}`} variant='outlined' size='small' />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {template.lastUpdated}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size='small' onClick={e => handleMenuClick(e, template)}>
                      <MoreHorizontal size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Menu for table actions */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditTemplate}>
          <Edit size={16} style={{ marginRight: 8 }} />
          编辑
        </MenuItem>
        <MenuItem
          onClick={() => {
            /* Delete */ handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          删除
        </MenuItem>
      </Menu>

      {/* Documenso Template Dialog */}
      <Dialog open={docTemplateDialogOpen} onClose={() => setDocTemplateDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box>
            <Typography component='div' sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
              新建 Documenso 模板
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              配置文档签署模板和变量映射
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label='模板名称' placeholder='输入模板名称' size='small' />

            <FormControl fullWidth size='small'>
              <InputLabel>用途</InputLabel>
              <Select label='用途'>
                <MenuItem value='agreement'>开户协议</MenuItem>
                <MenuItem value='privacy'>隐私政策</MenuItem>
                <MenuItem value='risk'>风险披露</MenuItem>
                <MenuItem value='tax'>税务声明</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                变量映射
              </Typography>
              <Grid container spacing={1}>
                {['fullName', 'idType', 'idNumber', 'address', 'companyName', 'clientNoOrTemp', 'caseId'].map(
                  variable => (
                    <Grid item xs={6} key={variable}>
                      <FormControlLabel
                        control={<Checkbox size='small' />}
                        label={
                          <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                            {variable}
                          </Typography>
                        }
                      />
                    </Grid>
                  )
                )}
              </Grid>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label='模板描述'
              placeholder='描述此模板的用途和使用场景...'
              size='small'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocTemplateDialogOpen(false)}>取消</Button>
          <Button variant='contained' onClick={() => setDocTemplateDialogOpen(false)}>
            创建模板
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
