//envのロード
require("dotenv").config();
//log4jsをロード
import logger from "./logger";
//fs,pathのロード
import fs from "node:fs";
import path from "node:path";
//Discord.jsをロード
import {
  AttachmentBuilder,
  Client,
  Collection,
  CommandInteraction,
  CommandOptionSubOptionResolvableType,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  GuildMember,
  Interaction,
  SlashCommandAttachmentOption,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
class MyClient extends Client {
  commands: Collection<string, MyCommand> = new Collection();
  cooldowns: Collection<string, Collection<string, number>> = new Collection();
}

const client = new MyClient({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection<string, MyCommand>();
client.cooldowns = new Collection<string, Collection<string, number>>();

import * as functions from "./functions";
import { Channel } from "node:diagnostics_channel";

// commandsフォルダから、.jsで終わるファイルのみを取得
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: string) => file.endsWith(".js"));

interface MyCommand {
  data: SlashCommandBuilder;
  cooldown: number;
  name: string;
  Description: string;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = import(filePath) as unknown as MyCommand;
  // 取得した.jsファイル内の情報から、コマンドと名前をListenner-botに対して設定
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    logger.warn(`${filePath}に"data" または"execute" がありません。`);
  }
}

//interactionしたときに実行
/*interface MyCommandInteraction extends Interaction{
  commands: Collection<string, MyCommand>
}*/
client.on(Events.InteractionCreate, async (interaction) => {
  // コマンドでなかった場合
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  const { cooldowns } = interaction.client;

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;
  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      logger.trace(
        `コマンドの実行を拒否 クールダウン中\nユーザー ${interaction.user.tag}:${interaction.user.id}\nコマンド ${command.data.name}`,
      );
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      return interaction.reply({
        content: `\`${command.data.name}\`はクールダウン中です。\n 次に実行できるようになるのは <t:${expiredTimestamp}:R> です`,
        ephemeral: true,
      });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  // 一致するコマンドがなかった場合
  if (!command) {
    logger.warn(`存在しないコマンドを参照${interaction.commandName}`);
    interaction.reply({
      embeds: [
        {
          title: "エラー",
          description: `${interaction.commandName}というコマンド存在しません`,
          color: 0xff0000,
        },
      ],
    });
    return;
  }

  try {
    // コマンドを実行
    await command.execute(interaction);
  } catch (error) {
    logger.error(error);
    try {
      await interaction.reply({
        embeds: [
          {
            title: "エラー",
            description: "コマンドの実行中にエラーが発生しました",
          },
        ],
      });
    } catch (error) {
      logger.error(error);
    }
  }
});

//welcome画像の生成と送信

client.on("guildMemberAdd", async (member: GuildMember) => {
  const attachment = new AttachmentBuilder(
    await functions.welcomeimage(
      member.user.displayName,
      member.user.displayAvatarURL({ extension: "png" }),
    ),
  ).setName("welcome-image.png");
  const embed = new EmbedBuilder()
    .setTitle("welcome to プロセカ民営公園")
    .setImage("attachment://welcome-image.png")
    .setDescription(
      `ようこそ！<@${member.user.id}>さん！\n\n※サーバーガイドはチャンネル一覧の一番上にあります\n\nサーバーガイドに従ってやるべきことを片付けましょう\n特に <#942837557807419482> で挨拶をすることはコミュニティになじむ第一歩です\n気楽にいきましょう`,
    );
  const targetChannel = member.guild.channels.cache.get("853904783000469535");
  if (targetChannel instanceof TextChannel) {
    if (targetChannel) {
      await targetChannel.send({
        content: `<@${member.user.id}>`,
        embeds: [embed],
        files: [attachment],
      });
    } else {
      logger.error("welcomeチャンネルが見つかりませんでした");
    }
  } else {
    console.error("指定されたチャンネルがテキストチャンネルではありません");
  }
});

//Ready
client.once(Events.ClientReady, (client: Client) => {
  if (client.user) {
    logger.info(`ログイン成功 User=${client.user.tag}`);
    client.user.setActivity("多分正常稼働中");
  } else {
    logger.fatal(`ログイン失敗`);
    process.exit(1);
  }
});

try {
  client.login(process.env.token);
} catch (error) {
  logger.fatal(error);
  process.exit(1);
}

//エラーログ
client.on(Events.Warn, (warn: string) => {
  logger.warn(warn);
});
client.on(Events.Error, (error: Error) => {
  logger.error(error);
});
process.on("uncaughtException", (err, origin) => {
  logger.fatal(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
  try {
    client.destroy();
  } catch (e) {}
  setTimeout(process.exit, 1000, 1);
});

let test = "aaa";
if ((test = "a")) {
  console.log(test);
}
