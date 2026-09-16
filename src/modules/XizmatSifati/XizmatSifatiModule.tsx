import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, User, Clock, Award, Filter, Download } from 'lucide-react';
import { ServiceRating } from '../../types';
import { storageService } from '../../services/storageService';
import { exportToCSV } from '../../utils/exportUtils';

export const XizmatSifatiModule: React.FC = () => {
  const [ratings, setRatings] = useState<ServiceRating[]>(storageService.getRatings());
  const [selectedStar, setSelectedStar] = useState<number | 'ALL'>('ALL');

  const total = ratings.length;
  const avgScore = total
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(2)
    : '4.80';

  // Breakdown by stars (5 to 1)
  const starCounts = [5, 4, 3, 2, 1].map((s) => {
    const count = ratings.filter((r) => r.rating === s).length;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return { stars: s, count, percent };
  });

  const filtered = ratings.filter((r) => {
    if (selectedStar === 'ALL') return true;
    return r.rating === selectedStar;
  });

  const handleExportCSV = () => {
    const data = filtered.map((r) => ({
      Abonent: r.subscriberName,
      Telefon: r.phone,
      Baho: r.rating,
      Izoh: r.comment,
      Teglar: r.tags.join(', '),
      Haydovchi: r.driverName || 'Noma’lum',
      Sana: r.createdAt,
    }));
    exportToCSV('Xizmat_Sifati_Baholari', data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Xizmat Sifatini Baholash</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Abonentlarning 1–5 yulduzli baholari, sharhlari va haydovchilar reytingi
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs"
        >
          <Download className="h-4 w-4" /> Excel Eksport
        </button>
      </div>

      {/* Main Score & Star Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left: Score Box */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-black text-slate-900 tracking-tight">{avgScore}</div>
          <div className="flex items-center gap-1 text-amber-500 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${
                  s <= Math.round(Number(avgScore))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-bold text-slate-700">Umumiy o‘rtacha qoniqish indeksi</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Jami {total} ta real baholash asosida</div>
        </div>

        {/* Center: 5 to 1 Star Breakdown */}
        <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-center space-y-2.5">
          {starCounts.map((item) => (
            <div
              key={item.stars}
              onClick={() => setSelectedStar(item.stars === selectedStar ? 'ALL' : item.stars)}
              className={`flex items-center gap-3 text-xs cursor-pointer p-1.5 rounded-lg transition-colors ${
                selectedStar === item.stars ? 'bg-amber-50 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-16 flex items-center gap-1 text-slate-700 font-bold shrink-0">
                <span>{item.stars}</span>
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              </div>

              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%` }}
                />
              </div>

              <div className="w-20 text-right text-slate-500 text-[11px] shrink-0">
                <strong>{item.count} ta</strong> ({item.percent}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filtr:</span>
          <button
            onClick={() => setSelectedStar('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold ${
              selectedStar === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'
            }`}
          >
            Barchasi ({ratings.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStar(s)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                selectedStar === s ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 border'
              }`}
            >
              <span>{s}</span> ★
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{r.subscriberName}</div>
                  <div className="text-[11px] text-slate-400">{r.phone}</div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{r.rating}.0</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                "{r.comment}"
              </p>

              {r.tags && r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Haydovchi: <strong className="text-slate-700">{r.driverName || 'Noma’lum'}</strong></span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {r.createdAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
