variable "service_name" {
  description = "Cloud Runサービスの名前"
  type        = string
}

variable "region" {
  description = "Cloud RunサービスのGCPリージョン"
  type        = string
}

variable "image" {
  description = "デプロイするコンテナイメージ"
  type        = string
}

variable "environment" {
  description = "環境名 (dev, prd)"
  type        = string

  validation {
    condition     = contains(["dev", "prd"], var.environment)
    error_message = "環境は 'dev' または 'prd' のいずれかである必要があります。"
  }
}

variable "service_account_email" {
  description = "Cloud Runサービス用のサービスアカウントメールアドレス"
  type        = string
  default     = null
}

variable "cpu" {
  description = "割り当てるCPU数"
  type        = string
  default     = "1"
}

variable "memory" {
  description = "割り当てるメモリ量 (例: '512Mi', '1Gi')"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "最小インスタンス数"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "最大インスタンス数"
  type        = number
  default     = 10
}

variable "cpu_always_allocated" {
  description = "CPUを常に割り当てるか (true) またはリクエスト処理中のみ割り当てるか (false)"
  type        = bool
  default     = false
}

variable "request_timeout" {
  description = "最大リクエストタイムアウト (秒)"
  type        = number
  default     = 300
}

variable "allow_unauthenticated" {
  description = "サービスへの未認証アクセスを許可するか"
  type        = bool
  default     = true
}

variable "env_vars" {
  description = "コンテナに設定する環境変数"
  type        = map(string)
  default     = {}
  sensitive   = true
}
