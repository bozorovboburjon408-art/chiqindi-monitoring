import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
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
  XCircle,
  User,
  CreditCard,
  Calendar,
  FileText,
  Home,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
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

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMahalla, setSelectedMahalla] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedIdentified, setSelectedIdentified] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState<Subscriber | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Subscriber>>({
    fullName: '',
    accountNumber: '',
    phone: '+998 ',
    homePhone: '',
    address: '',
    viloyat: 'Навоий вилояти',
    districtName: 'Зарафшон шаҳар',
    companyName: 'Zarafshon sh "Toza Hudud" DK',
    mahalla: '',
    street: '',
    houseNumber: '',
    postalIndex: '',
    flatNumber: '',
    residentsCount: 1,
    iivResidentsCount: 0,
    lastPaymentAmount: 0,
    lastPaymentDate: '',
    pinfl: '',
    passport: '',
    birthDate: '',
    passportIssuedDate: '',
    cadastreNumber: '',
    notes: '',
    vatAmount: 0,
    isIdentified: 'Ҳа',
    identifiedDate: '',
    regionId: regions[0]?.id || 'reg-zrf',
    type: 'Aholi',
    status: 'Faol',
    balance: 0,
  });

  const refreshData = () => {
    setSubscribers(storageService.getSubscribers());
  };

  // Extract all unique mahallas from subscriber base for filter dropdown
  const mahallaList = useMemo(() => {
    const set = new Set<string>();
    subscribers.forEach((s) => {
      if (s.mahalla) set.add(s.mahalla.trim());
    });
    return Array.from(set).sort();
  }, [subscribers]);

  // Filter logic
  const filteredSubscribers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return subscribers.filter((sub) => {
      const matchesSearch =
        !query ||
        sub.fullName.toLowerCase().includes(query) ||
        (sub.accountNumber && sub.accountNumber.includes(query)) ||
        (sub.code && sub.code.toLowerCase().includes(query)) ||
        (sub.phone && sub.phone.includes(query)) ||
        (sub.pinfl && sub.pinfl.includes(query)) ||
        (sub.passport && sub.passport.toLowerCase().includes(query)) ||
        (sub.address && sub.address.toLowerCase().includes(query)) ||
        (sub.street && sub.street.toLowerCase().includes(query)) ||
        (sub.cadastreNumber && sub.cadastreNumber.toLowerCase().includes(query));

      const matchesMahalla = selectedMahalla === 'ALL' || sub.mahalla === selectedMahalla;
      const matchesRegion = selectedRegion === 'ALL' || sub.regionId === selectedRegion;
      const matchesIdentified =
        selectedIdentified === 'ALL' ||
        (selectedIdentified === 'HA' && (sub.isIdentified === 'Ҳа' || sub.isIdentified === 'Ha')) ||
        (selectedIdentified === 'YOQ' && (sub.isIdentified === 'Йўқ' || sub.isIdentified === 'Yo\'q' || !sub.isIdentified));
      const matchesStatus = selectedStatus === 'ALL' || sub.status === selectedStatus;

      return matchesSearch && matchesMahalla && matchesRegion && matchesIdentified && matchesStatus;
    });
  }, [subscribers, searchQuery, selectedMahalla, selectedRegion, selectedIdentified, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSubscribers.length / pageSize));
  const paginatedSubscribers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubscribers.slice(start, start + pageSize);
  }, [filteredSubscribers, currentPage, pageSize]);

  // Reset to page 1 on search or filter change
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      accountNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      phone: '+998 ',
      homePhone: '',
      address: '',
      viloyat: 'Навоий вилояти',
      districtName: 'Зарафшон шаҳар',
      companyName: 'Zarafshon sh "Toza Hudud" DK',
      mahalla: mahallaList[0] || 'МУРУНТАУ МФЙ',
      street: '',
      houseNumber: '',
      postalIndex: '',
      flatNumber: '',
      residentsCount: 1,
      iivResidentsCount: 0,
      lastPaymentAmount: 0,
      lastPaymentDate: new Date().toISOString().slice(0, 10),
      pinfl: '',
      passport: '',
      birthDate: '',
      passportIssuedDate: '',
      cadastreNumber: '',
      notes: 'Yangi shartnoma asosida',
      vatAmount: 0,
      isIdentified: 'Ҳа',
      identifiedDate: new Date().toISOString().slice(0, 10),
      regionId: 'reg-zrf',
      type: 'Aholi',
      status: 'Faol',
      balance: 0,
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
    if (!formData.fullName || !formData.phone) {
      alert('Iltimos, F.I.Sh. va telefon raqamini to‘ldiring');
      return;
    }

    const reg = regions.find((r) => r.id === formData.regionId) || regions[0];
    const newAccountNo = formData.accountNumber || `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const addr = formData.address || `${formData.districtName || 'Зарафшон шаҳар'}, ${formData.mahalla || ''} ${formData.street ? formData.street + ' ko‘chasi' : ''} ${formData.houseNumber ? formData.houseNumber + '-uy' : ''}`;

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      code: newAccountNo,
      accountNumber: newAccountNo,
      fullName: formData.fullName || '',
      phone: formData.phone || '',
      homePhone: formData.homePhone || '',
      address: addr,
      viloyat: formData.viloyat || 'Навоий вилояти',
      districtName: formData.districtName || 'Зарафшон шаҳар',
      companyName: formData.companyName || 'Zarafshon sh "Toza Hudud" DK',
      mahalla: formData.mahalla || '',
      street: formData.street || '',
      houseNumber: formData.houseNumber || '',
      postalIndex: formData.postalIndex || '',
      flatNumber: formData.flatNumber || '',
      residentsCount: Number(formData.residentsCount) || 1,
      iivResidentsCount: Number(formData.iivResidentsCount) || 0,
      lastPaymentAmount: Number(formData.lastPaymentAmount) || 0,
      lastPaymentDate: formData.lastPaymentDate || '',
      pinfl: formData.pinfl || '',
      passport: formData.passport || '',
      birthDate: formData.birthDate || '',
      passportIssuedDate: formData.passportIssuedDate || '',
      cadastreNumber: formData.cadastreNumber || '',
      registeredDate: new Date().toISOString().slice(0, 10),
      notes: formData.notes || '',
      vatAmount: Number(formData.vatAmount) || 0,
      isIdentified: formData.isIdentified || 'Ҳа',
      identifiedDate: formData.identifiedDate || '',
      regionId: reg.id,
      regionName: reg.name,
      householdNumber: `${formData.houseNumber || 1}-uy`,
      type: formData.type || 'Aholi',
      status: formData.status || 'Faol',
      balance: Number(formData.lastPaymentAmount) || 0,
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
      accountNumber: formData.accountNumber || currentSub.accountNumber,
      phone: formData.phone || currentSub.phone,
      homePhone: formData.homePhone || currentSub.homePhone,
      address: formData.address || currentSub.address,
      viloyat: formData.viloyat || currentSub.viloyat,
      districtName: formData.districtName || currentSub.districtName,
      companyName: formData.companyName || currentSub.companyName,
      mahalla: formData.mahalla || currentSub.mahalla,
      street: formData.street || currentSub.street,
      houseNumber: formData.houseNumber || currentSub.houseNumber,
      postalIndex: formData.postalIndex || currentSub.postalIndex,
      flatNumber: formData.flatNumber || currentSub.flatNumber,
      residentsCount: Number(formData.residentsCount) || currentSub.residentsCount,
      iivResidentsCount: Number(formData.iivResidentsCount) || currentSub.iivResidentsCount,
      lastPaymentAmount: Number(formData.lastPaymentAmount) || currentSub.lastPaymentAmount,
      lastPaymentDate: formData.lastPaymentDate || currentSub.lastPaymentDate,
      pinfl: formData.pinfl || currentSub.pinfl,
      passport: formData.passport || currentSub.passport,
      birthDate: formData.birthDate || currentSub.birthDate,
      passportIssuedDate: formData.passportIssuedDate || currentSub.passportIssuedDate,
      cadastreNumber: formData.cadastreNumber || currentSub.cadastreNumber,
      notes: formData.notes || currentSub.notes,
      vatAmount: Number(formData.vatAmount) || currentSub.vatAmount,
      isIdentified: formData.isIdentified || currentSub.isIdentified,
      identifiedDate: formData.identifiedDate || currentSub.identifiedDate,
      regionId: reg.id,
      regionName: reg.name,
      type: formData.type || currentSub.type,
      status: formData.status || currentSub.status,
      balance: Number(formData.balance) || currentSub.balance,
    };

    storageService.saveSubscriber(updatedSub);
    refreshData();
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Haqiqatan ham "${name}" abonentini tizimdan o‘chirmoqchimisiz?`)) {
      storageService.deleteSubscriber(id);
      refreshData();
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredSubscribers.map((s, idx) => ({
      ID: idx + 1,
      F_I_SH: s.fullName,
      Hisob_raqami: s.accountNumber || s.code,
      Viloyat: s.viloyat || 'Навоий вилояти',
      Tuman: s.districtName || s.regionName,
      Korxona: s.companyName || 'Zarafshon sh "Toza Hudud" DK',
      Mahalla: s.mahalla || '',
      Kocha: s.street || '',
      Uy: s.houseNumber || '',
      Indeks: s.postalIndex || '',
      Kvartira: s.flatNumber || '',
      Yashovchilar_soni: s.residentsCount || 1,
      IIV_yashovchilar_soni: s.iivResidentsCount || 0,
      Ohirgi_tolov_summasi: s.lastPaymentAmount || 0,
      Ohirgi_tolov_sanasi: s.lastPaymentDate || '',
      PINFL: s.pinfl || '',
      Pasport: s.passport || '',
      Tugilgan_sanasi: s.birthDate || '',
      Pasport_berilgan_sana: s.passportIssuedDate || '',
      Kadastr_raqami: s.cadastreNumber || '',
      Uy_telefoni: s.homePhone || '',
      Shaxsiy_telefon: s.phone || '',
      Tizimga_qoshilgan_vaqti: s.registeredDate || '',
      Izoh: s.notes || '',
      QQS_summa: s.vatAmount || 0,
      Identifikatsiyalangan: s.isIdentified || 'Ҳа',
      Identifikatsiyalangan_vaqti: s.identifiedDate || '',
    }));
    exportToCSV('Abonentlar_Reestri_TozaHududDM', exportData);
  };

  // Sub complaints and ratings for detail modal
  const subComplaints = currentSub
    ? complaints.filter((c) => c.subscriberId === currentSub.id || c.subscriberName.includes(currentSub.fullName))
    : [];
  const subRatings = currentSub
    ? ratings.filter((r) => r.subscriberId === currentSub.id || r.subscriberName.includes(currentSub.fullName))
    : [];

  const identifiedCount = subscribers.filter((s) => s.isIdentified === 'Ҳа' || s.isIdentified === 'Ha').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Abonentlar Bazasi (Reestr)</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Jami {subscribers.length.toLocaleString('uz-UZ')} ta ro‘yxatga olingan jismoniy va yuridik abonentlar
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

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-extrabold text-emerald-600 text-sm shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-black text-slate-900 truncate">
              {subscribers.length.toLocaleString('uz-UZ')} ta
            </div>
            <div className="text-[11px] text-slate-400 truncate">Jami abonentlar</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-extrabold text-teal-600 text-sm shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-black text-slate-900 truncate">
              {identifiedCount.toLocaleString('uz-UZ')} ta
            </div>
            <div className="text-[11px] text-teal-700 font-semibold truncate">Identifikatsiyalangan</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-extrabold text-blue-600 text-sm shrink-0">
            <Home className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-black text-slate-900 truncate">{mahallaList.length} ta MFY</div>
            <div className="text-[11px] text-blue-700 font-semibold truncate">Qamrab olingan hududlar</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center font-extrabold text-purple-600 text-sm shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-black text-slate-900 truncate">Onlayn Billing</div>
            <div className="text-[11px] text-purple-700 font-semibold truncate">Munis & Paynet integratsiya</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Universal Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="F.I.Sh., Hisob raqami, PINFL, Pasport, Telefon, Ko‘cha..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Mahalla filter */}
          <div>
            <select
              value={selectedMahalla}
              onChange={(e) => handleFilterChange(setSelectedMahalla, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Barcha mahallalar ({mahallaList.length})</option>
              {mahallaList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Identified filter */}
          <div>
            <select
              value={selectedIdentified}
              onChange={(e) => handleFilterChange(setSelectedIdentified, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Identifikatsiya (Barchasi)</option>
              <option value="HA">🟢 Ҳа (Identifikatsiyalangan)</option>
              <option value="YOQ">⚪ Йўқ (Aniqlanmagan)</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Barcha holatlar</option>
              <option value="Faol">🟢 Faol</option>
              <option value="Qarzdor">🔴 Qarzdor</option>
              <option value="To‘xtatilgan">🟡 To‘xtatilgan</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 gap-2">
          <div className="flex items-center gap-2">
            <span>
              Jami topildi: <strong className="text-slate-900 font-bold">{filteredSubscribers.length.toLocaleString('uz-UZ')}</strong> ta abonent
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Sahifa: <strong className="text-slate-900 font-bold">{currentPage}</strong> / {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Qatorda:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value={25}>25 ta</option>
                <option value={50}>50 ta</option>
                <option value={100}>100 ta</option>
                <option value={200}>200 ta</option>
              </select>
            </div>

            {(searchQuery || selectedMahalla !== 'ALL' || selectedIdentified !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMahalla('ALL');
                  setSelectedRegion('ALL');
                  setSelectedIdentified('ALL');
                  setSelectedStatus('ALL');
                  setCurrentPage(1);
                }}
                className="text-emerald-600 hover:underline font-bold"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-3.5 py-3.5">Ҳисоб рақами</th>
                <th className="px-4 py-3.5">Ф.И.Ш / Паспорт</th>
                <th className="px-4 py-3.5">Маҳалла ва Кўча</th>
                <th className="px-3 py-3.5 text-center">Яшовчилар</th>
                <th className="px-4 py-3.5">Шахсий телефон</th>
                <th className="px-4 py-3.5">Оҳирги тўлов</th>
                <th className="px-3 py-3.5 text-center">Идентификация</th>
                <th className="px-3 py-3.5 text-center">Ҳолати</th>
                <th className="px-4 py-3.5 text-right">Амаллар</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    Qidiruv bo‘yicha abonent topilmadi.
                  </td>
                </tr>
              ) : (
                paginatedSubscribers.map((sub) => {
                  const isId = sub.isIdentified === 'Ҳа' || sub.isIdentified === 'Ha';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {sub.accountNumber || sub.code}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 line-clamp-1">{sub.fullName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {sub.passport && <span className="font-mono">{sub.passport}</span>}
                          {sub.pinfl && <span className="font-mono text-slate-500">JSHSHIR: {sub.pinfl}</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {sub.mahalla || sub.districtName}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {sub.street ? `${sub.street} ko‘chasi` : ''} {sub.houseNumber ? `${sub.houseNumber}-uy` : ''} {sub.flatNumber ? `${sub.flatNumber}-xonadon` : ''}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {sub.residentsCount || 1} nafar
                        </span>
                        {sub.iivResidentsCount !== undefined && sub.iivResidentsCount > 0 && (
                          <div className="text-[10px] text-slate-400 mt-0.5">IIV: {sub.iivResidentsCount}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">{sub.phone}</td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-emerald-700">
                          {sub.lastPaymentAmount ? `${sub.lastPaymentAmount.toLocaleString('uz-UZ')} so‘m` : '0 so‘m'}
                        </div>
                        <div className="text-[10px] text-slate-400">{sub.lastPaymentDate || 'Mavjud emas'}</div>
                      </td>

                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isId
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isId ? '✓ Ҳа' : '✕ Йўқ'}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center whitespace-nowrap">
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

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(sub)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                            title="Abonent to‘liq kartasi"
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Ko‘rsatilmoqda: <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> dan{' '}
              <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredSubscribers.length)}</strong> gacha (Jami: {filteredSubscribers.length.toLocaleString('uz-UZ')})
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-600 font-bold flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Oldingi
              </button>

              <span className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-800">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-600 font-bold flex items-center gap-1"
              >
                Keyingi <ChevronRight className="h-4 w-4" />
              </button>
            </div>
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
        subtitle="TozaHududDM rasmiy abonentlar reestri"
        maxWidth="2xl"
      >
        <form onSubmit={isAddModalOpen ? handleSaveNew : handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">F.I.Sh. *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
                placeholder="OCHILOV KAMOLIDDIN TO‘LKINOVICH"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ҳисоб рақами</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                placeholder="112010291079"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Шахсий телефон *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                placeholder="+998 93 434 10 21"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ПИНФЛ (JSHSHIR)</label>
              <input
                type="text"
                maxLength={14}
                value={formData.pinfl || ''}
                onChange={(e) => setFormData({ ...formData, pinfl: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                placeholder="30710872350013"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Паспорт серия ва рақами</label>
              <input
                type="text"
                value={formData.passport || ''}
                onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                placeholder="AE5524815"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Туғилган санаси</label>
              <input
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Маҳалла (МФЙ)</label>
              <input
                type="text"
                value={formData.mahalla || ''}
                onChange={(e) => setFormData({ ...formData, mahalla: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="МУРУНТАУ МФЙ"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Кўча ва Уй рақами</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.street || ''}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500"
                  placeholder="АЛИШЕР НАВОИЙ"
                />
                <input
                  type="text"
                  value={formData.houseNumber || ''}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500"
                  placeholder="5-uy"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Яшовчилар сони</label>
              <input
                type="number"
                min="1"
                value={formData.residentsCount || 1}
                onChange={(e) => setFormData({ ...formData, residentsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Кадастр рақами</label>
              <input
                type="text"
                value={formData.cadastreNumber || ''}
                onChange={(e) => setFormData({ ...formData, cadastreNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                placeholder="21:10:01:03:06:4022:0001:042"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Оҳирги тўлов суммаси (сўм)</label>
              <input
                type="number"
                value={formData.lastPaymentAmount || 0}
                onChange={(e) => setFormData({ ...formData, lastPaymentAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Идентификацияланган</label>
              <select
                value={formData.isIdentified || 'Ҳа'}
                onChange={(e) => setFormData({ ...formData, isIdentified: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
              >
                <option value="Ҳа">🟢 Ҳа</option>
                <option value="Йўқ">⚪ Йўқ</option>
              </select>
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

      {/* Comprehensive Subscriber Passport Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Abonent Pasport Kartasi: ${currentSub?.fullName || ''}`}
        subtitle={`Ҳисоб рақами: ${currentSub?.accountNumber || currentSub?.code || ''} • ${currentSub?.districtName || 'Зарафшон'}`}
        maxWidth="4xl"
      >
        {currentSub && (
          <div className="space-y-5 text-xs">
            {/* Top Quick Status Header */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-mono">F.I.Sh.</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">{currentSub.fullName}</h3>
                <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                  <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-emerald-400">
                    Ҳ/Р: {currentSub.accountNumber || currentSub.code}
                  </span>
                  <span>•</span>
                  <span>{currentSub.companyName || 'Zarafshon sh "Toza Hudud" DK'}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block uppercase font-mono">Identifikatsiya</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      currentSub.isIdentified === 'Ҳа' || currentSub.isIdentified === 'Ha'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {currentSub.isIdentified === 'Ҳа' || currentSub.isIdentified === 'Ha' ? '✓ Identifikatsiyalangan' : '✕ Aniqlanmagan'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Thematic Information Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section 1: Shaxsiy ma'lumotlar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <User className="h-4 w-4 text-emerald-600" /> Shaxsiy ma’lumotlar
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ПИНФЛ (JSHSHIR):</span>
                    <strong className="font-mono text-slate-800">{currentSub.pinfl || 'Mavjud emas'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Паспорт серия & рақам:</span>
                    <strong className="font-mono text-slate-800">{currentSub.passport || 'Mavjud emas'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Туғилган санаси:</span>
                    <span className="font-medium text-slate-800">{currentSub.birthDate || 'Mavjud emas'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Паспорт берилган санаси:</span>
                    <span className="font-medium text-slate-800">{currentSub.passportIssuedDate || 'Mavjud emas'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Идентификация вақти:</span>
                    <span className="font-medium text-slate-800">{currentSub.identifiedDate || 'Mavjud emas'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Manzil va Uy-joy */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <MapPin className="h-4 w-4 text-blue-600" /> Manzil va Ko‘chmas mulk
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Вилоят va Туман:</span>
                    <span className="font-semibold text-slate-800">{currentSub.viloyat || 'Навоий вилояти'}, {currentSub.districtName || 'Зарафшон шаҳар'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Маҳалла (МФЙ):</span>
                    <strong className="text-slate-800">{currentSub.mahalla || 'Mavjud emas'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Кўча va Уй:</span>
                    <span className="font-medium text-slate-800">{currentSub.street || ''} {currentSub.houseNumber ? `${currentSub.houseNumber}-uy` : ''} {currentSub.flatNumber ? `${currentSub.flatNumber}-xonadon` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Индекс:</span>
                    <span className="font-mono text-slate-800">{currentSub.postalIndex || 'Mavjud emas'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Кадастр рақами:</span>
                    <span className="font-mono text-slate-800 text-[11px] truncate max-w-[200px]" title={currentSub.cadastreNumber}>
                      {currentSub.cadastreNumber || 'Mavjud emas'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Oila tarkibi va Aloqa */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Users className="h-4 w-4 text-purple-600" /> Oila tarkibi va Aloqa
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Яшовчилар сони:</span>
                    <strong className="font-extrabold text-emerald-700">{currentSub.residentsCount || 1} nafar</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ИИВ базасидаги сони:</span>
                    <strong className="text-slate-800">{currentSub.iivResidentsCount || 0} nafar</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Шахсий телефон:</span>
                    <strong className="font-mono text-slate-900">{currentSub.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Уй телефони:</span>
                    <span className="font-mono text-slate-700">{currentSub.homePhone || 'Mavjud emas'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Тизимга қўшилган вақти:</span>
                    <span className="text-slate-800 font-medium">{currentSub.registeredDate}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: To'lovlar va QQS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <CreditCard className="h-4 w-4 text-teal-600" /> To‘lovlar va QQS
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Оҳирги тўлов суммаси:</span>
                    <strong className="text-emerald-700 font-bold">
                      {currentSub.lastPaymentAmount ? `${currentSub.lastPaymentAmount.toLocaleString('uz-UZ')} so‘m` : '0 so‘m'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Оҳирги тўлов санаси:</span>
                    <span className="font-mono text-slate-800">{currentSub.lastPaymentDate || 'Mavjud emas'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ҚҚС сумма:</span>
                    <span className="font-mono text-slate-800">{currentSub.vatAmount ? `${currentSub.vatAmount} so‘m` : '0 so‘m'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Изоҳ / Шартнома:</span>
                    <span className="text-slate-700 italic text-[11px] truncate max-w-[200px]" title={currentSub.notes}>
                      {currentSub.notes || 'Оммавий шартнома асосида'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints and Ratings History */}
            {subComplaints.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-amber-500" /> Abonent Murojaatlari ({subComplaints.length})
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
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
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
