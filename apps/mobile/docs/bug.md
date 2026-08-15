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
