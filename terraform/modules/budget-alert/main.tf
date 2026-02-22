/**
 * Budget Alert モジュール
 *
 * GCPの月額料金が閾値を超えた際に請求先アカウントの管理者へメール通知する予算アラートを作成します。
 */

resource "google_billing_budget" "monthly" {
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
