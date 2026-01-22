import type { MenuData, MenuNode } from '@/views/admin/authRoles/components/utils'
import { buildMenuTree } from '@/views/admin/authRoles/components/utils'

/**
 * 菜单数据接口（扩展）
 */
export interface MenuItemData extends MenuData {
  /** 层级 */
  level?: number
}

/**
 * 扁平化菜单树
 * @param tree - 菜单树
 * @param level - 当前层级
 * @returns 扁平化的菜单列表
 */
export const flattenMenuTree = (tree: MenuNode[], level: number = 0): MenuItemData[] => {
  const result: MenuItemData[] = []

  tree.forEach(node => {
    result.push({
      id: node.id,
      pid: node.pid,
      title: node.title ?? node.label,
      name: node.name,
      path: node.path,
      component: node.component,
      icon: node.icon,
      weigh: node.weigh,
      menuType: node.menuType,
      isHide: node.isHide,
      isCached: node.isCached,
      isAffix: node.isAffix,
      isIframe: node.isIframe,
      isLink: node.isLink,
      linkUrl: node.linkUrl,
      redirect: node.redirect,
      condition: node.condition,
      remark: node.remark,
      titleEn: node.titleEn,
      titleTw: node.titleTw,
      level
    } as MenuItemData)

    if (node.children && node.children.length > 0) {
      result.push(...flattenMenuTree(node.children, level + 1))
    }
  })

  return result
}

/**
 * 根据菜单ID查找菜单节点
 * @param nodes - 菜单节点数组
 * @param targetId - 目标菜单ID
 * @returns 菜单节点或null
 */
export const findMenuNode = (nodes: MenuNode[], targetId: string | number): MenuNode | null => {
  for (const node of nodes) {
    if (String(node.id) === String(targetId)) {
      return node
    }
    if (node.children) {
      const found = findMenuNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

/**
 * 构建菜单路径
 * @param targetId - 目标菜单ID
 * @param nodes - 菜单节点数组
 * @param path - 当前路径
 * @returns 菜单路径数组或null
 */
export const buildMenuPath = (targetId: string | number, nodes: MenuNode[], path: string[] = []): string[] | null => {
  for (const node of nodes) {
    const currentPath = [...path, node.label]
    if (String(node.id) === String(targetId)) {
      return currentPath
    }
    if (node.children) {
      const found = buildMenuPath(targetId, node.children, currentPath)
      if (found) return found
    }
  }
  return null
}

export { buildMenuTree, type MenuData, type MenuNode }
