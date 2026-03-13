import "@typespec/http";

using TypeSpec.Http;
using SubsQ.Models;

namespace SubsQ.Routes;

@route("/api/v1/auth")
@tag("Auth")
interface Auth {
  /** ログアウト（subsq_token クッキーを削除） */
  @post
  @route("/logout")
  @summary("Logout")
  logout(): LogoutResponse;
}
