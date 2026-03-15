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
    NODE_ENV                     = "production"
    NEXT_TELEMETRY_DISABLED      = "1"
    NEXT_PUBLIC_APP_ENV          = "dev"
    DATABASE_URL                 = var.database_url
    GOOGLE_CLIENT_ID             = var.google_client_id
    GOOGLE_CLIENT_SECRET         = var.google_client_secret
    BETTER_AUTH_SECRET           = var.better_auth_secret
    BETTER_AUTH_URL              = var.better_auth_url
    NEXT_PUBLIC_APP_URL          = var.next_public_app_url
    NEXT_PUBLIC_CONTACT_FORM_URL = var.next_public_contact_form_url
  }
}

# Goバックエンド用Artifact Registry
module "artifact_registry_backend" {
  source = "../../modules/artifact-registry"

  region          = var.gcp_region
  repository_name = "subsq-backend-dev"
  environment     = "dev"

  cleanup_keep_count = 10
}

# Goバックエンド用Cloud Run（api-dev.subsq-app.com）
module "cloud_run_backend" {
  source = "../../modules/cloud-run"

  service_name = "subsq-backend-dev"
  region       = var.gcp_region
  image        = var.backend_cloud_run_image
  environment  = "dev"

  # サブドメイン: api-dev.subsq-app.com
  project_id    = var.gcp_project_id
  custom_domain = "api-dev.${var.cloudflare_domain}"

  service_account_email = var.cloud_run_service_account_email

  cpu    = "1"
  memory = "512Mi"

  min_instances = 0 # コスト削減
  max_instances = 10

  cpu_always_allocated = false
  request_timeout      = 300
  # ブラウザからの直接アクセスを許可（Cloud Runレベルの認証は無効）
  # 認証はGoアプリの認証ミドルウェアで担保する
  allow_unauthenticated = true

  # Goバックエンド固有設定
  health_check_path = "/health"
  health_check_port = 8080

  # 環境変数（フロントエンドと同一DBを使用）
  env_vars = {
    DATABASE_URL = var.database_url
  }
}

# Goバックエンド用のCloudflare DNSレコード（api-dev.subsq-app.com）
resource "cloudflare_dns_record" "backend" {
  zone_id = var.cloudflare_zone_id
  name    = "api-dev"
  type    = "CNAME"
  content = "ghs.googlehosted.com"
  proxied = true
  ttl     = 1
  comment = "Terraformで管理 - devバックエンド"
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
