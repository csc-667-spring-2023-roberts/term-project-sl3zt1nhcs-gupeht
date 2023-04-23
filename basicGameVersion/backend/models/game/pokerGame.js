const pokerLogic = require('./pokerLogic');

class PokerGame {
  constructor(numPlayers) {
    this.players = this.createPlayers(numPlayers);
    this.deck = pokerLogic.createDeck();
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


  addPlayers(playerIds) {
    playerIds.forEach((playerId) => {
      this.players.push({
        id: playerId,
        name: `Player ${playerId + 1}`,
        chips: 100,
        currentBet: 0,
        status: 'active',
        hand: [],
      });
    });
  }

  removePlayer(playerId) {
    const index = this.players.findIndex((player) => player.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }


  playRound() {
    this.deck = pokerLogic.shuffleDeck(this.deck);
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

  handleBettingRound(minBet = 1) {
    pokerLogic.handleBettingRound(this.players, this.currentPlayer, minBet);

    this.pot = this.players.reduce((acc, player) => acc + player.currentBet, 0);
  }
 

  resetGameState() {
    this.players.forEach((player) => {
      player.currentBet = 0;
      player.hand = [];
      player.status = 'active';
    });

    this.deck = pokerLogic.createDeck();
    this.communityCards = [];
    this.pot = 0;
  }




  toJson() {
    return JSON.stringify({
      players: this.players,
      deck: this.deck,
      communityCards: this.communityCards,
      pot: this.pot,
      currentPlayer: this.currentPlayer,
    });
  }

  static fromJson(json) {
    const data = JSON.parse(json);
    const pokerGame = new PokerGame(data.players.length);
    pokerGame.players = data.players;
    pokerGame.deck = data.deck;
    pokerGame.communityCards = data.communityCards;
    pokerGame.pot = data.pot;
    pokerGame.currentPlayer = data.currentPlayer;
    return pokerGame;
  }
}

module.exports = PokerGame;
