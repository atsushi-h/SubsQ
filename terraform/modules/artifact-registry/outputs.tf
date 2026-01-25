output "repository_id" {
  description = "Artifact RegistryリポジトリのID"
  value       = google_artifact_registry_repository.docker_repo.id
}

output "repository_name" {
  description = "Artifact Registryリポジトリの名前"
  value       = google_artifact_registry_repository.docker_repo.repository_id
}

output "repository_url" {
  description = "Artifact RegistryリポジトリのURL"
  value       = "${var.region}-docker.pkg.dev/${google_artifact_registry_repository.docker_repo.project}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

output "location" {
  description = "Artifact Registryリポジトリのロケーション"
  value       = google_artifact_registry_repository.docker_repo.location
}
