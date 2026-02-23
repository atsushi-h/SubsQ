variable "billing_account_id" {
  description = "GCP請求先アカウントID"
  type        = string
  sensitive   = true
}

variable "gcp_project_id" {
  description = "GCPプロジェクトID"
  type        = string
}

variable "budget_amount" {
  description = "月額予算（JPY）"
  type        = number
  default     = 1000
}
