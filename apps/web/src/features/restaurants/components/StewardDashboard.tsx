import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stewardApi, PendingRestaurant } from '../../../api/endpoints/steward';

const StewardDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PendingRestaurant | null>(null);
  const [notes, setNotes] = useState('');
  const [mergeId, setMergeId] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['steward', 'pending', page],
    queryFn: () => stewardApi.listPending(page, 20),
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, action, notes, mergeWithId }: { id: string; action: 'APPROVE' | 'REJECT' | 'MERGE'; notes?: string; mergeWithId?: string }) =>
      stewardApi.decide(id, { action, notes, mergeWithId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['steward', 'pending'] });
      setSelected(null);
      setNotes('');
      setMergeId('');
    },
  });

  const handleDecide = (action: 'APPROVE' | 'REJECT' | 'MERGE') => {
    if (!selected) return;
    decideMutation.mutate({ id: selected.id, action, notes, mergeWithId: mergeId || undefined });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-body-md">Đang tải danh sách quán chờ duyệt...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <span className="material-symbols-outlined text-6xl text-error mb-4 block">error_outline</span>
          <p className="text-on-surface-variant font-body-md">Không thể tải dữ liệu. Bạn có quyền Steward không?</p>
        </div>
      </div>
    );
  }

  const restaurants = data?.restaurants ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background font-body-md">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-subtle-gray px-6 py-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
        <div>
          <h1 className="font-headline-md text-on-background text-lg font-bold">Steward Dashboard</h1>
          <p className="font-caption text-on-surface-variant text-xs">
            {pagination?.total ?? 0} quán đang chờ duyệt
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {restaurants.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">check_circle</span>
            <p className="font-headline-md text-on-background font-semibold">Hàng đợi trống!</p>
            <p className="text-on-surface-variant font-body-md mt-1">Không có quán nào chờ duyệt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {restaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onSelect={() => setSelected(r)}
                isSelected={selected?.id === r.id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-subtle-gray bg-surface-white text-on-surface disabled:opacity-40 hover:bg-surface-container-low transition-colors"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-on-surface-variant">
              {page} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-subtle-gray bg-surface-white text-on-surface disabled:opacity-40 hover:bg-surface-container-low transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </main>

      {/* Decision Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-on-background/50 flex items-end justify-center p-0 md:items-center md:p-4">
          <div className="w-full max-w-lg bg-surface-white rounded-t-2xl md:rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-headline-md text-on-background font-bold text-lg">{selected.name}</h2>
                <p className="text-on-surface-variant font-body-md text-sm mt-0.5">{selected.address}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Duplicate warning */}
            {(selected.nearbyDuplicates?.length || 0) > 0 && (
              <div className="bg-warning-container/20 border border-warning rounded-xl p-3">
                <p className="text-warning font-label-strong text-sm font-semibold mb-1">
                  Có thể trùng ({selected.nearbyDuplicates?.length} quán trong bán kính 50m):
                </p>
                {selected.nearbyDuplicates?.map((d) => (
                  <p key={d.id} className="text-on-surface-variant text-xs">
                    • {d.name} ({d.distanceM}m)
                  </p>
                ))}
              </div>
            )}

            {/* Notes input */}
            <div>
              <label className="font-label-strong text-on-background text-sm block mb-1">Ghi chú (tùy chọn)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Lý do từ chối hoặc ghi chú cho người dùng..."
                className="w-full border border-subtle-gray rounded-xl px-3 py-2 font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Merge ID (shown if there are duplicates) */}
            {(selected.nearbyDuplicates?.length || 0) > 0 && (
              <div>
                <label className="font-label-strong text-on-background text-sm block mb-1">Merge vào quán ID</label>
                <input
                  value={mergeId}
                  onChange={(e) => setMergeId(e.target.value)}
                  placeholder={selected.nearbyDuplicates?.[0]?.id}
                  className="w-full border border-subtle-gray rounded-xl px-3 py-2 font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {decideMutation.isError && (
              <p className="text-error font-body-md text-sm">Lỗi xử lý. Thử lại nhé!</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleDecide('APPROVE')}
                disabled={decideMutation.isPending}
                className="flex-1 bg-primary text-surface-white font-label-strong py-3 rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Duyệt
              </button>
              {((selected.nearbyDuplicates?.length || 0) > 0) && mergeId && (
                <button
                  onClick={() => handleDecide('MERGE')}
                  disabled={decideMutation.isPending}
                  className="flex-1 bg-secondary-container text-on-secondary-container font-label-strong py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">merge</span>
                  Merge
                </button>
              )}
              <button
                onClick={() => handleDecide('REJECT')}
                disabled={decideMutation.isPending}
                className="flex-1 bg-error-container text-on-error-container font-label-strong py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RestaurantCard: React.FC<{ restaurant: PendingRestaurant; onSelect: () => void; isSelected: boolean }> = ({
  restaurant,
  onSelect,
  isSelected,
}) => {
  const hasDuplicate = (restaurant.nearbyDuplicates?.length || 0) > 0;

  return (
    <div
      onClick={onSelect}
      className={`bg-surface-white border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : hasDuplicate ? 'border-warning' : 'border-subtle-gray'
      }`}
    >
      <div className="flex gap-4 items-start">
        {/* Photo or placeholder */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-low flex items-center justify-center">
          {restaurant.photos && restaurant.photos[0] ? (
            <img src={restaurant.photos[0]} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">restaurant</span>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-label-strong text-on-background font-semibold truncate">{restaurant.name}</h3>
            {hasDuplicate && (
              <span className="flex-shrink-0 text-xs font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                Có thể trùng
              </span>
            )}
          </div>
          <p className="text-on-surface-variant text-xs mt-0.5 truncate">{restaurant.address}</p>
          <div className="flex items-center gap-3 mt-2">
            {restaurant.category && (
              <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
                {restaurant.category}
              </span>
            )}
            {restaurant.priceLevel && (
              <span className="text-xs text-tertiary font-semibold">
                {'$'.repeat(restaurant.priceLevel)}
              </span>
            )}
            <span className="text-xs text-on-surface-variant ml-auto">
              {new Date(restaurant.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StewardDashboard;
