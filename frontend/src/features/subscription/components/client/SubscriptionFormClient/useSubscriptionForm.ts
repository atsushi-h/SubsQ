'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useCreateSubscriptionMutation } from '@/features/subscription/hooks/useCreateSubscriptionMutation'
import { useSubscriptionDetailQuery } from '@/features/subscription/hooks/useSubscriptionDetailQuery'
import { useUpdateSubscriptionMutation } from '@/features/subscription/hooks/useUpdateSubscriptionMutation'
import {
  type SubscriptionFormData,
  validateSubscriptionForm,
} from '@/features/subscription/schemas/subscription-form.schema'

type UseSubscriptionFormProps = { mode: 'create' } | { mode: 'edit'; subscriptionId: string }

export function useSubscriptionForm(props: UseSubscriptionFormProps) {
  const router = useRouter()
  const createMutation = useCreateSubscriptionMutation()
  const updateMutation = useUpdateSubscriptionMutation()

  const subscriptionId = 'subscriptionId' in props ? props.subscriptionId : undefined

  const { data: existingSubscription, isLoading: isLoadingSubscription } =
    useSubscriptionDetailQuery(subscriptionId)

  const [formData, setFormData] = useState<SubscriptionFormData>({
    serviceName: '',
    amount: '',
    billingCycle: 'monthly',
    baseDate: '',
    memo: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 編集モードの場合、既存データをロード
  // subscriptionIdの変更を検知するため、依存配列に含める必要がある
  // biome-ignore lint/correctness/useExhaustiveDependencies: 編集対象のsubscriptionIdが変わったときに確実に再実行する必要がある
  useEffect(() => {
    if (props.mode === 'edit' && existingSubscription) {
      // ISO文字列から直接日付部分を取得（タイムゾーンの影響を受けない）
      // "2024-03-15T00:00:00.000Z" → "2024-03-15"
      const baseDateString = existingSubscription.baseDate.split('T')[0]

      setFormData({
        serviceName: existingSubscription.serviceName,
        amount: existingSubscription.amount.toString(),
        billingCycle: existingSubscription.billingCycle,
        baseDate: baseDateString,
        memo: existingSubscription.memo || '',
      })
    }
  }, [props.mode, subscriptionId, existingSubscription])

  const handleChange = useCallback((field: keyof SubscriptionFormData, value: string) => {
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
      const result = validateSubscriptionForm(formData)
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

      // ISO datetime 形式に変換（baseDate）
      // タイムゾーンの影響を受けないように明示的にUTCで日付を作成
      const [year, month, day] = formData.baseDate.split('-')
      const baseDateISO = new Date(Date.UTC(+year, +month - 1, +day)).toISOString()

      if (props.mode === 'create') {
        createMutation.mutate(
          {
            serviceName: formData.serviceName,
            amount: Number(formData.amount),
            billingCycle: formData.billingCycle,
            baseDate: baseDateISO,
            memo: formData.memo || undefined,
          },
          {
            onSuccess: () => {
              router.push('/subscriptions')
            },
          },
        )
      } else {
        updateMutation.mutate(
          {
            id: props.subscriptionId,
            serviceName: formData.serviceName,
            amount: Number(formData.amount),
            billingCycle: formData.billingCycle,
            baseDate: baseDateISO,
            memo: formData.memo || undefined,
          },
          {
            onSuccess: () => {
              router.push(`/subscriptions/${props.subscriptionId}`)
            },
          },
        )
      }
    },
    [formData, props, createMutation, updateMutation, router],
  )

  const handleCancel = useCallback(() => {
    if (props.mode === 'edit') {
      router.push(`/subscriptions/${props.subscriptionId}`)
    } else {
      router.push('/subscriptions')
    }
  }, [props, router])

  return {
    formData,
    errors,
    isLoading: isLoadingSubscription,
    isSubmitting: props.mode === 'create' ? createMutation.isPending : updateMutation.isPending,
    handleChange,
    handleSubmit,
    handleCancel,
  }
}
