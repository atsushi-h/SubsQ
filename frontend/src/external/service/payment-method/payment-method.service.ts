import type {
  ModelsCreatePaymentMethodRequest,
  ModelsPaymentMethodResponse,
  ModelsUpdatePaymentMethodRequest,
} from '@/external/client/api/generated/model'
import {
  paymentMethodsCreatePaymentMethod,
  paymentMethodsDeletePaymentMethod,
  paymentMethodsDeletePaymentMethods,
  paymentMethodsGetPaymentMethod,
  paymentMethodsListPaymentMethods,
  paymentMethodsUpdatePaymentMethod,
} from '@/external/client/api/generated/payment-methods/payment-methods'

export async function listPaymentMethods(): Promise<ModelsPaymentMethodResponse[]> {
  const res = await paymentMethodsListPaymentMethods()
  if (res.status !== 200) throw new Error('支払い方法一覧の取得に失敗しました')
  return res.data
}

export async function getPaymentMethodById(
  id: string,
): Promise<ModelsPaymentMethodResponse | null> {
  try {
    const res = await paymentMethodsGetPaymentMethod(id)
    return res.status === 200 ? res.data : null
  } catch {
    return null
  }
}

export async function createPaymentMethod(
  request: ModelsCreatePaymentMethodRequest,
): Promise<ModelsPaymentMethodResponse> {
  const res = await paymentMethodsCreatePaymentMethod(request)
  if (res.status !== 201) throw new Error('支払い方法の作成に失敗しました')
  return res.data
}

export async function updatePaymentMethod(
  id: string,
  request: ModelsUpdatePaymentMethodRequest,
): Promise<ModelsPaymentMethodResponse> {
  const res = await paymentMethodsUpdatePaymentMethod(id, request)
  if (res.status !== 200) throw new Error('支払い方法の更新に失敗しました')
  return res.data
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const res = await paymentMethodsDeletePaymentMethod(id)
  if (res.status !== 204) throw new Error('支払い方法の削除に失敗しました')
}

export async function deletePaymentMethods(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const res = await paymentMethodsDeletePaymentMethods({ ids })
  if (res.status !== 204) throw new Error('支払い方法の削除に失敗しました')
}

export const paymentMethodService = {
  listPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  deletePaymentMethods,
}
