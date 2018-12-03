let socket = new WebSocket("ws://localhost:3000")

socket.onmessage = function(event) {
  let game = JSON.parse(event.data)
  drawBoard(game.board)
}

let placedTiles = 0
let placedBuildings = 0
let placedRoads = 0

class BoardPiece extends HTMLElement {
  constructor(myColor) {
    super()
    this.myColor = myColor

    this.addEventListener("click", (e) => {this.click(e)})
  }

  place(color) {
    this.className = this.constClassName + " placed " + color
    this.placed = true
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
    }
  }

  upgrade() {
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

  let myColor = "red"

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
