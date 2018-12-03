var express = require("express")
var http = require("http")
var websocket = require("ws")

var port = process.argv[2]
var app = express()

app.use(express.static('public'))

app.use("/", function(req, res) {
  res.sendFile("public/game.html", {
    root: "./"
  })
})

var server = http.createServer(app)

const wss = new websocket.Server({
  server
})

let lobbies = []

let lobby = {



}

function createLobby(){

  let board = require("./server/gameBoard.js")

  /**
   * Randomize array element order in-place.
   * Using Durstenfeld shuffle algorithm.
   */

  function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
  }



  function initResources() {
    let distribution = {
      "wood": 4,
      "brick": 3,
      "iron": 3,
      "grain": 4,
      "wool": 4,
      "desert": 1
    }

    let resources = []

    Object.keys(distribution).forEach((resource) => {
      for(let i=0; i<distribution[resource]; i++) {
        resources.push(resource)
      }
    })
    shuffleArray(resources)
    return resources
  }

  let resources = initResources()
  let numbers = []
  for(let i=2; i<=12; i++) {
    if (i==7) {
      continue
    }
    numbers.push(i);
    if (i != 2 && i != 12) {
      numbers.push(i)
    }
  }
  shuffleArray(numbers)
  let pos = 0
  let numPos = 0
  let usedNumbers = {}
  Object.keys(board.tiles).forEach((tileName) => {
    let currentTile = board.tiles[tileName]
    currentTile.type = resources[pos]
    if (resources[pos] != "desert") {
      currentTile.number = numbers[numPos]
      numPos++
    }
    pos++
  })

  let colors = ["red", "blue", "white", "orange"]
  shuffleArray(colors)

  let lobby = {
    started: false,
    players: [],
    currentPlayer: 0,
    board: board,
    colors: colors
  }

  return lobby
}

console.log(createLobby())

wss.on("connection", function(ws) {

  let playerNum

  var client = {
    socket: ws,
    color: "",
    number: 0,
    myTurn: false,
    ready: false
  }
  players.push(client)

  if (connections.length < 4) {
    connections.push(ws)
    client.number = connections.length
    client.color = colors[client.number-1]
    ws.send(client.color)
  } else {
    ws.send("Lobby is full, please try again later")
    ws.close()
    return
  }
  //connections.push(ws)
  //let's slow down the server response time a bit to make the change visible on the client side
  //setTimeout(function() {
  //    console.log("Connection state: "+ ws.readyState)
  //    ws.send("Thanks for the message. --Your server.")
  //    //ws.close()
  //    console.log("Connection state: "+ ws.readyState)
  //}, 2000)

  //ws.send("Welcome to catan lite")

  ws.on("message", function incoming(message) {
    console.log("[LOG] " + message)

    if (message == "Button pressed") {

      for (let i = 0; i < connections.length; i++) {
        connections[i].send("Player " + client.number + " has pressed the button")
      }
    }

    if (message == "ready" && gameStart == false) {
      client.ready = true
      var message = "Waiting for "
      for (let i = 0; i < players.length; i++) {
        if (players[i].ready == false) {
          message += players[i].number + ", "
        }
      }
      if (message == "Waiting for ") {
        for (let i = 0; i < players.length; i++) {
          players[i].socket.send("Game is starting")
        }

        let rand = Math.floor(Math.random() * 4);
        players[rand].myTurn = true
        gameStart = true
        players[rand].socket.send("its your turn")

      } else {
        ws.send(message)
      }
    }

    if (message == "connections") {
      ws.send(connections.length)
    }

    if (message == "next turn") {

      if (gameStart == false) {

        client.socket.send("Game has not started yet, press ready to begin")

      } else if (client.myTurn == false && gameStart == true) {

        client.socket.send("Sorry, not your turn")

      } else if (client.myTurn == true && gameStart == true) {


        let nextPlayer = client.number + 1
        if (nextPlayer > players.length) {
          nextPlayer = 1
        }
        client.socket.send("giving turn to " + players[nextPlayer-1].color)

        for (let i = 0; i < players.length; i++) {
          if (players[i].number == nextPlayer) {
            players[i].myTurn = true
            players[i].socket.send("It's now your turn")
          } else {
            players[i].myTurn = false
            players[i].socket.send("it's now " + players[nextPlayer-1].color + "'s turn")
          }
        }


      }
    }

  })





})

server.listen(port)
