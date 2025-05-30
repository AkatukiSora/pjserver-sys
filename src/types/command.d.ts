import { SlashCommandBuilder, CommandInteraction } from "discord.js";

/**
 * Discordスラッシュコマンドの構造を定義するインターフェース。
 * 各コマンドは `data` (コマンドのメタデータ) と `execute` (コマンド実行ロジック) を持ちます。
 */
export interface Command {
  /**
   * Discord APIに登録するためのスラッシュコマンドビルダー。
   * コマンド名、説明、オプションなどが含まれます。
   */
  data: SlashCommandBuilder;
  /**
   * コマンドが実行されたときに呼び出される非同期関数。
   * Discordからのインタラクションオブジェクトを引数にとります。
   * @param interaction - コマンドインタラクションオブジェクト。
   */
  execute: (interaction: CommandInteraction) => Promise<void>;
}
