output "dns_record_id" {
  description = "DNSレコードのID"
  value       = cloudflare_record.app.id
}

output "dns_record_name" {
  description = "完全なDNS名"
  value       = cloudflare_record.app.hostname
}

output "cloudflare_url" {
  description = "完全なCloudflare URL"
  value       = "https://${cloudflare_record.app.hostname}"
}

output "cache_ruleset_id" {
  description = "キャッシュルールセットのID"
  value       = cloudflare_ruleset.cache_rules.id
}

output "waf_ruleset_id" {
  description = "WAFルールセットのID"
  value       = cloudflare_ruleset.waf_custom_rules.id
}
