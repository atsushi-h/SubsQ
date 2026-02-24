import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

namespace SubsQ.Models;

/** RFC 7807 Problem Details エラーレスポンス */
@error
model ErrorResponse {
  /** エラータイプの URI（RFC 7807: URI参照） */
  @format("uri")
  type: string;

  /** エラーの短い説明 */
  title: string;

  /** HTTP ステータスコード */
  status: int32;

  /** エラーの詳細説明（RFC 7807: SHOULD include、必須ではない） */
  detail?: string;

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

/** UUID形式の文字列（再利用可能な共通スカラー） */
@format("uuid")
scalar uuid extends string;
