import React, { useState, useEffect } from 'react';
import {
  Video,
  Search,
  Eye,
  Camera,
  MapPin,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Maximize2,
  RotateCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { CHYM } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const CHYMMonitoringModule: React.FC = () => {
  const [chyms, setCHYMs] = useState<CHYM[]>(storageService.getCHYMs());
  const regions = storageService.getRegions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [cameraFilter, setCameraFilter] = useState('ALL');

  // Camera Modal
  const [selectedChym, setSelectedChym] = useState<CHYM | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraTime, setCameraTime] = useState('');
  const [showAiBoxes, setShowAiBoxes] = useState(true);
  const [ptzZoom, setPtzZoom] = useState(1);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setCHYMs(storageService.getCHYMs());
    });
    return unsub;
  }, []);

  // Live timer for CCTV overlay
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCameraTime(now.toLocaleString('uz-UZ', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filtered = chyms.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchReg = selectedRegion === 'ALL' || c.regionId === selectedRegion;
    const matchCam = cameraFilter === 'ALL' || c.cameraStatus === cameraFilter;
    return matchSearch && matchReg && matchCam;
  });

  const handleOpenLiveCamera = (chym: CHYM) => {
    setSelectedChym(chym);
    setPtzZoom(1);
    setCapturedSnapshot(null);
    setIsCameraModalOpen(true);
  };

  const handleTakeSnapshot = () => {
    setCapturedSnapshot(`Kadr saqlandi: ${cameraTime} • #${selectedChym?.code}`);
    setTimeout(() => setCapturedSnapshot(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            ЧЙМ (Chiqindi Yig‘ish Maydonchalari) Monitoringi
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Maydonchalar sanitariya holati, konteynerlar to‘lishi va IP kameralar orqali videonazorat
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Maydoncha nomi, kodi yoki manzili..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
          />
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
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="ALL">Barcha kameralar</option>
            <option value="ONLINE">🟢 Kamera ONLINE</option>
            <option value="OFFLINE">⚪ Kamera OFFLINE</option>
            <option value="XATOLIK">🔴 Kamera XATOLIK</option>
          </select>
        </div>
      </div>

      {/* CHYM Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((chym) => {
          const isCritical = chym.fillPercentAvg >= 90;
          return (
            <div
              key={chym.id}
              className={`rounded-2xl bg-white border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isCritical ? 'border-rose-300 ring-1 ring-rose-300/50' : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {chym.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{chym.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {chym.address}
                    </p>
                  </div>
                  <Badge
                    variant={
                      chym.cameraStatus === 'ONLINE'
                        ? 'success'
                        : chym.cameraStatus === 'OFFLINE'
                        ? 'slate'
                        : 'danger'
                    }
                  >
                    {chym.cameraStatus}
                  </Badge>
                </div>

                {/* Progress bar of fullness */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Konteynerlar to‘lishi:</span>
                    <span
                      className={`font-black ${
                        chym.fillPercentAvg >= 80 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {chym.fillPercentAvg}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        chym.fillPercentAvg >= 90
                          ? 'bg-rose-600'
                          : chym.fillPercentAvg >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${chym.fillPercentAvg}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/70 text-[11px]">
                    <div>
                      <span className="text-slate-400">Sig‘im:</span>{' '}
                      <strong className="text-slate-800">{chym.containerCount} ta konteyner</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Tozalik:</span>{' '}
                      <strong
                        className={
                          chym.cleanlinessStatus === 'Qoniqarsiz' ? 'text-rose-600' : 'text-emerald-700'
                        }
                      >
                        {chym.cleanlinessStatus}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Tekshirildi: {chym.lastInspectionTime}
                </span>
                <button
                  onClick={() => handleOpenLiveCamera(chym)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Video className="h-3.5 w-3.5 text-emerald-400" /> Jonli Kamera
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CCTV Camera Stream Modal */}
      <Modal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        title={`Kamera Onlayn Nazorati: ${selectedChym?.name || ''}`}
        subtitle={`Kamera: CAM-${selectedChym?.code || ''} • ${
          selectedChym?.cameraUrl?.includes('hilook') || selectedChym?.cameraUrl?.includes('qrId')
            ? 'HiLookVision Cloud P2P (QR Share orqali)'
            : 'Hikvision / HiLook DVR Integratsiyasi'
        }`}
        maxWidth="4xl"
      >
        {selectedChym && (
          <div className="space-y-4">
            {/* Virtual CCTV Video Screen */}
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border-2 border-slate-800 shadow-2xl">
              {/* Background Mock Video Feed - Always provides clear CCTV container footage even if rtsp/hilook url */}
              <img
                src={
                  selectedChym.cameraUrl &&
                  (selectedChym.cameraUrl.startsWith('http://') ||
                    selectedChym.cameraUrl.startsWith('https://') ||
                    selectedChym.cameraUrl.startsWith('data:image'))
                    ? selectedChym.cameraUrl
                    : 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80'
                }
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=1200&q=80';
                }}
                alt="Live Camera Feed"
                className="w-full h-full object-cover transition-transform duration-300"
                style={{ transform: `scale(${ptzZoom})` }}
              />

              {/* Dark overlay for realistic camera view */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />

              {/* Top Left: Live OSD Info */}
              <div className="absolute top-3 left-4 text-emerald-400 font-mono text-xs flex flex-col gap-1 pointer-events-none bg-black/70 px-3 py-2 rounded-lg backdrop-blur-xs border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-bold text-white uppercase">
                    {selectedChym.cameraUrl?.includes('hilook') || selectedChym.cameraUrl?.includes('qrId') || selectedChym.cameraUrl?.includes('FV1183681')
                      ? 'REC [HIKVISION 4G CLOUD P2P]'
                      : 'REC [JONLI STREAM]'}
                  </span>
                </div>
                <div>{cameraTime}</div>
                <div className="text-[10px] text-slate-300 font-mono">
                  {selectedChym.cameraUrl?.includes('FV1183681') || selectedChym.code?.includes('01') || selectedChym.code?.includes('665')
                    ? 'DS-2CD1043G2-LIDUF/4G/SL • S/N: FV1183681 (4G LTE)'
                    : `${selectedChym.code} • 1920x1080 @ 25fps (HiLook)`}
                </div>
              </div>

              {/* AI Detection Bounding Boxes Overlay */}
              {showAiBoxes && (
                <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-around">
                  {/* Detection 1: Waste container */}
                  <div className="border-2 border-emerald-400 bg-emerald-500/10 p-2 rounded text-left animate-pulse">
                    <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Konteyner: {selectedChym.fillPercentAvg}% To‘lgan
                    </span>
                  </div>

                  {/* Detection 2: Cleanliness */}
                  <div
                    className={`border-2 p-2 rounded text-left ${
                      selectedChym.fillPercentAvg >= 90
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-blue-400 bg-blue-500/10'
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                        selectedChym.fillPercentAvg >= 90 ? 'bg-rose-600' : 'bg-blue-600'
                      }`}
                    >
                      AI: {selectedChym.cleanlinessStatus === 'Qoniqarsiz' ? 'Atrof ifloslangan' : 'Maydoncha toza'}
                    </span>
                  </div>
                </div>
              )}

              {/* Snapshot toast message */}
              {capturedSnapshot && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl animate-in zoom-in-95">
                  ✓ {capturedSnapshot}
                </div>
              )}
            </div>

            {/* Camera Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiBoxes(!showAiBoxes)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    showAiBoxes ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI Deteksiya: {showAiBoxes ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={handleTakeSnapshot}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  <Camera className="h-3.5 w-3.5" /> Kadr olish (Snapshot)
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer transition-colors">
                  <span>📸 Real rasm yuklash</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result && selectedChym) {
                            const updated = { ...selectedChym, cameraUrl: ev.target.result as string };
                            setSelectedChym(updated);
                            storageService.saveCHYM(updated);
                            setCapturedSnapshot('Kamerangizning real surati yuklandi va biriktirildi!');
                            setTimeout(() => setCapturedSnapshot(null), 4000);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* PTZ Zoom Controls */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">PTZ Zoom:</span>
                <button
                  onClick={() => setPtzZoom((z) => Math.max(1, z - 0.25))}
                  className="h-7 w-7 rounded-lg bg-white border border-slate-200 font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <span className="font-mono font-bold text-slate-800">{ptzZoom.toFixed(1)}x</span>
                <button
                  onClick={() => setPtzZoom((z) => Math.min(2.5, z + 0.25))}
                  className="h-7 w-7 rounded-lg bg-white border border-slate-200 font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-700">Tizim integratsiyasi:</span>{' '}
                <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                  Hikvision 4G Smart Camera (Cloud P2P)
                </span>
                <div className="mt-1 text-[10px] text-slate-500 font-mono truncate">
                  Model: DS-2CD1043G2-LIDUF/4G/SL • S/N: FV1183681
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-700">Tarmoq & AI Snapshot:</span>
                <div className="mt-1 text-[10px] font-mono bg-slate-200/80 px-2 py-1 rounded text-slate-800 truncate">
                  📶 4G LTE SIM-karta • QR ID: 65869a98... (ONLINE)
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
