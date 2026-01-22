/**
 * 字典管理工具函数
 */

// Type Imports
export interface DictTypeNode {
  dictId?: number
  dictName: string
  dictType: string
  pid?: number
  children?: DictTypeNode[]
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export const formatDateToString = (date: Date | null): string | undefined => {
  if (!date) return undefined
  return date.toISOString().split('T')[0]
}

/**
 * 清理请求参数，移除空值
 */
export const cleanRequestParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {}
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value
    }
  })
  return cleaned
}

/**
 * 将扁平数组转换为树形结构
 * @param list - 扁平化的字典类型数组
 * @returns 树形结构的字典类型列表
 */
export const buildDictTypeTree = (list: any[]): DictTypeNode[] => {
  if (!list || list.length === 0) return []

  // 创建 id 到节点的映射
  const nodeMap = new Map<number, DictTypeNode>()
  const rootNodes: DictTypeNode[] = []

  // 第一遍遍历：创建所有节点
  list.forEach(item => {
    const node: DictTypeNode = {
      dictId: item.dictId,
      dictName: item.dictName || '',
      dictType: item.dictType || '',
      pid: item.pid,
      children: []
    }
    // 保留原始数据
    Object.assign(node, item)
    nodeMap.set(item.dictId, node)
  })

  // 第二遍遍历：建立父子关系
  list.forEach(item => {
    const node = nodeMap.get(item.dictId)
    if (!node) return

    const parentId = item.pid

    // 判断是否为根节点（parentId 为 0、null、undefined 或 '0'）
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

  // 清理空的 children 数组
  const cleanChildren = (nodes: DictTypeNode[]) => {
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
 * 表单默认值
 */
export const FORM_DEFAULT_VALUES = {
  dictType: '',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  cssClass: '',
  listClass: '',
  isDefault: 0,
  status: 1,
  remark: ''
}

/**
 * 搜索参数默认值
 */
export const SEARCH_PARAMS_DEFAULT = {
  dictType: '',
  dictLabel: '',
  status: '',
  typeId: ''
}

/**
 * 根据 dictId 查找字典类型节点
 * @param nodes - 字典类型节点数组
 * @param targetId - 目标字典ID
 * @returns 找到的节点或 null
 */
export const findNodeById = (nodes: DictTypeNode[], targetId: number): DictTypeNode | null => {
  for (const node of nodes) {
    if (node.dictId === targetId) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, targetId)
      if (found) return found
    }
  }
  return null
}
