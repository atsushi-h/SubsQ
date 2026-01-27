'use client'

import { PaymentMethodFormPresenter } from './PaymentMethodFormPresenter'
import { usePaymentMethodForm } from './usePaymentMethodForm'

type Props = { mode: 'create' } | { mode: 'edit'; paymentMethodId: string }

export function PaymentMethodFormContainer(props: Props) {
  const {
    formData,
    errors,
    isLoading,
    isSubmitting,
    isDeleting,
    usageCount,
    deleteTarget,
    handleChange,
    handleSubmit,
    handleCancel,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = usePaymentMethodForm(props)

  return (
    <PaymentMethodFormPresenter
      mode={props.mode}
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      usageCount={usageCount}
      deleteTarget={deleteTarget}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onDeleteRequest={handleDeleteRequest}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  )
}
