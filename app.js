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
    color: lobby.colors[playerID],
    rolled: false
  }

  lobby.players.push(player)

  lobbies[index] = lobby

  lobby.action = "board"
  lobby.playerID = playerID
  ws.ssend(lobby)

  let msg = {
    action: "chat",
    from: "Catan",
    msg: "Welcome to lobby "+lobbies.length + " , you are " + player.color + " " + player.id
   }
  ws.ssend(msg)

  ws.on("message", function incoming(message) {
    console.log("[LOG] " + message)

    let action = JSON.parse(message)
    let lobby = lobbies[index]

    if (action.action == "build" || action.action == "upgrade") {
      lobby.players.forEach((player) => {
        player.socket.ssend(action)
      })
    } else if (action.action == "chat") {
      console.log("recv chat")
      action.from = "player"+playerID
      lobby.players.forEach((player) => {
        player.socket.ssend(action)
      })
    }

    if (action.action == "dice rolled" && player.id == lobby.currentPlayer && !player.rolled) {
      console.log("dice rolled")
      player.rolled = true
      let dice1 = Math.floor((Math.random() * 7)+1)
      let dice2 = Math.floor((Math.random() * 7)+1)
      let total = dice1+dice2

      let diceData = {
        action: "chat",
        from: "Catan",
        msg: player.color + " rolled "+ total
      }
      lobby.players.forEach((player) => {
        player.socket.ssend(diceData)
      })
    }

    if (action.action == "next pressed" && lobby.started && player.id == lobby.currentPlayer && player.rolled) {
      lobby.currentPlayer ++
      player.rolled = false
      if(lobby.currentPlayer == 4){ lobby.currentPlayer = 0}
      console.log("Turn given to: " + lobby.currentPlayer)

      let turnChange = {
        action: "chat",
        from: "Catan",
        msg: lobby.players[lobby.currentPlayer].color + " " + lobby.currentPlayer + " has the turn"
      }
      lobby.players.forEach((player) => {
        player.socket.ssend(turnChange)
      })
    }

    if (action.action == "ready pressed") {
      player.ready = true
      let tempTruth = true

      for(let i = 0; i < 4; i++){
        if(lobby.players[i].ready == false){
          tempTruth = false
        }
      }
      lobby.started = tempTruth

      if(lobby.started){
        let randomnumber = Math.floor(Math.random() * 4)
        lobby.currentPlayer = randomnumber
        console.log(randomnumber)

        let gameStart = {
          action: "chat",
          from: "Catan",
          msg: lobby.players[lobby.currentPlayer].color + " " + lobby.currentPlayer + " has the turn"
        }

        lobby.players.forEach((player) => {
          player.socket.ssend(gameStart)
        })
      }
    }
  })
})

server.listen(port)
