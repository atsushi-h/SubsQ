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
resource "cloudflare_dns_record" "app" {
  zone_id = var.zone_id
  name    = var.subdomain
  type    = "CNAME"
  content = "ghs.googlehosted.com"
  proxied = true
  ttl     = 1 # Auto (プロキシ有効時)
  comment = "Terraformで管理 - ${var.environment}環境"

  lifecycle {
    ignore_changes = [proxied]
  }
}

# SSL/TLS設定
resource "cloudflare_zone_setting" "ssl" {
  zone_id    = var.zone_id
  setting_id = "ssl"
  value      = "strict"
}

resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = var.zone_id
  setting_id = "always_use_https"
  value      = "on"
}

resource "cloudflare_zone_setting" "min_tls_version" {
  zone_id    = var.zone_id
  setting_id = "min_tls_version"
  value      = "1.2"
}

resource "cloudflare_zone_setting" "security_header" {
  zone_id    = var.zone_id
  setting_id = "security_header"
  value = jsonencode({
    strict_transport_security = {
      enabled            = true
      max_age            = 31536000
      include_subdomains = true
      preload            = true
      nosniff            = true
    }
  })
}

resource "cloudflare_zone_setting" "brotli" {
  zone_id    = var.zone_id
  setting_id = "brotli"
  value      = "on"
}

# 静的アセット用のキャッシュルール
resource "cloudflare_ruleset" "cache_rules" {
  zone_id     = var.zone_id
  name        = "${var.environment}-cache-rules"
  description = "${var.environment}環境用のキャッシュルール"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules = [
    # ルール1: Next.js静的アセットを1年間キャッシュ
    {
      action = "set_cache_settings"
      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = 31536000 # 1年
        }
        browser_ttl = {
          mode    = "override_origin"
          default = 31536000 # 1年
        }
      }
      # 無料プランでは'matches'オペレーター使用不可のため'starts_with'を使用
      expression  = "(starts_with(http.request.uri.path, \"/_next/static/\"))"
      description = "Next.js静的アセットをキャッシュ"
      enabled     = true
    },
    # ルール2: APIルートはキャッシュなし
    {
      action = "set_cache_settings"
      action_parameters = {
        cache = false
      }
      # 無料プランでは'matches'オペレーター使用不可のため'starts_with'を使用
      expression  = "(starts_with(http.request.uri.path, \"/api/\"))"
      description = "APIルートのキャッシュをバイパス"
      enabled     = true
    },
    # ルール3: 公開画像をキャッシュ
    {
      action = "set_cache_settings"
      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = 86400 # 1日
        }
        browser_ttl = {
          mode    = "override_origin"
          default = 86400 # 1日
        }
      }
      # 無料プランでは'matches'オペレーター使用不可のため'starts_with'と'eq'を使用
      expression  = "(starts_with(http.request.uri.path, \"/images/\") or http.request.uri.path eq \"/favicon.ico\")"
      description = "公開画像をキャッシュ"
      enabled     = true
    }
  ]
}

# NOTE: Cloudflare無料プランではHost Header Override機能が使えないため、
# Cloud Run側でDomain Mappingを設定してカスタムドメインを認識させます。
# 設定は terraform/modules/cloud-run/main.tf を参照してください。

# Cloudflare Zero Trust Accessポリシー - メールベース認証
resource "cloudflare_zero_trust_access_policy" "email_policy" {
  count = var.enable_access && length(var.access_allowed_emails) > 0 ? 1 : 0

  # 無料プランでも使用可能だが、account_idが必要（zone_idは使用不可）
  account_id = var.account_id
  name       = "${var.environment}-email-policy"
  decision   = "allow"

  include = [
    for email_address in var.access_allowed_emails : {
      email = {
        email = email_address
      }
    }
  ]
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

  # ポリシーをアプリケーションに紐付け
  policies = length(var.access_allowed_emails) > 0 ? [{
    id         = cloudflare_zero_trust_access_policy.email_policy[0].id
    precedence = 1
  }] : []
}

# Zone情報を取得 (Access設定で使用)
data "cloudflare_zone" "main" {
  count   = var.enable_access ? 1 : 0
  zone_id = var.zone_id
}
