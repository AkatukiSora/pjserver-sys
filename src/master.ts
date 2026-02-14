import { bootstrap } from "./bootstrap.js";
import logger from "./logger.js";

bootstrap().catch((error) => {
  logger.fatal("起動処理中に致命的なエラーが発生しました。", error);
  process.exit(1);
});
