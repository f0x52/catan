r# Catan
```
board : {
  buildings: [
    {
      type: "village/city",
      owner: "game",
      roads: []
    }
  ],

  roads: ["game"],

  tiles: {
    tileA: {
      number: 2,
      type: brick,
      buildings: [0, 1, 2, 7, 8, 9]
    }
  }

  players: {
    "red": {
      resources: {
        "brick": 5,
        "wood": 2
      },
      websocket: $websocketID,
      points: 0
    }
  }
}
```


```javascript

let lobby = {
  players: [
    {
      "websocket": -,
      "color": "red"
    },
    {
      "websocket": -,
      "color": "red"
    }
  ]
}

```

Available Events over websocket
```JavaScript
// Building
{
  action: "build",
  location: "road1",
  color: "red"
}

// Upgrade village
{
  action: "upgrade",
  location: "city1"
}

// Pass turn
{
  action: "next"
}

// Dice roll
{
  action: "roll"
}
// returns
{
  action: "roll",
  number: 7
}

// Resources
// Updates after every roll, build
{
  action: "resources",
  resources: {
    wood: 1,
    brick: 2,
    grain: 3,
    wool: 2,
    iron: 0
  }
}
```

dobbelsteen
 getal
 tiles
 welke gebouwen grenzen aan die tiles


loop through tiles
if tile.number == diceroll
foreach building
check if built
give 1-2 resources to player

bouwen



Assignment pad https://pad.lain.haus/3DyGJv3fR4yshJ7IiqfyIw?both
cool
