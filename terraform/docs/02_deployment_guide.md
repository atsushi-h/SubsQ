# デプロイメントガイド

このドキュメントでは、フロントエンドアプリケーションのデプロイ方法を説明します。

**重要**: すべてのデプロイはGitHub Actions経由で実行します。ローカルで `terraform` や `gcloud` コマンドを実行する必要はありません。

## デプロイフロー概要

1. **インフラのプロビジョニング** (初回のみ)
   - Artifact Registry の作成
   - Cloud Run サービスの作成
   - Cloudflare DNS/CDN の設定

2. **アプリケーションのデプロイ** (通常のデプロイ)
   - Dockerイメージのビルド
   - Artifact Registryへのプッシュ
   - Cloud Runへのデプロイ
   - Health check

## 初回デプロイ

### Step 1: インフラのプロビジョニング

GitHub Actionsで **Terraform** ワークフローを実行します。

1. GitHubリポジトリの **Actions** タブを開く
2. **Terraform** ワークフローを選択
3. **Run workflow** をクリック
4. 以下を選択：
   - **Environment**: `dev` または `prd`
   - **Action**: `apply`
5. **Run workflow** を実行

**Dev環境の場合**: すぐに実行されます
**Prd環境の場合**: GitHub Environmentの保護ルールにより、承認者の承認が必要です

#### 確認事項

デプロイ後、GitHub ActionsのStep Summaryで以下が作成されたことを確認できます：
- Artifact Registryリポジトリ
- Cloud Runサービス
- Cloudflare DNSレコード

### Step 2: 初回イメージのビルドとデプロイ

GitHub Actionsで **Deploy Frontend** ワークフローを実行します。

1. GitHubリポジトリの **Actions** タブを開く
2. **Deploy Frontend** ワークフローを選択
3. **Run workflow** をクリック
4. 以下を選択：
   - **Environment**: `dev` または `prd`
5. **Run workflow** を実行

#### デプロイフロー

ワークフローは以下の処理を自動的に実行します：

1. **イメージタグの生成**
   - 形式: `v{package.jsonのバージョン}-{コミットハッシュ}`
   - 例: `v1.2.3-abc1234`

2. **Dockerイメージをビルド**
   - Next.js Standaloneビルド
   - 環境変数を含めてビルド

3. **Artifact Registryにプッシュ**
   - 生成されたタグでpush

4. **Cloud Runにデプロイ**
   - `gcloud run deploy` でイメージを更新
   - 既存のインフラ設定（CPU、メモリ等）は保持

5. **Health checkを実行**
   - `/api/health` エンドポイントをチェック
   - 最大10回リトライ（各10秒間隔）

### Step 3: 動作確認

デプロイ完了後、GitHub ActionsのSummaryに表示される情報を確認します：
- **Service URL**: Cloud RunのURL
- **Image Tag**: デプロイされたイメージのタグ

ブラウザでアプリケーションにアクセスして動作を確認してください。

## 通常のデプロイ

コード変更後の通常のデプロイは、**Deploy Frontend** ワークフローのみを実行します。

### デプロイ手順

1. コードをコミット・プッシュ
2. GitHub Actionsの **Actions** タブを開く
3. **Deploy Frontend** ワークフローを実行
4. 完了を待つ

**注意**: インフラ設定（CPU、メモリ等）を変更していない場合、`Terraform` ワークフローを実行する必要はありません。

## GitHub Actionsワークフロー詳細

### 1. Terraform

**トリガー**: 手動実行（workflow_dispatch）

**利用可能なアクション**:
| Action | 説明 | 使用タイミング |
|--------|------|---------------|
| `plan` | 変更内容を確認（dry-run） | インフラ変更前の確認 |
| `apply` | インフラを作成・変更 | 初回構築、設定変更時 |
| `destroy` | インフラを削除 | テスト環境の削除時のみ |

**実行方法**:
```
Actions > Terraform > Run workflow
  Environment: dev
  Action: plan
```

