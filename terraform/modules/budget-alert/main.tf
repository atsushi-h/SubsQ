/**
 * Budget Alert モジュール
 *
 * GCPの月額料金が閾値を超えた際に請求先アカウントの管理者へメール通知する予算アラートを作成します。
 */

resource "google_project_service" "billingbudgets" {
  project = var.gcp_project_id
  service = "billingbudgets.googleapis.com"

  # APIを無効化する際に依存リソースも一緒に削除しない
  disable_dependent_services = false
  # terraform destroy時にAPIを無効化しない（他サービスへの影響を防ぐ）
  disable_on_destroy = false
}

resource "google_billing_budget" "monthly" {
  depends_on = [google_project_service.billingbudgets]

  billing_account = var.billing_account_id
  display_name    = "SubsQ Monthly Budget"

  budget_filter {
    projects = ["projects/${var.gcp_project_id}"]
  }

  amount {
    specified_amount {
      currency_code = "JPY"
      units         = tostring(var.budget_amount)
    }
  }

  threshold_rules {
    threshold_percent = 0.5
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }
}
