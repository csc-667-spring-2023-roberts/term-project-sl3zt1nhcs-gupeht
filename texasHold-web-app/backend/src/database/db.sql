CREATE TABLE IF NOT EXISTS games (
    game_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS tables (
    table_id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    max_players INTEGER NOT NULL,
    min_buy_in NUMERIC(10, 2) NOT NULL,
    max_buy_in NUMERIC(10, 2) NOT NULL
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
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    buy_in NUMERIC(10, 2) NOT NULL,
    cash_out NUMERIC(10, 2) NOT NULL,
    UNIQUE (user_id, game_id)
);
