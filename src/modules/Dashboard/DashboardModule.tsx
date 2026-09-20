import React, { useState, useEffect } from 'react';
import {
  Users,
  Truck,
  Route as RouteIcon,
  CheckCircle2,
  AlertOctagon,
  MessageSquareWarning,
  Trash2,
  Video,
  Star,
  ArrowRight,
  Clock,
  MapPin,
  UserCog,
  FileBarChart,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { UserRole } from '../../types';

interface DashboardProps {
  onNavigate: (module: string, filter?: string) => void;
}

export const DashboardModule: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(storageService.getCurrentRole());

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setCurrentRole(storageService.getCurrentRole());
    });
    return unsub;
  }, []);

  const subscribers = storageService.getSubscribers();
  const vehicles = storageService.getVehicles();
  const routes = storageService.getRoutes();
  const complaints = storageService.getComplaints();
  const containers = storageService.getContainers();
  const chyms = storageService.getCHYMs();
  const ratings = storageService.getRatings();
  const regions = storageService.getRegions();
  const users = storageService.getUsers();

  // Metrics calculations
  const activeVehicles = vehicles.filter((v) => v.status !== 'OFFLINE');
  const offlineVehicles = vehicles.filter((v) => v.status === 'OFFLINE');
  const inMotionVehicles = vehicles.filter((v) => v.status === 'HARAKATDA' || v.status === 'MARSHRUTDA');
  const todayRoutes = routes.filter((r) => r.date === '2026-09-16' || r.date.includes('09-16'));
  const completedRoutes = routes.filter((r) => r.status === 'Yakunlangan');
  const inProgressRoutes = routes.filter((r) => r.status === 'Jarayonda');
  const failedRoutes = routes.filter((r) => r.status === 'Bajarilmagan');
  const delayedRoutes = routes.filter((r) => r.status === 'Bajarilmagan' || (r.status === 'Jarayonda' && r.completedPointsCount === 0));
  const openComplaints = complaints.filter((c) => c.status === 'Yangi' || c.status === 'Qabul qilindi' || c.status === 'Mas’ulga biriktirildi');
  const newComplaints = complaints.filter((c) => c.status === 'Yangi');

  const activeCHYMs = chyms.filter((c) => c.cameraStatus === 'ONLINE');

  const avgRating = ratings.length
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : '4.8';

  const routeCompletionPercent = todayRoutes.length > 0
    ? Math.round((completedRoutes.length / todayRoutes.length) * 100)
    : 84;

  // Role-based 9 KPI Cards
  const kpiCards = currentRole === 'SUPER_ADMIN' ? [
    {
      title: 'Jami abonentlar',
      value: subscribers.length.toLocaleString('uz-UZ'),
      trend: '+12.4% bu oy',
      icon: Users,
      color: 'emerald',
      module: 'subscribers',
    },
    {
      title: 'Hududlar / Filiallar',
      value: `${regions.length} ta tuman`,
      trend: 'Navoiy viloyati',
      icon: MapPin,
      color: 'indigo',
      module: 'regions',
    },
    {
      title: 'Tizim foydalanuvchilari',
      value: `${users.length} nafar`,
      trend: 'Barcha rollar',
      icon: UserCog,
      color: 'purple',
      module: 'users',
    },
    {
      title: 'Faol texnikalar (GPS)',
      value: `${activeVehicles.length} / ${vehicles.length}`,
      trend: `${offlineVehicles.length} ta offline`,
      icon: Truck,
      color: 'teal',
      module: 'gps',
    },
    {
      title: 'Ochiq murojaatlar',
      value: openComplaints.length,
      trend: `${newComplaints.length} ta yangi`,
      icon: MessageSquareWarning,
      color: 'amber',
      module: 'complaints',
    },
    {
      title: 'Konteynerlar fondi',
      value: `${containers.length} ta`,
      trend: 'ЧЙМ maydonchalarida',
      icon: Trash2,
      color: 'teal',
      module: 'containers',
    },
    {
      title: 'Faol ЧЙМ maydonchalari',
      value: `${activeCHYMs.length} / ${chyms.length}`,
      trend: 'Kamera nazorati',
      icon: Video,
      color: 'purple',
      module: 'chym',
    },
    {
      title: 'Bugungi xizmat sifati',
      value: `${avgRating} ★`,
      trend: `${ratings.length} ta sharh`,
      icon: Star,
      color: 'amber',
      module: 'ratings',
    },
    {
      title: 'Tizim hisobotlari',
      value: '100% tayyor',
      trend: 'Moliya & tahlil',
      icon: FileBarChart,
      color: 'blue',
      module: 'reports',
    },
  ] : [
    {
      title: 'Jami abonentlar',
      value: subscribers.length.toLocaleString('uz-UZ'),
      trend: '+12.4% bu oy',
      icon: Users,
      color: 'emerald',
      module: 'subscribers',
    },
    {
      title: 'Faol texnikalar',
      value: `${activeVehicles.length} / ${vehicles.length}`,
      trend: `${offlineVehicles.length} ta offline`,
      icon: Truck,
      color: 'teal',
      module: 'gps',
    },
    {
      title: 'Bugungi marshrutlar',
      value: todayRoutes.length,
      trend: 'Reja bo‘yicha',
      icon: RouteIcon,
      color: 'indigo',
      module: 'routes',
    },
    {
      title: 'Bajarilgan marshrutlar',
      value: completedRoutes.length,
      trend: `Bajarilish: ${routeCompletionPercent}%`,
      icon: CheckCircle2,
      color: 'emerald',
      module: 'routes',
    },
    {
      title: 'Bajarilmagan / kechikkan',
      value: failedRoutes.length,
      trend: 'Diqqat talab',
      icon: AlertOctagon,
      color: 'rose',
      module: 'routes',
    },
    {
      title: 'Maxsus texnikalar parki',
      value: `${vehicles.length} ta`,
      trend: `${activeVehicles.length} ta faol`,
      icon: Truck,
      color: 'teal',
      module: 'vehicles',
    },
    {
      title: 'Konteynerlar fondi',
      value: `${containers.length} ta`,
      trend: 'ЧЙМ maydonchalarida',
      icon: Trash2,
      color: 'teal',
      module: 'containers',
    },
    {
      title: 'Faol ЧЙМ maydonchalari',
      value: `${activeCHYMs.length} / ${chyms.length}`,
      trend: 'Kamera nazorati',
      icon: Video,
      color: 'purple',
      module: 'chym',
    },
    {
      title: 'Bugungi xizmat sifati',
      value: `${avgRating} ★`,
      trend: `${ratings.length} ta sharh`,
      icon: Star,
      color: 'amber',
      module: 'ratings',
    },
  ];

  const complaintsCategoryData = [
    { name: 'O‘z vaqtida olinmadi', count: 18 },
    { name: 'Konteyner holati', count: 14 },
    { name: 'Maydoncha tozaligi', count: 8 },
    { name: 'Noqonuniy to‘kish', count: 5 },
    { name: 'Boshqa masalalar', count: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* OPERATIV HOLAT (Emergency / Real-time Status Panel) */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Operativ Holat (Tezkor Boshqaruv)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Har 3 soniyada yangilanadi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Item 1: Bugungi marshrutlar */}
          <div
            onClick={() => onNavigate('routes')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                📋
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-950">
                  {todayRoutes.length} ta marshrut
                </div>
                <div className="text-[11px] text-indigo-700">Bugungi reja</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Item 2: Bajarilgan reyslar */}
          <div
            onClick={() => onNavigate('routes')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                ✅
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  {completedRoutes.length} ta yakunlandi
                </div>
                <div className="text-[11px] text-emerald-700">Reja ijrosi: {routeCompletionPercent}%</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Item 3: Kechikkan / Bajarilmagan */}
          <div
            onClick={() => onNavigate('routes')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                ⚠️
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950">
                  {delayedRoutes.length} ta e’tibor talab
                </div>
                <div className="text-[11px] text-amber-700">Nazoratdagi reyslar</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Item 4: Harakatdagi texnikalar */}
          <div
            onClick={() => onNavigate('gps')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                🚛
              </div>
              <div>
                <div className="text-xs font-bold text-teal-950">
                  {activeVehicles.length} ta onlayn
                </div>
                <div className="text-[11px] text-teal-700">{inMotionVehicles.length} ta harakatda</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Item 5: Yangi murojaatlar */}
          <div
            onClick={() => onNavigate('complaints')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                📩
              </div>
              <div>
                <div className="text-xs font-bold text-rose-950">
                  {newComplaints.length} ta yangi
                </div>
                <div className="text-[11px] text-rose-700">Aholi murojaatlari</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.module)}
              className="cursor-pointer group rounded-2xl bg-white p-4 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-500 line-clamp-1">{card.title}</div>
                <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5">{card.trend}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Operational Panels: Complaints and Routes Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Categories BarChart */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Murojaatlar toifalari bo‘yicha taqsimot
              </h3>
              <p className="text-xs text-slate-500">Aholidan kelgan ariza va takliflar tahlili</p>
            </div>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Hammasi
            </button>
          </div>

          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintsCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} name="Murojaatlar soni" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Jami ko‘rib chiqilgan: <strong className="text-slate-800">{complaints.length} ta</strong></span>
            <span className="font-semibold text-emerald-600">Ijro intizomi: 96%</span>
          </div>
        </div>

        {/* Routes Execution Progress */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Marshrutlar ijrosi va qamrovi (Bugungi kun)
              </h3>
              <p className="text-xs text-slate-500">Reja bo‘yicha brigadalar va reyslar holati</p>
            </div>
            <button
              onClick={() => onNavigate('routes')}
              className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              Batafsil <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-4 my-auto py-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-700">Umumiy bajarilish darajasi:</span>
                <span className="text-emerald-700 font-black text-sm">{routeCompletionPercent}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${routeCompletionPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
                <div className="text-lg font-black text-emerald-700">{completedRoutes.length}</div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">Yakunlangan</div>
              </div>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
                <div className="text-lg font-black text-blue-700">{inProgressRoutes.length}</div>
                <div className="text-[11px] text-blue-800 font-semibold mt-0.5">Jarayonda</div>
              </div>
              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-center">
                <div className="text-lg font-black text-rose-700">{failedRoutes.length}</div>
                <div className="text-[11px] text-rose-800 font-semibold mt-0.5">Kechikkan</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Navigation className="h-4 w-4 text-teal-600" />
                <span>Kunlik xizmat ko‘rsatilgan nuqtalar:</span>
              </div>
              <span className="font-extrabold text-slate-900">
                {routes.reduce((acc, r) => acc + r.completedPointsCount, 0)} / {routes.reduce((acc, r) => acc + r.pointsCount, 0)} ta
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rejalashtirilgan brigadalar: <strong className="text-slate-800">{vehicles.length} ta</strong></span>
            <span className="font-semibold text-teal-700">GPS kuzatuv faol</span>
          </div>
        </div>
      </div>

      {/* Live Active Vehicles Snapshot */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">
              Maxsus texnikalar harakati (Jonli GPS holat)
            </h3>
            <p className="text-xs text-slate-500">Hozirda hududlarda ishlayotgan avtomashinalar</p>
          </div>
          <button
            onClick={() => onNavigate('gps')}
            className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
          >
            Xaritaga o‘tish <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 my-2">
          {vehicles.slice(0, 5).map((veh) => (
            <div key={veh.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                  🚛
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{veh.plateNumber}</div>
                  <div className="text-[11px] text-slate-500">{veh.model} • {veh.driverName || 'Biriktirilmagan'}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    veh.status === 'HARAKATDA' || veh.status === 'MARSHRUTDA'
                      ? 'success'
                      : veh.status === 'TO‘XTAGAN'
                      ? 'warning'
                      : veh.status === 'ONLINE'
                      ? 'info'
                      : 'danger'
                  }
                  pulse={veh.status === 'HARAKATDA'}
                >
                  {veh.status} {veh.speedKmH > 0 && `(${veh.speedKmH} km/soat)`}
                </Badge>
                <div className="text-[10px] text-slate-400 mt-1">{veh.lastUpdated}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Yoqilg‘i sarfi va telematika monitoringi</span>
          <span className="font-semibold text-emerald-600">O‘rtacha sarf: 28.4 L / 100 km</span>
        </div>
      </div>
    </div>
  );
};
