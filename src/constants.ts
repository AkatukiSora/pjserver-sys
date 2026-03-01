export const communityName = "プロセカ民営公園";
export const welcomeGuideChannelID = "942837557807419482";

export function createWelcomeDescription(
  userID: string,
  guideChannelID: string = welcomeGuideChannelID,
): string {
  return `ようこそ！<@${userID}>さん！\n\n※サーバーガイドはチャンネル一覧の一番上にあります\n\nサーバーガイドに従ってやるべきことを片付けましょう\n特に <#${guideChannelID}> で挨拶をすることはコミュニティになじむ第一歩です\n気楽にいきましょう`;
}
