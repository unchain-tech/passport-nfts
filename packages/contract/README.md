# Contract

## 構成
---
```bash
contracts/
├── ProjectsController.sol
└── projects/
```

#### `ProjectsController.sol`
各プロジェクトのコントラクトを管理します. 

`client`はこのコントラクトのメソッドを呼び出すことで, 権限の付与・Mintステータスの変更・Mintなど全ての操作を行います.

#### `projects/`
各プロジェクトのコントラクトを格納しています.

## 単体テスト
---

### 構成

``` bash
test/
├── 0.integrated.test.ts
├── 1.AccessControl.test.ts
├── 2.ProjectsController.test.ts
└── projects/
```

#### `0.integrated.test.ts`
`test/`下にある, 全てのテストファイルを読み込んでいます. 後述の単体テストでは, こちらのファイルを実行するようにあらかじめ設定されています(`package.json`ファイルを参照).

#### `1.AccessControl.test.ts`
AccessControlに関する単体テストを記述しています.

#### `2.ProjectsController.test.ts`
ProjectControllerコントラクトの単体テストを記述しています.

#### `projects/`
各プロジェクトの単体テストを格納しています.

### 実行方法

以下のいづれかのコマンドを実行してください。

- `/UNCHAIN-passport-V2/`（本プロジェクト）階層下：
```bash
yarn test
```

- `/packages/contract/` 階層下：
```bash
npx hardhat test
```

期待される出力（`yarn test`の場合）
```bash
$ yarn test

yarn run v1.22.19
$ yarn workspace contract test
$ npx hardhat test test/0.integrated.test.ts

# === 単体テストの結果出力 ===

  285 passing (8s)

✨  Done in 10.01s.
```