import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, ThumbsUp, Camera } from 'lucide-react';
import { MemberScore } from '../../../api/endpoints/circle';

interface CircleAiSuggestionCardProps {
  memberScores: MemberScore[];
}

export const CircleAiSuggestionCard: React.FC<CircleAiSuggestionCardProps> = ({ memberScores }) => {
  const navigate = useNavigate();
  if (!memberScores || memberScores.length === 0) return null;

  return (
    <div className="my-6 p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-100/30 border border-amber-200/80 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-stone-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          🔮 AI Gợi Ý Món Best Match Cho Nhóm
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
          Personalized
        </span>
      </div>

      <div className="space-y-3">
        {memberScores.map((m, idx) => {
          const matchPercent = Math.round(m.matchScore * 100);
          const isHighMatch = matchPercent >= 70;

          return (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white border border-amber-100 shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center border border-amber-300">
                    {m.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-xs text-stone-800">{m.userName}</span>
                </div>
                <div
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isHighMatch
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isHighMatch ? 'Match: ' : 'Hợp: '} {matchPercent}%
                </div>
              </div>

              {/* Best match item */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">{m.topItem.name}</span>
                  {m.topItem.priceVND && (
                    <span className="text-[11px] font-semibold text-amber-700">
                      {m.topItem.priceVND.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
                <ThumbsUp className="w-4 h-4 text-amber-500" />
              </div>

              {/* Vietnamese Reasons */}
              {m.reasons && m.reasons.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-stone-600">
                  {m.reasons.map((r, rIdx) => (
                    <span key={rIdx} className="flex items-center gap-1 font-medium bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {r}
                    </span>
                  ))}
                </div>
              )}

              {/* Alternative Picks */}
              {m.alternativeItems && m.alternativeItems.length > 0 && (
                <div className="pt-1 text-[10px] text-stone-400">
                  <span>Gợi ý thêm: </span>
                  <span className="font-semibold text-stone-600">
                    {m.alternativeItems.map((alt) => alt.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Button to scan new menu for the group */}
      <button
        onClick={() => navigate('/spin/menu-capture')}
        className="w-full mt-4 py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
      >
        <Camera className="w-4 h-4" />
        📷 Quét Menu AI Quán Mới Cho Nhóm
      </button>
    </div>
  );
};

export default CircleAiSuggestionCard;
