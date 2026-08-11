/**
 * Moderation Item Detail Page
 *
 * Review detail page for flagged content
 * Reference: docs/decisions/001-ai-moderation.md
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useModerationItem,
  useApproveModeration,
  useRejectModeration,
  useAutoHideModeration,
} from '../../../../features/moderation/hooks/useModeration';
import {
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type ModerationCategory,
  type ModerationStatus,
} from '../../../../features/moderation/types';

export default function ModerationItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState('');

  const { data: item, isLoading, isError } = useModerationItem(id);
  const approveMutation = useApproveModeration();
  const rejectMutation = useRejectModeration();
  const autoHideMutation = useAutoHideModeration();

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse text-stone-500">Đang tải...</div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <h2 className="text-sm font-medium text-red-800">
            Không tìm thấy moderation item
          </h2>
          <Link
            to="/steward/moderation/queue"
            className="mt-2 inline-block text-sm text-red-700 underline"
          >
            ← Quay lại queue
          </Link>
        </div>
      </div>
    );
  }

  const isPending = item.status === 'pending';
  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    autoHideMutation.isPending;

  const handleApprove = () => {
    approveMutation.mutate(
      { id: item.id, note: note || undefined },
      {
        onSuccess: () => navigate('/steward/moderation/queue'),
      }
    );
  };

  const handleReject = () => {
    rejectMutation.mutate(
      { id: item.id, note: note || undefined },
      {
        onSuccess: () => navigate('/steward/moderation/queue'),
      }
    );
  };

  const handleAutoHide = () => {
    autoHideMutation.mutate(
      { id: item.id, note: note || undefined },
      {
        onSuccess: () => navigate('/steward/moderation/queue'),
      }
    );
  };

  const confidencePct = (item.confidence * 100).toFixed(1);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <nav className="mb-4 text-sm">
        <Link
          to="/steward/moderation/queue"
          className="text-amber-700 hover:text-amber-900 focus:outline-none focus:underline"
        >
          ← Quay lại queue
        </Link>
      </nav>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-stone-900">
            Review Moderation Item
          </h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
              STATUS_COLORS[item.status as ModerationStatus]
            }`}
          >
            {STATUS_LABELS[item.status as ModerationStatus]}
          </span>
        </div>
        <p className="text-sm text-stone-600">
          Item ID: <code className="text-xs">{item.id}</code>
        </p>
      </header>

      {/* AI Analysis Section */}
      <section
        aria-label="AI Analysis"
        className="mb-6 rounded-lg border border-stone-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-stone-900 mb-4">
          AI Analysis
        </h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase">
              Content Type
            </dt>
            <dd className="mt-1 text-sm text-stone-900">{item.contentType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase">
              Content ID
            </dt>
            <dd className="mt-1 text-sm text-stone-900 font-mono">
              {item.contentId}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase">
              Category
            </dt>
            <dd className="mt-1 text-sm text-stone-900">
              {CATEGORY_LABELS[item.category as ModerationCategory] ??
                item.category}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase">
              Confidence
            </dt>
            <dd className="mt-1">
              <span className="text-2xl font-bold text-amber-700">
                {confidencePct}%
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase">
              Flagged By
            </dt>
            <dd className="mt-1 text-sm text-stone-900">{item.flaggedBy}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-stone-500 uppercase">
              Created
            </dt>
            <dd className="mt-1 text-sm text-stone-900">
              {new Date(item.createdAt).toLocaleString('vi-VN')}
            </dd>
          </div>
        </dl>

        {item.payload && Object.keys(item.payload).length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900">
              Raw API Response
            </summary>
            <pre className="mt-2 text-xs bg-stone-50 rounded p-3 overflow-x-auto">
              {JSON.stringify(item.payload, null, 2)}
            </pre>
          </details>
        )}
      </section>

      {/* Reviewer Actions */}
      {isPending && (
        <section
          aria-label="Reviewer Actions"
          className="rounded-lg border border-amber-200 bg-amber-50 p-6"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            Reviewer Actions
          </h2>

          <div className="mb-4">
            <label
              htmlFor="reviewer-note"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Note (tùy chọn)
            </label>
            <textarea
              id="reviewer-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Lý do approve/reject/auto-hide..."
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isMutating}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={handleAutoHide}
              disabled={isMutating}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Auto-hide
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isMutating}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </div>
        </section>
      )}

      {/* Already Reviewed Info */}
      {!isPending && (
        <section
          aria-label="Review history"
          className="rounded-lg border border-stone-200 bg-stone-50 p-6"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-2">
            Đã được review
          </h2>
          {item.reviewedAt && (
            <p className="text-sm text-stone-700">
              Review lúc:{' '}
              {new Date(item.reviewedAt).toLocaleString('vi-VN')}
            </p>
          )}
          {item.reviewerNote && (
            <div className="mt-3">
              <p className="text-xs font-medium text-stone-500 uppercase mb-1">
                Reviewer note
              </p>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">
                {item.reviewerNote}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}