let board = document.getElementById("board")
function generateBoard(board) {
  let row = document.createElement("div")
  //row.id = "row1"
  row.className = "row"
  let layout = [3, 4, 5, 4, 3]
  let rowCount = 1
  let tileCount = 0
  for(let i=1; i<=4; i++) { //Catan has 19 tiles

    if (tileCount == layout[0]) {
      layout.splice(0, 1)
      board.appendChild(row)
      rowCount++
      row = document.createElement("div")
      row.className = "row"
      tileCount = 0
    }
    tileCount++;
    let tile = generateTile("tile"+i)
    row.appendChild(tile)
  }
}

function generateTile(tilename) {
  let tile = document.createElement("div")
  tile.className = "tile"
  for(let i=0; i<3; i++) {
    let part = document.createElement("div")
    part.className = "tilePart"
    part.addEventListener("click", () => {console.log(tilename)})
    tile.appendChild(part);
  }
  return tile;
}

generateBoard(board);
