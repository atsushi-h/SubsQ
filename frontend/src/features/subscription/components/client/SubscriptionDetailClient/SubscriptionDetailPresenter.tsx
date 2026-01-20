'use client'

import type { Subscription } from '@/features/subscription/types/subscription.types'
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
import { DateUtil } from '@/shared/utils/date'

type Props = {
  subscription: Subscription | null
  isLoading: boolean
  isDeleting: boolean
  showDeleteConfirm: boolean
  onBack: () => void
  onEdit: () => void
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function SubscriptionDetailPresenter({
  subscription,
  isLoading,
  isDeleting,
  showDeleteConfirm,
  onBack,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: Props) {
  const formatAmount = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`
  const formatBillingCycle = (cycle: string) => (cycle === 'monthly' ? '月額' : '年額')

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">サブスクリプションが見つかりません</p>
          <Button onClick={onBack}>一覧に戻る</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">サブスクリプション詳細</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            戻る
          </Button>
          <Button variant="outline" onClick={onEdit}>
            編集
          </Button>
          <Button variant="outline" onClick={onDeleteRequest}>
            削除
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">サービス名</p>
            <p className="text-lg font-semibold">{subscription.serviceName}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">金額</p>
              <p className="text-lg">{formatAmount(subscription.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">請求サイクル</p>
              <p className="text-lg">{formatBillingCycle(subscription.billingCycle)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">次回請求日</p>
            <p className="text-lg">{DateUtil.formatDate(subscription.baseDate)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">支払い方法</p>
            <p className="text-lg">{subscription.paymentMethod?.name ?? '未設定'}</p>
          </div>

          {subscription.memo && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">メモ</p>
              <p className="text-lg whitespace-pre-wrap">{subscription.memo}</p>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <p>作成日時</p>
                <p>{DateUtil.formatDateTime(subscription.createdAt)}</p>
              </div>
              <div>
                <p>更新日時</p>
                <p>{DateUtil.formatDateTime(subscription.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 削除確認ダイアログ（shadcn/ui Dialog） */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => !open && onDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除確認</DialogTitle>
            <DialogDescription>
              以下のサブスクリプションを削除してもよろしいですか？
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-semibold">{subscription.serviceName}</p>
          </div>
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
