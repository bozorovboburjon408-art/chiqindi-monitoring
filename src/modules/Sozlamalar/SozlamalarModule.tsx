import React, { useState, useEffect } from 'react';
import {
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
  Database,
  Cloud,
  CloudUpload,
  CloudDownload,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { storageService } from '../../services/storageService';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  resetSupabaseClient,
} from '../../lib/supabase';
import { supabaseSyncService } from '../../services/supabaseSyncService';

export const SozlamalarModule: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(storageService.getSettings());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Supabase state
  const [sbConfig, setSbConfig] = useState(getSupabaseConfig());
  const [isTestingSb, setIsTestingSb] = useState(false);
  const [sbStatus, setSbStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
  }>({
    tested: false,
    connected: isSupabaseConfigured(),
    message: isSupabaseConfigured()
      ? 'Supabase kalitlari sozlangan'
      : 'Baza ulanmagan (Hozirda lokal rejimda ishlamoqda)',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      handleTestSupabase();
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSaveToast('Tizim sozlamalari muvaffaqiyatli saqlandi!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleSaveSupabaseConfig = () => {
    saveSupabaseConfig(sbConfig.url, sbConfig.anonKey);
    resetSupabaseClient();
    setSaveToast('Supabase ma‘lumotlar bazasi parametrlari saqlandi!');
    setTimeout(() => setSaveToast(null), 3500);
    handleTestSupabase();
  };

  const handleTestSupabase = async () => {
    setIsTestingSb(true);
    const res = await supabaseSyncService.testConnection();
    setIsTestingSb(false);
    setSbStatus({
      tested: true,
      connected: res.success,
      message: res.message,
    });
  };

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    setSyncToast('Ma‘lumotlar Supabase PostgreSQL bazasiga yuklanmoqda...');
    const res = await supabaseSyncService.pushLocalDataToSupabase();
    setIsSyncing(false);
    setSyncToast(res.message);
    setTimeout(() => setSyncToast(null), 6000);
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    setSyncToast('Supabase bulutidan ma‘lumotlar yuklab olinmoqda...');
    const res = await supabaseSyncService.pullDataFromSupabase();
    setIsSyncing(false);
    setSyncToast(res.message);
    setTimeout(() => setSyncToast(null), 6000);
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
        'Diqqat! Barcha ma’lumotlar dastlabki O‘zbekiston demo ma’lumotlariga (Navoiy xonadonlari, 40 ta mashina, 300 ta maydoncha) qaytariladi. Davom ettirasizmi?'
      )
    ) {
      storageService.initializeData(true);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900">Tizim Sozlamalari va Integratsiyalar</h1>
        <p className="text-xs md:text-sm text-slate-500">
          Supabase (PostgreSQL + PostGIS) bazasi, telemetriya shlyuzlari, GPS va server sozlamalari
        </p>
      </div>

      {saveToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle className="h-5 w-5" /> {saveToast}
        </div>
      )}

      {syncToast && (
        <div className="p-4 bg-blue-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <Database className="h-5 w-5" /> {syncToast}
        </div>
      )}

      {/* SECTION 1: SUPABASE / POSTGRESQL CLOUD DATABASE */}
      <div className="rounded-3xl bg-white p-6 border-2 border-emerald-500/20 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Supabase (PostgreSQL + PostGIS) Baza</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    sbStatus.connected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      sbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {sbStatus.connected ? 'Baza Jonli Faol' : 'Lokal Demo Rejim'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                71 000 ta abonent, 40 ta texnika (GPS) va 300 ta maydoncha uchun bulutli ma'lumotlar bazasi
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto"
          >
            Supabase Dashboard <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Project URL (VITE_SUPABASE_URL) *
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={sbConfig.url}
              onChange={(e) => setSbConfig({ ...sbConfig, url: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-slate-700 focus:border-emerald-500 outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Supabase loyihangiz Settings -&gt; API bo‘limidan olinadi
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Anon Public API Key (VITE_SUPABASE_ANON_KEY) *
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={sbConfig.anonKey}
              onChange={(e) => setSbConfig({ ...sbConfig, anonKey: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-slate-700 focus:border-emerald-500 outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Foydalanuvchi va xarita o‘qishi uchun ochiq Anon kalit
            </p>
          </div>
        </div>

        {/* Status message */}
        <div
          className={`p-3 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            sbStatus.connected
              ? 'bg-emerald-50/80 text-emerald-800 border border-emerald-200'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {sbStatus.connected ? (
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
            )}
            <span className="font-semibold">{sbStatus.message}</span>
          </div>

          <button
            type="button"
            onClick={handleTestSupabase}
            disabled={isTestingSb || !sbConfig.url}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-slate-700 shrink-0 disabled:opacity-50"
          >
            {isTestingSb ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            Tekshirish
          </button>
        </div>

        {/* Database Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveSupabaseConfig}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-xs"
            >
              <Save className="h-3.5 w-3.5" /> Kalitlarni saqlash
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePushToCloud}
              disabled={isSyncing || !sbStatus.connected}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs shadow-emerald-600/20 disabled:opacity-50"
              title="Lokal xonadonlar va mashinalarni Supabase PostgreSQL bazasiga yuklash"
            >
              {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CloudUpload className="h-3.5 w-3.5" />}
              Baza jadvalini to‘ldirish (Push to Cloud)
            </button>

            <button
              type="button"
              onClick={handlePullFromCloud}
              disabled={isSyncing || !sbStatus.connected}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
              title="Supabase bulutidan ma'lumotlarni yuklab olish"
            >
              <CloudDownload className="h-3.5 w-3.5" /> Yangilash (Pull)
            </button>
          </div>
        </div>

        {/* Hint regarding SQL schema */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-[11px] text-slate-500 space-y-1">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <Cloud className="h-3.5 w-3.5 text-emerald-600" /> Baza jadvallarini bir martalik yaratish:
          </div>
          <p>
            Loyiha papkasidagi <code className="bg-white px-1.5 py-0.5 rounded border text-emerald-700 font-mono">supabase/schema.sql</code> faylini ochib, Supabase boshqaruv panelidagi <strong>SQL Editor</strong> ga nusxalab joylang va <strong>RUN</strong> tugmasini bosing. Barcha jadvallar, PostGIS indekslari va Realtime avtomatik yoqiladi!
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 2: Org Info */}
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

        {/* Section 3: Integrations */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Real API va Telemetriya Shlyuzlari</h3>
              <p className="text-xs text-slate-400">GPS, Telegram va 50 ta RTSP kameralar monitoring shlyuzi</p>
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
                  <Send className="h-3.5 w-3.5 text-teal-600" /> Telegram Bot Token (Maydoncha to'lganda xabar yuborish)
                </label>
                <input
                  type="password"
                  value={settings.telegramBotToken}
                  onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telegram Kanal / Dispecher Guruh ID</label>
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
                  <Video className="h-3.5 w-3.5 text-purple-600" /> 50 ta Kamera RTSP / HLS Stream Gateway
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
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> SMS Provider (O‘chirilgan / Bepul Telegram orqali)
                </label>
                <input
                  type="text"
                  disabled
                  value="SMS o‘chirilgan (Telegram Bot tekin alternatividan foydalanilmoqda)"
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              <Save className="h-4 w-4" /> Barcha sozlamalarni saqlash
            </button>
          </div>
        </div>
      </form>

      {/* Section 4: Backup and Reset */}
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
            <div className="text-slate-400 text-[11px]">Navoiy viloyati bo‘yicha 80+ xonadon, 40 ta texnika va barcha ko‘chalarni asl holiga qaytaradi</div>
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
