# Hướng Dẫn Tải Dữ Liệu 618+ Quán Ăn (Seed Database)

Tài liệu này hướng dẫn các thành viên trong nhóm cách nạp dữ liệu hơn 618 quán ăn (từ tập dữ liệu OSM/thực tế) vào Cơ sở dữ liệu (Database) để có thể test ứng dụng Food Roulette một cách đầy đủ chức năng trên trang Khám Phá (Discover) và Gửi Đánh Giá (Review).

## 1. Điều kiện tiên quyết
- Máy chủ Backend và Cơ sở dữ liệu (MySQL) phải đang chạy (thường là thông qua `docker-compose up -d`).
- Đã cài đặt đủ thư viện ở thư mục `backend` (chạy `npm install` nếu chưa).

## 2. Cách nạp dữ liệu quán ăn
Các dữ liệu quán ăn đã được chuẩn bị sẵn trong file kịch bản seed.

**Bước 1:** Mở cửa sổ dòng lệnh (Terminal) và di chuyển vào thư mục `backend`:
```bash
cd backend
```

**Bước 2:** Chạy lệnh nạp dữ liệu (chọn 1 trong 2 cách tuỳ vào môi trường):

*Cách A (Khuyên dùng - Chạy từ bên ngoài Docker)*:
Chạy thẳng lệnh seed bằng `ts-node` trên máy thật của bạn.
```bash
npx ts-node seed-massive-osm.ts
```
*(Nếu thiếu thư viện, chạy `npm install ts-node typescript -g`)*

*Cách B (Chạy bên trong Docker)*:
Nếu bạn muốn chạy lệnh seed này từ bên trong container Backend đang chạy:
```bash
docker exec food-roulette-backend npx ts-node seed-massive-osm.ts
```

**Bước 3:** Chờ script chạy xong. Bạn sẽ thấy console log thông báo số lượng quán ăn đã được thêm vào thành công (ví dụ: `Seeded 618 restaurants successfully!`).

## 3. Cách cập nhật lại cấu trúc DB (Khi báo lỗi thiếu Bảng)
Trong trường hợp khi test chức năng (như Gửi Đánh Giá) mà gặp lỗi báo 500 hoặc `Cannot read properties of undefined (reading 'create')` (do thiếu bảng `Review`), bạn cần đồng bộ lại cấu trúc DB:

```bash
cd docker
docker-compose up -d --build backend migrate
```
Lệnh này sẽ khởi tạo lại Database và áp dụng cấu trúc mới nhất từ file `schema.prisma`.

## 4. Kiểm tra dữ liệu
Để kiểm tra xem dữ liệu đã được đưa vào DB chưa, bạn có thể:
- Mở `Prisma Studio` bằng lệnh:
```bash
cd backend
npx prisma studio
```
- Truy cập vào trang web http://localhost:5555 và xem danh sách trong bảng `Restaurant`.

Chúc các bạn thành công!
