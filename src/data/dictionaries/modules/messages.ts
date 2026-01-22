/**
 * 消息相关翻译模块
 */
export const messages = {
  en: {
    success: {
      saved: 'Saved successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
      created: 'Created successfully',
      sent: 'Sent successfully'
    },
    error: {
      saveFailed: 'Save failed',
      updateFailed: 'Update failed',
      deleteFailed: 'Delete failed',
      createFailed: 'Create failed',
      networkError: 'Network error',
      serverError: 'Server error',
      unauthorized: 'Unauthorized access',
      forbidden: 'Access forbidden',
      notFound: 'Not found'
    }
  },
  zh: {
    success: {
      saved: '保存成功',
      updated: '更新成功',
      deleted: '删除成功',
      created: '创建成功',
      sent: '发送成功'
    },
    error: {
      saveFailed: '保存失败',
      updateFailed: '更新失败',
      deleteFailed: '删除失败',
      createFailed: '创建失败',
      networkError: '网络错误',
      serverError: '服务器错误',
      unauthorized: '未授权访问',
      forbidden: '禁止访问',
      notFound: '未找到'
    }
  },
  zhTW: {
    success: {
      saved: '儲存成功',
      updated: '更新成功',
      deleted: '刪除成功',
      created: '建立成功',
      sent: '傳送成功'
    },
    error: {
      saveFailed: '儲存失敗',
      updateFailed: '更新失敗',
      deleteFailed: '刪除失敗',
      createFailed: '建立失敗',
      networkError: '網路錯誤',
      serverError: '伺服器錯誤',
      unauthorized: '未授權存取',
      forbidden: '禁止存取',
      notFound: '找不到'
    }
  }
} as const
