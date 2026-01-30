'use client'

import { useTheme } from 'next-themes'
import { ModeTogglePresenter } from './ModeTogglePresenter'

export function ModeToggleContainer() {
  const { setTheme } = useTheme()

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme)
  }

  return <ModeTogglePresenter onThemeChange={handleThemeChange} />
}
