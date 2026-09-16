import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Smartphone,
  MessageSquare,
  Send,
  Trash2,
  Settings,
  Check,
} from 'lucide-react';
import { AppNotification } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../../components/common/Badge';

interface BildirishnomalarProps {
  onNavigate?: (module: string) => void;
}

export const BildirishnomalarModule: React.FC<BildirishnomalarProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(storageService.getNotifications());
  const [filterType, setFilterType] = useState<string>('ALL');

  // Channels state (Mock testing)
  const [channelWeb, setChannelWeb] = useState(true);
  const [channelPush, setChannelPush] = useState(true);
  const [channelTelegram, setChannelTelegram] = useState(true);
  const [channelSms, setChannelSms] = useState(false);
  const [channelStatusMsg, setChannelStatusMsg] = useState<string | null>(null);

  const refreshData = () => {
    setNotifications(storageService.getNotifications());
  };

  const handleMarkAsRead = (id: string) => {
    storageService.markNotificationAsRead(id);
    refreshData();
  };

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsAsRead();
    refreshData();
  };

  const handleTestSendAlert = (channel: string) => {
    setChannelStatusMsg(`${channel} orqali test xabarnomasi muvaffaqiyatli simulyatsiya qilindi!`);
    setTimeout(() => setChannelStatusMsg(null), 3000);
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.isRead;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Bildirishnomalar Markazi</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Kritik ogohlantirishlar, tizim signallari va aloqa kanallari integratsiyasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs"
          >
            <Check className="h-4 w-4 text-emerald-600" /> Barchasini o‘qilgan deb belgilash
          </button>
        </div>
      </div>

      {/* Multi-channel Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-600" /> Web Notification
              </span>
              <input
                type="checkbox"
                checked={channelWeb}
                onChange={(e) => setChannelWeb(e.target.checked)}
                className="rounded text-emerald-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Brauzer bildirishnomalari va header signallari
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-bold">Faol</span>
            <button
              onClick={() => handleTestSendAlert('Web')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Test signal
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600" /> Push Notification
              </span>
              <input
                type="checkbox"
                checked={channelPush}
                onChange={(e) => setChannelPush(e.target.checked)}
                className="rounded text-blue-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Haydovchi va xodimlar mobil qurilmalariga push xabar
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-blue-600 font-bold">FCM / Apple APNS</span>
            <button
              onClick={() => handleTestSendAlert('Push')}
              className="text-blue-700 hover:underline font-semibold"
            >
              Test signal
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Send className="h-4 w-4 text-teal-600" /> Telegram Bot
              </span>
              <input
                type="checkbox"
                checked={channelTelegram}
                onChange={(e) => setChannelTelegram(e.target.checked)}
                className="rounded text-teal-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              @ecocontrol_uz_alerts guruhiga favqulodda xabarlar
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-teal-600 font-bold">Bot API Ulangan</span>
            <button
              onClick={() => handleTestSendAlert('Telegram')}
              className="text-teal-700 hover:underline font-semibold"
            >
              Test yuborish
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" /> SMS Shlyuz
              </span>
              <input
                type="checkbox"
                checked={channelSms}
                onChange={(e) => setChannelSms(e.target.checked)}
                className="rounded text-purple-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Abonentlarga SMS orqali javob va xabarnoma
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-purple-600 font-bold">Eskiz.uz Gateway</span>
            <button
              onClick={() => handleTestSendAlert('SMS')}
              className="text-purple-700 hover:underline font-semibold"
            >
              Test SMS
            </button>
          </div>
        </div>
      </div>

      {channelStatusMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" /> {channelStatusMsg}
        </div>
      )}

      {/* Notifications Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'Barcha bildirishnomalar' },
          { id: 'UNREAD', label: 'O‘qilmaganlar' },
          { id: 'container_full', label: 'Konteyner signallari' },
          { id: 'route_failed', label: 'Marshrut muammolari' },
          { id: 'vehicle_offline', label: 'Texnika offline' },
          { id: 'new_complaint', label: 'Yangi murojaatlar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Ushbu toifada yangi bildirishnomalar mavjud emas.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                n.isRead ? 'bg-white opacity-75' : 'bg-emerald-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
                    n.level === 'danger'
                      ? 'bg-rose-600'
                      : n.level === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                >
                  {n.level === 'danger' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <span className="text-[11px] text-slate-400 mt-1 inline-block">
                    {n.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100"
                    title="O‘qilgan deb belgilash"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {n.linkModule && onNavigate && (
                  <button
                    onClick={() => onNavigate(n.linkModule!)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                  >
                    Ko‘rish
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
