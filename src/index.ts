import { Board } from './board'
import { inputLoop } from './cli'

const size = 10

const board1 = new Board(size, size)
const board2 = new Board(size, size)

board1.print(true)
console.log('')
board2.print(true)

function handleInput (x: number, y:number): boolean {
  if (board1.attack(x, y)) {
    console.log('HIT')
  }
  board1.print(false)

  console.log('player 2 turn')
  board2.attack(Math.floor(Math.random()*size), Math.floor(Math.random()*size))
  board2.print(false)

  return board1.checkFinished() || board2.checkFinished()
}

inputLoop(handleInput)

