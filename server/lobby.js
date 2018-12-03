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

module.exports = createLobby
