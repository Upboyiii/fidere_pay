// MUI Imports
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

type TreeSkeletonProps = {
  /**
   * 节点数量
   */
  nodes?: number
  /**
   * 是否显示多层级结构
   */
  showMultiLevel?: boolean
}

/**
 * 树形骨架屏组件
 * 用于树形列表的加载状态，支持多层级结构
 * @param nodes - 节点数量，默认8个
 * @param showMultiLevel - 是否显示多层级结构，默认true
 */
const TreeSkeleton = ({ nodes = 12, showMultiLevel = true }: TreeSkeletonProps) => {
  /**
   * 渲染树节点骨架
   */
  const renderNode = (index: number) => {
    // 根据层级决定缩进，模拟树形结构
    const level = showMultiLevel ? (index % 3 === 0 ? 0 : index % 3 === 1 ? 1 : 2) : 0
    const paddingLeft = level * 16 + 8
    // 基于索引计算稳定的宽度，避免使用 Math.random()
    const widthPercent = 60 + (index % 4) * 8

    return (
      <Box key={index} className='flex items-center gap-2 p-2' style={{ paddingLeft: `${paddingLeft}px` }}>
        {/* 展开/收起图标占位 */}
        <Skeleton variant='circular' width={16} height={16} />
        {/* 节点文本 */}
        <Skeleton variant='text' width={`${widthPercent}%`} height={20} />
      </Box>
    )
  }

  return <Box className='flex flex-col gap-1'>{Array.from({ length: nodes }).map((_, index) => renderNode(index))}</Box>
}

export default TreeSkeleton
