import {
  Collection,
  SlashCommandBuilder,
  CommandInteraction,
} from "discord.js";

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
    commands: Collection<
      string,
      {
        data: SlashCommandBuilder;
        cooldown?: number;
        execute: (interaction: CommandInteraction) => Promise<void>;
      }
    >;
    /**
     * 各コマンドのクールダウン情報を格納するコレクション。
     * 外側のキーはコマンド名、内側のコレクションのキーはユーザーID、値はタイムスタンプです。
     */
    cooldowns: Collection<string, Collection<string, number>>;
  }
}
