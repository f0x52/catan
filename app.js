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

// Modulo that works with negative numbers
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};


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
    ready: true, // TODO: set to false!
    color: lobby.colors[playerID],
    rolled: false,
    resources: {brick: 0, grain: 0, iron: 0, wool: 0, wood: 0}
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

    function callout(msg, all){

      let message = {
        action: "chat",
        from: "Catan",
        msg: msg
      }

      if(all){
        lobby.players.forEach((player) => {
          player.socket.ssend(message)
        })
      }else{
        player.socket.ssend(message)
      }
    }

    if (action.action == "build" || action.action == "upgrade") {
      lobby.players.forEach((player) => {
        player.socket.ssend(action)
      })

      if (action.action == "build") {
        //Update no-place sites
        let buildingNum = action.what.substr(8) //remove building prefix
        console.log("built", buildingNum)
        Object.keys(lobby.board.tiles).forEach((tileName) => {
          let tile = lobby.board.tiles[tileName]

          for (let i=0; i<tile.buildings.length; i++) {
            if (tile.buildings[i] == buildingNum) {
              lobby.buildings[tile.buildings[i]] = {type: "village", color: player.color}
              lobby.buildings[tile.buildings[(i+1)%6]] = {}
              lobby.buildings[tile.buildings[(i-1).mod(6)]] = {}
              break
            }
          }
        })
      }
      console.log(lobby.buildings)
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
      let dice1 = Math.floor((Math.random() * 6)+1)
      let dice2 = Math.floor((Math.random() * 6)+1)
      let total = dice1+dice2

      Object.keys(lobby.board.tiles).forEach((tileName) => {
        let currentTile = lobby.board.tiles[tileName]
        if(currentTile.number == total){
          currentTile.buildings.forEach((number) => {
            let building = lobby.buildings[number]

            if(building == undefined || building.color == undefined){
              return
            }

            lobby.players.some((player) => {
              if(player.color == building.color){
                player.resources[currentTile.type]++
                if(building.type == "city"){
                  player.resources[currentTile.type]++
                }
                return true // breaks this loop
              }
            })
          })
        }
      })
      lobby.players.forEach((player) => {
        player.socket.ssend({
          action: "chat",
          from: "RESOURCES",
          msg:
        }
          JSON.stringify(player.resources)
        )
      })


      //Object.keys(lobby.board.tiles).forEach(function (tile) {
	    //     console.log(tile.number)
      //})

      callout(player.color + " rolled "+ total, true)
      callout(JSON.stringify(player.resources), false)

    }

    if (action.action == "next pressed" && lobby.started && player.id == lobby.currentPlayer && player.rolled) {
      lobby.currentPlayer ++
      player.rolled = false
      if(lobby.currentPlayer == 4){ lobby.currentPlayer = 0}
      console.log("Turn given to: " + lobby.currentPlayer)

      callout(lobby.players[lobby.currentPlayer].color + " " + lobby.currentPlayer + " has the turn", true)
    }

    if (action.action == "ready pressed" && lobby.started == false) {
      player.ready = true

      if(lobby.players.length==4){

        let tempTruth = true

        for(let i = 0; i < 4; i++){
          if(lobby.players[i].ready == false){
            tempTruth = false
            //callout("Waiting for remaining players (" + i + "/4)", false)
            break
          }
        }
        lobby.started = tempTruth

        if(lobby.started){
          let randomnumber = Math.floor(Math.random() * 4)
          lobby.currentPlayer = randomnumber

          callout(lobby.players[lobby.currentPlayer].color + " " + lobby.currentPlayer + " has the turn", true)
        }
      }else{

        callout("Please wait till the lobby has 4 players (" + lobby.players.length + "/4)", true)

      }
    }
  })
})

server.listen(port)
