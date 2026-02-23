import "@typespec/http";
import "@typespec/openapi3";
import "../models/user.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using SubsQ.Models;

namespace SubsQ.Routes;

@route("/api/v1/users")
@tag("Users")
interface Users {
  /** 現在のユーザー情報を取得 */
  @get
  @route("/me")
  @summary("Get current user")
  getCurrentUser(): UserResponse | UnauthorizedError;

  /** 現在のユーザーを削除 */
  @delete
  @route("/me")
  @summary("Delete current user")
  deleteCurrentUser(): DeleteUserResponse | UnauthorizedError;
}
