import logger from "./logger.js";
import { Client, Collection, Interaction } from "discord.js";
import type { Command } from "./types/command.js";
import { commands } from "./commands/index.js";
import { safeReply } from "./utils/safe-reply.js";

// コマンドモジュールの配列
const commandModules: Command[] = commands;

/**
 * クライアントにコマンドをロードする関数。
 * 各コマンドモジュールを読み込み、クライアントの `commands` コレクションに登録します。
 * また、クールダウン管理用の `cooldowns` コレクションも初期化します。
 * @param client - Discordクライアントインスタンス。
 */
export function loadCommands(client: Client): void {
  client.commands = new Collection<string, Command>();
  client.cooldowns = new Collection<string, Collection<string, number>>();

  for (const command of commandModules) {
    // コマンドが `data` と `execute` プロパティを持っているか確認
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      logger.warn(`[WARN] コマンドに"data" または"execute" がありません。`);
    }
  }
}

/**
 * Discordインタラクションを処理する非同期関数。
 * スラッシュコマンドの実行、クールダウンの適用、エラーハンドリングを行います。
 * @param interaction - Discordからのインタラクションオブジェクト。
 */
export default async function processInteraction(
  interaction: Interaction,
): Promise<void> {
  // コマンドでなかった場合、またはチャットコマンドでなかった場合は処理を終了
  if (!interaction.isChatInputCommand()) return;

  // 実行するコマンドを取得 (ChatInputCommandInteractionに型ガードされた後なので、commandNameが利用可能)
  const command = interaction.client.commands.get(interaction.commandName);

  // コマンドが見つからない場合は警告をログに出力し、エラーメッセージを返信
  if (!command) {
    logger.warn(`[WARN] 存在しないコマンドを参照: ${interaction.commandName}`);
    await safeReply(interaction, {
      embeds: [
        {
          title: "エラー",
          description: `${interaction.commandName}というコマンドは存在しません。`,
          color: 0xff0000,
        },
      ],
      ephemeral: true, // エラーメッセージは一時的に表示
    });
    return;
  }

  if (command.requiredPermissions?.length) {
    const hasPermissions = interaction.memberPermissions?.has(
      command.requiredPermissions,
    );

    if (!hasPermissions) {
      await safeReply(interaction, {
        embeds: [
          {
            title: "権限エラー",
            description: "このコマンドを実行する権限がありません。",
            color: 0xff0000,
          },
        ],
        ephemeral: true,
      });
      return;
    }
  }

  // クールダウン処理の開始
  const { cooldowns } = interaction.client;

  // コマンドのクールダウン情報がコレクションにない場合、新しく作成
  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection<string, number>());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3; // デフォルトのクールダウン時間（秒）
  // コマンドに設定されたクールダウン時間、またはデフォルトクールダウン時間をミリ秒に変換
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

  // ユーザーがクールダウン中かチェック
  if (timestamps?.has(interaction.user.id)) {
    const tmptimestamp = timestamps.get(interaction.user.id);
    // タイムスタンプが存在しない場合は処理を終了（通常は発生しない）
    if (!tmptimestamp) return;

    const expirationTime = tmptimestamp + cooldownAmount;

    // クールダウン期間がまだ終了していない場合
    if (now < expirationTime) {
      logger.trace(
        `[TRACE] コマンドの実行を拒否 (クールダウン中)\nユーザー: ${interaction.user.tag}:${interaction.user.id}\nコマンド: ${command.data.name}`,
      );
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      // クールダウンメッセージをユーザーに返信
      await safeReply(interaction, {
        content: `\`${command.data.name}\`はクールダウン中です。\n次に実行できるようになるのは <t:${expiredTimestamp}:R> です。`,
        ephemeral: true, // 一時的なメッセージとして表示
      });
      return; // await後にreturnを追加
    }
  }

  // クールダウンをセットし、指定時間後に削除
  timestamps?.set(interaction.user.id, now);
  setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

  try {
    // コマンドを実行
    await command.execute(interaction);
  } catch (error) {
    // コマンド実行中のエラーをキャッチし、ログに出力
    logger.error(`[ERROR] コマンド実行中にエラーが発生しました: ${error}`);
    // ユーザーにエラーメッセージを返信
    try {
      await safeReply(interaction, {
        embeds: [
          {
            title: "エラー",
            description: "コマンドの実行中に予期せぬエラーが発生しました。",
            color: 0xff0000, // エラーを示す赤色
          },
        ],
        ephemeral: true, // エラーメッセージは一時的に表示
      });
    } catch (replyError) {
      // エラーメッセージの返信中にエラーが発生した場合
      logger.error(
        `[ERROR] エラーメッセージの返信中にエラーが発生しました: ${replyError}`,
      );
    }
  }
}
