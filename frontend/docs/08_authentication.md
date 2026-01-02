# 認証システム実装ガイド

## 概要

Better Auth を使用した認証システム。Google OAuth 2.0 による認証と、stateless セッション管理を採用。

## 技術スタック

| 項目 | 技術 |
|------|------|
| 認証ライブラリ | Better Auth |
| OAuth プロバイダ | Google OAuth 2.0 |
| セッション管理 | Stateless（Cookie ベース） |
| ユーザーデータ | PostgreSQL（users テーブル） |
| キャッシュ | Next.js unstable_cache |

## アーキテクチャ
```
┌─────────────────────────────────────────────────────────────────┐
│                        認証フロー                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ユーザー                                                        │
│     │                                                           │
│     ▼                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ ログイン    │───▶│ Google     │───▶│ コールバック │         │
│  │ ボタン     │    │ OAuth 2.0  │    │ /api/auth/* │         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
│                                               │                 │
│                                               ▼                 │
│                                        ┌─────────────┐         │
│                                        │ Better Auth │         │
│                                        │ (stateless) │         │
│                                        └──────┬──────┘         │
│                                               │                 │
│                      ┌────────────────────────┼────────────┐   │
│                      │                        │            │   │
│                      ▼                        ▼            ▼   │
│               ┌─────────────┐         ┌─────────────┐  ┌─────┐│
│               │ onSuccess   │         │customSession│  │Cookie││
│               │ (初回のみ)  │         │ (毎回実行)  │  │保存 ││
│               └──────┬──────┘         └──────┬──────┘  └─────┘│
│                      │                       │                 │
│                      ▼                       ▼                 │
│               ┌─────────────┐         ┌─────────────┐         │
│               │ handler     │         │unstable_cache│         │
│               │ (command)   │         │ (5分キャッシュ)│        │
│               └──────┬──────┘         └──────┬──────┘         │
│                      │                       │                 │
│                      ▼                       ▼                 │
│               ┌─────────────────────────────────────┐         │
│               │           users テーブル            │         │
│               │    (id, email, provider, etc.)     │         │
│               └─────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Stateless セッションとは

従来の認証（Stateful）との違い：

| 項目 | Stateful | Stateless（採用） |
|------|----------|-------------------|
| セッション保存 | DB（sessions テーブル） | Cookie（署名付き） |
| DBアクセス | 毎リクエスト | 不要 |
| スケーラビリティ | サーバー間で共有必要 | 各サーバーで独立処理可能 |
| ログアウト | DBから削除 | Cookie削除のみ |

### メリット
- DBへのセッション問い合わせが不要（高速）
- 水平スケーリングが容易
- sessionsテーブルが不要

### デメリット
- サーバー側から強制ログアウトが難しい
- セッションデータの即時更新が難しい

## 処理フロー詳細

### 1. ログインボタンクリック
```typescript
// features/auth/components/client/LoginPageClient/useLoginClient.ts
const handleLogin = async () => {
  await signIn.social({
    provider: "google",
    callbackURL: "/subscriptions",  // ログイン後のリダイレクト先
  });
};
```

### 2. Google OAuth 認証

1. ユーザーがGoogleのログイン画面にリダイレクト
2. Googleアカウントでログイン
3. 認可コードがコールバックURLに返される
4. Better Authがアクセストークンを取得

### 3. Better Auth コールバック処理
```typescript
// app/api/auth/[...all]/route.ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/features/auth/lib/better-auth";

