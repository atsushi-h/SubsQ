/**
 * prd環境用のメインTerraform設定
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
  repository_name = "subsq-frontend-prd"
  environment     = "prd"

  cleanup_keep_count = 10 # dev環境と同じ（必要に応じて後で増やす）
}

# Cloud Runサービス
module "cloud_run" {
  source = "../../modules/cloud-run"

  service_name = "subsq-frontend-prd"
  region       = var.gcp_region
  image        = var.cloud_run_image
  environment  = "prd"

  # カスタムドメインマッピング
  project_id    = var.gcp_project_id
  custom_domain = var.cloudflare_subdomain == "" ? var.cloudflare_domain : "${var.cloudflare_subdomain}.${var.cloudflare_domain}"

  # サービスアカウント (指定がない場合はデフォルトのCompute Engine SAを使用)
  service_account_email = var.cloud_run_service_account_email

  # prd環境用のリソース設定（開発初期はdevと同じ設定でコスト削減）
  cpu    = "1"
  memory = "512Mi"

  # スケーリング設定
  min_instances = 0  # コスト削減のためゼロにスケール（必要に応じて後で1に変更）
  max_instances = 10 # 開発初期は控えめに設定（必要に応じて後で増やす）

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
  environment   = "prd"
}
