-- ============================================================
-- Food Roulette v5.0 - Complex Query Tests
-- Purpose: Test schema optimization with real business queries
-- v5.0 | 2026-08-06
-- ============================================================

-- ============================================================
-- QUERY 1: Group Spin Consensus Check
-- Business: Kiểm tra xem group spin đã đạt consensus chưa
--           (tất cả thành viên ACCEPTED hoặc majority REJECTED)
-- ============================================================

SELECT
    s.id AS session_id,
    s.status AS session_status,
    s.type AS spin_type,
    g.id AS group_id,
    g.name AS group_name,
    r.name AS selected_restaurant,
    r.category,
    r.address,
    
    -- Member stats
    COUNT(DISTINCT gm.id) AS total_members,
    SUM(CASE WHEN gm.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_members,
    SUM(CASE WHEN gm.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_members,
    
    -- Vote breakdown
    COUNT(DISTINCT v.id) AS total_votes,
    SUM(CASE WHEN v.vote_type = 'ACCEPT' THEN 1 ELSE 0 END) AS accept_votes,
    SUM(CASE WHEN v.vote_type = 'REJECT' THEN 1 ELSE 0 END) AS reject_votes,
    
    -- Consensus status
    CASE
        WHEN COUNT(DISTINCT gm.id) = SUM(CASE WHEN gm.status = 'ACCEPTED' THEN 1 ELSE 0 END)
            THEN 'FULL_CONSENSUS'
        WHEN SUM(CASE WHEN v.vote_type = 'REJECT' THEN 1 ELSE 0 END) >= (COUNT(DISTINCT gm.id) / 2)
            THEN 'MAJORITY_REJECTED'
        WHEN COUNT(DISTINCT v.id) >= COUNT(DISTINCT gm.id)
            THEN 'ALL_VOTED'
        ELSE 'PENDING'
    END AS consensus_status

FROM spin_sessions s
LEFT JOIN spin_groups g ON s.group_id = g.id
LEFT JOIN group_members gm ON g.id = gm.group_id
LEFT JOIN restaurants r ON s.selected_restaurant_id = r.id
LEFT JOIN votes v ON s.id = v.session_id

WHERE s.type = 'GROUP'
  AND s.status = 'COMPLETED'
  AND g.id = 'YOUR_GROUP_ID_HERE'  -- Replace with actual group ID

GROUP BY s.id, g.id, r.id
ORDER BY s.created_at DESC
LIMIT 10;

-- ============================================================
-- QUERY 2: Locket Feed (Privacy-Aware)
-- Business: Lấy feed lockets theo visibility rules
--           - PUBLIC: ai cũng thấy, không lộ private_name
--           - FRIENDS: chỉ bạn bè thấy
--           - PRIVATE: chỉ chủ nhân thấy
-- ============================================================

SELECT
    l.id AS locket_id,
    l.caption,
    l.image_url,
    l.visibility,
    l.captured_at,
    
    -- Restaurant info (nullable)
    r.name AS restaurant_name,
    r.category AS restaurant_category,
    r.address AS restaurant_address,
    
    -- User info (privacy-aware)
    u.public_id AS user_public_id,
    u.display_name_public AS user_display_name,
    
    -- Count engagement
    (SELECT COUNT(*) FROM lockets l2 
     WHERE l2.user_id = l.user_id) AS user_total_lockets,
    
    -- Distance from current user (if lat/lng provided via restaurant)
    IF(r.lat IS NOT NULL AND r.lng IS NOT NULL,
        (6371 * acos(
            cos(radians(10.7700)) * cos(radians(r.lat)) *
            cos(radians(r.lng) - radians(106.7000)) +
            sin(radians(10.7700)) * sin(radians(r.lat))
        )), NULL) AS distance_km

FROM lockets l
INNER JOIN users u ON l.user_id = u.id
LEFT JOIN restaurants r ON l.restaurant_id = r.id

WHERE 
    -- Visibility filter (self always sees own lockets)
    (
        l.visibility = 'PUBLIC'
        OR l.user_id = 'CURRENT_USER_ID_HERE'  -- Own lockets
        OR (
            l.visibility = 'FRIENDS'
            AND EXISTS (
                SELECT 1 FROM friendships f
                WHERE (
                    (f.requester_id = 'CURRENT_USER_ID_HERE' AND f.addressee_id = l.user_id)
                    OR (f.addressee_id = 'CURRENT_USER_ID_HERE' AND f.requester_id = l.user_id)
                )
                AND f.status = 'ACCEPTED'
            )
        )
    )
    
    -- Restaurant approved filter
    AND (l.restaurant_id IS NULL OR r.status = 'APPROVED')
    
    -- Not deleted
    AND l.captured_at IS NOT NULL

ORDER BY l.captured_at DESC
LIMIT 50;

-- ============================================================
-- QUERY 3: Restaurant Discovery with Geo + Filters
-- Business: Tìm quán gần nhất theo GPS, filter theo:
--           - Category
--           - Price level
--           - Rating
--           - Open now (giờ mở cửa)
--           - Distance radius
-- ============================================================

SELECT
    res.id AS restaurant_id,
    res.name,
    res.address,
    res.category,
    res.price_level,
    res.rating,
    res.source,
    
    -- Geo calculation (Haversine approximation for MySQL)
    (6371 * acos(
        cos(radians(10.7700)) * cos(radians(res.lat)) *
        cos(radians(res.lng) - radians(106.7000)) +
        sin(radians(10.7700)) * sin(radians(res.lat))
    )) AS distance_km,
    
    -- Open status
    CASE
        WHEN EXISTS (
            SELECT 1 FROM restaurant_hours rh
            WHERE rh.restaurant_id = res.id
              AND rh.day_of_week = DAYOFWEEK(NOW()) - 1  -- 0=Sunday
              AND rh.is_closed = FALSE
              AND CURTIME() BETWEEN rh.open_time AND rh.close_time
        ) THEN 'OPEN_NOW'
        WHEN EXISTS (
            SELECT 1 FROM restaurant_hours rh
            WHERE rh.restaurant_id = res.id
              AND rh.day_of_week = DAYOFWEEK(NOW()) - 1
              AND rh.is_closed = FALSE
        ) THEN 'CLOSED_NOW'
        ELSE 'NO_HOURS'
    END AS open_status,
    
    -- Today's hours
    rh_today.open_time AS today_open,
    rh_today.close_time AS today_close,
    
    -- Photo count
    (SELECT COUNT(*) FROM restaurant_photos rp WHERE rp.restaurant_id = res.id) AS photo_count,
    
    -- Recent check-in count (last 7 days)
    (SELECT COUNT(*) FROM check_ins ci 
     WHERE ci.restaurant_id = res.id 
       AND ci.check_in_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS weekly_checkins

FROM restaurants res
LEFT JOIN restaurant_hours rh_today 
    ON res.id = rh_today.restaurant_id 
    AND rh_today.day_of_week = DAYOFWEEK(NOW()) - 1

WHERE 
    -- Status filter
    res.status = 'APPROVED'
    AND res.deleted_at IS NULL
    
    -- Geo filter (radius in km)
    AND (
        6371 * acos(
            cos(radians(10.7700)) * cos(radians(res.lat)) *
            cos(radians(res.lng) - radians(106.7000)) +
            sin(radians(10.7700)) * sin(radians(res.lat))
        )
    ) <= 5.0  -- 5km radius
    
    -- Category filter (optional)
    AND (res.category = 'Phở' OR 'ALL' = 'ALL')
    
    -- Price filter (optional)
    AND (res.price_level <= 3 OR res.price_level IS NULL)
    
    -- Rating filter (optional)
    AND (res.rating >= 4.0 OR res.rating = 0)

HAVING distance_km <= 5.0

ORDER BY 
    distance_km ASC,
    res.rating DESC,
    weekly_checkins DESC

LIMIT 20;

-- ============================================================
-- BONUS QUERY 4: Spin Analytics Dashboard
-- Business: Thống kê spin cho admin/steward
-- ============================================================

SELECT
    -- Time period
    DATE(s.created_at) AS spin_date,
    HOUR(s.created_at) AS spin_hour,
    
    -- Spin type breakdown
    SUM(CASE WHEN s.type = 'PERSONAL' THEN 1 ELSE 0 END) AS personal_spins,
    SUM(CASE WHEN s.type = 'GROUP' THEN 1 ELSE 0 END) AS group_spins,
    
    -- Status breakdown
    SUM(CASE WHEN s.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_spins,
    SUM(CASE WHEN s.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_spins,
    
    -- Most selected restaurants
    r.name AS restaurant_name,
    r.category,
    COUNT(*) AS selection_count,
    
    -- Acceptance rate
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM votes v 
        WHERE v.session_id = s.id 
          AND v.vote_type = 'ACCEPT'
    ) THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(DISTINCT s.id), 0) AS acceptance_rate

FROM spin_sessions s
LEFT JOIN restaurants r ON s.selected_restaurant_id = r.id

WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

GROUP BY DATE(s.created_at), HOUR(s.created_at), r.id, r.name, r.category
ORDER BY spin_date DESC, spin_hour DESC;

-- ============================================================
-- BONUS QUERY 5: User Engagement Report
-- Business: User activity report for gamification
-- ============================================================

SELECT
    u.id AS user_id,
    u.display_name_private,
    u.subscription_tier,
    
    -- Spin stats
    COUNT(DISTINCT s.id) AS total_spins,
    COUNT(DISTINCT CASE WHEN s.status = 'COMPLETED' THEN s.id END) AS completed_spins,
    
    -- Vote stats
    COUNT(DISTINCT v.id) AS total_votes,
    COUNT(DISTINCT CASE WHEN v.vote_type = 'ACCEPT' THEN v.id END) AS accept_votes,
    
    -- Locket stats
    COUNT(DISTINCT l.id) AS total_lockets,
    COUNT(DISTINCT CASE WHEN l.visibility = 'PUBLIC' THEN l.id END) AS public_lockets,
    
    -- Check-in stats
    COUNT(DISTINCT ci.id) AS total_checkins,
    COUNT(DISTINCT CASE WHEN ci.status = 'COMPLETED' THEN ci.id END) AS completed_checkins,
    
    -- Friendship stats
    (SELECT COUNT(*) FROM friendships f
     WHERE (f.requester_id = u.id OR f.addressee_id = u.id)
       AND f.status = 'ACCEPTED') AS friend_count,
    
    -- Wallet balance
    sw.balance AS spin_balance,
    
    -- Last active
    u.last_active_at,
    
    -- Engagement score (for gamification)
    (
        COUNT(DISTINCT s.id) * 10 +
        COUNT(DISTINCT l.id) * 5 +
        COUNT(DISTINCT ci.id) * 15 +
        (SELECT COUNT(*) FROM friendships f
         WHERE (f.requester_id = u.id OR f.addressee_id = u.id)
           AND f.status = 'ACCEPTED') * 3
    ) AS engagement_score

FROM users u
LEFT JOIN spin_sessions s ON u.id = s.creator_id
LEFT JOIN votes v ON u.id = v.voter_id
LEFT JOIN lockets l ON u.id = l.user_id
LEFT JOIN check_ins ci ON u.id = ci.user_id
LEFT JOIN spin_wallets sw ON u.id = sw.user_id

WHERE u.deleted_at IS NULL
  AND u.role = 'USER'

GROUP BY u.id
ORDER BY engagement_score DESC
LIMIT 100;
