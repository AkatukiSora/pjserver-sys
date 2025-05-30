/**
 * 環境変数 `process.env.mode` に基づいて、現在の実行環境の名称を返します。
 *
 * @returns {string} 現在の実行環境の名称（例: "メイン環境", "開発環境"）。
 *                   `mode` が未設定または不正な場合は "不明" を返します。
 */
export default function runMode(): string {
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
