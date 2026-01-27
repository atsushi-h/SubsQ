'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from '@/external/dto/payment-method.dto'
import { useCreatePaymentMethodMutation } from '@/features/payment-method/hooks/useCreatePaymentMethodMutation'
import { useDeletePaymentMethodMutation } from '@/features/payment-method/hooks/useDeletePaymentMethodMutation'
import { usePaymentMethodDetailQuery } from '@/features/payment-method/hooks/usePaymentMethodDetailQuery'
import { useUpdatePaymentMethodMutation } from '@/features/payment-method/hooks/useUpdatePaymentMethodMutation'
import {
  type PaymentMethodFormData,
  validatePaymentMethodForm,
} from '@/features/payment-method/schemas/payment-method-form.schema'
import type { PaymentMethodWithUsage } from '@/features/payment-method/types/payment-method.types'
import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionListQuery'

type UsePaymentMethodFormProps = { mode: 'create' } | { mode: 'edit'; paymentMethodId: string }

export function usePaymentMethodForm(props: UsePaymentMethodFormProps) {
  const router = useRouter()
  const createMutation = useCreatePaymentMethodMutation()
  const updateMutation = useUpdatePaymentMethodMutation()
  const deleteMutation = useDeletePaymentMethodMutation()

  const paymentMethodId = 'paymentMethodId' in props ? props.paymentMethodId : undefined

  const { data: existingPaymentMethod, isLoading: isLoadingPaymentMethod } =
    usePaymentMethodDetailQuery(paymentMethodId)

  const { data: subscriptionData } = useSubscriptionListQuery()

  const [formData, setFormData] = useState<PaymentMethodFormData>({
    name: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethodWithUsage | null>(null)

  // 使用中件数を計算
  const usageCount = useMemo(() => {
    if (!paymentMethodId || !subscriptionData?.subscriptions) return 0

    return subscriptionData.subscriptions.filter((sub) => sub.paymentMethod?.id === paymentMethodId)
      .length
  }, [paymentMethodId, subscriptionData])

  // 編集モードの場合、既存データをロード
  // biome-ignore lint/correctness/useExhaustiveDependencies: 編集対象のpaymentMethodIdが変わったときに確実に再実行する必要がある
  useEffect(() => {
    if (props.mode === 'edit' && existingPaymentMethod) {
      setFormData({
        name: existingPaymentMethod.name,
      })
    }
  }, [props.mode, paymentMethodId, existingPaymentMethod])

  const handleChange = useCallback((field: keyof PaymentMethodFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // エラーをクリア
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // バリデーション
      const result = validatePaymentMethodForm(formData)
      if (!result.success) {
        const newErrors: Record<string, string> = {}
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0].toString()] = issue.message
          }
        })
        setErrors(newErrors)
        return
      }

      if (props.mode === 'create') {
        const requestData: Omit<CreatePaymentMethodRequest, 'userId'> = {
          name: formData.name,
        }

        createMutation.mutate(requestData, {
          onSuccess: () => {
            router.push('/payment-methods')
          },
        })
      } else {
        const requestData: UpdatePaymentMethodRequest = {
          id: props.paymentMethodId,
          name: formData.name,
        }

        updateMutation.mutate(requestData, {
          onSuccess: () => {
            router.push('/payment-methods')
          },
        })
      }
    },
    [formData, props, createMutation, updateMutation, router],
  )

  const handleCancel = useCallback(() => {
    router.push('/payment-methods')
  }, [router])

  const handleDeleteRequest = useCallback(() => {
    if (props.mode === 'edit' && existingPaymentMethod) {
      setDeleteTarget({
        ...existingPaymentMethod,
        usageCount,
      })
    }
  }, [props.mode, existingPaymentMethod, usageCount])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          router.push('/payment-methods')
        },
      })
    }
  }, [deleteTarget, deleteMutation, router])

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  return {
    formData,
    errors,
    isLoading: isLoadingPaymentMethod,
    isSubmitting: props.mode === 'create' ? createMutation.isPending : updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    usageCount,
    deleteTarget,
    handleChange,
    handleSubmit,
    handleCancel,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
