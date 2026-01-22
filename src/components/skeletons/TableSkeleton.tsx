// MUI Imports
import Skeleton from '@mui/material/Skeleton'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type TableSkeletonProps = {
  /**
   * 列数
   */
  columns?: number
  /**
   * 行数
   */
  rows?: number
  /**
   * 表格的 header groups（用于自动计算列数）
   */
  headerGroups?: Array<{ headers: Array<any> }>
}

/**
 * 表格骨架屏组件
 * 用于数据表格的加载状态
 */
const TableSkeleton = ({ columns, rows = 10, headerGroups }: TableSkeletonProps) => {
  // 从 headerGroups 自动计算列数，如果没有提供则使用 columns
  const columnCount = headerGroups?.[0]?.headers?.length || columns || 5

  return (
    <div className='overflow-x-auto'>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            {Array.from({ length: columnCount }).map((_, index) => (
              <th key={index}>
                <Skeleton variant='text' width='80%' height={24} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <td key={colIndex} className='py-3'>
                  <Skeleton variant='text' width={colIndex === 0 ? '60%' : '80%'} height={20} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableSkeleton
