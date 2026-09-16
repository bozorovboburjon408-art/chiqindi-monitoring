import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Route as RouteIcon,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  User,
  AlertCircle,
  Eye,
  Calendar,
  Layers,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Route, RoutePoint, Region, Vehicle, Driver, CHYM } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { exportToCSV } from '../../utils/exportUtils';

export const MarshrutlarModule: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>(storageService.getRoutes());
  const regions = storageService.getRegions();
  const vehicles = storageService.getVehicles();
  const drivers = storageService.getDrivers();
  const chyms = storageService.getCHYMs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [formRegionId, setFormRegionId] = useState(regions[0]?.id || '');
  const [formVehicleId, setFormVehicleId] = useState(vehicles[0]?.id || '');
  const [formDriverId, setFormDriverId] = useState(drivers[0]?.id || '');
  const [formDate, setFormDate] = useState('2026-09-17');
  const [formShift, setFormShift] = useState<'Ertalabki (06:00 - 14:00)' | 'Kechki (14:00 - 22:00)'>('Ertalabki (06:00 - 14:00)');
  const [selectedChymIds, setSelectedChymIds] = useState<string[]>([]);

  // Mini map ref for detail modal
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);

  const refreshData = () => {
    setRoutes(storageService.getRoutes());
  };

  const filteredRoutes = routes.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const matchReg = selectedRegion === 'ALL' || r.regionId === selectedRegion;
    return matchSearch && matchStatus && matchReg;
  });

  const handleOpenCreate = () => {
    setTitle('');
    setFormRegionId(regions[0]?.id || '');
    setFormVehicleId(vehicles[0]?.id || '');
    setFormDriverId(drivers[0]?.id || '');
    setFormDate(new Date().toISOString().slice(0, 10));
    const chymInReg = chyms.filter((c) => c.regionId === (regions[0]?.id || ''));
    setSelectedChymIds(chymInReg.slice(0, 3).map((c) => c.id));
    setIsCreateModalOpen(true);
  };

  const handleToggleChymSelection = (chymId: string) => {
    if (selectedChymIds.includes(chymId)) {
      setSelectedChymIds(selectedChymIds.filter((id) => id !== chymId));
    } else {
      setSelectedChymIds([...selectedChymIds, chymId]);
    }
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChymIds.length === 0) {
      alert('Kamida bitta ЧЙМ maydonchasini tanlang');
      return;
    }

    const reg = regions.find((r) => r.id === formRegionId) || regions[0];
    const veh = vehicles.find((v) => v.id === formVehicleId) || vehicles[0];
    const drv = drivers.find((d) => d.id === formDriverId) || drivers[0];

    const selectedPoints: RoutePoint[] = selectedChymIds.map((cId, idx) => {
      const c = chyms.find((ch) => ch.id === cId)!;
      return {
        id: `rp-${Date.now()}-${idx}`,
        chymId: c.id,
        chymName: c.name,
        address: c.address,
        lat: c.lat,
        lng: c.lng,
        order: idx + 1,
        status: 'Kutilmoqda',
      };
    });

    const newRoute: Route = {
      id: `rt-${Date.now()}`,
      code: `MR-2026-${String(routes.length + 1).padStart(2, '0')}`,
      title: title || `${reg.name} yangi chiqindi yig‘ish marshruti`,
      regionId: reg.id,
      regionName: reg.name,
      vehicleId: veh.id,
      vehiclePlate: veh.plateNumber,
      driverId: drv.id,
      driverName: drv.fullName,
      date: formDate,
      shift: formShift,
      status: 'Rejalashtirilgan',
      pointsCount: selectedPoints.length,
      completedPointsCount: 0,
      distanceKm: Math.round(10 + selectedPoints.length * 4.5),
      estimatedDurationMin: Math.round(40 + selectedPoints.length * 35),
      points: selectedPoints,
    };

    storageService.saveRoute(newRoute);
    refreshData();
    setIsCreateModalOpen(false);
  };

  const handleOpenDetail = (route: Route) => {
    setSelectedRoute(route);
    setIsDetailModalOpen(true);
  };

  // Render detail mini-map
  useEffect(() => {
    if (!isDetailModalOpen || !selectedRoute || !miniMapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (miniMapContainerRef.current && !miniMapInstanceRef.current) {
        const centerLat = selectedRoute.points[0]?.lat || 41.311;
        const centerLng = selectedRoute.points[0]?.lng || 69.24;

        const map = L.map(miniMapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        miniMapInstanceRef.current = map;
      }

      const map = miniMapInstanceRef.current;
      if (map && selectedRoute.points.length > 0) {
        const latLngs: L.LatLngExpression[] = [];

        selectedRoute.points.forEach((p, idx) => {
          latLngs.push([p.lat, p.lng]);
          const isDone = p.status === 'Tozalandi';
          const iconHtml = `
            <div style="
              background: ${isDone ? '#059669' : '#0284c7'};
              color: white;
              border: 2px solid white;
              border-radius: 50%;
              width: 26px;
              height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 11px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${idx + 1}
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'mini-route-point',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          L.marker([p.lat, p.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${idx + 1}. ${p.chymName}</b><br/>Holat: ${p.status}`);
        });

        // Draw connecting polyline
        if (latLngs.length > 1) {
          L.polyline(latLngs, {
            color: '#059669',
            weight: 4,
            dashArray: '8, 6',
            opacity: 0.8,
          }).addTo(map);
          map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [isDetailModalOpen, selectedRoute]);

  const handleExportCSV = () => {
    const data = filteredRoutes.map((r) => ({
      Kod: r.code,
      Nomi: r.title,
      Tuman: r.regionName,
      Mashina: r.vehiclePlate,
      Haydovchi: r.driverName,
      Sana: r.date,
      Smena: r.shift,
      Status: r.status,
      Jami_nuqtalar: r.pointsCount,
      Bajarilgan: r.completedPointsCount,
      Masofa_km: r.distanceKm,
    }));
    exportToCSV('Marshrutlar_Reestri', data);
  };

  const getStatusBadge = (status: Route['status']) => {
    switch (status) {
      case 'Rejalashtirilgan':
        return <Badge variant="info">Rejalashtirilgan</Badge>;
      case 'Boshlangan':
      case 'Jarayonda':
        return <Badge variant="warning" pulse>Jarayonda</Badge>;
      case 'Yakunlangan':
        return <Badge variant="success">Yakunlangan</Badge>;
      case 'Bajarilmagan':
        return <Badge variant="danger">Bajarilmagan</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Marshrutlar Boshqaruvi</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Chiqindi yig‘ish yo‘nalishlarini shakllantirish, punktlar ketma-ketligi va bajarilish nazorati
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs"
          >
            <Download className="h-4 w-4" /> Excel Eksport
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" /> Yangi marshrut tuzish
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Marshrut nomi, mashina yoki haydovchi..."
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
            <option value="ALL">Barcha statuslar</option>
            <option value="Rejalashtirilgan">Rejalashtirilgan</option>
            <option value="Jarayonda">Jarayonda</option>
            <option value="Yakunlangan">Yakunlangan</option>
            <option value="Bajarilmagan">Bajarilmagan</option>
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
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routes Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map((r) => {
          const progressPercent = r.pointsCount > 0 ? Math.round((r.completedPointsCount / r.pointsCount) * 100) : 0;
          return (
            <div
              key={r.id}
              className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {r.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">{r.title}</h3>
                    <div className="text-[11px] text-slate-500">{r.regionName}</div>
                  </div>
                  <div>{getStatusBadge(r.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Texnika
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">{r.vehiclePlate}</div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <User className="h-3 w-3" /> Haydovchi
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">{r.driverName}</div>
                  </div>

                  <div className="mt-2">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Sana & Smena
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">{r.date}</div>
                  </div>

                  <div className="mt-2">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Masofa / Vaqt
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">{r.distanceKm} km • ~{r.estimatedDurationMin}m</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Bajarilgan punktlar:</span>
                    <span className="font-bold text-slate-900">
                      {r.completedPointsCount} / {r.pointsCount} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        progressPercent === 100
                          ? 'bg-emerald-500'
                          : r.status === 'Bajarilmagan'
                          ? 'bg-rose-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {r.startedAt ? `Boshlandi: ${r.startedAt}` : 'Hali boshlanmagan'}
                </span>
                <button
                  onClick={() => handleOpenDetail(r)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Xarita & Tafsilotlar <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Route Wizard Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yangi marshrut shakllantirish"
        subtitle="Maxsus texnika uchun chiqindi yig‘ish jadvali va yo‘nalishini tuzish"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Marshrut nomi</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Chilonzor 7-mavze va Qatortol ertalabki tozalash"
              className="w-full px-3 py-2 border rounded-xl border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hudud (Tuman) *</label>
              <select
                value={formRegionId}
                onChange={(e) => setFormRegionId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sana *</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Maxsus texnika *</label>
              <select
                value={formVehicleId}
                onChange={(e) => setFormVehicleId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.model} ({v.capacityM3} m³)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Biriktirilgan haydovchi *</label>
              <select
                value={formDriverId}
                onChange={(e) => setFormDriverId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} (Tel: {d.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Smena</label>
            <select
              value={formShift}
              onChange={(e) => setFormShift(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
            >
              <option value="Ertalabki (06:00 - 14:00)">Ertalabki (06:00 - 14:00)</option>
              <option value="Kechki (14:00 - 22:00)">Kechki (14:00 - 22:00)</option>
            </select>
          </div>

          {/* CHYM selection checklist */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Marshrut nuqtalari (ЧЙМ Maydonchalari) — tanlangan: {selectedChymIds.length} ta
            </label>
            <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
              {chyms
                .filter((c) => c.regionId === formRegionId)
                .map((c) => {
                  const isChecked = selectedChymIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-50 border border-emerald-300' : 'bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleChymSelection(c.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.address}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {c.containerCount} ta konteyner ({c.fillPercentAvg}%)
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md"
            >
              Marshrutni saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Route Modal with Leaflet Mini Map */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Marshrut: ${selectedRoute?.title || ''}`}
        subtitle={`Kod: ${selectedRoute?.code || ''} • Mashina: ${selectedRoute?.vehiclePlate || ''} (${selectedRoute?.driverName || ''})`}
        maxWidth="4xl"
      >
        {selectedRoute && (
          <div className="space-y-4 text-xs">
            {/* Map and Points split layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mini Map */}
              <div className="h-72 rounded-xl border border-slate-200 overflow-hidden relative">
                <div ref={miniMapContainerRef} className="w-full h-full" />
              </div>

              {/* Points Checklist */}
              <div className="flex flex-col h-72">
                <div className="font-bold text-slate-800 text-xs mb-2 flex items-center justify-between">
                  <span>Marshrut punktlari ketma-ketligi ({selectedRoute.points.length})</span>
                  <span className="text-emerald-700 font-bold">
                    {selectedRoute.completedPointsCount} bajarildi
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {selectedRoute.points.map((p, idx) => {
                    const isClean = p.status === 'Tozalandi';
                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 ${
                          isClean ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{p.chymName}</div>
                            <div className="text-[11px] text-slate-500">{p.address}</div>
                            {p.visitedAt && (
                              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                ✓ Tozalandi: {p.visitedAt} ({p.collectedVolumeM3 || 4} m³)
                              </div>
                            )}
                          </div>
                        </div>

                        <Badge variant={isClean ? 'success' : 'default'}>
                          {p.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Jami masofa</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{selectedRoute.distanceKm} km</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Taxminiy vaqt</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">~{selectedRoute.estimatedDurationMin} daqiqa</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Boshlangan vaqt</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{selectedRoute.startedAt || 'Boshlanmagan'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Yakunlangan vaqt</div>
                <div className="text-sm font-black text-emerald-600 mt-0.5">{selectedRoute.completedAt || 'Jarayonda'}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
