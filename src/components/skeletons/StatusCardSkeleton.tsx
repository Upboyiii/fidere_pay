// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'

/**
 * 状态卡片骨架屏组件
 * 用于显示状态信息的侧边栏卡片
 */
const StatusCardSkeleton = () => {
  return (
    <Card className='mbe-6'>
      <CardContent className='p-6'>
        <Skeleton variant='text' width={100} height={24} className='mbe-4' />
        <div className='flex flex-col gap-4'>
          <div>
            <Skeleton variant='text' width='40%' height={16} />
            <Skeleton variant='rectangular' width={80} height={24} className='mts-1' />
          </div>
          <div>
            <Skeleton variant='text' width='40%' height={16} />
            <Skeleton variant='text' width='60%' height={20} className='mts-1' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatusCardSkeleton
