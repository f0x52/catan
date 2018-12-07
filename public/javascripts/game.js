let socket = new WebSocket("ws://localhost:3000")
let myColor = "red"
let game

// Modulo that works with negative numbers
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

let chat = document.getElementById("chat")

document.getElementById('ready').addEventListener("mouseup", function() {

  let data = {
    action: "ready pressed"
  }
  socket.send(JSON.stringify(data))
})

document.getElementById('next').addEventListener("mouseup", function() {

  let data = {
    action: "next pressed"
  }
  socket.send(JSON.stringify(data))
})

document.getElementById('roll').addEventListener("mouseup", function() {
  console.log("rollimg")
  let data = {
    action: "dice rolled"
  }
  socket.send(JSON.stringify(data))
})

socket.onmessage = function(event) {
  let data = JSON.parse(event.data)
  console.log(data)



  if (data.action == "board") {
    game = JSON.parse(event.data)
    myColor = game.colors[game.playerID]
    drawBoard(game.board)
  } else if (data.action == "build") {
    document.getElementById(data.what).place(data.color, true)
  } else if (data.action == "upgrade") {
    document.getElementById(data.what).upgrade(true)
  } else if (data.action == "chat") {
    let line = document.createElement("div")
    let from = document.createElement("b")
    from.textContent = data.from + ": "
    let msg = document.createElement("span")
    if (data.msg.startsWith("nyan")) {
      msg.className = "nyan"
    }
    msg.textContent = data.msg
    line.appendChild(from)
    line.appendChild(msg)
    chat.appendChild(line)
    chat.scrollTop = chat.scrollHeight;
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

  place(color, proxied) {
    this.className = this.constClassName + " placed " + color
    this.placed = true
    this.color = color

    if (proxied) {
      // Action comes from WS instead of the user
      return
    }
    let obj = {
      action: "build",
      what: this.id,
      color: color
    }
    socket.send(JSON.stringify(obj))
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

  click() {
    if (this.placed) {
      this.upgrade()
    } else {
      this.place(this.myColor)
      //Update no-place sites
      let buildingNum = this.id.substr(8) //remove building prefix
      console.log(buildingNum)
      Object.keys(game.board.tiles).forEach((tileName) => {
        let tile = game.board.tiles[tileName]

        for(let i=0; i<tile.buildings.length; i++) {
          if (tile.buildings[i] == buildingNum) {
            noBuild.push(tile.buildings[i])
            noBuild.push(tile.buildings[(i+1)%6])
            noBuild.push(tile.buildings[(i-1).mod(6)])
            console.log((i-1).mod(6))
            console.log(noBuild)
            break
          }
        }
      })
    }
  }

  upgrade(proxied) {
    if (this.color != myColor) {
      return
    }
    this.className += " city"
    if (proxied) {
      // Action comes from WS instead of the user
      return
    }
    let obj = {
      action: "upgrade",
      what: this.id,
      proxy: true
    }
    socket.send(JSON.stringify(obj))
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

  click() {
    this.place(this.myColor)
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
      if (gameTile != undefined) {
        tile.className += gameTile.type
        //tile.appendChild(Num(gameTile.number))
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
        tile.appendChild(new Road(3, location))
      }

      if (firstChild) {
        firstChild = false
      }

      row.appendChild(tile)
      placedTiles++
    }
    let offset = (boardSize[1]-tiles) * ( 0.5 * tileWidth)
    row.style.marginLeft = offset + "px"
    row.style.marginBottom = "-40px"
    return row
  }
}
