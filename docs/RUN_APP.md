# Chạy ứng dụng Food Roulette

Tài liệu này mô tả ba chế độ chạy được hỗ trợ bởi các script ở thư mục `scripts/`.

## 1. Chọn chế độ

| Mục tiêu | Lệnh | Backend/MySQL |
|---|---|---|
| Xem nhanh UI bằng mock data | `./scripts/run-app.sh mock` | Không cần |
| Test API thật trên iOS Simulator | `./scripts/run-app.sh simulator` | Tự khởi động |
| Test camera/GPS trên thiết bị thật | `./scripts/run-app.sh device <MAC_LAN_IPV4>` | Tự khởi động |

Các script không tự tạo, sửa hoặc ghi đè file `.env`.
Mặc định API dùng cổng `3000`. Có thể đặt `API_PORT` khi cổng này đang được ứng dụng khác sử dụng.

## 2. Yêu cầu chung

- Node.js `22.23.2`.
- npm `10.9.8`.
- Xcode và iOS Simulator nếu test trên macOS.
- Docker Desktop nếu chạy chế độ `simulator` hoặc `device`.
- Điện thoại và Mac cùng Wi-Fi nếu test trên thiết bị thật.

Kiểm tra runtime:

```bash
node --version
npm --version
```

Nếu dùng `nvm`:

```bash
nvm use 22.23.2
```

## 3. Chuẩn bị lần đầu

### 3.1. Chỉ chạy mock

```bash
./scripts/setup-app.sh mock
```

Script chỉ chạy `npm ci` trong `apps/mobile`.

### 3.2. Chạy API thật

Tạo backend environment thủ công:

```bash
cp backend/.env.example backend/.env
```

Cấu hình tối thiểu trong `backend/.env`:

```env
DATABASE_URL="mysql://food_user:foodpassword@localhost:3306/food_roulette"
JWT_SECRET="local-demo-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8081
CLIENT_URLS=http://localhost:5173,http://localhost:8081
```

Không đưa Supabase service role key vào mobile. Nếu chưa có Supabase credential, để các giá trị Supabase trống trong môi trường development; backend sẽ dùng `InMemoryMediaStorage` cho phiên chạy hiện tại.

Sau đó chạy:

```bash
./scripts/setup-app.sh api
```

Script sẽ:

1. Cài dependency backend bằng `npm ci`.
2. Khởi động MySQL 8 bằng Docker Compose.
3. Chờ MySQL healthy.
4. Chạy Prisma generate và migration deploy.
5. Cài dependency mobile bằng `npm ci`.

Seed dữ liệu là bước tùy chọn:

```bash
cd backend
npm run seed
```

Seed dùng `upsert`, có thể chạy lại mà không xóa dữ liệu đang có. Script tạo:

- Tài khoản chính: `locket-test@foodroulette.app` / `password123`.
- Tài khoản bạn bè: `friend@foodroulette.app` / `password123`.
- Quan hệ bạn bè đã chấp nhận để kiểm tra visibility `FRIENDS`.
- Preference, Spin Wallet và ba nhà hàng demo cơ bản.

Seed không tạo Locket giả vì ảnh Locket cần đi qua API upload và storage. Script sẽ từ chối chạy khi `NODE_ENV=production`.
Không dùng `test@foodroulette.app` cho Locket API E2E vì Auth hiện tại của `origin/main` dành email đó cho demo fallback không gắn với user MySQL.

## 4. Chạy bằng mock repositories

```bash
./scripts/run-app.sh mock
```

Khi Expo hiện menu:

- Nhấn `i` để mở iOS Simulator.
- Nhấn `a` để mở Android Emulator.
- Nhấn `w` để mở bản web, nhưng camera/GPS không đại diện cho mobile thật.

Chế độ này tự đặt:

```env
EXPO_PUBLIC_USE_MOCK_REPOSITORIES=true
```

Phù hợp để kiểm tra layout, navigation và trạng thái UI. Chế độ này không kiểm tra JWT, Express, Prisma hoặc upload pipeline.

## 5. Chạy full stack trên iOS Simulator

```bash
./scripts/run-app.sh simulator
```

Nếu cổng `3000` đang bị service khác chiếm:

```bash
API_PORT=3001 ./scripts/run-app.sh simulator
```

Script dùng cùng `API_PORT` cho health check, backend và `EXPO_PUBLIC_API_URL`; không cần sửa `backend/.env`.

Script sẽ:

1. Khởi động MySQL nếu cần.
2. Dùng backend đang chạy ở cổng `3000`, hoặc tự chạy `npm run dev`.
3. Đợi `/health` phản hồi.
4. Chạy Expo với API URL `http://localhost:3000/api/v1`.
5. Dừng backend do script tạo khi bạn thoát Expo; MySQL vẫn được giữ lại.

