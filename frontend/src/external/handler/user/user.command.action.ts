'use server'

import { deleteUserAccountCommand } from '@/external/handler/user/user.command.server'
import { withAuth } from '@/features/auth/servers/auth.guard'

export async function deleteUserAccountCommandAction(): Promise<void> {
  return withAuth(({ userId }) => deleteUserAccountCommand(userId))
}
