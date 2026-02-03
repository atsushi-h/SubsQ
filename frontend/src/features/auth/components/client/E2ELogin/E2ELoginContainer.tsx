'use client'

import { E2ELoginPresenter } from './E2ELoginPresenter'
import { useE2ELogin } from './useE2ELogin'

export function E2ELoginContainer() {
  const { handleE2ELogin, isLoading, error } = useE2ELogin()

  return <E2ELoginPresenter onSubmit={handleE2ELogin} isLoading={isLoading} error={error} />
}
