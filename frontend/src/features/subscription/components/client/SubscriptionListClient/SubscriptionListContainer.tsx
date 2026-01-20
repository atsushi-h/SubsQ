'use client'

import { SubscriptionListPresenter } from './SubscriptionListPresenter'
import { useSubscriptionList } from './useSubscriptionList'

export function SubscriptionListContainer() {
  const {
    subscriptions,
    totals,
    isLoading,
    isDeleting,
    deleteTarget,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useSubscriptionList()

  return (
    <SubscriptionListPresenter
      subscriptions={subscriptions}
      totals={totals}
      isLoading={isLoading}
      isDeleting={isDeleting}
      deleteTarget={deleteTarget}
      onCreate={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
      onDeleteRequest={handleDeleteRequest}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  )
}
