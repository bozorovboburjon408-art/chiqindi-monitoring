import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ExternalLink,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Trash2,
  Search,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { geminiService, AIMessage, AIAction } from '../../services/geminiService';
import { Subscriber, HousePolygon, Vehicle } from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from './Badge';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
  onSelectSubscriber?: (sub: Subscriber) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectSubscriber,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Salom! Men **TozaHududDM AI Operatoriman** (Google Gemini bilan ishlayman).\n\nSiz menga istalgan abonent ismi (masalan, **"Abdullayev Komiljon"**), xonadon raqami, maxsus texnika holati yoki qarzdorlar bo‘yicha buyruq berishingiz mumkin. Men darhol topib, kerakli akkauntni ochib beraman!`,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSubForModal, setSelectedSubForModal] = useState<Subscriber | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    { label: '👤 Abdullayev Komiljon hisobini och', text: 'Abdullayev Komiljonning akkauntini och' },
    { label: '🔴 Qarzdor abonentlar kimlar?', text: 'Qarzdor abonentlar ro‘yxatini ko‘rsat' },
    { label: '🚛 85 714 UZA mashinasi qayerda?', text: '85 714 UZA maxsus texnikasi hozir qayerda va qancha chiqindi yig‘di?' },
    { label: '🧹 Qiziltepada ko‘chalar holati', text: 'Qiziltepa tumanidagi ko‘chalar tozalanish holati qanday?' },
    { label: '📍 Rahimova Dilnoza xonadoni', text: 'Rahimova Dilnozaning xonadoni va ma’lumotlarini ko‘rsat' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice speech-to-text integration (Web Speech API)
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Kechirasiz, brauzeringizda ovozli qidiruv (Web Speech API) qo'llab-quvvatlanmaydi. Chrome yoki Edge dan foydalaning.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'uz-UZ';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query || isLoading) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-4).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.text }],
      }));

      const res = await geminiService.sendMessage(query, history);

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        actions: res.actions,
        dataPreview: res.dataPreview,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `Kechirasiz, so‘rovingizni qayta ishlashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.`,
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (action: AIAction) => {
    if (action.type === 'OPEN_SUBSCRIBER') {
      const sub = action.payload?.subscriber || storageService.getSubscribers().find(s => s.id === action.payload?.subscriberId || s.fullName.toLowerCase().includes((action.payload?.name || '').toLowerCase()));
      if (sub) {
        setSelectedSubForModal(sub);
        if (onSelectSubscriber) onSelectSubscriber(sub);
      } else {
        onNavigate('subscribers');
        onClose();
      }
    } else if (action.type === 'OPEN_HOUSE') {
      const houses = storageService.getHousePolygons();
      const h = action.payload?.house || houses.find(hp => hp.id === action.payload?.houseId || (action.payload?.subscriberName && hp.subscriberName?.toLowerCase().includes(action.payload.subscriberName.toLowerCase()))) || houses[0];
      if (h) {
        storageService.setFocusTarget({
          type: 'house',
          id: h.id,
          subscriberName: h.subscriberName,
          houseNumber: h.houseNumber,
          coords: h.center,
          polygon: h.latLngs,
          zoom: 19,
        });
      }
      onNavigate('gps');
      onClose();
    } else if (action.type === 'OPEN_VEHICLE') {
      const vehicles = storageService.getVehicles();
      const v = action.payload?.vehicle || vehicles.find(veh => veh.id === action.payload?.vehicleId || (action.payload?.plate && veh.plateNumber.replace(/\s+/g, '').includes(action.payload.plate.replace(/\s+/g, '')))) || vehicles[0];
      if (v) {
        storageService.setFocusTarget({
          type: 'vehicle',
          id: v.id,
          plate: v.plateNumber,
          coords: [v.lat, v.lng],
          zoom: 18,
        });
      }
      onNavigate('gps');
      onClose();
    } else if (action.type === 'NAVIGATE') {
      onNavigate(action.payload?.module || 'dashboard');
      onClose();
    } else if (action.type === 'FILTER_DEBTORS') {
      onNavigate('subscribers');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
          isExpanded
            ? 'w-full h-full max-w-5xl max-h-[92vh]'
            : 'w-full max-w-2xl h-[650px] max-h-[90vh]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-lg shadow-emerald-500/20">
              <Bot className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">TozaHududDM AI Operator</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Gemini Flash Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Abonent qidiruvi, xonadonlar va GPS logistika asistenti</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Kichraytirish' : 'Kengaytirish'}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Yopish"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-400" /> Tezkor:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.text)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/50 whitespace-nowrap transition-all cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950">
          {messages.map((msg) => {
            const isAI = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 ${
                    isAI
                      ? 'bg-slate-800/90 text-slate-200 border border-slate-700/70 shadow-sm'
                      : 'bg-emerald-600 text-white shadow-md rounded-tr-xs'
                  }`}
                >
                  {/* Text content with simple markdown rendering */}
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px]">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('• ') || line.startsWith('- ')) {
                        return (
                          <div key={lIdx} className="flex items-start gap-1.5 py-0.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{line.replace(/^[•-]\s*/, '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <strong key={lIdx} className="text-white block mt-1">{line.replace(/\*\*/g, '')}</strong>;
                      }
                      return <p key={lIdx} className={line === '' ? 'h-2' : ''}>{line}</p>;
                    })}
                  </div>

                  {/* Interactive Subscriber Preview Card */}
                  {msg.dataPreview?.subscriber && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-900/95 border border-emerald-500/30 shadow-md text-slate-200 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Abonent profili</span>
                          <h4 className="text-sm font-bold text-white">{msg.dataPreview.subscriber.fullName}</h4>
                          <p className="text-[11px] text-slate-400">{msg.dataPreview.subscriber.address}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            msg.dataPreview.subscriber.balance >= 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {msg.dataPreview.subscriber.balance >= 0
                            ? `+${msg.dataPreview.subscriber.balance.toLocaleString('uz-UZ')} so'm`
                            : `${msg.dataPreview.subscriber.balance.toLocaleString('uz-UZ')} so'm (Qarzdor)`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-500">Telefon:</span>
                          <div className="font-semibold text-slate-300">{msg.dataPreview.subscriber.phone}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Abonent kodi:</span>
                          <div className="font-mono font-bold text-cyan-400">{msg.dataPreview.subscriber.code}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2">
                        <button
                          onClick={() => handleExecuteAction({ type: 'OPEN_SUBSCRIBER', payload: { subscriber: msg.dataPreview?.subscriber } })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Akkauntni to‘liq ochish
                        </button>
                        <a
                          href={`tel:${msg.dataPreview.subscriber.phone}`}
                          className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-[11px] transition-all"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-400" />
                          Bog‘lanish
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Interactive Vehicle Preview Card */}
                  {msg.dataPreview?.vehicle && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-900/95 border border-cyan-500/30 shadow-md text-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Maxsus texnika</span>
                          <h4 className="text-sm font-mono font-bold text-white">{msg.dataPreview.vehicle.plateNumber}</h4>
                          <p className="text-[11px] text-slate-400">{msg.dataPreview.vehicle.model}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {msg.dataPreview.vehicle.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                        <div>
                          <span className="text-slate-500">Haydovchi:</span>
                          <div className="font-semibold text-slate-300">{msg.dataPreview.vehicle.driverName || 'Biriktirilgan'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Bunker to‘lishi:</span>
                          <div className="font-bold text-amber-400">{msg.dataPreview.vehicle.cargoFillPercent || 68}% ({msg.dataPreview.vehicle.cargoWeightTons || 3.8} t)</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleExecuteAction({ type: 'OPEN_VEHICLE', payload: { plate: msg.dataPreview?.vehicle?.plateNumber } })}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Xaritada jonli kuzatish
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleExecuteAction(act)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all cursor-pointer hover:scale-[1.02]"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                          {act.label || `${act.type} bajarish`}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[9px] text-slate-500 text-right">{msg.timestamp}</div>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 text-xs flex items-center gap-2 border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-300 text-[11px] font-medium">Gemini ma'lumotlar bazasini tekshirmoqda...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Abonent ismi yoki buyruq yozing (masalan: Abdullayev Komiljon)..."
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={toggleVoice}
                className={`absolute right-2.5 top-2.5 p-1.5 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isListening ? "Ovoz yozilmoqda..." : "Ovozli qidiruv"}
              >
                {isListening ? <Mic className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
            <span>✨ Gemini 3.5 / Flash modeliga ulangan</span>
            <span>Mikrofon yoki klaviatura orqali boshqarish mumkin</span>
          </div>
        </div>
      </div>

      {/* Embedded Subscriber Profile View Modal */}
      {selectedSubForModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
                  {selectedSubForModal.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedSubForModal.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedSubForModal.code} • {selectedSubForModal.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubForModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400">Telefon raqam:</span>
                <div className="font-bold text-slate-800 mt-0.5">{selectedSubForModal.phone}</div>
              </div>
              <div>
                <span className="text-slate-400">Hisob holati:</span>
                <div className="mt-0.5">
                  <Badge variant={selectedSubForModal.status === 'Faol' ? 'success' : 'danger'}>
                    {selectedSubForModal.status}
                  </Badge>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Manzili:</span>
                <div className="font-bold text-slate-800 mt-0.5">{selectedSubForModal.address}</div>
              </div>
              <div>
                <span className="text-slate-400">Balans:</span>
                <div className={`text-sm font-black mt-0.5 ${selectedSubForModal.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedSubForModal.balance >= 0 ? `+${selectedSubForModal.balance.toLocaleString('uz-UZ')} so‘m` : `${selectedSubForModal.balance.toLocaleString('uz-UZ')} so‘m`}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Tizimga qo‘shilgan:</span>
                <div className="font-bold text-slate-800 mt-0.5">{selectedSubForModal.registeredDate || '2024-01-15'}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedSubForModal(null);
                  onNavigate('gps');
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <MapPin className="h-4 w-4" />
                Xaritada ko‘rish
              </button>
              <button
                onClick={() => {
                  setSelectedSubForModal(null);
                  onNavigate('subscribers');
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                Abonentlar bo‘limi
              </button>
              <a
                href={`tel:${selectedSubForModal.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-700 font-bold text-xs transition-all"
              >
                <Phone className="h-4 w-4" />
                Qo‘ng‘iroq
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
