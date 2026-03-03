-- name: UpsertUser :one                                  
INSERT INTO users (email, name, provider, provider_account_id, thumbnail,
created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (provider, provider_account_id)
DO UPDATE SET
    email      = EXCLUDED.email,
    name       = EXCLUDED.name,
    thumbnail  = EXCLUDED.thumbnail,
    updated_at = EXCLUDED.updated_at
RETURNING *;

-- name: FindUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;
