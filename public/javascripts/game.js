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

let board = document.getElementById("board")
let tiles = document.getElementById("tiles")
let buildings = document.getElementById("buildings")
let roads = document.getElementById("roads")
let boardSize = [3,5] //min tiles per row, max tiles per row
let tileHeight = 160
let tileWidth = Math.sqrt(3)*tileHeight/2 * (27/26) // texture isn't a perfect hexagon
let rowDistance = 0//"-"+tileHeight/4+"px"

let placedTiles = 0

tiles.style.marginTop = rowDistance //compensate for marginBottom on rows

//Top half
for (let i=boardSize[0]; i<boardSize[1]; i++) {
  tiles.appendChild(Row(i, "top"))
}

let middleRow = true

//Middle + Bottom half
for (let i=boardSize[1]; i>=boardSize[0]; i--) {
  tiles.appendChild(Row(i, "bottom", middleRow))
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
      tile.appendChild(Num(gameTile.number))
    }

    tile.id = tileName
    tile.style.height = tileHeight+"px"
    tile.style.width = tileWidth+"px"
    tile.style.marginRight = 0
    tile.addEventListener("click", (e) => {console.log(e.target.id)})

    for (let j=0; j<3; j++) {
      tile.appendChild(Building(j, location, firstChild))
      tile.appendChild(Road(j, location, lastChild))
    }

    if (middleRow) {
      for(let j=0; j<3; j++) {
        tile.appendChild(Building(j, "top", firstChild))
        tile.appendChild(Road(j, "top"))
      }
    }

    if (firstChild && location == "bottom" && !middleRow) {
      tile.appendChild(Road(6, "top"))
    }

    if (lastChild && location == "top") {
      tile.appendChild(Road(3, location))
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

function Building(num, location, firstChild) {
  let building = document.createElement("building")
  building.className = location + " pos" + num + " red city"
  //strPossibility(12, " red") + strPossibility(25, " blue") + strPossibility(12, " orange") + strPossibility(12, " white") + strPossibility(25, " city")
  building.style.gridArea = location+num
  if (num==0 && !firstChild) {
    building.style.opacity = 0;
    building.style.zIndex = -100;
  }
  return building
}

function Road(num, location, lastChild) {
  let road = document.createElement("road")
  if (location == "bottom") {
    num = num+3
  }
  road.className = "pos" + num
  return road
}

function Num(num) {
  let number = document.createElement("number")
  if (num != undefined) {
    number.innerHTML = num
  } else {
    number.style.opacity = 0
  }
  return number
}

function strPossibility(odds, str) {
  if(Math.random()*100 < odds) {
    return str
  }
  return ""
}
