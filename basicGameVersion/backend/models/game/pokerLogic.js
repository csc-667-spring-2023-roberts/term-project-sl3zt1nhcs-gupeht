const pokerLogic = {};

pokerLogic.suits = ["hearts", "diamonds", "clubs", "spades"];
pokerLogic.ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

pokerLogic.createDeck = () => {
    const deck = [];

    for (const suit of pokerLogic.suits) {
        for (const rank of pokerLogic.ranks) {
            deck.push({ suit, rank });
        }
    }

    return deck;
};

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
    if (stage === "flop") {
        communityCards.push(deck.pop(), deck.pop(), deck.pop());
    } else if (stage === "turn" || stage === "river") {
        communityCards.push(deck.pop());
    }
};

pokerLogic.evaluateHands = (players, communityCards) => {
    players.forEach((player) => {
        const allCards = player.hand.concat(communityCards);
        player.flush = pokerLogic.isFlush(allCards);
        player.straight = pokerLogic.isStraight(allCards);
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
    // Your existing handleBettingRound implementation goes here
};

pokerLogic.isFlush = (cards) => {
    const suits = {};
    cards.forEach((card) => {
        suits[card.suit] = (suits[card.suit] || 0) + 1;
    });
    return Object.values(suits).some((count) => count >= 5);
};

pokerLogic.isStraight = (cards) => {
    const ranks = pokerLogic.ranks;
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

module.exports = pokerLogic;
