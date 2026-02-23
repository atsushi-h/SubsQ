import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

namespace SubsQ.Models;

/** RFC 7807 Problem Details エラーレスポンス */
@error
model ErrorResponse {
  /** エラータイプの URI */
  type: string;

  /** エラーの短い説明 */
  title: string;

  /** HTTP ステータスコード */
  status: int32;

  /** エラーの詳細説明 */
  detail: string;

  /** エラーが発生したリソースの URI（オプション） */
  instance?: string;
}

/** Not Found エラー */
model NotFoundError extends ErrorResponse {
  title: "Not Found";
  status: 404;
}

/** Unauthorized エラー */
model UnauthorizedError extends ErrorResponse {
  title: "Unauthorized";
  status: 401;
}

/** Forbidden エラー */
model ForbiddenError extends ErrorResponse {
  title: "Forbidden";
  status: 403;
}

/** Bad Request エラー */
model BadRequestError extends ErrorResponse {
  title: "Bad Request";
  status: 400;
}

/** Conflict エラー */
model ConflictError extends ErrorResponse {
  title: "Conflict";
  status: 409;
}
