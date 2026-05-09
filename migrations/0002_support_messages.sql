-- ═══════════════════════════════════════════════════════════════════════════
-- Adds the `support_messages` table backing /api/support/contact. The public
-- support form posts here; the admin panel lists rows so we never lose a
-- ticket if email delivery is misconfigured.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS support_messages (
  id           TEXT PRIMARY KEY,
  user_id      TEXT,                          -- nullable: form is open to logged-out visitors
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  message      TEXT NOT NULL,
  ip           TEXT,
  ua           TEXT,
  status       TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'in_progress' | 'closed'
  resolved_at  INTEGER,
  created_at   INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_support_messages_time   ON support_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON support_messages (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_email  ON support_messages (email);
