import "@typespec/http";

using TypeSpec.Http;

namespace SubsQ.Models {
  /** JWT を Cookie（subsq_token）で送信する認証スキーム */
  alias SubsQAuth = ApiKeyAuth<ApiKeyLocation.cookie, "subsq_token">;

  /** ログアウトレスポンス */
  model LogoutResponse {
    message: string;
  }
}
