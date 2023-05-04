


CREATE TABLE IF NOT EXISTS  game (
    game_id SERIAL PRIMARY KEY,
    game_inv_code VARCHAR(255) NOT NULL,
    chips INTEGER NOT NULL,
    num_players INTEGER NOT NULL,
    num_rounds INTEGER NOT NULL,
    min_bet INTEGER NOT NULL,
    curr_round INTEGER NOT NULL,
    main_pot INTEGER NOT NULL,
    curr_round_pot INTEGER NOT NULL,
    curr_player_turn INTEGER NOT NULL

);




CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    auth_token VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS players (
    player_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    game_id INTEGER NOT NULL REFERENCES game(game_id),
    buy_in NUMERIC(10, 2) NOT NULL,
    cash_out NUMERIC(10, 2) NOT NULL,
    UNIQUE (user_id, game_id)
);

