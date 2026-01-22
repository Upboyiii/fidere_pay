import type { DepartmentNode } from '@/views/admin/authUser/components/DepartmentTree'

/**
 * API 返回的部门数据（扁平数组）
 */
export interface DeptListItem {
  /** 部门ID */
  deptId: string | number
  /** 父部门ID */
  parentId: string | number
  /** 部门名称 */
  deptName: string
  /** 部门状态 */
  status: string | number
  /** 排序 */
  orderNum: number
  /** 创建时间 */
  createTime?: string
  createdAt?: string
  /** 负责人 */
  leader?: string
  /** 手机号 */
  phone?: string
  /** 邮箱 */
  email?: string
}

/**
 * 扁平化的部门数据（带层级信息）
 */
export interface FlatDeptData {
  /** 部门ID */
  deptId: string | number
  /** 部门名称 */
  deptName: string
  /** 部门状态 */
  status: string
  /** 排序 */
  orderNum: number
  /** 创建时间 */
  createTime: string
  /** 层级深度 */
  level: number
  /** 父部门ID */
  parentId?: string | number
  /** 负责人 */
  leader?: string
  /** 手机号 */
  phone?: string
  /** 邮箱 */
  email?: string
}

/**
 * 将扁平数组转换为树形结构
 * @param list - 扁平化的部门数组
 * @returns 树形结构的部门列表
 */
export const buildDeptTree = (list: DeptListItem[]): DepartmentNode[] => {
  if (!list || list.length === 0) return []

  // 创建 id 到节点的映射
  const nodeMap = new Map<string | number, DepartmentNode & { children?: DepartmentNode[] }>()
  const rootNodes: DepartmentNode[] = []

  // 第一遍遍历：创建所有节点
  list.forEach(item => {
    const node: DepartmentNode & { children?: DepartmentNode[] } = {
      deptId: String(item.deptId),
      deptName: item.deptName,
      children: []
    }
    // 保留原始数据用于后续使用
    ;(node as any).orderNum = item.orderNum
    ;(node as any).status = item.status
    ;(node as any).createTime = item.createTime || item.createdAt
    ;(node as any).leader = item.leader
    ;(node as any).phone = item.phone
    ;(node as any).email = item.email
    nodeMap.set(item.deptId, node)
  })

  // 第二遍遍历：建立父子关系
  list.forEach(item => {
    const node = nodeMap.get(item.deptId)!
    const parentId = item.parentId

    // 判断是否为根节点（parentId 为 0 或 null 或 undefined）
    if (!parentId || parentId === 0 || parentId === '0') {
      rootNodes.push(node)
    } else {
      // 子节点，找到父节点并添加到父节点的 children 中
      const parent = nodeMap.get(parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(node)
      } else {
        // 如果找不到父节点，也作为根节点处理
        rootNodes.push(node)
      }
    }
  })

  // 按 orderNum 排序
  const sortNodes = (nodes: DepartmentNode[]) => {
    nodes.sort((a, b) => {
      const aOrder = (a as any).orderNum || 0
      const bOrder = (b as any).orderNum || 0
      return aOrder - bOrder
    })
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children)
      }
    })
  }

  sortNodes(rootNodes)

  // 清理空的 children 数组
  const cleanChildren = (nodes: DepartmentNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        cleanChildren(node.children)
      }
    })
  }
  cleanChildren(rootNodes)

  return rootNodes
}

/**
 * 将树形结构扁平化为数组
 * @param nodes - 树形节点数组
 * @param level - 当前层级
 * @param parentId - 父节点ID
 * @returns 扁平化的部门数据数组
 */
export const flattenDeptTree = (
  nodes: DepartmentNode[],
  level: number = 0,
  parentId?: string | number
): FlatDeptData[] => {
  const result: FlatDeptData[] = []

  nodes.forEach(node => {
    result.push({
      deptId: node.deptId,
      deptName: node.deptName,
      status: String((node as any).status || '1'),
      orderNum: (node as any).orderNum || 0,
      createTime: (node as any).createTime || (node as any).createdAt || '',
      level,
      parentId,
      leader: (node as any).leader,
      phone: (node as any).phone,
      email: (node as any).email
    })

    if (node.children && node.children.length > 0) {
      result.push(...flattenDeptTree(node.children, level + 1, node.deptId))
    }
  })

  return result
}

/**
 * 根据部门ID查找部门节点
 * @param nodes - 树形节点数组
 * @param deptId - 部门ID
 * @returns 部门节点或null
 */
export const findDeptNode = (nodes: DepartmentNode[], deptId: string | number): DepartmentNode | null => {
  for (const node of nodes) {
    if (String(node.deptId) === String(deptId)) {
      return node
    }
    if (node.children) {
      const found = findDeptNode(node.children, deptId)
      if (found) return found
    }
  }
  return null
}
