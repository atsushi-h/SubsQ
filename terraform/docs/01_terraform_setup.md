# Terraform セットアップガイド

このドキュメントでは、フロントエンドインフラのTerraformセットアップ方法を説明します。

**重要**: すべてのTerraform操作はGitHub Actions経由で実行します。ローカルでTerraformコマンドを実行する必要はありません。

## 前提条件

### 1. 別リポジトリで作成済みのリソース

このプロジェクトは、別リポジトリ（基盤リポジトリ）で構築された以下のリソースを利用します：

- **GCS Bucket for Terraform State**: `tfstate-{project_id}`
- **Service Account**: Terraform実行用のサービスアカウント
- **Workload Identity Provider**: GitHub ActionsからGCPへの認証

### 2. 必要な権限

Terraform実行用のサービスアカウントには以下の権限が必要です：

- `roles/artifactregistry.admin` - Artifact Registryの管理
- `roles/run.admin` - Cloud Runの管理
- `roles/iam.serviceAccountUser` - サービスアカウントの使用
- `roles/storage.objectAdmin` - GCS（tfstate）の管理

## ディレクトリ構造

```
terraform/
├── modules/                    # 再利用可能なモジュール
│   ├── artifact-registry/      # Docker Registry
│   ├── cloud-run/              # Cloud Run + IAM
│   └── cloudflare/             # CDN + DNS + Security
│
├── environments/               # 環境別設定
│   ├── dev/
│   │   ├── terraform.tf        # Backend + Provider設定
│   │   ├── main.tf             # モジュール呼び出し
│   │   ├── variables.tf        # 変数定義
│   │   └── outputs.tf          # 出力定義
│   └── prd/
│       └── (同様の構成)
│
└── docs/                       # ドキュメント
    ├── 01_terraform_setup.md
    └── 02_deployment_guide.md
```

## 初期セットアップ

### 重要: 初回デプロイの順序

#### 背景: なぜダミーイメージを使用するのか

Cloud Runサービスを作成する際、**必ずコンテナイメージを指定する必要があります**。しかし、初回セットアップ時には以下の「鶏と卵」問題が発生します：

1. **Terraformでインフラを作成したい**
   - しかし、Cloud Run作成にはイメージが必要
   - この時点ではまだアプリケーションイメージがビルドされていない

2. **アプリケーションイメージをビルドしたい**
   - しかし、Artifact Registryリポジトリにpushする必要がある
   - この時点ではまだArtifact Registryが作成されていない（Terraformで作成される）

この問題を解決するため、**初回のみGoogleの公式Helloイメージ（ダミーイメージ）を使用**します。このイメージは：
- ✅ Google Cloud公式で常に利用可能
- ✅ 認証不要で誰でもアクセス可能
- ✅ Cloud Runの動作確認用として提供されている

**重要**: ダミーイメージは初回作成時のみ使用され、すぐに実際のアプリケーションイメージに置き換わります。また、Terraformの設定により、以降のterraform applyではイメージは変更されません（`lifecycle { ignore_changes }`）。

---

初めてインフラをセットアップする場合、以下の順序で実行してください：

#### 1. Terraform Applyでインフラ作成

GitHub Actionsの「Terraform」ワークフロー（`.github/workflows/terraform-deploy.yml`）を実行します：

1. GitHubリポジトリの **Actions** タブを開く
2. **Terraform** ワークフローを選択
3. **Run workflow** をクリック
4. 以下を選択：
   - **Environment**: `dev` または `prd`
   - **Action**: `apply`
5. **Run workflow** を実行

この時点では、Cloud RunサービスはGoogleの公式Helloイメージ（`us-docker.pkg.dev/cloudrun/container/hello`）で作成されます。

#### 2. アプリケーションのビルドとデプロイ

GitHub Actionsの「Deploy Frontend」ワークフロー（`.github/workflows/deploy-frontend.yml`）を実行します：

1. GitHubリポジトリの **Actions** タブを開く
2. **Deploy Frontend** ワークフローを選択
3. **Run workflow** をクリック
4. 以下を選択：
   - **Environment**: `dev` または `prd`
5. **Run workflow** を実行

これにより、実際のアプリケーションイメージがビルドされ、Cloud Runサービスにデプロイされます。イメージタグは自動生成されます（形式: `v{バージョン}-{コミットハッシュ}`、例: `v1.2.3-abc1234`）。

