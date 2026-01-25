/**
 * dev環境用のOutput
 */

# ===========================
# Artifact Registry Outputs
# ===========================

output "artifact_registry_repository_url" {
  description = "Artifact RegistryリポジトリのURL"
  value       = module.artifact_registry.repository_url
}

output "artifact_registry_repository_name" {
  description = "Artifact Registryリポジトリの名前"
  value       = module.artifact_registry.repository_name
}

# ===========================
# Cloud Run Outputs
# ===========================

output "cloud_run_service_url" {
  description = "Cloud RunサービスのURL"
  value       = module.cloud_run.service_url
}

output "cloud_run_service_name" {
  description = "Cloud Runサービスの名前"
  value       = module.cloud_run.service_name
}

# ===========================
# Cloudflare Outputs
# ===========================

output "cloudflare_url" {
  description = "Cloudflare経由のパブリックURL"
  value       = module.cloudflare.cloudflare_url
}

output "cloudflare_dns_name" {
  description = "Cloudflareで設定されたDNS名"
  value       = module.cloudflare.dns_record_name
}

# ===========================
# サマリー
# ===========================

output "deployment_summary" {
  description = "デプロイメントサマリー"
  value = {
    environment       = "dev"
    cloud_run_url     = module.cloud_run.service_url
    public_url        = module.cloudflare.cloudflare_url
    artifact_registry = module.artifact_registry.repository_url
    region            = var.gcp_region
  }
}
