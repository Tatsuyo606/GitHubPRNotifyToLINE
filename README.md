# GitHubPRNotify

GitHub App の PR Webhook を受け取り、LINE に通知するサンプルです。

- GitHub App Webhook
- AWS Lambda + API Gateway
- LINE Messaging API

を TypeScript でつないでいます。

※ AWS Lambda 上での動作を前提としたサンプルです。ローカル実行環境は提供していません。

## 必要なもの

- GitHub アカウント
- GitHub Appsの作成、対象リポジトリへのインストール
- AWS アカウント（Lambda / API Gateway 利用）
- LINE Developers アカウント（Messaging API チャネル）

## 環境変数

Lambdaで、以下の環境変数を使用します。

- `WEBHOOK_SECRET`  
  GitHub App の Webhook secret
- `LINE_CHANNEL_ACCESS_TOKEN`  
  LINE Messaging API のチャネルアクセストークン（長期）
- `LINE_USER_ID`  
  通知を送る LINE ユーザー ID

## 開発・デバッグについて

このリポジトリでは、ローカル環境での Lambda エミュレーションや
ステップ実行によるデバッグは検証していません。

動作確認は次の流れを想定しています。

1. `tsc` でビルドし、`dist/` と `node_modules/` を含めて ZIP を作成
2. Lambda（Node.js 18+）に ZIP をデプロイし、ハンドラーを `dist/index.handler` に設定
3. GitHub App の Webhook をAPI Gatewayに送信し、 Lambda を呼び出し
4. CloudWatch LogsやLineアカウントへの通知送信 で挙動を確認

ローカルでのデバッグ方法が必要な場合は、利用者側で `index.handler` を直接呼び出す
テストスクリプトなどを用意してください（本リポジトリでは提供していません）。

## 詳細なセットアップ手順

GitHub App の作成手順や Lambda / LINE 側の細かい設定は  
以下のブログ記事で解説しています。

[GitHub App Webhook で遊んでみた（PRイベントのLINE通知を作ってみる）](https://zenn.dev/ryun_log/articles/f68bae8a4fa231)