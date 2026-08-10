-- ============================================================
-- INDEX PERFORMANCE VALIDATION v5.0
-- Run these queries in MySQL to verify index usage
-- ============================================================

USE food_roulette;

-- ============================================================
-- CHECK 2.1: Verify indexes exist
-- ============================================================
SHOW INDEXES FROM users;
SHOW INDEXES FROM restaurants;
SHOW INDEXES FROM spin_sessions;
SHOW INDEXES FROM votes;
SHOW INDEXES FROM lockets;
SHOW INDEXES FROM check_ins;
SHOW INDEXES FROM friendships;
SHOW INDEXES FROM group_members;

-- ============================================================
-- CHECK 2.2: EXPLAIN critical queries
-- Replace 'YOUR_USER_ID' with actual user_id from users table
-- ============================================================

-- Query: Get user's active check-ins (critical for locket feed)
EXPLAIN SELECT * FROM check_ins 
WHERE user_id = 'YOUR_USER_ID' 
  AND status = 'ACTIVE' 
  AND expires_at > NOW();

-- Query: Get locket feed (public visibility)
EXPLAIN SELECT * FROM lockets 
WHERE visibility = 'PUBLIC' 
ORDER BY captured_at DESC 
LIMIT 20;

-- Query: Vote tally (group spin voting)
EXPLAIN SELECT vote_type, COUNT(*) as count 
FROM votes 
WHERE session_id = 'YOUR_SESSION_ID' 
GROUP BY vote_type;

-- Query: Friends list (mutual friendship)
EXPLAIN SELECT f.* FROM friendships f
WHERE (f.requester_id = 'YOUR_USER_ID' OR f.addressee_id = 'YOUR_USER_ID')
  AND f.status = 'ACCEPTED';

-- Query: Group members (max 20 enforcement)
EXPLAIN SELECT COUNT(*) FROM group_members 
WHERE group_id = 'YOUR_GROUP_ID' 
  AND status = 'ACCEPTED';

-- Query: Restaurant search by category
EXPLAIN SELECT * FROM restaurants 
WHERE status = 'APPROVED' 
  AND category = 'Vietnamese' 
  AND deleted_at IS NULL;

-- Query: Spin wallet balance
EXPLAIN SELECT * FROM spin_wallets 
WHERE user_id = 'YOUR_USER_ID';

-- Query: Pending friend requests
EXPLAIN SELECT * FROM friendships 
WHERE addressee_id = 'YOUR_USER_ID' 
  AND status = 'PENDING';

-- ============================================================
-- CHECK 2.3: Check for missing indexes (slow queries)
-- ============================================================

-- Find queries that don't use indexes (table scans)
SELECT 
    t.NAME AS table_name,
    s.INDEX_NAME,
    s.COLUMN_NAME,
    s.NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS s
JOIN INFORMATION_SCHEMA.TABLES t 
    ON s.TABLE_SCHEMA = t.TABLE_SCHEMA 
    AND s.TABLE_NAME = t.TABLE_NAME
WHERE t.TABLE_SCHEMA = 'food_roulette'
ORDER BY t.TABLE_NAME, s.SEQ_IN_INDEX;

-- ============================================================
-- CHECK 2.4: Check for duplicate/redundant indexes
-- ============================================================
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS,
    COUNT(*) AS CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'food_roulette'
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
HAVING COUNT(*) > 1;

-- ============================================================
-- Expected results:
-- - All EXPLAIN should show "Using index" or "Using index condition"
-- - No "Using filesort" or "Using temporary" for large tables
-- - key column should show index name being used
-- ============================================================
