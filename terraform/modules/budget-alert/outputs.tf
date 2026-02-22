output "budget_id" {
  description = "予算アラートのID"
  value       = google_billing_budget.monthly.id
}

output "budget_name" {
  description = "予算アラートの表示名"
  value       = google_billing_budget.monthly.display_name
}
