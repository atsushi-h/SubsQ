---
name: testing
description: フロントエンドとBFF層のテスト戦略を適用。Unit Test、E2Eテスト、各レイヤーのテスト方針、ファイル配置、実装例を提供。
---

# テスト戦略ガイド

テストファイルを作成・実装する際は、以下のドキュメントに従ってください。

## テスト戦略ドキュメント

このプロジェクトには2つのテスト戦略ドキュメントがあります:

### 1. フロントエンドテスト戦略
**パス**: `frontend/docs/09_testing_strategy.md`

**カバー範囲**:
- **カスタムHook** (✅ 必須) - ビジネスロジックの核心
- **Query Keys** (✅ 必須) - キャッシュ管理の要
- **Utils** (✅ 推奨) - ユーティリティ関数
- **E2Eテスト** (✅ 必須) - Playwright + MSW
- **Presenter/Container** (❌) - E2Eでカバー、直接テストしない

**テスト対象の選定理由**:
- Presenterのテストは、Server Actionsのモック問題とUI変更頻度によりコスパが悪い
- テストすべき場所を「絞る」のが現実的なアプローチ

### 2. BFF層テスト戦略
**パス**: `frontend/docs/10_bff_testing_strategy.md`

**カバー範囲**:
- **DTO / Zod** (✅ 必須) - APIとの契約確認、型変換
- **Service** (✅ 必須) - ビジネスロジック、データ変換、エラーハンドリング
- **Handler** (✅ 推奨) - 認証チェック、入力バリデーション
- **Client** (❌ 不要) - OpenAPI自動生成

**BFF層の構造**:
```
Handler (認証 + バリデーション)
  ↓
Service (ビジネスロジック + データ変換)
  ↓
DTO (型変換 + バリデーション)
  ↓
Repository / Client (データアクセス)
```

## 使用タイミング

以下の場合に、必ず該当するドキュメントを読んでから実装してください:

1. **新しいテストファイルを作成する時**
   - カスタムHookのテスト → 09_testing_strategy.md
   - Query Keysのテスト → 09_testing_strategy.md
   - DTO/Serviceのテスト → 10_bff_testing_strategy.md

2. **E2Eテストを追加する時**
   - 09_testing_strategy.md の「E2Eテスト (Playwright + MSW)」セクション

3. **テスト戦略について質問された時**
   - どのレイヤーをテストすべきか
   - なぜPresenterをテストしないのか
   - テストファイルの配置場所

## 重要な原則

### テストファイルの配置
- **コロケーション**: テストファイルは対象ファイルと同じディレクトリに配置
- **命名規則**: `{filename}.test.ts` または `{filename}.spec.ts`

### テスト構造
- **AAAパターン**: Arrange (準備) → Act (実行) → Assert (検証)
- **説明的なテスト名**: 日本語で「〜する」「〜の場合、〜を返す」形式

### 実行コマンド
```bash
# Unit テスト
pnpm test           # 全テスト実行
pnpm test:watch     # ウォッチモード
pnpm test:coverage  # カバレッジ付き

# E2Eテスト
pnpm e2e            # Playwrightテスト実行
pnpm e2e:ui         # UIモードで実行
```

## 実装時の注意点

1. **ドキュメントを必ず読む**: テスト実装前に該当ドキュメントの実装例を確認
2. **実装例に従う**: ドキュメント内の実装例と同じパターンを使用
3. **モックの適切な使用**: 外部依存は適切にモックする
4. **TanStack Query**: QueryClientProviderでラップが必要な場合がある

## ドキュメント参照方法

テストファイルを作成する際は、以下の手順でドキュメントを参照してください:

1. **Read toolで該当ドキュメントを読む**
   ```
   Read tool: frontend/docs/09_testing_strategy.md
   または
   Read tool: frontend/docs/10_bff_testing_strategy.md
   ```

2. **実装例を確認**
   - ドキュメント内の「実装例」セクションを参照
   - モックの使い方を確認
   - テストの構造を理解

3. **同じパターンで実装**
   - ドキュメントのパターンに従う
   - 命名規則を守る
   - コロケーションを遵守
