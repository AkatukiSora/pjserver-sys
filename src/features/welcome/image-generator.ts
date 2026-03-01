import { GlobalFonts, createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fetch from "node-fetch";
import logger from "../../logger.js";

export interface WelcomeImageGenerator {
  init(): void;
  generate(userName: string, userAvatarURL: string): Promise<Buffer>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveAssetPath(...segments: string[]): string {
  return path.join(__dirname, "..", "..", "resource", ...segments);
}

export class WelcomeImageService implements WelcomeImageGenerator {
  private initialized = false;

  private readonly fontRobotoPath = resolveAssetPath(
    "Fonts",
    "Roboto-Black.ttf",
  );
  private readonly fontNotoSansPath = resolveAssetPath(
    "Fonts",
    "NotoSansJP-Black.ttf",
  );
  private readonly backgroundPath = resolveAssetPath("png", "join.png");

  init(): void {
    if (this.initialized) {
      return;
    }

    logger.info(`Registering font Roboto from: ${this.fontRobotoPath}`);
    GlobalFonts.registerFromPath(this.fontRobotoPath, "Roboto");
    logger.info(`Registering font Noto_Sans from: ${this.fontNotoSansPath}`);
    GlobalFonts.registerFromPath(this.fontNotoSansPath, "Noto_Sans");

    this.initialized = true;
  }

  async generate(userName: string, userAvatarURL: string): Promise<Buffer> {
    this.init();

    const width = 700;
    const height = 250;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    logger.info(`Loading background image from: ${this.backgroundPath}`);
    try {
      const backgroundBuffer = await fs.readFile(this.backgroundPath);
      logger.debug(
        `Background image bytes length: ${backgroundBuffer.byteLength}`,
      );
      const background = await loadImage(backgroundBuffer);
      ctx.drawImage(background, 0, 0, width, height);
      logger.info("Background image drawn successfully.");
    } catch (error) {
      logger.error(`Error loading or drawing background image: ${error}`);
    }

    ctx.strokeStyle = "#0099ff";
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "28pt Roboto";
    ctx.fillText("Welcome to the server,", width / 2.5, height / 3.5);

    let fontSize = 50;
    ctx.font = `${fontSize}pt Noto_Sans`;
    while (
      ctx.measureText(`${userName}!`).width > width - 300 &&
      fontSize > 10
    ) {
      fontSize -= 5;
      ctx.font = `${fontSize}pt Noto_Sans`;
    }
    ctx.fillText(`${userName}!`, width / 2.5, height / 1.8);

    logger.info(`Fetching avatar from URL: ${userAvatarURL}`);
    try {
      const response = await fetch(userAvatarURL);
      logger.debug(`Avatar fetch response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch avatar: ${response.statusText}`);
      }

      const avatarBuffer = Buffer.from(await response.arrayBuffer());
      logger.debug(`Avatar buffer length: ${avatarBuffer.byteLength}`);
      const avatarImg = await loadImage(avatarBuffer);
      logger.info("Avatar image decoded successfully.");

      ctx.save();
      ctx.beginPath();
      ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, 25, 25, 200, 200);
      logger.info("Avatar image drawn successfully (clipped).");
      ctx.restore();
    } catch (error) {
      logger.error(`Error loading or drawing avatar image: ${error}`);
    }

    return canvas.toBuffer("image/png");
  }
}

export function createWelcomeImageService(): WelcomeImageService {
  return new WelcomeImageService();
}
