-- name: UpsertUser :one                                  
INSERT INTO users (email, name, provider, provider_account_id, thumbnail,
created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (email)
DO UPDATE SET
    name               = EXCLUDED.name,
    provider           = EXCLUDED.provider,
    provider_account_id = EXCLUDED.provider_account_id,
    thumbnail          = EXCLUDED.thumbnail,
    updated_at         = EXCLUDED.updated_at
RETURNING *;

-- name: FindUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: UpdateUser :one
UPDATE users
SET name       = COALESCE(sqlc.narg('name'), name),
    thumbnail  = CASE WHEN sqlc.narg('set_thumbnail')::boolean THEN sqlc.narg('thumbnail') ELSE thumbnail END,
    updated_at = sqlc.arg('updated_at')
WHERE id = sqlc.arg('id')
RETURNING *;
