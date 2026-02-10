/**
 * 日期控件 locale 配置
 * 用于 react-datepicker 等组件，使日历和占位符随应用语言切换
 */

import { enUS } from 'date-fns/locale/en-US'
import { zhCN } from 'date-fns/locale/zh-CN'
import { zhTW } from 'date-fns/locale/zh-TW'

export type DateFnsLocale = typeof enUS

/**
 * 根据应用语言获取 date-fns locale 对象（用于 react-datepicker）
 * 解决切换英文后日期控件仍显示「年/月/日」的问题
 */
export const getDateFnsLocaleFromLang = (lang?: string): DateFnsLocale => {
  if (lang === 'en') return enUS
  if (lang === 'zh-Hant') return zhTW
  return zhCN
}
