-- ============================================================
-- DATABASE VALIDATION QUERIES v5.0
-- 5 complex queries to verify DB integrity and functionality
-- ============================================================

USE food_roulette;

-- ============================================================
-- QUERY 1: GROUP SPIN COMPLETE WORKFLOW
-- Simulate full group spin: session -> candidates -> votes -> result
-- ============================================================

-- Check if voting is complete and determine final restaurant
SELECT 
    ss.id AS session_id,
    ss.status AS session_status,
    ss.created_at AS spin_time,
    sg.name AS group_name,
    -- Count votes by type
    SUM(CASE WHEN v.vote_type = 'ACCEPT' THEN 1 ELSE 0 END) AS accept_count,
    SUM(CASE WHEN v.vote_type = 'REJECT' THEN 1 ELSE 0 END) AS reject_count,
    -- Get selected restaurant
    r.id AS selected_restaurant_id,
    r.name AS selected_restaurant_name,
    r.address AS selected_restaurant_address,
    -- Check if quorum reached (majority of group members)
    gm.total_members,
    ROUND(SUM(CASE WHEN v.vote_type = 'ACCEPT' THEN 1 ELSE 0 END) * 100.0 / gm.total_members) AS accept_percentage,
    -- Determine final status
    CASE 
        WHEN SUM(CASE WHEN v.vote_type = 'ACCEPT' THEN 1 ELSE 0 END) >= CEIL(gm.total_members / 2) 
        THEN 'FINALIZED'
        WHEN SUM(CASE WHEN v.vote_type = 'REJECT' THEN 1 ELSE 0 END) >= CEIL(gm.total_members / 2)
        THEN 'REJECTED'
        ELSE 'PENDING'
    END AS final_status
FROM spin_sessions ss
JOIN spin_groups sg ON ss.group_id = sg.id
LEFT JOIN votes v ON v.session_id = ss.id
LEFT JOIN restaurants r ON ss.selected_restaurant_id = r.id
LEFT JOIN (
    SELECT group_id, COUNT(*) AS total_members 
    FROM group_members 
    WHERE status = 'ACCEPTED'
    GROUP BY group_id
) gm ON sg.id = gm.group_id
WHERE ss.type = 'GROUP'
GROUP BY ss.id, ss.status, ss.created_at, sg.name, r.id, r.name, r.address, gm.total_members
ORDER BY ss.created_at DESC;

-- ============================================================
-- QUERY 2: LOCKET FEED WITH VISIBILITY RULES
-- PUBLIC: all users | FRIENDS: mutual friends only | PRIVATE: self only
-- ============================================================

-- Get personalized locket feed for user_id (respecting visibility)
-- Note: friendships table uses requester_id/addressee_id (not user_id/friend_id)
SELECT 
    l.id AS locket_id,
    l.caption,
    l.visibility,
    l.captured_at,
    l.image_url,
    -- Restaurant info (if linked)
    r.name AS restaurant_name,
    r.address AS restaurant_address,
    -- User info
    u.id AS owner_id,
    u.display_name_public,
    u.display_name_public AS owner_display_name,
    -- Friend relationship check (friendships uses requester_id/addressee_id)
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM friendships f 
            WHERE (f.requester_id = '11111111-1111-1111-1111-111111111111' AND f.addressee_id = l.user_id)
            AND f.status = 'ACCEPTED'
        ) THEN TRUE
        WHEN EXISTS (
            SELECT 1 FROM friendships f 
            WHERE (f.addressee_id = '11111111-1111-1111-1111-111111111111' AND f.requester_id = l.user_id)
            AND f.status = 'ACCEPTED'
        ) THEN TRUE
        ELSE FALSE
    END AS is_friend,
    -- Visibility decision
    CASE 
        WHEN l.visibility = 'PUBLIC' THEN TRUE
        WHEN l.visibility = 'FRIENDS' AND (
            EXISTS (
                SELECT 1 FROM friendships f 
                WHERE (f.requester_id = '11111111-1111-1111-1111-111111111111' AND f.addressee_id = l.user_id)
                AND f.status = 'ACCEPTED'
            )
            OR EXISTS (
                SELECT 1 FROM friendships f 
                WHERE (f.addressee_id = '11111111-1111-1111-1111-111111111111' AND f.requester_id = l.user_id)
                AND f.status = 'ACCEPTED'
            )
        ) THEN TRUE
        WHEN l.visibility = 'PRIVATE' AND l.user_id = '11111111-1111-1111-1111-111111111111' THEN TRUE
        ELSE FALSE
    END AS can_view,
    -- Distance calculation (mock for demo)
    ROUND(RAND() * 5, 2) AS distance_km,
    -- EXIF stripped verification (check if device_hash exists as proxy)
    CASE WHEN l.device_hash IS NOT NULL THEN 'Verified' ELSE 'Warning' END AS exif_status
