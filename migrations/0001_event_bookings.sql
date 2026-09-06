PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS event_bookings (
  id TEXT PRIMARY KEY,
  lookup_token TEXT NOT NULL UNIQUE,
  event_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  seat_ids TEXT NOT NULL,
  seat_count INTEGER NOT NULL CHECK (seat_count BETWEEN 1 AND 14),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('held', 'paid', 'expired', 'refunded', 'cancelled')),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  hold_expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  paid_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_seat_reservations (
  event_id TEXT NOT NULL,
  seat_id TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('held', 'sold')),
  hold_expires_at TEXT,
  created_at TEXT NOT NULL,
  sold_at TEXT,
  PRIMARY KEY (event_id, seat_id),
  FOREIGN KEY (booking_id) REFERENCES event_bookings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_bookings_event_status
ON event_bookings (event_id, status);

CREATE INDEX IF NOT EXISTS idx_event_seats_event_status
ON event_seat_reservations (event_id, status);

CREATE INDEX IF NOT EXISTS idx_event_seats_hold_expiration
ON event_seat_reservations (hold_expires_at)
WHERE status = 'held';

PRAGMA optimize;
