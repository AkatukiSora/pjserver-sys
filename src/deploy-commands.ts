//envのロード
import "dotenv/config";
import {
  REST,
  Routes,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
} from "discord.js";
import logger from "./logger.js";
import pingCommand from "./commands/ping.js";
import restartCommand from "./commands/restart.js";
import testCommand from "./commands/test.js";
import { Command } from "./types/command.js"; // Commandインターフェースをインポート

// 環境変数のロード
// .envファイルから環境変数を読み込みます。
// Discord Botのトークン、クライアントID、ギルドIDなどが含まれます。

// 環境変数 `token` の存在チェック
// Botの認証に必要なトークンが設定されていない場合、エラーをログに出力しプロセスを終了します。
if (!process.env.token) {
  logger.error("No token provided in environment variables.");
  process.exit(1);
}

// Discord APIに登録するコマンドの配列
const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
// 各コマンドモジュールのインポート
const commandModules: Command[] = [pingCommand, restartCommand, testCommand];

// 各コマンドモジュールのデータをJSON形式に変換し、デプロイ対象の配列に追加
// Discord APIにコマンドを登録するために必要な形式に整形します。
for (const command of commandModules) {
  commands.push(command.data.toJSON());
}

// Discord REST APIクライアントの初期化
// Discord APIとの通信を行うためのクライアントを設定し、Botのトークンをセットします。
const rest = new REST({ version: "10" }).setToken(process.env.token);

// コマンドのデプロイ処理を実行
// 即時実行関数として定義し、非同期処理でコマンドをDiscordに登録します。
(async () => {
  // 環境変数 `clientID` および `guildID` の存在チェック
  // コマンドを特定のギルドにデプロイするために必要なIDが設定されているか確認します。
  if (!process.env.clientID || !process.env.guildID) {
    logger.error(
      "Missing clientID or guildID in environment variables. Please set them.",
    );
    process.exit(1);
  }
  try {
    logger.info(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    // Discord APIへのコマンド登録リクエスト
    // `put` メソッドを使用して、現在のギルドに登録されているすべてのコマンドを更新します。
    // これにより、以前に登録されたコマンドは削除され、`commands` 配列内のコマンドのみが登録されます。
    const data = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.clientID,
        process.env.guildID,
      ),
      { body: commands },
    )) as RESTPutAPIApplicationCommandsResult;

    // APIレスポンスの検証
    // レスポンスが配列でない場合や、空の配列である場合はエラーまたは警告をログに出力します。
    if (!Array.isArray(data)) {
      logger.error("The response from the API is not an array.");
      process.exit(1);
    }
    if (data.length === 0) {
      logger.warn(
        "No commands were deployed. Please check your command definitions.",
      );
      process.exit(1);
    }

    logger.info(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // エラーハンドリング
    // コマンドデプロイ中に発生したエラーをキャッチし、ログに出力します。
    logger.error(error);
  }
})();
