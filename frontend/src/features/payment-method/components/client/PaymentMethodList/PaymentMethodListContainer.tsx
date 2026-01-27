'use client'

import { PaymentMethodListPresenter } from './PaymentMethodListPresenter'
import { usePaymentMethodList } from './usePaymentMethodList'

export function PaymentMethodListContainer() {
  const {
    paymentMethods,
    isLoading,
    isDeleting,
    deleteTarget,
    handleCreate,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = usePaymentMethodList()

  return (
    <PaymentMethodListPresenter
      paymentMethods={paymentMethods}
      isLoading={isLoading}
      isDeleting={isDeleting}
      deleteTarget={deleteTarget}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDeleteRequest={handleDeleteRequest}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  )
}
