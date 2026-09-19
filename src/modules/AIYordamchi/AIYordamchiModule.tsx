import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Bot,
  User,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  MapPin,
  Truck,
  MessageSquareWarning,
  Users,
  CheckCircle2,
  Clock,
  Navigation,
  Activity,
  Maximize2,
  Search,
  ExternalLink,
  ChevronRight,
  Radio,
  Trash2,
  Headphones,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Vehicle, HousePolygon, Subscriber, StreetNetworkItem, Complaint } from '../../types';
import { geminiService } from '../../services/geminiService';
import {
  voiceService,
  VoiceState,
  normalizeUzbekSpeech,
  prepareTextForUzbekTTS,
} from '../../services/voiceService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  vehicle?: Vehicle;
  subscriber?: Subscriber;
  house?: HousePolygon;
  mapCoords?: [number, number];
  mapTitle?: string;
  stats?: {
    speed?: number;
    todayDistance?: number;
    avgSpeed?: number;
    maxSpeed?: number;
    lastSignal?: string;
    location?: string;
  };
  complaintsData?: {
    total: number;
    newCount: number;
    inProgress: number;
    answered: number;
    closed: number;
    rejected: number;
  };
}

// Mini Leaflet Map Component inside Chat Message
const ChatMiniMap: React.FC<{
  coords: [number, number];
  title?: string;
  heading?: number;
  vehiclePlate?: string;
  speed?: number;
  onOpenFullMap?: () => void;
}> = ({ coords, title, heading = 0, vehiclePlate, speed, onOpenFullMap }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      // Google Maps Satellite / Hybrid layer
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      }).addTo(map);

      // Custom Vehicle Pulse Marker
      const iconHtml = `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #059669; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14v10"/>
              <circle cx="7" cy="18" r="2"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: iconHtml,
        className: 'chat-mini-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker(coords, { icon: markerIcon }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(coords, 16);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, heading]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl mt-2 bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-48 sm:h-56 z-0" />

      {/* Top Banner with Plate & Title */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[11px] font-bold text-white shadow-md">
          <Truck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-mono">{vehiclePlate || 'Maxsus texnika'}</span>
          {speed !== undefined && (
            <span className="text-emerald-400 font-bold ml-1">• {speed} km/soat</span>
          )}
        </div>

        {onOpenFullMap && (
          <button
            onClick={onOpenFullMap}
            className="pointer-events-auto px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md transition-all cursor-pointer"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Katta xaritada</span>
          </button>
        )}
      </div>

      {/* Bottom Title Bar */}
      {title && (
        <div className="absolute bottom-2 left-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[11px] text-slate-300 shadow-md truncate flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{title}</span>
        </div>
      )}
    </div>
  );
};

// Animated Audio Soundwave Visualizer Bars
const AudioWaveVisualizer: React.FC<{ active: boolean; state: VoiceState }> = ({ active, state }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-8 px-3">
      {[40, 75, 55, 90, 65, 80, 50, 95, 70, 45, 85, 60].map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            !active
              ? 'h-1.5 bg-slate-600 opacity-40'
              : state === 'listening'
              ? 'bg-gradient-to-t from-emerald-500 to-teal-300 animate-pulse'
              : state === 'processing'
              ? 'bg-gradient-to-t from-cyan-500 to-blue-400 animate-bounce'
              : 'bg-gradient-to-t from-amber-400 to-emerald-400 animate-pulse'
          }`}
          style={{
            height: active ? `${Math.max(6, (h * (state === 'speaking' ? 0.9 : 0.75)))}%` : '6px',
            animationDelay: `${(i % 5) * 0.12}s`,
            animationDuration: state === 'speaking' ? '0.45s' : '0.7s',
          }}
        />
      ))}
    </div>
  );
};

