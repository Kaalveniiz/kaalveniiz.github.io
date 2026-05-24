CREATE TABLE IF NOT EXISTS totals (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_bot_visits INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily (
  day TEXT PRIMARY KEY,
  today_visits INTEGER NOT NULL DEFAULT 0,
  today_bot_visits INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO totals (id, total_visits, total_bot_visits) VALUES (1, 0, 0);
