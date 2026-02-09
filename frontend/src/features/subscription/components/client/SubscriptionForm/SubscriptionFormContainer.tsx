'use client'

import { SubscriptionFormPresenter } from './SubscriptionFormPresenter'
import { useSubscriptionForm } from './useSubscriptionForm'

type Props = { mode: 'create' } | { mode: 'edit'; subscriptionId: string }

export function SubscriptionFormContainer(props: Props) {
  const {
    formData,
    errors,
    isLoading,
    isSubmitting,
    paymentMethods,
    isLoadingPaymentMethods,
    isErrorPaymentMethods,
    errorPaymentMethods,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useSubscriptionForm(props)

  return (
    <SubscriptionFormPresenter
      mode={props.mode}
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      paymentMethods={paymentMethods}
      isLoadingPaymentMethods={isLoadingPaymentMethods}
      isErrorPaymentMethods={isErrorPaymentMethods}
      errorPaymentMethods={errorPaymentMethods}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}