FROM lockets l
JOIN users u ON l.user_id = u.id
LEFT JOIN restaurants r ON l.restaurant_id = r.id
WHERE 
    -- Visibility filter
    (
        l.visibility = 'PUBLIC'
        OR (l.visibility = 'FRIENDS' AND l.user_id IN (
            -- Get friends where current user is either requester or addressee
            SELECT CASE 
                WHEN f.requester_id = '11111111-1111-1111-1111-111111111111' THEN f.addressee_id
                ELSE f.requester_id
            END AS friend_id
            FROM friendships f
            WHERE (f.requester_id = '11111111-1111-1111-1111-111111111111' OR f.addressee_id = '11111111-1111-1111-1111-111111111111')
            AND f.status = 'ACCEPTED'
        ))
        OR l.user_id = '11111111-1111-1111-1111-111111111111'
    )
    -- Exclude expired lockets (older than 30 days for feed)
    AND l.captured_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY l.captured_at DESC
LIMIT 20;

-- ============================================================
-- QUERY 3: CHECK-IN VERIFICATION COMPLEX
-- Verify check-in with GPS + Locket + Restaurant matching
-- ============================================================

-- Check-in verification dashboard
SELECT 
    ci.id AS checkin_id,
    ci.status AS checkin_status,
    ci.check_in_at,
    ci.expires_at,
    ci.verified_at,
    -- Time remaining
    CASE 
        WHEN ci.status = 'COMPLETED' THEN 'Completed'
        WHEN ci.status = 'EXPIRED' THEN 'Expired'
        WHEN ci.expires_at < NOW() THEN 'Expired'
        ELSE CONCAT(TIMESTAMPDIFF(MINUTE, NOW(), ci.expires_at), ' min left')
    END AS time_status,
    -- User info
    u.id AS user_id,
    u.display_name_public AS user_name,
    -- Restaurant info
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    r.lat AS restaurant_lat,
    r.lng AS restaurant_lng,
    -- Locket verification (if linked)
    l.id AS linked_locket_id,
    CASE WHEN l.id IS NOT NULL THEN 'Yes' ELSE 'No' END AS has_locket,
    -- Mock GPS distance (in reality would use PostGIS ST_Distance)
    ROUND(RAND() * 50, 2) AS mock_distance_meters,
    -- Verification status (derived from status + verified_at)
    CASE
        WHEN ci.status = 'COMPLETED' AND ci.verified_at IS NOT NULL THEN 'FULLY_VERIFIED'
        WHEN ci.status = 'CHECKED_IN' THEN 'GPS_VERIFIED'
        WHEN ci.status = 'PENDING' THEN 'PENDING'
        WHEN ci.status = 'EXPIRED' THEN 'EXPIRED'
        WHEN ci.status = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'UNKNOWN'
    END AS verification_status,
    -- Business hours check
    CASE 
        WHEN rh.open_time IS NOT NULL AND rh.close_time IS NOT NULL 
        AND ci.check_in_at BETWEEN rh.open_time AND rh.close_time
        THEN 'WITHIN_HOURS'
        WHEN rh.is_closed = TRUE THEN 'CLOSED_DAY'
        ELSE 'OUTSIDE_HOURS'
    END AS hours_status
