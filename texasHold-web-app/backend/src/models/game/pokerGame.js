const pokerLogic = require("./pokerLogic");

class PokerGame {
   
    constructor(numPlayers) {
        this.players = this.createPlayers(numPlayers);
        this.deck = pokerLogic.createDeck();
        this.communityCards = [];
        this.pot = 0;
        this.currentPlayer = this.players[0];
        this.smallBlind = 1;
        this.bigBlind = 2;
    }
   

    createEmptySeats(numPlayers){

        const players =[];

        for ( let i = 0; i < numPlayers; i++){

            players.push({
                id:null,
                name: null,
                chips:0,
                currentBet:0,
                status:"empty",
                hand:[],
            });
        }

        return players;
    }


    assignEmptySeat ( user_id, username){

        const emptySeat = this.players.find((player)=> player.status==="empty");

        if ( emptySeat){
            emptySeat.id = user_id;
            emptySeat.name = username;
            emptySeat.status ="active";
            emptySeat.chips = 100;
        }
        return emptySeat;
    }

    assignPlayerToEmptySeat(user_id, username) {
        const emptySeat = this.players.find((player) => player.status === "empty");
    
        if (emptySeat) {
            emptySeat.id = user_id;
            emptySeat.name = username;
            emptySeat.chips = 100;
            emptySeat.status = "active";
        }
    
        return emptySeat;
    }
 
    removePlayer(user_id) {
        const playerIndex = this.players.findIndex((player) => player.id === user_id);
        if (playerIndex !== -1) {
            this.players[playerIndex] = {
                id: null,
                name: null,
                chips: 0,
                currentBet: 0,
                status: "empty",
                hand: [],
            };
        }
    }
   
    playRound() {
        this.deck = pokerLogic.shuffleDeck(this.deck);
        pokerLogic.dealCards(this.players, this.deck);
        this.communityCards = [];

        this.handleBlindBets();
        // Betting round (pre-flop)
        this.handleBettingRound();

        // Deal community cards and handle betting rounds (flop, turn, river)
        const stages = ["flop", "turn", "river"];
        for (const stage of stages) {
            pokerLogic.dealCommunityCards(stage, this.deck, this.communityCards);
            this.handleBettingRound();
        }

        // Evaluate hands and determine the winner
        pokerLogic.evaluateHands(this.players, this.communityCards);
        const winners = pokerLogic.determineWinner(this.players);

        // Distribute the pot to the winners
        this.distributePot(winners);

        this.removeBrokePlayers();

        this.rotateDealer();
        // Reset the game state for the next round
        this.resetGameState();
    }

 
    handleBlindBets() {
        const smallBlindPlayer = this.getNextActivePlayer(this.currentPlayer);
        const bigBlindPlayer = this.getNextActivePlayer(smallBlindPlayer);

        smallBlindPlayer.currentBet = this.smallBlind;
        smallBlindPlayer.chips -= this.smallBlind;

        bigBlindPlayer.currentBet = this.bigBlind;
        bigBlindPlayer.chips -= this.bigBlind;

        this.currentPlayer = this.getNextActivePlayer(bigBlindPlayer);
    }

    
    getNextActivePlayer(currentPlayer) {
        const startIndex = this.players.indexOf(currentPlayer);
        let index = startIndex;
        do {
            index = (index + 1) % this.players.length;
        } while (this.players[index].status !== "active" && index !== startIndex);
        return this.players[index];
    }

   
    handlePlayerAction(playerId, action, amount) {
        const player = this.players.find((p) => p.id === playerId);

        if (!player) {
            throw new Error("Player not found");
        }

        switch (action) {
            case "fold":
                player.status = "folded";
                break;
            case "call":
                const highestBet = Math.max(...this.players.map((p) => p.currentBet));
                player.chips -= highestBet - player.currentBet;
                player.currentBet = highestBet;
                break;
            case "raise":
                const totalBet = player.currentBet + amount;
                if (totalBet > player.chips) {
                    throw new Error("Not enough chips to raise");
                }
                player.chips -= amount;
                player.currentBet = totalBet;
                break;

            case "check":
                break;

            case "all-in":
                player.currentBet += player.chips;
                player.chips = 0;
                break;
            default:
                throw new Error("Invalid action");
        }
    }

   
    handleBettingRound(minBet = 1) {
        pokerLogic.handleBettingRound(this.players, this.currentPlayer, minBet);

        this.pot = this.players.reduce((acc, player) => acc + player.currentBet, 0);
    }

    removeBrokePlayers() {
        this.players = this.players.filter((player) => player.chips > 0);
    }

    
    rotateDealer() {
        this.currentPlayer = this.getNextActivePlayer(this.currentPlayer);
    }

   
    distributePot(winners) {
        const totalPot = this.pot;
        const potShare = Math.floor(totalPot / winners.length);

        winners.forEach((winner) => {
            winner.chips += potShare;
        });

        //Distribute any remaining chips due to the rounding
        let remainingChips = totalPot - potShare * winners.length;
        for (const winner of winners) {
            if (remainingChips <= 0) break;
            winner.chips += 1;
            remainingChips -= 1;
        }
    }

   
    resetGameState() {
        this.players.forEach((player) => {
            player.currentBet = 0;
            player.hand = [];
            player.status = "active";
        });

        this.deck = pokerLogic.createDeck();
        this.communityCards = [];
        this.pot = 0;
    }

   
    getState() {
        return {
            players: this.players,
            communityCards: this.communityCards,
            pot: this.pot,
            currentPlayer: this.currentPlayer,
        };
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
        pokerGame.smallBlind = data.smallBlind;
        pokerGame.bigBlind = data.bigBlind;
        return pokerGame;
    }
}

module.exports = PokerGame;
