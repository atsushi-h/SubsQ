import { describe, expect, it } from 'vitest'
import { DateUtil } from './date'

describe('DateUtil', () => {
  describe('formatDate', () => {
    it('ISO文字列を日本語日付形式に変換する', () => {
      // Act
      const result = DateUtil.formatDate('2024-03-15T00:00:00.000Z')

      // Assert
      expect(result).toBe('2024年03月15日')
    })

    it('異なる日付でも正しく変換する', () => {
      // Act
      const result = DateUtil.formatDate('2024-12-31T00:00:00.000Z')

      // Assert
      expect(result).toBe('2024年12月31日')
    })

    it('時刻情報を含むISO文字列も日付部分のみを表示する', () => {
      // Act
      const result = DateUtil.formatDate('2024-03-15T12:30:45.000Z')

      // Assert
      expect(result).toBe('2024年03月15日')
    })
  })

  describe('formatDateTime', () => {
    it('ISO文字列を日本語日時形式に変換する', () => {
      // Act
      const result = DateUtil.formatDateTime('2024-03-15T00:00:00.000Z')

      // Assert
      // タイムゾーンに依存するため、年月日のみを検証
      expect(result).toContain('2024年03月')
    })

    it('時刻情報が含まれることを確認する', () => {
      // Act
      const result = DateUtil.formatDateTime('2024-03-15T12:30:00.000Z')

      // Assert
      // HH:mm形式が含まれることを確認
      expect(result).toMatch(/\d{2}:\d{2}$/)
    })

    it('秒情報は含まず分まで表示する', () => {
      // Act
      const result = DateUtil.formatDateTime('2024-03-15T12:30:45.000Z')

      // Assert
      // 秒情報が含まれないことを確認（末尾が HH:mm 形式）
      expect(result).toMatch(/\d{2}:\d{2}$/)
      expect(result).not.toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('dateStringToISO', () => {
    it('YYYY-MM-DD形式の日付文字列をISO形式に変換する', () => {
      // Act
      const result = DateUtil.dateStringToISO('2024-03-15')

      // Assert
      expect(result).toBe('2024-03-15T00:00:00.000Z')
    })

    it('異なる日付でも正しく変換する', () => {
      // Act
      const result = DateUtil.dateStringToISO('2024-12-31')

      // Assert
      expect(result).toBe('2024-12-31T00:00:00.000Z')
    })

    it('1桁の月日でも正しく変換する', () => {
      // Act
      const result = DateUtil.dateStringToISO('2024-01-05')

      // Assert
      expect(result).toBe('2024-01-05T00:00:00.000Z')
    })

    it('無効な日付形式の場合はエラーを投げる', () => {
      // Assert
      expect(() => DateUtil.dateStringToISO('invalid-date')).toThrow('無効な日付形式')
    })

    it('月が範囲外の場合はエラーを投げる', () => {
      // Assert
      expect(() => DateUtil.dateStringToISO('2024-13-01')).toThrow('無効な日付形式')
    })

    it('月が0の場合はエラーを投げる', () => {
      // Assert
      expect(() => DateUtil.dateStringToISO('2024-00-01')).toThrow('無効な日付形式')
    })

    it('日が範囲外の場合はエラーを投げる', () => {
      // Assert
      expect(() => DateUtil.dateStringToISO('2024-01-32')).toThrow('無効な日付形式')
    })

    it('日が0の場合はエラーを投げる', () => {
      // Assert
      expect(() => DateUtil.dateStringToISO('2024-01-00')).toThrow('無効な日付形式')
    })
  })

  describe('isoToDateString', () => {
    it('ISO文字列からYYYY-MM-DD形式の日付を取得する', () => {
      // Act
      const result = DateUtil.isoToDateString('2024-03-15T00:00:00.000Z')

      // Assert
      expect(result).toBe('2024-03-15')
    })

    it('時刻情報を含むISO文字列も日付部分のみを取得する', () => {
      // Act
      const result = DateUtil.isoToDateString('2024-03-15T12:30:45.000Z')

      // Assert
      expect(result).toBe('2024-03-15')
    })

    it('異なる日付でも正しく変換する', () => {
      // Act
      const result = DateUtil.isoToDateString('2024-12-31T00:00:00.000Z')

      // Assert
      expect(result).toBe('2024-12-31')
    })

    it('無効なISO文字列の場合はエラーを投げる', () => {
      // Assert
      expect(() => DateUtil.isoToDateString('invalid-iso-string')).toThrow('無効なISO文字列')
    })
  })

  describe('相互変換', () => {
    it('dateStringToISO と isoToDateString は相互変換可能', () => {
      // Arrange
      const originalDateString = '2024-03-15'

      // Act
      const iso = DateUtil.dateStringToISO(originalDateString)
      const convertedBack = DateUtil.isoToDateString(iso)

      // Assert
      expect(convertedBack).toBe(originalDateString)
    })

    it('異なる日付でも相互変換可能', () => {
      // Arrange
      const originalDateString = '2024-12-31'

      // Act
      const iso = DateUtil.dateStringToISO(originalDateString)
      const convertedBack = DateUtil.isoToDateString(iso)

      // Assert
      expect(convertedBack).toBe(originalDateString)
    })
  })

  describe('エッジケース', () => {
    it('うるう年の2月29日を正しく処理する', () => {
      // Act
      const iso = DateUtil.dateStringToISO('2024-02-29')
      const dateString = DateUtil.isoToDateString(iso)

      // Assert
      expect(dateString).toBe('2024-02-29')
    })

    it('うるう年でない年の2月29日も変換できる（JavaScriptのDate仕様）', () => {
      // JavaScriptのDateは不正な日付を自動補正する（2023-02-29 → 2023-03-01）
      // Act
      const result = DateUtil.dateStringToISO('2023-02-29')

      // Assert
      // 2023年2月29日は存在しないため、3月1日に補正される
      expect(result).toBe('2023-03-01T00:00:00.000Z')
    })

    it('年の境界（1月1日）を正しく処理する', () => {
      // Act
      const result = DateUtil.dateStringToISO('2024-01-01')

      // Assert
      expect(result).toBe('2024-01-01T00:00:00.000Z')
    })

    it('年の境界（12月31日）を正しく処理する', () => {
      // Act
      const result = DateUtil.dateStringToISO('2024-12-31')

      // Assert
      expect(result).toBe('2024-12-31T00:00:00.000Z')
    })
  })
})
