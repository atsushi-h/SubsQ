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
 *    ※ DB接続失敗時はCookie内のデータで継続（ログアウトしない）
 *
 * 【セッション構造】
 * - user: { id, email, name, image, ... }  ← better-auth が作成、customSessionでidを上書き
 * - session: { id, expiresAt, token, ... } ← better-auth が自動で作成
 */

/**
 * ログ用メールマスキング（例: ats***@gmail.com）
 * PII（個人識別情報）保護のため、メールアドレスの一部を伏せ字にする
 */
const maskEmail = (email: string): string => email.replace(/(?<=.{3}).(?=.*@)/g, '*')

/**
 * customSession内でdbUserが存在しない場合のフォールバック処理
 * ユーザー作成を試み、作成後にDBから取得して返す
 *
 * @returns DBから取得したユーザー情報、または失敗時はnull
 */
async function fallbackCreateUser(
  email: string,
  name: string,
  providerId: string,
  image?: string,
): Promise<UserResponse | null> {
  try {
    // NOTE: ここではプロバイダー情報がないため、デフォルトでgoogleを使用
    // 通常はhooks.afterで保存されるため、このフォールバックが実行されることはほぼない
    // ⚠️ 注意: E2E認証（credentials）でもこのフォールバックが実行されると
    // 誤ったprovider（google）が保存される可能性がある
    // 実際にはhooks.afterで正しいproviderで保存されるため問題ないが、
    // このフォールバックに依存しないことが重要
    await createOrGetUserCommand({
      email,
      name: name || email,
      provider: 'google',
      providerAccountId: providerId,
      thumbnail: image || undefined,
    })

    const dbUser = await getUserByEmailQuery({ email })
    if (!dbUser) {
      console.error(
        '[customSession] User creation succeeded but retrieval failed, using cookie data',
      )
      return null
    }

    return dbUser
  } catch (error) {
    console.error('[customSession] Failed to create/get user, using cookie data:', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

// セッション設定の定数
const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7 // 7日間
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24 // 1日
const COOKIE_CACHE_MAX_AGE_SECONDS = 5 * 60 // 5分
const USER_CACHE_REVALIDATE_SECONDS = 5 * 60 // 5分

// customSessionは毎回実行されるため、Next.jsのunstable_cacheでキャッシング
// キャッシュ期間: 5分（cookieCache無効化後のDB再取得を抑制）
// NOTE: unstable_cacheは関数の引数も自動的にキャッシュキーに含まれる
// ※ DB接続失敗時はエラーをthrowし、customSessionでCookieデータにフォールバック
const getCachedUser = unstable_cache(
  async (email: string): Promise<UserResponse | null> => {
    console.log('[getCachedUser] DB query executing (cache miss)', { email: maskEmail(email) })
    const startTime = Date.now()
    try {
      const result = await getUserByEmailQuery({ email })
      console.log('[getCachedUser] DB query success', {
        found: !!result,
        elapsed: `${Date.now() - startTime}ms`,
      })
      return result
    } catch (error) {
      console.error('[getCachedUser] DB query FAILED', {
        elapsed: `${Date.now() - startTime}ms`,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error // customSessionでキャッチする
    }
  },
  ['user-by-email'], // 引数emailは自動的にキャッシュキーに含まれる
  {
    revalidate: USER_CACHE_REVALIDATE_SECONDS,
    tags: ['user'],
  },
)

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  // データベース設定なし = stateless mode (sessionsテーブル不要)
  session: {
    expiresIn: SESSION_EXPIRES_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: COOKIE_CACHE_MAX_AGE_SECONDS,
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
     *            通常時: user.id を DBのユーザーIDで上書きして返す
     *            DB接続失敗時: Cookieの user, session をそのまま返す（ログアウトしない）
     */
    customSession(async ({ user, session }) => {
      console.log('[customSession] START', { email: maskEmail(user.email) })
      const startTime = Date.now()

      try {
        let dbUser = await getCachedUser(user.email)
        console.log('[customSession] getCachedUser result', {
          found: !!dbUser,
          elapsed: `${Date.now() - startTime}ms`,
        })

        if (dbUser) {
          return { user: { ...user, id: dbUser.id }, session }
        }

        // dbUserが存在しない場合のフォールバック
        dbUser = await fallbackCreateUser(user.email, user.name, user.id, user.image || undefined)

        if (dbUser) {
          return { user: { ...user, id: dbUser.id }, session }
        }

        // NOTE: この時のuser.idはbetter-auth内部ID（OAuth provider ID）であり、
        // DBのアプリ固有ユーザーIDではない。下流のDB操作でデータ取得に失敗する可能性があるが、
        // Cookie削除（強制ログアウト）よりは許容できるトレードオフ。
        // cookieCache(5分)が有効な間はこのパスに到達しない。
        return { user, session }
      } catch (error) {
        const elapsed = Date.now() - startTime
        console.error('[customSession] DB error, using cookie data:', {
          elapsed: `${elapsed}ms`,
          error: error instanceof Error ? error.message : String(error),
        })
        // NOTE: この時のuser.idはbetter-auth内部ID（OAuth provider ID）であり、
        // DBのアプリ固有ユーザーIDではない。下流のDB操作でデータ取得に失敗する可能性があるが、
        // Cookie削除（強制ログアウト）よりは許容できるトレードオフ。
        // cookieCache(5分)が有効な間はこのパスに到達しない。
        return { user, session }
      }
    }),
  ],
})
