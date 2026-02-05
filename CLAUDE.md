# SubsQ プロジェクト

サブスクリプション管理 Web アプリケーション（日本市場向け）
Next.js 15+ App Router + TypeScript + TailwindCSS + Drizzle ORM + Better Auth

## ディレクトリ構造

```
frontend/src/
├── app/                      # App Router（薄く保つ）
│   ├── (guest)/              # 未認証ルート
│   └── (authenticated)/      # 認証必須ルート
├── features/                 # 機能モジュール
│   ├── subscription/
│   │   ├── components/
│   │   │   ├── server/       # Server Components
│   │   │   └── client/       # Client Components（Container/Presenter）
│   │   ├── hooks/            # TanStack Query フック
│   │   ├── queries/          # Query Keys
│   │   ├── schemas/          # Zod スキーマ
│   │   └── types/
│   └── ...
├── shared/                   # 共通ユーティリティ
└── external/                 # 外部連携層（DB/API）
    ├── handler/              # CQRS ハンドラ
    ├── service/              # ビジネスロジック
    ├── repository/           # データベース操作
    └── domain/               # ドメインモデル
```

## 開発コマンド

```bash
pnpm dev          # 開発サーバー
pnpm build        # 本番ビルド
pnpm test         # テスト実行
pnpm lint         # Lint 実行
pnpm type:check   # 型チェック
```

## 設計方針

- Server Components 優先（クライアント JS 最小化）
- Container/Presenter パターン（Client Components）
- CQRS パターン（Query/Command 分離）
- TanStack Query（データフェッチング）
- Zod バリデーション（型安全性）
- 1 ファイル = 1 コンポーネント

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
