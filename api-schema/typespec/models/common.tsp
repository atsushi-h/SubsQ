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
@error
model NotFoundError {
  type: string;
  title: "Not Found";
  status: 404;
  detail: string;
  instance?: string;
}

/** Unauthorized エラー */
@error
model UnauthorizedError {
  type: string;
  title: "Unauthorized";
  status: 401;
  detail: string;
  instance?: string;
}

/** Forbidden エラー */
@error
model ForbiddenError {
  type: string;
  title: "Forbidden";
  status: 403;
  detail: string;
  instance?: string;
}

/** Bad Request エラー */
@error
model BadRequestError {
  type: string;
  title: "Bad Request";
  status: 400;
  detail: string;
  instance?: string;
}

/** Conflict エラー */
@error
model ConflictError {
  type: string;
  title: "Conflict";
  status: 409;
  detail: string;
  instance?: string;
}