Nhấn `i` để mở Simulator.

Để mô phỏng GPS, trong Simulator chọn:

```text
Features → Location → City Run
```

Hoặc:

```text
Features → Location → Freeway Drive
```

`Location → None` ngừng phát tọa độ mới nhưng iOS có thể giữ last-known location trong phiên hiện tại. Đây là hành vi đã được chấp nhận cho Taste Board capture.

## 6. Chạy full stack trên thiết bị thật

Lấy địa chỉ IPv4 Wi-Fi của máy Mac (không phải MAC address của điện thoại):

```bash
ipconfig getifaddr en0
```

Ví dụ kết quả là `192.168.1.20`:

```bash
./scripts/run-app.sh device 192.168.1.20
```

Nếu cần đổi cổng API:

```bash
API_PORT=3001 ./scripts/run-app.sh device 192.168.1.20
```

Nếu không truyền IP, script sẽ thử tự phát hiện IPv4 của interface mạng mặc định, rồi fallback sang `en0`/`en1`:

```bash
./scripts/run-app.sh device
```

Nếu lỡ truyền MAC address của thiết bị, ví dụ `44:C6:5D:A5:E2:9C`, script sẽ bỏ qua giá trị đó và thử tự phát hiện IPv4 LAN của máy Mac.

Script đặt API URL thành:

```text
http://192.168.1.20:3000/api/v1
```

Sau khi Expo khởi động, quét QR bằng Expo Go. Nếu thiết bị không kết nối được:

- Kiểm tra điện thoại và Mac có cùng Wi-Fi.
- Cho phép Node/Terminal nhận kết nối trong macOS Firewall.
- Mở `http://<MAC_LAN_IPV4>:3000/health` trên trình duyệt điện thoại.
- Không dùng `localhost` cho thiết bị thật.

## 7. Dừng môi trường

Nhấn `Ctrl+C` tại terminal đang chạy Expo. Backend do script tạo sẽ được dừng tự động.

MySQL được giữ lại để lần chạy sau nhanh hơn. Khi muốn dừng MySQL:

```bash
docker compose -f docker/docker-compose.yml stop mysql
```

Lệnh trên không xóa database volume. Không dùng `down -v` nếu muốn giữ dữ liệu local.

## 8. Kiểm tra thủ công Taste Board

1. Đăng ký hoặc đăng nhập.
2. Mở Hồ sơ và xác nhận profile tải được.
3. Mở Taste Board và cấp quyền Camera/Location.
4. Chụp ảnh, viết review nếu muốn và chọn visibility.
5. Thử lần lượt visibility Riêng tư, Bạn bè và Công khai.
6. Đăng Taste Board và kiểm tra feed/detail.
7. Xóa Taste Board bằng tài khoản owner.
8. Với bài Công khai, kiểm tra public profile; bài Riêng tư/Bạn bè không được lộ trên profile công khai.

## 9. Lệnh kiểm tra chất lượng

Backend:

```bash
cd backend
npm run lint
npm run typecheck
npm run test:run
npm run db:validate
```

Mobile:

```bash
cd apps/mobile
npm run typecheck
npm run lint
```

## 10. Lỗi thường gặp

### `backend/.env is missing`

Tạo file từ `backend/.env.example`, sau đó sửa `DATABASE_URL` theo cấu hình Docker ở mục 3.2.

### MySQL không healthy

```bash
docker compose -f docker/docker-compose.yml logs mysql
```

Kiểm tra cổng `3306` có bị MySQL khác chiếm hay không.

### Backend không phản hồi ở cổng 3000

```bash
curl http://localhost:3000/health
```

Nếu cổng đã bị process khác sử dụng:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Script chỉ chấp nhận backend có health payload của Food Roulette. Nếu một API dự án khác đang giữ cổng `3000`, script sẽ dừng thay vì khởi động Expo với nhầm backend.

### Web báo `Network Error` khi đăng Taste Board

- Xác nhận `EXPO_PUBLIC_API_URL` trỏ tới Food Roulette API; khi chạy trên máy khác, không dùng `localhost` của máy mở trình duyệt.
- Xác nhận origin của web nằm trong `CLIENT_URLS` khi backend chạy production.
- Taste Board upload cần CORS cho phép `X-Device-ID` và `X-Captured-At`.
- Mở `/health` từ chính máy/thiết bị chạy frontend và kiểm tra response có `success: true` cùng message `Food Roulette API is running`.

### Expo giữ cấu hình cũ

Thoát Expo và chạy lại đúng mode. Script luôn truyền `--clear` để xóa Metro cache.

### Thiết bị thật không gọi được API

Xác nhận API URL dùng IP LAN của Mac, không phải `localhost`, và kiểm tra endpoint `/health` từ chính điện thoại.
