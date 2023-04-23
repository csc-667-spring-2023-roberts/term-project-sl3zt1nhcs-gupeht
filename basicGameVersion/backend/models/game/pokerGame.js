const pokerLogic = require('./pokerLogic');

class PokerGame {
  constructor(numPlayers) {
    this.players = this.createPlayers(numPlayers);
    this.deck = this.createDeck();
    this.communityCards = [];
    this.pot = 0;
    this.currentPlayer = this.players[0];
  }

  createPlayers(numPlayers) {
    const players = [];

    for (let i = 0; i < numPlayers; i++) {
      players.push({
        id: i,
        name: `Player ${i + 1}`,
        chips: 100,
        currentBet: 0,
        status: 'active',
        hand: [],
      });
    }

    return players;
  }

  createDeck() {
    const deck = [];

    for (const suit of pokerLogic.suits) {
      for (const rank of pokerLogic.ranks) {
        deck.push({ suit, rank });
      }
    }

    pokerLogic.shuffleDeck(deck);
    return deck;
  }

  playRound() {
    pokerLogic.dealCards(this.players, this.deck);
    this.communityCards = [];

    // Betting round (pre-flop)
    this.handleBettingRound();

    // Deal community cards and handle betting rounds (flop, turn, river)
    const stages = ['flop', 'turn', 'river'];
    for (const stage of stages) {
      pokerLogic.dealCommunityCards(stage, this.deck, this.communityCards);
      this.handleBettingRound();
    }

    // Evaluate hands and determine the winner
    pokerLogic.evaluateHands(this.players, this.communityCards);
    const winners = pokerLogic.determineWinner(this.players);

    // Distribute the pot to the winners
    const potShare = this.pot / winners.length;
    winners.forEach((winner) => {
      winner.chips += potShare;
    });

    // Reset the game state for the next round
    this.resetGameState();
  }

  handleBettingRound() {
    const result = pokerLogic.handleBettingRound(
      this.players,
      this.pot,
      this.currentPlayer
    );

    if (result) {
      // If there's a winner, return early and don't continue the round
      return;
    }
  }

  resetGameState() {
    this.players.forEach((player) => {
      player.currentBet = 0;
      player.hand = [];
      player.status = 'active';
    });

    this.deck = this.createDeck();
    this.communityCards = [];
    this.pot = 0;
  }


  addPlayers(playerIds) {
    // Add players to the game using their playerIds.
    // You can fetch player details from the database and create player objects.
    this.players = playerIds.map((playerId) => ({
      id: playerId,
      hand: [],
      chips: 1000, // Assign a default chip count.
    }));
  }

  dealCards() {
    // Shuffle the deck and deal two cards to each player.
    this.deck = pokerLogic.shuffleDeck(this.deck);
    this.players.forEach((player) => {
      player.hand.push(this.deck.pop());
      player.hand.push(this.deck.pop());
    });
  }


  removePlayer(playerId) {
    this.players = this.players.filter(player => player.id !== playerId);
  }


  startGame() {
    if (this.players.length < 2) {
      throw new CustomError('Not enough players to start the game', 400);
    }

    this.dealCards();
    this.handleBettingRound();
  }

}

module.exports = PokerGame;
