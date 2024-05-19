export default function (userID: string): boolean {
  return userID == require("./config.json").botOwnerID;
}
