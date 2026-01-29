import { describe, expect, it } from 'vitest'
import { subscriptionKeys } from './subscription.query-keys'

describe('subscriptionKeys', () => {
  it('all は ["subscriptions"] を返す', () => {
    expect(subscriptionKeys.all).toEqual(['subscriptions'])
  })

  it('lists は ["subscriptions", "list"] を返す', () => {
    expect(subscriptionKeys.lists()).toEqual(['subscriptions', 'list'])
  })

  it('details は ["subscriptions", "detail"] を返す', () => {
    expect(subscriptionKeys.details()).toEqual(['subscriptions', 'detail'])
  })

  it('detail は IDを含むキーを返す', () => {
    const testId = 'sub-123'
    expect(subscriptionKeys.detail(testId)).toEqual(['subscriptions', 'detail', 'sub-123'])
  })

  it('異なるIDに対して異なるキーを生成する', () => {
    const key1 = subscriptionKeys.detail('sub-123')
    const key2 = subscriptionKeys.detail('sub-456')
    expect(key1).not.toEqual(key2)
  })
})
