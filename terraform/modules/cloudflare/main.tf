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
    expression  = "(http.request.uri.path matches \"^/_next/static/.*\")"
    description = "Next.js静的アセットをキャッシュ"
    enabled     = true
  }

  # ルール2: APIルートはキャッシュなし
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = false
    }
    expression  = "(http.request.uri.path matches \"^/api/.*\")"
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
    expression  = "(http.request.uri.path matches \"^/images/.*\" or http.request.uri.path matches \"^/favicon.ico\")"
    description = "公開画像をキャッシュ"
    enabled     = true
  }
}

# WAF (Web Application Firewall) ルール
resource "cloudflare_ruleset" "waf_custom_rules" {
  zone_id     = var.zone_id
  name        = "${var.environment}-waf-custom"
  description = "${var.environment}環境用のカスタムWAFルール"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  # 既知の悪質なボットをブロック
  rules {
    action      = "block"
    expression  = "(cf.client.bot) and not (cf.verified_bot_category in {\"Search Engine Crawler\" \"Page Preview Service\"})"
    description = "悪質なボットをブロック"
    enabled     = var.enable_waf
  }

  # 高い脅威スコアにチャレンジ
  rules {
    action      = "challenge"
    expression  = "(cf.threat_score gt 14)"
    description = "高脅威スコアのリクエストにチャレンジ"
    enabled     = var.enable_waf
  }
}

# レート制限
resource "cloudflare_ruleset" "rate_limiting" {
  count = var.enable_rate_limiting ? 1 : 0

  zone_id     = var.zone_id
  name        = "${var.environment}-rate-limiting"
  description = "${var.environment}環境用のレート制限ルール"
  kind        = "zone"
  phase       = "http_ratelimit"

  # APIレート制限
  rules {
    action = "block"
    action_parameters {
      response {
        status_code  = 429
        content      = "Too many requests"
        content_type = "text/plain"
      }
    }
    ratelimit {
      characteristics     = ["ip.src"]
      period              = 60
      requests_per_period = var.api_rate_limit_requests_per_minute
      mitigation_timeout  = 600 # 10分
    }
    expression  = "(http.request.uri.path matches \"^/api/.*\")"
    description = "APIレート制限"
    enabled     = true
  }
}

# Cloudflare Zero Trust Accessアプリケーション (dev環境など、認証が必要な環境用)
resource "cloudflare_zero_trust_access_application" "app" {
  count = var.enable_access ? 1 : 0

  zone_id          = var.zone_id
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
  zone_id        = var.zone_id
  name           = "${var.environment}-email-policy"
  precedence     = 1
  decision       = "allow"

  include {
    email = var.access_allowed_emails
  }
}

# Zone情報を取得 (Access設定で使用)
data "cloudflare_zone" "main" {
  count   = var.enable_access ? 1 : 0
  zone_id = var.zone_id
}
