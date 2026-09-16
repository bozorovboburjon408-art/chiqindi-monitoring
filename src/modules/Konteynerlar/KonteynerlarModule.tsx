import React, { useState } from 'react';
import {
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Battery,
  MapPin,
  Clock,
  Layers,
  Download,
  Sparkles,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { Container, ContainerStatus, WasteType } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { exportToCSV } from '../../utils/exportUtils';

export const KonteynerlarModule: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>(storageService.getContainers());
  const regions = storageService.getRegions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWasteType, setSelectedWasteType] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Interactive Test Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [activeContainer, setActiveContainer] = useState<Container | null>(null);
  const [testFillLevel, setTestFillLevel] = useState<number>(85);

  const refreshData = () => {
    setContainers(storageService.getContainers());
  };

  const filtered = containers.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.chymName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchType = selectedWasteType === 'ALL' || c.wasteType === selectedWasteType;
    const matchReg = selectedRegion === 'ALL' || c.regionId === selectedRegion;
    return matchSearch && matchStatus && matchType && matchReg;
  });

  const handleOpenSimulate = (cnt: Container) => {
    setActiveContainer(cnt);
    setTestFillLevel(cnt.fillLevel);
    setTestModalOpen(true);
  };

  const handleSaveFillLevel = () => {
    if (!activeContainer) return;
    let newStatus: ContainerStatus = 'Normal';
    if (testFillLevel === 100) newStatus = 'To‘lgan';
    else if (testFillLevel >= 80) newStatus = 'Xavfli';
    else if (testFillLevel >= 50) newStatus = 'Ogohlantirish';

    const updated: Container = {
      ...activeContainer,
      fillLevel: testFillLevel,
      status: newStatus,
      lastUpdated: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };

    storageService.saveContainer(updated);

    // If >= 80, create alert
    if (testFillLevel >= 80) {
      storageService.addNotification({
        id: `notif-cnt-${Date.now()}`,
        title: testFillLevel === 100 ? 'Favqulodda: Konteyner to‘ldi!' : 'Ogohlantirish: Konteyner 80%+',
        message: `${activeContainer.address} manzilidagi konteyner to‘lish darajasi ${testFillLevel}% ga yetdi.`,
        type: 'container_full',
        level: testFillLevel === 100 ? 'danger' : 'warning',
        isRead: false,
        createdAt: 'Hozirgina',
        linkModule: 'containers',
        targetId: activeContainer.id,
      });
    }

    refreshData();
    setTestModalOpen(false);
  };

  const handleExportCSV = () => {
    const data = filtered.map((c) => ({
      Kod: c.code,
      Manzil: c.address,
      CHYM: c.chymName,
      Tuman: c.regionName,
      Tolish_foizi: `${c.fillLevel}%`,
      Turi: c.wasteType,
      Status: c.status,
      Datchik_batareyasi: `${c.sensorBattery}%`,
      Yangilangan: c.lastUpdated,
    }));
    exportToCSV('Konteynerlar_Monitoringi', data);
  };

  const getStatusColor = (status: ContainerStatus) => {
    switch (status) {
      case 'Normal':
        return 'bg-emerald-500 text-white';
      case 'Ogohlantirish':
        return 'bg-amber-500 text-white';
      case 'Xavfli':
        return 'bg-orange-500 text-white';
      case 'To‘lgan':
        return 'bg-rose-600 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Aqlli Konteynerlar Monitoringi</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Ultratovush datchiklari orqali real vaqtda to‘lish darajasi (0–100%) va avtomatik signalizatsiya
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

      {/* Legend & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-600 text-sm">
            0–50%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Normal holat</div>
            <div className="text-[11px] text-slate-400">Reja bo‘yicha</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-600 text-sm">
            50–80%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Ogohlantirish</div>
            <div className="text-[11px] text-slate-400">Kuzatuv ostida</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm">
            80–99%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Xavfli to‘lish</div>
            <div className="text-[11px] text-orange-600 font-semibold">Avto ALERT faol</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs flex items-center gap-3 ring-1 ring-rose-300">
          <div className="h-9 w-9 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white text-sm animate-pulse">
            100%
          </div>
          <div>
            <div className="text-xs font-black text-rose-700">TO‘LGAN (KRITIK)</div>
            <div className="text-[11px] text-rose-500 font-semibold">Dispetcher signali</div>
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
            <option value="To‘lgan">🔴 To‘lgan (100%)</option>
            <option value="Xavfli">🟠 Xavfli (80–99%)</option>
            <option value="Ogohlantirish">🟡 Ogohlantirish (50–80%)</option>
            <option value="Normal">🟢 Normal (0–50%)</option>
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
            <option value="ALL">Barcha tumanlar</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Containers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((cnt) => {
          const is100 = cnt.fillLevel === 100;
          const is80 = cnt.fillLevel >= 80;

          return (
            <div
              key={cnt.id}
              className={`rounded-2xl bg-white border p-4 shadow-xs transition-all flex flex-col justify-between ${
                is100
                  ? 'border-rose-400 ring-2 ring-rose-400/40 shadow-rose-100 shadow-md'
                  : is80
                  ? 'border-amber-300'
                  : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {cnt.code}
                  </span>
                  <Badge
                    variant={is100 ? 'danger' : is80 ? 'warning' : 'success'}
                    pulse={is100}
                  >
                    {cnt.status}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-semibold">To‘lish darajasi:</span>
                    <span
                      className={`text-base font-black ${
                        is100 ? 'text-rose-600' : is80 ? 'text-amber-600' : 'text-slate-900'
                      }`}
                    >
                      {cnt.fillLevel}%
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        is100
                          ? 'bg-rose-600 animate-pulse'
                          : is80
                          ? 'bg-orange-500'
                          : cnt.fillLevel >= 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${cnt.fillLevel}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <div className="font-bold text-slate-800 line-clamp-1">{cnt.chymName}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{cnt.address}</div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {cnt.wasteType}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Battery className="h-3 w-3 text-emerald-600" /> {cnt.sensorBattery}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {cnt.lastUpdated}
                </span>
                <button
                  onClick={() => handleOpenSimulate(cnt)}
                  className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Sliders className="h-3 w-3" /> Sinov
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Test / Simulation Modal */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Datchik ko‘rsatkichini sinov tariqasida o‘zgartirish"
        subtitle={`Konteyner: ${activeContainer?.code || ''} • Manzil: ${activeContainer?.address || ''}`}
      >
        {activeContainer && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Bu yerda siz datchik to‘lish foizini qo‘lda o‘zgartirib, 80%+ va 100% kritik signalizatsiya va bildirishnomalar qanday ishlashini darhol sinab ko‘rishingiz mumkin:
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-black text-slate-900 mb-2">
                {testFillLevel}%
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={testFillLevel}
                onChange={(e) => setTestFillLevel(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0% (Bo‘sh)</span>
                <span>50% (Normal)</span>
                <span>80% (Xavfli)</span>
                <span>100% (To‘lgan)</span>
              </div>
            </div>

            {testFillLevel >= 80 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Diqqat:</strong> {testFillLevel}% ko‘rsatkichi saqlanganda avtomatik ravishda dispetcherlik alerti hosil qilinadi!
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveFillLevel}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md"
              >
                Ko‘rsatkichni qo‘llash
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
