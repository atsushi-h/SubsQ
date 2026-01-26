output "service_id" {
  description = "Cloud RunサービスのID"
  value       = google_cloud_run_v2_service.app.id
}

output "service_name" {
  description = "Cloud Runサービスの名前"
  value       = google_cloud_run_v2_service.app.name
}

output "service_url" {
  description = "Cloud RunサービスのURL"
  value       = google_cloud_run_v2_service.app.uri
}

output "service_location" {
  description = "Cloud Runサービスのロケーション"
  value       = google_cloud_run_v2_service.app.location
}

output "domain_mapping_status" {
  description = "Domain Mappingのステータス"
  value       = var.custom_domain != null ? google_cloud_run_domain_mapping.app[0].status : null
}
