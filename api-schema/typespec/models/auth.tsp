import "@typespec/http";

using TypeSpec.Http;

namespace SubsQ.Models {
  /** JWT を Cookie（subsq_token）で送信する認証スキーム */
  alias SubsQAuth = ApiKeyAuth<ApiKeyLocation.cookie, "subsq_token">;

  /** 管理者認証スキーム（X-Admin-Token ヘッダー） */
  alias AdminAuth = ApiKeyAuth<ApiKeyLocation.header, "X-Admin-Token">;
}
