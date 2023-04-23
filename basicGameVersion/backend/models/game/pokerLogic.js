const pokerLogic = {};

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const MAX_RAISE_AMOUNT = 10; 


pokerLogic.shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
};

pokerLogic.dealCards = (players, deck) => {
  players.forEach((player) => {
    player.hand = [deck.pop(), deck.pop()];
  });
};

pokerLogic.dealCommunityCards = (stage, deck, communityCards) => {
  if (stage === 'flop') {
    communityCards.push(deck.pop(), deck.pop(), deck.pop());
  } else if (stage === 'turn' || stage === 'river') {
    communityCards.push(deck.pop());
  }
};

// Helper function to evaluate if the given cards have a flush
const isFlush = (cards) => {
    const suits = {};
    cards.forEach((card) => {
      suits[card.suit] = (suits[card.suit] || 0) + 1;
    });
    return Object.values(suits).some((count) => count >= 5);
  };


  // Helper function to evaluate if the given cards have a straight
const isStraight = (cards) => {
    const rankValues = cards.map((card) => {
      const rankValue = ranks.indexOf(card.rank) + 2;
      return rankValue === 14 ? [1, 14] : [rankValue];
    });
    const uniqueRanks = new Set(rankValues.flat());
    const sortedRanks = Array.from(uniqueRanks).sort((a, b) => a - b);
  
    for (let i = 0; i < sortedRanks.length - 4; i++) {
      if (
        sortedRanks[i] + 1 === sortedRanks[i + 1] &&
        sortedRanks[i] + 2 === sortedRanks[i + 2] &&
        sortedRanks[i] + 3 === sortedRanks[i + 3] &&
        sortedRanks[i] + 4 === sortedRanks[i + 4]
      ) {
        return true;
      }
    }
  
    return false;
  };

  pokerLogic.evaluateHands = (players, communityCards) => {
    players.forEach((player) => {
      const allCards = player.hand.concat(communityCards);
      player.flush = isFlush(allCards);
      player.straight = isStraight(allCards);
    });
  };


  pokerLogic.determineWinner = (players) => {
    let winners = [];
    let bestHandRank = -1;
  
    players.forEach((player) => {
      let handRank;
  
      if (player.flush && player.straight) {
        handRank = 8; // Straight flush
      } else if (player.flush) {
        handRank = 5; // Flush
      } else if (player.straight) {
        handRank = 4; // Straight
      } else {
        handRank = 0; // High card (placeholder for simplicity)
      }
  
      if (handRank > bestHandRank) {
        winners = [player];
        bestHandRank = handRank;
      } else if (handRank === bestHandRank) {
        winners.push(player);
      }
    });
  
    return winners;
  };



pokerLogic.handleBettingRound = (players, pot, currentPlayer) => {
    let highestBet = 0;
    let activePlayers = players.filter((player) => player.status === 'active');
  
    // Determine the highest bet so far
    activePlayers.forEach((player) => {
      if (player.currentBet > highestBet) {
        highestBet = player.currentBet;
      }
    });
  
    // Loop through the players and receive their actions
    for (let i = 0; i < activePlayers.length; i++) {
      const player = activePlayers[i];
  
      if (player === currentPlayer) {
        // The current player can bet, call, raise, or fold
        const maxBet = player.chips + player.currentBet;
        const minBet = highestBet === 0 ? 1 : highestBet;
        const options = {
          bet: Math.min(maxBet, minBet + MAX_RAISE_AMOUNT),
          call: highestBet - player.currentBet,
          raise: Math.min(maxBet, highestBet + MAX_RAISE_AMOUNT) - player.currentBet,
          fold: true,
        };
        // TODO: Send the options to the frontend and receive the player's choice
        // Example: const action = await promptAction(player.name, options);
  
        // Handle the player's action
        if (action === 'bet' && options.bet >= minBet) {
          player.chips -= options.bet - player.currentBet;
          player.currentBet = options.bet;
          pot += options.bet - player.currentBet;
        } else if (action === 'call') {
          player.chips -= options.call;
          player.currentBet += options.call;
          pot += options.call;
        } else if (action === 'raise' && options.raise > 0) {
          player.chips -= options.raise;
          player.currentBet += options.raise;
          pot += options.raise;
          highestBet += options.raise;
        } else {
          player.status = 'folded';
        }
      } else {
        // The other players can either call, raise, or fold
        const options = {
          call: highestBet - player.currentBet,
          raise: Math.min(player.chips, highestBet + MAX_RAISE_AMOUNT) - player.currentBet,
          fold: true,
        };
  
        if (options.call === 0) {
          // The player can only raise or fold if the current bet is 0
          delete options.call;
        }
  
        // TODO: Get the player's choice (call, raise, or fold) from the backend or a simulated AI
        // Example: const choice = getPlayerChoice(player, options);
  
        if (choice === 'call') {
          player.chips -= options.call;
          player.currentBet += options.call;
          pot += options.call;
        } else if (choice === 'raise' && options.raise > 0) {
          const raiseAmount = Math.min(options.raise, MAX_RAISE_AMOUNT);
          player.chips -= options.raise;
          player.currentBet += options.raise;
          pot += options.raise;
          highestBet += options.raise;
          // TODO: Notify other players of the raise
          // Example: notifyRaise(player, raiseAmount);
        } else {
          player.status = 'folded';

        }

        // Check if all but one player have folded
        if (activePlayers.filter((player) => player.status === 'active').length === 1) {
          const winner = activePlayers.find((player) => player.status === 'active');
          winner.chips += pot;
          return winner;
        }
      }
      // If all players have called or folded, return null
      return null;
    }
};

module.exports = pokerLogic;