import * as readline from 'readline'
import { Board } from './board'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
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

