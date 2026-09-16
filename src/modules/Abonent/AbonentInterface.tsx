import React, { useState } from 'react';
import {
  Home,
  PlusCircle,
  FileText,
  Star,
  Bell,
  User,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Calendar,
  Phone,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ServiceRating } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';

export const AbonentInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'new_complaint' | 'my_complaints' | 'rate' | 'profile'>('home');
  const [complaints, setComplaints] = useState<Complaint[]>(storageService.getComplaints());
  const [regions] = useState(storageService.getRegions());

  // Resident info
  const residentName = 'Madina Karimova';
  const residentPhone = '+998 90 321 00 11';
  const residentAddress = 'Chilonzor 7-mavze, 14-uy, 18-xonadon';

  // New Complaint Form
  const [category, setCategory] = useState<ComplaintCategory>('Chiqindi o‘z vaqtida olinmadi');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(residentAddress);
  const [photoSelected, setPhotoSelected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rate Form
  const [rateStar, setRateStar] = useState<number>(5);
  const [rateComment, setRateComment] = useState('');

  const refreshComplaints = () => {
    setComplaints(storageService.getComplaints());
  };

  const handleSendComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Iltimos, murojaat tavsifini yozing');
      return;
    }

    const newCmp: Complaint = {
      id: `cmp-resident-${Date.now()}`,
      code: `MUR-2026-${Math.floor(100 + Math.random() * 900)}`,
      subscriberId: 'sub-res-1',
      subscriberName: residentName,
      phone: residentPhone,
      address,
      regionId: 'reg-1',
      regionName: 'Chilonzor tumani',
      category,
      description,
      photoUrl: photoSelected
        ? 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'
        : undefined,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Yangi',
      priority: 'O‘rta',
    };

    storageService.saveComplaint(newCmp);
    refreshComplaints();
    setDescription('');
    setPhotoSelected(false);
    setToastMessage('Murojaatingiz muvaffaqiyatli qabul qilindi va dispetcherga yo‘naltirildi!');
    setActiveTab('my_complaints');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendRating = (e: React.FormEvent) => {
    e.preventDefault();
    const newRating: ServiceRating = {
      id: `rat-${Date.now()}`,
      subscriberId: 'sub-res-1',
      subscriberName: residentName,
      phone: residentPhone,
      rating: rateStar,
      comment: rateComment || 'Xizmat uchun rahmat!',
      tags: rateStar >= 4 ? ['Toza va ozoda', 'O‘z vaqtida'] : ['Kechikish bor'],
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      driverName: 'Jasur Rahimov',
    };

    storageService.saveRating(newRating);
    setRateComment('');
    setToastMessage('Baholashingiz uchun tashakkur! Xizmat sifatini yaxshilashga yordam berasiz.');
    setActiveTab('home');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // My complaints (matching resident or latest demo)
  const myComplaints = complaints.slice(0, 4);

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl font-bold">
              👤
            </div>
            <div>
              <div className="text-xs text-emerald-100 font-medium">EcoControl Aholi Portali</div>
              <h2 className="text-base font-extrabold">{residentName}</h2>
              <div className="text-[11px] text-emerald-100/90">{residentAddress}</div>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold text-center shadow-lg animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex items-center justify-around bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs text-xs font-bold">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'home' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Bosh sahifa
        </button>
        <button
          onClick={() => setActiveTab('new_complaint')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'new_complaint' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Ariza berish
        </button>
        <button
          onClick={() => setActiveTab('my_complaints')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'my_complaints' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Arizalarim
        </button>
        <button
          onClick={() => setActiveTab('rate')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'rate' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Baholash
        </button>
      </div>

      {/* Tab 1: Home View */}
      {activeTab === 'home' && (
        <div className="space-y-4">
          {/* Quick Schedule Card */}
          <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Sizning hudud bo‘yicha chiqindi jadvali
            </h3>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-emerald-900">Ertalabki reys</div>
                <div className="text-emerald-700 text-[11px]">Har kuni 07:00 – 08:30</div>
              </div>
              <span className="font-bold text-emerald-600 bg-white px-2.5 py-1 rounded-xl shadow-2xs">
                O‘z vaqtida
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Biriktirilgan maydoncha: <strong>ЧЙМ Chilonzor 7-mavze 14-uy oldi</strong>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('new_complaint')}
              className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-emerald-300 transition-all group"
            >
              <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div className="font-extrabold text-xs text-slate-900">Murojaat yuborish</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Chiqindi olinmaganmi?</div>
            </button>

            <button
              onClick={() => setActiveTab('rate')}
              className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-emerald-300 transition-all group"
            >
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                <Star className="h-5 w-5" />
              </div>
              <div className="font-extrabold text-xs text-slate-900">Xizmatni baholash</div>
              <div className="text-[10px] text-slate-400 mt-0.5">O‘z fikringizni bildiring</div>
            </button>
          </div>

          {/* Recent Complaint Status Card */}
          {myComplaints.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-xs">Oxirgi murojaat holati</h3>
                <span className="text-[11px] text-emerald-600 font-bold cursor-pointer" onClick={() => setActiveTab('my_complaints')}>
                  Barchasi
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">{myComplaints[0].category}</span>
                  <Badge variant={myComplaints[0].status === 'Bajarildi' ? 'success' : 'warning'}>
                    {myComplaints[0].status}
                  </Badge>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2">{myComplaints[0].description}</p>
                <div className="mt-2 text-[10px] text-slate-400">Yuborildi: {myComplaints[0].createdAt}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: New Complaint Form */}
      {activeTab === 'new_complaint' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Murojaat yoki Shikoyat Yuborish</h3>
            <p className="text-xs text-slate-500">
              Chiqindi olib ketilmaganligi yoki konteyner to‘lib ketganligi haqida xabar bering
            </p>
          </div>

          <form onSubmit={handleSendComplaint} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Murojaat toifasi *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 border rounded-2xl border-slate-200 bg-white font-medium"
              >
                <option value="Chiqindi o‘z vaqtida olinmadi">Chiqindi o‘z vaqtida olinmadi</option>
                <option value="Konteyner to‘lib ketgan">Konteyner to‘lib ketgan</option>
                <option value="Maydoncha ifloslangan">Maydoncha ifloslangan</option>
                <option value="Noqonuniy chiqindi to‘kish">Noqonuniy chiqindi to‘kish</option>
                <option value="Haydovchi / xodim qo‘polligi">Haydovchi / xodim qo‘polligi</option>
                <option value="Boshqa">Boshqa masalalar</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Manzilingiz *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-2xl border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Murojaat tavsifi *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Muammo haqida batafsil yozing..."
                className="w-full px-3 py-2.5 border rounded-2xl border-slate-200"
              />
            </div>

            {/* Photo Upload Simulation */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fotosurat biriktirish (Ixtiyoriy)</label>
              <button
                type="button"
                onClick={() => setPhotoSelected(!photoSelected)}
                className={`w-full py-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
                  photoSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 bg-slate-50 text-slate-500'
                }`}
              >
                <Camera className="h-6 w-6 mb-1" />
                <span className="font-bold text-xs">
                  {photoSelected ? '✓ Foto dalil biriktirildi' : 'Kamera yoki galereyadan rasm tanlash'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Send className="h-4 w-4" />
              Murojaatni jo‘natish
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: My Complaints */}
      {activeTab === 'my_complaints' && (
        <div className="space-y-3">
          <h3 className="text-base font-black text-slate-900 px-1">Mening Murojaatlarim ({myComplaints.length})</h3>

          {myComplaints.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">{c.code}</span>
                <Badge variant={c.status === 'Bajarildi' ? 'success' : 'warning'}>
                  {c.status}
                </Badge>
              </div>

              <div className="font-bold text-slate-800">{c.category}</div>
              <p className="text-slate-600 text-[11px]">{c.description}</p>

              {c.responseNotes && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-[11px]">
                  <strong>Dispetcher javobi:</strong> {c.responseNotes}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Yuborilgan: {c.createdAt}</span>
                {c.completedAt && <span className="text-emerald-600 font-bold">✓ Bajarildi: {c.completedAt}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Rate Service */}
      {activeTab === 'rate' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-slate-900">Xizmat Sifatini Baholash</h3>
            <p className="text-slate-500">
              So‘nggi chiqindi olib chiqish xizmati qanday bajarildi?
            </p>
          </div>

          <form onSubmit={handleSendRating} className="space-y-4">
            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-700 mb-2">Yulduzchani tanlang:</div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRateStar(s)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        s <= rateStar ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-black text-amber-600 mt-2">
                {rateStar === 5
                  ? 'A’lo darajada! (5/5)'
                  : rateStar === 4
                  ? 'Yaxshi (4/5)'
                  : rateStar === 3
                  ? 'Qoniqarli (3/5)'
                  : 'Yomon (Kamchiliklar bor)'}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Qo‘shimcha fikringiz:</label>
              <textarea
                rows={3}
                value={rateComment}
                onChange={(e) => setRateComment(e.target.value)}
                placeholder="Xodimlar muomalasi, tozalik darajasi haqida yozing..."
                className="w-full px-3 py-2.5 border rounded-2xl border-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/30"
            >
              Bahoni tasdiqlash
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
