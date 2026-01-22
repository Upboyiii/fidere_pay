'use client'

// React Imports
import { useMemo, useRef } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import TableComponent, { TableInstance } from '@/components/table'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'

// Icon Imports
import { Eye, Clock, Users, FileText } from 'lucide-react'

// Utils Imports
import { getInitials } from '@/utils/getInitials'
import { formatDate } from 'date-fns/format'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import type { TrustListItem } from '@server/trust'

interface TrustTableProps {
  /** 表格数据 */
  data: TrustListItem[]
  /** 加载状态 */
  loading?: boolean
  /** 总条数 */
  total: number
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 表格引用 */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

/**
 * 信托记录表格组件
 * @param data - 表格数据
 * @param loading - 加载状态
 * @param total - 总条数
 * @param onPageChange - 分页变化回调
 * @param tableRef - 表格引用
 */
const TrustTable = ({ data, loading = false, total, onPageChange, tableRef: externalTableRef }: TrustTableProps) => {
  const t = useTranslate()
  const internalTableRef = useRef<TableInstance | null>(null)
  const tableRef = externalTableRef || internalTableRef
  const columnHelper = createColumnHelper<TrustListItem>()

  // 表格列定义
  const columns = useMemo<ColumnDef<TrustListItem, any>[]>(
    () => [
      columnHelper.accessor('userName', {
        header: t('kycDashboard.userInfo'),
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(row.original.userName)}
            </CustomAvatar>
            <div className='flex flex-col gap-1'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.userName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ID: {row.original.userId}
              </Typography>
              {row.original.userEmail && (
                <Typography variant='body2' color='text.secondary' className='truncate max-w-[200px]'>
                  {row.original.userEmail}
                </Typography>
              )}
            </div>
          </div>
        )
      }),
      columnHelper.accessor('trustName', {
        header: t('kycDashboard.trustName'),
        cell: ({ row }) => <Typography color='text.primary'>{row.original.trustName}</Typography>
      }),
      columnHelper.accessor('trustNumber', {
        header: t('kycDashboard.trustNumber'),
        cell: ({ row }) => <Typography color='text.primary'>{row.original.trustNumber}</Typography>
      }),
      columnHelper.accessor('createTime', {
        header: t('kycDashboard.establishmentTime'),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Clock className='w-4 h-4 text-textSecondary' />
            <Typography variant='body1'>
              {row.original.createTime ? formatDate(new Date(row.original.createTime), 'yyyy/MM/dd') : '-'}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('beneficiaryCount', {
        header: t('kycDashboard.beneficiaries'),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Users className='w-4 h-4 text-textSecondary' />
            <Typography variant='body1'>{row.original.beneficiaryCount}人</Typography>
          </div>
        )
      }),
      columnHelper.accessor('documentCount', {
        header: t('kycDashboard.documents'),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-textSecondary' />
            <Typography variant='body1'>{row.original.documentCount}份</Typography>
          </div>
        )
      }),
      columnHelper.accessor('pendingBeneficiaryCount', {
        header: t('kycDashboard.pendingProcessing'),
        cell: ({ row }) => {
          const { pendingBeneficiaryCount, pendingDocumentCount } = row.original
          const hasPending = (pendingBeneficiaryCount ?? 0) > 0 || (pendingDocumentCount ?? 0) > 0

          if (!hasPending) {
            return (
              <Typography variant='body2' color='text.secondary'>
                {t('kycDashboard.noPendingProcessing')}
              </Typography>
            )
          }

          return (
            <div className='flex items-center gap-2 flex-wrap'>
              {(pendingBeneficiaryCount ?? 0) > 0 && (
                <Chip
                  variant='tonal'
                  label={`${pendingBeneficiaryCount} ${t('kycDashboard.pendingReview')}`}
                  size='small'
                  sx={{
                    backgroundColor: '#fff3e0',
                    color: '#f57c00',
                    fontWeight: 500
                  }}
                />
              )}
              {(pendingDocumentCount ?? 0) > 0 && (
                <Chip
                  variant='tonal'
                  label={`${pendingDocumentCount} ${t('kycDashboard.pendingSignature')}`}
                  size='small'
                  sx={{
                    backgroundColor: '#fce4ec',
                    color: '#c2185b',
                    fontWeight: 500
                  }}
                />
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('trustNumber', {
        header: t('kycDashboard.action'),
        cell: ({ row }) => {
          const trustId = String(row.original.trustId)

          return (
            <RouterLinkSkip href={`/kyc/trust/${trustId}`} className='flex'>
              <Button
                variant='outlined'
                size='small'
                component='span'
                startIcon={<Eye size={16} />}
                sx={{
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5
                }}
              >
                {t('kycDashboard.viewDetails')}
              </Button>
            </RouterLinkSkip>
          )
        },
        enableSorting: false,
        id: 'action',
        meta: {
          style: { width: '120px', minWidth: '120px', maxWidth: '120px' }
        }
      })
    ],
    [t, columnHelper]
  )

  const handlePageChange = (data: any) => {
    onPageChange?.({
      pageNum: data.pageNum ?? 1,
      pageSize: data.pageSize ?? 10
    })
  }

  return (
    <Box>
      <TableComponent
        data={data}
        columns={columns}
        total={total}
        loading={loading}
        pageChange={handlePageChange}
        tableRef={tableRef}
      />
    </Box>
  )
}

export default TrustTable
