/**
 * prd環境用の変数
 */

# ===========================
# GCP設定
# ===========================

variable "gcp_project_id" {
  description = "GCPプロジェクトID"
  type        = string
}

variable "gcp_region" {
  description = "GCPリージョン"
  type        = string
  default     = "asia-northeast1"
}

# ===========================
# Cloud Run設定
# ===========================

variable "cloud_run_image" {
  description = "Cloud Run用のコンテナイメージ (形式: region-docker.pkg.dev/project/repo/image:tag)"
  type        = string
  # デフォルト値: Google公式のHelloイメージ（初回作成時のみ使用）
  #
  # 背景: Cloud Runサービス作成にはイメージが必須ですが、初回セットアップ時には
  # アプリケーションイメージがまだ存在しないため、ダミーイメージを使用します。
  #
  # 実際の運用:
  # - 初回: このダミーイメージでCloud Runサービスを作成
  # - 以降: deploy-frontend.ymlで実際のイメージをデプロイ
  # - Terraformはイメージを管理しない（lifecycle ignore_changesで変更を無視）
  default = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "cloud_run_service_account_email" {
  description = "Cloud Run用のサービスアカウントメールアドレス (オプション、指定がない場合はデフォルトのCompute Engine SAを使用)"
  type        = string
  default     = null
}

# ===========================
# Cloudflare設定
# ===========================

variable "cloudflare_api_token" {
  description = "Cloudflare APIトークン"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID"
  type        = string
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_subdomain" {
  description = "アプリケーションのサブドメイン (空文字でapex domain: subsq-app.com)"
  type        = string
  default     = ""
}

variable "cloudflare_domain" {
  description = "Cloudflareで管理するドメイン名 (例: example.com)"
  type        = string
  default     = "subsq-app.com"
}

# ===========================
# アプリケーション環境変数
# ===========================
# これらはGitHub SecretsからCloud Runに渡されます

variable "database_url" {
  description = "PostgreSQLデータベース接続URL (アプリケーション用のプール接続)"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "next_public_app_url" {
  description = "Next.jsパブリックアプリケーションURL (例: https://subsq-app.com)"
  type        = string
}

variable "next_public_contact_form_url" {
  description = "お問い合わせフォームURL (Google Forms等)"
  type        = string
}

variable "jwt_secret" {
  description = "JWT署名シークレット"
  type        = string
  sensitive   = true
}

variable "next_public_api_base_url" {
  description = "GoバックエンドAPIのベースURL (例: https://api.subsq-app.com)"
  type        = string
}

# ===========================
# バックエンド設定
# ===========================

variable "backend_cloud_run_image" {
  description = "Goバックエンド用コンテナイメージ（形式: region-docker.pkg.dev/project/repo/image:tag）"
  type        = string
  # フロントエンドと同様に初回のみダミーイメージを使用。
  # 以降のイメージ管理はdeploy-backend.ymlが担当し、Terraformは変更を無視する（lifecycle ignore_changes）
  default = "us-docker.pkg.dev/cloudrun/container/hello"
}

# ===========================
# 予算アラート設定
# ===========================

variable "billing_account_id" {
  description = "GCP請求先アカウントID"
  type        = string
  sensitive   = true
}
