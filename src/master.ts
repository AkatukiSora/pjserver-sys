//envのロード
require("dotenv").config();
//log4jsをロード
const logger = require("./logger");
//fs,pathのロード
import fs from "node:fs";
import path from "node:path";
//Discord.jsをロード
import {
  Client,
  Collection,
  CommandInteraction,
  Events,
  GatewayIntentBits,
} from "discord.js";
const client: any = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.cooldowns = new Collection();

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
    logger.warn(`${filePath}に\"data\" または\"execute\" がありません。`);
  }
}

client.on(Events.InteractionCreate, async (interaction: any) => {
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
      logger.trace(`コマンドの実行を拒否 クールダウン中\nユーザー ${interaction.user.tag}:${interaction.user.id}\nコマンド ${command.data.name}`)
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      return interaction.reply({ content: `\`${command.data.name}\`はクールダウン中です。\n 次に実行できるようになるのは <t:${expiredTimestamp}:R> です`, ephemeral: true });
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
      client.channels.cache.get(interaction.channelId).send({
        embeds: [
          {
            title: "エラー",
            description: "コマンドの実行中にエラーが発生しました",
            color: 0xff0000,
            footer: {
              text: `/${interaction.commandName}`,
            },
          },
        ],
      });
    }
  }
});

//Ready
client.once(Events.ClientReady, (client: Client) => {
  if (client.user) {
    logger.info(`ログイン成功 User=${client.user.tag}`);
    client.user.setActivity("多分正常稼働中")
  } else {
    logger.error(`ログイン失敗`);
  }
});

client.login(process.env.token);
