export type BillingCycleType = 'monthly' | 'yearly'

export const BillingCycleUtil = {
  isMonthly: (cycle: BillingCycleType): cycle is 'monthly' => cycle === 'monthly',
  isYearly: (cycle: BillingCycleType): cycle is 'yearly' => cycle === 'yearly',
  validate: (cycle: string): cycle is BillingCycleType => {
    return cycle === 'monthly' || cycle === 'yearly'
  },
}

export class BillingCycle {
  static readonly MONTHLY = new BillingCycle('monthly')
  static readonly YEARLY = new BillingCycle('yearly')

  private constructor(private readonly value: BillingCycleType) {}

  getValue(): BillingCycleType {
    return this.value
  }

  isMonthly(): boolean {
    return this.value === 'monthly'
  }

  isYearly(): boolean {
    return this.value === 'yearly'
  }

  equals(other: BillingCycle): boolean {
    return this.value === other.value
  }

  static fromValue(value: string): BillingCycle {
    if (value === 'monthly') return BillingCycle.MONTHLY
    if (value === 'yearly') return BillingCycle.YEARLY
    throw new Error(`Invalid billing cycle value: ${value}`)
  }
}
