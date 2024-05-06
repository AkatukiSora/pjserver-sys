exports.isBotOwner = function(userID:string) {
    return userID == require("./config.json").botOwnerID
}
