import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Dices,
  Users,
  Award,
  Shield,
  ArrowRight,
  CheckCircle2,
  Heart,
  ChevronRight,
  Flame,
  Smartphone,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#2C1810] font-sans selection:bg-amber-200">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-2 px-4 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase">Mới ra mắt 🔥</span>
        <span>Tính năng Bánh xe 3D Casino chọn cùng lúc 1-3 món & Quét Menu AI 3.5 đã có mặt!</span>
      </div>

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
            🍟
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-[#3D2314]">FOOD ROULETTE</span>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest -mt-1">
              Quay là ra, ăn là ghiền
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-black text-stone-700 hover:text-orange-600 transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            to="/spin"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            Trải nghiệm ngay ➔
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-black mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span>Giải pháp dẹp tan câu hỏi "Hôm nay ăn gì?" cho nhóm bạn & cặp đôi</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#2C1810] tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Không biết ăn gì? <br />
          <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent">
            Để vòng Roulette quyết định!
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#5C3317] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Ứng dụng kết hợp <b>Bánh xe 3D Casino</b>, <b>AI Quét Menu 3.5</b> và <b>Khoảnh khắc Locket</b> giúp bạn tìm quán ngon, gắp món chuẩn vị và chia bill cực nhanh.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link
            to="/spin"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black text-base shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <Dices className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            <span>Quay Thử Ngay (Miễn Phí)</span>
          </Link>

          <Link
            to="/spin/menu-capture"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white border-2 border-amber-300 text-stone-800 font-black text-base shadow-md hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5 text-orange-600" />
            <span>📷 Quét Menu AI</span>
          </Link>
        </div>

        {/* Hero Interactive Showcase Card */}
        <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-3xl bg-white/90 border-2 border-amber-200/80 shadow-2xl shadow-amber-900/10 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-[#FFF8EF] border border-amber-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-3 font-bold">
                  🎰
                </div>
                <h3 className="font-black text-base text-stone-900 mb-1">Vòng Quay 3D Casino</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Quay chọn cùng lúc 1 đến 3 món ăn với đa kim định vị 3D không lo trùng lặp.
                </p>
              </div>
              <span className="text-[11px] font-extrabold text-orange-600 mt-4 flex items-center gap-1">
                Trải nghiệm ➔
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF8EF] border border-amber-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-3 font-bold">
                  📷
                </div>
                <h3 className="font-black text-base text-stone-900 mb-1">Quét Menu AI 3.5</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Chụp ảnh thực đơn tại quán, AI tự lọc món theo khẩu vị chay/mặn/dị ứng của bạn.
                </p>
              </div>
              <span className="text-[11px] font-extrabold text-amber-700 mt-4 flex items-center gap-1">
                Độ chính xác cao ➔
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF8EF] border border-amber-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3 font-bold">
                  📸
                </div>
                <h3 className="font-black text-base text-stone-900 mb-1">Locket Food Moments</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Check-in ảnh món ăn thật với bạn bè, tích chuỗi ăn uống nhận voucher thưởng.
                </p>
              </div>
              <span className="text-[11px] font-extrabold text-emerald-700 mt-4 flex items-center gap-1">
                Kết nối bạn bè ➔
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1: 3D Casino Roulette */}
      <section className="py-16 bg-white border-y border-amber-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black">
                <Dices className="w-4 h-4" />
                <span>CÔNG NGHỆ BÁNH XE CASINO 3D</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
                Quay cùng lúc 1 đến 3 món — <br />
                <span className="text-orange-600">Đầy đủ mâm cỗ chỉ với 1 cú click!</span>
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Không chỉ quay chọn từng món lẻ, tính năng Multi-Dish Roulette cho phép bạn chọn chế độ quay <b>2 món (Combo đôi)</b> hoặc <b>3 món (Mâm tiệc)</b> cùng một lúc. Các kim chỉ định vị 3D phân bố đều ở các góc giúp chọn ra các món hoàn hảo cho cả bàn ăn.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-stone-800">Tự động gắp món trúng vào bàn ăn và tính tổng hóa đơn</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-stone-800">Chia bill theo đầu người chính xác kèm nút copy gửi Zalo/Nhóm</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-stone-800">Hiệu ứng vật lý giảm tốc chuẩn Casino Roulette chân thực</span>
                </div>
              </div>

              <Link
                to="/spin"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all"
              >
                <span>Quay thử bánh xe 3D ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual Demo Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-2xl shadow-orange-500/20 text-center relative overflow-hidden">
              <div className="text-6xl mb-4">🎰</div>
              <h3 className="text-2xl font-black mb-2">Vòng Quay 3D Đa Món</h3>
              <p className="text-xs text-amber-100 max-w-sm mx-auto mb-6">
                Chế độ 1 món • 2 món cùng lúc • 3 món mâm cỗ
              </p>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span>🎉 Combo vừa quay trúng:</span>
                  <span className="bg-white/30 px-2 py-0.5 rounded-full text-[10px]">3 Món</span>
                </div>
                <p className="text-sm font-black">1. Phở Bò Tái Nạm (65.000đ)</p>
                <p className="text-sm font-black">2. Gỏi Cuốn Tôm Thịt (40.000đ)</p>
                <p className="text-sm font-black">3. Trà Đào Cam Sả (35.000đ)</p>
                <div className="pt-2 border-t border-white/20 flex justify-between text-xs font-bold">
                  <span>Tổng tiền: 140.000đ</span>
                  <span>Chia 4 người: ~35.000đ/người</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: AI Menu Scanner */}
      <section className="py-16 bg-[#FFF8EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Scanner Card */}
            <div className="order-2 lg:order-1 p-8 rounded-3xl bg-white border-2 border-amber-300 shadow-xl shadow-amber-900/5 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
                📷
              </div>
              <h3 className="text-xl font-black text-stone-900">AI Menu Vision 3.5</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Nhận diện nhanh thực đơn tiếng Việt, phân loại món chính, đồ uống, giá tiền và điểm số phù hợp với từng người.
              </p>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-around">
                <span>⚡ OCR Siêu Tốc</span>
                <span>🌿 Tự Lọc Món Chay</span>
                <span>🌶️ Kiểm Tra Độ Cay</span>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-black">
                <Camera className="w-4 h-4 text-orange-600" />
                <span>AI VISION 3.5 SIÊU THÔNG MINH</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
                Chụp Menu Quán — <br />
                <span className="text-amber-700">AI Tự Lọc & Nạp Vào Vòng Quay!</span>
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Đến quán ăn đông đúc với menu hàng trăm món mà không biết chọn gì? Chỉ cần chụp 1 tấm ảnh menu, AI sẽ trích xuất danh sách món ăn, kiểm tra độ cay, dị ứng theo hồ sơ của bạn và tạo vòng quay chọn món tức thì!
              </p>

              <Link
                to="/spin/menu-capture"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 text-white font-black text-sm shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all"
              >
                <span>Thử tính năng quét Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Stats */}
      <section className="py-16 bg-white border-y border-amber-200/60 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-10">
            Cộng đồng Foodie yêu thích Food Roulette 💖
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200">
              <p className="text-3xl font-black text-orange-600 mb-1">50.000+</p>
              <p className="text-xs font-bold text-stone-600">Lượt quay mỗi ngày</p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200">
              <p className="text-3xl font-black text-amber-600 mb-1">12.000+</p>
              <p className="text-xs font-bold text-stone-600">Quán ăn được khám phá</p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200">
              <p className="text-3xl font-black text-emerald-600 mb-1">98.5%</p>
              <p className="text-xs font-bold text-stone-600">Hài lòng sau khi quay</p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200">
              <p className="text-3xl font-black text-red-600 mb-1">4.9/5 ⭐</p>
              <p className="text-xs font-bold text-stone-600">Đánh giá từ người dùng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C1810] text-[#FAF0E6] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍟</span>
                <span className="font-black text-lg text-white">FOOD ROULETTE</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Nền tảng ẩm thực ngẫu nhiên thông minh, biến mỗi bữa ăn thành một cuộc phiêu lưu thú vị cùng bạn bè.
              </p>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 mb-3">Tính Năng</h4>
              <ul className="space-y-2 text-xs text-stone-300">
                <li><Link to="/spin" className="hover:text-amber-400">Bánh xe 3D Casino</Link></li>
                <li><Link to="/spin/menu-capture" className="hover:text-amber-400">Quét Menu AI 3.5</Link></li>
                <li><Link to="/onboarding" className="hover:text-amber-400">Thiết lập khẩu vị cá nhân</Link></li>
                <li><Link to="/leaderboard" className="hover:text-amber-400">Bảng xếp hạng bạn bè</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 mb-3">Pháp Lý & Chính Sách</h4>
              <ul className="space-y-2 text-xs text-stone-300">
                <li><Link to="/terms" className="hover:text-amber-400">Điều khoản dịch vụ</Link></li>
                <li><Link to="/privacy" className="hover:text-amber-400">Chính sách bảo mật</Link></li>
                <li><Link to="/commitment" className="hover:text-amber-400">Cam kết chất lượng</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 mb-3">Liên Hệ</h4>
              <p className="text-xs text-stone-300 mb-2">Email: contact@foodroulette.app</p>
              <p className="text-xs text-stone-400">TP. Hồ Chí Minh & Hà Nội, Việt Nam</p>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
            © 2026 Food Roulette. Bản quyền thuộc về Đội ngũ KADA Food Roulette. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