FROM check_ins ci
JOIN users u ON ci.user_id = u.id
JOIN restaurants r ON ci.restaurant_id = r.id
LEFT JOIN lockets l ON l.restaurant_id = r.id 
    AND l.user_id = ci.user_id
    AND l.captured_at BETWEEN DATE_SUB(ci.check_in_at, INTERVAL 2 HOUR) AND DATE_ADD(ci.check_in_at, INTERVAL 2 HOUR)
LEFT JOIN restaurant_hours rh ON r.id = rh.restaurant_id 
    AND rh.day_of_week = DAYOFWEEK(ci.check_in_at) - 1
WHERE ci.user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY ci.check_in_at DESC;

-- ============================================================
-- QUERY 4: SPIN WALLET & HISTORY
-- Complete spin history with wallet balance
-- ============================================================

-- Calculate running balance and verify integrity
SELECT 
    sl.id AS log_id,
    sl.created_at AS spin_time,
    sl.spin_type,
    sl.result,
    r.name AS restaurant_name,
    r.address AS restaurant_address,
    -- Restaurant category and price
    r.category,
    r.price_level,
    r.rating,
    -- Link to spin session if applicable
    ss.id AS spin_session_id,
    ss.status AS session_status,
    -- Wallet info
    sw.balance AS current_balance,
    sw.purchased_spins,
    sw.total_spins
FROM spin_logs sl
LEFT JOIN spin_sessions ss ON ss.id = sl.session_id
LEFT JOIN restaurants r ON sl.restaurant_id = r.id
JOIN spin_wallets sw ON sw.user_id = sl.user_id
WHERE sl.user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY sl.created_at DESC
LIMIT 100;

-- Final wallet balance verification
SELECT 
    sw.id AS wallet_id,
    sw.balance AS current_balance,
    sw.purchased_spins,
    sw.total_spins,
    CASE 
        WHEN sw.balance >= 0 THEN 'VALID'
        ELSE 'NEGATIVE_BALANCE_ERROR'
    END AS wallet_status
FROM spin_wallets sw
WHERE sw.user_id = '11111111-1111-1111-1111-111111111111';

-- ============================================================
-- QUERY 5: RESTAURANT RECOMMENDATION ENGINE
-- Complex query for spin candidates with scoring
-- ============================================================

