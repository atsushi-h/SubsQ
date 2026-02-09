import type { Metadata } from 'next'
import { SettingsPageTemplate } from '@/features/settings/components/server/SettingsPageTemplate'
import { generatePageMetadata } from '@/shared/lib/metadata'

export const metadata: Metadata = generatePageMetadata('SETTINGS', {
  path: '/settings',
})

export default function SettingsPage() {
  return <SettingsPageTemplate />
}
