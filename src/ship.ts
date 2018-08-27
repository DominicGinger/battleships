export type Deck = {
  x: number,
  y: number,
  hit: boolean
}

export class Ship {
  decks: Array<Deck>

    constructor(x: number, y: number, length: number, direction: string) {
      this.decks = []
      if (direction === 'right') {
        for (let i = 0; i < length; i++) {
          this.decks.push({ x: x + i, y, hit: false })
        }
      } else {
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

