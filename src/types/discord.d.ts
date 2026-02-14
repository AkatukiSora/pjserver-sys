import { Collection } from "discord.js";
import { Command } from "./command.js";

/**
 * Discord.jsのClientオブジェクトにカスタムプロパティを追加するための型定義。
 * `commands` と `cooldowns` プロパティが追加されます。
 */
declare module "discord.js" {
  interface Client {
    /**
     * 登録されているスラッシュコマンドを格納するコレクション。
     * キーはコマンド名、値はコマンドオブジェクトです。
     */
    commands: Collection<string, Command>;
    /**
     * 各コマンドのクールダウン情報を格納するコレクション。
     * 外側のキーはコマンド名、内側のコレクションのキーはユーザーID、値はタイムスタンプです。
     */
    cooldowns: Collection<string, Collection<string, number>>;
  }
}
