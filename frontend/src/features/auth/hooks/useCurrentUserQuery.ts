'use client'

import { useQuery } from '@tanstack/react-query'
import type { ModelsUserResponse } from '@/external/client/api/generated/model'
import { usersGetCurrentUser } from '@/external/client/api/generated/users/users'

export const currentUserKeys = {
  all: ['currentUser'] as const,
}

export function useCurrentUserQuery() {
  return useQuery<ModelsUserResponse | null>({
    queryKey: currentUserKeys.all,
    queryFn: async () => {
      try {
        const res = await usersGetCurrentUser()
        return res.status === 200 ? res.data : null
      } catch {
        return null
      }
    },
  })
}
