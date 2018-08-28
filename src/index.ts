import { Board } from './board'
import { inputLoop } from './cli'

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

function handleInput (text: string): boolean {
  const [x, y] = text.split(',')

  if (board.attack(parseInt(x), parseInt(y))) {
    console.log('HIT')
  }
  board.print(false)

  return board.checkFinished()
}

inputLoop(handleInput)

