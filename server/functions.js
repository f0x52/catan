module.exports = {
   sendUpdatedResources: function(player) {
    let res = {
      action: "update resources",
      resources: player.resources
    }
    player.socket.ssend(res)
  }
}
