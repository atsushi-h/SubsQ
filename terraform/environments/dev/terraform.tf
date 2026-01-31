terraform {
  required_version = ">= 1.14.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  backend "gcs" {
    # 注意: backend ブロックでは変数（var.xxx）を使用できません
    # GitHub Actionsで terraform init 実行時に -backend-config で自動設定されます
    # 例: terraform init -backend-config="bucket=${{ secrets.TFSTATE_BUCKET_NAME }}"
    # 基盤リポジトリで作成したGCSバケット名が使用されます
    prefix = "subsq/frontend/dev"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
