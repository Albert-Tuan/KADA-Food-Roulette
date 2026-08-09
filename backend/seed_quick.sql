SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE users;
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, role, subscription_tier, is_onboarded, created_at, updated_at) VALUES 
('11111111-1111-1111-1111-111111111111', 'an@gmail.com', '$2a$10$hash1', 'An Nguyễn', 'an_foodie', 'an001', 'USER', 'FREE', TRUE, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'binh@gmail.com', '$2a$10$hash2', 'Bình Trần', 'binh_eats', 'binh2', 'USER', 'PREMIUM', TRUE, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'chi@gmail.com', '$2a$10$hash3', 'Chi Lê', 'chi_reviews', 'chi03', 'USER', 'FREE', TRUE, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'duong@gmail.com', '$2a$10$hash4', 'Dương Phạm', 'duong_tasty', 'duong4', 'USER', 'FREE', TRUE, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'steward@foodroulette', '$2a$10$hash5', ' steward', 'official', 'stw01', 'STEWARD', 'PREMIUM', TRUE, NOW(), NOW());

TRUNCATE TABLE restaurants;
INSERT INTO restaurants (id, name, address, lat, lng, source, category, price_level, rating, status, created_at, updated_at) VALUES 
('rest0001-0000-0000-0000-000000000001', 'Phở Hòa Pasteur', '260C Pasteur, Q1', 10.7860, 106.6910, 'USER_SUBMITTED', 'Phở', 1, 4.5, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000002', 'Bún chả Hà Nội', '57 Phan Chu Trinh', 10.7720, 106.6990, 'GOOGLE_PLACES', 'Bún', 1, 4.2, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000003', 'Cơm tấm Sài Gòn', '109 Nguyễn Trãi', 10.7690, 106.6930, 'USER_SUBMITTED', 'Cơm', 1, 4.7, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000004', 'Bò kho Mai', '85 Bùi Viện', 10.7660, 106.6950, 'GOOGLE_PLACES', 'Bò kho', 2, 4.0, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000005', 'Lẩu Thái Lan', '12 Đồng Khởi', 10.7740, 106.7050, 'GOOGLE_PLACES', 'Lẩu', 3, 4.3, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000006', 'Pizza Ý', '20 Nguyễn Huệ', 10.7720, 106.7030, 'USER_SUBMITTED', 'Pizza', 3, 4.1, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000007', 'Bánh mì Huỳnh Thúc', '57 Nguyễn Văn Cừ', 10.7620, 106.7150, 'USER_SUBMITTED', 'Bánh mì', 1, 4.8, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000008', 'Sushi Nhật Bản', '30 Lê Lợi', 10.7720, 106.7000, 'GOOGLE_PLACES', 'Sushi', 4, 4.6, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000009', 'Cà phê Highlands', '1 Võ Văn Tần', 10.7740, 106.6980, 'GOOGLE_PLACES', 'Cà phê', 2, 4.4, 'APPROVED', NOW(), NOW()),
('rest0001-0000-0000-0000-000000000010', 'New Cafe pending', '50 Test Street', 10.7700, 106.7000, 'USER_SUBMITTED', 'Cà phê', 2, NULL, 'PENDING', NOW(), NOW());
SET FOREIGN_KEY_CHECKS=1;
