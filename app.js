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

  if (lobbies.length > 0 && !lastLobby.started && lastLobby.players.length < 4) {
    lobby = lastLobby
  } else {
    lobby = createLobby()
  }

  let player = {
    socket: ws,
    ready: false,
    color: lobby[]
  }

  if (connections.length < 4) {
    connections.push(ws)
    player.number = connections.length
    player.color = colors[player.number-1]
    ws.send(player.color)
   } else {
     ws.send("Lobby is full, please try again later")
     ws.close()
     return
   }
   //connections.push(ws)
   //let's slow down the server response time a bit to make the change visible on the player side
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
         connections[i].send("Player " + player.number + " has pressed the button")
       }
     }

     if (message == "ready" && gameStart == false) {
       player.ready = true
       let message = "Waiting for "
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

         player.socket.send("Game has not started yet, press ready to begin")

       } else if (player.myTurn == false && gameStart == true) {

         player.socket.send("Sorry, not your turn")

       } else if (player.myTurn == true && gameStart == true) {


         let nextPlayer = player.number + 1
         if (nextPlayer > players.length) {
           nextPlayer = 1
         }
         player.socket.send("giving turn to " + players[nextPlayer-1].color)

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
