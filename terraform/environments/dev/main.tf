/**
 * dev環境用のメインTerraform設定
 *
 * このファイルはすべてのインフラコンポーネントを統合します:
 * - Dockerイメージ用のArtifact Registry
 * - アプリケーションホスティング用のCloud Run
 * - CDNとセキュリティ用のCloudflare
 */

# Dockerイメージ用のArtifact Registry
module "artifact_registry" {
  source = "../../modules/artifact-registry"

  region          = var.gcp_region
  repository_name = "subsq-frontend-dev"
  environment     = "dev"

  cleanup_keep_count = 10
}

# Cloud Runサービス
module "cloud_run" {
  source = "../../modules/cloud-run"

  service_name = "subsq-frontend-dev"
  region       = var.gcp_region
  image        = var.cloud_run_image
  environment  = "dev"

  # カスタムドメインマッピング
  project_id    = var.gcp_project_id
  custom_domain = "dev.${var.cloudflare_domain}"

  # サービスアカウント (指定がない場合はデフォルトのCompute Engine SAを使用)
  service_account_email = var.cloud_run_service_account_email

  # dev環境用のリソース設定
  cpu    = "1"
  memory = "512Mi"

  # スケーリング設定
  min_instances = 0 # コスト削減のためゼロにスケール
  max_instances = 10

  # CPU割り当て
  cpu_always_allocated = false # リクエスト処理中のみCPUを割り当て

  # リクエストタイムアウト
  request_timeout = 300 # 5分

  # パブリックアクセス
  allow_unauthenticated = true

  # 環境変数
  env_vars = {
    NODE_ENV                = "production"
    NEXT_TELEMETRY_DISABLED = "1"
    DATABASE_URL            = var.database_url
    GOOGLE_CLIENT_ID        = var.google_client_id
    GOOGLE_CLIENT_SECRET    = var.google_client_secret
    BETTER_AUTH_SECRET      = var.better_auth_secret
    BETTER_AUTH_URL         = var.better_auth_url
    NEXT_PUBLIC_APP_URL     = var.next_public_app_url
  }
}

# Cloudflare CDNとセキュリティ
module "cloudflare" {
  source = "../../modules/cloudflare"

  zone_id       = var.cloudflare_zone_id
  account_id    = var.cloudflare_account_id
  subdomain     = var.cloudflare_subdomain
  domain_name   = var.cloudflare_domain
  cloud_run_url = replace(module.cloud_run.service_url, "https://", "")
  environment   = "dev"

  # Cloudflare Access設定 (dev環境のみ有効化)
  # 注意: Cloudflare Accessは無料プランでも使用可能（最大50ユーザーまで）
  enable_access         = true
  access_allowed_emails = var.cloudflare_access_allowed_emails
}
