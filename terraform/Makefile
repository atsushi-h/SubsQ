.PHONY: help fmt fmt-check validate lint

# デフォルトターゲット: ヘルプを表示
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Terraform Makefile - ローカル開発用コマンド"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "利用可能なコマンド:"
	@echo ""
	@echo "  make fmt           Terraformファイルをフォーマット"
	@echo "  make fmt-check     フォーマットチェック（CI用・変更なし）"
	@echo "  make validate      Terraform設定を検証（構文チェック）"
	@echo "  make lint          TFLintによる静的解析"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "推奨ワークフロー:"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "1. コード変更後"
	@echo "   → make fmt        (フォーマット)"
	@echo "   → make validate   (構文チェック)"
	@echo "   → make lint       (静的解析)"
	@echo ""
	@echo "2. コミット"
	@echo "   → git add . && git commit -m \"feat: update terraform\""
	@echo ""
	@echo "3. terraform plan/apply"
	@echo "   → GitHub Actions経由で実行"
	@echo "   → Actions > Terraform > Run workflow"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""

# フォーマット
fmt:
	@echo "Formatting Terraform files..."
	@terraform fmt -recursive
	@echo "✓ Formatting complete"

# フォーマットチェック（CI用）
fmt-check:
	@echo "Checking Terraform file formatting..."
	@terraform fmt -check -recursive
	@echo "✓ All files are properly formatted"

# バリデーション（backendなしで構文チェックのみ）
validate:
	@echo "Validating dev environment..."
	@cd environments/dev && terraform init -backend=false && terraform validate
	@echo "Validating prd environment..."
	@cd environments/prd && terraform init -backend=false && terraform validate
	@echo "✓ Validation complete"

# TFLintによる静的解析
lint:
	@echo "Running TFLint dev environment..."
	@cd environments/dev && tflint --init && tflint
	@echo "Running TFLint prd environment..."
	@cd environments/prd && tflint --init && tflint
	@echo "✓ Lint complete"
