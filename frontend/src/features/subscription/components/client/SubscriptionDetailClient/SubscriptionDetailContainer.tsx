'use client'

import { SubscriptionDetailPresenter } from './SubscriptionDetailPresenter'
import { useSubscriptionDetail } from './useSubscriptionDetail'

type Props = {
  subscriptionId: string
}

export function SubscriptionDetailContainer({ subscriptionId }: Props) {
  const {
    subscription,
    isLoading,
    isDeleting,
    showDeleteConfirm,
    handleBack,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useSubscriptionDetail(subscriptionId)

  return (
    <SubscriptionDetailPresenter
      subscription={subscription ?? null}
      isLoading={isLoading}
      isDeleting={isDeleting}
      showDeleteConfirm={showDeleteConfirm}
      onBack={handleBack}
      onEdit={handleEdit}
      onDeleteRequest={handleDeleteRequest}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  )
}
