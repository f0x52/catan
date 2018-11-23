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

let tilesPerRow = [3, 4, 5, 4, 3]
let rowCount = 0
let row = document.createElement("div")
row.className = "row"
let tileCount = 1
let buildings = 0
let firstTile = true

function buildingSite(id) {
  let buildingSite = document.createElement("div")
  buildingSite.className = "building"
  buildingSite.id = "building" + id
  buildingSite.innerHTML = "X"
  buildingSite.addEventListener('click', () => {console.log("building" + id)})
  return buildingSite
}

Object.keys(game.tiles).forEach((tileName) => {
  let currentTile = game.tiles[tileName]

  let tile = document.createElement("div")
  tile.className = "tile " + currentTile.type
  tile.id = "tile" + tileCount

  if (firstTile) {
    let building = buildingSite(buildings++)
    building.className += " first"
    tile.appendChild(building)
  }

  for(let i=0; i<2; i++) {
    let building = buildingSite(i+buildings)
    building.className += " child"+i
    if (!firstTile) {
      building.className += " noFirst"
    }
    tile.appendChild(building)
  }
  buildings = buildings +2

  if (currentTile.number != null) {
    let number = document.createElement("div")
    number.innerHTML = "<b>" + currentTile.number + "</b>"
    number.className = "num"
    if (!firstTile) {
      number.className += " noFirst"
    }
    tile.appendChild(number)
  }

  if (firstTile) {
    firstTile = false
  }

  row.appendChild(tile)
  if (tileCount == tilesPerRow[rowCount]) {
    board.appendChild(row)
    rowCount++
    row = document.createElement("div")
    row.className = "row"
    tileCount = 1
    firstTile = true
  } else {
    tileCount++;
  }
})
