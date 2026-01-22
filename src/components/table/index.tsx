'use client'
import { useEffect, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef, Table, TableOptions } from '@tanstack/react-table'
import { TableSkeleton } from '@components/skeletons'
import classnames from 'classnames'
import tableStyles from '@core/styles/table.module.css'
import TablePagination from '@mui/material/TablePagination'

/** Table 实例类型，用于外层创建 ref 时获得类型提示 */
export type TableInstance = Table<any> & {
  /** 重置分页到第一页 */
  resetPage?: () => void
}

/** Table ref 类型，用于组件 props */
type TableComponentRef = React.MutableRefObject<TableInstance | null>

/** Table 额外配置选项类型 */
export type TableComponentPropsOptions = Partial<Omit<TableOptions<any>, 'data' | 'columns' | 'getCoreRowModel'>>

interface TableComponentProps {
  /** 表格数据 */
  data: any[]
  /** 表格列 */
  columns: ColumnDef<any>[]
  /** 表格加载状态 */
  loading?: boolean
  /** 分页变化回调 */
  pageChange?: (...params: any) => void
  /*** 总条数 */
  total: number
  /** 可选的 table 实例 ref，用于将 table 实例暴露给外层组件，便于外层控制表格 */
  tableRef?: TableComponentRef
  /** 传递给 useReactTable 的额外配置选项 */
  tableProps?: TableComponentPropsOptions
  isPagination?: boolean
}

export default function TableComponent(props: TableComponentProps) {
  const { data, columns, loading = false, total, pageChange, tableRef, tableProps, isPagination = true } = props

  // 使用 ref 来跟踪是否正在更新，避免循环更新（必须在 useReactTable 之前定义）
  const isUpdatingRef = useRef(false)
  const paginationRef = useRef({
    pageIndex: tableProps?.initialState?.pagination?.pageIndex ?? 0,
    pageSize: tableProps?.initialState?.pagination?.pageSize ?? 10
  })

  // 使用 state 管理分页状态，确保数据更新后分页状态能够保持
  const [pagination, setPagination] = useState({
    pageIndex: tableProps?.initialState?.pagination?.pageIndex ?? 0,
    pageSize: tableProps?.initialState?.pagination?.pageSize ?? 10
  })

  // 同步 pagination 到 ref
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 解构 tableProps，确保我们的分页状态管理优先级更高
  const {
    state: tablePropsState,
    onPaginationChange: tablePropsOnPaginationChange,
    initialState: tablePropsInitialState,
    ...restTableProps
  } = tableProps ?? {}

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: () => false
    },
    state: {
      ...tablePropsState,
      pagination
    },
    onPaginationChange: updater => {
      // 如果正在更新中（恢复状态），跳过更新，避免循环
      if (isUpdatingRef.current) {
        return
      }
      setPagination(prev => {
        const newPagination = typeof updater === 'function' ? updater(prev) : updater

        // 如果新的分页状态与 ref 中的不一致，说明可能是意外的重置
        if (
          newPagination.pageIndex !== paginationRef.current.pageIndex &&
          newPagination.pageIndex === 0 &&
          paginationRef.current.pageIndex > 0
        ) {
          // 恢复为 ref 中的值
          return paginationRef.current
        }

        return newPagination
      })
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    ...restTableProps
  })

  // 将 table 实例暴露给外层组件
  useEffect(() => {
    if (tableRef) {
      const defaultPageSize = tableProps?.initialState?.pagination?.pageSize ?? 10
      tableRef.current = {
        ...table,
        resetPage: () => {
          const resetPagination = { pageIndex: 0, pageSize: defaultPageSize }
          // 更新 ref
          paginationRef.current = resetPagination
          // 更新 state
          setPagination(resetPagination)
          // 更新 table 内部状态
          table.setPageIndex(0)
          table.setPageSize(defaultPageSize)
        }
      } as TableInstance
    }
  }, [table, tableRef, pageChange, tableProps?.initialState?.pagination?.pageSize])

  // 监控数据变化，确保数据更新后分页状态不被重置
  useEffect(() => {
    // 数据更新后，确保 table 的分页状态与我们的 state 一致
    // 使用 setTimeout 确保在下一个事件循环中执行，避免与 table 的内部更新冲突
    const timer = setTimeout(() => {
      if (isUpdatingRef.current) {
        return
      }

      const tablePagination = table.getState().pagination
      const currentPagination = paginationRef.current

      if (
        tablePagination.pageIndex !== currentPagination.pageIndex ||
        tablePagination.pageSize !== currentPagination.pageSize
      ) {
        isUpdatingRef.current = true

        // 暂时禁用 onPaginationChange，避免循环更新
        if (tablePagination.pageIndex !== currentPagination.pageIndex) {
          table.setPageIndex(currentPagination.pageIndex)
        }
        if (tablePagination.pageSize !== currentPagination.pageSize) {
          table.setPageSize(currentPagination.pageSize)
        }

        setTimeout(() => {
          isUpdatingRef.current = false
        }, 0)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [data, pagination, table])

  return (
    <>
      {loading ? (
        <TableSkeleton headerGroups={table.getHeaderGroups()} rows={5} />
      ) : (
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const meta = header.column.columnDef.meta as any
                    return (
                      <th key={header.id} className={meta?.className} style={meta?.style}>
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
                            </div>
                          </>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => {
                        const meta = cell.column.columnDef.meta as any
                        return (
                          <td key={cell.id} className={classnames('py-3', meta?.className)} style={meta?.style}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>
      )}
      {isPagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={total}
          rowsPerPage={pagination.pageSize}
          page={pagination.pageIndex}
          onPageChange={(_, page) => {
            // page 参数是 0-based 索引，直接使用
            const newPagination = { ...pagination, pageIndex: page }
            setPagination(newPagination)
            pageChange &&
              pageChange({
                pageNum: page + 1, // 转换为 1-based 页码传给外部
                pageSize: pagination.pageSize
              })
          }}
          onRowsPerPageChange={e => {
            const newPageSize = Number(e.target.value)
            const newPagination = { pageIndex: 0, pageSize: newPageSize }
            setPagination(newPagination)
            pageChange &&
              pageChange({
                pageNum: 1,
                pageSize: newPageSize
              })
          }}
        />
      )}
    </>
  )
}
