// MUI Imports
import Skeleton from '@mui/material/Skeleton'
import Grid from '@mui/material/Grid2'

type FormFieldSkeletonProps = {
  /**
   * 字段数量
   */
  fields?: number
  /**
   * 每行显示的字段数（响应式）
   */
  columnsPerRow?: number
}

/**
 * 表单字段骨架屏组件
 * 用于详情页、表单等需要显示多个字段的场景
 */
const FormFieldSkeleton = ({ fields = 6, columnsPerRow = 2 }: FormFieldSkeletonProps) => {
  return (
    <Grid container spacing={6}>
      {Array.from({ length: fields }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: columnsPerRow === 2 ? 6 : 4 }}>
          <Skeleton variant='text' width='40%' height={16} />
          <Skeleton variant='text' width='80%' height={20} className='mts-1' />
        </Grid>
      ))}
    </Grid>
  )
}

export default FormFieldSkeleton
