import React, { useState } from 'react';
import { Search, Plus, Home, Building, MapPin, Users, Download, Trash2, Edit2 } from 'lucide-react';
import { Household } from '../../types';
import { storageService } from '../../services/storageService';
import { Modal } from '../../components/common/Modal';
import { exportToCSV } from '../../utils/exportUtils';

interface XonadonlarModuleProps {
  onNavigate?: (module: string) => void;
}

export const XonadonlarModule: React.FC<XonadonlarModuleProps> = ({ onNavigate }) => {
  const [households, setHouseholds] = useState<Household[]>(storageService.getHouseholds());
  const regions = storageService.getRegions();
  const chyms = storageService.getCHYMs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHh, setEditingHh] = useState<Household | null>(null);

  const [formData, setFormData] = useState<Partial<Household>>({
    address: '',
    regionId: regions[0]?.id || '',
    residentsCount: 4,
    chymId: chyms[0]?.id || '',
    type: 'Ko‘p qavatli',
  });

  const refreshData = () => {
    setHouseholds(storageService.getHouseholds());
  };

  const filtered = households.filter((h) => {
    const matchSearch =
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.subscriberName && h.subscriberName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchReg = selectedRegion === 'ALL' || h.regionId === selectedRegion;
    const matchType = selectedType === 'ALL' || h.type === selectedType;
    return matchSearch && matchReg && matchType;
  });

  const handleOpenAdd = () => {
    setEditingHh(null);
    setFormData({
      address: '',
      regionId: regions[0]?.id || '',
      residentsCount: 4,
      chymId: chyms[0]?.id || '',
      type: 'Ko‘p qavatli',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hh: Household) => {
    setEditingHh(hh);
    setFormData({ ...hh });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address) return;

    const reg = regions.find((r) => r.id === formData.regionId) || regions[0];
    const chym = chyms.find((c) => c.id === formData.chymId) || chyms[0];

    if (editingHh) {
      const updated: Household = {
        ...editingHh,
        address: formData.address || editingHh.address,
        regionId: reg.id,
        regionName: reg.name,
        chymId: chym.id,
        chymName: chym.name,
        residentsCount: Number(formData.residentsCount) || 1,
        type: formData.type || 'Ko‘p qavatli',
      };
      storageService.saveHousehold(updated);
    } else {
      const newHh: Household = {
        id: `hh-${Date.now()}`,
        code: `XON-${Math.floor(100 + Math.random() * 900)}`,
        address: formData.address || '',
        regionId: reg.id,
        regionName: reg.name,
        residentsCount: Number(formData.residentsCount) || 1,
        chymId: chym.id,
        chymName: chym.name,
        type: formData.type || 'Ko‘p qavatli',
      };
      storageService.saveHousehold(newHh);
    }

    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`${code} xonadonini o‘chirishni tasdiqlaysizmi?`)) {
      storageService.deleteHousehold(id);
      refreshData();
    }
  };

  const handleExportCSV = () => {
    const data = filtered.map((h) => ({
      Kod: h.code,
      Manzil: h.address,
      Tuman: h.regionName,
      Aholi_soni: h.residentsCount,
      CHYM: h.chymName,
      Turi: h.type,
      Biriktirilgan_abonent: h.subscriberName || 'Biriktirilmagan',
    }));
    exportToCSV('Xonadonlar_Reestri', data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Xonadonlar va Binolar</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Chiqindi yig‘ish maydonchalariga (ЧЙМ) biriktirilgan ko‘p qavatli va hovli uylar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => {
                sessionStorage.setItem('ecocontrol_start_add_house', 'true');
                onNavigate('gps');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              title="GIS Xaritada xonadon chegaralari va burchak nuqtalarini belgilash"
            >
              <MapPin className="h-4 w-4" /> Xaritada nuqtalarini belgilash
            </button>
          )}
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
            <Plus className="h-4 w-4" /> Yangi xonadon
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Manzil yoki xonadon kodi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Barcha hududlar</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fullName || r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Barcha turlari</option>
            <option value="Ko‘p qavatli">Ko‘p qavatli bino</option>
            <option value="Hovli">Hovli (Xususiy sektor)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Kod</th>
                <th className="px-4 py-3.5">Manzil</th>
                <th className="px-4 py-3.5">Hudud</th>
                <th className="px-4 py-3.5">Bino turi</th>
                <th className="px-4 py-3.5">Aholi soni</th>
                <th className="px-4 py-3.5">Biriktirilgan ЧЙМ</th>
                <th className="px-4 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((hh) => (
                <tr key={hh.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{hh.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{hh.address}</td>
                  <td className="px-4 py-3 text-slate-600">{hh.regionName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {hh.type === 'Ko‘p qavatli' ? <Building className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                      {hh.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-1 mt-2">
                    <Users className="h-3.5 w-3.5 text-slate-400" /> {hh.residentsCount} kishi
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-700">{hh.chymName}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(hh)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        title="Tahrirlash"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hh.id, hh.code)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-rose-600"
                        title="O‘chirish"
                      >
                        <Trash2 className="h-4 w-4" />
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
        title={editingHh ? 'Xonadonni tahrirlash' : 'Yangi xonadon qo‘shish'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Manzil *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500"
              placeholder="Chilonzor 7-mavze, 14-uy, 25-xonadon"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hudud</label>
              <select
                value={formData.regionId}
                onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 bg-white"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName || r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Aholi soni</label>
              <input
                type="number"
                min="1"
                value={formData.residentsCount}
                onChange={(e) => setFormData({ ...formData, residentsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bino turi</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 bg-white"
              >
                <option value="Ko‘p qavatli">Ko‘p qavatli bino</option>
                <option value="Hovli">Hovli (Xususiy)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biriktirilgan ЧЙМ</label>
              <select
                value={formData.chymId}
                onChange={(e) => setFormData({ ...formData, chymId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 bg-white"
              >
                {chyms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
