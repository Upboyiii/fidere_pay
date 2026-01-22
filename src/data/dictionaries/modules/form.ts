/**
 * 表单相关翻译模块
 */
export const form = {
  en: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least {min} characters',
    passwordsNotMatch: 'Passwords do not match',
    invalidPhone: 'Please enter a valid phone number',
    invalidUrl: 'Please enter a valid URL',
    invalidDate: 'Please enter a valid date',
    invalidNumber: 'Please enter a valid number',
    maxLength: 'Maximum {max} characters',
    minLength: 'Minimum {min} characters'
  },
  zh: {
    required: '此字段为必填项',
    invalidEmail: '请输入有效的邮箱地址',
    passwordTooShort: '密码至少需要 {min} 个字符',
    passwordsNotMatch: '两次输入的密码不一致',
    invalidPhone: '请输入有效的手机号码',
    invalidUrl: '请输入有效的网址',
    invalidDate: '请输入有效的日期',
    invalidNumber: '请输入有效的数字',
    maxLength: '最多输入 {max} 个字符',
    minLength: '至少输入 {min} 个字符'
  },
  zhTW: {
    required: '此欄位為必填項',
    invalidEmail: '請輸入有效的電子郵件地址',
    passwordTooShort: '密碼至少需要 {min} 個字元',
    passwordsNotMatch: '兩次輸入的密碼不一致',
    invalidPhone: '請輸入有效的手機號碼',
    invalidUrl: '請輸入有效的網址',
    invalidDate: '請輸入有效的日期',
    invalidNumber: '請輸入有效的數字',
    maxLength: '最多輸入 {max} 個字元',
    minLength: '至少輸入 {min} 個字元'
  }
} as const
