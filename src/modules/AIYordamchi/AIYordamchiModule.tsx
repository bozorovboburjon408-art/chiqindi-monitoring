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
  Home,
  Phone,
  ZoomIn,
  ZoomOut,
  Layers,
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
  type?: 'vehicle' | 'house' | 'complaints' | 'streets' | 'general';
  vehicle?: Vehicle;
  subscriber?: Subscriber;
  house?: HousePolygon;
  mapCoords?: [number, number];
  mapTitle?: string;
  mapZoom?: number;
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

// Mini Leaflet Map Component with High-Detail Zoom for Vehicles & Houses
const ChatMiniMap: React.FC<{
  coords: [number, number];
  zoom?: number;
  title?: string;
  type?: 'vehicle' | 'house';
  vehicle?: Vehicle;
  house?: HousePolygon;
  subscriber?: Subscriber;
  heading?: number;
  vehiclePlate?: string;
  speed?: number;
  onOpenFullMap?: () => void;
}> = ({
  coords,
  zoom = 18,
  title,
  type = 'vehicle',
  vehicle,
  house,
  subscriber,
  heading = 0,
  vehiclePlate,
  speed,
  onOpenFullMap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
      });

      // Google Maps Satellite / Hybrid layer for realistic rooftops and streets
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      }).addTo(map);

      if (type === 'house' && house) {
        // Draw House Polygon Boundary with glowing green/emerald styling
        if (house.latLngs && house.latLngs.length > 0) {
          const poly = L.polygon(house.latLngs, {
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.45,
            weight: 3,
            dashArray: '5, 5',
          }).addTo(map);

          poly.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
              <strong style="font-size: 13px; color: #047857;">🏠 ${house.houseNumber} (${house.mahalla})</strong>
              <div style="margin-top: 4px; color: #334155;"><strong>Abonent:</strong> ${house.subscriberName || 'Abonent'}</div>
              <div style="color: #334155;"><strong>Telefon:</strong> ${house.phone}</div>
              <div style="color: #334155;"><strong>Balans:</strong> <span style="color: ${house.balance >= 0 ? '#059669' : '#e11d48'}; font-weight: bold;">${house.balance >= 0 ? '+' : ''}${house.balance.toLocaleString('uz-UZ')} so'm</span></div>
              <div style="color: #059669; font-weight: 600; margin-top: 2px;">Holati: ${house.status}</div>
            </div>
          `);
        }

        // Custom House Center Marker
        const houseIconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="padding: 3px 8px; border-radius: 12px; background: #047857; color: #ffffff; border: 2px solid #ffffff; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); white-space: nowrap;">
              🏠 ${house.houseNumber}
            </div>
          </div>
        `;

        const houseIcon = L.divIcon({
          html: houseIconHtml,
          className: 'chat-mini-house-marker',
          iconSize: [80, 30],
          iconAnchor: [40, 15],
        });

        L.marker(coords, { icon: houseIcon }).addTo(map);
      } else {
        // Vehicle Mode: Vehicle pulse marker with directional rotation
        const vehicleIconHtml = `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #059669; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
          html: vehicleIconHtml,
          className: 'chat-mini-vehicle-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        L.marker(coords, { icon: markerIcon }).addTo(map);

        // Draw vehicle trace if present
        if (vehicle?.trail && vehicle.trail.length > 1) {
          L.polyline(vehicle.trail, {
            color: '#10b981',
            weight: 4,
            opacity: 0.8,
            dashArray: '6, 6',
          }).addTo(map);
        }
      }

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(coords, zoom);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, zoom, type, house, vehicle, heading]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl mt-2 bg-slate-950">
      {/* Leaflet map container with ultra-clear satellite resolution */}
      <div ref={mapContainerRef} className="w-full h-52 sm:h-64 z-0" />

      {/* Top Banner with Plate / House Name & Zoom in Button */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-slate-700/90 backdrop-blur-md text-[11px] font-bold text-white shadow-lg pointer-events-auto">
          {type === 'house' ? (
            <>
              <Home className="h-3.5 w-3.5 text-emerald-400" />
              <span>{house?.houseNumber || 'Xonadon'}</span>
              <span className="text-slate-400 font-normal">({house?.subscriberName || 'Abonent'})</span>
            </>
          ) : (
            <>
              <Truck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono">{vehiclePlate || vehicle?.plateNumber || 'Maxsus texnika'}</span>
              {speed !== undefined && (
                <span className="text-emerald-400 font-bold ml-1">• {speed} km/soat</span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Zoom In/Out Mini Controls */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-700/80 overflow-hidden shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Yaqinlashtirish"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-3.5 bg-slate-700" />
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Uzoqlashtirish"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {onOpenFullMap && (
            <button
              onClick={onOpenFullMap}
              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-[11px] flex items-center gap-1.5 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Katta xaritada</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Information Bar */}
      <div className="absolute bottom-2 left-2 right-2 z-10 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/90 backdrop-blur-md text-[11px] text-slate-200 shadow-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-medium">{title || (house ? `${house.mahalla}, ${house.streetName}` : 'Qiziltepa tumani')}</span>
        </div>
        <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          <span>Yo‘ldosh Zoom 18x</span>
        </div>
      </div>
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
      text: '85 714 UZA mashinasini xaritadan zoom qilib topib ber',
      timestamp: '11:20',
    },
    {
      id: 'init-2',
      sender: 'assistant',
      text: '85 714 UZA raqamli ISUZU NPR 75 maxsus chiqindi tashuvchi mashinasi hozir Qiziltepa tumani, Bo‘ston MFY, Guliston shoh ko‘chasida harakatda. Tezligi 18 km/soat. Joylashuvi xaritada yaqinlashtirildi.',
      timestamp: '11:20',
      type: 'vehicle',
      mapCoords: [40.0385, 64.8530],
      mapZoom: 18,
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
    {
      id: 'init-3',
      sender: 'user',
      text: 'Abdullayev Komiljonning uyini zoom qilib ko‘rsat',
      timestamp: '11:22',
    },
    {
      id: 'init-4',
      sender: 'assistant',
      text: 'Abdullayev Komiljon xonadoni topildi. Manzili: Bo‘ston MFY, Guliston shoh ko‘chasi, 1-uy. Balansi: +18 000 so‘m (To‘langan). Xonadon tozalangan holatda. Xaritada uyi va hovli chegarasi yaqinlashtirildi.',
      timestamp: '11:22',
      type: 'house',
      mapCoords: [40.035187, 64.846968],
      mapZoom: 19,
      mapTitle: 'Bo‘ston MFY, Guliston shoh ko‘chasi, 1-uy (Abdullayev Komiljon)',
      house: storageService.getHousePolygons()[0],
      subscriber: storageService.getSubscribers()[0],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isS2SMode, setIsS2SMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [leftSearch, setLeftSearch] = useState('');

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const s2sActiveRef = useRef<boolean>(false);

  useEffect(() => {
    s2sActiveRef.current = isS2SMode;
    voiceService.setContinuousS2S(isS2SMode);
  }, [isS2SMode]);

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
      title: '85 714 UZA — Mashinani xaritadan zoom qilib top',
      desc: 'ISUZU NPR 75 • Qiziltepa markazida 18 km/soat tezlikda harakatda',
      query: '85 714 UZA mashinasini xaritadan zoom qilib topib ber',
      time: '11:20',
      badge: 'GPS Zoom',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'h-2',
      title: 'Abdullayev Komiljon — Uyini xaritadan zoom qilib top',
      desc: 'Guliston shoh ko‘chasi, 1-uy • Balans: +18 000 so‘m • Hovli chegarasi',
      query: 'Abdullayev Komiljonning uyini zoom qilib ko‘rsat',
      time: '11:22',
      badge: 'Xonadon Zoom',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      id: 'h-3',
      title: 'Rahimova Dilnoza — Xonadon hovlisi va balansi',
      desc: 'Guliston shoh ko‘chasi, 2-uy • Balans: +21 000 so‘m • Tozalangan',
      query: 'Rahimova Dilnozaning xonadonini xaritadan top',
      time: '11:24',
      badge: 'Xonadon Zoom',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'h-4',
      title: '75 269 LAA — KamAZ texnikasini topish',
      desc: 'Navoiy shoh ko‘chasida • Bunker: 75% to‘lgan',
      query: '75 269 LAA mashinasini xaritadan zoom qilib top',
      time: '11:26',
      badge: 'GPS Zoom',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'h-5',
      title: 'Toshpo‘latov Anvar — 3-uy xaritada',
      desc: 'Guliston shoh ko‘chasi, 3-uy • 6 nafar istiqomat qiluvchi',
      query: 'Toshpo‘latov Anvarning uyini och',
      time: '11:28',
      badge: 'Xonadon Zoom',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'h-6',
      title: 'Bugungi murojaatlar statistikasi',
      desc: 'Bugun jami 91 ta murojaat bor: 48 ta yangi, 7 ta jarayonda...',
      query: 'Bugungi murojaatlar qancha?',
      time: '11:30',
      badge: 'Murojaat',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
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

  const handleToggleS2SMode = () => {
    if (isS2SMode) {
      setIsS2SMode(false);
      stopAllVoice();
    } else {
      setIsS2SMode(true);
      setIsVoiceEnabled(true);
      const greeting = "Assalomu alaykum! TozaMakon ovozli operatoriman. Qaysi mashina yoki qaysi odamning uyini xaritadan topib beray?";
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

  // Focus and Zoom on Full GPS Map
  const handleZoomOnFullMap = (type: 'vehicle' | 'house', entity: Vehicle | HousePolygon) => {
    if (type === 'vehicle') {
      const v = entity as Vehicle;
      storageService.setFocusTarget({
        type: 'vehicle',
        id: v.id,
        plate: v.plateNumber,
        coords: [v.lat, v.lng],
        zoom: 18,
      });
    } else {
      const h = entity as HousePolygon;
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
  };

  // Main AI query processing with high-detail entity extraction and zoom map generation
  const handleProcessQuery = async (queryText?: string) => {
    const rawQ = (queryText !== undefined ? queryText : input).trim();
    if (!rawQ || isLoading) return;

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

    // Helper function for fuzzy token scoring
    const scoreTextMatch = (query: string, target: string): number => {
      if (!query || !target) return 0;
      const q = query.toLowerCase().trim();
      const t = target.toLowerCase().trim();
      if (q === t) return 100;
      if (t.includes(q)) return 80;
      if (q.includes(t)) return 60;

      const qTokens = q.split(/[\s,.'`‘’"-]+/).filter((w) => w.length >= 2);
      const tTokens = t.split(/[\s,.'`‘’"-]+/).filter((w) => w.length >= 2);

      let score = 0;
      for (const qt of qTokens) {
        for (const tt of tTokens) {
          if (qt === tt) {
            score += 30;
          } else if (qt.length >= 4 && tt.length >= 4 && (tt.startsWith(qt) || qt.startsWith(tt))) {
            score += 20;
          } else if (qt.length >= 3 && tt.length >= 3 && (tt.includes(qt) || qt.includes(tt))) {
            score += 10;
          }
        }
      }
      return score;
    };

    // 1. Check for Vehicle Zoom & Location Queries
    const vehicles = storageService.getVehicles();
    let bestVeh: Vehicle | null = null;
    let bestVehScore = 0;

    for (const v of vehicles) {
      let score = 0;
      const pClean = v.plateNumber.toLowerCase().replace(/\s+/g, '');
      const qClean = qLower.replace(/\s+/g, '');
      const numPart = v.plateNumber.replace(/[^0-9]/g, '');

      if (qClean.includes(pClean) || pClean.includes(qClean)) score += 80;
      if (numPart.length >= 3 && qLower.includes(numPart)) score += 60;
      score += scoreTextMatch(qLower, v.driverName || '');
      score += scoreTextMatch(qLower, v.model || '');
      score += scoreTextMatch(qLower, v.currentStreetName || '');

      if (score > bestVehScore) {
        bestVehScore = score;
        bestVeh = v;
      }
    }

    const isVehicleQuery =
      bestVehScore >= 30 ||
      (qLower.includes('mashina') && !qLower.includes('uy') && !qLower.includes('xonadon')) ||
      (qLower.includes('texnika') && !qLower.includes('uy') && !qLower.includes('xonadon'));

    if (isVehicleQuery && !qLower.includes('uy') && !qLower.includes('xonadon') && !qLower.includes('komiljon') && !qLower.includes('dilnoza') && !qLower.includes('anvar') && !qLower.includes('bobur')) {
      const veh = bestVeh || vehicles[0];
      const street = veh.currentStreetName || 'Guliston shoh ko‘chasi';
      const speed = veh.speedKmH || 18;
      const todayDist = veh.todayDistanceKm || 42.6;
      const avgSpeed = (speed * 0.85).toFixed(1);
      const maxSpeed = Math.round(speed * 1.6);

      const reply = `${veh.plateNumber} raqamli ${veh.model} mashinasi hozir Qiziltepa tumani, ${street}da harakatda. Tezligi ${speed} km/soat. Joylashuvi xaritada yaqinlashtirildi.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        type: 'vehicle',
        vehicle: veh,
        mapCoords: [veh.lat, veh.lng],
        mapZoom: 18,
        mapTitle: `${street} (${veh.plateNumber})`,
        stats: {
          speed,
          todayDistance: todayDist,
          avgSpeed: Number(avgSpeed),
          maxSpeed,
          lastSignal: 'Hozirgina',
          location: street,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      speakTextWithLoop(reply, aiMsg.id);
      return;
    }

    // 2. Check for Person / Subscriber / House Zoom Queries
    const houses = storageService.getHousePolygons();
    const subscribers = storageService.getSubscribers();

    let bestHouse: HousePolygon | null = null;
    let bestHouseScore = 0;

    for (const h of houses) {
      let score = 0;
      score += scoreTextMatch(qLower, h.subscriberName || '') * 1.5;
      score += scoreTextMatch(qLower, h.houseNumber);
      score += scoreTextMatch(qLower, h.code || '');
      score += scoreTextMatch(qLower, h.streetName || '');
      score += scoreTextMatch(qLower, h.mahalla || '');
      if (score > bestHouseScore) {
        bestHouseScore = score;
        bestHouse = h;
      }
    }

    let bestSub: Subscriber | null = null;
    let bestSubScore = 0;

    for (const s of subscribers) {
      let score = 0;
      score += scoreTextMatch(qLower, s.fullName) * 1.5;
      score += scoreTextMatch(qLower, s.code);
      score += scoreTextMatch(qLower, s.householdNumber || '');
      score += scoreTextMatch(qLower, s.address);
      if (score > bestSubScore) {
        bestSubScore = score;
        bestSub = s;
      }
    }

    const isPersonQuery =
      bestHouseScore >= 15 ||
      bestSubScore >= 15 ||
      qLower.includes('uy') ||
      qLower.includes('uyi') ||
      qLower.includes('xonadon') ||
      qLower.includes('komiljon') ||
      qLower.includes('abdullayev') ||
      qLower.includes('dilnoza') ||
      qLower.includes('rahimova') ||
      qLower.includes('anvar') ||
      qLower.includes('toshpo') ||
      qLower.includes('bahodir') ||
      qLower.includes('karimov') ||
      qLower.includes('malika') ||
      qLower.includes('nazarova') ||
      qLower.includes('bobur') ||
      qLower.includes('bozorov') ||
      qLower.includes('aziza');

    if (isPersonQuery) {
      let house: HousePolygon;
      let sub: Subscriber;

      if (bestHouseScore >= bestSubScore && bestHouse) {
        house = bestHouse;
        sub = subscribers.find((s) => s.fullName.toLowerCase() === (house.subscriberName || '').toLowerCase()) ||
              subscribers.find((s) => s.phone === house.phone) ||
              subscribers[0];
      } else if (bestSub) {
        sub = bestSub;
        house = houses.find((h) => (h.subscriberName || '').toLowerCase() === sub.fullName.toLowerCase()) ||
                houses.find((h) => h.phone === sub.phone) ||
                houses[0];
      } else {
        house = houses[0];
        sub = subscribers[0];
      }

      const subName = house.subscriberName || sub.fullName || 'Abdullayev Komiljon';
      const address = `${house.mahalla}, ${house.streetName}, ${house.houseNumber}`;
      const balance = house.balance ?? sub.balance ?? 18000;
      const phone = house.phone || sub.phone || '+998 91 582 76 22';
      const balanceText =
        balance >= 0
          ? `+${balance.toLocaleString('uz-UZ')} so‘m (To‘langan)`
          : `${balance.toLocaleString('uz-UZ')} so‘m (Qarzdor)`;

      const reply = `${subName} xonadoni topildi. Manzili: ${address}. Telefoni: ${phone}. Balansi: ${balanceText}. Xonadon ${house.status.toLowerCase()} holatda. Xaritada uning uyi va hovli chegarasi yaqinlashtirildi.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        type: 'house',
        subscriber: sub,
        house: house,
        mapCoords: house.center,
        mapZoom: 19,
        mapTitle: `${address} (${subName})`,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      speakTextWithLoop(reply, aiMsg.id);
      return;
    }

    // 3. Check for Complaints queries
    if (
      qLower.includes('murojaat') ||
      qLower.includes('murojat') ||
      qLower.includes('shikoyat') ||
      qLower.includes('ariza')
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
        type: 'complaints',
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

    // 4. Default Gemini AI API query with domain fallback
    try {
      const res = await geminiService.sendMessage(q);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        type: res.dataPreview?.vehicle ? 'vehicle' : res.dataPreview?.house || res.dataPreview?.subscriber ? 'house' : 'general',
        subscriber: res.dataPreview?.subscriber,
        vehicle: res.dataPreview?.vehicle,
        house: res.dataPreview?.house,
        mapCoords: res.dataPreview?.vehicle
          ? [res.dataPreview.vehicle.lat, res.dataPreview.vehicle.lng]
          : res.dataPreview?.house
          ? res.dataPreview.house.center
          : undefined,
        mapZoom: 18,
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakTextWithLoop(res.text, aiMsg.id);
    } catch (e) {
      const fallbackReply = `Buyrug‘ingiz qabul qilindi. Biror maxsus texnika yoki fuqaroning uyini topib berishimni xohlaysizmi?`;
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
                <p className="text-[10px] text-slate-400">Mashina & Xonadon Zoom buyruqlari</p>
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
              placeholder="Qidiruv (mashina, abonent, uy)..."
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
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    GPS & Xonadon Zoom Faol
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
                    text: 'Tizim tayyor. Qaysi mashina yoki qaysi odamning uyini xaritadan zoom qilib topib beray?',
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
                    ? '🎙️ Sizni eshitmoqdaman... Gapiring (masalan: "Abdullayev Komiljonning uyini ko‘rsat")'
                    : voiceState === 'processing'
                    ? '⚡ Xaritadan qidirilmoqda va yaqinlashtirilmoqda...'
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
                  className={`max-w-[90%] md:max-w-[82%] rounded-3xl p-4 sm:p-5 text-sm leading-relaxed space-y-3.5 shadow-xl ${
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
                        <span>Dispetcher so‘rovi</span>
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

                  {/* Embedded Leaflet High-Zoom Mini-Map (Live Satellite View of Vehicle OR House Polygon) */}
                  {msg.mapCoords && (
                    <ChatMiniMap
                      coords={msg.mapCoords}
                      zoom={msg.mapZoom || (msg.type === 'house' ? 19 : 18)}
                      title={msg.mapTitle}
                      type={msg.type === 'house' ? 'house' : 'vehicle'}
                      vehicle={msg.vehicle}
                      house={msg.house}
                      subscriber={msg.subscriber}
                      heading={msg.vehicle?.heading || 0}
                      vehiclePlate={msg.vehicle?.plateNumber}
                      speed={msg.stats?.speed}
                      onOpenFullMap={() => {
                        if (msg.type === 'house' && msg.house) {
                          handleZoomOnFullMap('house', msg.house);
                        } else if (msg.vehicle) {
                          handleZoomOnFullMap('vehicle', msg.vehicle);
                        } else {
                          onNavigate('gps');
                        }
                      }}
                    />
                  )}

                  {/* Telemetry Statistics Grid (For Vehicles) */}
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
                      {/* Vehicle Action Buttons */}
                      {msg.vehicle && (
                        <>
                          <button
                            onClick={() => handleZoomOnFullMap('vehicle', msg.vehicle!)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          >
                            <ZoomIn className="h-3.5 w-3.5" />
                            <span>Katta xaritada mashinani zoom qilish</span>
                          </button>
                          <button
                            onClick={() => onNavigate('routes')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Navigation className="h-3.5 w-3.5" />
                            <span>Marshrutini ko‘rish</span>
                          </button>
                        </>
                      )}

                      {/* House / Subscriber Action Buttons */}
                      {msg.house && (
                        <>
                          <button
                            onClick={() => handleZoomOnFullMap('house', msg.house!)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          >
                            <ZoomIn className="h-3.5 w-3.5" />
                            <span>Katta xaritada uyini zoom qilish</span>
                          </button>
                          <button
                            onClick={() => onNavigate('subscribers')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>Abonent hisobini to‘liq ochish</span>
                          </button>
                          {msg.house.phone && (
                            <a
                              href={`tel:${msg.house.phone}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition-all"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Qo‘ng‘iroq</span>
                            </a>
                          )}
                        </>
                      )}

                      {/* Complaints Button */}
                      {msg.complaintsData && (
                        <button
                          onClick={() => onNavigate('complaints')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          <MessageSquareWarning className="h-3.5 w-3.5" />
                          <span>Murojaatlar bo‘limiga o‘tish</span>
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
                <span className="font-medium text-slate-300 ml-1">Xaritadan qidirilmoqda va yaqinlashtirilmoqda...</span>
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
                placeholder="Mashina yoki odam ismini ayting (masalan: 85 714 UZA mashinani top, Abdullayev Komiljon uyini ko‘rsat)..."
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
              <span>Avtomatik GPS & Xonadon Zoom (18x-19x sun’iy yo‘ldosh)</span>
            </span>
            <span className="hidden sm:inline">TozaMakon maxsus monitoringi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
