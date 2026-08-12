/**
 * Moderation Stats Dashboard
 *
 * Overview stats cho steward
 * Reference: docs/decisions/001-ai-moderation.md
 */

import { Link } from 'react-router-dom';
import { useModerationStats } from '../../../features/moderation/hooks/useModeration';

export default function ModerationStatsPage() {
  const { data, isLoading, isError } = useModerationStats();

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse text-stone-500">Đang tải...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <h2 className="text-sm font-medium text-red-800">
            Lỗi khi tải stats
          </h2>
        </div>
      </div>
    );
  }

  const total = data.total || 1; // avoid div-by-zero

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          Moderation Statistics
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Tổng quan về AI moderation
        </p>
      </header>

      {/* Top Stats */}
      <section
        aria-label="Overview"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      >
        <StatCard
          label="Tổng flagged"
          value={data.total}
          color="stone"
        />
        <StatCard
          label="Pending"
          value={data.byStatus.pending}
          color="amber"
          highlighted={data.byStatus.pending > 0}
        />
        <StatCard
          label="Approved"
          value={data.byStatus.approved}
          color="emerald"
        />
        <StatCard
          label="Rejected"
          value={data.byStatus.rejected}
          color="red"
        />
        <StatCard
          label="Auto-hidden"
          value={data.byStatus.auto_hidden}
          color="slate"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <section
          aria-label="By category"
          className="rounded-lg border border-stone-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            By Category
          </h2>
          {Object.keys(data.byCategory).length === 0 ? (
            <p className="text-sm text-stone-500">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(data.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <li
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-stone-700">{category}</span>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-stone-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{
                            width: `${(count / total) * 100}%`,
                          }}
                          aria-label={`${count} items`}
                        />
                      </div>
                      <span className="text-sm font-medium text-stone-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* By Flagged By */}
        <section
          aria-label="By flagged by"
          className="rounded-lg border border-stone-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            By Source
          </h2>
          {Object.keys(data.byFlaggedBy).length === 0 ? (
            <p className="text-sm text-stone-500">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(data.byFlaggedBy)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <li
                    key={source}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-stone-700 font-mono">
                      {source}
                    </span>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-stone-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-stone-500"
                          style={{
                            width: `${(count / total) * 100}%`,
                          }}
                          aria-label={`${count} items`}
                        />
                      </div>
                      <span className="text-sm font-medium text-stone-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>

      {/* Today's Activity */}
      <section
        aria-label="Today's activity"
        className="mt-6 rounded-lg border border-stone-200 bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Flagged hôm nay
            </h2>
            <p className="mt-1 text-3xl font-bold text-amber-700">
              {data.flaggedToday}
            </p>
          </div>
          <Link
            to="/steward/moderation/queue"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Mở queue
          </Link>
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: 'stone' | 'amber' | 'emerald' | 'red' | 'slate';
  highlighted?: boolean;
}

function StatCard({ label, value, color, highlighted }: StatCardProps) {
  const colorClass = {
    stone: 'bg-stone-50 border-stone-200 text-stone-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
  }[color];

  return (
    <div
      className={`rounded-lg border p-4 ${colorClass} ${
        highlighted ? 'ring-2 ring-amber-500' : ''
      }`}
    >
      <p className="text-xs font-medium uppercase opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value.toLocaleString('vi-VN')}</p>
    </div>
  );
}