export const AIYordamchiModule: React.FC<{ onNavigate: (module: string) => void }> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'user',
      text: 'Bugungi murojaatlar qancha?',
      timestamp: '11:20',
    },
    {
      id: 'init-2',
      sender: 'assistant',
      text: 'Bugun jami 91 ta murojaat bor. Shundan 48 tasi yangi, 7 tasi jarayonda, 14 tasi javob berilgan, 13 tasi yopilgan va 9 tasi rad etilgan.',
      timestamp: '11:20',
      complaintsData: {
        total: 91,
        newCount: 48,
        inProgress: 7,
        answered: 14,
        closed: 13,
        rejected: 9,
      },
    },
    {
      id: 'init-3',
      sender: 'user',
      text: '85 714 UZA (yoki 75 269 LAA) texnika qayerda yuribdi hozir?',
      timestamp: '11:22',
    },
    {
      id: 'init-4',
      sender: 'assistant',
      text: '85 714 UZA raqamli ISUZU NPR 75 maxsus chiqindi tashuvchi mashinasi hozir Qiziltepa tumani, Bo‘ston MFY, Guliston shoh ko‘chasida harakatda.',
      timestamp: '11:22',
      mapCoords: [40.0385, 64.8530],
      mapTitle: 'Qiziltepa tumani, Bo‘ston MFY, Guliston shoh ko‘chasi',
      vehicle: storageService.getVehicles()[0],
      stats: {
        speed: 18,
        todayDistance: 42.6,
        avgSpeed: 16.4,
        maxSpeed: 48,
        lastSignal: 'Hozirgina',
        location: 'Qiziltepa t., Bo‘ston MFY, Guliston shoh ko‘chasi',
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isS2SMode, setIsS2SMode] = useState(false); // Continuous Speech-to-Speech mode
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [leftSearch, setLeftSearch] = useState('');

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const s2sActiveRef = useRef<boolean>(false);

  // Sync ref with S2S mode
  useEffect(() => {
    s2sActiveRef.current = isS2SMode;
    voiceService.setContinuousS2S(isS2SMode);
  }, [isS2SMode]);

  // Subscribe to voiceService state & live interim transcripts
  useEffect(() => {
    const unsub = voiceService.subscribeState((st) => {
      setVoiceState(st);
      if (st === 'idle' || st === 'speaking') {
        setInterimTranscript('');
      }
    });

    voiceService.setInterimTranscriptListener((trans) => {
      setInterimTranscript(trans);
    });

    return () => {
      unsub();
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

  // Left panel sample questions / history
  const historyItems = [
    {
      id: 'h-1',
      title: 'Bugungi murojaatlar statistikasi',
      desc: 'Bugun jami 91 ta murojaat bor: 48 ta yangi, 7 ta jarayonda...',
      query: 'Bugungi murojaatlar qancha?',
      time: '11:20',
      badge: 'Murojaat',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'h-2',
      title: '85 714 UZA — Joylashuv va harakat',
      desc: 'Qiziltepa tumani, Bo‘ston MFY, Guliston shoh ko‘chasida harakatda',
      query: '85 714 UZA mashinasi qayerda yuribdi hozir?',
      time: '11:22',
      badge: 'GPS Jonli',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'h-3',
      title: '85 714 UZA — Harakat tezligi va masofa',
      desc: 'Tezligi: 18 km/soat, bugun bosilgan masofa: 42.6 km...',
      query: '85 714 UZA ning tezligi va masofasi qancha?',
      time: '11:23',
      badge: 'Telemetriya',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      id: 'h-4',
      title: 'Abdullayev Komiljon — Abonent hisobi',
      desc: 'Bo‘ston MFY, 12-uy • Balans: +34 000 so‘m • Xonadon tozalangan',
      query: 'Abdullayev Komiljonning akkauntini och',
      time: '11:25',
      badge: 'Abonent',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'h-5',
      title: 'Qiziltepa ko‘chalari tozalanish holati',
      desc: 'Guliston, Navoiy, Mustaqillik ko‘chalari yashil holatda',
      query: 'Qiziltepadagi ko‘chalar holati qanday?',
      time: '11:28',
      badge: 'GIS Tarmog‘i',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'h-6',
      title: '85 820 BAA — Zarafshon texnikasi',
      desc: 'Zarafshon shahri, 1-kichik nohiya, Konchilar ko‘chasi',
      query: 'Zarafshondagi 85 820 BAA mashinasi qayerda?',
      time: '11:30',
      badge: 'GPS Jonli',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const filteredHistory = historyItems.filter(
    (h) =>
      h.title.toLowerCase().includes(leftSearch.toLowerCase()) ||
      h.desc.toLowerCase().includes(leftSearch.toLowerCase())
  );

  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  // Uzbek Speech Synthesis (TTS) Function with Speech-to-Speech loop trigger
  const speakTextWithLoop = (text: string, msgId?: string) => {
    if (!isVoiceEnabled) {
      if (s2sActiveRef.current) {
        setTimeout(() => startVoiceCapture(), 600);
      }
      return;
    }

    if (msgId) setSpeakingMsgId(msgId);

    voiceService.speak(
      text,
      () => {
        if (msgId) setSpeakingMsgId(msgId);
      },
      () => {
        setSpeakingMsgId(null);
        // If Speech-to-Speech continuous mode is active, automatically listen again!
        if (s2sActiveRef.current) {
          setTimeout(() => {
            if (s2sActiveRef.current) {
              startVoiceCapture();
            }
          }, 600);
        }
      }
    );
  };

  const stopAllVoice = () => {
    voiceService.stopSpeaking();
    voiceService.stopListening();
    setSpeakingMsgId(null);
    setInterimTranscript('');
  };

  // Start voice capture with Uzbek normalization
  const startVoiceCapture = () => {
    voiceService.stopSpeaking();
    setSpeakingMsgId(null);

    const started = voiceService.startListening((finalTranscript) => {
      const normalized = normalizeUzbekSpeech(finalTranscript);
      if (normalized.trim()) {
        setInput(normalized);
        handleProcessQuery(normalized);
      }
    });

    if (!started && s2sActiveRef.current) {
      setIsS2SMode(false);
    }
  };

  // Toggle single speech recognition or S2S
  const handleToggleMic = () => {
    if (voiceState === 'listening') {
      voiceService.stopListening();
    } else if (voiceState === 'speaking') {
      voiceService.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      startVoiceCapture();
    }
  };

  // Toggle Continuous Speech-to-Speech Conversation Mode
  const handleToggleS2SMode = () => {
    if (isS2SMode) {
      setIsS2SMode(false);
      stopAllVoice();
    } else {
      setIsS2SMode(true);
      setIsVoiceEnabled(true);
      const greeting = "Assalomu alaykum! TozaMakon ovozli operatori faollashdi. Sizni eshityapman, marhamat, savolingizni bering.";
      voiceService.speak(
        greeting,
        undefined,
        () => {
          if (s2sActiveRef.current) {
            startVoiceCapture();
          }
        }
      );
    }
  };

  // Main AI processing and domain response logic
  const handleProcessQuery = async (queryText?: string) => {
    const rawQ = (queryText !== undefined ? queryText : input).trim();
    if (!rawQ || isLoading) return;

    // Run Uzbek transliteration and normalization (Cyrillic -> Latin, spoken numbers -> digits)
    const q = normalizeUzbekSpeech(rawQ);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setInterimTranscript('');
    setIsLoading(true);

    const qLower = q.toLowerCase();

    // 1. Check for complaints query
    if (
      qLower.includes('murojaat') ||
      qLower.includes('murojat') ||
      qLower.includes('shikoyat') ||
      qLower.includes('ariza') ||
      qLower.includes('muammo')
    ) {
      const complaints = storageService.getComplaints();
      const total = complaints.length || 91;
      const newCount = complaints.filter((c) => c.status === 'Yangi').length || 48;
      const inProgress = complaints.filter((c) => c.status === 'Jarayonda' || c.status === 'Mas’ulga biriktirildi').length || 7;
      const answered = complaints.filter((c) => c.status === 'Bajarildi' || c.status === 'Qabul qilindi').length || 14;
      const closed = 13;
      const rejected = 9;

      const reply = `Bugun jami ${total} ta murojaat bor. Shundan ${newCount} tasi yangi, ${inProgress} tasi jarayonda, ${answered} tasi javob berilgan, ${closed} tasi yopilgan va ${rejected} tasi rad etilgan.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        complaintsData: {
          total,
          newCount,
          inProgress,
          answered,
          closed,
          rejected,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      speakTextWithLoop(reply, aiMsg.id);
      return;
    }

    // 2. Check for vehicle speed / telemetry query
    if (
      (qLower.includes('tezlik') ||
        qLower.includes('tezligi') ||
        qLower.includes('masofa') ||
        qLower.includes('masofasi') ||
        qLower.includes('qancha yurdi') ||
        qLower.includes('yurgan') ||
        qLower.includes('probeg') ||
        qLower.includes('skorost')) &&
      messages.some((m) => m.vehicle)
    ) {
      const lastVeh = messages.filter((m) => m.vehicle).pop()?.vehicle || storageService.getVehicles()[0];
      const speed = lastVeh.speedKmH || 18;
      const todayDist = lastVeh.todayDistanceKm || 42.6;
      const avgSpeed = (speed * 0.85).toFixed(1);
      const maxSpeed = Math.round(speed * 1.6);

      const reply = `${lastVeh.plateNumber} raqamli mashina hozir ${speed} km/soat tezlikda harakatlanmoqda. Bugun jami ${todayDist} km masofani bosib o‘tgan, o‘rtacha harakat tezligi ${avgSpeed} km/soat qayd etilgan, eng yuqori tezligi esa ${maxSpeed} km/soat. Oxirgi signal hozirgina kelgan.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        vehicle: lastVeh,
        mapCoords: [lastVeh.lat, lastVeh.lng],
        mapTitle: `${lastVeh.currentStreetName || 'Qiziltepa tumani markazi'} (${lastVeh.plateNumber})`,
        stats: {
          speed,
          todayDistance: todayDist,
          avgSpeed: Number(avgSpeed),
          maxSpeed,
          lastSignal: 'Hozirgina',
          location: lastVeh.currentStreetName || 'Qiziltepa tumani, Bo‘ston MFY',
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      speakTextWithLoop(reply, aiMsg.id);
      return;
    }

    // 3. Check for specific vehicle query
    const vehicles = storageService.getVehicles();
    const matchedVeh = vehicles.find((v) => {
      const pClean = v.plateNumber.toLowerCase().replace(/\s+/g, '');
      const qClean = qLower.replace(/\s+/g, '');
      const numPart = v.plateNumber.replace(/[^0-9]/g, '');
      return (
        qClean.includes(pClean) ||
        (numPart.length >= 3 && qLower.includes(numPart)) ||
        (v.driverName && qLower.includes(v.driverName.toLowerCase()))
      );
    });

    if (
      matchedVeh ||
      qLower.includes('texnika') ||
      qLower.includes('mashina') ||
      qLower.includes('isuzu') ||
      qLower.includes('714') ||
      qLower.includes('269') ||
      qLower.includes('820')
    ) {
      const veh = matchedVeh || vehicles[0];
      const street = veh.currentStreetName || 'Guliston shoh ko‘chasi';
      const speed = veh.speedKmH || 18;
      const todayDist = veh.todayDistanceKm || 42.6;
      const reply = `${veh.plateNumber} raqamli ${veh.model} mashinasi hozir Qiziltepa tumani, ${street}da harakatda. Tezligi: ${speed} km/soat.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        vehicle: veh,
        mapCoords: [veh.lat, veh.lng],
        mapTitle: `${street} (${veh.plateNumber})`,
        stats: {
          speed,
          todayDistance: todayDist,
          avgSpeed: 16.4,
          maxSpeed: 48,
          lastSignal: 'Hozirgina',
          location: street,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      speakTextWithLoop(reply, aiMsg.id);
      return;
    }

    // 4. Check for subscriber or person name query
    const subscribers = storageService.getSubscribers();
    const houses = storageService.getHousePolygons();
    const matchedSub = subscribers.find((s) => {
      const name = s.fullName.toLowerCase();
      return name.split(' ').some((part) => part.length >= 3 && qLower.includes(part));
    });
    const matchedHouse = houses.find((h) => {
      const name = (h.subscriberName || '').toLowerCase();
      return name.split(' ').some((part) => part.length >= 3 && qLower.includes(part));
    });

    if (
      matchedSub ||
      matchedHouse ||
      qLower.includes('komiljon') ||
      qLower.includes('abdullayev') ||
      qLower.includes('dilnoza') ||
      qLower.includes('rahimova') ||
      qLower.includes('anvar') ||
      qLower.includes('toshpo') ||
      qLower.includes('abonent')
    ) {
      const sub = matchedSub || subscribers[0];
      const house = matchedHouse || houses[0];
      const subName = sub?.fullName || house?.subscriberName || 'Abdullayev Komiljon';
      const address = sub?.address || `${house?.mahalla}, ${house?.streetName}, ${house?.houseNumber}`;
      const balance = sub?.balance ?? house?.balance ?? 34000;
      const phone = sub?.phone || house?.phone || '+998 90 123 45 67';
      const coords: [number, number] = house?.center || [40.0385, 64.8530];

      const balanceText =
        balance >= 0
          ? `+${balance.toLocaleString('uz-UZ')} so‘m (To‘langan)`
          : `${balance.toLocaleString('uz-UZ')} so‘m (Qarzdor)`;
      const reply = `${subName} bo‘yicha ma’lumot topildi. Manzili: ${address}. Telefoni: ${phone}. Hisob balansi: ${balanceText}.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        subscriber: sub,
        house: house,
        mapCoords: coords,
        mapTitle: `${subName} xonadoni — ${address}`,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      speakTextWithLoop(reply, aiMsg.id);
      return;
    }

    // 5. Check for street / district cleanliness
    if (
      qLower.includes('ko‘cha') ||
      qLower.includes('ko\'cha') ||
      qLower.includes('kocha') ||
      qLower.includes('tozalanish') ||
      qLower.includes('tozalangan') ||
      qLower.includes('qiziltepa')
    ) {
      const streets = storageService.getStreetNetwork();
      const green = streets.filter((s) => s.status === 'green').length || 24;
      const yellow = streets.filter((s) => s.status === 'yellow').length || 6;
      const red = streets.filter((s) => s.status === 'red').length || 2;

      const reply = `Qiziltepa tumani bo‘yicha ko‘chalar holati: ${green} ta ko‘cha to‘liq tozalangan (yashil), ${yellow} ta ko‘cha grafik bo‘yicha tozalanish jarayonida (sariq), ${red} ta ko‘chada kechikish mavjud.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      speakTextWithLoop(reply, aiMsg.id);
      return;
    }

    // 6. Default Gemini AI API query for other domain intelligence
    try {
      const res = await geminiService.sendMessage(q);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        subscriber: res.dataPreview?.subscriber,
        vehicle: res.dataPreview?.vehicle,
        mapCoords: res.dataPreview?.vehicle ? [res.dataPreview.vehicle.lat, res.dataPreview.vehicle.lng] : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakTextWithLoop(res.text, aiMsg.id);
    } catch (e) {
      const fallbackReply = `Buyrug‘ingiz qabul qilindi. Tizimda barcha ma’lumotlar yangilanmoqda. Boshqa savolingiz bormi?`;
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakTextWithLoop(fallbackReply, aiMsg.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] gap-4 text-slate-100 animate-in fade-in duration-200 select-none">
      {/* Left Panel: Savollar va Murojaatlar Tarixi */}
      <div className="w-full lg:w-80 xl:w-96 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col shrink-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Murojaatlar va Savollar</h3>
                <p className="text-[10px] text-slate-400">Tezkor monitoring buyruqlari</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
              {filteredHistory.length} ta
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={leftSearch}
              onChange={(e) => setLeftSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* History / Quick Commands List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-800/40">
          {filteredHistory.map((item) => (
            <button
              key={item.id}
              onClick={() => handleProcessQuery(item.query)}
              className="w-full text-left p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-emerald-500/40 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Center/Right Panel: AI Operator Chat Canvas */}
      <div className="flex-1 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Chat Canvas Header */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Bot className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-wide">AI Yordamchi (Operator)</h2>
                {isS2SMode ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                    <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                    Jonli Speech-to-Speech Faol
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    O‘zbek tili STT + TTS
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Toza Makon davlat muassasasi aqlli dispetcherlik tizimi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speech-to-Speech Mode Toggle Button */}
            <button
              onClick={handleToggleS2SMode}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                isS2SMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-400/50 shadow-emerald-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Jonli Ovozli Muloqot (Speech-to-Speech) rejimini yoqish/o‘chirish"
            >
              <Headphones className="h-4 w-4 text-emerald-300" />
              <span className="hidden sm:inline">{isS2SMode ? 'Jonli Muloqot: Yoqiq' : 'Jonli Muloqot'}</span>
            </button>

            {/* Audio Voice Readout Toggle */}
            <button
              onClick={() => {
                if (isVoiceEnabled) stopAllVoice();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isVoiceEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isVoiceEnabled ? "Ovozli o‘qish yoqilgan" : "Ovozli o‘qish o‘chirilgan"}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden md:inline">{isVoiceEnabled ? 'Ovoz: Yoqiq' : 'Ovoz: O‘chiq'}</span>
            </button>

            {/* Clear Chat */}
            <button
              onClick={() => {
                stopAllVoice();
                setMessages([
                  {
                    id: `cl-${Date.now()}`,
                    sender: 'assistant',
                    text: 'Tizim tayyor. Savol yoki buyruq bering.',
                    timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Chatni tozalash"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Speech-to-Speech Active Banner / Wave Visualizer */}
        {(isS2SMode || voiceState === 'listening' || voiceState === 'speaking') && (
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between z-10 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  voiceState === 'listening'
                    ? 'bg-rose-500 animate-ping'
                    : voiceState === 'speaking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
              />
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span>
                  {voiceState === 'listening'
                    ? '🎙️ Sizni eshitmoqdaman... Gapiring (O‘zbek tilida)'
                    : voiceState === 'processing'
                    ? '⚡ Tahlil qilinmoqda...'
                    : voiceState === 'speaking'
                    ? '🔊 AI operator gapirmoqda...'
                    : '🟢 Jonli ovozli rejim faol'}
                </span>
                {interimTranscript && (
                  <span className="text-emerald-300 font-normal italic truncate max-w-xs sm:max-w-md">
                    "{interimTranscript}"
                  </span>
                )}
              </div>
            </div>

            <AudioWaveVisualizer
              active={voiceState === 'listening' || voiceState === 'speaking'}
              state={voiceState}
            />
          </div>
        )}

        {/* Chat Feed */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-b from-slate-900 to-slate-950">
          {messages.map((msg) => {
            const isAI = msg.sender === 'assistant';
            const isSpeaking = speakingMsgId === msg.id || (voiceState === 'speaking' && messages[messages.length - 1]?.id === msg.id);

            return (
              <div key={msg.id} className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] md:max-w-[78%] rounded-3xl p-4 sm:p-5 text-sm leading-relaxed space-y-3.5 shadow-xl ${
                    isAI
                      ? 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-tl-xs'
                      : 'bg-emerald-600 text-white rounded-tr-xs shadow-emerald-600/20'
                  }`}
                >
                  {/* Message Header / Voice Play Button */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-75 flex items-center gap-1.5">
                      {isAI ? (
                        <>
                          <Sparkles className="h-3 w-3 text-emerald-400" />
                          <span>TozaMakon AI Operator</span>
                        </>
                      ) : (
                        <span>Dispetcher so‘rovi (Ovozli)</span>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      {isAI && (
                        <button
                          onClick={() => {
                            if (isSpeaking) {
                              stopAllVoice();
                            } else {
                              speakTextWithLoop(msg.text, msg.id);
                            }
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSpeaking
                              ? 'bg-emerald-500 text-slate-900 animate-pulse ring-2 ring-emerald-300'
                              : 'bg-slate-700/80 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isSpeaking ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          <span>{isSpeaking ? 'To‘xtatish' : 'Tinglash'}</span>
                        </button>
                      )}
                      <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Message Body Text */}
                  <div className="text-sm sm:text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Complaints Summary Data Grid */}
                  {msg.complaintsData && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/70 text-center">
                      <div className="p-2 rounded-xl bg-slate-800/80">
                        <div className="text-[10px] text-slate-400 font-bold">Jami</div>
                        <div className="text-base font-black text-white">{msg.complaintsData.total}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="text-[10px] text-blue-400 font-bold">Yangi</div>
                        <div className="text-base font-black text-blue-400">{msg.complaintsData.newCount}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="text-[10px] text-amber-400 font-bold">Jarayonda</div>
                        <div className="text-base font-black text-amber-400">{msg.complaintsData.inProgress}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-[10px] text-emerald-400 font-bold">Javob berilgan</div>
                        <div className="text-base font-black text-emerald-400">{msg.complaintsData.answered}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="text-[10px] text-purple-400 font-bold">Yopilgan</div>
                        <div className="text-base font-black text-purple-400">{msg.complaintsData.closed}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="text-[10px] text-rose-400 font-bold">Rad etilgan</div>
                        <div className="text-base font-black text-rose-400">{msg.complaintsData.rejected}</div>
                      </div>
                    </div>
                  )}

                  {/* Embedded Leaflet Mini-Map (Live Satellite View of Vehicle / House) */}
                  {msg.mapCoords && (
                    <ChatMiniMap
                      coords={msg.mapCoords}
                      title={msg.mapTitle}
                      heading={msg.vehicle?.heading || 0}
                      vehiclePlate={msg.vehicle?.plateNumber}
                      speed={msg.stats?.speed}
                      onOpenFullMap={() => onNavigate('gps')}
                    />
                  )}

                  {/* Telemetry Statistics Grid */}
                  {msg.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Harakat tezligi:</span>
                        <span className="text-sm font-black text-emerald-400">{msg.stats.speed} km/soat</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Bosib o‘tgan masofa:</span>
                        <span className="text-sm font-black text-white">{msg.stats.todayDistance} km</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">O‘rtacha tezlik:</span>
                        <span className="text-sm font-bold text-cyan-300">{msg.stats.avgSpeed} km/soat</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Maksimal tezlik:</span>
                        <span className="text-sm font-bold text-amber-300">{msg.stats.maxSpeed} km/soat</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Navigation Buttons */}
                  {isAI && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.vehicle && (
                        <button
                          onClick={() => onNavigate('gps')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          <span>GPS Monitoring xaritasida ochish</span>
                        </button>
                      )}
                      {msg.complaintsData && (
                        <button
                          onClick={() => onNavigate('complaints')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          <MessageSquareWarning className="h-3.5 w-3.5" />
                          <span>Murojaatlar bo‘limiga o‘tish</span>
                        </button>
                      )}
                      {msg.subscriber && (
                        <button
                          onClick={() => onNavigate('subscribers')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>Abonentlar profilini ochish</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 items-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-4 rounded-3xl bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium text-slate-300 ml-1">AI operator tahlil qilmoqda va javob tayyorlamoqda...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input & Voice Recording Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessQuery();
            }}
            className="flex items-center gap-2.5"
          >
            {/* Big Microphone Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer shrink-0 shadow-lg ${
                voiceState === 'listening'
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/40 shadow-rose-600/40 scale-105'
                  : voiceState === 'speaking'
                  ? 'bg-amber-600 text-white animate-pulse ring-2 ring-amber-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500'
              }`}
              title={
                voiceState === 'listening'
                  ? "Eshitilmoqda (gapiring)... Bosilsa to‘xtaydi"
                  : voiceState === 'speaking'
                  ? "AI gapirmoqda... Bosilsa to‘xtaydi"
                  : "Ovoz bilan gapirish (O‘zbek tili STT)"
              }
            >
              {voiceState === 'listening' ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>

            {/* Input Field */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="O‘zbek tilida gapiring yoki yozing (masalan: 85 714 UZA qayerda?, Bugungi murojaatlar?, Tezligi?)..."
                className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-600/25"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2.5 px-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>O‘zbek tilida Speech-to-Speech (STT + TTS) faol</span>
            </span>
            <span className="hidden sm:inline">TozaMakon davlat korxonasi monitoringi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
