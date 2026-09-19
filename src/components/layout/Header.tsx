import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Menu,
  Play,
  Pause,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  CheckCircle,
  ExternalLink,
  Shield,
  Database,
  Building2,
  Check,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';
import { storageService } from '../../services/storageService';
import { simulatorService } from '../../services/simulatorService';
import { Badge } from '../common/Badge';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenAIAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onNavigate,
  onToggleSidebar,
  onOpenAIAssistant,
}) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(storageService.getCurrentRole());
  const [currentUser, setCurrentUser] = useState(storageService.getCurrentUser());
  const [notifications, setNotifications] = useState(storageService.getNotifications());
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isSimRunning, setIsSimRunning] = useState(simulatorService.getStatus());
  const [selectedRegionId, setSelectedRegionId] = useState<string>(storageService.getSelectedRegion());
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  const regions = storageService.getRegions();
  const activeRegion = regions.find((r) => r.id === selectedRegionId);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setCurrentRole(storageService.getCurrentRole());
      setCurrentUser(storageService.getCurrentUser());
      setNotifications(storageService.getNotifications());
      setIsSimRunning(simulatorService.getStatus());
      setSelectedRegionId(storageService.getSelectedRegion());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    storageService.setCurrentRole(role);
    setRoleMenuOpen(false);
    if (role === 'HAYDOVCHI') {
      onNavigate('haydovchi');
    } else if (role === 'ABONENT') {
      onNavigate('abonent_portal');
    } else if (role === 'DISPETCHER') {
      // If coming from admin-only pages or driver/portal, redirect to routes
      if (
        currentModule === 'users' ||
        currentModule === 'settings' ||
        currentModule === 'haydovchi' ||
        currentModule === 'abonent_portal'
      ) {
        onNavigate('routes');
      }
    } else if (role === 'SUPER_ADMIN') {
      // If currently on routes or vehicles (which are hidden from super admin), redirect to dashboard
      if (
        currentModule === 'routes' ||
        currentModule === 'vehicles' ||
        currentModule === 'haydovchi' ||
        currentModule === 'abonent_portal'
      ) {
        onNavigate('dashboard');
      }
    } else {
      if (currentModule === 'haydovchi' || currentModule === 'abonent_portal') {
        onNavigate('dashboard');
      }
    }
  };

  const handleToggleSim = () => {
    const nextState = simulatorService.toggle();
    setIsSimRunning(nextState);
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Critical counts
  const containers = storageService.getContainers();
  const criticalContainers = containers.filter((c) => c.fillLevel === 100);

  const roleLabels: Record<UserRole, { label: string; color: string; desc: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-600', desc: 'Tizim ma’muri (Abonent, hudud, hisobot, sozlamalar)' },
    RAHBARIYAT: { label: 'Rahbariyat', color: 'bg-blue-600', desc: 'Analitika va hisobotlar' },
    DISPETCHER: { label: 'Dispetcher / Operator', color: 'bg-emerald-600', desc: 'Marshrutlar, maxsus texnikalar & GPS logistika' },
    HUDUD_MASULI: { label: 'Hudud mas’uli', color: 'bg-amber-600', desc: 'Tuman nazorati' },
    BRIGADA_MASULI: { label: 'Brigada mas’uli', color: 'bg-indigo-600', desc: 'Texnikalar nazorati' },
    HAYDOVCHI: { label: 'Haydovchi', color: 'bg-teal-600', desc: 'Mobil marshrut kabineti' },
    ABONENT: { label: 'Abonent (Aholi)', color: 'bg-emerald-500', desc: 'Aholi portali' },
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          title="Menyu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Tizim holati: Faol
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-700 capitalize">
            {currentModule.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Center: Tozamakon Enterprise Branch Switcher */}
      <div className="relative" ref={regionRef}>
        <button
          onClick={() => setRegionMenuOpen(!regionMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 transition-all text-left max-w-[200px] sm:max-w-xs md:max-w-sm shadow-2xs"
          title="Tozamakon korxona va filialni tanlash"
        >
          <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="truncate text-xs font-bold text-slate-800">
            {activeRegion ? (activeRegion.fullName || activeRegion.name) : 'Barcha filiallar (Tozamakon)'}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
        </button>

        {regionMenuOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Tozamakon.eco Korxona / Filiallar
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Operativ boshqaruv uchun filialni tanlang:
              </p>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  storageService.setSelectedRegion('all');
                  setRegionMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                  selectedRegionId === 'all'
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">
                  🏛️ Barcha filiallar (Tomdi, Uchquduq, Qiziltepa, Zarafshon)
                </div>
                {selectedRegionId === 'all' && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
              </button>

              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => {
                    storageService.setSelectedRegion(reg.id);
                    setRegionMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                    selectedRegionId === reg.id
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {reg.fullName || reg.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mas’ul: {reg.inspectorName} ({reg.inspectorPhone})
                    </div>
                  </div>
                  {selectedRegionId === reg.id && <Check className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* AI Operator Assistant Button */}
        {onOpenAIAssistant && (
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all cursor-pointer ring-1 ring-emerald-400/30"
            title="AI Operator Asistenti (Ctrl + K)"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">AI Operator</span>
            <span className="hidden xl:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-emerald-200">
              Ctrl+K
            </span>
          </button>
        )}

        {/* Database Status */}
        <button
          onClick={() => onNavigate('settings')}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isSupabaseConfigured()
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          title="Ma'lumotlar bazasi holati (Sozlamalarga o'tish)"
        >
          <Database className={`h-3.5 w-3.5 ${isSupabaseConfigured() ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>{isSupabaseConfigured() ? 'PostgreSQL: Ulandi' : 'Baza: Lokal'}</span>
        </button>

        {/* GPS Live Simulation Toggle */}
        <button
          onClick={handleToggleSim}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isSimRunning
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
          title={isSimRunning ? 'Simulyatsiyani to‘xtatish' : 'Jonli GPS simulyatsiyasini yoqish'}
        >
          {isSimRunning ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Pause className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Jonli GPS: Faol</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden md:inline">Jonli GPS: To‘xtatilgan</span>
            </>
          )}
        </button>

        {/* Emergency Alert indicator */}
        {criticalContainers.length > 0 && (
          <button
            onClick={() => onNavigate('containers')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 animate-pulse"
            title="To‘lgan konteynerlar mavjud!"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span className="hidden sm:inline">{criticalContainers.length} ta to‘lgan!</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Bildirishnomalar"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">Bildirishnomalar</span>
                  <Badge variant="danger" size="sm">
                    {unreadNotifs.length} yangi
                  </Badge>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={() => storageService.markAllNotificationsAsRead()}
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" /> Hammasini o‘qish
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      storageService.markNotificationAsRead(n.id);
                      if (n.linkModule) onNavigate(n.linkModule);
                      setNotifOpen(false);
                    }}
                    className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                      n.isRead ? 'hover:bg-slate-50 opacity-75' : 'bg-emerald-50/40 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  Barcha bildirishnomalarni ko‘rish <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Menu */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1.5 hover:bg-slate-100 transition-all text-left"
            title="Rolni almashtirish"
          >
            <div
              className={`h-7 w-7 rounded-lg text-white flex items-center justify-center font-bold text-xs ${roleLabels[currentRole].color}`}
            >
              <Shield className="h-3.5 w-3.5" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 line-clamp-1">
                {roleLabels[currentRole].label}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {currentUser?.name || 'Foydalanuvchi'}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Rolni almashtirish (RBAC Demo)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Har qanday rol pozitsiyasidan tizimni sinab ko‘ring:
                </p>
              </div>

              <div className="space-y-1 max-h-80 overflow-y-auto">
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                      currentRole === role
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-6 w-6 rounded-md text-white flex items-center justify-center text-[10px] font-bold ${roleLabels[role].color}`}
                      >
                        {role.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{roleLabels[role].label}</div>
                        <div className="text-[10px] text-slate-400">{roleLabels[role].desc}</div>
                      </div>
                    </div>
                    {currentRole === role && <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
