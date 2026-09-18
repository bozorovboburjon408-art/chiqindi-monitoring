import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Search,
  Plus,
  Filter,
  Eye,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Camera,
  AlertTriangle,
  Download,
  Send,
} from 'lucide-react';
import { Complaint, ComplaintStatus, ComplaintCategory } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { exportToCSV } from '../../utils/exportUtils';

export const MurojaatlarModule: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>(storageService.getComplaints());
  const regions = storageService.getRegions();
  const drivers = storageService.getDrivers();
  const users = storageService.getUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form states
  const [assigneeId, setAssigneeId] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [newComplaintData, setNewComplaintData] = useState<Partial<Complaint>>({
    subscriberName: '',
    phone: '+998 ',
    address: '',
    regionId: regions[0]?.id || '',
    category: 'Chiqindi o‘z vaqtida olinmadi',
    description: '',
    priority: 'O‘rta',
  });

  const refreshData = () => {
    setComplaints(storageService.getComplaints());
  };

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subscriberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchReg = selectedRegion === 'ALL' || c.regionId === selectedRegion;
    return matchSearch && matchStatus && matchCat && matchReg;
  });

  const handleOpenDetail = (cmp: Complaint) => {
    setSelectedComplaint(cmp);
    setActionNotes(cmp.responseNotes || '');
    setIsDetailModalOpen(true);
  };

  const handleOpenAssign = (cmp: Complaint) => {
    setSelectedComplaint(cmp);
    setAssigneeId(cmp.assignedStaffId || (drivers[0]?.id || ''));
    setActionNotes('');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    // Check if driver or user
    const driver = drivers.find((d) => d.id === assigneeId);
    const user = users.find((u) => u.id === assigneeId);
    const staffName = driver ? `${driver.fullName} (Haydovchi)` : user ? `${user.name} (${user.role})` : 'Biriktirildi';

    storageService.updateComplaintStatus(
      selectedComplaint.id,
      'Mas’ulga biriktirildi',
      actionNotes || 'Mas’ul xodimga ijro uchun yo‘naltirildi',
      assigneeId,
      staffName
    );

    refreshData();
    setIsAssignModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: ComplaintStatus) => {
    storageService.updateComplaintStatus(id, newStatus, actionNotes);
    refreshData();
    if (selectedComplaint) {
      const updated = storageService.getComplaints().find((c) => c.id === id);
      if (updated) setSelectedComplaint(updated);
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaintData.subscriberName || !newComplaintData.phone || !newComplaintData.address) {
      alert('Majburiy maydonlarni to‘ldiring');
      return;
    }

    const reg = regions.find((r) => r.id === newComplaintData.regionId) || regions[0];
    const newCmp: Complaint = {
      id: `cmp-${Date.now()}`,
      code: `MUR-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      subscriberId: `sub-${Math.floor(100 + Math.random() * 900)}`,
      subscriberName: newComplaintData.subscriberName || '',
      phone: newComplaintData.phone || '',
      address: newComplaintData.address || '',
      regionId: reg.id,
      regionName: reg.name,
      category: (newComplaintData.category as ComplaintCategory) || 'Chiqindi o‘z vaqtida olinmadi',
      description: newComplaintData.description || '',
      photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Yangi',
      priority: (newComplaintData.priority as any) || 'O‘rta',
    };

    storageService.saveComplaint(newCmp);
    refreshData();
    setIsNewModalOpen(false);
  };

  const handleExportCSV = () => {
    const data = filtered.map((c) => ({
      Murojaat_ID: c.code,
      Abonent: c.subscriberName,
      Telefon: c.phone,
      Manzil: c.address,
      Tuman: c.regionName,
      Toifa: c.category,
      Tavsif: c.description,
      Status: c.status,
      Masul: c.assignedStaffName || 'Biriktirilmagan',
      Sana: c.createdAt,
      Yakunlangan: c.completedAt || '-',
    }));
    exportToCSV('Murojaatlar_Reestri', data);
  };

  const statusBadgeVariant = (st: ComplaintStatus) => {
    switch (st) {
      case 'Yangi':
        return 'danger';
      case 'Qabul qilindi':
        return 'info';
      case 'Mas’ulga biriktirildi':
        return 'purple';
      case 'Jarayonda':
        return 'warning';
      case 'Bajarildi':
        return 'success';
      case 'Rad etildi':
        return 'slate';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Murojaatlar va Shikoyatlar</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Aholidan kelgan arizalar, fotosuratli dalillar va ijro jarayonini boshqarish
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
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" /> Yangi murojaat ochish
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Kod, abonent yoki manzil bo‘yicha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Barcha statuslar</option>
              <option value="Yangi">🔴 Yangi</option>
              <option value="Qabul qilindi">🔵 Qabul qilindi</option>
              <option value="Mas’ulga biriktirildi">🟣 Mas’ulga biriktirildi</option>
              <option value="Jarayonda">🟡 Jarayonda</option>
              <option value="Bajarildi">🟢 Bajarildi</option>
              <option value="Rad etildi">Rad etildi</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Barcha murojaat toifalari</option>
              <option value="Chiqindi o‘z vaqtida olinmadi">Chiqindi o‘z vaqtida olinmadi</option>
              <option value="Konteyner to‘lib ketgan">Konteyner to‘lib ketgan</option>
              <option value="Maydoncha ifloslangan">Maydoncha ifloslangan</option>
              <option value="Noqonuniy chiqindi to‘kish">Noqonuniy chiqindi to‘kish</option>
              <option value="Haydovchi / xodim qo‘polligi">Haydovchi / xodim qo‘polligi</option>
              <option value="Boshqa">Boshqa</option>
            </select>
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
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Jami: <strong className="text-slate-800">{filtered.length}</strong> ta murojaat topildi
          </span>
          {(searchQuery || selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || selectedRegion !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setSelectedCategory('ALL');
                setSelectedRegion('ALL');
              }}
              className="text-emerald-600 hover:underline font-medium"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID / Sana</th>
                <th className="px-4 py-3.5">Abonent & Manzil</th>
                <th className="px-4 py-3.5">Murojaat turi</th>
                <th className="px-4 py-3.5">Tavsif / Rasm</th>
                <th className="px-4 py-3.5">Mas’ul xodim</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cmp) => (
                <tr key={cmp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono">
                    <div className="font-bold text-slate-900">{cmp.code}</div>
                    <div className="text-[11px] text-slate-400">{cmp.createdAt}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{cmp.subscriberName}</div>
                    <div className="text-[11px] text-slate-500">{cmp.phone}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{cmp.address}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {cmp.category}
                    </span>
                    {cmp.priority === 'Shoshilinch' && (
                      <span className="ml-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        SHOSHILINCH
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-700 line-clamp-2">{cmp.description}</p>
                    {cmp.photoUrl && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <Camera className="h-3 w-3" /> Foto dalil mavjud
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {cmp.assignedStaffName ? (
                      <div className="font-medium text-slate-900">{cmp.assignedStaffName}</div>
                    ) : (
                      <button
                        onClick={() => handleOpenAssign(cmp)}
                        className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="h-3 w-3" /> Biriktirish
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(cmp.status)} pulse={cmp.status === 'Yangi'}>
                      {cmp.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenDetail(cmp)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                        title="Batafsil / Statusni o‘zgartirish"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenAssign(cmp)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        title="Mas’ulga biriktirish"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Lifecycle Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Murojaat #${selectedComplaint?.code || ''}`}
        subtitle={`Qabul qilingan: ${selectedComplaint?.createdAt || ''}`}
        maxWidth="2xl"
      >
        {selectedComplaint && (
          <div className="space-y-5 text-xs">
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] uppercase font-bold text-slate-400">Abonent</div>
                <div className="font-bold text-slate-900 text-sm mt-1">{selectedComplaint.subscriberName}</div>
                <div className="text-slate-600 mt-0.5">{selectedComplaint.phone}</div>
                <div className="text-slate-500 mt-1 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {selectedComplaint.address} ({selectedComplaint.regionName})
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] uppercase font-bold text-slate-400">Holat va Mas’ul</div>
                <div className="mt-1">
                  <Badge variant={statusBadgeVariant(selectedComplaint.status)} size="md">
                    {selectedComplaint.status}
                  </Badge>
                </div>
                <div className="text-slate-700 mt-2">
                  Mas’ul: <strong>{selectedComplaint.assignedStaffName || 'Hali biriktirilmagan'}</strong>
                </div>
                {selectedComplaint.completedAt && (
                  <div className="text-emerald-700 font-semibold mt-1">
                    Yakunlandi: {selectedComplaint.completedAt}
                  </div>
                )}
              </div>
            </div>

            {/* Description & Photo */}
            <div>
              <div className="text-slate-400 font-bold uppercase text-[11px]">Murojaat tavsifi:</div>
              <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed">
                {selectedComplaint.description}
              </div>
            </div>

            {selectedComplaint.photoUrl && (
              <div>
                <div className="text-slate-400 font-bold uppercase text-[11px] mb-1">
                  Biriktirilgan fotosurat (Dalil):
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56 max-w-sm">
                  <img
                    src={selectedComplaint.photoUrl}
                    alt="Murojaat rasmi"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Operator Notes & Status Controls */}
            <div className="pt-3 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Dispetcher / Ijrochi izohi:
              </label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Bajarilgan ishlar yoki ko‘rilgan choralar to‘g‘risida ma’lumot yozing..."
                className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-700">Statusni o‘zgartirish:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedComplaint.id, 'Qabul qilindi')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100"
                  >
                    Qabul qilindi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedComplaint.id, 'Jarayonda')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold hover:bg-amber-100"
                  >
                    Jarayonda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedComplaint.id, 'Bajarildi')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs"
                  >
                    ✓ Bajarildi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedComplaint.id, 'Rad etildi')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Rad etish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Staff Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Murojaatni mas’ul xodimga biriktirish"
        subtitle={`Murojaat: #${selectedComplaint?.code || ''}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mas’ul xodim yoki Haydovchi:</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200 bg-white"
            >
              <optgroup label="Maxsus texnika haydovchilari">
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    🚛 {d.fullName} ({d.vehiclePlate || 'Avtomobil'})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Dispetcherlar va Mas’ullar">
                {users
                  .filter((u) => u.role !== 'ABONENT')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} ({u.role})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Biriktirish sababi / topshiriq:</label>
            <textarea
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Masalan: Ushbu manzilga navbatdan tashqari reys bilan borib tozalansin..."
              className="w-full px-3 py-2 border rounded-xl text-xs border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20"
            >
              Biriktirish
            </button>
          </div>
        </form>
      </Modal>

      {/* New Complaint Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Yangi murojaat qabul qilish"
        subtitle="Dispetcher orqali yangi ariza ro‘yxatdan o‘tkazish"
      >
        <form onSubmit={handleCreateNew} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Abonent F.I.Sh. *</label>
              <input
                type="text"
                required
                value={newComplaintData.subscriberName}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, subscriberName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
                placeholder="Karimov Dilshod"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefon raqami *</label>
              <input
                type="text"
                required
                value={newComplaintData.phone}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
                placeholder="+998 90 123 45 67"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hudud (Tuman)</label>
              <select
                value={newComplaintData.regionId}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, regionId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName || r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Murojaat toifasi</label>
              <select
                value={newComplaintData.category}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, category: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
              >
                <option value="Chiqindi o‘z vaqtida olinmadi">Chiqindi o‘z vaqtida olinmadi</option>
                <option value="Konteyner to‘lib ketgan">Konteyner to‘lib ketgan</option>
                <option value="Maydoncha ifloslangan">Maydoncha ifloslangan</option>
                <option value="Noqonuniy chiqindi to‘kish">Noqonuniy chiqindi to‘kish</option>
                <option value="Haydovchi / xodim qo‘polligi">Haydovchi / xodim qo‘polligi</option>
                <option value="Boshqa">Boshqa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Aniq manzil *</label>
            <input
              type="text"
              required
              value={newComplaintData.address}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200"
              placeholder="Chilonzor 7, 14-uy oldi"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Murojaat matni / tavsifi *</label>
            <textarea
              rows={3}
              required
              value={newComplaintData.description}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200"
              placeholder="Aholining batafsil arizasi yoki shikoyati..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md"
            >
              Murojaatni ro‘yxatga olish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
