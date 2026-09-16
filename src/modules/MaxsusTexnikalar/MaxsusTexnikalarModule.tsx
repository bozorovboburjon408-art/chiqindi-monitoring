import React, { useState } from 'react';
import { Truck, Plus, Search, Fuel, Gauge, User, Shield, Battery, Download, Edit2, Trash2 } from 'lucide-react';
import { Vehicle } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { exportToCSV } from '../../utils/exportUtils';

export const MaxsusTexnikalarModule: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(storageService.getVehicles());
  const drivers = storageService.getDrivers();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVeh, setEditingVeh] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plateNumber: '',
    model: 'ISUZU NPR 75L',
    year: 2023,
    capacityM3: 10,
    capacityTons: 5.5,
    fuelType: 'Dizel',
    currentFuelPercent: 80,
    driverId: drivers[0]?.id || '',
    gpsImei: '',
    status: 'ONLINE',
  });

  const refreshData = () => {
    setVehicles(storageService.getVehicles());
  };

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.driverName && v.driverName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingVeh(null);
    setFormData({
      plateNumber: '',
      model: 'ISUZU NPR 75L',
      year: 2023,
      capacityM3: 10,
      capacityTons: 5.5,
      fuelType: 'Dizel',
      currentFuelPercent: 85,
      driverId: drivers[0]?.id || '',
      gpsImei: String(Math.floor(100000000000000 + Math.random() * 900000000000000)),
      status: 'ONLINE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVeh(v);
    setFormData({ ...v });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plateNumber) return;

    const drv = drivers.find((d) => d.id === formData.driverId);

    if (editingVeh) {
      const updated: Vehicle = {
        ...editingVeh,
        plateNumber: formData.plateNumber || editingVeh.plateNumber,
        model: formData.model || editingVeh.model,
        year: Number(formData.year) || editingVeh.year,
        capacityM3: Number(formData.capacityM3) || editingVeh.capacityM3,
        capacityTons: Number(formData.capacityTons) || editingVeh.capacityTons,
        fuelType: formData.fuelType || editingVeh.fuelType,
        driverId: drv?.id,
        driverName: drv?.fullName,
        gpsImei: formData.gpsImei || editingVeh.gpsImei,
      };
      storageService.saveVehicle(updated);
    } else {
      const newVeh: Vehicle = {
        id: `veh-${Date.now()}`,
        plateNumber: formData.plateNumber || '',
        model: formData.model || 'ISUZU NPR 75L',
        year: Number(formData.year) || 2024,
        capacityM3: Number(formData.capacityM3) || 10,
        capacityTons: Number(formData.capacityTons) || 5.5,
        fuelType: formData.fuelType || 'Dizel',
        currentFuelPercent: Number(formData.currentFuelPercent) || 85,
        driverId: drv?.id,
        driverName: drv?.fullName,
        gpsImei: formData.gpsImei || '869402058192099',
        status: 'ONLINE',
        speedKmH: 0,
        lat: 41.3110,
        lng: 69.2405,
        heading: 0,
        lastUpdated: 'Hozirgina',
      };
      storageService.saveVehicle(newVeh);
    }

    refreshData();
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const data = filtered.map((v) => ({
      Davlat_raqami: v.plateNumber,
      Rusumi: v.model,
      Yili: v.year,
      Sigim_m3: v.capacityM3,
      Yuk_kutarish_tonna: v.capacityTons,
      Yoqilgi: v.fuelType,
      Haydovchi: v.driverName || 'Biriktirilmagan',
      GPS_IMEI: v.gpsImei,
      Status: v.status,
    }));
    exportToCSV('Maxsus_Texnikalar_Parki', data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Maxsus Texnikalar Parki</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Chiqindi tashuvchi kompaktorlar, samosvallar va ularning texnik holati
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
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" /> Yangi texnika qo‘shish
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Davlat raqami, rusumi yoki haydovchi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="ALL">Barcha statuslar ({vehicles.length})</option>
            <option value="HARAKATDA">🟢 HARAKATDA</option>
            <option value="MARSHRUTDA">🟢 MARSHRUTDA</option>
            <option value="TO‘XTAGAN">🟡 TO‘XTAGAN</option>
            <option value="ONLINE">🔵 ONLINE</option>
            <option value="OFFLINE">⚪ OFFLINE</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Davlat raqami</th>
                <th className="px-4 py-3.5">Rusumi & Yili</th>
                <th className="px-4 py-3.5">Biriktirilgan haydovchi</th>
                <th className="px-4 py-3.5">Sig‘imi (m³ / tonna)</th>
                <th className="px-4 py-3.5">Yoqilg‘i & Daraja</th>
                <th className="px-4 py-3.5">GPS IMEI</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((veh) => (
                <tr key={veh.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-extrabold text-slate-900 text-sm">
                    {veh.plateNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{veh.model}</div>
                    <div className="text-[11px] text-slate-400">Ishlab chiqarilgan yili: {veh.year}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {veh.driverName || 'Biriktirilmagan'}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {veh.capacityM3} m³ ({veh.capacityTons} t)
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${veh.currentFuelPercent}%` }}
                        />
                      </div>
                      <span className="font-bold text-[11px] text-slate-700">
                        {veh.currentFuelPercent}% ({veh.fuelType})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{veh.gpsImei}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        veh.status === 'HARAKATDA' || veh.status === 'MARSHRUTDA'
                          ? 'success'
                          : veh.status === 'TO‘XTAGAN'
                          ? 'warning'
                          : veh.status === 'ONLINE'
                          ? 'info'
                          : 'slate'
                      }
                      pulse={veh.status === 'HARAKATDA'}
                    >
                      {veh.status} {veh.speedKmH > 0 && `(${veh.speedKmH}km/h)`}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(veh)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        title="Tahrirlash"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVeh ? 'Maxsus texnikani tahrirlash' : 'Yangi maxsus texnika kiritish'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Davlat raqami *</label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
                placeholder="01 714 UZA"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rusumi / Modeli *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
                placeholder="ISUZU NPR 75L"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Yili</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sig‘imi (m³)</label>
              <input
                type="number"
                value={formData.capacityM3}
                onChange={(e) => setFormData({ ...formData, capacityM3: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Yuk sig‘imi (t)</label>
              <input
                type="number"
                step="0.5"
                value={formData.capacityTons}
                onChange={(e) => setFormData({ ...formData, capacityTons: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Yoqilg‘i turi</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
              >
                <option value="Dizel">Dizel</option>
                <option value="Metan gaz">Metan gaz</option>
                <option value="Propan">Propan</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Biriktirilgan haydovchi</label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
              >
                <option value="">Biriktirilmagan</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">GPS Tracker IMEI</label>
            <input
              type="text"
              value={formData.gpsImei}
              onChange={(e) => setFormData({ ...formData, gpsImei: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
