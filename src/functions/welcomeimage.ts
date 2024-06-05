import { Canvas, createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

export default async function (userName: string, userAvatarURL: string) {
  const applyText = (canvas: Canvas, text: string) => {
    const context = canvas.getContext("2d");
    let fontSize = 70;
    do {
      context.font = `${(fontSize -= 5)}px "Gothic"`;
    } while (context.measureText(text).width > canvas.width - 300);
    return context.font;
  };
  //フォントの読み込み
  registerFont(path.resolve("../resource/Fonts/NotoSerifJP-Black.otf"), {
    family: "Noto_Serif",
  });
  registerFont(path.resolve("../resource/Fonts/Roboto-Black.ttf"), {
    family: "Roboto",
  });
  registerFont(path.resolve("../resource/Fonts/-pr6n-r.otf"), {
    family: "Gothic",
  });
  //キャンバスづくり
  const canvas = createCanvas(700, 250);
  const context = canvas.getContext("2d");
  //背景画像の読み込み
  const file_url = "./resource/png/join.png";
  const background = await loadImage(file_url);
  //画像をキャンバスの大きさに引き伸ばし
  context.drawImage(background, 0, 0, canvas.width, canvas.height);
  //境界線の色を指定
  context.strokeStyle = "#0099ff";
  //周りに境界線を引く
  context.strokeRect(0, 0, canvas.width, canvas.height);
  // Slightly smaller text placed above the member's display name
  context.font = '28px "Roboto"';
  context.fillStyle = "#ffffff";
  context.fillText(
    "Welcome to the server,",
    canvas.width / 2.5,
    canvas.height / 3.5,
  );

  // Add an exclamation point here and below
  context.font = applyText(canvas, `${userName}!`);
  context.fillStyle = "#ffffff";
  context.fillText(`${userName}!`, canvas.width / 2.5, canvas.height / 1.8);

  //描画の開始
  context.beginPath();
  //円を作成
  context.arc(125, 125, 100, 0, Math.PI * 2, true);
  //描画の停止
  context.closePath();
  //切り取り
  context.clip();
  //アイコンを読み込み
  const avatar = await loadImage(userAvatarURL);
  //アイコンの描画
  context.drawImage(avatar, 25, 25, 200, 200);
  //画像を返却
  return canvas.toBuffer();
}
