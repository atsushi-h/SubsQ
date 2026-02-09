'use client'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { DateUtil } from '@/shared/utils/date'

type Props = {
  paymentMethods: PaymentMethodWithUsage[]
  isLoading: boolean
  isDeleting: boolean
  deleteTarget: PaymentMethodWithUsage | null
  onCreate: () => void
  onEdit: (id: string) => void
  onDeleteRequest: (paymentMethod: PaymentMethodWithUsage) => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function PaymentMethodListPresenter({
  paymentMethods,
  isLoading,
  isDeleting,
  deleteTarget,
  onCreate,
  onEdit,
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">支払い方法管理</h1>
        <Button onClick={onCreate}>+ 支払い方法を追加</Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">支払い方法がまだありません</p>
          <p className="text-sm text-muted-foreground mb-6">最初の支払い方法を追加しましょう</p>
          <Button onClick={onCreate}>支払い方法を追加</Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>支払い方法名</TableHead>
                <TableHead>使用中のサブスクリプション</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods.map((paymentMethod) => {
                const isInUse = paymentMethod.usageCount > 0

                return (
                  <TableRow key={paymentMethod.id}>
                    <TableCell className="font-medium">{paymentMethod.name}</TableCell>
                    <TableCell>
                      {isInUse ? (
                        <span>{paymentMethod.usageCount}件</span>
                      ) : (
                        <span className="text-muted-foreground">未使用</span>
                      )}
                    </TableCell>
                    <TableCell>{DateUtil.formatDate(paymentMethod.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(paymentMethod.id)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteRequest(paymentMethod)}
                          disabled={isInUse}
                          title={isInUse ? '使用中の支払い方法は削除できません' : ''}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

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
