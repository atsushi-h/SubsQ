-- name: GetPaymentMethodByID :one
SELECT * FROM payment_methods
WHERE id = $1 AND user_id = $2;

-- name: ListPaymentMethodsByUserID :many
SELECT * FROM payment_methods
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: CreatePaymentMethod :one
INSERT INTO payment_methods (user_id, name, created_at, updated_at)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdatePaymentMethod :one
UPDATE payment_methods
SET name = $2, updated_at = $3
WHERE id = $1 AND user_id = $4
RETURNING *;

-- name: DeletePaymentMethod :exec
DELETE FROM payment_methods
WHERE id = $1 AND user_id = $2;

-- name: DeletePaymentMethods :exec
DELETE FROM payment_methods
WHERE id = ANY($1::uuid[]) AND user_id = $2;

-- name: FindPaymentMethodsByIDs :many
SELECT * FROM payment_methods
WHERE id = ANY($1::uuid[]) AND user_id = $2;