**使用タイミング**:
- ✅ 初回インフラ構築時（`apply`）
- ✅ CPU、メモリ、スケーリング設定変更時（`plan` → `apply`）
- ✅ 環境変数の追加・削除時（値はGitHub Secretsで管理）
- ❌ 通常のアプリケーションデプロイ（こちらはDeploy Frontendを使用）

### 2. Deploy Frontend

**トリガー**: 手動実行（workflow_dispatch）

**処理内容**:
1. Checkout repository
2. イメージタグ自動生成（`v{バージョン}-{コミットハッシュ}`）
3. GCP認証
4. Docker設定
5. イメージビルド
6. Artifact Registryにpush
7. Cloud Run サービス存在チェック
8. Cloud Runにデプロイ
9. Health check
10. 結果サマリー表示

**実行方法**:
```
Actions > Deploy Frontend > Run workflow
  Environment: dev
```

**使用タイミング**:
- ✅ 初回アプリケーションデプロイ時
- ✅ コード変更後のデプロイ
- ✅ 環境変数の値変更後の再デプロイ

## 環境変数の更新

環境変数の**値**を変更する場合の手順：

### Step 1: GitHub Secretsを更新

1. GitHubリポジトリの **Settings** > **Environments**
2. 該当する環境（dev/prd）を選択
3. **Environment secrets** で値を更新

### Step 2: 再デプロイ

**Deploy Frontend** ワークフローを実行して、新しい環境変数でイメージを再ビルド・デプロイします。

### 環境変数を追加・削除する場合

1. **Terraformコードを修正**（`main.tf`のenv_vars）
2. **GitHub Secretsに値を追加**
3. **Terraform** ワークフローで `apply` を実行
4. **Deploy Frontend** ワークフローで再デプロイ

## ロールバック

問題が発生した場合のロールバック方法：

### 方法1: 以前のコミットから再デプロイ（推奨）

1. 以前の安定していたコミットをチェックアウト
   ```bash
   git checkout abc1234  # 安定していたコミットのハッシュ
   git push origin HEAD:rollback-branch
   ```

2. GitHub Actionsで **Deploy Frontend** ワークフローを実行
   - ロールバック用ブランチから実行

3. 確認後、mainにマージするか判断

### 方法2: GCP Console経由（緊急時）

