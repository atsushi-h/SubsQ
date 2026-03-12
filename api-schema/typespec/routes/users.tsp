import "@typespec/http";
import "@typespec/openapi3";
import "../models/user.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using SubsQ.Models;

namespace SubsQ.Routes;

@route("/api/v1/users")
@tag("Users")
@useAuth(SubsQAuth)
interface Users {
  /** 現在のユーザー情報を取得 */
  @get
  @route("/me")
  @summary("Get current user")
  getCurrentUser(): UserResponse | UnauthorizedError;

  /** 現在のユーザープロフィールを更新（認証必須） */
  @patch
  @route("/me")
  @summary("Update current user")
  updateCurrentUser(@body body: UpdateUserRequest): UserResponse | UnauthorizedError | BadRequestError;

  /** 現在のユーザーを削除 */
  @delete
  @route("/me")
  @summary("Delete current user")
  deleteCurrentUser(): void | UnauthorizedError;
}
