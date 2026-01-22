import type { DepartmentNode } from './DepartmentTree'

/**
 * 角色树节点类型
 */
export interface RoleTreeNode {
  id: string
  name: string
  children?: RoleTreeNode[]
}

/**
 * 将普通数组转换为树形结构
 * @param list - 角色列表数组
 * @returns 树形结构的角色列表
 */
export const buildRoleTree = (list: any[]): RoleTreeNode[] => {
  if (!list || list.length === 0) return []

  // 创建 id 到节点的映射
  const nodeMap = new Map<number, RoleTreeNode>()
  const rootNodes: RoleTreeNode[] = []

  // 第一遍遍历：创建所有节点
  list.forEach(item => {
    const node: RoleTreeNode = {
      id: String(item.id),
      name: item.name,
      children: []
    }
    nodeMap.set(item.id, node)
  })

  // 第二遍遍历：建立父子关系
  list.forEach(item => {
    const node = nodeMap.get(item.id)!
    if (item.pid === 0 || !item.pid) {
      // 根节点
      rootNodes.push(node)
    } else {
      // 子节点，找到父节点并添加到父节点的 children 中
      const parent = nodeMap.get(item.pid)
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

  // 清理空的 children 数组
  const cleanChildren = (nodes: RoleTreeNode[]) => {
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
 * 查找部门路径
 * @param nodes - 部门节点数组
 * @param targetName - 目标部门名称
 * @param path - 当前路径
 * @returns 部门路径数组或null
 */
export const findDepartmentPath = (
  nodes: DepartmentNode[],
  targetName: string,
  path: string[] = []
): string[] | null => {
  for (const node of nodes) {
    const currentPath = [...path, node.deptName]
    if (node.deptName === targetName) {
      return currentPath
    }
    if (node.children) {
      const found = findDepartmentPath(node.children, targetName, currentPath)
      if (found) return found
    }
  }
  return null
}

/**
 * 根据部门路径字符串找到部门ID
 * @param pathString - 部门路径字符串
 * @param departments - 部门列表
 * @returns 部门ID或null
 */
export const findDepartmentIdByPath = (pathString: string, departments: DepartmentNode[]): number | null => {
  if (!pathString || !departments.length) return null

  const pathParts = pathString.split(' / ')
  if (pathParts.length === 0) return null

  const findNode = (nodes: DepartmentNode[], targetName: string): DepartmentNode | null => {
    for (const node of nodes) {
      if (node.deptName === targetName) {
        return node
      }
      if (node.children) {
        const found = findNode(node.children, targetName)
        if (found) return found
      }
    }
    return null
  }

  // 从最后一个路径部分开始查找（最深层级）
  const targetName = pathParts[pathParts.length - 1]
  const node = findNode(departments, targetName)

  return node ? Number(node.deptId) : null
}

/**
 * 根据角色名称数组找到角色ID数组
 * @param roleNames - 角色名称数组
 * @param roleTree - 角色树
 * @returns 角色ID数组
 */
export const findRoleIdsByNames = (roleNames: string[], roleTree: RoleTreeNode[]): number[] => {
  if (!roleNames || roleNames.length === 0) return []

  const roleIds: number[] = []

  const findRoleInTree = (nodes: RoleTreeNode[]) => {
    for (const node of nodes) {
      if (roleNames.includes(node.name)) {
        roleIds.push(Number(node.id))
      }
      if (node.children) {
        findRoleInTree(node.children)
      }
    }
  }

  findRoleInTree(roleTree)

  return roleIds
}
