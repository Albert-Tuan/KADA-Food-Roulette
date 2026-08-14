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

---

## BUG #1: <tên bug ngắn gọn>

**Status**: `[ ] Open`
**Ngày report**: `<YYYY-MM-DD>`
**Severity**: `[ ] P0 crash  [ ] P1 major  [ ] P2 minor  [ ] P3 polish`

### Triệu chứng

`<user thấy gì sai, gồm bước reproduce ngắn>`

**Ví dụ**:
- Khi tap "Xoá transaction" trong list, app crash với message "undefined is not a function"
- Chỉ xảy ra khi list > 20 items
- Steps: mở app → tab Home → tap 1 transaction → tap 🗑

### Expected

`<hành vi đúng phải là gì>`

### Root cause (fill sau khi debug)

`<AI phân tích + patch ở đâu>`

### Fix (fill khi AI xong)

`<file:line thay đổi + PR link nếu có>`

**Ví dụ**:
- `services/transaction-db.ts:45` — thiếu `?.` optional chain
- `app/(tabs)/index.tsx:120` — memoize handleDelete với useCallback

### Verify steps (cho user test)

`<AI ghi rõ user cần test cái gì để confirm fix>`

**Ví dụ**:
1. Mở app, vào tab Home
2. Tap 1 transaction bất kỳ trong list
3. Tap nút 🗑 → confirm dialog hiện
4. Tap "Xoá" → transaction biến mất khỏi list, không crash
5. Repeat 5 lần với transaction khác nhau

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