1. [Cloud Run Console](https://console.cloud.google.com/run) を開く
2. サービスを選択
3. **REVISIONS** タブから以前のリビジョンを選択
4. **MANAGE TRAFFIC** で100%のトラフィックを以前のリビジョンに向ける

**注意**: この方法は緊急時のみ使用してください。次回のDeploy Frontendワークフロー実行で上書きされます。

## モニタリング

### GitHub Actions

すべてのデプロイは GitHub Actions経由で実行されるため、以下で確認できます：

- **Actions** タブ: 実行履歴
- **Step Summary**: デプロイ結果の詳細
- **Logs**: 各ステップの詳細ログ

### Cloud Run

[Cloud Run Console](https://console.cloud.google.com/run) から以下を確認できます：

- **METRICS** タブ:
  - Request count
  - Request latency
  - Container instance count
  - CPU / Memory utilization

- **LOGS** タブ:
  - アプリケーションログ
  - アクセスログ
  - エラーログ

- **REVISIONS** タブ:
  - デプロイ履歴
  - 各リビジョンのトラフィック配分

### Cloudflare

[Cloudflare Dashboard](https://dash.cloudflare.com/) から以下を確認できます：

- **Analytics & Logs** > **Traffic**:
  - Requests
  - Bandwidth
  - Unique visitors

- **Security** > **Events**:
  - Firewall events（Managed Rulesが有効の場合）
  - Bot Fight Mode events（Bot Fight Modeが有効の場合）

**重要**: 無料プランではWAF Custom RulesとRate Limitingは使用できません。代わりに以下の無料機能を活用してください：

- **Managed Rules**: Security > WAF > Managed Rulesから有効化
- **Bot Fight Mode**: Security > Botsから有効化
- **Security Level**: Security > Settingsで"Medium"以上に設定

詳細は[セットアップガイドのセキュリティ注意事項](./01_terraform_setup.md#セキュリティに関する重要な注意事項)を参照してください。

## トラブルシューティング

### 問題: Deploy Frontendワークフローが失敗する

**確認事項**:
1. GitHub Secretsが正しく設定されているか
2. Cloud Runサービスが存在するか（Terraformで作成済みか）
3. GitHub Actionsのログでエラー内容を確認

**解決方法**:
- ❌ Cloud Runサービスが存在しない → Terraformワークフローで `apply` を先に実行
- ❌ 認証エラー → WORKLOAD_IDENTITY_PROVIDERとTERRAFORM_SERVICE_ACCOUNT_EMAILを確認
- ❌ ビルドエラー → コードの構文エラーを修正

### 問題: Health checkが失敗する

**確認事項**:
1. `/api/health` エンドポイントが実装されているか
2. アプリケーションが正常に起動しているか
3. 環境変数が正しく設定されているか

**デバッグ方法**:
1. Cloud Run Consoleでログを確認
2. エラーメッセージから原因を特定
3. 必要に応じて環境変数を修正して再デプロイ

### 問題: Terraformワークフローが失敗する

**確認事項**:
1. TFSTATE_BUCKET_NAMEが正しく設定されているか
2. サービスアカウントに必要な権限があるか
3. Terraformコードに構文エラーがないか

**デバッグ方法**:
1. GitHub ActionsのLogsでエラー内容を確認
2. `plan` アクションで変更内容を事前確認
3. 必要に応じてTerraformコードを修正

### 問題: Cloudflare経由でアクセスできない

**確認事項**:
1. Terraformで Cloudflare設定が正しく作成されているか
2. DNS設定が反映されているか（最大48時間かかる場合あり）
3. SSL/TLS設定が正しいか

**解決方法**:
- Cloudflare Dashboardで設定を確認
- DNS propagationを確認（`dig` コマンドや[DNSチェッカー](https://dnschecker.org/)）

## コスト管理

### Dev環境のコスト削減設定（デフォルト）

- **Min instances = 0**: アイドル時は課金なし
- **CPU always allocated = false**: リクエスト時のみCPU課金
- **Cleanup policy = 10イメージ保持**: 古いイメージ自動削除

### Prd環境のコスト最適化

- **Min instances = 1**: コールドスタート回避（レスポンス速度優先）
- 不要な古いリビジョンは定期的に削除を検討

### 予算アラート設定（推奨）

1. [GCP Console](https://console.cloud.google.com/billing) > **Budgets & alerts**
2. 月次予算を設定
3. 50%, 90%, 100%でアラートを設定

## ベストプラクティス

### デプロイ前

- ✅ ローカルでビルドが成功することを確認
- ✅ package.jsonのバージョンを適切に更新
- ✅ PRでコードレビューを実施

### デプロイ時

- ✅ Dev環境で先にテスト
- ✅ Prd環境へは慎重にデプロイ（承認フロー活用）
- ✅ デプロイ後は必ず動作確認

### デプロイ後

- ✅ ログを監視
- ✅ メトリクスを確認
- ✅ エラーレートをチェック

### インフラ変更時

- ✅ まず `plan` で変更内容を確認
- ✅ 重要な変更前はバックアップを検討
- ✅ Prd環境では特に慎重に

## 自動デプロイの設定（オプション）

mainブランチへのマージ時に自動デプロイするには、`.github/workflows/deploy-frontend.yml` に以下を追加できます：

```yaml
on:
  workflow_dispatch:
    # ... 既存の設定 ...
  push:
    branches:
      - main
    paths:
      - "frontend/**"
```

**注意**:
- ❌ Prd環境への自動デプロイは推奨しません
- ✅ Dev環境のみ自動デプロイを検討
- ✅ GitHub Environmentsの保護ルールと組み合わせて使用

## 次のステップ

- GitHub Environmentsの保護ルール設定（prd環境）
- Cloudflareの追加セキュリティ設定
- モニタリング・アラートの設定
- CI/CDパイプラインのさらなる改善
