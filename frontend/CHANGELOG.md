# Changelog

## [1.1.1](https://github.com/atsushi-h/SubsQ/compare/frontend-v1.1.0...frontend-v1.1.1) (2026-02-15)


### Bug Fixes

* セッション有効期限を明示的に設定 ([#113](https://github.com/atsushi-h/SubsQ/issues/113)) ([c66388d](https://github.com/atsushi-h/SubsQ/commit/c66388d20bd9d7e609d80dc76a1b20fbd2677ceb))

## [1.1.0](https://github.com/atsushi-h/SubsQ/compare/frontend-v1.0.0...frontend-v1.1.0) (2026-02-13)


### Features

* **e2e:** サブスクリプション作成と支払い方法追加のE2Eテストを追加 ([#94](https://github.com/atsushi-h/SubsQ/issues/94)) ([ebdddcb](https://github.com/atsushi-h/SubsQ/commit/ebdddcba8cac1017d64b12796a76072731964a2b))


### Bug Fixes

* ページがインデックスされない問題を修正 ([#112](https://github.com/atsushi-h/SubsQ/issues/112)) ([aded390](https://github.com/atsushi-h/SubsQ/commit/aded390a9387f53cad3583f21362d61f2b16007b))

## 1.0.0 (2026-02-08)


### Features

* @t3-oss/env-nextjsで環境変数をロードする ([17a9d32](https://github.com/atsushi-h/SubsQ/commit/17a9d32f6d6d31e89dabb077eb82a2ad6371dcb8))
* Better Authによる認証機能を追加 ([58e9e98](https://github.com/atsushi-h/SubsQ/commit/58e9e985dc4f48ae1bb4b2844e0aaac7d980d0ba))
* dev環境でのクローラー登録を防止 ([#51](https://github.com/atsushi-h/SubsQ/issues/51)) ([39216db](https://github.com/atsushi-h/SubsQ/commit/39216dbb23e5af5b41ad46765866861017494e48))
* E2Eテスト実行時のみメール/パスワードログインを表示 ([#77](https://github.com/atsushi-h/SubsQ/issues/77)) ([b8b8e0d](https://github.com/atsushi-h/SubsQ/commit/b8b8e0de69998fd5e58dfa7041c28b51db2ba86c))
* E2Eテスト用認証機能を実装 ([#76](https://github.com/atsushi-h/SubsQ/issues/76)) ([838ed99](https://github.com/atsushi-h/SubsQ/commit/838ed99c6baf8c63e5266c4453b344e6930af84a))
* external層のテストを追加 ([#73](https://github.com/atsushi-h/SubsQ/issues/73)) ([1a0e47c](https://github.com/atsushi-h/SubsQ/commit/1a0e47c5c3aee6153798cc6fcffd4077aadb2ae3))
* ListSubscriptionsResponseに合計金額を追加 ([#9](https://github.com/atsushi-h/SubsQ/issues/9)) ([78becbf](https://github.com/atsushi-h/SubsQ/commit/78becbff6debd92f59aa41a8febefea8a649a51e))
* metadata生成用の関数を追加 ([4e355da](https://github.com/atsushi-h/SubsQ/commit/4e355da5f6b3b5d67dc94a56e9cdcdba1e5a3fb5))
* PaymentMethodを削除する前にドメインサービスで使用中チェックする ([#8](https://github.com/atsushi-h/SubsQ/issues/8)) ([35ebd52](https://github.com/atsushi-h/SubsQ/commit/35ebd52e7bdf45baa93467a72443854a99b8c5a3))
* shadcn/ui 導入 ([a9cc845](https://github.com/atsushi-h/SubsQ/commit/a9cc84533c99abacd0748154ef121cee6716c0b1))
* shadcn/uiのコンポーネントを追加 ([cee5f8e](https://github.com/atsushi-h/SubsQ/commit/cee5f8ea6ec803fe2d45aba10de004ba0275cc95))
* subscriptionページ追加 ([d2abe73](https://github.com/atsushi-h/SubsQ/commit/d2abe7331ffa372a8af873502dc37ccb4a890ee5))
* Subscription機能を追加 ([#35](https://github.com/atsushi-h/SubsQ/issues/35)) ([825e770](https://github.com/atsushi-h/SubsQ/commit/825e770011388e10f1ca0d34245f73dd3c9e65a4))
* Terraformの設定とFrontendのデプロイワークフーを追加 ([#47](https://github.com/atsushi-h/SubsQ/issues/47)) ([010a18b](https://github.com/atsushi-h/SubsQ/commit/010a18b3de1e2a89d419a7dbc89e2520b4428e78))
* UserAccountDeleterドメインサービスにトランザクション対応を追加 ([#27](https://github.com/atsushi-h/SubsQ/issues/27)) ([013f0d9](https://github.com/atsushi-h/SubsQ/commit/013f0d9c67ede0f4ca9efc3b3e2d6455802b5cd1))
* Value Objectsを追加 ([acbdfce](https://github.com/atsushi-h/SubsQ/commit/acbdfceec6345b49056183ba6468da0bd1f4f839))
* Vitestによるユニットテスト環境を構築 ([#56](https://github.com/atsushi-h/SubsQ/issues/56)) ([9253bbc](https://github.com/atsushi-h/SubsQ/commit/9253bbc9eb96d8334a29e0395238dcc4967f0cce))
* サーバー側の基本処理を追加 ([#5](https://github.com/atsushi-h/SubsQ/issues/5)) ([e72d58f](https://github.com/atsushi-h/SubsQ/commit/e72d58f8d113508ec9a22faed8801c3bace93969))
* サービス層の削除処理にトランザクション対応を追加 ([#18](https://github.com/atsushi-h/SubsQ/issues/18)) ([630f075](https://github.com/atsushi-h/SubsQ/commit/630f075fefcc18402c561d0eb5c26f29b8da3d50))
* サブスクリプションフォームに支払い方法選択機能を追加 ([#53](https://github.com/atsushi-h/SubsQ/issues/53)) ([04b7de4](https://github.com/atsushi-h/SubsQ/commit/04b7de4f1bde0c8aa9f6ad5ddfd23cc661be8563))
* ダークモード対応機能を実装 ([#55](https://github.com/atsushi-h/SubsQ/issues/55)) ([1477ca5](https://github.com/atsushi-h/SubsQ/commit/1477ca58d0424f55146487f3ed2e62b369e67b6c))
* ドメインサービスを追加 ([9c15c29](https://github.com/atsushi-h/SubsQ/commit/9c15c29d98cf90fd7e3f4f1c0dfc1791bf69ff23))
* ドメインのエンティティを追加 ([51de119](https://github.com/atsushi-h/SubsQ/commit/51de11932e259103a89f4ac3b261345afa7d16ec))
* ファビコンとアプリアイコンを更新 ([b31b2f2](https://github.com/atsushi-h/SubsQ/commit/b31b2f21043f36f15a6725131094eb8123168819))
* フッターと公開ページレイアウトを実装 ([#79](https://github.com/atsushi-h/SubsQ/issues/79)) ([2ba7296](https://github.com/atsushi-h/SubsQ/commit/2ba7296b0c5438d372a28c908ef5a13d134fdf4d))
* ヘッダーにロゴとナビゲーションを追加 ([#75](https://github.com/atsushi-h/SubsQ/issues/75)) ([f24ff74](https://github.com/atsushi-h/SubsQ/commit/f24ff748711e1646607532783d5d4e7819dbca4b))
* ユーザーアカウント削除APIを実装 ([#28](https://github.com/atsushi-h/SubsQ/issues/28)) ([bac597b](https://github.com/atsushi-h/SubsQ/commit/bac597b733f5da88d2b070643ddc8ee66c7a235d))
* リポジトリインターフェースを追加 ([8ec304f](https://github.com/atsushi-h/SubsQ/commit/8ec304f163657adbccd5631cd5108ee5848c9ddd))
* ローカル環境のDBでログイン処理完了まで ([d54b1b5](https://github.com/atsushi-h/SubsQ/commit/d54b1b59dd0869a078e64a4ac8d5807b54538389))
* ログインページ用のUIを追加 ([1b434b3](https://github.com/atsushi-h/SubsQ/commit/1b434b39df9dea186277062ea78d0481a28819b2))
* 支払い方法管理機能の実装 ([#52](https://github.com/atsushi-h/SubsQ/issues/52)) ([2756ea7](https://github.com/atsushi-h/SubsQ/commit/2756ea7762e9eca585b0408e3a2345912869523c))
* 設定ページの退会機能を実装 ([#91](https://github.com/atsushi-h/SubsQ/issues/91)) ([18cdc2b](https://github.com/atsushi-h/SubsQ/commit/18cdc2b3ccc28282b4c0850290168fa43b133256))
* 設定ページを実装 ([#80](https://github.com/atsushi-h/SubsQ/issues/80)) ([cdc05a0](https://github.com/atsushi-h/SubsQ/commit/cdc05a0f2514e42400642ab036c78bb4cd3f4714))


### Bug Fixes

* Docker Build時の環境変数バリデーションエラー修正 ([0a2bf36](https://github.com/atsushi-h/SubsQ/commit/0a2bf3679f1f0067aa48b1021595a1937a193587))
* Dockerビルド時に必要な環境変数を追加 ([7249017](https://github.com/atsushi-h/SubsQ/commit/72490177c6125fe77a49fe5ce1728a8f989d8ec6))
* サブスクリプション作成時のZodValidationエラーを修正 ([68153ed](https://github.com/atsushi-h/SubsQ/commit/68153ed9677c31ce2fd596919eaa24619bba2228))
* ログイン画面の文言をワイヤーフレーム仕様に修正 ([94ba94e](https://github.com/atsushi-h/SubsQ/commit/94ba94e574b7e6d5a1077dbacf6dc5e169618e5a))
* 不要なスペースを削除 ([6a0945c](https://github.com/atsushi-h/SubsQ/commit/6a0945c516ea71518823fbc8dee5deb57fc84312))
