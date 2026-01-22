import { Grid2 as Grid } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import { DetailCardSkeleton } from '@/components/skeletons'

const UserDetailSkeleton = () => (
  <>
    <Grid size={{ xs: 12, lg: 4, md: 5 }}>
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-center flex-col gap-4'>
              <div className='flex flex-col items-center gap-4'>
                <Skeleton variant='rounded' width={120} height={120} />
                <Skeleton variant='text' width={150} height={32} />
              </div>
              <Skeleton variant='rectangular' width={80} height={28} />
            </div>
            <div className='flex flex-col items-center gap-4'>
              <div className='flex items-center gap-4 w-full'>
                <div className='w-[30%] flex justify-end'>
                  <Skeleton variant='circular' width={40} height={40} />
                </div>
                <div className='flex-1 text-left'>
                  <Skeleton variant='text' width='60%' height={24} />
                  <Skeleton variant='text' width='40%' height={16} className='mts-1' />
                </div>
              </div>
              <div className='flex items-center gap-4 w-full'>
                <div className='w-[30%] flex justify-end'>
                  <Skeleton variant='circular' width={40} height={40} />
                </div>
                <div className='flex-1 text-left'>
                  <Skeleton variant='text' width='60%' height={24} />
                  <Skeleton variant='text' width='40%' height={16} className='mts-1' />
                </div>
              </div>
            </div>
          </div>
          <div>
            <Skeleton variant='text' width={100} height={28} />
            <Skeleton variant='rectangular' width='100%' height={1} className='mts-2 mb-4' />
            <div className='flex flex-col gap-4'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Skeleton variant='text' width={80} height={20} />
                <Skeleton variant='text' width={150} height={20} />
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Skeleton variant='text' width={80} height={20} />
                <Skeleton variant='text' width={200} height={20} />
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Skeleton variant='text' width={80} height={20} />
                <Skeleton variant='text' width={100} height={20} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Grid>
    <Grid size={{ xs: 12, lg: 8, md: 7 }}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex gap-4 border-b border-[var(--mui-palette-customColors-infoCardBorder)]'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} variant='rectangular' width={100} height={40} />
            ))}
          </div>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DetailCardSkeleton titleSections={3} fieldGroups={2} fieldsPerGroup={4} showActions={false} />
        </Grid>
      </Grid>
    </Grid>
  </>
)
export default UserDetailSkeleton
