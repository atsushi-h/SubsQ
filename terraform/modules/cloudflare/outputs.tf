output "dns_record_id" {
  description = "DNSレコードのID"
  value       = cloudflare_dns_record.app.id
}

output "dns_record_name" {
  description = "完全なDNS名"
  value       = var.subdomain != "" ? "${cloudflare_dns_record.app.name}.${var.domain_name}" : var.domain_name
}

output "cloudflare_url" {
  description = "完全なCloudflare URL"
  value       = var.subdomain != "" ? "https://${cloudflare_dns_record.app.name}.${var.domain_name}" : "https://${var.domain_name}"
}

output "cache_ruleset_id" {
  description = "キャッシュルールセットのID"
  value       = var.enable_cache_rules ? cloudflare_ruleset.cache_rules[0].id : null
}
