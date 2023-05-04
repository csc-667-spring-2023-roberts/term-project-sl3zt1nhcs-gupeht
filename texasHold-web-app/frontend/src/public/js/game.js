//game/js for the front end
export async function createGame() {
   
    const maxPlayers = document.querySelector('#create-game-form input[name="maxPlayers"]').value;
    const minBuyin = document.querySelector('#create-game-form input[name="minBuyIn"]').value;
    const maxBuyIn = document.querySelector('#create-game-form input[name="maxBuyIn"]').value;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/game/create", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ maxPlayers, minBuyin, maxBuyIn }),
        });

        const responseData = await response.json();

        if (response.status === 200) {
            messageDiv.textContent = "Joined Game";

            /*
      setTimeout(()=>{
        loocation.href = '/game/play'
      })
      */
        } else if (response.status === 409) {
            messageDiv.textContent = responseData.message;
        } else {
            messageDiv.textContent = "An error occurred during creating game";
        }
    } catch (error) {
        messageDiv.textContent = message.error;
    }
}


export async function joinGame(gameId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`/game/join/${gameId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();

        if (response.status === 200) {
            messageDiv.textContent = `${responseData.username} joined the game`;
        } else {
            messageDiv.textContent = responseData.message || "An error occurred while joining the game";
        }
    } catch (error) {
        messageDiv.textContent = error.message;
    }
}


export async function getGameList() {
    const gameListElement = document.getElementById("game-list");
    const response = await fetch("/game/list");
    const games = await response.json();
  
    if (games.length === 0) {
        gameListElement.innerHTML = "<p>No games available. Create one!</p>";
    } else {
        const gameItems = games.map((game) => {
            const availableSpaces = game.maxPlayers - game.players.length;
            return `<div class="game-item" data-game-id="${game._id}">
                <p>Players: ${game.players.length}/${game.maxPlayers} (Available spaces: ${availableSpaces})</p>
                <p>Buy-In: ${game.minBuyIn} - ${game.maxBuyIn}</p>
                <button class="join-game">Join</button>
                </div>`;
          });
            gameListElement.innerHTML = gameItems.join("");
        }
    }