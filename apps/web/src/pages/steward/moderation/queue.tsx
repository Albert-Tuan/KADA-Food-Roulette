/**
 * Moderation Queue Page
 *
 * Steward dashboard - list flagged content pending review
 * Reference: docs/decisions/001-ai-moderation.md
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useModerationQueue } from '../../../features/moderation/hooks/useModeration';
import {
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type ModerationCategory,
  type ModerationStatus,
} from '../../../features/moderation/types';
import type {
  ModerationQueueItem,
  ModerationQueueFilters,
} from '../../../features/moderation/api/moderation.api';

const STATUS_OPTIONS: Array<{ value: ModerationStatus | ''; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: STATUS_LABELS.pending },
  { value: 'approved', label: STATUS_LABELS.approved },
  { value: 'rejected', label: STATUS_LABELS.rejected },
  { value: 'auto_hidden', label: STATUS_LABELS.auto_hidden },
];

const CONTENT_TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'review', label: 'Review' },
  { value: 'locket', label: 'Locket' },
  { value: 'comment', label: 'Comment' },
  { value: 'chat_message', label: 'Chat Message' },
];

export default function ModerationQueuePage() {
  const [filters, setFilters] = useState<ModerationQueueFilters>({
    status: 'pending',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 50,
  });

  const { data, isLoading, isError, error } = useModerationQueue(filters);

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <h2 className="text-sm font-medium text-red-800">
            Lỗi khi tải moderation queue
          </h2>
          <p className="mt-1 text-sm text-red-700">
            {(error as any)?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Moderation Queue</h1>
        <p className="mt-1 text-sm text-stone-600">
          Duyệt nội dung bị AI tự động flag. Mỗi quyết định sẽ được log lại.
        </p>
      </header>

      {/* Filters */}
      <section
        aria-label="Filters"
        className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg border border-stone-200 bg-white p-4"
      >
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Trạng thái
          </label>
          <select
            id="status-filter"
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value || undefined,
              }))
            }
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="type-filter"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Loại nội dung
          </label>
          <select
            id="type-filter"
            value={filters.contentType ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                contentType: e.target.value || undefined,
              }))
            }
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {CONTENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="confidence-filter"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Confidence tối thiểu
          </label>
          <input
            id="confidence-filter"
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={filters.minConfidence ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                minConfidence: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              }))
            }
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="0.0 - 1.0"
          />
        </div>

        <div>
          <label
            htmlFor="sort-filter"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Sắp xếp theo
          </label>
          <select
            id="sort-filter"
            value={`${filters.sortBy ?? 'createdAt'}-${filters.sortOrder ?? 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [
                'createdAt' | 'confidence',
                'asc' | 'desc'
              ];
              setFilters((f) => ({ ...f, sortBy, sortOrder }));
            }}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
            <option value="confidence-desc">Confidence cao nhất</option>
            <option value="confidence-asc">Confidence thấp nhất</option>
          </select>
        </div>
      </section>

      {/* Table */}
      <section
        aria-label="Queue list"
        className="rounded-lg border border-stone-200 bg-white overflow-hidden"
      >
        {isLoading ? (
          <div
            className="p-12 text-center text-stone-500"
            aria-label="Đang tải"
          >
            <div className="inline-block animate-pulse">Đang tải...</div>
          </div>
        ) : data && data.data.length > 0 ? (
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-stone-700 uppercase tracking-wider"
                >
                  Loại
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-stone-700 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-stone-700 uppercase tracking-wider"
                >
                  Confidence
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-stone-700 uppercase tracking-wider"
                >
                  Flagged By
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-stone-700 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-stone-700 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-stone-700 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {data.data.map((item) => (
                <QueueRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <h3 className="text-sm font-medium text-stone-900">
              Không có items nào
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Thay đổi filters để xem items khác.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function QueueRow({ item }: { item: ModerationQueueItem }) {
  const confidencePct = (item.confidence * 100).toFixed(0);
  const confidenceColor =
    item.confidence >= 0.9
      ? 'text-red-700'
      : item.confidence >= 0.7
      ? 'text-amber-700'
      : 'text-stone-600';

  return (
    <tr className="hover:bg-stone-50">
      <td className="px-4 py-3 text-sm text-stone-700">
        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700">
          {item.contentType}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-stone-700">
        {CATEGORY_LABELS[item.category as ModerationCategory] ?? item.category}
      </td>
      <td className={`px-4 py-3 text-sm font-medium ${confidenceColor}`}>
        {confidencePct}%
      </td>
      <td className="px-4 py-3 text-sm text-stone-600">
        {item.flaggedBy}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
            STATUS_COLORS[item.status as ModerationStatus]
          }`}
        >
          {STATUS_LABELS[item.status as ModerationStatus]}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-stone-600">
        {new Date(item.createdAt).toLocaleString('vi-VN')}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          to={`/steward/moderation/item/${item.id}`}
          className="text-amber-700 hover:text-amber-900 text-sm font-medium focus:outline-none focus:underline"
        >
          Review →
        </Link>
      </td>
    </tr>
  );
}