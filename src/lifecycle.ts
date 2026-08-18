export interface LifecycleDependencies {
  destroy(): void;
  info(message: string): void;
  error(message: string, error?: unknown): void;
  exit(code: number): void;
  on(signal: "SIGTERM", listener: () => void): void;
  on(
    signal: "uncaughtException",
    listener: (error: Error, origin: string) => void,
  ): void;
}

export function registerLifecycleHandlers(deps: LifecycleDependencies): void {
  let stopped = false;
  const shutdown = (code: number, message: string) => {
    if (stopped) return;
    stopped = true;
    try {
      deps.destroy();
      deps.info(message);
    } catch (error) {
      deps.error("[ERROR] サーバー停止処理中にエラーが発生", error);
    }
    deps.exit(code);
  };
  deps.on("SIGTERM", () =>
    shutdown(0, "サーバーを停止します。シグナルによる正常終了処理です。"),
  );
  deps.on("uncaughtException", (error: Error, origin: string) => {
    deps.error(
      `[FATAL] 未処理の例外をキャッチ: ${error.message}\n例外発生元: ${origin}`,
      error,
    );
    shutdown(1, "未処理の例外のため停止します。");
  });
}
