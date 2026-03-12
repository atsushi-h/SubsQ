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

  /** OAuth ユーザー作成または取得（認証不要・OAuth フロー用） */
  @post
  @summary("Create or get user via OAuth")
  upsertUser(@body body: UpsertUserRequest): UserResponse | BadRequestError;

  /** メールアドレスでユーザーを検索（OAuth フロー内部用） */
  @get
  @route("/by-email")
  @summary("Get user by email")
  getUserByEmail(@query email: string): UserResponse | NotFoundError | BadRequestError;

}
