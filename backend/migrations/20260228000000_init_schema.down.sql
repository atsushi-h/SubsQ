DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS users;

DROP INDEX IF EXISTS idx_subscriptions_payment_method_id;                   
DROP INDEX IF EXISTS idx_subscriptions_user_id;                             
DROP INDEX IF EXISTS idx_payment_methods_user_id;
