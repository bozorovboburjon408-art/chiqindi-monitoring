import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Home,
  MapPin,
  MessageSquareWarning,
  Navigation,
  Route as RouteIcon,
  Truck,
  Video,
  Trash2,
  Bell,
  Star,
  FileBarChart,
  UserCog,
  Settings,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Recycle,
  UserCheck,
  Shield,
  Bot,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserRole } from '../../types';

interface SidebarProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: 'rose' | 'amber';
  pulse?: boolean;
  allowedRoles?: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(storageService.getCurrentRole());

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setCurrentRole(storageService.getCurrentRole());
    });
    return unsub;
  }, []);

  const complaints = storageService.getComplaints();
  const openComplaintsCount = complaints.filter((c) => c.status === 'Yangi').length;

  const containers = storageService.getContainers();
  const fullContainersCount = containers.filter((c) => c.fillLevel >= 80).length;

  const navigationItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai_assistant', label: 'AI yordamchi', icon: Bot, pulse: true },
    { id: 'subscribers', label: 'Abonentlar', icon: Users },
    { id: 'households', label: 'Xonadonlar', icon: Home },
    { id: 'regions', label: 'Hududlar', icon: MapPin },
    {
      id: 'complaints',
      label: 'Murojaatlar',
      icon: MessageSquareWarning,
      badge: openComplaintsCount > 0 ? openComplaintsCount : undefined,
      badgeVariant: 'rose' as const,
    },
    { id: 'gps', label: 'GPS Monitoring', icon: Navigation, pulse: true },
    {
      id: 'routes',
      label: 'Marshrutlar',
      icon: RouteIcon,
      allowedRoles: ['DISPETCHER', 'BRIGADA_MASULI'],
    },
    {
      id: 'vehicles',
      label: 'Maxsus texnikalar',
      icon: Truck,
      allowedRoles: ['DISPETCHER', 'BRIGADA_MASULI'],
    },
    { id: 'chym', label: 'ЧЙМ Monitoring', icon: Video },
    {
      id: 'containers',
      label: 'Konteynerlar',
      icon: Trash2,
      badge: fullContainersCount > 0 ? fullContainersCount : undefined,
      badgeVariant: 'amber' as const,
    },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
    { id: 'ratings', label: 'Xizmat sifati', icon: Star },
    { id: 'reports', label: 'Hisobotlar', icon: FileBarChart },
    {
      id: 'users',
      label: 'Foydalanuvchilar',
      icon: UserCog,
      allowedRoles: ['SUPER_ADMIN'],
    },
    {
      id: 'settings',
      label: 'Sozlamalar',
      icon: Settings,
      allowedRoles: ['SUPER_ADMIN'],
    },
  ];

  const visibleNavItems = navigationItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(currentRole)
  );

  const dedicatedPortals = [
    { id: 'haydovchi', label: 'Haydovchi mobil kabineti', icon: Smartphone, color: 'text-teal-600' },
    { id: 'abonent_portal', label: 'Abonent mobil portali', icon: UserCheck, color: 'text-emerald-600' },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <div
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            onClick={() => handleItemClick('dashboard')}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Recycle className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                  EcoControl<span className="text-emerald-600">.uz</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 leading-none">
                  Chiqindi Monitoring Tizimi
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title={collapsed ? 'Kengaytirish' : 'Yig‘ish'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Active Role Indicator Badge */}
        {!collapsed ? (
          <div className="mx-3 mt-2 mb-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rol:</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${
                currentRole === 'SUPER_ADMIN'
                  ? 'bg-purple-600'
                  : currentRole === 'DISPETCHER'
                  ? 'bg-emerald-600'
                  : 'bg-slate-700'
              }`}
            >
              {currentRole === 'SUPER_ADMIN'
                ? 'Super Admin'
                : currentRole === 'DISPETCHER'
                ? 'Dispetcher'
                : currentRole}
            </span>
          </div>
        ) : (
          <div className="flex justify-center my-1.5" title={`Joriy rol: ${currentRole}`}>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                currentRole === 'SUPER_ADMIN'
                  ? 'bg-purple-600'
                  : currentRole === 'DISPETCHER'
                  ? 'bg-emerald-600'
                  : 'bg-slate-500'
              }`}
            />
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            {!collapsed && 'Asosiy Boshqaruv'}
          </div>

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeVariant === 'rose'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              {!collapsed && 'Maxsus Portallar'}
            </div>
            {dedicatedPortals.map((portal) => {
              const Icon = portal.icon;
              const isActive = currentModule === portal.id;
              return (
                <button
                  key={portal.id}
                  onClick={() => handleItemClick(portal.id)}
                  title={collapsed ? portal.label : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:bg-emerald-50/60 hover:text-emerald-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${portal.color}`} />
                  {!collapsed && <span className="truncate">{portal.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        {!collapsed && (
          <div className="border-t border-slate-100 p-3 bg-slate-50/60">
            <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-800">“Toza Hudud” DUK</div>
              <div className="text-[10px] text-slate-500">Navoiy viloyati boshqarmasi</div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>v2.4.0 Live</span>
                <span className="text-emerald-600 font-semibold">ONLINE</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
