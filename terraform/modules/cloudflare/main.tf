/**
 * Cloudflare モジュール
 *
 * Cloudflare設定を管理します。以下を含みます:
 * - Cloud Runを指すDNSレコード
 * - 静的アセットのキャッシュルール
 * - セキュリティルール (WAF)
 * - SSL/TLS設定
 */

# Cloud Runを指すDNSレコード
resource "cloudflare_record" "app" {
  zone_id = var.zone_id
  name    = var.subdomain
  type    = "CNAME"
  content = var.cloud_run_url
  proxied = true
  ttl     = 1 # Auto (プロキシ有効時)
  comment = "Terraformで管理 - ${var.environment}環境"

  # Cloud RunのURLはGitHub Actions (frontend-deploy.yml) で管理されるため、
  # Terraformではcontentの変更を無視します。
  # これにより、Cloud RunのデプロイとTerraformのインフラ管理が独立して動作します。
  lifecycle {
    ignore_changes = [
      content
    ]
  }
}

# SSL/TLS設定
resource "cloudflare_zone_settings_override" "app" {
  zone_id = var.zone_id

  settings {
    # SSL/TLSモード: Full (strict) - エンドツーエンド暗号化
    ssl = "strict"

    # 常にHTTPSを使用
    always_use_https = "on"

    # 最小TLSバージョン
    min_tls_version = "1.2"

    # セキュリティヘッダー
    security_header {
      enabled            = true
      max_age            = 31536000
      include_subdomains = true
      preload            = true
      nosniff            = true
    }

    # Brotli圧縮
    brotli = "on"
  }
}

# 静的アセット用のキャッシュルール
resource "cloudflare_ruleset" "cache_rules" {
  zone_id     = var.zone_id
  name        = "${var.environment}-cache-rules"
  description = "${var.environment}環境用のキャッシュルール"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  # ルール1: Next.js静的アセットを1年間キャッシュ
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 31536000 # 1年
      }
      browser_ttl {
        mode    = "override_origin"
        default = 31536000 # 1年
      }
    }
    # 無料プランでは'matches'オペレーター使用不可のため'starts_with'を使用
    expression  = "(starts_with(http.request.uri.path, \"/_next/static/\"))"
    description = "Next.js静的アセットをキャッシュ"
    enabled     = true
  }

  # ルール2: APIルートはキャッシュなし
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = false
    }
    # 無料プランでは'matches'オペレーター使用不可のため'starts_with'を使用
    expression  = "(starts_with(http.request.uri.path, \"/api/\"))"
    description = "APIルートのキャッシュをバイパス"
    enabled     = true
  }

  # ルール3: 公開画像をキャッシュ
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 86400 # 1日
      }
      browser_ttl {
        mode    = "override_origin"
        default = 86400 # 1日
      }
    }
    # 無料プランでは'matches'オペレーター使用不可のため'starts_with'と'eq'を使用
    expression  = "(starts_with(http.request.uri.path, \"/images/\") or http.request.uri.path eq \"/favicon.ico\")"
    description = "公開画像をキャッシュ"
    enabled     = true
  }
}

# Cloud Run向けのHost Header Override（Origin Rules使用）
# Transform RulesではHostヘッダーを変更できないため、Origin Rulesを使用
resource "cloudflare_ruleset" "origin_rules" {
  zone_id     = var.zone_id
  name        = "${var.environment}-origin-rules"
  description = "${var.environment}環境用のOriginルール"
  kind        = "zone"
  phase       = "http_request_origin"

  rules {
    action = "route"
    action_parameters {
      host_header = var.cloud_run_url
    }
    # サブドメインが空（apex domain）の場合とサブドメインありの場合で条件を分岐
    expression  = var.subdomain == "" ? "(http.host eq \"${var.domain_name}\")" : "(http.host eq \"${var.subdomain}.${var.domain_name}\")"
    description = "Cloud Run向けのHostヘッダー書き換え"
    enabled     = true
  }

  # Cloud RunのURLはGitHub Actions (frontend-deploy.yml) で管理されるため、
  # Terraformではrulesの変更を無視します。
  # これにより、Cloud RunのデプロイとTerraformのインフラ管理が独立して動作します。
  lifecycle {
    ignore_changes = [
      rules
    ]
  }
}

# Cloudflare Zero Trust Accessアプリケーション (dev環境など、認証が必要な環境用)
resource "cloudflare_zero_trust_access_application" "app" {
  count = var.enable_access ? 1 : 0

  # 無料プランでも使用可能だが、account_idが必要（zone_idは使用不可）
  account_id       = var.account_id
  name             = "${var.environment}-${var.subdomain}"
  domain           = "${var.subdomain}.${data.cloudflare_zone.main[0].name}"
  session_duration = "24h"
  type             = "self_hosted"

  # すべてのパスを保護
  # 必要に応じて特定のパスのみを保護することも可能
}

# Cloudflare Zero Trust Accessポリシー - メールベース認証
resource "cloudflare_zero_trust_access_policy" "email_policy" {
  count = var.enable_access && length(var.access_allowed_emails) > 0 ? 1 : 0

  application_id = cloudflare_zero_trust_access_application.app[0].id
  # 無料プランでも使用可能だが、account_idが必要（zone_idは使用不可）
  account_id = var.account_id
  name       = "${var.environment}-email-policy"
  precedence = 1
  decision   = "allow"

  include {
    email = var.access_allowed_emails
  }
}

# Zone情報を取得 (Access設定で使用)
data "cloudflare_zone" "main" {
  count   = var.enable_access ? 1 : 0
  zone_id = var.zone_id
}
