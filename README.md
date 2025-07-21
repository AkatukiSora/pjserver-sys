# プロセカ民営公園 Discord Bot (v2)

古いDiscord.jsベースのBotをdiscordx.jsにリプレイスしたバージョンです。

## 機能

### スラッシュコマンド
- `/ping` - ボットのping測定と実行環境の表示
- `/restart` - ボットの再起動
- `/test` - ウェルカム画像の生成テスト
- `/button` - ボタン操作のテスト

### 自動機能
- **ギルドメンバー参加時の自動ウェルカム** - 新しいメンバーがサーバーに参加すると、カスタムウェルカム画像とメッセージを送信
- **ログ出力** - 全ての動作をlog4jsで詳細にログ出力
- **エラーハンドリング** - 未処理の例外やシグナルハンドリング

## セットアップ

### 1. 依存関係のインストール
```bash
pnpm install
```

### 2. 環境変数の設定
`.env`ファイルを作成し、以下の内容を設定：

```env
# Discord Bot設定
BOT_TOKEN=your_bot_token_here

# Discord アプリケーションID（オプション）
CLIENT_ID=your_client_id_here

# ギルドID（サーバーID）（オプション）
GUILD_ID=your_guild_id_here

# 実行モード設定
# メイン: 1
# スタンバイ: 2  
# 開発環境: 0
MODE=0
```

### 3. ビルド
```bash
pnpm run build
```

### 4. 実行
```bash
# 開発環境での実行
pnpm run dev

# 本番環境での実行
pnpm run start
```

## 環境設定

### 実行モード
- `MODE=0`: 開発環境
- `MODE=1`: メイン環境
- `MODE=2`: スタンバイ環境

### ウェルカムチャンネル
現在、ウェルカムメッセージを送信するチャンネルIDは`853904783000469535`にハードコードされています。
必要に応じて`src/events/common.ts`の`guildMemberAdd`イベント内で変更してください。

## 技術スタック

- **discordx** - Discord.jsのデコレータベースフレームワーク
- **Discord.js v14** - Discord API ライブラリ
- **TypeScript** - 型安全な開発環境
- **@napi-rs/canvas** - ウェルカム画像生成
- **log4js** - 構造化ログ出力
- **dotenv** - 環境変数管理

## 開発

### ディレクトリ構造
```
src/
├── commands/           # スラッシュコマンドとボタンハンドラー
│   ├── slashes.ts     # 基本スラッシュコマンド
│   └── buttons.ts     # ボタンインタラクション
├── events/            # Discordイベントハンドラー
│   └── common.ts      # 基本イベント（ready, guildMemberAdd等）
├── utils/             # ユーティリティ関数
│   ├── logger.ts      # ログ設定
│   ├── runMode.ts     # 実行モード取得
│   └── welcomeimage.ts # ウェルカム画像生成
├── resource/          # 静的リソース
│   ├── Fonts/         # フォントファイル
│   └── png/           # 画像ファイル
└── main.ts            # メインエントリーポイント
```

### 古いバージョンからの移行

このバージョンは古い`old/`ディレクトリにあるDiscord.jsベースのBotの機能を完全に踏襲しており：

- 同じコマンド機能
- 同じウェルカム画像生成機能
- 同じログ機能
- 同じエラーハンドリング
- 同じ環境設定

ただし、より現代的なdiscordx.jsのデコレータベースアーキテクチャを使用してより保守しやすくなっています。

### ウォッチモード（開発用）
```bash
# ファイル変更を監視して自動再起動
pnpm run watch
```

## Docker

DockerとDocker Composeにも対応しています：

```bash
# Docker Composeでの起動
docker-compose up -d

# Docker Composeでの停止
docker-compose down

# ログの確認
docker-compose logs -f
```

## 注意事項

- **コマンドデプロイ**: discordx.jsの`bot.initApplicationCommands()`により自動的にスラッシュコマンドがデプロイされるため、手動でのコマンドデプロイは不要です
- **環境変数**: 本番環境では必ず適切な`MODE`値を設定してください
- **ウェルカムチャンネル**: 現在チャンネルIDがハードコードされているため、必要に応じて設定を変更してください

## 参考リンク

- [discordx.js 公式ドキュメント](https://discordx.js.org)
- [Discord.js v14 ドキュメント](https://discord.js.org/#/docs/discord.js/14.17.3/general/welcome)
