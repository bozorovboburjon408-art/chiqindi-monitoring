import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Camera,
  Navigation,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Route, RoutePoint } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const HaydovchiInterface: React.FC = () => {
  const routes = storageService.getRoutes();
  const drivers = storageService.getDrivers();
  const driver = drivers[0]; // Jasur Rahimov

  // Active route for this driver
  const myRoute = routes.find((r) => r.driverId === driver.id && r.status !== 'Yakunlangan') || routes[0];

  const [currentRoute, setCurrentRoute] = useState<Route>(myRoute);
  const [activePoint, setActivePoint] = useState<RoutePoint | null>(null);

  // Modals
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [collectedVolume, setCollectedVolume] = useState('4.5');
  const [issueType, setIssueType] = useState('Yo‘l to‘silgan / kirish imkoni yo‘q');
  const [issueNotes, setIssueNotes] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const refreshRoute = () => {
    const fresh = storageService.getRoutes().find((r) => r.id === currentRoute.id) || currentRoute;
    setCurrentRoute({ ...fresh });
  };

  const handleStartRoute = () => {
    currentRoute.status = 'Jarayonda';
    currentRoute.startedAt = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    storageService.saveRoute(currentRoute);
    refreshRoute();
    setSuccessToast('Marshrut rasman boshlandi! Ehtiyotkorlik bilan harakatlaning.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleFinishRoute = () => {
    currentRoute.status = 'Yakunlangan';
    currentRoute.completedAt = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    storageService.saveRoute(currentRoute);
    refreshRoute();
    setSuccessToast('Tabriklaymiz! Bugungi marshrut muvaffaqiyatli yakunlandi.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenCollect = (point: RoutePoint) => {
    setActivePoint(point);
    setIsCollectModalOpen(true);
  };

  const handleSubmitCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePoint) return;

    storageService.updateRoutePointStatus(
      currentRoute.id,
      activePoint.id,
      'Tozalandi',
      'Muammosiz tozalandi',
      Number(collectedVolume) || 4.0
    );

    refreshRoute();
    setIsCollectModalOpen(false);
    setSuccessToast(`✓ ${activePoint.chymName} tozalandi deb belgilandi!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addNotification({
      id: `notif-issue-${Date.now()}`,
      title: `Haydovchi muammosi: ${driver.fullName}`,
      message: `${driver.vehiclePlate} mashinasi xabar qildi: "${issueType}". Izoh: ${issueNotes || 'Izohsiz'}.`,
      type: 'route_failed',
      level: 'danger',
      isRead: false,
      createdAt: 'Hozirgina',
      linkModule: 'routes',
      targetId: currentRoute.id,
    });

    setIsIssueModalOpen(false);
    setSuccessToast('Dispetcherlik xizmatiga favqulodda xabar yuborildi!');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Find next pending point
  const nextPoint = currentRoute.points.find((p) => p.status !== 'Tozalandi');

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12">
      {/* Driver Status Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              🚛
            </div>
            <div>
              <h2 className="text-base font-extrabold">{driver.fullName}</h2>
              <p className="text-xs text-emerald-400 font-mono font-bold">
                {driver.vehiclePlate} • {driver.phone}
              </p>
            </div>
          </div>
          <Badge variant={currentRoute.status === 'Yakunlangan' ? 'success' : 'warning'} size="md">
            {currentRoute.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-xl">
            <div className="text-slate-400 text-[10px] font-bold">JAMI NUQTA</div>
            <div className="text-lg font-black text-white">{currentRoute.pointsCount} ta</div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl">
            <div className="text-slate-400 text-[10px] font-bold">BAJARILDI</div>
            <div className="text-lg font-black text-emerald-400">{currentRoute.completedPointsCount} ta</div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl">
            <div className="text-slate-400 text-[10px] font-bold">MASOFA</div>
            <div className="text-lg font-black text-white">{currentRoute.distanceKm} km</div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold text-center shadow-lg animate-in zoom-in-95">
          {successToast}
        </div>
      )}

      {/* Prominent Next Destination Card */}
      {nextPoint && currentRoute.status !== 'Yakunlangan' && (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 shadow-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 mb-1 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" /> Navbatdagi To‘xtash Nuqtasi
          </div>
          <h3 className="text-xl font-black">{nextPoint.chymName}</h3>
          <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {nextPoint.address}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => handleOpenCollect(nextPoint)}
              className="flex-1 py-3.5 px-4 bg-white text-emerald-900 rounded-2xl font-black text-sm hover:bg-emerald-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5 text-emerald-600" />
              Chiqindi olindi deb belgilash
            </button>
          </div>
        </div>
      )}

      {/* Route Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {currentRoute.status === 'Rejalashtirilgan' && (
          <button
            onClick={handleStartRoute}
            className="col-span-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Play className="h-5 w-5" />
            MARSHRUTNI BOSHLASH
          </button>
        )}

        {currentRoute.status === 'Jarayonda' && (
          <>
            <button
              onClick={handleFinishRoute}
              className="py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Marshrutni yakunlash
            </button>
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Muammo haqida xabar
            </button>
          </>
        )}
      </div>

      {/* Route Stops Checklist */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
          <span>Marshrut nuqtalari ro‘yxati</span>
          <span className="text-xs text-slate-400 font-normal">
            {currentRoute.shift}
          </span>
        </h3>

        <div className="space-y-2.5">
          {currentRoute.points.map((pt, idx) => {
            const isDone = pt.status === 'Tozalandi';
            return (
              <div
                key={pt.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isDone
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : 'bg-white border-emerald-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                      isDone ? 'bg-slate-400' : 'bg-emerald-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{pt.chymName}</div>
                    <div className="text-[11px] text-slate-500">{pt.address}</div>
                    {pt.visitedAt && (
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        ✓ Bajarildi: {pt.visitedAt} ({pt.collectedVolumeM3 || 4.2} m³)
                      </div>
                    )}
                  </div>
                </div>

                {!isDone ? (
                  <button
                    onClick={() => handleOpenCollect(pt)}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 text-xs shrink-0"
                  >
                    Tozalash
                  </button>
                ) : (
                  <span className="text-emerald-600 text-xs font-bold shrink-0">✓ Tayyor</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Collect Modal */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Chiqindini qabul qilish va tozalash"
        subtitle={activePoint?.chymName}
      >
        <form onSubmit={handleSubmitCollect} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Yuklangan chiqindi hajmi (m³):
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={collectedVolume}
              onChange={(e) => setCollectedVolume(e.target.value)}
              className="w-full text-base font-bold px-3 py-2.5 border rounded-xl border-slate-200"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
            <Camera className="h-6 w-6 text-slate-400 mx-auto mb-1" />
            <div className="font-bold text-slate-700">Foto hisobot olish</div>
            <div className="text-[10px] text-slate-400">Tozalangan maydoncha fotosurati</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCollectModalOpen(false)}
              className="px-4 py-2.5 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md"
            >
              Tasdiqlash va Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Favqulodda muammo haqida xabar berish"
        subtitle="Dispetcherlik xizmatiga tezkor ma’lumot"
      >
        <form onSubmit={handleReportIssue} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Muammo turi:</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl border-slate-200 bg-white font-medium"
            >
              <option value="Yo‘l to‘silgan / kirish imkoni yo‘q">Yo‘l to‘silgan / kirish imkoni yo‘q</option>
              <option value="Katta tirbandlik (Marshrut kechikmoqda)">Katta tirbandlik (Marshrut kechikmoqda)</option>
              <option value="Maxsus texnika texnik nosozligi">Maxsus texnika texnik nosozligi</option>
              <option value="Maydonchada noqonuniy qurilish chiqindisi to‘kilgan">Noqonuniy qurilish chiqindisi</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Qo‘shimcha izoh:</label>
            <textarea
              rows={3}
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              placeholder="Vaziyat haqida batafsil ma’lumot..."
              className="w-full px-3 py-2 border rounded-xl border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold shadow-md"
            >
              Dispetcherga yuborish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
