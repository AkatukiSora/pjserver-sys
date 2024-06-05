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
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  Interaction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
//discord.jsの型定義を追加
declare module "discord.js" {
  interface Client {
    commands: Collection<string, MyCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}

interface MyCommand {
  data: SlashCommandBuilder;
  cooldown: number;
  name: string;
  Description: string;
  execute: (interaction: Interaction) => Promise<void>;
}
//discord clientを設定
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
client.commands = new Collection<string, MyCommand>();
client.cooldowns = new Collection<string, Collection<string, number>>();

//ファイル分けされたモジュールをロード
import welcomeimage from "./functions/welcomeimage";
import processInteraction from "./interaction";
//import isBotOwner from "./functions/isBotOwner.js"

// commandsフォルダから、.jsで終わるファイルのみを取得
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: string) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // 取得した.jsファイル内の情報から、コマンドと名前をListenner-botに対して設定
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    logger.warn(`${filePath}に"data" または"execute" がありません。`);
  }
}
//interactionしたときに実行

client.on(Events.InteractionCreate, async (interaction) => {
  processInteraction(interaction);
});

//welcome画像の生成と送信

client.on("guildMemberAdd", async (member) => {
  const attachment = new AttachmentBuilder(
    await welcomeimage(
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
    logger.error("指定されたチャンネルがテキストチャンネルではありません");
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

//環境が設定されているならそのままサーバーを実行
if (
  process.env.mode == "0" ||
  process.env.mode == "1" ||
  process.env.mode == "2"
) {
  logger.info(`mode: ${process.env.mode}`);
  client.login(process.env.token);
} else {
  logger.fatal("実行環境が指定されていないか不正です");
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
  } catch (e) {
    logger.error(e);
  }
  setTimeout(process.exit, 1000, 1);
});
