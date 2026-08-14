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

---

## BUG #3: Lỗi hiển thị nút bấm và nhãn chữ bị tàng hình/trong suốt tại Locket và Profile

**Status**: `[x] Verified`
**Ngày report**: 2026-08-14
**Ngày fix**: 2026-08-14
**Ngày verify**: 2026-08-14
**Severity**: `P1 major`

### Triệu chứng
Tại màn hình Locket (`(tabs)/lockets.tsx`) và Hồ Sơ (`(tabs)/profile.tsx`):
- Các tab lọc "Tất cả", "Của tôi", "Bạn bè", "Khám phá" có viền đen/xám và chữ bị mờ/trắng khó đọc trên nền kem.
- Nút "Thử lại" khi gặp lỗi tải feed/profile bị trong suốt background, khiến chữ "Thử lại" màu trắng chìm hẳn vào nền kem (tàng hình).
- Nút "Chụp Locket 🔥" ở góc dưới bị mất background đỏ, hiển thị viền đen với chữ trắng.

### Expected
- Các nút bấm có background màu đỏ chuẩn Stitch `#b52330`, hiệu ứng 3D game press màu `#61000e`, chữ trắng nổi bật 800.
- Các tab lọc có màu nền đỏ `#b52330` khi active và viền `#e2bebc` trên nền trắng `#ffffff` khi inactive.

### Root cause
Sau khi cập nhật `tailwind.config.js` theo hệ màu Stitch Soft Red Tokens, một số tên class màu legacy như `flamered`, `flameorange`, `borderflame` không còn khớp trong NativeWind, dẫn đến việc NativeWind render background thành trong suốt.

### Fix
- `apps/mobile/tailwind.config.js`: Thêm alias màu tương thích ngược.
- `apps/mobile/app/(tabs)/lockets.tsx`: Đổi sang style màu cố định `#b52330` cho nút "Thử lại", tab lọc và nút FAB.
- `apps/mobile/app/(tabs)/profile.tsx`: Cập nhật style màu cố định `#b52330` cho các thẻ thông tin.

---

## BUG #4: Hiển thị 2 nút Back quay lại trên màn hình Quét Menu AI (/spin/menu-capture)

**Status**: `[x] Verified`
**Ngày report**: 2026-08-14
**Ngày fix**: 2026-08-14
**Ngày verify**: 2026-08-14
**Severity**: `P2 minor`

### Triệu chứng
Tại màn hình Quét Menu AI (`/spin/menu-capture`), giao diện xuất hiện 2 nút Back quay lại đè lên nhau.

### Expected
Chỉ hiển thị 1 nút Back duy nhất (nút hình tròn màu đỏ Stitch `#b52330` tùy chỉnh).

### Root cause
Màn hình `spin/menu-capture` chưa khai báo option `headerShown: false` trong `app/_layout.tsx`.

### Fix
- `apps/mobile/app/_layout.tsx`: Thêm `<Stack.Screen name="spin/menu-capture" options={{ headerShown: false }} />`.
- `apps/mobile/app/spin/menu-capture.tsx`: Tối ưu giao diện header với nút Back màu đỏ Stitch `#b52330`.

---

## BUG #5: Hiển thị 2 nút Back quay lại và điều hướng trên màn hình Group Spin Lobby (/group-spin/lobby)

**Status**: `[x] Verified`
**Ngày report**: 2026-08-14
**Ngày fix**: 2026-08-14
**Ngày verify**: 2026-08-14
**Severity**: `P2 minor`

### Triệu chứng
1. Màn hình Group Spin Lobby (`/group-spin/lobby`) hiển thị 2 thanh Header trùng lặp.
2. Nút Back không quay về lại được trang chủ khi rỗng stack history.

### Expected
Hiển thị 1 thanh Header duy nhất và nút Back hoạt động mượt mà 100%.

### Root cause
1. Thiếu `headerShown: false` cho `group-spin/lobby` trong `app/_layout.tsx`.
2. Hàm điều hướng `router.back()` thiếu fallback `canGoBack()`.

### Fix
- `apps/mobile/app/_layout.tsx`: Thêm `<Stack.Screen name="group-spin/lobby" options={{ headerShown: false }} />`.
- `apps/mobile/app/group-spin/lobby.tsx`: Cập nhật hàm điều hướng thông minh `handleBack` với fallback `router.replace('/(tabs)')` và `hitSlop` tăng vùng chạm.

