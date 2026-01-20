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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

type Props = {
  subscriptions: Subscription[]
  totals?: { monthlyTotal: number; yearlyTotal: number }
  isLoading: boolean
  isDeleting: boolean
  deleteTarget: Subscription | null
  onCreate: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDeleteRequest: (subscription: Subscription) => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function SubscriptionListPresenter({
  subscriptions,
  totals,
  isLoading,
  isDeleting,
  deleteTarget,
  onCreate,
  onView,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: Props) {
  const formatAmount = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`
  const formatBillingCycle = (cycle: string) => (cycle === 'monthly' ? '月額' : '年額')
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
  }

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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">サブスクリプション管理</h1>
        <Button onClick={onCreate}>新規作成</Button>
      </div>

      {totals && (
        <Card className="p-6 mb-6">
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-muted-foreground">月額合計</p>
              <p className="text-2xl font-bold">{formatAmount(totals.monthlyTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">年額合計</p>
              <p className="text-2xl font-bold">{formatAmount(totals.yearlyTotal)}</p>
            </div>
          </div>
        </Card>
      )}

      {subscriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">サブスクリプションがまだありません</p>
          <p className="text-sm text-muted-foreground mb-6">
            最初のサブスクリプションを作成しましょう
          </p>
          <Button onClick={onCreate}>サブスクリプションを追加</Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>サービス名</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>請求サイクル</TableHead>
                <TableHead>次回請求日</TableHead>
                <TableHead>支払い方法</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.serviceName}</TableCell>
                  <TableCell>{formatAmount(subscription.amount)}</TableCell>
                  <TableCell>{formatBillingCycle(subscription.billingCycle)}</TableCell>
                  <TableCell>{formatDate(subscription.baseDate)}</TableCell>
                  <TableCell>{subscription.paymentMethod?.name ?? '未設定'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onView(subscription.id)}>
                        詳細
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(subscription.id)}>
                        編集
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteRequest(subscription)}
                      >
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 削除確認ダイアログ（shadcn/ui Dialog） */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && onDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除確認</DialogTitle>
            <DialogDescription>
              以下のサブスクリプションを削除してもよろしいですか？
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-4">
              <p className="font-semibold">{deleteTarget.serviceName}</p>
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
