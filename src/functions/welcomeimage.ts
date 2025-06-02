import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import fetch from "node-fetch";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import logger from "../logger.js"; // ロガーをインポート

// ESM環境での __filename と __dirname の代替
// 現在のファイルのURLからファイルパスとディレクトリパスを生成します。
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// フォントと背景画像のファイルパスを定義
// `path.join` を使用して、OSに依存しないパスを構築します。
const fontRobotoPath = path.join(
  __dirname,
  "..", // src/functions から src へ
  "resource",
  "Fonts",
  "Roboto-Black.ttf",
);
const fontNotoSansPath = path.join(
  __dirname,
  "..", // src/functions から src へ
  "resource",
  "Fonts",
  "NotoSansJP-Black.ttf",
);
const backgroundPath = path.join(
  __dirname,
  "..", // src/functions から src へ
  "resource",
  "png",
  "join.png",
);

// グローバルフォントの登録
// 画像生成に使用するカスタムフォントをシステムに登録します。
logger.info(`Registering font Roboto from: ${fontRobotoPath}`);
GlobalFonts.registerFromPath(fontRobotoPath, "Roboto");
logger.info(`Registering font Noto_Sans from: ${fontNotoSansPath}`);
GlobalFonts.registerFromPath(fontNotoSansPath, "Noto_Sans");

/**
 * ユーザーのウェルカム画像を生成します。
 * 新しいメンバーがDiscordサーバーに参加した際に表示されるカスタム画像を動的に作成します。
 *
 * @param userName - ウェルカム画像に表示するユーザー名。
 * @param userAvatarURL - ユーザーのアバター画像のURL。このURLから画像がフェッチされ、画像に埋め込まれます。
 * @returns 生成された画像のBuffer（PNG形式）。このBufferはDiscordに直接送信できます。
 */
export default async function generateWelcomeImage(
  userName: string,
  userAvatarURL: string,
): Promise<Buffer> {
  const width = 700; // キャンバスの幅
  const height = 250; // キャンバスの高さ

  // 画像キャンバスを作成し、2Dコンテキストを取得
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 背景画像を読み込み、キャンバスに描画
  logger.info(`Loading background image from: ${backgroundPath}`);
  try {
    const backgroundBuffer = await fs.readFile(backgroundPath);
    logger.debug(
      `Background image bytes length: ${backgroundBuffer.byteLength}`,
    );
    const background = await loadImage(backgroundBuffer); // Bufferから直接loadImage
    ctx.drawImage(background, 0, 0, width, height);
    logger.info("Background image drawn successfully.");
  } catch (error) {
    logger.error(`Error loading or drawing background image: ${error}`);
  }

  // キャンバスのボーダーを描画
  ctx.strokeStyle = "#0099ff"; // ボーダーの色
  ctx.lineWidth = 5; // ボーダーの太さ
  ctx.strokeRect(0, 0, width, height); // キャンバス全体にボーダーを描画

  // ウェルカムテキスト「Welcome to the server,」を描画
  ctx.fillStyle = "#ffffff"; // テキストの色
  ctx.font = "28pt Roboto"; // フォントとサイズ
  ctx.fillText("Welcome to the server,", width / 2.5, height / 3.5); // テキストの位置

  // ユーザー名のフォントサイズを動的に調整し、描画
  // ユーザー名が長すぎる場合に、画像からはみ出さないようにフォントサイズを縮小します。
  let fontSize = 50;
  ctx.font = `${fontSize}pt Noto_Sans`;
  while (ctx.measureText(userName + "!").width > width - 300 && fontSize > 10) {
    fontSize -= 5; // 5ptずつフォントサイズを縮小
    ctx.font = `${fontSize}pt Noto_Sans`;
  }
  ctx.fillText(userName + "!", width / 2.5, height / 1.8); // ユーザー名を描画

  // 円形にクリップされたアバターを描画
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

    // 円形のクリッピングパスを作成
    ctx.save(); // 現在のキャンバスの状態を保存
    ctx.beginPath(); // 新しいパスを開始
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true); // 中心 (125, 125)、半径 100 の円
    ctx.closePath(); // パスを閉じる
    ctx.clip(); // このパスで描画をクリップ

    // クリップされた円の中にアバター画像を描画
    ctx.drawImage(avatarImg, 25, 25, 200, 200); // アバター画像を描画
    logger.info("Avatar image drawn successfully (clipped).");
    ctx.restore(); // 保存したキャンバスの状態を復元（クリッピングを解除）
  } catch (error) {
    logger.error(`Error loading or drawing avatar image: ${error}`);
  }

  // 生成された画像をPNG形式のBufferとして返却
  return canvas.toBuffer("image/png");
}
