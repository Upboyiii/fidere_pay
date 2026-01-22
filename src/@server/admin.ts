import { clientRequest } from '@server/http'

export const getDepartmentTree = (params: any) => clientRequest.get('/system/dept/treeSelect', { params })
export const getUserList = (params: any) => clientRequest.get('/system/user/list', { params })
// 启用/停用用户
export const updateUserStatus = (data: any) => clientRequest.put('/system/user/setStatus', data)
export const deleteUserApi = (data: any) => clientRequest.delete('/system/user/delete', data)
export const resetPwdUser = (data: any) => clientRequest.put('/system/user/resetPwd', data)
export const getUserParams = () => clientRequest.get('/system/user/params')
export const addUserApi = (data: any) => clientRequest.post('/system/user/add', data)
export const getEditUserInfo = (data: any) => clientRequest.get('/system/user/getEdit', { params: data })
export const editUser = (data: any) => clientRequest.put('/system/user/edit', data)

// 岗位管理相关 API
export const getPostList = (params: any) => clientRequest.get('/system/post/list', { params })
export const addPostApi = (data: any) => clientRequest.post('/system/post/add', data)
export const editPostApi = (data: any) => clientRequest.put('/system/post/edit', data)
export const deletePostApi = (data: any) => clientRequest.delete('/system/post/delete', data)
export const getPostDetail = (params: any) => clientRequest.get('/system/post/get', { params })

// 部门管理相关 API
export const getDeptList = (params: any) => clientRequest.get('/system/dept/list', { params })
export const addDeptApi = (data: any) => clientRequest.post('/system/dept/add', data)
export const editDeptApi = (data: any) => clientRequest.put('/system/dept/edit', data)
export const deleteDeptApi = (data: any) => clientRequest.delete('/system/dept/delete', data)
export const getDeptDetail = (params: any) => clientRequest.get('/system/dept/get', { params })

// 角色管理相关 API
export const getRoleList = (params: any) => clientRequest.get('/system/role/list', { params })
export const addRoleApi = (data: any) => clientRequest.post('/system/role/add', data)
export const editRoleApi = (data: any) => clientRequest.put('/system/role/edit', data)
export const deleteRoleApi = (data: any) => clientRequest.delete('/system/role/delete', data)
export const getRoleDetail = (params: any) => clientRequest.get('/system/role/get', { params })
export const getMenuTree = () => clientRequest.get('/system/role/getParams')
export const getRoleParams = (params: any) => clientRequest.get('/system/role/get', { params })

// 菜单管理相关 API
export const getMenuList = (params: any) => clientRequest.get('/system/menu/list', { params })
export const addMenuApi = (data: any) => clientRequest.post('/system/menu/add', data)
export const editMenuApi = (data: any) => clientRequest.put('/system/menu/update', data)
export const deleteMenuApi = (data: any) => clientRequest.delete('/system/menu/delete', data)
export const getMenuDetail = (params: any) => clientRequest.get('/system/menu/get', { params })
export const getMenuParams = (params: any) => clientRequest.get('/system/menu/get', { params })

// 系统参数管理相关 API
export const getConfigList = (params: any) => clientRequest.get('/system/config/list', { params })
export const addConfigApi = (data: any) => clientRequest.post('/system/config/add', data)
export const editConfigApi = (data: any) => clientRequest.put('/system/config/edit', data)
export const deleteConfigApi = (data: any) => clientRequest.delete('/system/config/delete', data)
export const getConfigDetail = (params: any) => clientRequest.get('/system/config/get', { params })

// 字典管理相关 API
export const getDictDataList = (params: any) => clientRequest.get('/system/dict/data/list', { params })
export const addDictDataApi = (data: any) => clientRequest.post('/system/dict/data/add', data)
export const editDictDataApi = (data: any) => clientRequest.put('/system/dict/data/edit', data)
export const deleteDictDataApi = (data: any) => clientRequest.delete('/system/dict/data/delete', data)
export const getDictDataDetail = (params: any) => clientRequest.get('/system/dict/data/get', { params })
export const getDictTypeList = (params: any) => clientRequest.get('/system/dict/type/optionSelect', { params })
export const getDictTypeSelect = (params: any) => clientRequest.get('/system/dict/type/select', { params })
export const addDictTypeApi = (data: any) => clientRequest.post('/system/dict/type/add', data)
export const editDictTypeApi = (data: any) => clientRequest.put('/system/dict/type/edit', data)
export const deleteDictTypeApi = (data: any) => clientRequest.delete('/system/dict/type/delete', data)
export const getDictTypeDetail = (params: any) => clientRequest.get('/system/dict/type/get', { params })

// 文件管理相关 API
export const getSysAttachmentList = (params: any) => clientRequest.get('/system/sysAttachment/list', { params })
export const deleteSysAttachmentApi = (data: any) => clientRequest.delete('/system/sysAttachment/delete', data)
export const updateSysAttachmentStatus = (data: any) => clientRequest.put('/system/sysAttachment/changeStatus', data)
export const uploadSysAttachment = (data: FormData) => clientRequest.post('/system/sysAttachment/upload', data)

// 任务管理相关 API
export const getSysJobList = (params: any) => clientRequest.get('/system/sysJob/list', { params })
export const addSysJobApi = (data: any) => clientRequest.post('/system/sysJob/add', data)
export const editSysJobApi = (data: any) => clientRequest.put('/system/sysJob/edit', data)
export const deleteSysJobApi = (data: any) => clientRequest.delete('/system/sysJob/delete', data)
export const getSysJobDetail = (params: any) => clientRequest.get('/system/sysJob/get', { params })
export const startSysJob = (data: any) => clientRequest.put('/system/sysJob/start', data)
export const stopSysJob = (data: any) => clientRequest.put('/system/sysJob/stop', data)
export const executeSysJobOnce = (data: any) => clientRequest.put('/system/sysJob/run', data)
export const getSysJobLogList = (params: any) => clientRequest.get('/system/sysJob/logs', { params })
export const clearSysJobLog = (data: any) => clientRequest.delete('/system/sysJob/deleteLogs', data)

// 系统缓存管理相关 API
export const clearCache = () => clientRequest.delete('/system/cache/remove')
