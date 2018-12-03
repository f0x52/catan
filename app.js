let express = require("express")
let http = require("http")
let websocket = require("ws")
let createLobby = require("./server/lobby")

let port = process.argv[2]
let app = express()

app.use(express.static('public'))

app.use("/", function(req, res) {
  res.sendFile("public/game.html", {
    root: "./"
  })
})

let server = http.createServer(app)

const wss = new websocket.Server({
  server
})

let lobbies = []

wss.on("connection", function(ws) {
  let lobby
  let index = lobbies.length

  let lastLobby = lobbies[lobbies.length-1]

  if (lobbies.length > 0 && !lastLobby.started && lastLobby.players.length < 4) {
    lobby = lastLobby
    index--
  } else {
    lobby = createLobby()
  }

  let player = {
    socket: ws,
    ready: false,
    color: lobby.colors[lobby.players.length]
  }

  lobby.players.push(player)

  lobbies[index] = lobby

  ws.send(JSON.stringify(stripSockets(lobby)))

  ws.on("message", function incoming(message) {
    console.log("[LOG] " + message)
  })
})

function stripSockets(lobby) {
  delete lobby.players
  return lobby
}

server.listen(port)
