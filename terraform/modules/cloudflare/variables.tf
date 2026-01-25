variable "zone_id" {
  description = "Cloudflare Zone ID"
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

variable "enable_waf" {
  description = "WAF (Web Application Firewall) ルールを有効にするか"
  type        = bool
  default     = true
}

variable "enable_rate_limiting" {
  description = "レート制限ルールを有効にするか"
  type        = bool
  default     = true
}

variable "api_rate_limit_requests_per_minute" {
  description = "IP毎に許可されるAPIリクエスト数 (1分あたり)"
  type        = number
  default     = 60
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
}
