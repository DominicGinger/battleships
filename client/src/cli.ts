import * as readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

type coords = {
  x: number,
  y: number
} | null

export function inputLoop (callback: Function): void {
  rl.question("> ", (text: String) => {
    const handled = handleText(text)
    if (!handled) {
      console.log('Invalid coords, expected `x,y`.')
      inputLoop(callback)
      return
    }
    const { x, y } = handled
    const cont = callback(x, y)

    if (cont) {
      console.log('finished')
      process.exit(0)
    } else {
      inputLoop(callback)
    }
  })
}

function handleText(text: String): coords {
  const spl = text.split(',')

  if (spl.length !== 2) {
    return null
  }

  const x = parseInt(spl[0])
  const y = parseInt(spl[1])

  if (isNaN(x) || isNaN(y)) {
    return null
  }

  return { x, y }
}

