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

  print(): void {
    this.board.forEach(row => {
      row.forEach(cell => {
        if (cell.occupied) {
          process.stdout.write('1 ')
        } else {
          process.stdout.write('0 ')
        }
      })
      process.stdout.write('\n')
    })
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
        if (this.board[y][i].occupied) {
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
        if (this.board[i][x].occupied) {
          return this.addShip(ship, tries + 1)
        }
      }

      for (let i = y; i < y + ship.length; i++) {
        this.board[i][x].occupied = true
      }

      return true
    }
  }

}

const board = new Board(10, 10)

board.addShip({ length: 3 })
board.print()
