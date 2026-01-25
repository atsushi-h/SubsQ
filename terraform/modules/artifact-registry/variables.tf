variable "region" {
  description = "Artifact RegistryのGCPリージョン"
  type        = string
}

variable "repository_name" {
  description = "Artifact Registryリポジトリの名前"
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

variable "cleanup_keep_count" {
  description = "クリーンアップポリシーで保持する最新イメージの数"
  type        = number
  default     = 10
}
