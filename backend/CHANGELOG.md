# Changelog

## 1.0.0 (2026-03-13)


### Features

* **backend:** DB操作にトランザクション保護を導入する ([#168](https://github.com/atsushi-h/SubsQ/issues/168)) ([1307072](https://github.com/atsushi-h/SubsQ/commit/1307072886425d1308fd4c760462c1ad7c547751))
* **backend:** Goバックエンド基盤フェーズを実装 ([#158](https://github.com/atsushi-h/SubsQ/issues/158)) ([92cc444](https://github.com/atsushi-h/SubsQ/commit/92cc44469e2b071e1411d4dd30e5bde68770ce67))
* **backend:** oapi-codegen生成ServerInterfaceをGoバックエンドに統合する ([#165](https://github.com/atsushi-h/SubsQ/issues/165)) ([9ebfd43](https://github.com/atsushi-h/SubsQ/commit/9ebfd432442b3d134d0116b0b82124fa937a16ea))
* **backend:** グレイスフルシャットダウンを実装する ([#170](https://github.com/atsushi-h/SubsQ/issues/170)) ([e53385d](https://github.com/atsushi-h/SubsQ/commit/e53385dbec82e479687a6385438fb53e5574a1b4))
* **backend:** サブスクリプションCRUD APIを実装する ([#162](https://github.com/atsushi-h/SubsQ/issues/162)) ([646411e](https://github.com/atsushi-h/SubsQ/commit/646411e5cd9d00fcc27e01921fc30a60721ab400))
* **backend:** ビルド時にバージョン情報をバイナリへ注入する ([#190](https://github.com/atsushi-h/SubsQ/issues/190)) ([8dde981](https://github.com/atsushi-h/SubsQ/commit/8dde9815372dabff406171401252f7b0ead1a937))
* **backend:** ユーザーアカウント削除APIを実装する ([#166](https://github.com/atsushi-h/SubsQ/issues/166)) ([8a44dcd](https://github.com/atsushi-h/SubsQ/commit/8a44dcd956336f76ebd354623b383a6ad7c65d11))
* **backend:** 支払い方法CRUD APIを実装する ([#161](https://github.com/atsushi-h/SubsQ/issues/161)) ([b253582](https://github.com/atsushi-h/SubsQ/commit/b253582a124b62a1bf745be7e6b506064b1f353e))
* GoバックエンドのHello Worldサーバーとデプロイ設定を追加 ([#155](https://github.com/atsushi-h/SubsQ/issues/155)) ([329aa28](https://github.com/atsushi-h/SubsQ/commit/329aa281db8f56d1e6e5b9e96a5d67ff7dd27a7b))
* **user:** PATCH /api/v1/users/me エンドポイントを実装する ([#196](https://github.com/atsushi-h/SubsQ/issues/196)) ([2f49740](https://github.com/atsushi-h/SubsQ/commit/2f4974069b91ef786ad3b7448da908bcf25d1803))


### Bug Fixes

* **ci:** バックエンドDockerビルドエラーを修正 ([#189](https://github.com/atsushi-h/SubsQ/issues/189)) ([4e80975](https://github.com/atsushi-h/SubsQ/commit/4e80975ede14fe0aa0f1feef9f69c3ccf057c54b))
* DockerfileのGoイメージタグを golang:1.26.0-alpine3.23 に修正 ([f000996](https://github.com/atsushi-h/SubsQ/commit/f000996084922110ba75e508e457f9b132a294ba))
* **release:** backendのversion.txtをrelease-pleaseの管理下に追加 ([2dc3f6a](https://github.com/atsushi-h/SubsQ/commit/2dc3f6a8a05708abf835710fae2e45e55ff94757))
