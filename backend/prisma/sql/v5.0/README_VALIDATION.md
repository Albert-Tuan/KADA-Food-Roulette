# DATABASE READINESS CHECKLIST v5.0

## Overview
Các validation queries để đảm bảo database sẵn sàng cho dự án Food Roulette.

## Files Created

| File | Purpose | Run In |
|------|---------|--------|
| `validation_queries.sql` | 5 complex queries để verify data integrity | MySQL Client |
| `index_performance.sql` | EXPLAIN queries, verify index usage | MySQL Client |
| `constraints_validation.sql` | Test NOT NULL, UNIQUE, FK constraints | MySQL Client |
| `enum_validation.sql` | Test all enum values accept valid only | MySQL Client |
| `cascade_delete_validation.sql` | Test cascade delete behavior | MySQL Client |
| `edge_cases_validation.sql` | Test boundary conditions, NULL handling | MySQL Client |
| `src/test/api-integration.test.ts` | Test Prisma client CRUD operations | Node.js |

## Check Summary

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Prisma Schema Sync | ✅ DONE | Schema valid với Prisma 5.22.0 |
| 2 | Index Performance | 📋 Manual | Chạy `index_performance.sql` trong MySQL |
| 3 | Constraints Enforcement | 📋 Manual | Chạy `constraints_validation.sql` |
| 4 | Enum Values | 📋 Manual | Chạy `enum_validation.sql` |
| 5 | Cascade Delete | 📋 Manual | Chạy `cascade_delete_validation.sql` |
| 6 | Edge Cases | 📋 Manual | Chạy `edge_cases_validation.sql` |
| 7 | API Integration | 📋 Manual | Chạy `api-integration.test.ts` |

## How to Run

### MySQL Checks (2-6)
```bash
mysql -u root -p food_roulette < prisma/sql/v5.0/[check_file].sql
```

### API Check (7)
```bash
cd backend
npm install
npx tsx src/test/api-integration.test.ts
```

## Expected Results

### Check 2: Index Performance
- Tất cả EXPLAIN queries nên show "Using index"
- Không có "Using filesort" hoặc "Using temporary"
- `key` column hiển thị index name đang được sử dụng

### Check 3: Constraints
- Tất cả invalid inserts phải fail với appropriate error codes
- Valid inserts phải succeed

### Check 4: Enums
- Valid enum values được accept
- Invalid enum values bị reject

### Check 5: Cascade Delete
- Hard delete cascade đúng
- Soft delete filter đúng (WHERE deleted_at IS NULL)

### Check 6: Edge Cases
- NULL queries return empty, không error
- Boundary values handled correctly
- BigInt values stored correctly

### Check 7: API Integration
- Tất cả CRUD operations thành công
- Complex queries trả về expected results
- Relations loaded correctly với include

## Notes

- Prisma 5.22.0 được chọn thay vì 7.x vì adapter không tồn tại
- MySQL connection required để run manual checks
- Test data được cleanup sau mỗi check
