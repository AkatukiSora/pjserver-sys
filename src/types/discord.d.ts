import { Collection } from "discord.js";
import { Command } from "./command.js";

/**
 * Discord.jsのClientオブジェクトにカスタムプロパティを追加するための型定義。
 * `commands` プロパティが追加されます。
 */
declare module "discord.js" {
  interface Client {
    /**
     * 登録されているスラッシュコマンドを格納するコレクション。
     * キーはコマンド名、値はコマンドオブジェクトです。
     */
    commands: Collection<string, Command>;
  }
}
