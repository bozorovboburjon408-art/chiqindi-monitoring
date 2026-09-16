import React, { useState } from 'react';
import { UserCog, Plus, Search, Shield, Phone, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { User, UserRole } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const FoydalanuvchilarModule: React.FC = () => {
  const [users, setUsers] = useState<User[]>(storageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '+998 ',
    role: 'DISPETCHER',
    active: true,
  });

  const refreshData = () => {
    setUsers(storageService.getUsers());
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchSearch && matchRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      role: (formData.role as UserRole) || 'DISPETCHER',
      active: true,
    };

    storageService.saveUser(newUser);
    refreshData();
    setIsModalOpen(false);
  };

  const roleBadges: Record<UserRole, { label: string; variant: any }> = {
    SUPER_ADMIN: { label: 'Super Admin', variant: 'purple' },
    RAHBARIYAT: { label: 'Rahbariyat', variant: 'info' },
    DISPETCHER: { label: 'Dispetcher', variant: 'success' },
    HUDUD_MASULI: { label: 'Hudud mas’uli', variant: 'warning' },
    BRIGADA_MASULI: { label: 'Brigada mas’uli', variant: 'default' },
    HAYDOVCHI: { label: 'Haydovchi', variant: 'default' },
    ABONENT: { label: 'Abonent', variant: 'slate' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Foydalanuvchilar va Rollar (RBAC)</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Tizim foydalanuvchilari, ruxsatlar va lavozimlar nazorati
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '+998 ',
              role: 'DISPETCHER',
              active: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
        >
          <Plus className="h-4 w-4" /> Yangi foydalanuvchi
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Ism, email yoki telefon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="ALL">Barcha rollar ({users.length})</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="RAHBARIYAT">RAHBARIYAT</option>
            <option value="DISPETCHER">DISPETCHER</option>
            <option value="HUDUD_MASULI">HUDUD_MASULI</option>
            <option value="BRIGADA_MASULI">BRIGADA_MASULI</option>
            <option value="HAYDOVCHI">HAYDOVCHI</option>
            <option value="ABONENT">ABONENT</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3.5">Foydalanuvchi</th>
                <th className="px-4 py-3.5">Lavozim / Rol</th>
                <th className="px-4 py-3.5">Aloqa</th>
                <th className="px-4 py-3.5">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-200">
                        {u.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleBadges[u.role]?.variant || 'default'}>
                      {roleBadges[u.role]?.label || u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{u.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Faol
                    </span>
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
        title="Yangi foydalanuvchi ro‘yxatdan o‘tkazish"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">To‘liq ism *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200"
              placeholder="Ism Familiya"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
                placeholder="user@ecocontrol.uz"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefon *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
                placeholder="+998 90 123 45 67"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Foydalanuvchi roli *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN — Barcha huquqlar</option>
              <option value="RAHBARIYAT">RAHBARIYAT — Analitika va hisobotlar</option>
              <option value="DISPETCHER">DISPETCHER — GPS, marshrut va murojaatlar</option>
              <option value="HUDUD_MASULI">HUDUD_MASULI — Tuman inspektori</option>
              <option value="BRIGADA_MASULI">BRIGADA_MASULI — Haydovchilar brigadasi</option>
              <option value="HAYDOVCHI">HAYDOVCHI — Maxsus texnika haydovchisi</option>
              <option value="ABONENT">ABONENT — Fuqaro</option>
            </select>
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
              Qo‘shish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
