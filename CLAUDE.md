# SubsQ プロジェクト

サブスクリプション管理 Web アプリケーション
モノレポ構成: Frontend (Next.js) + Backend (Go) + API Schema (TypeSpec) + Terraform (GCP/Cloudflare)

## ディレクトリ構造

```
subsq/
├── frontend/       # Next.js 15+ フロントエンド
├── backend/        # Go API サーバー（Clean Architecture）
├── api-schema/     # TypeSpec API 定義
├── terraform/      # IaC (GCP Cloud Run + Cloudflare)
└── compose.yml     # ローカル開発環境（backend + db）
```

**Frontend (frontend/src/)**
```
├── app/          # App Router（薄く保つ）
├── features/     # 機能モジュール（components / hooks / queries / schemas / types）
├── shared/       # 共通ユーティリティ
└── external/     # 外部連携層（handler / service / repository / domain）
```

**Backend (backend/)**
```
├── cmd/api/           # エントリーポイント
├── internal/
│   ├── adapter/       # HTTP Controller + DB Gateway
│   ├── usecase/       # ビジネスロジック
│   ├── domain/        # ドメインモデル
│   ├── port/          # インターフェース定義
│   └── driver/        # フレームワーク設定・DI
└── migrations/        # DB マイグレーション
```

**Terraform (terraform/)**
```
├── environments/
│   ├── dev/
│   └── prd/
└── modules/
    ├── cloud-run/
    ├── artifact-registry/
    ├── cloudflare/
    └── budget-alert/
```

## 開発コマンド

**Frontend (frontend/)**
```bash
pnpm dev          # 開発サーバー
pnpm build        # 本番ビルド
pnpm test         # テスト実行
pnpm lint         # Lint 実行
pnpm lint:fix     # Lint 自動修正
pnpm type:check   # 型チェック
```

**Backend (backend/) ※ Docker コンテナ内で実行**
```bash
make test         # テスト実行
make lint         # golangci-lint 静的解析
make fmt          # golangci-lint フォーマット
make sqlc         # sqlc によるコード生成
make mock         # モック生成（sqlc 後に実行）
make openapi      # OpenAPI から Go コード生成
make migrate-up   # マイグレーション適用
make migrate-down # マイグレーション 1 件ロールバック
make migrate-new NAME=<name>  # 新規マイグレーションファイル作成
make docker-up    # ローカル環境起動（ルートの compose.yml）
make docker-down  # ローカル環境停止
```

**API Schema (api-schema/)**
```bash
pnpm generate           # OpenAPI + TypeScript クライアント全生成
pnpm generate:openapi   # OpenAPI YAML のみ生成
pnpm generate:ts        # TypeScript クライアントのみ生成
```

**Terraform (terraform/)**
```bash
make fmt        # Terraform ファイルをフォーマット
make fmt-check  # フォーマットチェック（CI 用）
make validate   # Terraform 設定を検証（構文チェック）
make lint       # TFLint による静的解析
```

**Docker Compose (ルート)**
```bash
docker compose up -d   # ローカル環境起動（backend + db）
docker compose down    # ローカル環境停止
```

## 設計方針

**Frontend**
- Server Components 優先（クライアント JS 最小化）
- Container/Presenter パターン（Client Components）
- CQRS パターン（Query/Command 分離）
- TanStack Query（データフェッチング）
- Zod バリデーション（型安全性）
- 1 ファイル = 1 コンポーネント

**Backend**
- Clean Architecture（adapter → usecase → domain）
- OpenAPI 契約駆動（TypeSpec → OpenAPI → Go / TS 自動生成）
- sqlc による型安全な DB アクセス

## ブランチ命名規則

**重要**: `feat/` を使用、`feature/` は使用しない

| プレフィックス | 用途 | 例 |
|---|---|---|
| `feat/` | 新機能 | `feat/add-subscription` |
| `fix/` | バグ修正 | `fix/auth-error` |
| `chore/` | 雑務・設定変更 | `chore/update-deps` |
| `refactor/` | リファクタリング | `refactor/simplify-logic` |
| `test/` | テスト追加 | `test/add-unit-tests` |
| `docs/` | ドキュメント更新 | `docs/update-readme` |

形式: `<プレフィックス>/<説明>` （ケバブケース、英語推奨）

## コミットメッセージ

Conventional Commits 形式: `<type>(<scope>): <description>`

```
feat: サブスクリプション機能を追加
fix: ログインバリデーションを修正
chore(deps): パッケージを更新
```

## 詳細ドキュメント

アーキテクチャとパターン: @.claude/skills/project-guidelines/SKILL.md
コーディング規約: @.claude/skills/coding-standards/SKILL.md
テスト戦略: @.claude/skills/testing/SKILL.md
