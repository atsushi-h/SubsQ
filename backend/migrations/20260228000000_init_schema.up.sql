CREATE TABLE users (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT        NOT NULL UNIQUE,
  name                TEXT        NOT NULL,
  provider            TEXT        NOT NULL,
  provider_account_id TEXT        NOT NULL,
  thumbnail           TEXT,
  created_at          INTEGER     NOT NULL,
  updated_at          INTEGER     NOT NULL,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE payment_methods (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  created_at INTEGER     NOT NULL,
  updated_at INTEGER     NOT NULL
);

CREATE TABLE subscriptions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE
CASCADE,
  service_name      TEXT        NOT NULL,
  amount            INTEGER     NOT NULL CHECK (amount >= 0 AND amount <=
1000000),
  billing_cycle     TEXT        NOT NULL CHECK (billing_cycle IN ('monthly',
  'yearly')),
  base_date         INTEGER     NOT NULL CHECK (base_date >= 1 AND base_date
  <= 31),
  payment_method_id UUID        REFERENCES payment_methods(id) ON DELETE
RESTRICT,
  memo              TEXT,
  created_at        INTEGER     NOT NULL,
  updated_at        INTEGER     NOT NULL
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_payment_method_id ON subscriptions(payment_method_id);
