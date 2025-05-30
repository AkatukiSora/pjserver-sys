import log4js from "log4js";

/**
 * log4jsロガーの設定を行います。
 * 標準出力に色付きのログを出力するように設定されています。
 */
log4js.configure({
  appenders: {
    // 'out' という名前のアペンダーを定義
    out: {
      type: "stdout", // ログを標準出力（コンソール）に出力
      layout: { type: "colored" }, // ログに色を付けて表示
    },
  },
  categories: {
    // 'default' カテゴリの設定
    default: {
      appenders: ["out"], // 'out' アペンダーを使用
      level: "all", // すべてのレベルのログを出力
    },
  },
});

/**
 * 設定済みのロガーインスタンスをエクスポートします。
 * このロガーを使用して、アプリケーション全体でログを出力できます。
 */
export default log4js.getLogger();
