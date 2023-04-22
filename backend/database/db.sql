CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS game_tables (
  table_id SERIAL PRIMARY KEY,
  max_players INTEGER NOT NULL DEFAULT 9,
  dealer_id INTEGER,
  small_blind INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS games (
  game_id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES game_tables(table_id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  winner_id INTEGER,
  is_done BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_games_table_id ON games(table_id);
CREATE INDEX idx_games_winner_id ON games(winner_id);

CREATE TABLE IF NOT EXISTS players (
  player_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);

CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_status ON players(status);

CREATE TABLE IF NOT EXISTS hands (
  hand_id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE INDEX idx_hands_player_id ON hands(player_id);
CREATE INDEX idx_hands_game_id ON hands(game_id);

CREATE TABLE IF NOT EXISTS cards (
  card_id SERIAL PRIMARY KEY,
  suit VARCHAR(10) NOT NULL,
  rank VARCHAR(5) NOT NULL
);

CREATE INDEX idx_cards_suit_rank ON cards(suit, rank);


CREATE TABLE IF NOT EXISTS card_in_hand (
  card_id INTEGER NOT NULL REFERENCES cards(card_id),
  hand_id INTEGER NOT NULL REFERENCES hands(hand_id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, hand_id)
);

CREATE INDEX idx_card_in_hand_card_id ON card_in_hand(card_id);
CREATE INDEX idx_card_in_hand_hand_id ON card_in_hand(hand_id);

-- Add the hol_cards table
CREATE TABLE IF NOT EXISTS hol_cards (
  game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL REFERENCES cards(card_id),
  PRIMARY KEY (game_id, card_id)
);

CREATE INDEX idx_hol_cards_game_id ON hol_cards(game_id);
CREATE INDEX idx_hol_cards_card_id ON hol_cards(card_id);

CREATE TABLE IF NOT EXISTS chat (
  chat_id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(game_id),
  player_id INTEGER REFERENCES players(player_id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);