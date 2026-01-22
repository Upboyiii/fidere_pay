'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

export type ChartType = 'line' | 'bar'

export interface CardStatWithChartProps {
  stats: string
  title: string
  subtitle?: string
  trendNumber?: string
  trend?: 'positive' | 'negative'
  chartData: {
    categories: string[]
    series: number[]
  }
  chartType?: ChartType
  chartColor?: string
}

const CardStatWithChart = (props: CardStatWithChartProps) => {
  // Props
  const { 
    stats, 
    title, 
    subtitle,
    trendNumber, 
    trend = 'positive',
    chartData, 
    chartType = 'line',
    chartColor 
  } = props

  // Hooks
  const theme = useTheme()

  // Determine color
  const color = chartColor || 'var(--mui-palette-primary-main)'
  const trackBgColor = 'var(--mui-palette-customColors-trackBg)'

  // Chart options for line chart (with enhanced styling like Materio template)
  const lineOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: {
      enabled: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex]
        const category = chartData.categories[dataPointIndex] || ''
        return `
          <div style="padding: 8px 12px; background: var(--mui-palette-background-paper); border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <div style="font-size: 12px; color: var(--mui-palette-text-secondary); margin-bottom: 4px;">${category}</div>
            <div style="font-size: 14px; font-weight: 600; color: var(--mui-palette-text-primary);">¥${value}M</div>
          </div>
        `
      }
    },
    grid: {
      strokeDashArray: 6,
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -10,
        left: -7,
        right: 5,
        bottom: 5
      }
    },
    stroke: {
      width: 3,
      lineCap: 'butt',
      curve: 'straight'
    },
    colors: [color],
    markers: {
      size: 0
    },
    xaxis: {
      categories: chartData.categories,
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    }
  }

  // Chart options for bar chart (with distributed styling)
  const barOptions: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: false,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: {
      enabled: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex]
        const category = chartData.categories[dataPointIndex] || ''
        return `
          <div style="padding: 8px 12px; background: var(--mui-palette-background-paper); border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <div style="font-size: 12px; color: var(--mui-palette-text-secondary); margin-bottom: 4px;">${category}</div>
            <div style="font-size: 14px; font-weight: 600; color: var(--mui-palette-text-primary);">¥${value}M</div>
          </div>
        `
      }
    },
    grid: {
      show: false,
      padding: {
        top: -10,
        left: -3,
        right: -2,
        bottom: 5
      }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    colors: [color],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '30%',
        borderRadius: 4,
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all',
        distributed: false,
        colors: {
          backgroundBarRadius: 5,
          backgroundBarColors: [trackBgColor, trackBgColor, trackBgColor, trackBgColor, trackBgColor, trackBgColor, trackBgColor]
        }
      }
    },
    xaxis: {
      categories: chartData.categories,
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: { show: false },
    responsive: [
      {
        breakpoint: 900,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '22%'
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '18%'
            }
          }
        }
      }
    ]
  }

  const options = chartType === 'line' ? lineOptions : barOptions
  const series = [{ data: chartData.series }]

  return (
    <Card className='bs-full'>
      <CardContent className='flex flex-col gap-1'>
        <div className='flex flex-col'>
          <Typography variant='h4'>{stats}</Typography>
          {trendNumber && (
            <Typography 
              variant='caption'
              color={trend === 'negative' ? 'error.main' : 'success.main'}
              className='font-medium'
            >
              {trend === 'negative' ? '' : '+'}
              {trendNumber}
            </Typography>
          )}
        </div>
        <div className='flex justify-center items-center'>
          <AppReactApexCharts 
            type={chartType} 
            height={88} 
            width='100%' 
            options={options} 
            series={series} 
          />
        </div>
        <div className='flex flex-col items-center gap-0.5'>
          <Typography color='text.primary' className='font-medium text-center'>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='caption' color='text.secondary' className='text-center'>
              {subtitle}
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatWithChart

