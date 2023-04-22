class Deck {
    constructor() {
      this.cards = [];
      this.createDeck();
    }
  
    createDeck() {
      const suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
      const ranks = ["Ace", "King", "Queen", "Jack", "Ten", "Nine", "Eight", "Seven", "Six", "Five", "Four", "Three", "Two"];
      for (let suit of suits) {
        for (let rank of ranks) {
          this.cards.push({ suit, rank });
        }
      }
      this.shuffle();
    }
  
    shuffle() {
      for (let i = this.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
    }
  
    drawCards(numCards) {
      if (numCards > this.cards.length) {
        throw new Error("Not enough cards in the deck.");
      }
      const drawnCards = [];
      for (let i = 0; i < numCards; i++) {
        drawnCards.push(this.cards.pop());
      }
      return drawnCards;
    }
  
    resetDeck() {
      this.cards = [];
      this.createDeck();
    }
  }
  
  module.exports = Deck;
  