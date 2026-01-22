import { LucideIcon } from 'lucide-react'
import { Shield, User, Phone, MapPin, Briefcase, DollarSign, FileText } from 'lucide-react'
import {
  getGenderOptions,
  getMaritalStatusOptions,
  getTdualCitizenshipOptions,
  getCurrentAnnualIncomeOptions,
  getPurposeForOpenAccountOptions,
  getSourceOfFundsAccountOptions,
  getAnticipatedAssetClassesOptions,
  getThirdPartiesInOutOptions,
  getTaxRegionInHongkongOptions,
  getAccountTypeOptions,
  getTwoFactorEnabledOptions,
  getOtherTaxNumberStyleOptions,
  getNoTinReasonOptions,
  getLabelByValue
} from './tools'

/**
 * 字段配置接口
 */
export interface FieldConfig {
  /** 字段标签 */
  label: string
  /** 字段值对应的key */
  value: string
  /** 字段类型 */
  type: 'input' | 'select' | 'date' | 'textarea' | 'display'
  /** 后端字段key */
  key: string
  /** 是否全宽 */
  fullWidth?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 选项数据 */
  data?: string | Array<{ value: string | number; label: string }>
  /** 是否可编辑 */
  isEdit?: boolean
  /** 条件显示函数 */
  condition?: (data: any) => boolean
  /** 自定义渲染函数 */
  renderValue?: (value: any, data: any, helpers: any) => string
  /** 字段大小 */
  size?: { xs?: number; sm?: number; md?: number }
}

/**
 * 分类配置接口
 */
export interface CategoryConfig {
  /** 分类标题 */
  title: string
  /** 分类图标 */
  icon: LucideIcon
  /** 字段列表 */
  fields: FieldConfig[]
}

/**
 * 获取账号状态显示文本
 */
const getAccountStatus = (personalInfo: any, t: any): string => {
  if (personalInfo.status === 1) return '正常' // 已启用
  if (personalInfo.status === 3) return t('userManagement.disabled') // 禁用
  if (personalInfo.status === 2) return t('userManagement.kycPendingReview') // KYC待审核
  return '未知' // KYC待提交
}

/**
 * 获取KYC资料状态显示文本
 */
const getKycDataStatus = (personalInfo: any, t: any): string => {
  if (personalInfo.kycStatus === 1) return t('userManagement.approved') // 通过审核
  if (personalInfo.kycStatus === 2) return t('userManagement.notApproved') // 未通过审核
  if (personalInfo.kycStatus === 3) return '已提交' // 已提交
  return t('userManagement.pendingSubmission') // 待提交
}

/**
 * 基础信息分类配置
 */
