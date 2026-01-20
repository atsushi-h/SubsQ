import { format, formatISO, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export const DateUtil = {
  /**
   * ISO文字列を日本語日付形式に変換
   * @param isoString - ISO 8601形式の日付文字列（例: "2024-03-15T00:00:00.000Z"）
   * @returns 日本語日付文字列（例: "2024年03月15日"）
   */
  formatDate: (isoString: string): string => {
    const date = parseISO(isoString)
    return format(date, 'yyyy年MM月dd日', { locale: ja })
  },

  /**
   * ISO文字列を日本語日時形式に変換
   * @param isoString - ISO 8601形式の日付文字列（例: "2024-03-15T12:30:00.000Z"）
   * @returns 日本語日時文字列（例: "2024年03月15日 12:30"）
   */
  formatDateTime: (isoString: string): string => {
    const date = parseISO(isoString)
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja })
  },

  /**
   * YYYY-MM-DD形式の日付文字列をISO datetime形式に変換（UTC）
   * @param dateString - YYYY-MM-DD形式の日付文字列（例: "2024-03-15"）
   * @returns ISO 8601形式の日付文字列（例: "2024-03-15T00:00:00.000Z"）
   */
  dateStringToISO: (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return formatISO(date)
  },

  /**
   * ISO文字列からYYYY-MM-DD形式の日付部分を取得
   * @param isoString - ISO 8601形式の日付文字列（例: "2024-03-15T00:00:00.000Z"）
   * @returns YYYY-MM-DD形式の日付文字列（例: "2024-03-15"）
   */
  isoToDateString: (isoString: string): string => {
    return isoString.split('T')[0]
  },
}
