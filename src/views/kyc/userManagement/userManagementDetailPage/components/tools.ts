/**
 * 性别选项
 */
export const getGenderOptions = (t: any) => [
  {
    value: 0,
    label: t('userManagement.unknown') // 未知
  },
  {
    value: 1,
    label: t('userManagement.male') // 男
  },
  {
    value: 2,
    label: t('userManagement.female') // 女
  }
]

/**
 * 双因素认证选项
 */
export const getTwoFactorEnabledOptions = (t: any) => [
  {
    value: 0,
    label: t('userManagement.disabled') // 未启用
  },
  {
    value: 1,
    label: t('userManagement.enabled') // 已启用
  }
]

/**
 * 账号类型选项
 */
export const getAccountTypeOptions = (t: any) => [
  {
    value: 0,
    label: t('userManagement.unknown') // 未知
  },
  {
    value: 1,
    label: t('userManagement.individual') // 个人
  },
  {
    value: 2,
    label: t('userManagement.enterprise') // 企业
  }
]

/**
 * 婚姻状况选项
 */
export const getMaritalStatusOptions = (t: any) => [
  {
    value: 0,
    label: t('userManagement.unknown') // 未知
  },
  {
    value: 1,
    label: t('userManagement.single') // 单身
  },
  {
    value: 2,
    label: t('userManagement.married') // 已婚
  },
  {
    value: 3,
    label: t('userManagement.divorced') // 离异
  },
  {
    value: 4,
    label: t('userManagement.widowed') // 丧偶
  }
]

/**
 * 双重国籍选项
 */
export const getTdualCitizenshipOptions = (t: any) => [
  {
    value: 0,
    label: t('userManagement.unknown') // 未知
  },
  {
    value: 1,
    label: t('userManagement.has') // 有
  },
  {
    value: 2,
    label: t('userManagement.hasNot') // 无
  }
]

/**
 * 开户目的选项
 */
export const getPurposeForOpenAccountOptions = (t: any) => [
  {
    value: '1',
    label: t('userManagement.custody') // 托管
  },
  {
    value: '2',
    label: t('userManagement.assetServicing') // 资产服务
  },
  {
    value: '3',
    label: t('userManagement.escrow') // 托管账户
  },
  {
    value: '4',
    label: t('userManagement.investments') // 投资
  },
  {
    value: '5',
    label: t('userManagement.treasuryServices') // 资金服务
  }
]

/**
 * 资金来源选项
 */
export const getSourceOfFundsAccountOptions = (t: any) => [
  {
    value: '1',
    label: t('userManagement.salary') // 工资
  },
  {
    value: '2',
    label: t('userManagement.inheritance') // 继承
  },
  {
    value: '3',
    label: t('userManagement.divorceSettlement') // 离婚财产分割
  },
  {
    value: '4',
    label: t('userManagement.pensionSavingsFromEmployment') // 养老金/就业储蓄
  },
  {
    value: '5',
    label: t('userManagement.saleOfProperty') // 房产出售
  },
  {
    value: '6',
    label: t('userManagement.interestIncome') // 利息收入
  },
  {
    value: '7',
    label: t('userManagement.capitalGainDividendsFromInvestment') // 投资收益/股息
  },
  {
    value: '8',
    label: t('userManagement.gambling') // 赌博
  },
  {
    value: '9',
    label: t('userManagement.gift') // 赠与
  }
]

/**
 * 当前年收入选项
 */
export const getCurrentAnnualIncomeOptions = (t: any) => [
  {
    value: '1',
    label: t('userManagement.underUs250k') // 低于25万美元
  },
  {
    value: '2',
    label: t('userManagement.us250kTo500k') // 25万-50万美元
  },
  {
    value: '3',
    label: t('userManagement.us500kTo1mil') // 50万-100万美元
  },
  {
    value: '4',
    label: t('userManagement.us1milTo5mil') // 100万-500万美元
  },
  {
    value: '5',
    label: t('userManagement.overUs5mil') // 超过500万美元
  }
]

/**
 * 预期资产类别选项
 */
export const getAnticipatedAssetClassesOptions = (t: any) => [
  {
    value: '1',
    label: t('userManagement.custodyAssetServicing') // 托管资产服务
  },
  {
    value: '2',
    label: t('userManagement.escrow') // 托管账户
  },
  {
    value: '3',
    label: t('userManagement.investments') // 投资
  },
  {
    value: '4',
    label: t('userManagement.businessTransactions') // 商业交易
  }
]

/**
 * 第三方存缴选项
 */
export const getThirdPartiesInOutOptions = (t: any) => [
  {
    value: 1,
    label: t('userManagement.willNot') // 不会
  },
  {
    value: 2,
    label: t('userManagement.will') // 会
  }
]

/**
 * 税务申报是否在香港选项
 */
export const getTaxRegionInHongkongOptions = (t: any) => [
  {
    value: 1,
    label: t('userManagement.yes') // 是
  },
  {
    value: 0,
    label: t('userManagement.no') // 否
  }
]

/**
 * 其他税务申报编码选项
 */
export const getOtherTaxNumberStyleOptions = (t: any) => [
  {
    value: 1,
    label: t('userManagement.provide') // 提供
  },
  {
    value: 2,
    label: t('userManagement.notProvide') // 未提供
  }
]

/**
 * 无TIN原因选项
 */
export const getNoTinReasonOptions = (t: any) => [
  {
    value: 1,
    label: t('userManagement.accountHolderCountryNoTin') // 账户持有人应纳税的国家不向其居民发放TIN
  },
  {
    value: 2,
    label: t('userManagement.accountHolderCannotObtainTin') // 账户持有人无法获得TIN或等值号码
  },
  {
    value: 3,
    label: t('userManagement.tinNotRequired') // 不需要TIN
  }
]

/**
 * 账户状态选项
 */
export const getAccountStatusOptions = (t: any) => [
  {
    value: 1,
    label: t('userManagement.passed') // 通过
  },
  {
    value: 2,
    label: t('userManagement.notPassed') // 未通过
  }
]

export const getLabelByValue = (
  value: string | number | undefined | null,
  sourcesOption: Array<{ value: string | number; label: string }>
): string | undefined => {
  const option = sourcesOption.find(option => option.value == value)
  return option ? option.label : '-'
}

export const getLabelByValues = (
  values: string | number | undefined | null,
  sourcesOption: Array<{ value: string | number; label: string }>
): string | undefined => {
  return String(values)
    ?.split(',')
    .reduce((t, v) => {
      const k = getLabelByValue(v, sourcesOption)
      t += `${k} ${!!t ? ',' : ''}`
      return t
    }, '')
}
export const getCountryName = (countryId: string, countryList: any[]) => {
  const country = countryList.find(country => country.id == countryId)
  return country ? country?.country_name : '-'
}
export const getCareerName = (careerId: string, careerList: any) => {
  if (!careerId || !careerList) return ''
  return careerList?.[careerId] ?? ''
}
