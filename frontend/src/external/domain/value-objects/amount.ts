import type { BillingCycleType } from './billing-cycle'

export type AmountValue = number

const MIN_AMOUNT = 0
const MAX_AMOUNT = 1_000_000

export const AmountUtil = {
  isValid: (value: number): boolean => {
    return Number.isInteger(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT
  },
  validate: (value: number): void => {
    if (!Number.isInteger(value)) {
      throw new Error('金額は整数である必要があります')
    }
    if (value < MIN_AMOUNT) {
      throw new Error(`金額は${MIN_AMOUNT}以上である必要があります`)
    }
    if (value > MAX_AMOUNT) {
      throw new Error(`金額は${MAX_AMOUNT.toLocaleString()}以下である必要があります`)
    }
  },
}

export class Amount {
  private constructor(private readonly value: AmountValue) {}

  getValue(): AmountValue {
    return this.value
  }

  equals(other: Amount): boolean {
    return this.value === other.value
  }

  add(other: Amount): Amount {
    return Amount.fromValue(this.value + other.value)
  }

  toMonthlyEquivalent(billingCycle: BillingCycleType): Amount {
    if (billingCycle === 'monthly') {
      return this
    }
    return Amount.fromValue(Math.floor(this.value / 12))
  }

  toYearlyEquivalent(billingCycle: BillingCycleType): Amount {
    if (billingCycle === 'yearly') {
      return this
    }
    return Amount.fromValue(this.value * 12)
  }

  static fromValue(value: number): Amount {
    AmountUtil.validate(value)
    return new Amount(value)
  }

  static zero(): Amount {
    return new Amount(0)
  }
}
