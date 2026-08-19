# Chạy ứng dụng Food Roulette

App **chỉ chạy với dữ liệu thật** — MySQL + backend Express + Expo gọi API thật.
Không có chế độ mock nữa: `EXPO_PUBLIC_USE_MOCK_REPOSITORIES` luôn là `false` khi chạy qua script.

## 1. Yêu cầu

- Node.js `22.23.2` (script chặn Node khác), npm `10.9.8`.
- Docker Desktop — để chạy MySQL 8.
- Xcode + iOS Simulator nếu test trên macOS.
- Điện thoại và Mac cùng Wi-Fi nếu test trên thiết bị thật.

```bash
node --version   # v22.x.x
npm --version    # 10.9.8
```

Nếu dùng `nvm`: `nvm use 22.23.2`.

## 2. Chuẩn bị lần đầu

### 2.1. Tạo backend `.env`

Script không tự tạo file `.env`:

```bash
cp backend/.env.example backend/.env
```

Tối thiểu cần:

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

Giá trị Supabase trong `.env.example` chỉ là placeholder — backend tự coi là "chưa cấu hình" và dùng `InMemoryMediaStorage` ở development. Không đưa Supabase service role key vào mobile.

### 2.2. Setup một lần

```bash
./scripts/setup-app.sh
```

Script sẽ:

1. Cài dependency backend bằng `npm ci`.
2. Khởi động MySQL 8 bằng Docker Compose và chờ healthy.
3. Chạy Prisma generate + migrate deploy.
4. Seed dữ liệu (idempotent upsert, chạy lại không xóa dữ liệu).
5. Cài dependency mobile bằng `npm ci`.

Seed tạo:

- Tài khoản chính: `locket-test@foodroulette.app` / `password123`.
- Tài khoản bạn bè: `friend@foodroulette.app` / `password123`.
- Quan hệ bạn bè đã chấp nhận (test visibility `FRIENDS`).
- 10+ nhà hàng APPROVED (quán Man Thiện) — nguồn cho vòng quay thật.

Seed không tạo Locket giả (ảnh phải đi qua API upload). Seed từ chối chạy khi `NODE_ENV=production`.

## 3. Chạy full stack trên iOS Simulator

```bash
./scripts/run-app.sh simulator
```

Nếu cổng `3000` đang bị chiếm (kể cả backend cũ trong Docker):

```bash
API_PORT=3001 ./scripts/run-app.sh simulator
```

Script sẽ:

1. Kiểm tra cổng API đang trống — nếu bị chiếm sẽ báo lỗi và hướng dẫn (script luôn chạy **backend mới từ repo hiện tại**, không tái sử dụng process cũ).
2. Khởi động MySQL nếu chưa chạy.
3. Seed lại database (idempotent — đảm bảo có nhà hàng APPROVED cho vòng quay).
4. Chạy backend local bằng `npm run dev` (tsx watch, hot-reload) với `PORT=${API_PORT}`.
5. Đợi `/health` phản hồi.
6. Chạy Expo với `EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1` và `EXPO_PUBLIC_USE_MOCK_REPOSITORIES=false`.
7. Dừng backend do script tạo khi thoát Expo; MySQL được giữ lại.

Nhấn `i` để mở iOS Simulator.

Để mô phỏng GPS trong Simulator:

```text
Features → Location → City Run
```

hoặc `Freeway Drive`. `Location → None` ngừng phát tọa độ mới nhưng iOS có thể giữ last-known location — hành vi chấp nhận được cho Taste Board capture.

## 4. Chạy full stack trên thiết bị thật

Lấy địa chỉ IPv4 Wi-Fi của máy Mac (không phải MAC address điện thoại):

```bash
ipconfig getifaddr en0
```

```bash
./scripts/run-app.sh device 192.168.1.20
```

Nếu cần đổi cổng API: `API_PORT=3001 ./scripts/run-app.sh device 192.168.1.20`.

Không truyền IP thì script tự phát hiện IPv4 của interface mạng mặc định, fallback `en0`/`en1`:

```bash
./scripts/run-app.sh device
```

Lỡ truyền MAC address của thiết bị (ví dụ `44:C6:5D:A5:E2:9C`) thì script bỏ qua và tự phát hiện IP LAN của Mac.

Script đặt API URL thành `http://192.168.1.20:3000/api/v1`. Quét QR bằng Expo Go. Nếu thiết bị không kết nối được:

- Kiểm tra điện thoại và Mac cùng Wi-Fi.
- Cho phép Node/Terminal nhận kết nối trong macOS Firewall.
- Mở `http://<MAC_LAN_IPV4>:3000/health` trên trình duyệt điện thoại.
- Không dùng `localhost` cho thiết bị thật.

## 5. Dừng môi trường

`Ctrl+C` tại terminal đang chạy Expo — backend do script tạo tự dừng.

MySQL được giữ lại để lần chạy sau nhanh hơn. Khi muốn dừng MySQL:

```bash
docker compose -f docker/docker-compose.yml stop mysql
```

Không dùng `down -v` nếu muốn giữ dữ liệu local.

## 6. Kiểm tra thủ công Taste Board + vòng quay

1. Đăng nhập bằng `locket-test@foodroulette.app` / `password123`.
2. Mở tab Spin — vòng quay phải hiển thị nhà hàng seed thật (không phải 6 món mock cứng).
3. Quay → chọn quán thắng → **Đăng Taste Board**.
4. Chụp ảnh, viết review nếu muốn, chọn visibility.
5. Đăng Taste Board — backend xác nhận `restaurant_id` là UUID thật, locket xuất hiện trong feed.
6. Xóa Taste Board bằng tài khoản owner.
7. Với bài Công khai, kiểm tra public profile; bài Riêng tư/Bạn bè không lộ trên profile công khai.

## 7. Lệnh kiểm tra chất lượng

Backend:

```bash
cd backend
npm run lint
npm run typecheck
npm run build
npm run test:run
npm run db:validate
```

Mobile:

```bash
cd apps/mobile
npm run typecheck
npm run lint
npm run test
```

## 8. Lỗi thường gặp

### `backend/.env is missing`

Tạo từ `backend/.env.example` (mục 2.1). Script không tự tạo `.env`.

### Cổng API bị chiếm

```bash
./scripts/run-app.sh simulator
# -> Port 3000 is already in use...
```

Script luôn chạy backend mới từ repo, nên phải giải phóng cổng hoặc đổi cổng:

```bash
docker compose -f docker/docker-compose.yml stop backend
API_PORT=3001 ./scripts/run-app.sh simulator
```

Kiểm tra process giữ cổng: `lsof -nP -iTCP:3000 -sTCP:LISTEN`.

### MySQL không healthy

```bash
docker compose -f docker/docker-compose.yml logs mysql
```

Kiểm tra cổng `3306` có bị MySQL khác chiếm hay không.

### Backend không phản hồi ở cổng API

```bash
curl http://localhost:3000/health
```

Script chỉ chấp nhận backend có health payload của Food Roulette (`success: true`, message `Food Roulette API is running`).

### Vòng quay không có nhà hàng

Chạy lại seed: `cd backend && npm run seed`, rồi khởi động lại script. `GET /api/v1/restaurants?status=APPROVED` phải trả danh sách quán có `id` dạng UUID.

### Expo giữ cấu hình cũ

Thoát Expo và chạy lại. Script luôn truyền `--clear` để xóa Metro cache.

### Thiết bị thật không gọi được API

Xác nhận API URL dùng IP LAN của Mac, không phải `localhost`, và mở `/health` từ chính điện thoại.