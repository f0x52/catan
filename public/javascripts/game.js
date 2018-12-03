// All of this would happen serverside

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

let game = {
  tiles: {
    tileA: {
      buildings: [0, 1, 2, 8, 9, 10]
    },
    tileB: {
      buildings: [2, 3, 4, 10, 11, 12]
    },
    tileC: {
      buildings: [4, 5, 6, 12, 13, 14]
    },
    tileD: {
      buildings: [7, 8, 9, 7, 8, 9]
    },
    tileE: {
      buildings: [9, 10, 11, 7, 8, 9]
    },
    tileF: {
      buildings: [11, 12, 13, 7, 8, 9]
    },
    tileG: {
      buildings: [13, 14, 15, 7, 8, 9]
    },
    tileH: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileI: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileJ: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileK: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileL: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileM: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileN: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileO: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileP: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileQ: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileR: {
      buildings: [0, 1, 2, 7, 8, 9]
    },
    tileS: {
      buildings: [0, 1, 2, 7, 8, 9]
    }
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
console.log(numbers)
let pos = 0
let numPos = 0
let usedNumbers = {}
Object.keys(game.tiles).forEach((tileName) => {
  let currentTile = game.tiles[tileName]
  currentTile.type = resources[pos]
  if (resources[pos] != "desert") {
    currentTile.number = numbers[numPos]
    numPos++
  }
  pos++
})

// Actual Clientside

//class Num extends HTMLElement {
//  constructor(...args) {
//    const self = super(...args)
//    //let dom = this.attachShadow({mode: 'open'})
//    //self.innerHTML = num
//    //let number = document.createElement("span")
//    //if (num != undefined) {
//    //  number.innerHTML = num
//    //} else {
//    //  number.style.opacity = 0
//    //}
//    //dom.appendChild(number)
//    return self
//  }
//}

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

let board = document.getElementById("board")
let boardSize = [3,5] //min tiles per row, max tiles per row
let tileHeight = 160
let tileWidth = Math.sqrt(3)*tileHeight/2 * (27/26) // texture isn't a perfect hexagon
let rowDistance = 0//"-"+tileHeight/4+"px"
let placedTiles = 0
let placedBuildings = 0
let placedRoads = 0

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

// function showRoads(i) {
//   console.log("showing road", i)
//   if (i<76) {
//     document.getElementById("road"+i).className += " placed"
//   } else {
//     setTimeout(() => {showBuildings(0)}, 200)
//     return
//   }
//   setTimeout(() => {showRoads(++i)}, 100)
// }
//
// function showBuildings(i) {
//   console.log("showing building", i)
//   if (i<54) {
//     document.getElementById("building"+i).className += " placed"
//   } else {
//     document.getElementById("building"+(i-54)).className += " city"
//   }
//   if (i < 107) {
//     setTimeout(() => {showBuildings(++i)}, 200)
//   }
// }
//
// setTimeout(() => showRoads(0), 1500)