---

## BUG #6: Không hiển thị giao diện sheet Mời Bạn Nhóm (/group-spin/lobby) khi bấm nút "+"

**Status**: `[x] Verified`
**Ngày report**: 2026-08-14
**Ngày fix**: 2026-08-14
**Ngày verify**: 2026-08-14
**Severity**: `P2 minor`

### Triệu chứng
Tại màn hình Group Spin Lobby (`/group-spin/lobby`), khi bấm vào nút `➕ Mời bạn` để mở danh sách mời bạn bè, sheet mời không hiển thị nội dung mà chỉ hiện 1 nút đóng `✕` đứt đoạn ở góc trên màn hình.

### Expected
Bảng mời bạn (`InviteMembersSheet`) hiển thị mượt mà 100% dạng Bottom Sheet màu kem `#fff8ef`, chứa mã phòng nhóm `#PARTY2026`, nút sao chép/chia sẻ link, mã QR quét tại bàn và danh sách bạn bè trực tuyến trong app.

### Root cause
Component `InviteMembersSheet.tsx` sử dụng thẻ `<Modal>` gốc của React Native bị xung đột z-index/touch event khi lồng bên trong Stack Screen, đồng thời thiếu kiểm tra `if (!visible) return null;` ở mức root component.

### Fix
- `apps/mobile/src/features/spin/components/InviteMembersSheet.tsx`: Thay thế thẻ `<Modal>` gốc bằng `StyleSheet.absoluteFillObject` với `zIndex: 9999` và `elevation: 9999` (tương tự `SpinFilterSheet.tsx`), đồng thời thiết kế lại theo chuẩn Stitch Soft Red Tokens.

---

## BUG #7: Bị mất giao diện Group Vote & Veto (GroupVoteVeto & GroupVoteResult) khi quay nhóm xong

**Status**: `[x] Verified`
**Ngày report**: 2026-08-14
**Ngày fix**: 2026-08-14
**Ngày verify**: 2026-08-14
**Severity**: `P1 major`

### Triệu chứng
Tại màn hình Quay Với Nhóm (`/group-spin/lobby`), sau khi quay xong món ăn chiến thắng, màn hình lập tức bị chuyển hướng nhầm sang trang Kết Quả Cá Nhân 1 Người (`/spin/result`), làm bỏ qua hoàn toàn quy trình Bầu chọn & Phủ quyết nhóm (`GroupVoteVeto`) và Kết quả đồng thuận nhóm (`GroupVoteResult`).

### Expected
Sau khi quay nhóm xong:
1. Chuyển sang màn hình Bầu Chọn & Phủ Quyết (`GroupVoteVeto`) để các thành viên vote `✅ CHẤP NHẬN` hoặc `🔄 QUAY LẠI` hoặc `🚫 DÙNG VETO`.
2. Nếu đa số đồng ý (hoặc bấm `✅ CHẤP NHẬN`) ➔ Chuyển tiếp sang màn hình Kết Quả Đồng Thuận (`GroupVoteResult`) hiển thị gợi ý AI và nút `🤝 Tạo Khế Ước` / `🧭 Chỉ đường`.
3. Nếu nhóm chọn quay lại ➔ Trở về sảnh nhóm (`GroupLobby`) để thêm món và quay lại.

### Root cause
Hàm `handleSpinEnd` tại `app/group-spin/lobby.tsx` ép chuyển hướng cứng tới `/spin/result` (trang cá nhân), thay vì chuyển trạng thái bước (`step`) trong `GroupLobby.tsx`.

### Fix
- `apps/mobile/src/features/spin/components/GroupLobby.tsx`: Quản lý 3 trạng thái bước (`'LOBBY' | 'VOTE_VETO' | 'VOTE_RESULT'`) cho quy trình quay nhóm hoàn chỉnh, tích hợp `GroupVoteVeto` và `GroupVoteResult` kèm thiết kế chuẩn Stitch Soft Red Tokens.
- `apps/mobile/app/group-spin/lobby.tsx`: Bỏ hàm `router.push('/spin/result')` ép chuyển hướng cứng.




