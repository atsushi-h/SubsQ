/**
 * Cloud Run モジュール
 *
 * Next.jsアプリケーション用のCloud Runサービスを管理します。
 * 環境変数、リソース制限、IAM設定を含みます。
 */

resource "google_cloud_run_v2_service" "app" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  # コンテナイメージの管理方針:
  #
  # - 初回作成時: 変数で指定されたイメージを使用（通常はダミーイメージ）
  # - 以降の運用: deploy-frontend.ymlがイメージを管理
  # - terraform apply: イメージの変更を無視（インフラ設定のみ変更）
  #
  # これにより、インフラ設定（CPU、メモリ等）とアプリケーションデプロイを
  # 完全に分離し、それぞれ独立して管理できます。
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image
    ]
  }

  template {
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"

    # スケーリング設定
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    # サービスアカウント
    service_account = var.service_account_email

    containers {
      image = var.image

      # リソース制限
      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
        cpu_idle          = !var.cpu_always_allocated
        startup_cpu_boost = true
      }

      # 環境変数
      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      # ヘルスチェックエンドポイント
      startup_probe {
        initial_delay_seconds = 10
        timeout_seconds       = 3
        period_seconds        = 10
        failure_threshold     = 3

        http_get {
          path = "/api/health"
          port = 3000
        }
      }

      liveness_probe {
        initial_delay_seconds = 30
        timeout_seconds       = 3
        period_seconds        = 30
        failure_threshold     = 3

        http_get {
          path = "/api/health"
          port = 3000
        }
      }

      ports {
        container_port = 3000
      }
    }

    # タイムアウト
    timeout = "${var.request_timeout}s"
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# パブリックアクセスを許可するIAMポリシー
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  count = var.allow_unauthenticated ? 1 : 0

  location = google_cloud_run_v2_service.app.location
  name     = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# カスタムドメインマッピング
# Cloud Runにカスタムドメインを認識させることで、Hostヘッダーの問題を解消
resource "google_cloud_run_domain_mapping" "app" {
  count    = var.custom_domain != null ? 1 : 0
  location = var.region
  name     = var.custom_domain

  metadata {
    namespace = var.project_id
    labels = {
      environment = var.environment
      managed_by  = "terraform"
    }
  }

  spec {
    route_name = google_cloud_run_v2_service.app.name
  }

  depends_on = [google_cloud_run_v2_service.app]
}
