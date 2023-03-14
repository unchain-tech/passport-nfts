# ドキュメント

## はじめに
このドキュメントでは、アプリケーションの機能とその使用方法について説明します。

### 使用するイーサリアムネットワークについて
Polygon Mumbaiネットワークを例として用いています。

## 機能
アプリケーションには以下の機能があります。
- MetaMaskウォレットとの接続
- プロジェクトの追加
- 複数のアカウントにNFTを発行
- アカウントのNFT発行状況を`AVAILABLE`に変更
- ADMINロールを持つアカウントは、別のアカウントに対しCONTROLLERロールを付与することができる

## 使用方法

### 1. 環境構築

アプリケーションのデプロイメントには、以下のものが必要です。インストール方法については、それぞれのリンク先を参照してください。

- [Node.js](https://hardhat.org/tutorial/setting-up-the-environment) >= 16.0
- [Yarn](https://chore-update--yarnpkg.netlify.app/ja/docs/install)
- [MetaMask](https://metamask.io/download/)

### 2. コントラクトの構築

#### 2-1. プロジェクトコントラクトの作成
---

`packages/contract/contracts/projects/`下には、既にリリース済みの学習コンテンツのコントラクトが格納されています。

新たに学習コンテンツをリリースする際には、このディレクトリに対応するコントラクトを追加する必要があります。

以下のルールに従って、コントラクトを追加します。
- ファイル名、コントラクト名はメタデータに合わせる(単語の区切りはアンダーバーを使用する)
- `IProject.sol`を継承すること
- トークンのメタデータを設定すること

メタデータは、コントラクトの`initialize`関数内で設定されます。

`_projectName`と`_passportHash`の値を、設定してください。

```javascript
function initialize() public initializer {
  // Setup token
  _tokenName = 'UNCHAIN Passport';
  _tokenSymbol = 'CHAIPASS';
  _tokenDescription = 'Immutable and permanent proof of your UNCHAIN project completion.';
  // === TODO: 以下の2つの変数をプロジェクトに応じて設定する ===
  _projectName = 'ETH dApp';
  _passportHash = 'QmXk3kdRvV6TV9yZvtZPgKHoYmywnURy3Qhs8Bjo5szg1J';
  // ===

  __ERC721_init(_tokenName, _tokenSymbol);
}
```

#### 2-2. 単体テストを追加する
---

`contract/test/projects/`下に、2-1.で作成したコントラクトのテストスクリプトを追加します。テスト内容は、他のプロジェクトのテストを参考にしてください。

ファイル名は、通し番号として先頭にメタデータの`project_id`をつけます。

テストスクリプトを作成したら、テストを実行します。

```bash
npx hardhat test test/projects/<テストスクリプト名>
```

(実行例)

```bash
$ npx hardhat test test/projects/101.ETH_dApp.test.ts


  ETH_dApp
    getProjectName
      ✔ return project name (1459ms)
    getPassportHash
      ✔ return passportHash
    getUserMintStatus
      ✔ return default status 'UNAVAILABLE' of the learner
    changeStatusToUnavailable
      ✔ change learner's mint status to UNAVAILABLE
    changeStatusToAvailable
      ✔ change learner's mint status to AVAILABLE
    changeStatusToDone
      ✔ change learner's mint status to DONE
    mint
      when learner's mint status is AVAILABLE
        ✔ emit a NewTokenMinted event (43ms)
      when learner's mint status is UNAVAILABLE
        ✔ reverts
      when learner's mint status is DONE
        ✔ reverts
    mintByAdmin
      ✔ emit a NewTokenMinted event
    tokenURI
      ✔ should get a token URI (41ms)


  11 passing (2s)
```

全てのテストを通過した場合は、`test/0.integrated.test.ts`ファイルに`require`文を追加してください。

#### 2-3. デプロイスクリプトの作成

`contract/scripts/projects`ディレクトに、作成したコントラクトのデプロイスクリプトを追加します。スクリプトの内容は、他のプロジェクトを参考にしてください。

#### 2-4. .envファイルの作成
---

⚠️ アカウントの秘密鍵を設定するため、.env ファイルは他者と共有したり、外部へ公開したりしないでください。

まずは、 `packages/contract`ディレクトリ内にある `.env.example` ファイルを複製して、`.env` ファイルを作成します。

(`.env`ファイル)

```bash
ETHERSCAN_API_KEY=ABC123ABC123ABC123ABC123ABC123ABC1
API_URL=<YOUR_API_URL>
PRIVATE_KEY=<YOUR_PRIVATE_KEY>
```

次に、API_URLを設定します。

Alchemy にログインし、Dashboard上の 「 ＋ CREATE APP 」 をクリックします。

・NAME : 任意の値

・DESCRIPTION : 任意の値

・CHAIN ： `Polygon`

・NETWORK : `Polygon Mumbai`

を設定し、「 **CREATE APP** 」をクリックします。

![](images/alchemy_01.png)

ダッシュボードに、作成した内容が追加されるので、「 **VIEW KEY** 」をクリックします。

![](images/alchemy_02.png)

`HTTPS`をクリップボードにコピーします。

![](images/alchemy_03.png)

コピーしたURLで、.env ファイルの API_URLの値を上書きします。

最後にPRIVATE_KEYを設定します。

#### 2-5. MetaMaskネットワークの設定
---

「 **Add network** 」 > 「 **Add a network manually** 」と進み、以下の画像のようにネットワークの設定を行います。

`New RPC URL`の部分には、先ほどAlchemyから取得したURL（.envファイルの`API_URL`）を設定してください。

![](images/metamask_01.png)

「 **Save** 」ボタンを押し、`Mumbai`ネットワークが選択されていることを確認しましょう。

![](images/metamask_02.png)

Mumbaiネットワーク用のトークンは、以下のURLから取得することができます（2 Mumbai MATIC/day）。

https://mumbaifaucet.com/

#### 2-6. コントラクトのデプロイ
---

コントラクトを**Mumbai**ネットワークへデプロイします。

##### 1. ProjectControllerコントラクトのデプロイ

以下のコマンドを実行してください。

```bash
npx hardhat run --network mumbai scripts/deployController.ts
```

(実行例)

```bash
$ npx hardhat run --network mumbai scripts/deployController.ts

deployController.ts
ProjectController upgraded to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

`ProjectController upgraded to:`以降に出力されたアドレスは、3-1. .env.localファイルの作成」で使用します。

##### 2. 各プロジェクトコントラクトのデプロイ

以下のコマンドを実行してください

```bash
npx hardhat run --network mumbai scripts/projects/<デプロイスクリプト名>
```

(実行例)

```bash
$ npx hardhat run --network mumbai scripts/projects/101.ETH_dApp.test.ts

ETH_dApp upgraded to: 0xebaD4Ce099cd1BFffE3C7aF59ACc4E03D4626afD
```

`<コントラクト名> upgraded to:`以降に出力されたアドレスは、「4. 操作 - プロジェクトの追加」で使用します。

### 3. クライアントアプリケーションの起動

#### 3-1. .env.localファイルの作成
---

`packages/client`ディレクトリ下に存在する `.env.example` ファイルを複製して、 `.env.local` ファイルを作成します。

「2-6-1. ProjectControllerコントラクトのデプロイ」で出力されたコントラクトのアドレスを、`NEXT_PUBLIC_CONTRACT_ADDRESS`の値に設定します。

（例）
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

#### 3-2. 起動
---

クライアントの開発サーバーを起動します。

```bash
yarn client:dev
```

### 4. 操作

- MetaMaskウォレットとの接続
- プロジェクトの追加
- 複数のアカウントにNFTを発行
- アカウントのNFT発行状況を`AVAILABLE`に変更
- ADMINロールを持つアカウントは、別のアカウントに対しCONTROLLERロールを付与することができる

#### MetaMaskウォレットとの接続
---

アプリケーションにMetaMaskウォレットを接続する操作です。

接続できるのは、`ADMIN`ロールまたは`CONTROLLER`ロールを持つアカウントアドレスのみとなります。

https://localhost:3000 にアクセスをします。

![](images/page_connect_wallet.png)

「 **Connect Wallet** 」ボタンを押して、接続したいアカウントを1つ選択して接続をします。

![](images/connect_wallet_01.png)

接続が完了したら、自動で https://localhost:3000/controller へリダイレクトします。

#### プロジェクトの追加
---

「2-6.2」でデプロイをした学習コンテンツのコントラクトアドレスを、**ProjectController**コントラクトに追加する操作です。

右下のラジオボタン「 **Add Project Mode** 」を選択します。

![](images/add_project_01.png)

表示されたフォームに、追加したいプロジェクトのコントラクトアドレスを入力します。

「 **Add Project** 」ボタンを押すと、MetaMaskへリダイレクョション（または通知）が発生します。トランザクションの内容に問題がなければ「 **Confirm** 」を選択します。

![](images/add_project_02.png)

処理が完了したことを確認できたら、ページをリロードしてください。NFT画像一覧に、追加したプロジェクトのNFT画像が追加されていたら完了です。

![](images/add_project_03.png)

#### 複数のアカウントにNFTを発行
---
CSVファイルをアップロードし、複数のアドレスにNFTを発行する操作です。

##### CSVファイルの準備
---

- 項目は、 `project`と`address`の2項目にしてください
- `project`には、プロジェクト名（メタデータ一覧は[こちら](https://github.com/unchain-tech/UNCHAIN-projects/tree/main/public/metadata)を参照）を指定してください
- `address`には、NFTを受け取るアドレスを指定してください

（例）
![](images/csv_01.png)

右下のラジオボタン「 **Mint NFT Mode** 」を選択します。

![](images/multiple_mint_01.png)

「 **Choose File** 」ボタンを押し、CSVファイルをアップロードします。

![](images/multiple_mint_02.png)

「 **Mint NFT** 」ボタンを押して、トランザクションの承認をします。

#### CONTROLLERロールを付与
---

アカウントアドレスに対し、`CONTROLLER`ロールを付与する操作です。これは、**`ADMIN`ロールを所有する（ProjectControllerをデプロイした）アカウントのみが実行できる機能**になります。

右下のラジオボタン「 **Add Controller Mode** 」を選択します。

![](images/add_controller_01.png)


表示されたフォームに、`CONTROLLER`ロールを付与したいアカウントアドレスを入力します。

「 **Add Controller** 」ボタンを押して、トランザクションの承認をします。

#### NFT発行状況を`AVAILABLE`に変更
---

指定したアカウントアドレスのMintステータスを`AVAILABLE`にする操作です。

右下のラジオボタン「 **Grant Mint-Role Mode** 」を選択します。

![](images/grant_mint_01.png)

表示されたフォームに対し、左から順に操作を行います。
- プロジェクト名の選択
- アカウントアドレスの入力
- 「 **Add Address** 」ボタンを押して入力した内容を追加

プロジェクト名とアカウントアドレスのペアを追加し終えたら「 **Grant Mint-Role** 」ボタンを押して、トランザクションの承認をします。

#### NFTの取得状況を確認
---

各プロジェクトのNFT取得状況を確認する操作です。MetaMaskウォレットを接続しているアカウントアドレスのNFT取得状況が確認できます。

http://localhost:3000/minter にアクセスをします。

ProjectControllerコントラクトに追加しているプロジェクトの、NFT画像一覧が表示されます。

![](images/page_minter.png)

取得状況は3種類で表現されます。

1. まだプロジェクトをクリアしていない：「赤で`not cleared`」
2. クリアしてNFTの発行ができる
3. 既にNFTが発行されている：「緑で`already minted`」

#### `AVAILABLE`のNFTを自身で発行
---

http://localhost:3000/minter にアクセスをします。

NFT画像をクリックし、トランザクションの承認をします。

![](images/mint_01.png)

処理が完了したことを確認できたら、ページをリロードしてください。

![](images/mint_02.png)

NFTが発行されると、ステータスは「 already minted 」に変わります。

![](images/mint_03.png)