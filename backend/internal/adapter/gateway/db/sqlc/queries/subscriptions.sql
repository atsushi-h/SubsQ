-- name: GetSubscriptionByID :one
SELECT s.id, s.user_id, s.service_name, s.amount, s.billing_cycle,
       s.base_date, s.payment_method_id, s.memo, s.created_at, s.updated_at,
       pm.name AS payment_method_name
FROM subscriptions s
LEFT JOIN payment_methods pm ON s.payment_method_id = pm.id
WHERE s.id = $1 AND s.user_id = $2;

-- name: ListSubscriptionsByUserID :many
SELECT s.id, s.user_id, s.service_name, s.amount, s.billing_cycle,
       s.base_date, s.payment_method_id, s.memo, s.created_at, s.updated_at,
       pm.name AS payment_method_name
FROM subscriptions s
LEFT JOIN payment_methods pm ON s.payment_method_id = pm.id
WHERE s.user_id = $1
ORDER BY s.created_at DESC;

-- name: CreateSubscription :one
INSERT INTO subscriptions
  (user_id, service_name, amount, billing_cycle, base_date, payment_method_id, memo, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: UpdateSubscription :one
UPDATE subscriptions
SET service_name = $3,
    amount = $4,
    billing_cycle = $5,
    base_date = $6,
    payment_method_id = $7,
    memo = $8,
    updated_at = $9
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteSubscription :exec
DELETE FROM subscriptions
WHERE id = $1 AND user_id = $2;

-- name: DeleteSubscriptions :exec
DELETE FROM subscriptions
WHERE id = ANY($1::uuid[]) AND user_id = $2;

-- name: FindSubscriptionsByIDs :many
SELECT * FROM subscriptions
WHERE id = ANY($1::uuid[]) AND user_id = $2;
