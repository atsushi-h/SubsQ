import { describe, expect, it } from 'vitest'
import { paymentMethodKeys } from './payment-method.query-keys'

describe('paymentMethodKeys', () => {
  it('all は ["paymentMethods"] を返す', () => {
    expect(paymentMethodKeys.all).toEqual(['paymentMethods'])
  })

  it('lists は ["paymentMethods", "list"] を返す', () => {
    expect(paymentMethodKeys.lists()).toEqual(['paymentMethods', 'list'])
  })

  it('details は ["paymentMethods", "detail"] を返す', () => {
    expect(paymentMethodKeys.details()).toEqual(['paymentMethods', 'detail'])
  })

  it('detail は IDを含むキーを返す', () => {
    expect(paymentMethodKeys.detail('pm-123')).toEqual(['paymentMethods', 'detail', 'pm-123'])
  })
})
