import React, { useState } from 'react';
import {
  Users,
  Home,
  Truck,
  Route as RouteIcon,
  CheckCircle2,
  AlertOctagon,
  MessageSquareWarning,
  Trash2,
  Video,
  Star,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';

interface DashboardProps {
  onNavigate: (module: string, filter?: string) => void;
}

export const DashboardModule: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'kunlik' | 'haftalik' | 'oylik'>('kunlik');

  const subscribers = storageService.getSubscribers();
  const households = storageService.getHouseholds();
  const vehicles = storageService.getVehicles();
  const routes = storageService.getRoutes();
  const complaints = storageService.getComplaints();
  const containers = storageService.getContainers();
  const chyms = storageService.getCHYMs();
  const ratings = storageService.getRatings();

  // Metrics calculations
  const activeVehicles = vehicles.filter((v) => v.status !== 'OFFLINE');
  const offlineVehicles = vehicles.filter((v) => v.status === 'OFFLINE');
  const todayRoutes = routes.filter((r) => r.date === '2026-09-16' || r.date.includes('09-16'));
  const completedRoutes = routes.filter((r) => r.status === 'Yakunlangan');
  const failedRoutes = routes.filter((r) => r.status === 'Bajarilmagan');
  const delayedRoutes = routes.filter((r) => r.status === 'Bajarilmagan' || (r.status === 'Jarayonda' && r.completedPointsCount === 0));
  const openComplaints = complaints.filter((c) => c.status === 'Yangi' || c.status === 'Qabul qilindi' || c.status === 'Mas’ulga biriktirildi');
  const newComplaints = complaints.filter((c) => c.status === 'Yangi');
  
  const fullContainers = containers.filter((c) => c.fillLevel === 100);
  const warningContainers = containers.filter((c) => c.fillLevel >= 80 && c.fillLevel < 100);
  const normalContainers = containers.filter((c) => c.fillLevel < 50);
  const midContainers = containers.filter((c) => c.fillLevel >= 50 && c.fillLevel < 80);

  const activeCHYMs = chyms.filter((c) => c.cameraStatus === 'ONLINE');

  const avgRating = ratings.length
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : '4.8';

  // 10 KPI Cards
  const kpiCards = [
    {
      title: 'Jami abonentlar',
      value: subscribers.length.toLocaleString('uz-UZ'),
      trend: '+12.4% bu oy',
      icon: Users,
      color: 'emerald',
      module: 'subscribers',
    },
    {
      title: 'Jami xonadonlar',
      value: households.length.toLocaleString('uz-UZ'),
      trend: '58 ta ob’ekt',
      icon: Home,
      color: 'blue',
      module: 'households',
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
      trend: 'Bajarilish: 84%',
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
      title: 'Ochiq murojaatlar',
      value: openComplaints.length,
      trend: `${newComplaints.length} ta yangi`,
      icon: MessageSquareWarning,
      color: 'amber',
      module: 'complaints',
    },
    {
      title: 'To‘lib qolgan konteyner',
      value: fullContainers.length,
      trend: `${warningContainers.length} ta 80%+`,
      icon: Trash2,
      color: fullContainers.length > 0 ? 'rose' : 'emerald',
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

  // Chart datasets
  const dailyData = [
    { name: '06:00', hajm: 4.2, reys: 2 },
    { name: '08:00', hajm: 12.8, reys: 6 },
    { name: '10:00', hajm: 24.5, reys: 11 },
    { name: '12:00', hajm: 31.0, reys: 15 },
    { name: '14:00', hajm: 38.2, reys: 18 },
    { name: '16:00', hajm: 46.5, reys: 22 },
    { name: '18:00', hajm: 52.0, reys: 25 },
  ];

  const weeklyData = [
    { name: 'Dush', hajm: 52, reys: 26 },
    { name: 'Sesh', hajm: 58, reys: 28 },
    { name: 'Chor', hajm: 61, reys: 30 },
    { name: 'Pay', hajm: 54, reys: 27 },
    { name: 'Jum', hajm: 65, reys: 32 },
    { name: 'Shan', hajm: 70, reys: 35 },
    { name: 'Yak', hajm: 48, reys: 24 },
  ];

  const monthlyData = [
    { name: '1-hafta', hajm: 360, reys: 175 },
    { name: '2-hafta', hajm: 395, reys: 190 },
    { name: '3-hafta', hajm: 410, reys: 205 },
    { name: '4-hafta', hajm: 380, reys: 185 },
  ];

  const chartData = timeRange === 'kunlik' ? dailyData : timeRange === 'haftalik' ? weeklyData : monthlyData;

  const containerStateData = [
    { name: 'Normal (0–50%)', value: normalContainers.length, color: '#10b981' },
    { name: 'Ogohlantirish (50–80%)', value: midContainers.length, color: '#f59e0b' },
    { name: 'Xavfli (80–99%)', value: warningContainers.length, color: '#f97316' },
    { name: 'To‘lgan (100%)', value: fullContainers.length, color: '#ef4444' },
  ];

  const complaintsCategoryData = [
    { name: 'Konteyner to‘lgan', count: 14 },
    { name: 'O‘z vaqtida olinmadi', count: 18 },
    { name: 'Maydoncha iflos', count: 8 },
    { name: 'Noqonuniy to‘kish', count: 5 },
    { name: 'Boshqa', count: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="h-4 w-4" /> Chiqindi xizmatlarini boshqarish markazi
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            EcoControl Operativ Boshqaruv Paneli
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
            Navoiy viloyati (Navoiy shahri, Karmana, Qiziltepa, Zarafshon) bo‘yicha maxsus texnikalar harakati, ko‘chalar bo‘yicha 3 rangli GPS trek, uylar pasporti va chiqindi maydonchalari monitoringi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('gps')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-all shadow-md"
          >
            <MapPin className="h-4 w-4 text-emerald-600" /> GPS Xaritani ochish
          </button>
          <button
            onClick={() => onNavigate('routes')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/50 hover:bg-emerald-600 text-white font-semibold text-xs border border-emerald-400/30 transition-all"
          >
            <RouteIcon className="h-4 w-4" /> Yangi marshrut
          </button>
        </div>
      </div>

      {/* OPERATIV HOLAT (Emergency Ticker Panel) */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Operativ Holat (Favqulodda Signalizatsiya)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Har 3 soniyada yangilanadi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Item 1: Full containers */}
          <div
            onClick={() => onNavigate('containers')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                🔴
              </div>
              <div>
                <div className="text-xs font-bold text-rose-950">
                  {fullContainers.length} ta to‘lgan
                </div>
                <div className="text-[11px] text-rose-700">100% kritik konteyner</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Item 2: 80%+ containers */}
          <div
            onClick={() => onNavigate('containers')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                🟠
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950">
                  {warningContainers.length} ta xavfli
                </div>
                <div className="text-[11px] text-amber-700">80%+ to‘lish holati</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Item 3: Delayed routes */}
          <div
            onClick={() => onNavigate('routes')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-yellow-200 bg-yellow-50/70 hover:bg-yellow-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                🟡
              </div>
              <div>
                <div className="text-xs font-bold text-yellow-950">
                  {delayedRoutes.length} ta kechikkan
                </div>
                <div className="text-[11px] text-yellow-700">Marshrut muammosi</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-yellow-600 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Item 4: Offline trucks */}
          <div
            onClick={() => onNavigate('gps')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-sm">
                ⚪
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {offlineVehicles.length} ta offline
                </div>
                <div className="text-[11px] text-slate-600">Aloqasiz texnika</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Item 5: New complaints */}
          <div
            onClick={() => onNavigate('complaints')}
            className="cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                🔵
              </div>
              <div>
                <div className="text-xs font-bold text-blue-950">
                  {newComplaints.length} ta yangi
                </div>
                <div className="text-[11px] text-blue-700">Ko‘rib chiqilmagan</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Waste Collection Volume */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Chiqindi olib chiqish dinamikasi (Tonna va Reyslar)
              </h3>
              <p className="text-xs text-slate-500">Real vaqt monitoringi va tarixiy solishtirish</p>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {(['kunlik', 'haftalik', 'oylik'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimeRange(mode)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                    timeRange === mode
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHajm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hajm"
                  name="Chiqindi hajmi (tonna)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHajm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Container Status Breakdown PieChart */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm md:text-base">
              Konteynerlarning to‘lish holati
            </h3>
            <p className="text-xs text-slate-500">Jami 55 ta datchikli konteynerlar</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={containerStateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {containerStateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900">{containers.length}</span>
              <span className="text-[10px] text-slate-400">Jami</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {containerStateData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Complaints and Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Categories */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Murojaatlar toifalari bo‘yicha taqsimot
              </h3>
              <p className="text-xs text-slate-500">Aholidan kelgan ariza va shikoyatlar</p>
            </div>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Hammasi
            </button>
          </div>

          <div className="h-56 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintsCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
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
        </div>

        {/* Live Active Vehicles Snapshot */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Maxsus texnikalar harakati (Jonli holat)
              </h3>
              <p className="text-xs text-slate-500">Hozirda harakatdagi avtomashinalar</p>
            </div>
            <button
              onClick={() => onNavigate('gps')}
              className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              Xaritaga o‘tish <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 my-2">
            {vehicles.slice(0, 4).map((veh) => (
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
            <span>Yoqilg‘i sarfi monitoringi faol</span>
            <span className="font-semibold text-emerald-600">O‘rtacha sarf: 28.4 L / 100 km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
