import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

namespace SubsQ.Models;

/** ユーザープロフィール更新リクエスト */
model UpdateUserRequest {
  /** 表示名 */
  name?: string;

  /** プロフィール画像URL（null で削除） */
  @format("uri")
  thumbnail?: string | null;
}

/** OAuth ユーザー作成/取得リクエスト（createOrGet） */
model UpsertUserRequest {
  /** メールアドレス */
  @format("email")
  email: string;

  /** 表示名 */
  name: string;

  /** OAuthプロバイダー（例: google） */
  provider: string;

  /** プロバイダー側のアカウントID */
  providerAccountId: string;

  /** プロフィール画像URL */
  @format("uri")
  thumbnail?: string;
}

/** ユーザー情報レスポンス */
model UserResponse {
  /** ユーザーID */
  id: uuid;

  /** メールアドレス */
  @format("email")
  email: string;

  /** 表示名 */
  name: string;

  /** OAuthプロバイダー（例: google） */
  provider: string;

  /** プロバイダー側のアカウントID */
  providerAccountId: string;

  /** プロフィール画像URL */
  @format("uri")
  thumbnail?: string;

  /** 作成日時 */
  createdAt: utcDateTime;

  /** 更新日時 */
  updatedAt: utcDateTime;
}
