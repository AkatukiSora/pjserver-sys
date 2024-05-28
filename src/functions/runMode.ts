export default function () {
  switch (process.env.mode) {
    case "1":
      return "メイン環境";
    case "2":
      return "スタンバイ環境";
    case "0":
      return "開発環境";
    default:
      return "不明";
  }
}
