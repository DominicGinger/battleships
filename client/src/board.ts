import { Ship, Deck } from './ship'

type Tile = {
  occupied: boolean,
  placed: boolean,
  ship?: Ship
}

export class Board {
  board: Array<Array<Tile>>
  ships: Array<Ship>
    width: number
    height: number

    constructor(width: number, height: number) {
      this.width = width
      this.height = height 
      this.board = []
      this.ships = []
      for (let x = 0; x < width; x++) {
        this.board.push([])
        for (let y = 0; y < height; y++) {
          const newTile: Tile = { occupied: false, placed: false }
          this.board[x].push(newTile)
        }
      }

      this.addShip(1)
      this.addShip(1)
      this.addShip(1)
      this.addShip(1)
      this.addShip(2)
      this.addShip(2)
      this.addShip(2)
      this.addShip(3)
      this.addShip(3)
      this.addShip(4)
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
    const x = Math.floor(Math.random() * this.width)
    const y = Math.floor(Math.random() * this.height)

    if (Math.floor(Math.random() * 2)) {
      if (x + length > this.width) {
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
      if (y + length > this.height) {
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
    if (x < 0 || x >= this.width || y < 0 || y >= this.height || this.board[y][x].placed) {
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


