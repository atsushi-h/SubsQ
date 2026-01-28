'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  const usageCount =
    !paymentMethodId || !subscriptionData?.subscriptions
      ? 0
      : subscriptionData.subscriptions.filter((sub) => sub.paymentMethod?.id === paymentMethodId)
          .length

  // 編集モードの場合、既存データをロード
  // biome-ignore lint/correctness/useExhaustiveDependencies: 編集対象のpaymentMethodIdが変わったときに確実に再実行する必要がある
  useEffect(() => {
    if (props.mode === 'edit' && existingPaymentMethod) {
      setFormData({
        name: existingPaymentMethod.name,
      })
    }
  }, [props.mode, paymentMethodId, existingPaymentMethod])

  const handleChange = (field: keyof PaymentMethodFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // エラーをクリア
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
  }

  const handleCancel = () => {
    router.push('/payment-methods')
  }

  const handleDeleteRequest = () => {
    if (props.mode === 'edit' && existingPaymentMethod) {
      setDeleteTarget({
        ...existingPaymentMethod,
        usageCount,
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          router.push('/payment-methods')
        },
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

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
