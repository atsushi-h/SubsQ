/**
 * Artifact Registry モジュール
 *
 * コンテナイメージを保存するためのDocker RepositoryをGoogle Artifact Registryに作成します。
 * 古いイメージを自動的に削除するクリーンアップポリシーを含みます。
 */

resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = var.repository_name
  description   = "${var.environment}環境用のDockerリポジトリ"
  format        = "DOCKER"

  cleanup_policies {
    id     = "keep-recent-images"
    action = "DELETE"

    most_recent_versions {
      keep_count = var.cleanup_keep_count
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}
