import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { restaurantApi } from '../../../api/endpoints/restaurants';

const CUISINE_OPTIONS = [
  'Cơm Tấm', 'Phở', 'Bún Bò Huế', 'Bánh Mì', 'Món Chay', 'Bún Riêu',
  'Hải Sản', 'Lẩu', 'Cơm Rang', 'Bún Thịt Nướng', 'Mì', 'Cà Phê', 'Trà Sữa', 'Khác',
];

const SubmitRestaurantForm: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    address: '',
    category: '',
    phone: '',
    priceLevel: 2,
    lat: '',
    lng: '',
  });
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      restaurantApi.create({
        name: form.name,
        address: form.address || undefined,
        category: form.category || undefined,
        priceLevel: form.priceLevel,
        phone: form.phone || undefined,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
      }),
    onSuccess: () => {
      navigate('/discover/submit-success');
    },
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }));
        setLocationLabel(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="bg-background min-h-screen font-body-md pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background pt-8 pb-4 px-4 flex items-center justify-between border-b border-subtle-gray">
        <button onClick={() => navigate(-1)} aria-label="Quay lại" className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </button>
        <h1 className="font-headline-md text-on-background font-bold text-lg">Thêm quán mới</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="px-4 max-w-lg mx-auto space-y-6 pt-6">
        {/* Info banner */}
        <div className="bg-primary-container/20 border border-primary/20 rounded-xl p-3 flex gap-2">
          <span className="material-symbols-outlined text-primary text-lg mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="text-on-surface-variant text-sm font-body-md">
            Quán sẽ được Steward kiểm duyệt trước khi xuất hiện trong vòng quay.
          </p>
        </div>

        {/* Tên quán */}
        <div>
          <label className="font-label-strong text-on-background text-sm font-semibold block mb-1.5">
            Tên quán <span className="text-error">*</span>
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ví dụ: Cơm Tấm Ba Cường"
            className="w-full border border-subtle-gray rounded-xl px-4 py-3 font-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-primary transition-shadow bg-surface-white"
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="font-label-strong text-on-background text-sm font-semibold block mb-1.5">
            Địa chỉ <span className="text-error">*</span>
          </label>
          <input
            required
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Số nhà, đường, quận, thành phố"
            className="w-full border border-subtle-gray rounded-xl px-4 py-3 font-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-primary transition-shadow bg-surface-white"
          />
        </div>

        {/* Vị trí GPS */}
        <div>
          <label className="font-label-strong text-on-background text-sm font-semibold block mb-1.5">Vị trí GPS (tùy chọn)</label>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locating}
            className="w-full flex items-center gap-2 border border-subtle-gray rounded-xl px-4 py-3 bg-surface-white hover:bg-surface-container-low transition-colors text-left"
          >
            <span className={`material-symbols-outlined text-primary ${locating ? 'animate-pulse' : ''}`}>my_location</span>
            <span className="font-body-md text-on-surface-variant text-sm">
              {locating ? 'Đang lấy vị trí...' : locationLabel || 'Dùng vị trí hiện tại'}
            </span>
          </button>
        </div>

        {/* Loại món */}
        <div>
          <label className="font-label-strong text-on-background text-sm font-semibold block mb-1.5">Loại món</label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: f.category === c ? '' : c }))}
                className={`px-3 py-1.5 rounded-full border text-sm font-label-strong transition-colors ${
                  form.category === c
                    ? 'bg-primary text-surface-white border-primary'
                    : 'bg-surface-white text-on-surface-variant border-subtle-gray hover:bg-surface-container-low'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Mức giá */}
        <div>
          <label className="font-label-strong text-on-background text-sm font-semibold block mb-1.5">Mức giá</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setForm((f) => ({ ...f, priceLevel: level }))}
                className={`flex-1 py-2 rounded-xl border font-label-strong text-sm transition-colors ${
                  form.priceLevel === level
                    ? 'bg-primary text-surface-white border-primary'
                    : 'bg-surface-white text-on-surface-variant border-subtle-gray hover:bg-surface-container-low'
                }`}
              >
                {'$'.repeat(level)}
              </button>
            ))}
          </div>
        </div>

        {/* SĐT */}
        <div>
          <label className="font-label-strong text-on-background text-sm font-semibold block mb-1.5">Số điện thoại (tùy chọn)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="0901 234 567"
            className="w-full border border-subtle-gray rounded-xl px-4 py-3 font-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-primary transition-shadow bg-surface-white"
          />
        </div>

        {/* Error */}
        {mutation.isError && (
          <div className="bg-error-container/20 border border-error/30 rounded-xl p-3 text-error text-sm">
            {(mutation.error as any)?.response?.data?.error || 'Có lỗi xảy ra. Thử lại nhé!'}
          </div>
        )}
      </form>

      {/* Submit button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-lg mx-auto">
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={mutation.isPending || !form.name.trim() || !form.address.trim()}
            className="w-full bg-primary text-on-primary font-headline-md py-4 rounded-xl shadow-[0_4px_0_0_#92001b] hover:translate-y-1 hover:shadow-[0_2px_0_0_#92001b] active:translate-y-2 active:shadow-none transition-all disabled:opacity-60 disabled:transform-none flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_location</span>
                Gửi đề xuất
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitRestaurantForm;
