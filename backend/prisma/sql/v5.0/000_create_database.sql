-- ============================================================
-- Recreate database food_rolette
-- Run this FIRST before 001_create_tables.sql
-- ============================================================

DROP DATABASE IF EXISTS food_rolette;
CREATE DATABASE food_rolette CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_rolette;

SELECT 'Database Food Roulette created!' AS result;image.png