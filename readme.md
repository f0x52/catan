# Catan

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
  location: "building1"
}

// Pass turn
{
  action: "chat",
  from: "Catan",
  msg: "string"
}

// Dice roll
{
  action: "dice rolled"
}
// returns
{
  action: "roll",
  number: 7
}

// Resources
// Updates after every roll, build
{
  action: "update resources",
  resources: {
    wood: 1,
    brick: 2,
    grain: 3,
    wool: 2,
    iron: 0
  }
}

// Ready
{
  action: "ready pressed"
}

// Next
{
  action: "ready pressed"
}
```

Assignment pad https://pad.lain.haus/3DyGJv3fR4yshJ7IiqfyIw?both
