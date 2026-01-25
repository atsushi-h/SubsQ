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

  # 古いイメージを削除（30日以上経過したもの）
  cleanup_policies {
    id     = "delete-old-images"
    action = "DELETE"

    condition {
      older_than = "2592000s" # 30日 (秒単位)
    }
  }

  # 最新N個は保持（削除対象から除外）
  cleanup_policies {
    id     = "keep-recent-images"
    action = "KEEP"

    most_recent_versions {
      keep_count = var.cleanup_keep_count
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}