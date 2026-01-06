import type { BillingCycleType } from './billing-cycle'

export type BaseDateValue = number // Unix timestamp (seconds)

export const BaseDateUtil = {
  isValid: (timestamp: number): boolean => {
    if (!Number.isInteger(timestamp)) return false
    const date = new Date(timestamp * 1000)
    return !Number.isNaN(date.getTime())
  },
  validate: (timestamp: number): void => {
    if (!Number.isInteger(timestamp)) {
      throw new Error('基準日は整数（Unix timestamp）である必要があります')
    }
    const date = new Date(timestamp * 1000)
    if (Number.isNaN(date.getTime())) {
      throw new Error('基準日が無効な日付です')
    }
  },
  fromDate: (date: Date): number => {
    return Math.floor(date.getTime() / 1000)
  },
}

export class BaseDate {
  private constructor(private readonly value: BaseDateValue) {}

  getValue(): BaseDateValue {
    return this.value
  }

  toDate(): Date {
    return new Date(this.value * 1000)
  }

  toISOString(): string {
    return this.toDate().toISOString()
  }

  equals(other: BaseDate): boolean {
    return this.value === other.value
  }

  calculateNextBillingDate(billingCycle: BillingCycleType): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const nextDate = new Date(this.value * 1000)

    while (nextDate < today) {
      if (billingCycle === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1)
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + 1)
      }
    }

    return nextDate
  }

  static fromValue(timestamp: number): BaseDate {
    BaseDateUtil.validate(timestamp)
    return new BaseDate(timestamp)
  }

  static fromDate(date: Date): BaseDate {
    const timestamp = BaseDateUtil.fromDate(date)
    return new BaseDate(timestamp)
  }

  static now(): BaseDate {
    return BaseDate.fromDate(new Date())
  }
}
