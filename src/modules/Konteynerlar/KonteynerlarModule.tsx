import React, { useState } from 'react';
import {
  Trash2,
  Search,
  MapPin,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Box,
} from 'lucide-react';
import { Container, WasteType } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { exportToCSV } from '../../utils/exportUtils';

export const KonteynerlarModule: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>(storageService.getContainers());
  const regions = storageService.getRegions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWasteType, setSelectedWasteType] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  const filtered = containers.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.chymName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'Faol' && c.status !== 'Ta’mir talab') ||
      c.status === selectedStatus;
    const matchType = selectedWasteType === 'ALL' || c.wasteType === selectedWasteType;
    const matchReg = selectedRegion === 'ALL' || c.regionId === selectedRegion;
    return matchSearch && matchStatus && matchType && matchReg;
  });

  const handleExportCSV = () => {
    const data = filtered.map((c) => ({
      Kod: c.code,
      Maydoncha_CHYM: c.chymName,
      Manzil: c.address,
      Tuman: c.regionName,
      Sigimi: '1.1 m³',
      Chiqindi_turi: c.wasteType,
      Holati: c.status === 'Ta’mir talab' ? 'Ta’mir talab' : 'Faol / Yaroqli',
      Yangilangan: c.lastUpdated,
    }));
    exportToCSV('Konteynerlar_Inventarizatsiyasi', data);
  };

  const activeCount = containers.filter((c) => c.status !== 'Ta’mir talab').length;
  const repairCount = containers.filter((c) => c.status === 'Ta’mir talab').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            Konteynerlar Inventarizatsiyasi va Hisobi
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Chiqindi yig‘ish maydonchalariga (CHYM) biriktirilgan konteynerlar reyestri, sig‘imi va texnik holati
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs"
          >
            <Download className="h-4 w-4" /> Excel Eksport
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-extrabold text-emerald-600 text-sm shrink-0">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-black text-slate-900 truncate">{containers.length} ta</div>
            <div className="text-[11px] text-slate-400 truncate">Jami konteynerlar</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-extrabold text-teal-600 text-sm shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-black text-slate-900 truncate">{activeCount} ta</div>
            <div className="text-[11px] text-emerald-600 font-semibold truncate">Faol va yaroqli</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-extrabold text-amber-600 text-sm shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-black text-slate-900 truncate">{repairCount} ta</div>
            <div className="text-[11px] text-amber-600 font-semibold truncate">Ta’mir talab</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-extrabold text-indigo-600 text-sm shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-black text-slate-900 truncate">5 toifa</div>
            <div className="text-[11px] text-indigo-600 font-semibold truncate">Chiqindi turlari</div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Konteyner kodi yoki manzil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="ALL">Barcha holatlar ({containers.length})</option>
            <option value="Faol">🟢 Faol / Yaroqli</option>
            <option value="Ta’mir talab">🟡 Ta’mir talab</option>
            <option value="Zaxirada">⚪ Zaxirada</option>
          </select>
        </div>

        <div>
          <select
            value={selectedWasteType}
            onChange={(e) => setSelectedWasteType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="ALL">Barcha chiqindi turlari</option>
            <option value="Aralash">Aralash</option>
            <option value="Plastmassa">Plastmassa</option>
            <option value="Qog‘oz">Qog‘oz</option>
            <option value="Shisha">Shisha</option>
            <option value="Organik">Organik</option>
          </select>
        </div>

        <div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="ALL">Barcha hududlar</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fullName || r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Containers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((cnt) => {
          const isRepair = cnt.status === 'Ta’mir talab';

          return (
            <div
              key={cnt.id}
              className={`rounded-2xl bg-white border p-4 shadow-xs transition-all flex flex-col justify-between ${
                isRepair
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {cnt.code}
                  </span>
                  <Badge variant={isRepair ? 'warning' : 'success'}>
                    {isRepair ? 'Ta’mir talab' : 'Faol / Yaroqli'}
                  </Badge>
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-400 font-semibold">Biriktirilgan maydoncha:</div>
                    <div className="font-bold text-slate-900 line-clamp-1 mt-0.5">{cnt.chymName}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" /> {cnt.address}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <span className="text-emerald-700 font-semibold block">Turi:</span>
                      <strong className="text-slate-800">{cnt.wasteType}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                      <span className="text-blue-700 font-semibold block">Sig‘imi:</span>
                      <strong className="text-slate-800">1.1 m³ (Yevro)</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {cnt.lastUpdated}
                </span>
                <span className="font-semibold text-slate-600">{cnt.regionName}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
