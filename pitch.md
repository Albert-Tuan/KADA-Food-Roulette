# Bài Pitch 5 phút — Food Roulette

> **Nhóm: 5 chú sâu code**
> Thời lượng: 5 phút | 4 phần | Người trình bày: Đặng Tuấn Anh (nhóm trưởng)
>
> *Ghi chú: Thời gian gợi ý cho mỗi phần. Chữ in nghiêng là lời nói, chữ trong [ngoặc vuông] là hành động/slide.*

---

## Phần 1 — MỒI: Nỗi đau có thật (1 phút 15 giây)

[Slide 1: Màn hình đen, chỉ có 1 dòng chữ lớn: **"Trưa nay ăn gì?"**]

*"Mời mọi người tưởng tượng. 11 rưỡi trưa. Bụng đói. Bạn mở group chat ra hỏi một câu duy nhất:"*

*"Trưa nay ăn gì?"*

[Im lặng 2 giây]

*"Và rồi… im lặng. Hoặc tệ hơn — 10 người, 10 ý kiến khác nhau."*

[Slide 2: Chat giả lập — mỗi người gợi ý 1 quán khác nhau, cuối cùng ai đó nói "thôi ăn cơm tấm quen đi"]

*"Bún bò." — "Không, hôm qua ăn rồi."*
*"Sushi?" — "Đắt quá."*
*"Lẩu?" — "Nóng chết."*
*"Thôi ăn cơm tấm quen đi."*

*"Kết quả? 30 phút cãi nhau. Cuối cùng quay về đúng cái quán ăn hôm qua, hôm kia, và tuần trước."*

[Slide 3: Số liệu — 3 con số lớn]

*"Đây không phải chuyện vui. Đây là số thật:"*

- ***67%** người dùng smartphone mất hơn **15 phút** chỉ để quyết định ăn gì.*
- *Dân văn phòng lãng phí trung bình **2.5 giờ mỗi tuần** — chỉ để chọn chỗ ăn.*
- *Và sau 30 phút tranh luận, **80%** quay về canteen hoặc 2-3 quán cũ.*

*"Vấn đề không phải là thiếu quán ăn. Vấn đề là **có quá nhiều** — nhiều đến mức không chọn được."*

*"Trong tâm lý học, người ta gọi đó là **Nghịch lý lựa chọn** — càng nhiều lựa chọn, càng khó quyết định, càng ít hài lòng."*

[Nhịp — chuyển giọng]

*"Nhóm mình tự hỏi: Nếu có một cách để biến 30 phút đau đầu đó… thành 3 giây thì sao?"*

---

## Phần 2 — CÂU CHUYỆN GIẢI PHÁP: Dựng gì, vì sao làm vậy (1 phút 30 giây)

[Slide 4: Logo Food Roulette + tagline "Không biết ăn gì? Để vòng quyết định."]

*"Đó là lý do nhóm mình xây **Food Roulette**."*

*"Ý tưởng rất đơn giản: **Thay vì lướt, thay vì cãi — quay.**"*

[Slide 5: Mockup app — bánh xe roulette đang quay]

*"Food Roulette là một mobile app giúp bạn chọn quán ăn ngẫu nhiên xung quanh vị trí hiện tại — bằng cách quay một bánh xe. Giống vòng quay may mắn, nhưng lần nào quay cũng có quán ngon."*

*"Nhưng mình không dừng ở đó. Mình giải quyết 3 bài toán mà Foody, ShopeeFood chưa làm được:"*

[Slide 6: 3 điểm khác biệt — icon + text ngắn]

*"**Một** — Quay cho nhóm. Tối đa 20 người cùng quay, cùng vote. Đa số chấp nhận thì đi. Không ai phải nhường, không ai phải cãi."*

*"**Hai** — Locket camera-only. Muốn review? Phải chụp tại quán. Không upload ảnh mạng, không ảnh stock. Mỗi tấm ảnh có GPS và timestamp — chứng minh bạn thật sự đã ở đó. Review trên Food Roulette là review thật."*

*"**Ba** — Bản đồ quán riêng. Không chỉ dựa vào Google Maps. Người dùng có thể thêm quán mà Google chưa biết — những quán trong hẻm, quán vỉa hè ngon nhưng không ai quảng cáo. Có đội Steward duyệt chất lượng."*

[Slide 7: Stack công nghệ — đơn giản, visual]

*"Về mặt kỹ thuật, mình dùng **React Native + Expo** để chạy được cả iOS và Android từ một codebase. Backend là **Supabase** với **PostGIS** để query quán ăn theo bán kính. Realtime cho group spin. Camera-only enforce ở cả app lẫn server."*

---

## Phần 3 — DEMO (1 phút 30 giây)

[Chuyển sang live demo hoặc video demo đã quay sẵn]

*"Giờ thay vì nói thêm, mình cho mọi người xem luôn."*

### Demo flow 1 — Quay cá nhân (~30 giây)

[Mở app → Màn hình Spin]

*"Đây là màn hình chính. Mình đang ở khu vực [tên khu vực]. Mình chỉ cần chọn filter — ví dụ món Việt, dưới 100K, trong bán kính 2km — rồi nhấn SPIN."*

