/**
 * 角色数据接口
 */
export interface RoleData {
  /** 角色ID */
  roleId?: string | number
  /** 角色ID（API可能返回id字段） */
  id?: string | number
  /** 角色名称 */
  roleName: string
  /** 角色名称（API可能返回name字段） */
  name?: string
  /** 角色权限 */
  roleKey?: string
  /** 角色排序 */
  roleSort?: number
  /** 列表排序（API可能返回listOrder字段） */
  listOrder?: number
  /** 数据范围 */
  dataScope?: string
  /** 菜单树选择项是否显示 */
  menuCheckStrictly?: boolean
  /** 部门树选择项是否显示 */
  deptCheckStrictly?: boolean
  /** 角色状态 */
  status: string | number
  /** 删除标志 */
  delFlag?: string
  /** 创建时间 */
  createTime?: string
  /** 创建时间（API可能返回createdAt字段） */
  createdAt?: string
  /** 备注 */
  remark?: string
  /** 菜单权限 */
  menuIds?: (string | number)[]
  /** 部门权限 */
  deptIds?: (string | number)[]
  /** 用户数量 */
  userCount?: number
  /** 用户数量（API可能返回userCnt字段） */
  userCnt?: number
  /** 父角色ID */
  parentId?: string | number
  /** 父角色ID（API可能返回pid字段） */
  pid?: string | number
}

/**
 * 菜单数据接口（API返回的原始数据）
 */
export interface MenuData {
  /** 菜单ID */
  id?: string | number
  /** 父菜单ID */
  pid?: string | number
  /** 菜单标题 */
  title?: string
  /** 菜单名称 */
  name?: string
  /** 菜单路径 */
  path?: string
  /** 组件路径 */
  component?: string
  /** 图标 */
  icon?: string
  /** 排序 */
  weigh?: number
  /** 菜单类型 */
  menuType?: number
  /** 是否隐藏 */
  isHide?: number
  /** 是否缓存 */
  isCached?: number
  /** 是否固定 */
  isAffix?: number
  /** 是否iframe */
  isIframe?: number
  /** 是否外链 */
  isLink?: number
  /** 链接地址 */
  linkUrl?: string
  /** 重定向 */
  redirect?: string
  /** 条件 */
  condition?: string
  /** 备注 */
  remark?: string
  [key: string]: any
}

/**
 * 菜单节点接口（树形结构）
 */
export interface MenuNode {
  /** 菜单ID */
  id: string | number
  /** 菜单名称（显示用） */
  label: string
  /** 菜单标题（原始数据） */
  title?: string
  /** 菜单名称（原始数据） */
  name?: string
  /** 父菜单ID */
  pid?: string | number
  /** 子菜单 */
  children?: MenuNode[]
  /** 其他原始数据 */
  [key: string]: any
}

/**
 * 角色树节点接口
 */
export interface RoleTreeNode {
  /** 角色ID */
  id: string | number
  /** 角色名称 */
  name: string
  /** 子角色 */
  children?: RoleTreeNode[]
}

/**
 * 将角色列表转换为树形结构
 * @param list - 角色列表数组
 * @returns 树形结构的角色列表
 */
