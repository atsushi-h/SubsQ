import type {
  ModelsUpdateUserRequest,
  ModelsUserResponse,
} from '@/external/client/api/generated/model'
import {
  usersDeleteCurrentUser,
  usersGetCurrentUser,
  usersUpdateCurrentUser,
} from '@/external/client/api/generated/users/users'

export async function getCurrentUser(): Promise<ModelsUserResponse | null> {
  try {
    const res = await usersGetCurrentUser()
    return res.status === 200 ? res.data : null
  } catch {
    return null
  }
}

export async function updateUser(request: ModelsUpdateUserRequest): Promise<ModelsUserResponse> {
  const res = await usersUpdateCurrentUser(request)
  if (res.status !== 200) throw new Error('ユーザー情報の更新に失敗しました')
  return res.data
}

export async function deleteUser(): Promise<void> {
  const res = await usersDeleteCurrentUser()
  if (res.status !== 204) throw new Error('アカウントの削除に失敗しました')
}

export const userService = {
  getCurrentUser,
  updateUser,
  deleteUser,
}
