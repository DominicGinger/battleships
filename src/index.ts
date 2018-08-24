import * as readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

type Tile = {
  occupied: boolean,
  placed: boolean
}
type Grid = Array<Array<Tile>>
  type Ship = {
    length: number
  }

class Board {
  board: Grid

  constructor(width: number, height: number) {
    this.board = []
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

  occupiedCell(x: number, y: number): boolean {
    return this.board[y] && this.board[y][x] && this.board[y][x].occupied
  }

  occupiedNear(x: number, y: number): boolean {
    return this.occupiedCell(x-1, y-1) ||
      this.occupiedCell(x-1, y) ||
      this.occupiedCell(x-1, y+1) ||
      this.occupiedCell(x+1, y-1) ||
      this.occupiedCell(x+1, y) ||
      this.occupiedCell(x+1, y+1) ||
      this.occupiedCell(x, y-1) ||
      this.occupiedCell(x, y+1)
  }

  addShip(ship: Ship, tries: number = 0): boolean {
    if (tries > 100) {
      return false
    }
    const width = this.board[0].length
    const height = this.board.length
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)

    if (Math.floor(Math.random() * 2)) {
      if (x + ship.length > width) {
        return this.addShip(ship, tries + 1)
      }

      for (let i = x; i < x + ship.length; i++) {
        if (this.board[y][i].occupied || this.occupiedNear(i, y)) {
          return this.addShip(ship, tries + 1)
        }
      }

      for (let i = x; i < x + ship.length; i++) {
        this.board[y][i].occupied = true
      }

      return true
    } else {
      if (y + ship.length > height) {
        return this.addShip(ship, tries + 1)
      }

      for (let i = y; i < y + ship.length; i++) {
        if (this.board[i][x].occupied || this.occupiedNear(x, i)) {
          return this.addShip(ship, tries + 1)
        }
      }

      for (let i = y; i < y + ship.length; i++) {
        this.board[i][x].occupied = true
      }

      return true
    }
  }

  attack(x: number, y: number): boolean {
    this.board[y][x].placed = true
    return this.board[y][x].occupied
  }
}

const board = new Board(10, 10)

board.addShip({ length: 1 })
board.addShip({ length: 1 })
board.addShip({ length: 1 })
board.addShip({ length: 1 })
board.addShip({ length: 2 })
board.addShip({ length: 2 })
board.addShip({ length: 2 })
board.addShip({ length: 3 })
board.addShip({ length: 3 })
board.addShip({ length: 4 })

board.print(true)

function inputLoop (callback: Function) {
  rl.question("> ", async (text: String) => {
    callback(text)
    inputLoop(callback)
  })
}

function handleInput (text: string) {
  const [x, y] = text.split(',')

  if (board.attack(parseInt(x), parseInt(y))) {
    console.log('HIT')
  }
  board.print(false)
}

inputLoop(handleInput)