-- Get restaurants eligible for spin with scoring
SELECT 
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    r.category,
    r.price_level,
    r.rating,
    r.address,
    r.lat AS restaurant_lat,
    r.lng AS restaurant_lng,
    -- Distance scoring (mock - would use PostGIS)
    ROUND(RAND() * 5, 2) AS distance_km,
    -- Opening hours status
    CASE 
        WHEN rh.is_closed = TRUE THEN 'CLOSED'
        WHEN rh.open_time IS NULL THEN 'HOURS_UNKNOWN'
        WHEN CURTIME() BETWEEN rh.open_time AND rh.close_time THEN 'OPEN_NOW'
        WHEN CURTIME() < rh.open_time THEN CONCAT('OPENS_AT ', rh.open_time)
        ELSE 'CLOSED_NOW'
    END AS current_status,
    -- Business score components
    CASE WHEN r.rating >= 4.0 THEN 20 ELSE r.rating * 5 END AS rating_score,
    CASE WHEN r.status = 'APPROVED' THEN 30 ELSE 0 END AS approval_score,
    CASE WHEN r.source = 'GOOGLE_PLACES' THEN 10 ELSE 5 END AS source_score,
    -- Photo availability
    (SELECT COUNT(*) FROM restaurant_photos WHERE restaurant_id = r.id) AS photo_count,
    -- Recent activity (spin count in last 7 days)
    (SELECT COUNT(*) FROM spin_sessions 
     WHERE selected_restaurant_id = r.id 
     AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS recent_spins,
    -- Check-in count for this restaurant
    (SELECT COUNT(*) FROM check_ins WHERE restaurant_id = r.id AND status = 'COMPLETED') AS total_checkins,
    -- Final eligibility score
    (CASE WHEN r.status = 'APPROVED' THEN 30 ELSE 0 END +
     CASE WHEN r.rating >= 4.0 THEN 20 ELSE r.rating * 5 END +
     CASE WHEN r.source = 'GOOGLE_PLACES' THEN 10 ELSE 5 END +
     CASE WHEN rh.is_closed = FALSE AND CURTIME() BETWEEN COALESCE(rh.open_time, '00:00') AND COALESCE(rh.close_time, '23:59') THEN 25 ELSE 0 END) AS eligibility_score,
    -- Filter conditions
    CASE WHEN r.status = 'APPROVED' THEN 'ELIGIBLE' ELSE 'PENDING_APPROVAL' END AS eligibility_status
FROM restaurants r
LEFT JOIN restaurant_hours rh ON r.id = rh.restaurant_id 
    AND rh.day_of_week = DAYOFWEEK(NOW()) - 1
WHERE r.status IN ('APPROVED', 'PENDING')
HAVING eligibility_status = 'ELIGIBLE'
ORDER BY eligibility_score DESC, r.rating DESC, distance_km ASC
LIMIT 10;

-- ============================================================
-- BONUS: FRIENDSHIP NETWORK ANALYSIS
-- Analyze mutual connections and group potential
-- ============================================================

-- Find friends of a user (both as requester and addressee)
SELECT 
    u1.id AS user_id,
    u1.display_name_public AS user_name,
    u2.id AS friend_id,
    u2.display_name_public AS friend_name,
    f.status AS friendship_status,
    -- Check if friendship is mutual
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM friendships f2
            WHERE f2.requester_id = u2.id 
            AND f2.addressee_id = u1.id 
            AND f2.status = 'ACCEPTED'
        ) THEN TRUE ELSE FALSE
    END AS is_mutual,
    -- Count mutual friends
    (SELECT COUNT(*) FROM (
        SELECT CASE 
            WHEN f_inner.requester_id = '11111111-1111-1111-1111-111111111111' THEN f_inner.addressee_id
            ELSE f_inner.requester_id
        END AS friend_id
        FROM friendships f_inner
        WHERE (f_inner.requester_id = '11111111-1111-1111-1111-111111111111' OR f_inner.addressee_id = '11111111-1111-1111-1111-111111111111')
        AND f_inner.status = 'ACCEPTED'
    ) AS my_friends
    WHERE friend_id IN (
        SELECT CASE 
            WHEN f_inner2.requester_id = u2.id THEN f_inner2.addressee_id
            ELSE f_inner2.requester_id
        END AS friend_id
        FROM friendships f_inner2
        WHERE (f_inner2.requester_id = u2.id OR f_inner2.addressee_id = u2.id)
        AND f_inner2.status = 'ACCEPTED'
    )) AS mutual_friend_count
FROM friendships f
JOIN users u1 ON f.requester_id = u1.id OR f.addressee_id = u1.id
JOIN users u2 ON CASE 
    WHEN f.requester_id = '11111111-1111-1111-1111-111111111111' THEN f.addressee_id
    ELSE f.requester_id
END = u2.id
WHERE (f.requester_id = '11111111-1111-1111-1111-111111111111' OR f.addressee_id = '11111111-1111-1111-1111-111111111111')
AND f.status = 'ACCEPTED'
AND u1.id != '11111111-1111-1111-1111-111111111111';

-- ============================================================
-- END OF VALIDATION QUERIES
-- ============================================================
