import 'server-only'
// @ts-expect-error - betterAuth is exported but TypeScript has issues with .d.mts files in pnpm structure
import { betterAuth, type HookEndpointContext } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { customSession } from 'better-auth/plugins'
import { revalidateTag, unstable_cache } from 'next/cache'
import type { UserResponse } from '@/external/dto/user.dto'
import { createOrGetUserCommand } from '@/external/handler/user/user.command.server'
import { getUserByEmailQuery } from '@/external/handler/user/user.query.server'
import { env, isE2EAuthEnabled } from '@/shared/lib/env'

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
 * 【E2E Credentials 認証時（開発環境のみ）】
 * 1. ユーザーがメール/パスワードでログイン
 * 2. カスタムverify関数でE2E_TEST_PASSWORDとの一致をチェック
 * 3. hooks.after で /sign-in/email パスに対してユーザーをDBに保存
 * 4. better-auth がセッション（Cookie）を作成
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
// キャッシュ期間: 5分（cookieCache.maxAgeと同等）
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
  secret: env.BETTER_AUTH_SECRET,
  // データベース設定なし = stateless mode (sessionsテーブル不要)
  session: {
    expiresIn: 60 * 60 * 24 * 7, // セッション有効期限: 7日間
    updateAge: 60 * 60 * 24, // セッション更新間隔: 1日（アクティブ時に自動更新）
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // customSessionのキャッシュ: 5分間
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  // E2Eテスト用のCredentials認証（開発環境のみ）
  // ⚠️ 警告: 本番環境では絶対に有効化しないこと
  emailAndPassword: {
    enabled: isE2EAuthEnabled(),
    requireEmailVerification: false,
    sendVerificationOnSignUp: false,
    password: {
      // カスタムハッシュ関数: パスワードをそのまま返す
      // ⚠️ セキュリティリスク: ハッシュ化しないため、開発環境専用
      // 本番環境では絶対に使用しないこと（isE2EAuthEnabled()で制御）
      hash: async (password: string) => password,
      // カスタム検証関数: E2E_TEST_PASSWORDとの一致をチェック
      verify: async ({ password }: { hash: string; password: string }) => {
        // E2E_TEST_PASSWORDが設定されていない場合は認証失敗
        // isE2EAuthEnabled()がtrueの場合は必ず設定されているはずだが、型安全性のため明示的にチェック
        if (!env.E2E_TEST_PASSWORD) {
          console.error('[better-auth] E2E_TEST_PASSWORD is not set')
          return false
        }
        return password === env.E2E_TEST_PASSWORD
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx: HookEndpointContext) => {
      // Google OAuth と E2E認証の両方に対応
      if (
        ctx.path === '/callback/:id' ||
        ctx.path === '/sign-in/email' ||
        ctx.path === '/sign-up/email'
      ) {
        const newSession = ctx.context.newSession
        if (newSession) {
          const { id, email, name, image } = newSession.user

          // プロバイダー判定
          const provider =
            ctx.path === '/sign-in/email' || ctx.path === '/sign-up/email'
              ? 'credentials'
              : 'google'

          try {
            await createOrGetUserCommand({
              email,
              name: name || email,
              provider,
              providerAccountId: id,
              thumbnail: image || undefined,
            })
            // ユーザー更新後にキャッシュを無効化して、customSessionで最新データを取得
            revalidateTag('user', { expire: 0 })
          } catch (error) {
            console.error('[better-auth] Failed to save user:', error)
          }
        }
      }
    }),
  },
  // ベースURLの設定
  baseURL: env.BETTER_AUTH_URL,
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

      // dbUserが存在しない場合は、DB保存を試みる（初回ログイン時のフォールバック）
      try {
        // NOTE: ここではプロバイダー情報がないため、デフォルトでgoogleを使用
        // 通常はhooks.afterで保存されるため、このフォールバックが実行されることはほぼない
        // ⚠️ 注意: E2E認証（credentials）でもこのフォールバックが実行されると
        // 誤ったprovider（google）が保存される可能性がある
        // 実際にはhooks.afterで正しいproviderで保存されるため問題ないが、
        // このフォールバックに依存しないことが重要
        await createOrGetUserCommand({
          email: user.email,
          name: user.name || user.email,
          provider: 'google',
          providerAccountId: user.id,
          thumbnail: user.image || undefined,
        })

        // DB保存後、再度取得（キャッシュを経由せずに）
        dbUser = await getUserByEmailQuery({ email: user.email })
        if (!dbUser) {
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
