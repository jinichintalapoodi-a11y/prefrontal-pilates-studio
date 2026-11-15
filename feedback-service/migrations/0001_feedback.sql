-- Dedicated feedback records; never join to gameplay analytics, accounts or devices.
CREATE TABLE IF NOT EXISTS feedback (
 id TEXT PRIMARY KEY NOT NULL,
 game TEXT NOT NULL CHECK (game IN ('stargazer','sentinel')),
 enjoyment TEXT NOT NULL CHECK (enjoyment IN ('Loved it','Liked it','It was okay','Didn''t enjoy it')),
 challenge TEXT NOT NULL CHECK (challenge IN ('Too easy','Just right','Too difficult','Some parts were confusing')),
 replay TEXT NOT NULL CHECK (replay IN ('Yes','Maybe','No')),
 enjoyed_most TEXT NOT NULL DEFAULT '',
 improvements TEXT NOT NULL DEFAULT '',
 difficulties TEXT NOT NULL DEFAULT '',
 submitted_at TEXT NOT NULL,
 expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_date ON feedback (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_expiry ON feedback (expires_at);
CREATE INDEX IF NOT EXISTS idx_feedback_game ON feedback (game, submitted_at DESC);
