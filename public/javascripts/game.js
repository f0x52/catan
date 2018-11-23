/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 * Taken from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 */

 function shuffle(a) {
     var j, x, i;
     for (i = a.length - 1; i > 0; i--) {
         j = Math.floor(Math.random() * (i + 1));
         x = a[i];
         a[i] = a[j];
         a[j] = x;
     }
     return a;
 }

let board = document.getElementById("board")
function generateBoard(board) {
  let row = document.createElement("div")
  row.className = "row"

  let numbers = []
  for (let i=2; i<=12; i++) {
    numbers.push(i)
    numbers.push(i)
  }
  shuffle(numbers)

  let layout = [3, 4, 5, 4, 3]
  let rowCount = 1
  let tileCount = 0
  for(let i=1; i<=19; i++) { //Catan has 19 tiles
    if (tileCount == layout[0]) {
      layout.splice(0, 1)
      board.appendChild(row)
      rowCount++
      row = document.createElement("div")
      row.className = "row"
      tileCount = 0
    }
    tileCount++;
    let tile = generateTile(numbers, i)
    let rand = Math.floor(Math.random() * 5)
    if (rand ==1) {
      tile.className += " forest"
    } else if (rand==2) {
      tile.className += " field"
    } else if (rand==3) {
      tile.className += " mesa"
    } else if (rand==4) {
      tile.className += " mountain"
    } else {
      tile.className += " pasture"
    }
    row.appendChild(tile)
  }
  board.appendChild(row)
}

function generateTile(numbers, pos) {
  let tilename = "tile"+pos
  let tile = document.createElement("div")
  tile.className = "tile"
  tile.id = tilename
  for(let i=0; i<3; i++) {
    let part = document.createElement("div")
    part.className = "tilePart"
    part.addEventListener("click", () => {console.log(tilename)})
    tile.appendChild(part)
  }
  if (pos == 10) {
    return tile;
  }
  let num = document.createElement("span")
  num.innerHTML = numbers[pos]
  num.className="num"
  tile.appendChild(num)
  return tile
}

generateBoard(board);
