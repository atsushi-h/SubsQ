-- name: UpsertPushSubscription :one
INSERT INTO push_subscriptions
  (user_id, endpoint, p256dh, auth, user_agent, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (endpoint) DO UPDATE
  SET user_id    = EXCLUDED.user_id,
      p256dh     = EXCLUDED.p256dh,
      auth       = EXCLUDED.auth,
      user_agent = EXCLUDED.user_agent,
      updated_at = EXCLUDED.updated_at
RETURNING *;

-- name: DeletePushSubscriptionByEndpoint :exec
DELETE FROM push_subscriptions
WHERE endpoint = $1 AND user_id = $2;

-- name: DeletePushSubscriptionByID :exec
DELETE FROM push_subscriptions
WHERE id = $1;

-- name: ListPushSubscriptionsByUserID :many
SELECT * FROM push_subscriptions
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: ListAllPushSubscriptions :many
SELECT * FROM push_subscriptions
ORDER BY created_at DESC;