[Bánh xe quay animation → Dừng → Hiện kết quả quán ăn]

*"3 giây. Xong. Đây là quán [tên quán], cách mình 800 mét, rating 4.3 sao, giá trung bình 65K. Mình có thể xem chi tiết, xem review, hoặc nhấn SPIN lại nếu chưa ưng."*

### Demo flow 2 — Quay nhóm (~30 giây)

[Tạo group spin → Mời bạn → Cả nhóm thấy bánh xe realtime]

*"Bây giờ mình tạo một group spin. Mời 3 người bạn vào. Mọi người cùng thấy bánh xe quay realtime trên màn hình. Kết quả hiện cùng lúc. Mỗi người vote: Chấp nhận hoặc Quay lại. Đa số chấp nhận — app đưa đường đi luôn."*

*"Không cãi nhau. Không mất 30 phút. Mọi người cùng quyết định trong 10 giây."*

### Demo flow 3 — Locket (~30 giây)

[Mở tạo Locket → Camera bật → Chụp → Ghi chú → Đăng]

*"Ăn xong, mình mở Locket. Lưu ý — không có nút upload ảnh. Chỉ có camera. Mình chụp món ăn tại quán, app tự gắn GPS và timestamp. Ghi chú ngắn, chấm 4 sao, chọn chia sẻ với bạn bè. Xong."*

*"Bạn bè mình thấy trong feed, nhấn 'Tôi cũng muốn ăn!' để lưu lại. Viral loop tự nhiên."*

---

## Phần 4 — CHỐT: Mở ra gì tiếp theo (45 giây)

[Slide 8: Roadmap timeline — v1.0 → v1.2 → v2.0]

*"Hiện tại nhóm mình đang ở giai đoạn phát triển MVP — phiên bản 1.0 với đầy đủ: Spin cá nhân, Group spin, Locket, Review, và Khám phá quán."*

*"Phiên bản 1.2 sẽ thêm **AI moderation** — tự động lọc review spam — và **AI gợi ý khẩu vị** dựa trên lịch sử ăn uống của bạn."*

*"Và phiên bản 2.0 — đó là gamification: streak ăn quán mới, achievement, AI Food Advisor — một trợ lý ẩm thực cá nhân."*

[Slide 9: 3 con số mục tiêu]

*"Mục tiêu của mình:"*

- *Giảm thời gian chọn quán từ **25 phút xuống 3 giây**.*
- *Giúp người dùng khám phá **40% quán mới** trong tháng đầu.*
- *Đạt **85% trust** cho hệ thống review — so với ~40% trên các nền tảng hiện tại.*

[Slide 10: Màn hình cuối — Logo + tagline + QR code]

*"Food Roulette không chỉ là một app chọn quán. Đó là cách mình biến bữa ăn hàng ngày — thứ mà ai cũng phải quyết định, ngày nào cũng phải quyết định — thành một trải nghiệm vui hơn, nhanh hơn, và thật hơn."*

[Nhìn khán giả]

*"Lần tới khi bạn không biết ăn gì — để vòng quyết định."*

*"Cảm ơn mọi người."*

---

## Phụ lục — Ghi chú trình bày

### Phân bổ thời gian

| Phần | Thời gian | Nội dung chính |
|------|-----------|---------------|
| 1. Mồi | ~1:15 | Kể nỗi đau thật, số liệu, đặt vấn đề |
| 2. Giải pháp | ~1:30 | App là gì, 3 USP, stack |
| 3. Demo | ~1:30 | 3 flow: cá nhân, nhóm, locket |
| 4. Chốt | ~0:45 | Roadmap, số mục tiêu, câu kết |
| **Tổng** | **~5:00** | |

### Tips khi trình bày

- **Phần Mồi:** Nói chậm, để khán giả đồng cảm. Đoạn chat giả lập nên đọc như đang đóng vai — vui một chút.
- **Phần Giải pháp:** Nhấn mạnh 3 USP bằng cách đếm "Một, Hai, Ba" rõ ràng.
- **Phần Demo:** Quay video demo backup phòng trường hợp live demo lỗi. Không giải thích quá nhiều — để app nói thay.
- **Phần Chốt:** Câu cuối cùng "để vòng quyết định" phải nói chậm, dứt khoát, nhìn thẳng khán giả.
- **Không đọc slide.** Slide chỉ là hình ảnh hỗ trợ — bạn là người kể chuyện.

### Slide cần chuẩn bị (10 slide)

1. "Trưa nay ăn gì?" (text lớn, nền đen)
2. Chat giả lập (mockup tin nhắn nhóm)
3. 3 con số thống kê (67%, 2.5 giờ/tuần, 80%)
4. Logo + tagline
5. Mockup app — bánh xe quay
6. 3 USP (icon + text ngắn)
7. Stack công nghệ (visual đơn giản)
8. Roadmap (v1.0 → v1.2 → v2.0)
9. 3 mục tiêu (3 giây, 40%, 85%)
10. Logo + tagline + QR code (slide kết)

---

*Phiên bản: 1.0 · Ngày: 2026-08-04 · Nhóm: 5 chú sâu code*
