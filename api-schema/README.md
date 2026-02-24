# SubsQ API Schema

TypeSpecを使用したAPI仕様の定義と、TypeScriptの型自動生成を行うプロジェクトです。

## 概要

このリポジトリは、SubsQのフロントエンドとバックエンドのAPI契約を定義し、型安全性を保証します。

- **TypeSpec**: API仕様を定義
- **OpenAPI YAML**: TypeSpecから自動生成
- **TypeScript**: OpenAPIからTypeScriptの型とクライアントを自動生成

## ディレクトリ構成

```
api-schema/
├── typespec/              # TypeSpec定義
│   ├── models/           # データモデル定義
│   │   ├── user.tsp
│   │   ├── subscription.tsp
│   │   ├── payment-method.tsp
│   │   └── common.tsp
│   ├── routes/           # エンドポイント定義
│   │   ├── users.tsp
│   │   ├── subscriptions.tsp
│   │   └── payment-methods.tsp
│   ├── main.tsp          # エントリーポイント
│   └── tspconfig.yaml    # TypeSpec設定
├── generated/            # 自動生成アセット
│   └── openapi.yaml      # TypeSpec→OpenAPIの成果物（Go/TSは各プロジェクトへ配置）
├── scripts/              # 生成スクリプト
│   ├── generate.sh
│   ├── generate-openapi.sh
│   └── generate-ts.sh
├── package.json
└── README.md
```

## セットアップ

### 必要な環境

- Node.js 24+
- pnpm 10+

### インストール

```bash
pnpm install
```

## 使い方

### 全自動生成

TypeSpecからOpenAPI YAMLとTypeScriptのコードを一括生成します。

```bash
pnpm run generate
```

### 個別生成

#### OpenAPI YAMLの生成

```bash
pnpm run generate:openapi
```

#### TypeScriptコードの生成

```bash
pnpm run generate:ts
```

## TypeSpec定義の編集

### モデルの追加・編集

`typespec/models/` 配下にTypeSpecファイルを作成または編集します。

例：
```typespec
// typespec/models/subscription.tsp
model SubscriptionResponse {
  id: string;
  serviceName: string;
  amount: int64;
}
```

### ルート（エンドポイント）の追加・編集

`typespec/routes/` 配下にTypeSpecファイルを作成または編集します。

例：
```typespec
// typespec/routes/subscriptions.tsp
@route("/api/v1/subscriptions")
interface Subscriptions {
  @get list(): ListSubscriptionsResponse;
  @post create(@body request: CreateSubscriptionRequest): SubscriptionResponse;
}
```

### 生成コードの更新

TypeSpecを編集したら、以下のコマンドで生成コードを更新します。

```bash
pnpm run generate
```

## 生成されたコードの使用

```typescript
import { SubscriptionResponse, CreateSubscriptionRequest } from '@subsq/api-schema/typescript/models';

async function createSubscription(req: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    // ...
}
```

## CI/CD

GitHub Actionsを使用して、TypeSpecの変更時に自動的にコード生成を実行します。
