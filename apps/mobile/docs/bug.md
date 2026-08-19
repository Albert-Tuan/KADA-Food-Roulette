# Bug — Active bugs

> **Cách dùng**: file này chứa **tất cả bug đang xử lý**. Mỗi bug 1 block với format
> `BUG #N`. Bug mới: copy block "Template" cuối file, paste lên đầu, tăng số.
>
> **3 phase status**:
> - `[ ] Open` — bug được report, chưa fix
> - `[~] Fixed, awaiting verify` — AI đã fix xong, đợi user test
> - `[x] Verified` — user test OK → **AI auto-move sang `bugdone.md`**
>
> Rule: AI **KHÔNG** auto-move khi mới ở `[~]` — phải chờ user tick `[x]` sau khi verify.
>
> **Số thứ tự (`#N`)**: không reuse — bug nào cũng có số duy nhất, giữ nguyên khi
> move sang `bugdone.md`. Bug mới = max(bug.md + bugdone.md) + 1.



## BUG #12: Tab navigation quá nhỏ (Taste Board)

**Status**: `[ ] Open`
**Ngày report**: `2026-08-17`
**Severity**: `[ ] P0 crash  [ ] P1 major  [x] P2 minor  [ ] P3 polish`

### Triệu chứng

Các tab navigation ("Tất cả", "Của tôi", "Bạn bè", "Khám phá") quá nhỏ, khó nhìn và dễ nhấn nhầm:
- Tab chiếm không gian tối thiểu, không chia đều 4 cột ngang
- Padding/khoảng trắng giữa các tab không đủ
- Text size quá nhỏ so với chiều cao của tab bar
- Hit target nhỏ hơn chuẩn (44x44px iOS HIG / 48x48dp Material)

Screenshot: `1786967151199_image.png`

### Expected

- Mỗi tab chiếm ~25% chiều rộng màn hình (4 tab chia đều)
- Hit target tối thiểu 44x44px (iOS) / 48x48dp (Material)
- Tăng vertical padding cho vùng nhấn
- Text size lớn hơn, tăng độ tương phản, có focus state rõ

### Root cause (fill sau khi debug)


### Fix (fill khi AI xong)


### Verify steps (cho user test)

1. Mở Taste Board Live
2. Nhìn tab navigation (4 nút lọc)
3. Kiểm tra tab rộng đều ~25% màn hình, vùng nhấn ≥ 44pt, chữ dễ đọc
4. Chạm từng tab để xác nhận không nhấn nhầm

---

## 📋 Template (copy block này khi report bug mới)

```markdown
## BUG #<N>: <tên bug>

**Status**: `[ ] Open`
**Ngày report**: `<YYYY-MM-DD>`
**Severity**: `[ ] P0 crash  [ ] P1 major  [ ] P2 minor  [ ] P3 polish`

### Triệu chứng


### Expected


### Root cause (fill sau khi debug)


### Fix (fill khi AI xong)


### Verify steps (cho user test)


```
