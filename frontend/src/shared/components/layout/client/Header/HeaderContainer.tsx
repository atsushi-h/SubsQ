'use client'

import { HeaderPresenter } from './HeaderPresenter'
import { useHeader } from './useHeader'

export function HeaderContainer() {
  const { userName, userEmail, userImage, pathname, handleSignOut } = useHeader()

  return (
    <HeaderPresenter
      userName={userName}
      userEmail={userEmail}
      userImage={userImage}
      pathname={pathname}
      onSignOut={handleSignOut}
    />
  )
}
