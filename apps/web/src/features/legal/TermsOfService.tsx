import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Văn bản pháp lý
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 mt-1">
                Điều Khoản Dịch Vụ (Terms of Service)
              </h1>
            </div>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Có hiệu lực từ ngày 01 tháng 01 năm 2026 • Cập nhật lần cuối: Tháng 08/2026
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-amber-200 shadow-xl shadow-amber-900/5 space-y-8 text-sm leading-relaxed text-stone-700">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              Chấp Thuận Điều Khoản
            </h2>
            <p>
              Chào mừng bạn đến với <b>Food Roulette</b> ("Ứng dụng", "Chúng tôi"). Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ tính năng nào của ứng dụng trên nền tảng Web hoặc Mobile, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản dịch vụ này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              Mục Đích Dịch Vụ & Cơ Chế Hoạt Động
            </h2>
            <p>
              Food Roulette là nền tảng hỗ trợ người dùng đưa ra quyết định chọn món ăn và quán ăn ngẫu nhiên dựa trên các thuật toán Roulette 3D, công nghệ nhận diện thực đơn AI Vision và hồ sơ sở thích cá nhân.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li><b>Tính chất tham khảo:</b> Các kết quả quay thưởng món ăn, gợi ý quán ăn, giá cả hiển thị mang tính chất tham khảo thực tế tại thời điểm quét/nhập liệu.</li>
              <li><b>Quyền của người dùng:</b> Người dùng có toàn quyền chấp nhận kết quả quay, quay lại (Re-spin), hoặc điều chỉnh bộ lọc khẩu vị bất cứ lúc nào.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              Tài Khoản & Trách Nhiệm Người Dùng
            </h2>
            <p>
              Khi tạo tài khoản tại Food Roulette, bạn cam kết cung cấp thông tin chính xác và chịu trách nhiệm bảo mật thông tin đăng nhập cá nhân.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
              <p className="font-bold text-amber-900">Người dùng cam kết KHÔNG thực hiện các hành vi sau:</p>
              <p>• Đăng tải hình ảnh Locket vi phạm thuần phong mỹ tục, hình ảnh bạo lực hoặc không liên quan đến ẩm thực.</p>
              <p>• Sử dụng công cụ tự động (bot, crawl) gây quá tải hạ tầng hệ thống.</p>
              <p>• Giả mạo danh tính cá nhân hoặc đánh giá sai lệch ác ý về các nhà hàng đối tác.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              Vòng Quay May Mắn & Mã Giảm Giá (Voucher)
            </h2>
            <p>
              Các phần quà, voucher giảm giá nhận được thông qua tính năng <b>Vòng Quay May Mắn (Lucky Spin)</b> sau khi check-in quán ăn phải tuân thủ điều kiện sử dụng cụ thể của từng nhà hàng đối tác và không có giá trị quy đổi thành tiền mặt.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                5
              </span>
              Giới Hạn Trách Nhiệm
            </h2>
            <p>
              Food Roulette nỗ lực tối đa để đảm bảo tính chính xác của menu quét AI và thông tin quán ăn. Tuy nhiên, chúng tôi không chịu trách nhiệm đối với các thay đổi về giá cả tại quán, tình trạng hết món thực tế, hoặc các vấn đề an toàn thực phẩm thuộc trách nhiệm trực tiếp của các cơ sở kinh doanh ăn uống.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <span>Mọi thắc mắc về điều khoản dịch vụ, vui lòng liên hệ: <b>legal@foodroulette.app</b></span>
            <Link to="/privacy" className="font-bold text-amber-800 hover:text-orange-600 underline">
              Xem Chính sách bảo mật ➔
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
