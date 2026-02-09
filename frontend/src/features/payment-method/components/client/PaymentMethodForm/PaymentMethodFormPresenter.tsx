'use client'

import type { PaymentMethodFormData } from '@/features/payment-method/schemas/payment-method-form.schema'
import type { PaymentMethodWithUsage } from '@/features/payment-method/types/payment-method.types'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

type Props = {
  mode: 'create' | 'edit'
  formData: PaymentMethodFormData
  errors: Record<string, string>
  isLoading: boolean
  isSubmitting: boolean
  isDeleting: boolean
  usageCount: number
  deleteTarget: PaymentMethodWithUsage | null
  onChange: (field: keyof PaymentMethodFormData, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function PaymentMethodFormPresenter({
  mode,
  formData,
  errors,
  isLoading,
  isSubmitting,
  isDeleting,
  usageCount,
  deleteTarget,
  onChange,
  onSubmit,
  onCancel,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
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

  const isInUse = usageCount > 0

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {mode === 'create' ? '支払い方法の新規作成' : '支払い方法の編集'}
      </h1>

      <Card className="p-6">
        <form onSubmit={onSubmit}>
          <div className="space-y-6">
            {/* 支払い方法名 */}
            <div className="space-y-2">
              <Label htmlFor="name">支払い方法名 *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="例: メインクレジットカード"
                disabled={isSubmitting}
                data-testid="payment-method-form-name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* 編集モードの場合、使用中件数を表示 */}
            {mode === 'edit' && (
              <div className="space-y-2">
                <Label>使用中のサブスクリプション</Label>
                <p className="text-sm text-muted-foreground">
                  {isInUse ? `${usageCount}件のサブスクリプションで使用中` : '未使用'}
                </p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-4 justify-between">
              <div>
                {mode === 'edit' && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDeleteRequest}
                    disabled={isSubmitting || isInUse}
                    title={isInUse ? '使用中の支払い方法は削除できません' : ''}
                  >
                    削除
                  </Button>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  data-testid="payment-method-form-cancel"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="payment-method-form-submit"
                >
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
          </div>
        </form>
      </Card>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && onDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除確認</DialogTitle>
            <DialogDescription>以下の支払い方法を削除してもよろしいですか？</DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-4">
              <p className="font-semibold">{deleteTarget.name}</p>
              {deleteTarget.usageCount > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  警告: この支払い方法は{deleteTarget.usageCount}
                  件のサブスクリプションで使用されています。
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onDeleteCancel} disabled={isDeleting}>
              キャンセル
            </Button>
            <Button onClick={onDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? '削除中...' : '削除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
