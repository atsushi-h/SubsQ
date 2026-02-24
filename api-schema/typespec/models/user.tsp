import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

namespace SubsQ.Models;

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

/** ユーザー削除レスポンス */
model DeleteUserResponse {
  /** 削除されたユーザーID */
  id: uuid;
}