#### 3. 以降の運用

初回セットアップ完了後、以下のように運用します：

##### アプリケーションのデプロイ（頻繁）
**使用するワークフロー**: `deploy-frontend.yml`

- コードの変更をデプロイする際に使用
- イメージタグは自動生成（`v{バージョン}-{コミットハッシュ}`形式）
- 例: `v1.2.3-abc1234`

##### インフラ設定の変更（稀）
**使用するワークフロー**: `terraform-deploy.yml`（Action: `apply`）

- CPU、メモリ、スケーリング設定などを変更する際に使用
- 環境変数の追加・変更（ただし値はGitHub Secretsで管理）
- IAM設定の変更

**重要な注意点**:
- ✅ `terraform-deploy.yml` は**イメージを管理しません**
- ✅ Terraformは `lifecycle { ignore_changes }` によりイメージの変更を無視します
- ✅ イメージは常に `deploy-frontend.yml` で管理されます
- ✅ terraform apply を実行しても、現在動いているアプリケーションイメージは変わりません

---

### Step 1: GitHub Secretsの設定

すべての機密情報と環境固有の設定はGitHub Secretsで管理します。

#### Repository Secrets

以下のシークレットをGitHubリポジトリに追加します：

```
Settings > Secrets and variables > Actions > Repository secrets
```

| Secret名 | 説明 | 取得方法 |
|----------|------|---------|
| `WORKLOAD_IDENTITY_PROVIDER` | GitHub Actions認証プロバイダー | 基盤リポジトリのoutput |
| `TERRAFORM_SERVICE_ACCOUNT_EMAIL` | Terraform実行用サービスアカウント | 基盤リポジトリのoutput |
| `GCP_PROJECT_ID` | GCPプロジェクトID | GCPコンソールから確認 |
| `TFSTATE_BUCKET_NAME` | Terraform State用GCSバケット名 | 基盤リポジトリで作成（`tfstate-{project_id}`） |
| `CLOUDFLARE_API_TOKEN` | CloudflareのAPI Token | Cloudflareダッシュボード > My Profile > API Tokens |
| `CLOUDFLARE_ZONE_ID` | CloudflareのZone ID | Cloudflareダッシュボード > ドメイン選択 > 右サイドバー |

#### Environment Secrets (dev/prd)

各環境（dev, prd）のGitHub Environmentに以下のシークレットを追加します：

```
Settings > Environments > dev（または prd）> Environment secrets
```

| Secret名 | 説明 |
|----------|------|
| `DATABASE_URL_DIRECT` | Neon直接接続URL（マイグレーション用） |
| `DATABASE_URL` | Neon Pooled接続URL（アプリケーション用） |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `BETTER_AUTH_SECRET` | Better Auth署名キー |
| `BETTER_AUTH_URL` | Better Auth URL（例: `https://dev.subsq.example.com`） |
| `NEXT_PUBLIC_APP_URL` | アプリケーション公開URL（例: `https://dev.subsq.example.com`） |

**注意**: GitHub Environmentsを使用することで、環境ごとに異なる値を自動的に使い分けることができます。

#### Environment Variables (dev環境のみ)

dev環境でCloudflare Accessによる認証を有効にする場合、以下の変数を設定します：

**設定場所**:
```
Settings > Environments > dev > Environment variables
```

| Variable名 | 説明 | 設定値の例 |
|-----------|------|------------|
| `CLOUDFLARE_ACCESS_ALLOWED_EMAILS` | アクセスを許可するメールアドレス（JSON配列形式） | `["user1@example.com", "user2@example.com"]` |

**設定手順**:

1. GitHubリポジトリの **Settings** タブを開く
2. **Environments** をクリック
3. **dev** 環境をクリック
4. **Environment variables** セクションで **Add variable** をクリック
5. 以下を入力:
   - **Name**: `CLOUDFLARE_ACCESS_ALLOWED_EMAILS`
   - **Value**: `["your-email@example.com", "team-member@example.com"]`
     - ⚠️ **重要**: JSON配列形式で入力してください（ダブルクォート必須）
     - 例: `["alice@example.com", "bob@example.com"]`
6. **Add variable** をクリック

