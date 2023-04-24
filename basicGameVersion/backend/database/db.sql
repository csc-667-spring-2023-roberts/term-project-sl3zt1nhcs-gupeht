CREATE TABLE tables (
    table_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    max_players INTEGER NOT NULL,
    min_buy_in NUMERIC(10, 2) NOT NULL,
    max_buy_in NUMERIC(10, 2) NOT NULL
);


CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    table_id INTEGER NOT NULL REFERENCES tables(table_id),
    start_time TIMESTAMP NOT NULL
);


CREATE TABLE games_data (
    game_data_id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(game_id),
    game_data JSON NOT NULL
);


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);


CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    game_id INTEGER NOT NULL REFERENCES games(game_id),
    buy_in NUMERIC(10, 2) NOT NULL,
    cash_out NUMERIC(10, 2) NOT NULL,
    UNIQUE (user_id, game_id)
);


CREATE TABLE chat_rooms (
    chat_room_id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL UNIQUE REFERENCES games(game_id)
);


CREATE TABLE chat_messages (
    chat_message_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    game_id INTEGER NOT NULL REFERENCES games(game_id),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);
