CREATE TABLE IF NOT EXISTS visitors (
  visitor_hash TEXT PRIMARY KEY,
  first_seen_day TEXT NOT NULL,
  last_seen_day TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS visitors_first_seen_day ON visitors (first_seen_day);

CREATE TABLE IF NOT EXISTS daily_visitors (
  day TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY (day, visitor_hash)
);

CREATE TABLE IF NOT EXISTS daily_ai_reads (
  day TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('crawler', 'search', 'assistant')),
  reads INTEGER NOT NULL CHECK (reads >= 0),
  PRIMARY KEY (day, category)
);