export const getBasicInfoCategories = (t: any): CategoryConfig[] => [
  {
    title: t('userManagement.accountInfo'), // 账号信息
    icon: Shield,
    fields: [
      {
        label: t('userManagement.firstName'), // 名
        value: 'firstName',
        type: 'input',
        key: 'firstName',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.middleName'), // 中间名
        value: 'middleName',
        type: 'input',
        key: 'middleName',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.lastName'), // 姓
        value: 'lastName',
        type: 'input',
        key: 'lastName',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.aliasName'), // 别名
        value: 'aliasName',
        type: 'input',
        key: 'aliasName',
        size: { xs: 12, sm: 6, md: 3 }
      },
      // {
      //   label: '邮箱',
      //   value: 'email',
      //   type: 'input',
      //   key: 'email',
      //   size: { xs: 12, sm: 6, md: 3 }
      // },
      // {
      //   label: '手机号',
      //   value: 'phone',
      //   type: 'input',
      //   key: 'phone',
      //   size: { xs: 12, sm: 6, md: 3 }
      // },
      {
        label: t('userManagement.accountType'), // 账号类型
        value: 'accountType',
        type: 'display',
        key: 'accountType',
        data: getAccountTypeOptions(t),
        renderValue: value => {
          const options = getAccountTypeOptions(t)
          const option = options.find(opt => opt.value === value)
          return option ? option.label : '-'
        },
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.accountStatus'), // 账号状态
        value: 'accountStatus',
        type: 'display',
        key: 'accountStatus',
        renderValue: (_, personalInfo) => getAccountStatus(personalInfo, t),
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.googleAuthenticator'), // 谷歌验证器
        value: 'twoFactorEnabled',
        type: 'display',
        key: 'twoFactorEnabled',
        renderValue: value => (value ? t('userManagement.enabled') : t('userManagement.disabled')), // 已启用 未启用
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.kycDataStatus'), // KYC资料状态
        value: 'kycDataStatus',
        type: 'display',
        key: 'kycDataStatus',
        renderValue: (_, personalInfo) => getKycDataStatus(personalInfo, t),
        size: { xs: 12, sm: 6, md: 3 }
      },

      {
        label: t('userManagement.walletStatus'), // 钱包状态
        value: 'hasWallet',
        type: 'display',
        key: 'hasWallet',
        renderValue: value => (value ? t('userManagement.created') : t('userManagement.notCreated')), // 已创建 未创建
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.inviter'), // 邀请人
        value: 'inviter',
        type: 'display',
        key: 'inviter',
        renderValue: value => value?.email || t('userManagement.none'), // 无
        size: { xs: 12, sm: 6, md: 3 }
      }
    ]
  },
  {
    title: t('userManagement.personalInfo'), // 个人信息
    icon: User,
    fields: [
      // {
      //   label: '姓名',
      //   value: 'nameLabel',
      //   type: 'input',
      //   key: 'nameLabel',
      //   size: { xs: 12, sm: 6, md: 3 }
      // },
      {
        label: t('userManagement.dateOfBirth'), // 出生日期
        value: 'dateOfBirth',
        type: 'date',
        key: 'dateOfBirth',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.placeOfBirth'), // 出生地（国家）
        value: 'placeOfBirth',
        type: 'select',
        key: 'placeOfBirth',
        data: 'Country',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.gender'), // 性别
        value: 'gender',
        type: 'select',
        key: 'gender',
        data: getGenderOptions(t),
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.maritalStatus'), // 婚姻状况
        value: 'maritalStatus',
        type: 'select',
        key: 'maritalStatus',
        data: getMaritalStatusOptions(t),
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.citizenship'), // 国籍
        value: 'citizenship',
        type: 'select',
        key: 'citizenship',
        data: 'Country',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.hasSecondCitizenship'), // 是否有第二国籍
        value: 'dualCitizenshipStatus',
        type: 'select',
        key: 'dualCitizenshipStatus',
        data: getTdualCitizenshipOptions(t),
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.secondCitizenship'), // 第二国籍
        value: 'secondCitizenship',
        type: 'input',
        key: 'secondCitizenship',
        condition: data => !!data?.dualCitizenshipStatus,
        size: { xs: 12, sm: 6, md: 3 }
      }
    ]
  },
  {
    title: t('userManagement.contactInfo'), // 联系信息
    icon: Phone,
    fields: [
      {
        label: t('userManagement.phoneNumber'), // 手机号码
        value: 'phone',
        type: 'input',
        key: 'phone',
        size: { xs: 12, sm: 6 }
      },
      {
        label: t('userManagement.emailAddress'), // 邮箱地址
        value: 'email',
        type: 'input',
        key: 'email',
        size: { xs: 12, sm: 6 }
      }
    ]
  },
  {
    title: t('userManagement.addressInfo'), // 地址信息
    icon: MapPin,
    fields: [
      {
        label: t('userManagement.city'), // 居住地所在城市
        value: 'city',
        type: 'input',
        key: 'city',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.stateRegion'), // 居住地州/地区
        value: 'stateRegion',
        type: 'input',
        key: 'stateRegion',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.streetAddress'), // 居住地街道地址
        value: 'streetAddress',
        type: 'input',
        key: 'streetAddress',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.detailedAddress'), // 居住地详细地址
        value: 'detailedAddress',
        type: 'input',
        key: 'detailedAddress',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.postalCode'), // 居住地邮编
        value: 'postalCode',
        type: 'input',
        key: 'postalCode',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.country'), // 居住地所在国家
        value: 'country',
        type: 'select',
        key: 'country',
        data: 'Country',
        size: { xs: 12, sm: 6, md: 3 }
      }
    ]
  },
  {
    title: t('userManagement.employmentInfo'), // 就业信息
    icon: Briefcase,
    fields: [
      {
        label: t('userManagement.currentOccupation'), // 当前职业
        value: 'careerStatus',
        type: 'select',
        key: 'careerStatus',
        data: 'careerStatus',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.employerName'), // 雇主名称
        value: 'employerName',
        type: 'input',
        key: 'employerName',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.businessNature'), // 业务性质
        value: 'industryType',
        type: 'select',
        key: 'industryType',
        data: 'businessNature',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.position'), // 职位
        value: 'careerPosition',
        type: 'select',
        key: 'careerPosition',
        data: 'position',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.moreDescription'), // 更多描述
        value: 'currentOccupation',
        type: 'input',
        key: 'currentOccupation',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.currentAnnualIncome'), // 当前年收入
        value: 'currentAnnualIncome',
        type: 'select',
        key: 'currentAnnualIncome',
        data: getCurrentAnnualIncomeOptions(t),
        size: { xs: 12, sm: 6, md: 3 }
      }
    ]
  },
  {
    title: t('userManagement.financialAccountInfo'), // 财务与账户信息
    icon: DollarSign,
    fields: [
      {
        label: t('userManagement.purposeForOpenAccount'), // 开户目的
        value: 'purposeForOpenAccount',
        type: 'select',
        key: 'purposeForOpenAccount',
        data: getPurposeForOpenAccountOptions(t),
        multiple: true,
        fullWidth: true,
        size: { xs: 12, sm: 6 }
      },
      {
        label: t('userManagement.sourceOfWealth'), // 财产来源
        value: 'sourceOfWealth',
        type: 'select',
        key: 'sourceOfWealth',
        data: getSourceOfFundsAccountOptions(t),
        multiple: true,
        fullWidth: true,
        size: { xs: 12, sm: 6 }
      },
      {
        label: t('userManagement.futureTransactionSource'), // 未来交易资金来源
        value: 'sourceOfFunds',
        type: 'select',
        key: 'sourceOfFunds',
        data: getSourceOfFundsAccountOptions(t),
        multiple: true,
        fullWidth: true,
        size: { xs: 12, sm: 6 }
      },
      {
        label: t('userManagement.anticipatedAssetClasses'), // 预期资产类别
        value: 'anticipatedAssetClasses',
        type: 'select',
        key: 'anticipatedAssetClasses',
        data: getAnticipatedAssetClassesOptions(t),
        multiple: true,
        fullWidth: true,
        size: { xs: 12, sm: 6 }
      },
      {
        label: t('userManagement.thirdPartyDeposit'), // 第三方存缴情况
        value: 'thirdPartiesInOut',
        type: 'select',
        key: 'thirdPartiesInOut',
        data: getThirdPartiesInOutOptions(t),
        size: { xs: 12, sm: 6 }
      },
      {
        label: t('userManagement.thirdPartyDepositDetails'), // 第三方存缴详细信息
        value: 'additionalDetails',
        type: 'textarea',
        key: 'additionalDetails',
        condition: data => data?.thirdPartiesInOut == 2,
        size: { xs: 12, sm: 6 }
      }
    ]
  },
  {
    title: t('userManagement.taxInfo'), // 税务信息
    icon: FileText,
    fields: [
      {
        label: t('userManagement.taxDeclarationInHongkong'), // 税务申报是否在香港
        value: 'taxRegionInHongkong',
        type: 'select',
        key: 'taxRegionInHongkong',
        data: getTaxRegionInHongkongOptions(t),
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.taxDeclarationRegion'), // 税务申报所属地
        value: 'taxRegion',
        type: 'input',
        key: 'taxRegion',
        condition: data => {
          const value = data?.taxRegionInHongkong
          const options = getTaxRegionInHongkongOptions(t)
          return (
            value === '是' ||
            value === 1 ||
            getLabelByValue(value, options) === '是' ||
            getLabelByValue(value, options) === t('userManagement.yes')
          )
        },
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.taxDeclarationCode'), // 税务申报编码
        value: 'taxNumber',
        type: 'input',
        key: 'taxNumber',
        condition: data => {
          const value = data?.taxRegionInHongkong
          const options = getTaxRegionInHongkongOptions(t)
          return (
            value === '是' ||
            value === 1 ||
            getLabelByValue(value, options) === '是' ||
            getLabelByValue(value, options) === t('userManagement.yes')
          )
        },
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.nonHongkongTax'), // 非香港地区税务
        value: 'taxRegionNotInHongkong',
        type: 'select',
        key: 'taxRegionNotInHongkong',
        data: getTaxRegionInHongkongOptions(t),
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.otherTaxDeclarationRegion'), // 其他税务申报所属地
        value: 'otherTaxRegion',
        type: 'input',
        key: 'otherTaxRegion',
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.provideOtherTaxCode'), // 是否提供其他税务申报编码
        value: 'otherTaxNumberStyle',
        type: 'select',
        key: 'otherTaxNumberStyle',
        data: getOtherTaxNumberStyleOptions(t),
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.otherTaxDeclarationCode'), // 其他税务申报编码
        value: 'otherTaxNumber',
        type: 'input',
        key: 'otherTaxNumber',
        condition: data => !!data?.otherTaxNumberStyle,
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.noOtherTaxCodeReason'), // 无其他税务申报编码原因
        value: 'noTinReason',
        type: 'select',
        key: 'noTinReason',
        data: getNoTinReasonOptions(t),
        condition: data => !!data?.otherTaxNumberStyle,
        size: { xs: 12, sm: 6, md: 3 }
      },
      {
        label: t('userManagement.tinUnavailableReason'), // TIN/等效编号无法获取原因
        value: 'noTinReasonDetail',
        type: 'textarea',
        key: 'noTinReasonDetail',
        size: { xs: 12, sm: 6, md: 3 }
      }
    ]
  }
]
