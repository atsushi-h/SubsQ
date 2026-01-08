/**
 * better-auth の型拡張（Declaration Merging）
 *
 * 【このファイルの役割】
 * - TypeScript に「better-auth のセッションにはこんなフィールドもあるよ」と教える
 * - コンパイル時の型チェックのみに使用される
 * - 実行時には完全に消える（JavaScript には型がない）
 *
 * 【重要】
 * ここで型を定義しても、実際に値が入るわけではない！
 * 値を入れるのは better-auth.ts の customSession の return で行う。
 *
 * 例: session.user.id を使いたい場合
 * 1. ここで User.id の型を定義 ← 型だけ
 * 2. customSession で return { user: { ...user, id: dbUser.id }, session } ← 実際に値を入れる
 */
declare module 'better-auth' {
  /**
   * セッション全体の型を拡張
   * customSession の return で追加したフィールドをここで定義
   */
  interface Session {
    /** トークンリフレッシュ失敗時のエラー */
    error?: 'RefreshTokenMissing' | 'RefreshAccessTokenError'
  }

  /**
   * User の型を拡張
   * 注意: ここに定義しても、customSession で明示的に
   * return { user: { ...user, id }, ... } しないと値は入らない
   */
  interface User {
    id: string
    email: string
    name: string
    image?: string
  }
}
