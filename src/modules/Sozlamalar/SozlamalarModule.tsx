import React, { useState } from 'react';
import {
  Settings,
  Building,
  Radio,
  Send,
  Video,
  MessageSquare,
  Download,
  RotateCcw,
  CheckCircle,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { storageService } from '../../services/storageService';

export const SozlamalarModule: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(storageService.getSettings());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSaveToast('Tizim sozlamalari muvaffaqiyatli saqlandi!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleBackupExport = () => {
    const jsonStr = storageService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoControl_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetDemoData = () => {
    if (
      confirm(
        'Diqqat! Barcha ma’lumotlar dastlabki O‘zbekiston demo ma’lumotlariga (100+ abonent, 50+ konteyner, marshrutlar) qaytariladi. Davom ettirasizmi?'
      )
    ) {
      storageService.initializeData(true);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900">Tizim Sozlamalari va Integratsiyalar</h1>
        <p className="text-xs md:text-sm text-slate-500">
          Korxona parametrlari, telemetriya shlyuzlari, Telegram bot va API kalitlari
        </p>
      </div>

      {saveToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle className="h-5 w-5" /> {saveToast}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Org Info */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Tashkilot Ma’lumotlari</h3>
              <p className="text-xs text-slate-400">Rasmiy rekvizitlar va ishonch telefoni</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tashkilot nomi *</label>
              <input
                type="text"
                required
                value={settings.orgName}
                onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Call-markaz / Ishonch telefoni *</label>
              <input
                type="text"
                required
                value={settings.hotline}
                onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:border-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Integrations */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Real API va Telemetriya Shlyuzlari</h3>
              <p className="text-xs text-slate-400">GPS, Telegram, RTSP kameralar va SMS servislarini ulash arxitekturasi</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-600" /> GPS Telemetry REST / WebSocket Endpoint
              </label>
              <input
                type="text"
                value={settings.gpsApiEndpoint}
                onChange={(e) => setSettings({ ...settings, gpsApiEndpoint: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-teal-600" /> Telegram Bot Token
                </label>
                <input
                  type="password"
                  value={settings.telegramBotToken}
                  onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telegram Kanal / Guruh ID</label>
                <input
                  type="text"
                  value={settings.telegramChatId}
                  onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-purple-600" /> RTSP / HLS Video Stream Gateway
                </label>
                <input
                  type="text"
                  value={settings.rtspGatewayUrl}
                  onChange={(e) => setSettings({ ...settings, rtspGatewayUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-600" /> SMS Provider API URL
                </label>
                <input
                  type="text"
                  value={settings.smsApiUrl}
                  onChange={(e) => setSettings({ ...settings, smsApiUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              <Save className="h-4 w-4" /> Sozlamalarni saqlash
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Backup and Reset */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Ma’lumotlar Zaxirasi va Qayta Tiklash</h3>
            <p className="text-xs text-slate-400">Tizim holatini saqlash yoki demo rejimini yangilash</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-bold text-slate-900">Baza zaxira nusxasini yuklab olish</div>
            <div className="text-slate-400 text-[11px]">Barcha abonentlar, texnikalar va murojaatlar JSON formatda</div>
          </div>
          <button
            onClick={handleBackupExport}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 shadow-2xs shrink-0"
          >
            <Download className="h-4 w-4 text-emerald-600" /> JSON Backup Eksport
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-bold text-rose-700">Dastlabki Demo Ma’lumotlarni Qayta Tiklash</div>
            <div className="text-slate-400 text-[11px]">100+ abonent, 50+ konteyner va O‘zbekiston kontekstidagi barcha ma’lumotlarni asl holiga qaytaradi</div>
          </div>
          <button
            onClick={handleResetDemoData}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl font-bold text-rose-700 hover:bg-rose-100 shadow-2xs shrink-0"
          >
            <RotateCcw className="h-4 w-4 text-rose-600" /> Qayta tiklash (Reset Demo)
          </button>
        </div>
      </div>
    </div>
  );
};
