import React, { useState } from 'react';
import {
  FileBarChart,
  Calendar,
  Download,
  Printer,
  Filter,
  Users,
  MessageSquare,
  Route as RouteIcon,
  Truck,
  Trash2,
  Star,
  CheckCircle,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { exportToCSV, printReportPDF } from '../../utils/exportUtils';

export const HisobotlarModule: React.FC = () => {
  const [reportType, setReportType] = useState<'marshrutlar' | 'murojaatlar' | 'abonentlar' | 'konteynerlar' | 'texnikalar'>('marshrutlar');
  const [period, setPeriod] = useState<'kunlik' | 'haftalik' | 'oylik'>('kunlik');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  const regions = storageService.getRegions();
  const routes = storageService.getRoutes();
  const complaints = storageService.getComplaints();
  const subscribers = storageService.getSubscribers();
  const containers = storageService.getContainers();
  const vehicles = storageService.getVehicles();

  const handleExportExcel = () => {
    if (reportType === 'marshrutlar') {
      const data = routes.map((r) => ({
        Kod: r.code,
        Nomi: r.title,
        Tuman: r.regionName,
        Mashina: r.vehiclePlate,
        Haydovchi: r.driverName,
        Status: r.status,
        Punktlar: `${r.completedPointsCount}/${r.pointsCount}`,
        Masofa_km: r.distanceKm,
        Sana: r.date,
      }));
      exportToCSV(`Hisobot_Marshrutlar_${period}`, data);
    } else if (reportType === 'murojaatlar') {
      const data = complaints.map((c) => ({
        Kod: c.code,
        Abonent: c.subscriberName,
        Telefon: c.phone,
        Tuman: c.regionName,
        Toifa: c.category,
        Status: c.status,
        Masul: c.assignedStaffName || 'Biriktirilmagan',
        Sana: c.createdAt,
      }));
      exportToCSV(`Hisobot_Murojaatlar_${period}`, data);
    } else if (reportType === 'abonentlar') {
      const data = subscribers.map((s) => ({
        Kod: s.code,
        FIO: s.fullName,
        Telefon: s.phone,
        Tuman: s.regionName,
        Turi: s.type,
        Status: s.status,
        Balans: s.balance,
      }));
      exportToCSV(`Hisobot_Abonentlar_${period}`, data);
    } else if (reportType === 'konteynerlar') {
      const data = containers.map((c) => ({
        Kod: c.code,
        CHYM: c.chymName,
        Tuman: c.regionName,
        Tolish: `${c.fillLevel}%`,
        Status: c.status,
        Chiqindi_turi: c.wasteType,
      }));
      exportToCSV(`Hisobot_Konteynerlar_${period}`, data);
    } else {
      const data = vehicles.map((v) => ({
        Raqam: v.plateNumber,
        Model: v.model,
        Haydovchi: v.driverName || 'Biriktirilmagan',
        Status: v.status,
        Sigim_m3: v.capacityM3,
        Yoqilgi: `${v.currentFuelPercent}%`,
      }));
      exportToCSV(`Hisobot_Texnikalar_${period}`, data);
    }
  };

  const handleExportPDF = () => {
    let title = '';
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'marshrutlar') {
      title = `Marshrutlar bo‘yicha ${period} hisobot`;
      headers = ['Kodi', 'Marshrut nomi', 'Tuman', 'Maxsus texnika', 'Haydovchi', 'Punktlar', 'Holati'];
      rows = routes.slice(0, 20).map((r) => [
        r.code,
        r.title,
        r.regionName,
        r.vehiclePlate,
        r.driverName,
        `${r.completedPointsCount} / ${r.pointsCount}`,
        r.status,
      ]);
    } else if (reportType === 'murojaatlar') {
      title = `Aholi murojaatlari bo‘yicha ${period} hisobot`;
      headers = ['ID', 'Abonent F.I.Sh.', 'Telefon', 'Toifa', 'Tuman', 'Holati', 'Sana'];
      rows = complaints.slice(0, 20).map((c) => [
        c.code,
        c.subscriberName,
        c.phone,
        c.category,
        c.regionName,
        c.status,
        c.createdAt,
      ]);
    } else if (reportType === 'konteynerlar') {
      title = `Konteynerlar to‘lish holati hisoboti`;
      headers = ['Kodi', 'Maydoncha (ЧЙМ)', 'Tuman', 'To‘lish %', 'Holat', 'Chiqindi turi'];
      rows = containers.slice(0, 20).map((c) => [
        c.code,
        c.chymName,
        c.regionName,
        `${c.fillLevel}%`,
        c.status,
        c.wasteType,
      ]);
    } else {
      title = `Texnikalar parki hisoboti`;
      headers = ['Davlat raqami', 'Rusumi', 'Haydovchi', 'Sig‘imi', 'Holati'];
      rows = vehicles.map((v) => [
        v.plateNumber,
        v.model,
        v.driverName || 'Biriktirilmagan',
        `${v.capacityM3} m³`,
        v.status,
      ]);
    }

    printReportPDF(
      title,
      `Davr: ${period.toUpperCase()} • Barcha sektorlar bo‘yicha rasmiy konsolidatsiya`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Tahliliy Hisobotlar Markazi</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Kunlik, haftalik va oylik rasmiy hisobotlarni shakllantirish, Excel va PDF eksport
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Excel (XLSX / CSV)
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all"
          >
            <Printer className="h-4 w-4 text-emerald-400" /> PDF Chop etish
          </button>
        </div>
      </div>

      {/* Report Types and Time Periods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { id: 'marshrutlar', label: 'Marshrutlar hisoboti', icon: RouteIcon, count: routes.length },
          { id: 'murojaatlar', label: 'Murojaatlar hisoboti', icon: MessageSquare, count: complaints.length },
          { id: 'abonentlar', label: 'Abonentlar hisoboti', icon: Users, count: subscribers.length },
          { id: 'konteynerlar', label: 'Konteynerlar holati', icon: Trash2, count: containers.length },
          { id: 'texnikalar', label: 'Texnikalar parki', icon: Truck, count: vehicles.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </div>
              <div className="mt-3">
                <div className="font-extrabold text-xs">{tab.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Period and Filter Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Davr:</span>
          {(['kunlik', 'haftalik', 'oylik'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-500">Hudud bo‘yicha:</div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
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

      {/* Report Preview Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm capitalize">
              {reportType} hisoboti jadvali ({period})
            </h3>
            <p className="text-xs text-slate-400">
              Eksport qilishdan oldin ko‘rib chiqish oynasi
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Eksportga tayyor
          </span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'marshrutlar' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Kod</th>
                  <th className="px-4 py-3">Marshrut</th>
                  <th className="px-4 py-3">Tuman</th>
                  <th className="px-4 py-3">Texnika</th>
                  <th className="px-4 py-3">Haydovchi</th>
                  <th className="px-4 py-3">Punktlar</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.slice(0, 10).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                    <td className="px-4 py-3">{r.regionName}</td>
                    <td className="px-4 py-3 font-mono">{r.vehiclePlate}</td>
                    <td className="px-4 py-3">{r.driverName}</td>
                    <td className="px-4 py-3 font-bold">{r.completedPointsCount} / {r.pointsCount}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'murojaatlar' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Kod</th>
                  <th className="px-4 py-3">Abonent</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Toifa</th>
                  <th className="px-4 py-3">Tuman</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.slice(0, 10).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.subscriberName}</td>
                    <td className="px-4 py-3">{c.phone}</td>
                    <td className="px-4 py-3">{c.category}</td>
                    <td className="px-4 py-3">{c.regionName}</td>
                    <td className="px-4 py-3 font-semibold text-amber-700">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(reportType === 'abonentlar' || reportType === 'konteynerlar' || reportType === 'texnikalar') && (
            <div className="p-8 text-center text-xs text-slate-500">
              Ushbu hisobot bo‘yicha to‘liq ma’lumotlar generatsiya qilingan. Yuqoridagi <strong>"Excel"</strong> yoki <strong>"PDF"</strong> tugmasi orqali yuklab olishingiz mumkin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
