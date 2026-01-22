'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Icon Imports
import { Eye, Download, ArrowUp, ArrowDown, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'
// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import TableFilters from './TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type ChangeRequest = {
  id: string
  userId: string
  userName: string
  requestType: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  changedFields: number
  reviewer?: string
  riskLevel?: string
}

type ChangeRequestWithAction = ChangeRequest & {
  action?: string
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Column Definitions
const columnHelper = createColumnHelper<ChangeRequestWithAction>()

const ChangeRequestTable = ({ tableData }: { tableData?: ChangeRequest[] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(tableData || [])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const router = useRouter()
  // Hooks
  const { lang: locale } = useParams()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#f57c00', bg: '#fff3e0', label: '待处理' }
      case 'in_review':
        return { color: '#1976d2', bg: '#e3f2fd', label: '审核中' }
      case 'approved':
        return { color: '#388e3c', bg: '#e8f5e8', label: '已批准' }
      case 'rejected':
        return { color: '#d32f2f', bg: '#ffebee', label: '已拒绝' }
      default:
        return { color: '#666', bg: '#f5f5f5', label: status }
    }
  }

  const getPriorityColor = (priority: string): ThemeColor => {
    switch (priority) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'success'
      default:
        return 'primary'
    }
  }

  // 处理搜索变化
  const handleSearchChange = (query: string) => {
    setGlobalFilter(query)

    // 对数据进行搜索过滤
    const filtered = data.filter(request => {
      if (!query) return true
      const searchLower = query.toLowerCase()
      return (
        request.id.toLowerCase().includes(searchLower) ||
        request.userName.toLowerCase().includes(searchLower) ||
        request.userId.toLowerCase().includes(searchLower)
      )
    })

    setFilteredData(filtered)
  }

  const columns = useMemo<ColumnDef<ChangeRequestWithAction, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: '工单ID',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('userName', {
        header: '用户信息',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(row.original.userName)}
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.userName}
              </Typography>
              <Typography variant='body2'>{row.original.userId}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('requestType', {
        header: '申请类型',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-textSecondary' />
            <Typography>{row.original.requestType}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('changedFields', {
        header: '变更字段数',
        cell: ({ row }) => (
          <Chip label={`${row.original.changedFields} 个字段`} size='small' color='primary' variant='outlined' />
        )
      }),
      columnHelper.accessor('riskLevel', {
        header: '风险等级',
        cell: ({ row }) => <Typography variant='body2'>{row.original.riskLevel || '-'}</Typography>
      }),
      columnHelper.accessor('priority', {
        header: '优先级',
        cell: ({ row }) => (
          <Chip
            label={row.original.priority}
            size='small'
            color={getPriorityColor(row.original.priority)}
            variant='outlined'
          />
        )
      }),
      columnHelper.accessor('submittedAt', {
        header: '提交时间',
        cell: ({ row }) => <Typography variant='body2'>{row.original.submittedAt}</Typography>
      }),
      columnHelper.accessor('reviewer', {
        header: '审核员',
        cell: ({ row }) => <Typography variant='body2'>{row.original.reviewer || '-'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: '状态',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={getStatusColor(row.original.status).label || row.original.status}
            size='small'
            sx={{
              backgroundColor: getStatusColor(row.original.status).bg,
              color: getStatusColor(row.original.status).color,
              fontWeight: 500
            }}
          />
        )
      }),
      columnHelper.accessor('action', {
        header: '操作',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <Tooltip title='查看详情'>
              <IconButton>
                <RouterLinkSkip href={`/kyc/changeRequests/${row.original.id}`} className='flex'>
                  <Eye className='w-4 h-4 text-textSecondary' />
                </RouterLinkSkip>
              </IconButton>
            </Tooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredData]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <CardHeader title='资料变更工单' subheader='管理客户提交的资料修改和补件申请' />
        <TableFilters setData={setFilteredData} tableData={data} onSearchChange={handleSearchChange} />
        <Divider />
        <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
          <div></div>
          <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            {/* <Button
              color='secondary'
              variant='outlined'
              className='max-sm:is-full is-auto'
              startIcon={<Download className='w-5 h-5' />}
            >
              导出 CSV
            </Button> */}
            <Button
              variant='contained'
              className='max-sm:is-full is-auto'
              startIcon={<i className='ri-add-line' />}
              onClick={() => router.push(getLocalizedUrl('/kyc/changeRequests/create', locale as string))}
            >
              发起变更工单
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <ArrowUp className='w-5 h-5' />,
                              desc: <ArrowDown className='w-5 h-5' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    暂无数据
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className='py-3'>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>
    </>
  )
}

export default ChangeRequestTable
