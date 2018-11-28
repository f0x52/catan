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
let numbers = [2,3,4,5,6,7,8,9,10,11,12]
shuffleArray(numbers)
let pos = 0
Object.keys(game.tiles).forEach((tileName) => {
  let currentTile = game.tiles[tileName]
  currentTile.type = resources[pos]
  if (resources[pos] != "desert") {
    currentTile.number = numbers[pos%11]
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
let rowDistance = "-"+tileHeight/4+"px"

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
  let row = document.createElement("div")
  row.className = "row"
  let firstChild = true

  for (let i=0; i<tiles; i++) {
    let tile = document.createElement("div")
    let gameTile = game.tiles[Object.keys(game.tiles)[placedTiles]]
    tile.className = "tile " + gameTile.type
    tile.style.height = tileHeight+"px"
    tile.style.width = tileWidth+"px"
    tile.style.marginRight = tileHeight/15+"px"

    tile.style.gridTemplateRows = 1/4*tileHeight + "px auto " + 1/4*tileHeight + "px"

    for (let j=0; j<3; j++) {
      tile.appendChild(Building(j, location, firstChild))
    }

    if (middleRow) {
      for(let j=0; j<3; j++) {
        tile.appendChild(Building(j, "top", firstChild))
      }
    }

    if (firstChild) {
      firstChild = false
    }

    tile.appendChild(Num(gameTile.number))

    row.appendChild(tile)
    placedTiles++
  }
  let offset = (boardSize[1]-tiles) * ( 0.5 * tileWidth + .75*tileHeight/20)
  row.style.marginLeft = offset + "px"
  row.style.marginBottom = -tileHeight/4 + tileHeight/10 + "px"
  return row
}

function Building(num, location, firstChild) {
  let building = document.createElement("div")
  building.className = "building " + location + " pos" + num + strPossibility(12, " red") + strPossibility(25, " blue") + strPossibility(12, " orange") + strPossibility(12, " white") + strPossibility(25, " city")
  building.style.gridArea = location+num
  if (num==0 && !firstChild) {
    building.style.opacity = 0;
    building.style.zIndex = -100;
  }
  return building
}

function Num(num) {
  let number = document.createElement("div")
  number.className = "number"
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
