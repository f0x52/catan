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
  ws.ssend = function(message) {
    if (this.readyState != 1) {
      return 0
    }
    let json = JSON.stringify(message)
    ws.send(json)
  }
  let lobby
  let index = lobbies.length

  let lastLobby = lobbies[lobbies.length-1]

  if (lobbies.length > 0 && !lastLobby.started && lastLobby.players.length < 4) {
    lobby = lastLobby
    index--
  } else {
    lobby = createLobby()
  }

  let playerID = lobby.players.length

  let player = {
    id: playerID,
    socket: ws,
    ready: false,
    color: lobby.colors[playerID]
  }

  lobby.players.push(player)

  lobbies[index] = lobby

  lobby.action = "board"
  lobby.playerID = playerID
  ws.ssend(lobby)

  ws.on("message", function incoming(message) {
    console.log("[LOG] " + message)
    let action = JSON.parse(message)
    let lobby = lobbies[index]

    if (action.action == "build" || action.action == "upgrade") {
      lobby.players.forEach((player) => {
        player.socket.ssend(action)
      })
    }
  })
})

server.listen(port)
