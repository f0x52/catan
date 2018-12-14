let express = require("express")
let ejs = require("ejs")
let http = require("http")
let websocket = require("ws")
let createLobby = require("./server/lobby")

let port = process.argv[2]
let app = express()
let expressWs = require('express-ws')(app);
let func = require('./server/functions')

let stats = {
  games: 0,
  points: 0,
  gnomes: 0
}

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get("/", function(req, res) {
  res.render('splash.ejs', stats)
})

app.ws("/ws/:name", function(ws, req) {
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
    name: req.params.name,
    socket: ws,
    ready: false, // TODO: set to false!
    color: lobby.colors[playerID],
    rolled: false,
    resources: {brick: 0, grain: 0, iron: 0, wool: 0, wood: 0},
    victoryPoints: 0
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

  let msg2 = {
    action: "join",
    player: playerID,
    name: player.name
  }
  lobby.players.forEach((player) => {
    player.socket.ssend(msg2)
  })

  ws.on("message", function incoming(message) {
    let now = new Date()
    let timestamp = now.getDay()+"/"+now.getMonth() + " " + now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()
    console.log(timestamp, message)

    let action = JSON.parse(message)
    let lobby = lobbies[index]

    //Function needs access to players/lobby, so defined inside ws
    function victory(player){
      lobby.started = false
      lobby.victory = true
      callout("🎉 " + player.color + " has won the game! 🎉")
    }
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

    //TODO: these functions needs a better place
    if (action.action == "build") {
      let buildingNum = action.what.substr(8) //remove building prefix

      // Check resources required
      if(action.what.startsWith("building") && (player.resources.brick < 1 || player.resources.wool < 1 || player.resources.grain < 1 || player.resources.wood < 1 )){
        return false
      }else if(action.what.startsWith("building")){
        // Check no-place sites for villages
        if (lobby.buildings[buildingNum] != undefined) {
          //already occupied
          return false
        }
        player.resources.grain--
        player.resources.wood--
        player.resources.wool--
        player.resources.brick--

        player.victoryPoints++
        let pointEvent = {
          action: "victoryPoint",
          victoryPoints: player.victoryPoints,
          player: playerID,
          name: player.name
        }
        lobby.players.forEach((player) => {
          player.socket.ssend(pointEvent)
        })
        if(player.victoryPoints >= 10){
          func.victory(player)
        }

        if(lobby.turnCount < 8){
          player.resources = JSON.parse(JSON.stringify(roadResources))
        }
        func.sendUpdatedResources(player)
      }

      if(action.what.startsWith("road") && (player.resources.brick < 1 || player.resources.wood < 1 )){
        return false
      }else if(action.what.startsWith("road")){

        if(lobby.turnCount < 8 && player.resources.grain == 1){
          callout("Please build a village first", false)
          return false
        }

        player.resources.wood--
        player.resources.brick--
        func.sendUpdatedResources(player)
        if(lobby.turnCount < 8){
          callout("Please press next turn", false)
        }
      }
      // Check no-place sites

      //let buildingNum = action.what.substr(8) //remove building prefix
      //if (lobby.buildings[buildingNum] != undefined) {
      //  //already occupied
      //  if(action.type == "city"){

      //  }else{
      //    return false
      //  }
      //}

      // Update no-place sites
      if (action.action == "build") {
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

      // Send info to all clients
      lobby.players.forEach((player) => {
        player.socket.ssend(action)
      })
    }else if(action.action == "upgrade"){
      let buildingNum = action.what.substr(8)
      //console.log("test log")
      if(player.resources.grain < 3 || player.resources.iron < 2 ){
        return false
      }

      if (lobby.buildings[buildingNum] == undefined || lobby.buildings[buildingNum].color != player.color) {
        //already occupied
        return false
      }

      player.victoryPoints++
      let pointEvent = {
        action: "victoryPoint",
        victoryPoints: player.victoryPoints,
        player: playerID,
        name: player.name
      }
      if(player.victoryPoints >= 10){
        func.victory(player)
      }
      player.resources.grain = player.resources.grain - 3
      player.resources.iron = player.resources.iron - 2
      func.sendUpdatedResources(player)

      lobby.players.forEach((player) => {
        player.socket.ssend(pointEvent)
        player.socket.ssend(action)
      })

    } else if (action.action == "chat") {
      action.from = player.name
      action.color = player.color
      if (action.msg.startsWith("\n████████▓▓████████▓▓█████████████")) {
        //Gnome
        stats.gnomes++
      }

      if(action.msg.startsWith("/trade")){
        let data = action.msg.split(" ")
        if(player.resources[data[1]] != undefined && player.resources[data[2]] != undefined){
          if(player.resources[data[1]] >= 3){
            player.resources[data[1]] = player.resources[data[1]]-3
            player.resources[data[2]]++
            func.sendUpdatedResources(player)
            callout(player.name + " sucessfully traded 2 " + data[1] + " for 1 " + data[2], true)
          }else{
            callout("Not enough resources", false)
          }
        }else{
          callout("Invalid trade parameters, try again", false)
        }
        return
      }

      lobby.players.forEach((player) => {
        player.socket.ssend(action)
      })
    }

    if (action.action == "dice rolled" && player.id == lobby.currentPlayer && !player.rolled && lobby.turnCount >= 8) {
      console.log("dice rolled")
      player.rolled = true
      let total = 7
      let dice1
      let dice2
      while(total == 7){
        dice1 = Math.floor((Math.random() * 6)+1)
        dice2 = Math.floor((Math.random() * 6)+1)
        total = dice1+dice2
      }

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
        func.sendUpdatedResources(player)
        let event = {
          action: "diceroll",
          dice1: dice1,
          dice2: dice2
        }
        player.socket.ssend(event)
      })

      //callout(player.name + " rolled "+ total, true)
    }

    if (action.action == "next pressed" && lobby.started && player.id == lobby.currentPlayer && (player.rolled || lobby.turnCount < 8)) {
      if(lobby.turnCount < 9 && player.resources.brick != 0){
        callout("You still need to build", false)
        return
      }
      lobby.turnCount++
      if(lobby.turnCount == 4){

      }else if(lobby.turnCount > 4 && lobby.turnCount < 8){
        lobby.currentPlayer--
        if(lobby.currentPlayer == -1){ lobby.currentPlayer = 3}
      }else{
        lobby.currentPlayer++
      }
      player.rolled = false
      if(lobby.currentPlayer == 4){ lobby.currentPlayer = 0}
      if(lobby.turnCount < 8){
        lobby.players[lobby.currentPlayer].resources = JSON.parse(JSON.stringify(villageResources)) //big gay
        lobby.players.forEach((player) => {
          func.sendUpdatedResources(player)
        })
      }
      console.log("Turn given to: " + lobby.currentPlayer)

      callout(lobby.players[lobby.currentPlayer].name + " has the turn", true)
    }

    if (action.action == "ready pressed" && lobby.started == false && lobby.victory == false) {
      player.ready = true

      if(lobby.players.length==4){
        let tempTruth = true

        let readyCount = 0
        for(let i = 0; i < 4; i++){
          if(lobby.players[i].ready == false){
            tempTruth = false
          } else {
            readyCount++
          }
        }
        if (!tempTruth) {
          callout(`${player.name} is ready (${readyCount}/4)`, true)
        }
        lobby.started = tempTruth

        if(lobby.started){
          let randomnumber = Math.floor(Math.random() * 4)
          lobby.currentPlayer = randomnumber
          lobby.players[lobby.currentPlayer].resources = JSON.parse(JSON.stringify(villageResources))
          lobby.players.forEach((player) => {
            func.sendUpdatedResources(player)
          })
          callout(lobby.players[lobby.currentPlayer].color + " " + lobby.currentPlayer + " has the turn", true)
        }
      } else{
        callout("Please wait till the lobby has 4 players (" + lobby.players.length + "/4)", true)
      }
    }
  })
})

let lobbies = []
let villageResources =  {brick: 1, grain: 1, iron: 0, wool: 1, wood: 1}
let roadResources = {brick: 1, grain: 0, iron: 0, wool: 0, wood: 1}

// Modulo that works with negative numbers
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

app.listen(port)
