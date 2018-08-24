import * as readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

type Tile = {
  occupied: boolean,
  placed: boolean,
  ship?: Ship
}
type Deck = {
  x: number,
  y: number,
  hit: boolean
}

type Grid = Array<Array<Tile>>;

class Ship {
    decks: Array<Deck>

  constructor(x: number, y: number, length: number, direction: string) {
    this.decks = []
    if (direction === 'right') {
      for (let i = 0; i < length; i++) {
        this.decks.push({ x: x + i, y, hit: false })
      }
    }  else {
      for (let i = 0; i < length; i++) {
        this.decks.push({ x, y: y + i, hit: false })
      }
    }
  }

  isSunk() {
    return this.decks.every(d => d.hit)
  }

  getDecks() {
    return this.decks
  }
}

class Board {
  board: Grid
  ships: Array<Ship>

  constructor(width: number, height: number) {
    this.board = []
    this.ships = []
    for (let x = 0; x < width; x++) {
      this.board.push([])
      for (let y = 0; y < height; y++) {
        const newTile: Tile = { occupied: false, placed: false }
        this.board[x].push(newTile)
      }
    }
  }

  print(show: boolean = true): void {
    this.board.forEach(row => {
      row.forEach(cell => {
        if (cell.placed && cell.occupied) {
          process.stdout.write('X ')
        } else if (cell.placed) {
          process.stdout.write('  ')
        } else if (cell.occupied && show) {
          process.stdout.write('1 ')
        } else {
          process.stdout.write('0 ')
        }
      })
      process.stdout.write('\n')
    })
  }

  checkCell(x: number, y: number, check: Function): boolean {
    return this.board[y] && this.board[y][x] && check(this.board[y][x], x, y)
  }

  checkNear(x: number, y: number, check: Function): boolean {
    return this.checkCell(x-1, y-1, check) ||
      this.checkCell(x-1, y, check) ||
      this.checkCell(x-1, y+1, check) ||
      this.checkCell(x+1, y-1, check) ||
      this.checkCell(x+1, y, check) ||
      this.checkCell(x+1, y+1, check) ||
      this.checkCell(x, y-1, check) ||
      this.checkCell(x, y+1, check)
  }

  addShip(length: number, tries: number = 0): boolean {
    if (tries > 100) {
      return false
    }
    const width = this.board[0].length
    const height = this.board.length
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)

    if (Math.floor(Math.random() * 2)) {
      if (x + length > width) {
        return this.addShip(length, tries + 1)
      }

      for (let i = x; i < x + length; i++) {
        if (this.board[y][i].occupied || this.checkNear(i, y, (c: Tile) => c.occupied)) {
          return this.addShip(length, tries + 1)
        }
      }

      const ship = new Ship(x, y, length, 'right')
      for (let i = x; i < x + length; i++) {
        this.board[y][i].occupied = true
        this.board[y][i].ship = ship
        this.ships.push(ship)
      }

      return true
    } else {
      if (y + length > height) {
        return this.addShip(length, tries + 1)
      }

      for (let i = y; i < y + length; i++) {
        if (this.board[i][x].occupied || this.checkNear(x, i, (c: Tile) => c.occupied)) {
          return this.addShip(length, tries + 1)
        }
      }

      const ship = new Ship(x, y, length, 'down')
      for (let i = y; i < y + length; i++) {
        this.board[i][x].occupied = true
        this.board[i][x].ship = ship
        this.ships.push(ship)
      }

      return true
    }
  }

  attack(x: number, y: number): boolean {
    if (this.board[y][x].placed) {
      return false
    }
    this.board[y][x].placed = true
    if (this.board[y][x].occupied) {
      const deck = this.board[y][x].ship.decks.find(d => d.x === x && d.y === y)
      deck.hit = true

      if (this.board[y][x].ship.isSunk()) {
        this.board[y][x].ship.decks.forEach((deck: Deck) => {
          this.checkNear(deck.x, deck.y, (c: Tile) => { c.placed = true; return false })
        })
      }
    }

    return this.board[y][x].occupied
  }

  checkShipSunk(ship: Ship): boolean {
    return ship.decks.every((deck: Deck) => deck.hit)
  }

  checkFinished(): boolean {
    return this.ships.every(ship => ship.isSunk())
  }
}

const board = new Board(10, 10)

board.addShip(1)
board.addShip(1)
board.addShip(1)
board.addShip(1)
board.addShip(2)
board.addShip(2)
board.addShip(2)
board.addShip(3)
board.addShip(3)
board.addShip(4)
board.print(true)

function inputLoop (callback: Function) {
  rl.question("> ", (text: String) => {
    const cont = callback(text)

    if (cont) {
      console.log('finished')
      process.exit(0)
    } else {
      inputLoop(callback)
    }
  })
}

function handleInput (text: string): boolean {
  const [x, y] = text.split(',')

  if (board.attack(parseInt(x), parseInt(y))) {
    console.log('HIT')
  }
  board.print(false)

  return board.checkFinished()
}

inputLoop(handleInput)

