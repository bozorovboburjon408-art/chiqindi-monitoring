import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  Phone,
  MapPin,
  Building,
  UserCheck,
  AlertCircle,
  MessageSquare,
  Star,
  CheckCircle,
} from 'lucide-react';
import { Subscriber, Region } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { exportToCSV } from '../../utils/exportUtils';

export const AbonentlarModule: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(storageService.getSubscribers());
  const regions = storageService.getRegions();
  const complaints = storageService.getComplaints();
  const ratings = storageService.getRatings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState<Subscriber | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Subscriber>>({
    fullName: '',
    phone: '+998 ',
    address: '',
    regionId: regions[0]?.id || '',
    householdNumber: '',
    type: 'Aholi',
    status: 'Faol',
    balance: 0,
    notes: '',
  });

  const refreshData = () => {
    setSubscribers(storageService.getSubscribers());
  };

  // Filter logic
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.phone.includes(searchQuery) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === 'ALL' || sub.regionId === selectedRegion;
    const matchesStatus = selectedStatus === 'ALL' || sub.status === selectedStatus;
    const matchesType = selectedType === 'ALL' || sub.type === selectedType;

    return matchesSearch && matchesRegion && matchesStatus && matchesType;
  });

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      phone: '+998 ',
      address: '',
      regionId: regions[0]?.id || '',
      householdNumber: '',
      type: 'Aholi',
      status: 'Faol',
      balance: 0,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sub: Subscriber) => {
    setCurrentSub(sub);
    setFormData({ ...sub });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (sub: Subscriber) => {
    setCurrentSub(sub);
    setIsViewModalOpen(true);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Iltimos, barcha majburiy maydonlarni to‘ldiring');
      return;
    }

    const reg = regions.find((r) => r.id === formData.regionId) || regions[0];
    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      code: `AB-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: formData.fullName || '',
      phone: formData.phone || '',
      address: formData.address || '',
      regionId: reg.id,
      regionName: reg.name,
      householdNumber: formData.householdNumber || '1-uy',
      type: formData.type || 'Aholi',
      status: formData.status || 'Faol',
      registeredDate: new Date().toISOString().slice(0, 10),
      balance: Number(formData.balance) || 0,
      notes: formData.notes,
    };

    storageService.saveSubscriber(newSub);
    refreshData();
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSub) return;
    const reg = regions.find((r) => r.id === formData.regionId) || regions[0];
    const updatedSub: Subscriber = {
      ...currentSub,
      fullName: formData.fullName || currentSub.fullName,
      phone: formData.phone || currentSub.phone,
      address: formData.address || currentSub.address,
      regionId: reg.id,
      regionName: reg.name,
      householdNumber: formData.householdNumber || currentSub.householdNumber,
      type: formData.type || currentSub.type,
      status: formData.status || currentSub.status,
      balance: Number(formData.balance) || 0,
      notes: formData.notes,
    };

    storageService.saveSubscriber(updatedSub);
    refreshData();
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Haqiqatan ham "${name}" abonentini o‘chirmoqchimisiz?`)) {
      storageService.deleteSubscriber(id);
      refreshData();
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredSubscribers.map((s) => ({
      ID: s.code,
      FIO: s.fullName,
      Telefon: s.phone,
      Tuman: s.regionName,
      Manzil: s.address,
      Turi: s.type,
      Holati: s.status,
      Balans: s.balance,
      Sana: s.registeredDate,
    }));
    exportToCSV('Abonentlar_Bazasi', exportData);
  };

  // Sub complaints and ratings for detail modal
  const subComplaints = currentSub
    ? complaints.filter((c) => c.subscriberId === currentSub.id || c.subscriberName.includes(currentSub.fullName))
    : [];
  const subRatings = currentSub
    ? ratings.filter((r) => r.subscriberId === currentSub.id || r.subscriberName.includes(currentSub.fullName))
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Abonentlar Bazasi</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Jami {subscribers.length} ta ro‘yxatga olingan abonentlar (aholi va yuridik shaxslar)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all"
          >
            <Download className="h-4 w-4" /> Excel Eksport
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="h-4 w-4" /> Yangi abonent
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="F.I.Sh., telefon yoki manzil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Region filter */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Barcha hududlar ({regions.length})</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName || r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Barcha holatlar</option>
              <option value="Faol">Faol</option>
              <option value="Qarzdor">Qarzdor</option>
              <option value="To‘xtatilgan">To‘xtatilgan</option>
            </select>
          </div>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Barcha turlar</option>
              <option value="Aholi">Aholi (Jismoniy shaxs)</option>
              <option value="Yuridik shaxs">Yuridik shaxs (Kompaniya)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Ko‘rsatilmoqda: <strong className="text-slate-800">{filteredSubscribers.length}</strong> ta abonent
          </span>
          {(searchQuery || selectedRegion !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('ALL');
                setSelectedStatus('ALL');
                setSelectedType('ALL');
              }}
              className="text-emerald-600 hover:underline font-medium"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID / Kod</th>
                <th className="px-4 py-3.5">F.I.Sh. / Tashkilot</th>
                <th className="px-4 py-3.5">Telefon raqami</th>
                <th className="px-4 py-3.5">Hudud / Manzil</th>
                <th className="px-4 py-3.5">Turi</th>
                <th className="px-4 py-3.5">Holati</th>
                <th className="px-4 py-3.5">Balans</th>
                <th className="px-4 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscribers.slice(0, 25).map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{sub.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{sub.fullName}</div>
                    <div className="text-[11px] text-slate-400">Ro‘yxatdan: {sub.registeredDate}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{sub.phone}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 font-medium">{sub.address}</div>
                    <div className="text-[11px] text-slate-400">{sub.regionName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        sub.type === 'Aholi'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {sub.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        sub.status === 'Faol'
                          ? 'success'
                          : sub.status === 'Qarzdor'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-bold font-mono">
                    <span className={sub.balance < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                      {sub.balance.toLocaleString('uz-UZ')} so‘m
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenView(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                        title="Batafsil ko‘rish"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id, sub.fullName)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors"
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

        {filteredSubscribers.length > 25 && (
          <div className="p-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Dastlabki 25 ta abonent ko‘rsatildi. Filtrlash orqali kerakli abonentni aniq topishingiz mumkin.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Yangi abonent qo‘shish' : 'Abonent ma’lumotlarini tahrirlash'}
        subtitle="TozaHududDM yagona abonentlar bazasi"
      >
        <form onSubmit={isAddModalOpen ? handleSaveNew : handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                F.I.Sh. yoki Tashkilot nomi *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="Masalan: Karimov Dilshod"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon raqami *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="+998 90 123 45 67"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hudud (Tuman) *</label>
              <select
                value={formData.regionId}
                onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName || r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Manzil *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="Chilonzor 7, 14-uy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Abonent turi</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
              >
                <option value="Aholi">Aholi (Jismoniy shaxs)</option>
                <option value="Yuridik shaxs">Yuridik shaxs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Holati</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
              >
                <option value="Faol">Faol</option>
                <option value="Qarzdor">Qarzdor</option>
                <option value="To‘xtatilgan">To‘xtatilgan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Balans (so‘m)</label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Izoh / Shartnoma</label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="Ixtiyoriy qo‘shimcha izoh"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Detailed Profile Drawer Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Abonent profili: ${currentSub?.fullName || ''}`}
        subtitle={`Kod: ${currentSub?.code || ''} • Ro‘yxatdan o‘tgan: ${currentSub?.registeredDate || ''}`}
        maxWidth="2xl"
      >
        {currentSub && (
          <div className="space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Aloqa</div>
                <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" /> {currentSub.phone}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{currentSub.address}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Hisob holati</div>
                <div
                  className={`text-sm font-black mt-1 ${
                    currentSub.balance < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {currentSub.balance.toLocaleString('uz-UZ')} so‘m
                </div>
                <div className="mt-1">
                  <Badge
                    variant={
                      currentSub.status === 'Faol'
                        ? 'success'
                        : currentSub.status === 'Qarzdor'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {currentSub.status}
                  </Badge>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Hudud & Turi</div>
                <div className="text-xs font-bold text-slate-900 mt-1">{currentSub.regionName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{currentSub.type}</div>
              </div>
            </div>

            {/* Complaints History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-amber-500" /> Abonent Murojaatlari ({subComplaints.length})
              </h4>
              {subComplaints.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-dashed border-slate-200">
                  Ushbu abonent tomonidan murojaat kelib tushmagan.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {subComplaints.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{c.code}</span>
                          <span className="text-slate-400 font-normal">• {c.createdAt}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{c.description}</p>
                      </div>
                      <Badge variant={c.status === 'Bajarildi' ? 'success' : 'warning'}>
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ratings History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Xizmat sifatiga bergan baholari ({subRatings.length})
              </h4>
              {subRatings.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-dashed border-slate-200">
                  Ushbu abonent hali xizmat sifatini baholamagan.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {subRatings.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          <span className="text-slate-400 text-[11px] font-normal ml-2">{r.createdAt}</span>
                        </div>
                        <p className="text-slate-700 mt-1">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
