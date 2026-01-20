'use client'

import type { SubscriptionFormData } from '@/features/subscription/schemas/subscription-form.schema'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

type Props = {
  mode: 'create' | 'edit'
  formData: SubscriptionFormData
  errors: Record<string, string>
  isLoading: boolean
  isSubmitting: boolean
  onChange: (field: keyof SubscriptionFormData, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function SubscriptionFormPresenter({
  mode,
  formData,
  errors,
  isLoading,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {mode === 'create' ? 'サブスクリプション新規作成' : 'サブスクリプション編集'}
      </h1>

      <Card className="p-6">
        <form onSubmit={onSubmit}>
          <div className="space-y-6">
            {/* サービス名 */}
            <div className="space-y-2">
              <Label htmlFor="serviceName">サービス名 *</Label>
              <Input
                id="serviceName"
                type="text"
                value={formData.serviceName}
                onChange={(e) => onChange('serviceName', e.target.value)}
                placeholder="例: Netflix"
                disabled={isSubmitting}
              />
              {errors.serviceName && <p className="text-sm text-red-500">{errors.serviceName}</p>}
            </div>

            {/* 金額 */}
            <div className="space-y-2">
              <Label htmlFor="amount">金額（円） *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => onChange('amount', e.target.value)}
                placeholder="例: 1980"
                disabled={isSubmitting}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* 請求サイクル */}
            <div className="space-y-2">
              <Label htmlFor="billingCycle">請求サイクル *</Label>
              <select
                id="billingCycle"
                value={formData.billingCycle}
                onChange={(e) => onChange('billingCycle', e.target.value)}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="monthly">月額</option>
                <option value="yearly">年額</option>
              </select>
              {errors.billingCycle && <p className="text-sm text-red-500">{errors.billingCycle}</p>}
            </div>

            {/* 基準日 */}
            <div className="space-y-2">
              <Label htmlFor="baseDate">基準日（次回請求日） *</Label>
              <Input
                id="baseDate"
                type="date"
                value={formData.baseDate}
                onChange={(e) => onChange('baseDate', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.baseDate && <p className="text-sm text-red-500">{errors.baseDate}</p>}
            </div>

            {/* メモ */}
            <div className="space-y-2">
              <Label htmlFor="memo">メモ</Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => onChange('memo', e.target.value)}
                placeholder="メモを入力してください（任意）"
                disabled={isSubmitting}
              />
              {errors.memo && <p className="text-sm text-red-500">{errors.memo}</p>}
            </div>

            {/* ボタン */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === 'create'
                    ? '作成中...'
                    : '更新中...'
                  : mode === 'create'
                    ? '作成'
                    : '更新'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
