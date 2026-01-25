variable "zone_id" {
  description = "Cloudflare Zone ID"
  type        = string
}

variable "account_id" {
  description = "Cloudflare Account ID (Zero Trust Access用に必要)"
  type        = string
}

variable "subdomain" {
  description = "アプリケーションのサブドメイン (例: 'dev', 'www')"
  type        = string
}

variable "cloud_run_url" {
  description = "Cloud RunサービスのURL (https://なし)"
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

variable "enable_access" {
  description = "Cloudflare Accessによる認証を有効にするか"
  type        = bool
  default     = false
}

variable "access_allowed_emails" {
  description = "Cloudflare Accessで許可するメールアドレスのリスト"
  type        = list(string)
  default     = []

  validation {
    condition     = var.enable_access ? length(var.access_allowed_emails) > 0 : true
    error_message = "Cloudflare Accessを有効にする場合、少なくとも1つのメールアドレスを指定してください。access_allowed_emails変数に許可するメールアドレスを設定するか、enable_access = false で無効化してください。"
  }
}

variable "domain_name" {
  description = "ドメイン名 (例: 'example.com')"
  type        = string
}
