import * as PImage from "pureimage";
import path from "path";
import fetch from "node-fetch";
import { Readable, Writable } from "stream";
import fs from "fs";

function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export default async function (
  userName: string,
  userAvatarURL: string,
): Promise<Buffer> {
  const width = 700;
  const height = 250;

  // Load fonts
  const fontGothicPath = path.resolve(
    __dirname,
    "../resource/Fonts/-pr6n-r.otf",
  );
  const fontRobotoPath = path.resolve(
    __dirname,
    "../resource/Fonts/Roboto-Black.ttf",
  );
  const fontNotoSerifPath = path.resolve(
    __dirname,
    "../resource/Fonts/NotoSerifJP-Black.otf",
  );

  const fontGothic = PImage.registerFont(fontGothicPath, "Gothic");
  const fontRoboto = PImage.registerFont(fontRobotoPath, "Roboto");
  const fontNotoSerif = PImage.registerFont(fontNotoSerifPath, "Noto_Serif");

  await Promise.all([
    fontGothic.load(),
    fontRoboto.load(),
    fontNotoSerif.load(),
  ]);

  // Create image canvas
  const img = PImage.make(width, height);
  const ctx = img.getContext("2d");

  // Load background image
  const backgroundPath = path.resolve(__dirname, "../resource/png/join.png");
  const backgroundBuffer = await fs.promises.readFile(backgroundPath);
  const background = await PImage.decodePNGFromStream(
    bufferToStream(backgroundBuffer),
  );
  ctx.drawImage(background, 0, 0, width, height);

  // Draw border rectangle
  ctx.strokeStyle = "#0099ff";
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, width, height);

  // Draw welcome text
  ctx.fillStyle = "#ffffff";
  ctx.font = "28pt Roboto";
  ctx.fillText("Welcome to the server,", width / 2.5, height / 3.5);

  // Dynamically adjust font size for userName similar to original applyText
  let fontSize = 70;
  ctx.font = `${fontSize}pt Gothic`;
  while (ctx.measureText(userName + "!").width > width - 300 && fontSize > 10) {
    fontSize -= 5;
    ctx.font = `${fontSize}pt Gothic`;
  }
  ctx.fillText(userName + "!", width / 2.5, height / 1.8);

  // Draw circular clipped avatar
  // Load avatar image from URL
  const response = await fetch(userAvatarURL);
  const avatarBuffer = Buffer.from(await response.arrayBuffer());
  const avatarImg = await PImage.decodePNGFromStream(
    bufferToStream(avatarBuffer),
  );

  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  // Draw avatar image inside clipped circle
  ctx.drawImage(avatarImg, 25, 25, 200, 200);

  // Return image buffer as PNG
  // Encode image to buffer using a writable stream to a buffer
  const chunks: Buffer[] = [];
  const writable = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    },
  });
  await PImage.encodePNGToStream(img, writable);
  return Buffer.concat(chunks);
}
