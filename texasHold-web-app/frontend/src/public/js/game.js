
async function createGame() {
    const tablename = document.querySelector('#create-game-form input[tableName="tableName"]').value;
    const maxPlayers = document.querySelector('#create-game-form input[maxPlayers="maxPlayers"]').value;
    const minBuyin = document.querySelector('#create-game-form input[minBuyIn="minBuyIn"]').value;
    const maxBuyIn = document.querySelector('#create-game-form input[maxBuyIn="maxBuyIn"]').value;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/game/create", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ tablename, maxPlayers, minBuyin, maxBuyIn }),
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


//TODO
async function joinGame(gameId) {
   
}

 //TODO CHANGE IMPLEMENTATION
async function getGameList() {
   
    const response = await fetch("/game/list");
    const games = await response.json();

    const gameListElement = document.getElementById("game-list");

    if (games.length === 0) {
        gameListElement.innerHTML = "<p>No games available. Create one!</p>";
    } else {
        const gameItems = games.map((game) => {
            return `<div>
                <h3>${game.tableName}</h3>
                <p>Players: ${game.players.length}/${game.maxPlayers}</p>
                <p>Buy-In: ${game.minBuyIn} - ${game.maxBuyIn}</p>
                <button class="join-game" data-game-id="${game._id}">Join</button>
              </div>`;
        });
        gameListElement.innerHTML = gameItems.join("");
    }
}

