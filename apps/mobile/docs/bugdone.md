# Bug done — Verified & archived

> Bug user verify OK (`[x] Verified`) → **AI auto-move** từ `bug.md` sang đây,
> thêm `Ngày fix` + `Ngày verify`. Giữ nguyên số `BUG #N` — không reuse.

---

## BUG #1: Lỗi đường dẫn khi nhấn "QUAY NGAY!" tại Group Spin Lobby

**Status**: `[x] Verified`
**Ngày report**: 2026-08-13
**Ngày fix**: 2026-08-13
**Ngày verify**: 2026-08-13
**Severity**: `P0 crash`

### Triệu chứng
Khi nhấn vào nút "QUAY NGAY!" ở màn hình Group Spin Lobby (`/group-spin/lobby`), ứng dụng điều hướng tới đường dẫn không tồn tại `/group-spin/spinning` và xuất hiện lỗi 404 "Trang không tìm thấy".

### Expected
Bấm "QUAY NGAY!" thì bánh xe quay ngẫu nhiên 3.5s và tự chuyển tới màn hình kết quả chọn món ăn (`/spin/result`).

### Root cause
Nút "QUAY NGAY!" tại thanh `bottomBar` trong `GroupLobby.tsx` gán cứng đường dẫn `/group-spin/spinning` (không tồn tại trong Expo Router).

### Fix
- `apps/mobile/src/features/spin/components/FoodRoulette.tsx`: Thêm `forwardRef` để gọi hàm `spin()` điều khiển bánh xe, thêm prop `showSpinButton={false}` để ẩn nút quay lặp lại.
- `apps/mobile/src/features/spin/components/GroupLobby.tsx`: Kết nối nút "QUAY NGAY!" ở thanh bottom bar với ref bánh xe, cập nhật hiệu ứng `🔄 ĐANG QUAY...` và tự động chuyển đến màn hình kết quả `/spin/result` khi quay xong.

### Verify steps
1. Mở app ➔ Chuyển sang Group Spin Lobby.
2. Kiểm tra chỉ còn 1 nút "🎉 QUAY NGAY!" duy nhất ở cuối màn hình.
3. Bấm "🎉 QUAY NGAY!" ➔ Nút đổi thành "🔄 ĐANG QUAY...", bánh xe xoay mượt mà trong 3.5 giây.
4. Khi bánh xe dừng ➔ Tự động mở màn hình Kết Quả (`/spin/result`) hiển thị món trúng thưởng.

---

## BUG #2: Lỗi viền/nền màu xám lệch tone trên màn hình Trang Chủ (Home)

**Status**: `[x] Verified`
**Ngày report**: 2026-08-13
**Ngày fix**: 2026-08-13
**Ngày verify**: 2026-08-13
**Severity**: `P2 minor`

### Triệu chứng
Tại màn hình Trang Chủ (`HomeScreen`), phần nội dung ở giữa xuất hiện nền màu xám/trắng lệch màu với thanh Header ("Trang chủ") và thanh Tab Bar ở chân trang, tạo thành các khoảng viền màu xám trắng đứt đoạn mất thẩm mỹ.

### Expected
Toàn bộ nền ứng dụng thống nhất màu kem ấm `background: #FFF8E7` từ Header, thân bài đến Tab Bar chân trang.

### Root cause
1. Thẻ `SafeAreaView` bọc `HomeScreen` (`app/(tabs)/index.tsx`) thiếu thuộc tính `flex: 1` và `backgroundColor: '#FFF8E7'`.
2. Khai báo `contentStyle` ở root `app/_layout.tsx` bị dùng sai mã màu `#FDF5E6` thay vì chuẩn brand `#FFF8E7`.

### Fix
- `apps/mobile/app/_layout.tsx`: Cập nhật `headerStyle` và `contentStyle` về mã màu kem ấm chuẩn `#FFF8E7`.
- `apps/mobile/app/(tabs)/index.tsx`: Thay `SafeAreaView` bằng `View` với `flex: 1` và `backgroundColor: '#FFF8E7'`, đồng thời bổ sung `style={{ flex: 1, backgroundColor: '#FFF8E7' }}` cho `ScrollView`.

### Verify steps
1. Mở ứng dụng ➔ Màn hình Trang chủ.
2. Kiểm tra phần nền giữa Header, thân bài và Tab Bar chân trang ➔ Tất cả đồng nhất màu kem ấm `#FFF8E7`, không còn viền trắng hay mảng màu xám lệch tone.