export const buildRoleTree = (list: RoleData[]): RoleTreeNode[] => {
  if (!list || list.length === 0) return []

  // 创建 id 到节点的映射（使用 roleId 或 id 作为 key）
  const nodeMap = new Map<string | number, RoleTreeNode>()
  const rootNodes: RoleTreeNode[] = []

  // 第一遍遍历：创建所有节点，使用角色ID作为key
  list.forEach(item => {
    // 兼容 roleId 和 id 字段
    const roleId = item.roleId ?? item.id
    // 兼容 roleName 和 name 字段
    const roleName = item.roleName ?? item.name ?? ''

    if (!roleId) {
      console.warn('角色数据缺少ID字段，跳过:', item)
      return
    }

    const node: RoleTreeNode = {
      id: String(roleId),
      name: roleName,
      children: []
    }
    // 使用角色ID作为key存入map
    nodeMap.set(roleId, node)
  })

  // 第二遍遍历：建立父子关系
  list.forEach(item => {
    // 兼容 roleId 和 id 字段
    const roleId = item.roleId ?? item.id
    // 兼容 parentId 和 pid 字段
    const parentId = item.parentId ?? item.pid

    if (!roleId) {
      return
    }

    const node = nodeMap.get(roleId)
    if (!node) {
      console.warn('找不到角色节点，跳过:', roleId)
      return
    }

    // 判断是否为根节点（parentId 为 0、null、undefined 或 '0'）
    if (!parentId || parentId === 0 || parentId === '0') {
      // 根节点
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
 * 扁平化角色树
 * @param tree - 角色树
 * @param level - 当前层级
 * @returns 扁平化的角色列表
 */
export const flattenRoleTree = (tree: RoleTreeNode[], level: number = 0): RoleData[] => {
  const result: RoleData[] = []

  tree.forEach(node => {
    result.push({
      roleId: node.id,
      roleName: node.name,
      status: '1'
    } as RoleData)

    if (node.children && node.children.length > 0) {
      result.push(...flattenRoleTree(node.children, level + 1))
    }
  })

  return result
}

/**
 * 根据角色ID查找角色节点
 * @param nodes - 角色节点数组
 * @param targetId - 目标角色ID
 * @returns 角色节点或null
 */
export const findRoleNode = (nodes: RoleTreeNode[], targetId: string | number): RoleTreeNode | null => {
  for (const node of nodes) {
    if (String(node.id) === String(targetId)) {
      return node
    }
    if (node.children) {
      const found = findRoleNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

/**
 * 将菜单列表转换为树形结构
 * @param list - 菜单列表数组（扁平结构）
 * @returns 树形结构的菜单列表
 */
export const buildMenuTree = (list: MenuData[]): MenuNode[] => {
  if (!list || list.length === 0) return []

  // 创建 id 到节点的映射
  const nodeMap = new Map<string | number, MenuNode>()
  const rootNodes: MenuNode[] = []

  // 第一遍遍历：创建所有节点，使用菜单ID作为key
  list.forEach(item => {
    // 兼容 id 字段
    const menuId = item.id
    // 优先使用 meta.title，其次使用 title，最后使用 name
    const menuLabel = item.meta?.title ?? item.title ?? item.name ?? ''

    if (!menuId) {
      console.warn('菜单数据缺少ID字段，跳过:', item)
      return
    }

    const node: MenuNode = {
      id: menuId,
      label: menuLabel,
      title: item.title || item.meta?.title,
      name: item.name,
      pid: item.pid,
      children: [],
      // 保留原始数据（包括 meta 对象）
      ...item,
      meta: item.meta || {}
    }
    // 使用菜单ID作为key存入map
    nodeMap.set(menuId, node)
  })

  // 第二遍遍历：建立父子关系
  list.forEach(item => {
    const menuId = item.id
    const parentId = item.pid

    if (!menuId) {
      return
    }

    const node = nodeMap.get(menuId)
    if (!node) {
      console.warn('找不到菜单节点，跳过:', menuId)
      return
    }

    // 判断是否为根节点（parentId 为 0、null、undefined 或 '0'）
    if (!parentId || parentId === 0 || parentId === '0') {
      // 根节点
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

  // 清理空的 children 数组
  const cleanChildren = (nodes: MenuNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        cleanChildren(node.children)
      }
    })
  }
  cleanChildren(rootNodes)

  // 按 weigh 排序（如果存在）
  const sortNodes = (nodes: MenuNode[]) => {
    nodes.sort((a, b) => {
      const aWeigh = (a as any).weigh ?? 0
      const bWeigh = (b as any).weigh ?? 0
      return bWeigh - aWeigh
    })
    nodes.forEach(node => {
      if (node.children) {
        sortNodes(node.children)
      }
    })
  }
  sortNodes(rootNodes)

  return rootNodes
}
