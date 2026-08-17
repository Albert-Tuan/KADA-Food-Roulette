import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Eye, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#2C1810] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-black text-amber-800 hover:text-orange-600 transition-colors bg-white/80 px-4 py-2 rounded-xl border border-amber-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-amber-200 shadow-xl shadow-amber-900/5 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Bảo vệ quyền riêng tư
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 mt-1">
                Chính Sách Bảo Mật (Privacy Policy)
              </h1>
            </div>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân tại Việt Nam • Cập nhật: Tháng 08/2026
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-amber-200 shadow-xl shadow-amber-900/5 space-y-8 text-sm leading-relaxed text-stone-700">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              Cam Kết Bảo Mật Của Food Roulette
            </h2>
            <p>
              Food Roulette coi trọng sự riêng tư và bảo vệ dữ liệu cá nhân của người dùng. Chúng tôi cam kết chỉ thu thập những dữ liệu cần thiết phục vụ cho trải nghiệm ẩm thực thông minh và tuyệt đối không bán dữ liệu người dùng cho bên thứ ba.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              Dữ Liệu Chúng Tôi Thu Thập
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <h4 className="font-extrabold text-amber-900 text-xs uppercase mb-1">📍 Vị trí GPS & Địa Lý</h4>
                <p className="text-xs text-stone-600">
                  Dùng để tìm kiếm quán ăn xung quanh và xác thực check-in tại quán (bán kính hợp lệ 100m).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <h4 className="font-extrabold text-amber-900 text-xs uppercase mb-1">📷 Camera & Ảnh Món Ăn (Locket)</h4>
                <p className="text-xs text-stone-600">
                  Dùng để quét menu AI và chụp ảnh món ăn thật. Hệ thống tự động xóa dữ liệu EXIF gốc nhạy cảm trước khi chia sẻ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <h4 className="font-extrabold text-amber-900 text-xs uppercase mb-1">🌶️ Khẩu Vị & Sở Thích AI</h4>
                <p className="text-xs text-stone-600">
                  Thể loại món yêu thích, mức độ ăn cay, chế độ ăn chay, nguyên liệu dị ứng nhằm tối ưu hóa vòng quay.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <h4 className="font-extrabold text-amber-900 text-xs uppercase mb-1">👤 Hồ Sơ & Thông Tin Tài Khoản</h4>
                <p className="text-xs text-stone-600">
                  Email đăng nhập, tên hiển thị công khai (Public ID) và biệt danh thân mật (Private Name) chỉ bạn bè thấy.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              Mục Đích Sử Dụng Dữ Liệu
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-stone-600">
              <li><b>Tạo vòng quay cá nhân hóa:</b> Thuật toán AI kết hợp khẩu vị của bạn để đưa ra gợi ý món ăn chính xác nhất.</li>
              <li><b>Tính năng nhóm (Group Spin):</b> Tổng hợp khẩu vị chung của tối đa 20 thành viên để chọn ra món mà cả nhóm cùng đồng thuận.</li>
              <li><b>Trao thưởng & Tích chuỗi:</b> Ghi nhận check-in hợp lệ để cộng điểm XP, lượt quay may mắn và tiến trình Vườn Mùa Màng.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              Quyền Hạn Của Người Dùng
            </h2>
            <p>
              Theo quy định pháp luật hiện hành, bạn có toàn quyền:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Xem và chỉnh sửa khẩu vị ẩm thực bất kỳ lúc nào tại màn hình Thiết lập.</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Thiết lập quyền riêng tư cho từng bài đăng Locket (Riêng tư / Bạn bè / Công khai).</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan khỏi hệ thống máy chủ.</span>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <span>Yêu cầu hỗ trợ về dữ liệu cá nhân: <b>privacy@foodroulette.app</b></span>
            <Link to="/terms" className="font-bold text-amber-800 hover:text-orange-600 underline">
              Xem Điều khoản dịch vụ ➔
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