export const { GET, POST } = toNextJsHandler(auth);
```

### 4. onSuccess コールバック（初回ログイン時）
```typescript
// features/auth/lib/better-auth.ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    async onSuccess(ctx) {
      // users テーブルにユーザー情報を保存
      await createOrGetUserCommand({
        email: ctx.user.email,
        name: ctx.user.name || ctx.user.email,
        provider: "google",
        providerAccountId: ctx.user.id,
        thumbnail: ctx.user.image || undefined,
      });
    }
  }
}
```

### 5. customSession プラグイン（毎回実行）
```typescript
// features/auth/lib/better-auth.ts
customSession(async ({ user, session }) => {
  // unstable_cache でDBアクセスをキャッシュ（5分）
  let dbUser = await getCachedUser(user.email);

  // ユーザーが存在しない場合は作成（フォールバック）
  if (!dbUser) {
    await createOrGetUserCommand({ ... });
    dbUser = await getUserByEmailQuery(user.email);
  }

  return { user: { ...user, id: dbUser.id }, session };
})
```

### 6. セッション取得
```typescript
// features/auth/servers/auth.server.ts
export async function getSessionServer(): Promise<Session | null> {
  return await auth.api.getSession({ headers: await headers() });
}
```

## キャッシュ戦略

### サーバーサイド（unstable_cache）
```typescript
const getCachedUser = unstable_cache(
  async (email: string): Promise<User | null> => {
    return await getUserByEmailQuery(email);
  },
  ["user-by-email"],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ["user"],
  }
);
```

| 設定 | 値 | 説明 |
|------|-----|------|
| revalidate | 300秒 | キャッシュの有効期間 |
| tags | ["user"] | revalidateTag で無効化可能 |

### クライアントサイド（Cookie Cache）
```typescript
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5分間
  },
}
```

セッション情報をCookieにキャッシュし、毎回のDB/API呼び出しを削減。

## 型定義（Module Augmentation）
```typescript
// features/auth/types/better-auth.d.ts
declare module "better-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
  }
}
```

これにより `session.user.id` でユーザーIDにアクセス可能。

## 認証ガード

### サーバーコンポーネント
```typescript
// features/auth/servers/redirect.server.ts
export async function requireAuthServer(): Promise<Session> {
  const session = await getSessionServer();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function getAuthenticatedSessionServer(): Promise<Session> {
  const session = await getSessionServer();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}
```

### 使用例
```typescript
// app/(authenticated)/subscriptions/page.tsx
export default async function SubscriptionsPage() {
  const session = await requireAuthServer();
  // session.user.id が保証されている
}
```

## 環境変数
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Better Auth
NEXTAUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key
```

## データベーススキーマ
```typescript
// external/client/schema.ts
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    thumbnail: text("thumbnail"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    providerAccountIdx: uniqueIndex("users_provider_account_idx").on(
      table.provider,
      table.providerAccountId
    ),
  })
);
```

### ユニーク制約

| 制約 | カラム | 目的 |
|------|--------|------|
| users_email_idx | email | メールアドレスの重複防止 |
| users_provider_account_idx | (provider, provider_account_id) | 同一プロバイダの重複防止 |

## 重複アカウント処理

同じユーザーが再ログインした場合の処理：
```typescript
// external/repository/user.repository.ts
.onConflictDoUpdate({
  target: [users.provider, users.providerAccountId],
  set: {
    email: data.email,
    name: data.name,
    thumbnail: data.thumbnail,
    updatedAt: Math.floor(Date.now() / 1000),
  },
})
```

これにより：
- 新規ユーザー → INSERT
- 既存ユーザー → UPDATE（updatedAt 更新）

## ファイル構成
```
features/auth/
├── lib/
│   ├── better-auth.ts        # サーバー側設定
│   └── better-auth-client.ts # クライアント側設定
├── servers/
│   ├── auth.server.ts        # getSessionServer
│   └── redirect.server.ts    # requireAuthServer, getAuthenticatedSessionServer
├── types/
│   └── better-auth.d.ts      # 型定義（Module Augmentation）
├── components/
│   ├── client/
│   │   └── LoginPageClient/  # ログインUI
│   └── server/
│       └── LoginPageTemplate/
└── hooks/
    └── useSession.ts         # クライアント用フック

external/handler/
├── user.command.server.ts    # createOrGetUserCommand
└── user.query.server.ts      # getUserByEmailQuery
```

## トラブルシューティング

### セッションが取得できない

1. Cookieが正しく設定されているか確認
2. `BETTER_AUTH_SECRET` が設定されているか確認
3. `NEXTAUTH_URL` が正しいか確認

### ユーザーが作成されない

1. データベース接続を確認
2. users テーブルが存在するか確認
3. ユニーク制約違反がないか確認

### customSession でエラー

1. `getUserByEmailQuery` がnullを返していないか確認
2. unstable_cache のタグが正しいか確認
3. handler → service → repository の呼び出し順序を確認