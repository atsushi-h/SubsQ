import 'server-only'
import { betterAuth } from 'better-auth'
import { customSession } from 'better-auth/plugins'
import { unstable_cache, updateTag } from 'next/cache'
import type { UserResponse } from '@/external/dto/user.dto'
import { createOrGetUserCommand } from '@/external/handler/user/user.command.server'
import { getUserByEmailQuery } from '@/external/handler/user/user.query.server'

/**
 * better-auth 認証フロー
 *
 * 【Google OAuth 認証時】
 * 1. ユーザーがGoogleでログイン
 * 2. Googleから認証情報（id, email, name, image）が返される
 * 3. onSuccess コールバックが呼ばれる
 *    → ここでユーザーをDBに保存（既存の場合は何もしない）
 * 4. better-auth がセッション（Cookie）を作成
 *    → user, session は better-auth が自動で作成する基本情報
 * 5. customSession が呼ばれ、DBのユーザーIDでセッションのuser.idを上書き
 *
 * 【認証済みリクエスト時】
 * 1. Cookieから user, session を復元（better-auth が自動で行う）
 * 2. cookieCacheが有効な間（5分間）はcustomSessionは呼ばれない
 * 3. キャッシュ切れ時にcustomSessionが呼ばれ、DBからユーザーを取得してIDを更新
 *
 * 【セッション構造】
 * - user: { id, email, name, image, ... }  ← better-auth が作成、customSessionでidを上書き
 * - session: { id, expiresAt, token, ... } ← better-auth が自動で作成
 */

// customSessionは毎回実行されるため、Next.jsのunstable_cacheでキャッシング
// キャッシュ期間: 5分（セッションの有効期間と同等）
// NOTE: unstable_cacheは関数の引数も自動的にキャッシュキーに含まれる
const getCachedUser = unstable_cache(
  async (email: string): Promise<UserResponse | null> => {
    return await getUserByEmailQuery({ email })
  },
  ['user-by-email'], // 引数emailは自動的にキャッシュキーに含まれる
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ['user'],
  },
)

export const auth = betterAuth({
  // データベース設定なし = stateless mode
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5分間キャッシュ
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      /**
       * OAuth認証成功時に1回だけ呼ばれるコールバック
       * ctx.user: Googleから取得したユーザー情報
       */
      async onSuccess(ctx: {
        user: {
          id: string
          email: string
          name: string
          image?: string
        }
      }) {
        try {
          await createOrGetUserCommand({
            email: ctx.user.email,
            name: ctx.user.name || ctx.user.email,
            provider: 'google',
            providerAccountId: ctx.user.id,
            thumbnail: ctx.user.image || undefined,
          })
          // ユーザー更新後にキャッシュを無効化して、customSessionで最新データを取得
          updateTag('user')
        } catch (error) {
          console.error('[better-auth] Failed to save user in onSuccess:', error)
          throw error // エラーを再スローして認証を失敗させる
        }
      },
    },
  },
  // ベースURLの設定
  baseURL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  // セッション設定 - statelessモードではデフォルトでクッキーベース
  plugins: [
    /**
     * セッション検証時に呼ばれるコールバック（cookieCacheが有効な間は呼ばれない）
     *
     * @param user - better-auth が自動で作成した基本ユーザー情報（Cookieから復元）
     *               { id, email, name, image, createdAt, updatedAt, emailVerified }
     * @param session - better-auth が自動で作成した基本セッション情報
     *               { id, userId, expiresAt, token, ipAddress, userAgent, ... }
     * @returns - return で返した値がセッションに反映される
     *            ここでは user.id を DBのユーザーIDで上書きしている
     */
    customSession(async ({ user, session }) => {
      let dbUser = await getCachedUser(user.email)

      // dbUserが存在する場合は、セッションのuserにidを追加して返す
      if (dbUser) {
        // user.idをDBのユーザーIDで上書き
        return { user: { ...user, id: dbUser.id }, session }
      }

      // dbUserが存在しない場合は、DB保存を試みる（初回ログイン時）
      try {
        await createOrGetUserCommand({
          email: user.email,
          name: user.name || user.email,
          provider: 'google',
          providerAccountId: user.id,
          thumbnail: user.image || undefined,
        })
        console.log('[better-auth] User created successfully')

        // DB保存後、再度取得（キャッシュを経由せずに）
        dbUser = await getUserByEmailQuery({ email: user.email })
        if (!dbUser) {
          console.error('[better-auth] User still not found after creation')
          throw new Error('Failed to create user')
        }

        return { user: { ...user, id: dbUser.id }, session }
      } catch (error) {
        console.error('[better-auth] Failed to create user:', error)
        throw new Error('Failed to create user')
      }
    }),
  ],
})
