let socket = new WebSocket("ws://localhost:3000")
let chat = document.getElementById("chat")
let html = document.getElementsByTagName("html")[0]
let myColor = "red"
let game


// sawing sound, released CC by 3.0
// https://github.com/SlimeKnights/TinkersConstruct/blob/1.12/resources/assets/tconstruct/sounds/Credits.txt
let saw = new Audio("saw.ogg")

document.getElementById('ready').addEventListener("click", function() {
  let data = {
    action: "ready pressed"
  }
  socket.send(JSON.stringify(data))
})

document.getElementById('next').addEventListener("click", function() {
  let data = {
    action: "next pressed"
  }
  socket.send(JSON.stringify(data))
})

document.getElementById('roll').addEventListener("click", function() {
  let data = {
    action: "dice rolled"
  }
  socket.send(JSON.stringify(data))
})

document.getElementById('fullscreen').addEventListener("click", function(e) {
  if (e.target.fullscreen) {
    e.target.fullscreen = false
    document.exitFullscreen()
    return
  }
  e.target.fullscreen = true
  html.requestFullscreen()
})

socket.onmessage = function(event) {
  let data = JSON.parse(event.data)
  console.log(data)

  if (data.action == "board") {
    game = JSON.parse(event.data)
    myColor = game.colors[game.playerID]
    drawBoard(game.board)
    displayResources(game.players[game.playerID].resources)
  } else if (data.action == "update resources") {
    displayResources(data.resources)
  } else if (data.action == "build") {
    saw.play()
    document.getElementById(data.what).place(data.color)
  } else if (data.action == "upgrade") {
    document.getElementById(data.what).upgrade()
  } else if (data.action == "chat") {
    addMessage(chat, data)
  }
}

document.getElementById("send").addEventListener("keydown", (e) => {
  if (e.key != "Enter") {
    return
  }
  let msg = chatParse(e.target.value)

  socket.send(JSON.stringify({
    action: "chat",
    msg: msg
  }))
  e.target.value = ""
})

let placedTiles = 0
let placedBuildings = 0
let placedRoads = 0
let noBuild = []

class BoardPiece extends HTMLElement {
  constructor(myColor) {
    super()
    this.myColor = myColor

    this.addEventListener("click", (e) => {this.click(e)})
  }

  click() {
    console.log("click")
    console.log(this)
    if (this.type == "village" ) {
      let obj = {
        action: "upgrade",
        what: this.id,
        type: "city"
      }
      console.log("city", obj)
      socket.send(JSON.stringify(obj))
      return
    }

    let obj = {
      action: "build",
      what: this.id,
      color: this.myColor
    }

    socket.send(JSON.stringify(obj))
  }

  place(color) {

    if(this.id.includes("building")){
          this.type = "village"
    }
    this.className = this.constClassName + " placed " + color
    this.placed = true
    this.color = color
  }
}

class Building extends BoardPiece {
  constructor(num, location, firstTile, myColor) {
    super(myColor)
    this.constClassName = location + " pos" + num
    this.className = this.constClassName + " " + myColor
    this.style.gridArea = location+num
    if (num==0 && !firstTile) {
      this.style.opacity = 0;
      this.style.zIndex = -100;
    } else {
      this.id = "building"+placedBuildings
      placedBuildings++
    }
  }

  upgrade() {
    this.type = "city"
    this.className += " city"
  }
}

class Road extends BoardPiece {
  constructor(num, location, myColor) {
    super(myColor)
    this.id = "road"+placedRoads
    if (location == "bottom") {
      num = num+3
    }
    this.constClassName = "pos" + num
    this.className = this.constClassName + " " + myColor
    placedRoads++
  }
}

customElements.define('catan-road', Road)
customElements.define('catan-building', Building)

function drawBoard(game) {
  let board = document.getElementById("board")
  let boardSize = [3,5] //min tiles per row, max tiles per row
  let tileHeight = 160
  let tileWidth = Math.sqrt(3)*tileHeight/2 * (27/26) // texture isn't a perfect hexagon
  let rowDistance = 0//"-"+tileHeight/4+"px"

  board.style.marginTop = rowDistance //compensate for marginBottom on rows

  //Top half
  for (let i=boardSize[0]; i<boardSize[1]; i++) {
    board.appendChild(Row(i, "top"))
  }

  let middleRow = true

  //Middle + Bottom half
  for (let i=boardSize[1]; i>=boardSize[0]; i--) {
    board.appendChild(Row(i, "bottom", middleRow))
    middleRow = false
  }

  function Row(tiles, location, middleRow) {
    let row = document.createElement("row")
    let firstChild = true
    let lastChild = false

    for (let i=0; i<tiles; i++) {
      if (i==tiles-1) {
        lastChild = true
      }
      let tile = document.createElement("tile")
      let tileName = Object.keys(game.tiles)[placedTiles]
      let gameTile = game.tiles[tileName]
      if (gameTile != undefined && gameTile.number != undefined) {
        tile.className += gameTile.type
        let number = document.createElement("number")
        number.style.backgroundPosition = -50 * gameTile.number + "px" //image will be scaled to 50px
        tile.appendChild(number)
      }

      tile.id = tileName
      tile.style.height = tileHeight+"px"
      tile.style.width = tileWidth+"px"
      tile.style.marginRight = 0

      for (let j=0; j<3; j++) {
        tile.appendChild(new Building(j, location, firstChild, myColor))
        tile.appendChild(new Road(j, location, myColor))
      }

      if (middleRow) {
        for(let j=0; j<3; j++) {
          tile.appendChild(new Building(j, "top", firstChild, myColor))
          tile.appendChild(new Road(j, "top", myColor))
        }
      }

      if (firstChild && location == "bottom" && !middleRow) {
        tile.appendChild(new Road(6, "top", myColor))
      }

      if (lastChild && location == "top", myColor) {
        let road = new Road(3, location, myColor)
        road.style.opacity = 0;
        road.style.zIndex = -100;
        tile.appendChild(road)
      }

      if (firstChild) {
        firstChild = false
      }

      row.appendChild(tile)
      placedTiles++
    }
    row.style.marginBottom = "-40px"
    return row
  }
}
function displayResources(resources) {
  Object.keys(resources).forEach((resource) => {
    let num = document.querySelector("#"+resource + " span")
    num.textContent = resources[resource]
  })
}
