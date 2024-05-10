//envのロード
require("dotenv").config();
import { REST, Routes } from "discord.js";
import fs from "node:fs";
import logger from "./logger";

const commands = [];
// コマンドファイルを取得
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file: string) => file.endsWith(".js"));

// 各コマンドのデータをjsonにしてデプロイする。
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// restをロード
const rest = new REST({ version: "10" }).setToken(process.env.token as string);
// デプロイ
(async () => {
  try {
    logger.info(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.clientID as string,
        process.env.guildID as string,
      ),
      { body: commands },
    )) as Array<string>;

    logger.info(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    logger.error(error);
  }
})();
