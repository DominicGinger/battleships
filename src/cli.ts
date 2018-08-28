import * as readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

export function inputLoop (callback: Function) {
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


