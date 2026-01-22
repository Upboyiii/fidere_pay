// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'

/**
 * 卡片骨架屏组件
 * 用于 HorizontalWithSubtitle 类型的统计卡片
 */
const CardSkeleton = () => (
  <Card>
    <CardContent className='flex justify-between gap-1'>
      <div className='flex flex-col gap-1 flex-grow'>
        <Skeleton variant='text' width='60%' height={20} />
        <Skeleton variant='text' width='40%' height={32} />
        <Skeleton variant='text' width='40%' height={32} />
      </div>
      <Skeleton variant='circular' width={42} height={42} />
    </CardContent>
  </Card>
)

export default CardSkeleton