**注意**:
- この変数を設定しない場合、デフォルトで空の配列 `[]` が使用され、誰もアクセスできなくなります
- prd環境では設定不要です（Cloudflare Accessが無効のため）
- ワークフローファイルで `TF_VAR_` プレフィックスが自動的に付与されます

### Step 2: Cloudflare Zone の準備

Cloudflareでドメインのzoneを作成済みであることを確認します。

- Zone IDは Cloudflareダッシュボード > 該当ドメイン > 右サイドバー から取得できます
- API Tokenは Cloudflareダッシュボード > My Profile > API Tokens から作成します
  - 必要な権限: `Zone:Read`, `DNS:Edit`, `Zone Settings:Edit`, `Access:Edit`（Cloudflare Accessを使用する場合）

#### Cloudflare Accessによる認証（dev環境のみ）

dev環境では、Cloudflare Accessによる認証が**デフォルトで有効**になっています。これにより、許可されたメールアドレスのユーザーのみがアクセスできるようになります。

**仕組み**:
1. ユーザーがdev環境にアクセスすると、Cloudflareのログイン画面が表示されます
2. ユーザーは許可されたメールアドレスでログインします（ワンタイムコード認証）
3. 認証に成功すると、24時間セッションが維持されます

**設定方法**:
1. GitHub Environmentsの変数に `TF_VAR_cloudflare_access_allowed_emails` を追加（上記参照）
2. 許可するメールアドレスをJSON配列形式で指定
3. Terraformをapplyして設定を反映

**無効化する場合**:
dev環境のTerraform設定（`terraform/environments/dev/main.tf`）で `enable_access = false` に変更します。

### Step 3: GitHub Environmentsの保護ルール設定（prd環境推奨）

本番環境（prd）へのデプロイには承認フローを設定することを推奨します：

1. GitHubリポジトリの **Settings** > **Environments** > **prd** を開く
2. **Required reviewers** を有効化
3. 承認者を追加（チームメンバー）

これにより、prd環境へのデプロイは承認者の承認が必要になります。

## GitHub Actionsワークフロー

### terraform-deploy.yml

**トリガー**: 手動実行（workflow_dispatch）

**利用可能なアクション**:
- `plan`: 変更内容を確認（実際の変更は行わない）
- `apply`: インフラを作成・変更
- `destroy`: インフラを削除（注意: 本番環境では慎重に）

**実行例**:
```
Actions タブ > Terraform > Run workflow
  Environment: dev
  Action: plan
```

**使用タイミング**:
- 初回インフラ構築時（`apply`）
- インフラ設定変更時（`plan` → 確認 → `apply`）
- リソース削除時（`destroy`、テスト環境のみ推奨）

### deploy-frontend.yml

**トリガー**: 手動実行（workflow_dispatch）

**処理内容**:
1. Dockerイメージをビルド（自動生成タグ: `v{バージョン}-{コミットハッシュ}`）
2. Artifact Registryにpush
3. Cloud Runにデプロイ
4. Health check実行

**実行例**:
```
Actions タブ > Deploy Frontend > Run workflow
  Environment: dev
```

**使用タイミング**:
- 初回アプリケーションデプロイ時
- コード変更後のデプロイ
- 環境変数変更後の再デプロイ

## トラブルシューティング

### 問題: "Error: Failed to get existing workspaces"

**原因**: GCS bucketへのアクセス権限がない

**解決方法**:
1. `TFSTATE_BUCKET_NAME` シークレットが正しく設定されているか確認
2. サービスアカウントに `Storage Object Admin` 権限があることを確認
3. 基盤リポジトリでバケットが作成されているか確認

### 問題: "Error: Insufficient permissions to create Artifact Registry"

**原因**: サービスアカウントに必要な権限がない

**解決方法**:
サービスアカウントに以下の権限があることを確認：
- `roles/artifactregistry.admin`
- `roles/run.admin`
- `roles/iam.serviceAccountUser`

### 問題: GitHub Actionsワークフローが失敗する

**確認事項**:
1. すべてのGitHub Secretsが正しく設定されているか
2. GitHub Environments（dev/prd）が作成されているか
3. Workload Identity Federation認証が正しく設定されているか

**デバッグ方法**:
GitHub Actionsのログを確認（Actions タブ > 失敗したワークフロー > ログを展開）

## 次のステップ

セットアップが完了したら、[デプロイメントガイド](./02_deployment_guide.md)を参照して実際のデプロイを行ってください。
