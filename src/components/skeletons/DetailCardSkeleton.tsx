// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'

type DetailCardSkeletonProps = {
  /**
   * 标题行数量
   */
  titleSections?: number
  /**
   * 字段组数量
   */
  fieldGroups?: number
  /**
   * 每组字段数量
   */
  fieldsPerGroup?: number
  /**
   * 是否显示按钮区域
   */
  showActions?: boolean
}

/**
 * 详情卡片骨架屏组件
 * 用于详情页的卡片区域，包含标题、字段组、分隔线和操作按钮
 */
const DetailCardSkeleton = ({
  titleSections = 2,
  fieldGroups = 2,
  fieldsPerGroup = 6,
  showActions = true
}: DetailCardSkeletonProps) => {
  return (
    <Card className='mbe-6'>
      <CardContent className='p-6'>
        {Array.from({ length: titleSections }).map((_, sectionIndex) => (
          <div key={sectionIndex}>
            {/* 标题行 */}
            <div className='flex items-center gap-2 mbe-4'>
              <Skeleton variant='circular' width={18} height={18} />
              <Skeleton variant='text' width={100} height={20} />
            </div>

            {/* 字段组 */}
            {Array.from({ length: fieldGroups }).map((_, groupIndex) => (
              <div key={groupIndex}>
                <Grid container spacing={4}>
                  {Array.from({ length: fieldsPerGroup }).map((_, fieldIndex) => (
                    <Grid key={fieldIndex} size={{ xs: 12, sm: 6 }}>
                      <Skeleton variant='text' width='40%' height={14} />
                      <Skeleton variant='text' width='80%' height={18} className='mts-1' />
                    </Grid>
                  ))}
                </Grid>

                {/* 分隔线（不是最后一组时才显示） */}
                {groupIndex < fieldGroups - 1 && <Divider className='my-4' />}
              </div>
            ))}

            {/* 分隔线（不是最后一个标题区域时才显示） */}
            {sectionIndex < titleSections - 1 && <Divider className='my-4' />}
          </div>
        ))}

        {/* 操作按钮区域 */}
        {showActions && (
          <>
            <Divider className='my-4' />
            <div className='flex flex-wrap gap-4'>
              <Skeleton variant='rectangular' width={150} height={32} />
              <Skeleton variant='rectangular' width={100} height={32} />
              <Skeleton variant='rectangular' width={100} height={32} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default DetailCardSkeleton
