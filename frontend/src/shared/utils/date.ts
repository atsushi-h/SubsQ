import { format, formatISO, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * 日付処理ユーティリティ
 *
 * タイムゾーン処理方針:
 * - データベース保存: UTC（ISO 8601形式）
 * - 表示: ブラウザのローカルタイムゾーン（formatDate, formatDateTime）
 * - フォーム入力→保存: 日付のみをUTCの00:00:00として保存（dateStringToISO）
 *
 * 例: ユーザーが「2024-03-15」を選択
 *   → UTCで「2024-03-15T00:00:00.000Z」として保存
 *   → 表示時にローカルタイムゾーンで「2024年03月15日」と表示
 *
 * この設計により、日付のみを扱うサブスクリプションの基準日では
 * タイムゾーンに関係なく一貫した日付が維持されます。
 */
export const DateUtil = {
  /**
   * ISO文字列を日本語日付形式に変換
   * ブラウザのローカルタイムゾーンで表示されます
   *
   * @param isoString - ISO 8601形式の日付文字列（例: "2024-03-15T00:00:00.000Z"）
   * @returns 日本語日付文字列（例: "2024年03月15日"）
   */
  formatDate: (isoString: string): string => {
    const date = parseISO(isoString)
    return format(date, 'yyyy年MM月dd日', { locale: ja })
  },

  /**
   * ISO文字列を日本語日時形式に変換
   * ブラウザのローカルタイムゾーンで表示されます
   *
   * @param isoString - ISO 8601形式の日付文字列（例: "2024-03-15T12:30:00.000Z"）
   * @returns 日本語日時文字列（例: "2024年03月15日 12:30"）
   */
  formatDateTime: (isoString: string): string => {
    const date = parseISO(isoString)
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja })
  },

  /**
   * YYYY-MM-DD形式の日付文字列をISO datetime形式に変換（UTC）
   *
   * HTML5 date inputから取得した日付（YYYY-MM-DD）を、
   * ユーザーのタイムゾーンに関係なく、UTCの00:00:00として保存します。
   *
   * タイムゾーン処理:
   * - Date.UTC()を使用して明示的にUTCで日付を生成
   * - ローカルタイムゾーンの影響を受けません
   *
   * @param dateString - YYYY-MM-DD形式の日付文字列（例: "2024-03-15"）
   * @returns ISO 8601形式の日付文字列（例: "2024-03-15T00:00:00.000Z"）
   * @throws {Error} 無効な日付形式の場合
   */
  dateStringToISO: (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number)

    // 入力値の検証
    if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error(`無効な日付形式: ${dateString}`)
    }

    const date = new Date(Date.UTC(year, month - 1, day))

    // Invalid Dateのチェック
    if (Number.isNaN(date.getTime())) {
      throw new Error(`無効な日付: ${dateString}`)
    }

    // formatISO()はdate-fns v4でローカルタイムゾーンオフセット付き形式を返すため、
    // Zodのz.iso.datetime()が期待するUTC形式（Z終端）にするためtoISOString()を使用
    return date.toISOString()
  },

  /**
   * ISO文字列からYYYY-MM-DD形式の日付部分を取得
   *
   * parseISOとformatを使用することで、
   * 不正な形式のISO文字列に対してもエラーハンドリングが可能です。
   *
   * @param isoString - ISO 8601形式の日付文字列（例: "2024-03-15T00:00:00.000Z"）
   * @returns YYYY-MM-DD形式の日付文字列（例: "2024-03-15"）
   * @throws {RangeError} 無効なISO文字列の場合
   */
  isoToDateString: (isoString: string): string => {
    const date = parseISO(isoString)

    // Invalid Dateのチェック
    if (Number.isNaN(date.getTime())) {
      throw new RangeError(`無効なISO文字列: ${isoString}`)
    }

    return format(date, 'yyyy-MM-dd')
  },
}
