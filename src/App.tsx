import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardModule } from './modules/Dashboard/DashboardModule';
import { AbonentlarModule } from './modules/Abonentlar/AbonentlarModule';
import { XonadonlarModule } from './modules/Xonadonlar/XonadonlarModule';
import { HududlarModule } from './modules/Hududlar/HududlarModule';
import { MurojaatlarModule } from './modules/Murojaatlar/MurojaatlarModule';
import { GPSMonitoringModule } from './modules/GPSMonitoring/GPSMonitoringModule';
import { MarshrutlarModule } from './modules/Marshrutlar/MarshrutlarModule';
import { MaxsusTexnikalarModule } from './modules/MaxsusTexnikalar/MaxsusTexnikalarModule';
import { CHYMMonitoringModule } from './modules/CHYMMonitoring/CHYMMonitoringModule';
import { KonteynerlarModule } from './modules/Konteynerlar/KonteynerlarModule';
import { BildirishnomalarModule } from './modules/Bildirishnomalar/BildirishnomalarModule';
import { XizmatSifatiModule } from './modules/XizmatSifati/XizmatSifatiModule';
import { HisobotlarModule } from './modules/Hisobotlar/HisobotlarModule';
import { FoydalanuvchilarModule } from './modules/Foydalanuvchilar/FoydalanuvchilarModule';
import { SozlamalarModule } from './modules/Sozlamalar/SozlamalarModule';
import { HaydovchiInterface } from './modules/Haydovchi/HaydovchiInterface';
import { AbonentInterface } from './modules/Abonent/AbonentInterface';
import { storageService } from './services/storageService';
import { simulatorService } from './services/simulatorService';
import { AIAssistantModal } from './components/common/AIAssistantModal';
import { UserRole, Subscriber } from './types';
import {
  LayoutDashboard,
  Navigation,
  MessageSquareWarning,
  Trash2,
  Users,
  Bot,
  Sparkles,
} from 'lucide-react';

export function App() {
  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>(storageService.getCurrentRole());
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);

  // Initialize storage & auto-start simulator for smooth live demo
  useEffect(() => {
    storageService.initializeData();
    simulatorService.start();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAIOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const unsub = storageService.subscribe(() => {
      const role = storageService.getCurrentRole();
      setCurrentRole(role);
      // Auto-redirect if Super Admin attempts to view routes or vehicles
      if (role === 'SUPER_ADMIN' && (currentModule === 'routes' || currentModule === 'vehicles')) {
        setCurrentModule('dashboard');
      }
    });

    return () => {
      simulatorService.stop();
      window.removeEventListener('keydown', handleKeyDown);
      unsub();
    };
  }, [currentModule]);

  const handleNavigate = (module: string) => {
    // Role protection: Super Admin cannot navigate to routes or vehicles
    if (currentRole === 'SUPER_ADMIN' && (module === 'routes' || module === 'vehicles')) {
      setCurrentModule('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Role protection: Dispetcher cannot navigate to users or settings
    if (currentRole === 'DISPETCHER' && (module === 'users' || module === 'settings')) {
      setCurrentModule('routes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentModule(module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderModule = () => {
    // Role protection for SUPER_ADMIN
    if (currentRole === 'SUPER_ADMIN' && (currentModule === 'routes' || currentModule === 'vehicles')) {
      return <DashboardModule onNavigate={handleNavigate} />;
    }
    // Role protection for DISPETCHER
    if (currentRole === 'DISPETCHER' && (currentModule === 'users' || currentModule === 'settings')) {
      return <MarshrutlarModule />;
    }

    switch (currentModule) {
      case 'dashboard':
        return <DashboardModule onNavigate={handleNavigate} />;
      case 'subscribers':
        return <AbonentlarModule />;
      case 'households':
        return <XonadonlarModule onNavigate={handleNavigate} />;
      case 'regions':
        return <HududlarModule />;
      case 'complaints':
        return <MurojaatlarModule />;
      case 'gps':
        return <GPSMonitoringModule />;
      case 'routes':
        return <MarshrutlarModule />;
      case 'vehicles':
        return <MaxsusTexnikalarModule />;
      case 'chym':
        return <CHYMMonitoringModule />;
      case 'containers':
        return <KonteynerlarModule />;
      case 'notifications':
        return <BildirishnomalarModule onNavigate={handleNavigate} />;
      case 'ratings':
        return <XizmatSifatiModule />;
      case 'reports':
        return <HisobotlarModule />;
      case 'users':
        return <FoydalanuvchilarModule />;
      case 'settings':
        return <SozlamalarModule />;
      case 'haydovchi':
        return <HaydovchiInterface />;
      case 'abonent_portal':
        return <AbonentInterface />;
      default:
        return <DashboardModule onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          currentModule={currentModule}
          onNavigate={handleNavigate}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          sidebarOpen={mobileSidebarOpen}
          onOpenAIAssistant={() => setIsAIOpen(true)}
        />

        {/* Page Body */}
        <main
          className={`flex-1 w-full pb-24 lg:pb-12 ${
            currentModule === 'gps'
              ? 'p-2 md:p-4 max-w-[1920px] mx-auto'
              : 'p-4 md:p-6 lg:p-8 max-w-7xl mx-auto'
          }`}
        >
          {renderModule()}
        </main>

        {/* Global Floating AI Assistant Trigger Button */}
        <button
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border border-emerald-400/40 group animate-in fade-in slide-in-from-bottom-5"
          title="AI Operator Asistenti (Ctrl + K)"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="h-5 w-5 text-white group-hover:rotate-12 transition-transform" />
            <Sparkles className="h-3 w-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="tracking-wide">AI Operator</span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/25 text-emerald-200">
            Ctrl+K
          </span>
        </button>

        {/* Global Gemini AI Assistant Modal */}
        <AIAssistantModal
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          onNavigate={handleNavigate}
        />

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex lg:hidden h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 justify-around items-center px-2">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 ${
              currentModule === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigate('gps')}
            className={`flex flex-col items-center gap-1 ${
              currentModule === 'gps' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <Navigation className="h-4.5 w-4.5" />
            <span className="text-[10px]">GPS</span>
          </button>

          <button
            onClick={() => handleNavigate('containers')}
            className={`flex flex-col items-center gap-1 ${
              currentModule === 'containers' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <Trash2 className="h-4.5 w-4.5" />
            <span className="text-[10px]">Konteyner</span>
          </button>

          <button
            onClick={() => handleNavigate('complaints')}
            className={`flex flex-col items-center gap-1 ${
              currentModule === 'complaints' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <MessageSquareWarning className="h-4.5 w-4.5" />
            <span className="text-[10px]">Murojaat</span>
          </button>

          <button
            onClick={() => handleNavigate('subscribers')}
            className={`flex flex-col items-center gap-1 ${
              currentModule === 'subscribers' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span className="text-[10px]">Abonent</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;
