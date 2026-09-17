import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Navigation,
  Play,
  Pause,
  Layers,
  MapPin,
  Truck,
  Battery,
  User,
  Clock,
  Home,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Compass,
  Phone,
  DollarSign,
  Users,
  Eye,
  Trash2,
  Check,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Upload,
  Download,
  FileSpreadsheet,
  Edit3,
  Printer,
  QrCode,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  Vehicle,
  CHYM,
  HousePolygon,
  StreetNetworkItem,
  HouseStatus,
  TrackColorCategory,
} from '../../types';
import { storageService } from '../../services/storageService';
import { simulatorService } from '../../services/simulatorService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const GPSMonitoringModule: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer References
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const chymMarkersRef = useRef<L.Marker[]>([]);
  const streetPolylinesRef = useRef<Map<string, L.Polyline>>(new Map());
  const housePolygonsRef = useRef<Map<string, L.Polygon>>(new Map());
  const houseLabelMarkersRef = useRef<L.Marker[]>([]);
  const activeDrawPolylineRef = useRef<L.Polyline | null>(null);
  const activeDrawMarkersRef = useRef<L.CircleMarker[]>([]);

  // States from storage
  const [vehicles, setVehicles] = useState<Vehicle[]>(storageService.getVehicles());
  const [chyms, setCHYMs] = useState<CHYM[]>(storageService.getCHYMs());
  const [housePolygons, setHousePolygons] = useState<HousePolygon[]>(storageService.getHousePolygons());
  const [streetNetwork, setStreetNetwork] = useState<StreetNetworkItem[]>(storageService.getStreetNetwork());

  // Selected Entities
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<HousePolygon | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<StreetNetworkItem | null>(null);

  // Modals & Panels
  const [editingHouse, setEditingHouse] = useState<HousePolygon | null>(null);
  const [qrHouseModal, setQrHouseModal] = useState<HousePolygon | null>(null);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isNewHouseModalOpen, setIsNewHouseModalOpen] = useState(false);
  const [isNewChymModalOpen, setIsNewChymModalOpen] = useState(false);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [isPointAddMode, setIsPointAddMode] = useState(false);
  const [isChymAddMode, setIsChymAddMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);

  // View Settings & Toggles
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapType, setMapType] = useState<
    'google_hybrid' | 'google_street' | 'google_satellite' | 'dark'
  >('google_hybrid');
  const [showVehicles, setShowVehicles] = useState(false); // Toza xarita: foydalanuvchi xohlaganda yoqadi
  const [showStreets, setShowStreets] = useState(false);
  const [showHouses, setShowHouses] = useState(true);
  const [showHouseLabels, setShowHouseLabels] = useState(true);
  const [showChyms, setShowChyms] = useState(false); // Toza xarita: foydalanuvchi xohlaganda yoqadi
  const [trackFilter, setTrackFilter] = useState<'ALL' | TrackColorCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDistrict, setActiveDistrict] = useState<'all' | 'navoiy' | 'karmana' | 'zarafshon' | 'qiziltepa'>('navoiy');

  // Generator & Import Form States
  const [genStreetName, setGenStreetName] = useState('G‘alaba shoh ko‘chasi');
  const [genStartNum, setGenStartNum] = useState(1);
  const [genEndNum, setGenEndNum] = useState(20);
  const [genMahalla, setGenMahalla] = useState('Istiqlol MFY');
  const [genType, setGenType] = useState<'Hovli' | 'Ko‘p qavatli'>('Hovli');

  const [bulkCsvText, setBulkCsvText] = useState('');
  const [newHouseData, setNewHouseData] = useState<Partial<HousePolygon>>({
    houseNumber: '',
    streetName: 'G‘alaba shoh ko‘chasi',
    mahalla: 'Istiqlol MFY',
    subscriberName: '',
    phone: '+998 ',
    residentsCount: 4,
    balance: 0,
    status: 'Tozalangan',
    type: 'Hovli',
  });

  const [newChymData, setNewChymData] = useState({
    name: '',
    address: 'G‘alaba shoh ko‘chasi',
    mahalla: 'Istiqlol MFY',
    lat: 40.0844,
    lng: 65.3792,
    containerCount: 4,
    hasCamera: true,
    cameraIp: '192.168.1.101',
    cameraUrl: 'rtsp://admin:pass@192.168.1.101:554/live',
  });

  // HiLook QR Camera integration state
  const [chymCameraMode, setChymCameraMode] = useState<'hilook_qr' | 'ip'>('hilook_qr');
  const [hilookQrInput, setHilookQrInput] = useState('');
  const [hilookParsedInfo, setHilookParsedInfo] = useState<{
    serial: string;
    verifyCode: string;
    channel: string;
    status: string;
  } | null>(null);

  const handleParseHilookQr = (text: string) => {
    setHilookQrInput(text);
    if (!text.trim()) {
      setHilookParsedInfo(null);
      return;
    }
    let serial = 'D98421034';
    let verifyCode = 'K7X9PQ';
    let channel = 'CH-01 (1-kamera)';

    if (text.includes('serial=') || text.includes('dev=')) {
      const match = text.match(/(?:serial|dev)=([A-Za-z0-9]+)/);
      if (match) serial = match[1];
    }
    if (text.includes('code=') || text.includes('verify=')) {
      const match = text.match(/(?:code|verify)=([A-Za-z0-9]+)/);
      if (match) verifyCode = match[1];
    }
    if (text.includes('ch=') || text.includes('channel=')) {
      const match = text.match(/(?:ch|channel)=([0-9]+)/);
      if (match) channel = `CH-0${match[1]} (${match[1]}-kamera)`;
    }

    setHilookParsedInfo({
      serial,
      verifyCode,
      channel,
      status: 'Muvaffaqiyatli aniqlandi (HiLook Cloud)',
    });
  };

  const [newVehicleData, setNewVehicleData] = useState({
    plateNumber: '',
    model: 'Isuzu NPR 75',
    driverName: '',
    driverPhone: '+998 90 123 45 67',
    capacityM3: 10,
    gpsImei: '',
  });

  const [isSimRunning, setIsSimRunning] = useState(simulatorService.getStatus());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshState = () => {
    setVehicles([...storageService.getVehicles()]);
    setCHYMs([...storageService.getCHYMs()]);
    setHousePolygons([...storageService.getHousePolygons()]);
    setStreetNetwork([...storageService.getStreetNetwork()]);
    setIsSimRunning(simulatorService.getStatus());
  };

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      refreshState();
    });
    return unsub;
  }, []);

  // 1. Initialize Map Centered on Navoiy City
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Navoiy markazi (40.0844 N, 65.3792 E)
      const map = L.map(mapContainerRef.current, {
        center: [40.0844, 65.3792],
        zoom: 14,
        zoomControl: false,
      });

      // 1-Variant: Google Maps Gibrid (Haqiqiy sun'iy yo'ldosh + ko'cha yozuvlari)
      const initialTile = L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        {
          subdomains: ['0', '1', '2', '3'],
          attribution: '&copy; Google Maps (Gibrid Yo‘ldosh)',
          maxZoom: 21,
        }
      ).addTo(map);

      tileLayerRef.current = initialTile;
      mapInstanceRef.current = map;

      // Handle map clicks in drawing mode, point add mode, or chym add mode
      map.on('click', (e: L.LeafletMouseEvent) => {
        if ((window as any).__isPointAddMode) {
          (window as any).__handleMapPointClick(e.latlng.lat, e.latlng.lng);
        } else if ((window as any).__isChymAddMode) {
          (window as any).__handleMapChymClick(e.latlng.lat, e.latlng.lng);
        } else if ((window as any).__isDrawingMode) {
          const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
          (window as any).__addDrawPoint(newPt);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size on fullscreen toggle or window resize
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [isFullScreen, showSidePanel]);

  // Sync draw mode, point add mode, and chym add mode with window global for Leaflet event listener
  useEffect(() => {
    (window as any).__isDrawingMode = isDrawMode;
    (window as any).__addDrawPoint = (pt: [number, number]) => {
      setDrawPoints((prev) => [...prev, pt]);
    };
  }, [isDrawMode]);

  useEffect(() => {
    (window as any).__isPointAddMode = isPointAddMode;
    (window as any).__handleMapPointClick = (lat: number, lng: number) => {
      // 1-klikda bino ustiga bosib xonadon koordinatasini olish
      setDrawPoints([[lat, lng]]);
      setNewHouseData({
        houseNumber: '',
        streetName: 'G‘alaba shoh ko‘chasi',
        mahalla: 'Istiqlol MFY',
        subscriberName: '',
        phone: '+998 ',
        residentsCount: 4,
        balance: 0,
        status: 'Tozalangan',
        type: 'Hovli',
      });
      setIsNewHouseModalOpen(true);
      setIsPointAddMode(false);
    };
  }, [isPointAddMode]);

  useEffect(() => {
    (window as any).__isChymAddMode = isChymAddMode;
    (window as any).__handleMapChymClick = (lat: number, lng: number) => {
      // 1-klikda xaritada maydoncha nuqtasini belgilash
      setNewChymData((prev) => ({
        ...prev,
        lat,
        lng,
        name: `Maydoncha #${Math.floor(10 + Math.random() * 90)}`,
      }));
      setIsNewChymModalOpen(true);
      setIsChymAddMode(false);
    };
  }, [isChymAddMode]);

  // 2. Switch Map Tiles (Google Hybrid vs Google Street vs Google Satellite vs Dark)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    if (mapType === 'google_street') {
      tileLayerRef.current = L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        {
          subdomains: ['0', '1', '2', '3'],
          attribution: '&copy; Google Maps (Ko‘cha)',
          maxZoom: 21,
        }
      ).addTo(map);
    } else if (mapType === 'google_satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        {
          subdomains: ['0', '1', '2', '3'],
          attribution: '&copy; Google Maps (Toza Yo‘ldosh)',
          maxZoom: 21,
        }
      ).addTo(map);
    } else if (mapType === 'dark') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CARTO | Navoiy Tungi GIS',
          maxZoom: 20,
        }
      ).addTo(map);
    } else {
      // Default: google_hybrid (Google Maps Gibrid: Satellite + Roads)
      tileLayerRef.current = L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        {
          subdomains: ['0', '1', '2', '3'],
          attribution: '&copy; Google Maps (Gibrid Yo‘ldosh)',
          maxZoom: 21,
        }
      ).addTo(map);
    }
  }, [mapType]);

  // 3. Render 3-Color Street Network (Ko‘chalar tarmog‘i: Yashil, Sariq, Qizil)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old polylines
    streetPolylinesRef.current.forEach((pl) => pl.remove());
    streetPolylinesRef.current.clear();

    if (showStreets) {
      streetNetwork.forEach((street) => {
        if (trackFilter !== 'ALL' && street.status !== trackFilter) return;

        const isSelected = selectedStreet?.id === street.id;

        // 🟢 Green (<24h), 🟡 Yellow (24-48h), 🔴 Red (>48h)
        const color =
          street.status === 'green'
            ? '#10b981'
            : street.status === 'yellow'
            ? '#f59e0b'
            : '#ef4444';

        const polyline = L.polyline(street.path, {
          color: isSelected ? '#3b82f6' : color,
          weight: isSelected ? 9 : 7,
          opacity: isSelected ? 1 : 0.88,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        const statusLabel =
          street.status === 'green'
            ? '🟢 Bugun tozalangan (<24 soat)'
            : street.status === 'yellow'
            ? '🟡 1-2 kun oldin o‘tgan (24-48 soat)'
            : '🔴 2 kundan ortiq o‘tilmagan (>48 soat)';

        polyline.bindTooltip(
          `
            <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: #0f172a; font-size: 12px;">${street.name}</strong><br/>
              <span style="font-weight: 600;">${statusLabel}</span><br/>
              <span style="color: #64748b;">Oxirgi qatnov: ${street.lastPassedAt} (${street.vehiclePlate || 'Texnika biriktirilmagan'})</span><br/>
              <span style="color: #059669; font-weight: bold;">Uylar: ${street.cleanedHousesCount} / ${street.housesCount} tozalangan</span>
            </div>
          `,
          { sticky: true }
        );

        polyline.on('click', () => {
          setSelectedStreet(street);
          setSelectedHouse(null);
          setSelectedVehicle(null);
        });

        streetPolylinesRef.current.set(street.id, polyline);
      });
    }
  }, [streetNetwork, showStreets, trackFilter, selectedStreet]);

  // 4. Render House Polygons & House Number Labels (GIS Xonadonlar Pasporti)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old house polygons and labels
    housePolygonsRef.current.forEach((poly) => poly.remove());
    housePolygonsRef.current.clear();
    houseLabelMarkersRef.current.forEach((lbl) => lbl.remove());
    houseLabelMarkersRef.current = [];

    if (showHouses) {
      housePolygons.forEach((house) => {
        const isSelected = selectedHouse?.id === house.id;

        // Colors based on house status
        const color =
          house.status === 'Tozalangan'
            ? '#10b981'
            : house.status === 'Kutilmoqda'
            ? '#f59e0b'
            : '#ef4444';

        // 1. Agar xonadon tanlangan bo'lsa va chegarasi bo'lsa, faqat o'sha bitta xonadonga yengil chegara chizish
        if (isSelected && house.latLngs && house.latLngs.length > 2) {
          const polygon = L.polygon(house.latLngs, {
            color: '#2563eb',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.25,
          }).addTo(map);
          housePolygonsRef.current.set(house.id, polygon);
        }

        // 2. Toza Google Yo'ldosh xaritasida uylar ixcham nuqta/pin sifatida ko'rinadi (sun'iy to'rtburchaklarsiz)
        const pinMarker = L.marker(house.center, {
          icon: L.divIcon({
            className: 'clean-house-pin',
            html: `
              <div style="
                display: flex;
                align-items: center;
                gap: 2px;
                background: ${isSelected ? '#2563eb' : 'rgba(15, 23, 42, 0.9)'};
                color: white;
                padding: 2px 6px;
                border-radius: 9999px;
                font-size: 10px;
                font-weight: 800;
                border: 1.5px solid ${color};
                box-shadow: 0 2px 6px rgba(0,0,0,0.5);
                white-space: nowrap;
                cursor: pointer;
                transform: translate(-50%, -50%);
              ">
                <span style="font-size: 10px;">🏠</span>
                <span>${house.houseNumber}</span>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
        }).addTo(map);

        pinMarker.bindTooltip(
          `
            <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4;">
              <strong style="font-size: 12px; color: #0f172a;">🏠 ${house.houseNumber} (${house.streetName})</strong><br/>
              <span>Abonent: <b>${house.subscriberName}</b></span><br/>
              <span>Holati: <b style="color: ${color};">${house.status}</b></span><br/>
              <span>Balans: <b>${house.balance.toLocaleString('uz-UZ')} so‘m</b></span><br/>
              <span style="color: #64748b; font-size: 10px;">Oxirgi tozalash: ${house.lastCollectedTime}</span>
            </div>
          `,
          { sticky: true }
        );

        pinMarker.on('click', () => {
          setSelectedHouse(house);
          setSelectedStreet(null);
          setSelectedVehicle(null);
        });

        houseLabelMarkersRef.current.push(pinMarker);
      });
    }
  }, [housePolygons, showHouses, showHouseLabels, selectedHouse]);

  // 5. Render Active Drawing Points & Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeDrawPolylineRef.current) {
      activeDrawPolylineRef.current.remove();
      activeDrawPolylineRef.current = null;
    }
    activeDrawMarkersRef.current.forEach((m) => m.remove());
    activeDrawMarkersRef.current = [];

    if (isDrawMode && drawPoints.length > 0) {
      activeDrawPolylineRef.current = L.polyline(drawPoints, {
        color: '#3b82f6',
        dashArray: '6, 6',
        weight: 3,
      }).addTo(map);

      drawPoints.forEach((pt, idx) => {
        const marker = L.circleMarker(pt, {
          radius: 6,
          color: '#2563eb',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        marker.bindTooltip(`Nuqta #${idx + 1}`);
        activeDrawMarkersRef.current.push(marker);
      });
    }
  }, [drawPoints, isDrawMode]);

  // 6. Render Vehicles on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!showVehicles) {
      vehicleMarkersRef.current.forEach((m) => m.remove());
      vehicleMarkersRef.current.clear();
      return;
    }

    vehicles.forEach((veh) => {
      const isOnline = veh.status !== 'OFFLINE';
      const isMoving = veh.status === 'HARAKATDA' || veh.status === 'MARSHRUTDA';
      const bgColor = isMoving
        ? '#059669'
        : veh.status === 'TO‘XTAGAN'
        ? '#f59e0b'
        : isOnline
        ? '#0284c7'
        : '#64748b';

      const iconHtml = `
        <div style="
          position: relative;
          background: ${bgColor};
          color: white;
          border: 2px solid white;
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 800;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          white-space: nowrap;
          transform: translate(-50%, -50%);
        ">
          <span>🚛</span>
          <span>${veh.plateNumber}</span>
          ${isMoving ? `<span style="font-size: 9px; opacity: 0.9;">(${veh.speedKmH}km/h)</span>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-vehicle-marker',
        iconSize: [110, 30],
        iconAnchor: [55, 15],
      });

      let marker = vehicleMarkersRef.current.get(veh.id);
      if (!marker) {
        marker = L.marker([veh.lat, veh.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedVehicle(veh);
          setSelectedHouse(null);
          setSelectedStreet(null);
        });
        vehicleMarkersRef.current.set(veh.id, marker);
      } else {
        marker.setLatLng([veh.lat, veh.lng]);
        marker.setIcon(customIcon);
      }
    });
  }, [vehicles, showVehicles]);

  // 7. Render CHYM sites
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    chymMarkersRef.current.forEach((m) => m.remove());
    chymMarkersRef.current = [];

    if (showChyms) {
      chyms.forEach((c) => {
        const isCritical = c.fillPercentAvg >= 90;
        const color = isCritical ? '#ef4444' : '#059669';

        const iconHtml = `
          <div style="
            background: white;
            border: 2px solid ${color};
            border-radius: 8px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: bold;
            color: ${color};
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            gap: 2px;
            white-space: nowrap;
          ">
            <span>🗑️</span> ${c.name.split(',')[0]} (${c.fillPercentAvg}%)
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-chym-marker',
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const marker = L.marker([c.lat, c.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
            <strong style="color: #065f46;">${c.name}</strong><br/>
            <span style="color: #64748b;">${c.address}</span><br/>
            <div style="margin-top: 6px;">To‘lish darajasi: <strong>${c.fillPercentAvg}%</strong></div>
          </div>
        `);
        chymMarkersRef.current.push(marker);
      });
    }
  }, [chyms, showChyms]);

  // Handlers
  const handleToggleSimulator = () => {
    const running = simulatorService.toggle();
    setIsSimRunning(running);
    showToast(running ? '▶ GPS simulyator yoqildi (mashinalar harakati faol)' : '⏸ GPS simulyator to‘xtatildi');
  };

  const handleSelectVehicle = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    setSelectedHouse(null);
    setSelectedStreet(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([veh.lat, veh.lng], 16, { duration: 1.2 });
    }
  };

  const handleSelectHouse = (house: HousePolygon) => {
    setSelectedHouse(house);
    setSelectedVehicle(null);
    setSelectedStreet(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(house.center, 17, { duration: 1.2 });
    }
  };

  const handleSelectStreet = (street: StreetNetworkItem) => {
    setSelectedStreet(street);
    setSelectedHouse(null);
    setSelectedVehicle(null);
    if (mapInstanceRef.current && street.path.length > 0) {
      const mid = street.path[Math.floor(street.path.length / 2)];
      mapInstanceRef.current.flyTo(mid, 15, { duration: 1.2 });
    }
  };

  // Jump to Navoiy District
  const handleJumpDistrict = (district: 'all' | 'navoiy' | 'karmana' | 'zarafshon' | 'qiziltepa') => {
    setActiveDistrict(district);
    if (!mapInstanceRef.current) return;

    if (district === 'navoiy') {
      mapInstanceRef.current.flyTo([40.0844, 65.3792], 14, { duration: 1.2 });
      showToast('📍 Navoiy shahri markaziga o‘tildi');
    } else if (district === 'karmana') {
      mapInstanceRef.current.flyTo([40.1330, 65.3600], 14, { duration: 1.2 });
      showToast('📍 Karmana tumaniga o‘tildi');
    } else if (district === 'zarafshon') {
      mapInstanceRef.current.flyTo([41.5722, 64.2044], 13, { duration: 1.5 });
      showToast('📍 Zarafshon shahriga o‘tildi');
    } else if (district === 'qiziltepa') {
      mapInstanceRef.current.flyTo([40.0333, 64.8167], 13, { duration: 1.5 });
      showToast('📍 Qiziltepa tumaniga o‘tildi');
    }
  };

  // Mark single house as Cleaned
  const handleMarkHouseCollected = (house: HousePolygon) => {
    const updated: HousePolygon = {
      ...house,
      status: 'Tozalangan',
      lastCollectedTime: 'Hozirgina (Bugun)',
      lastCollectedVehicle: '85 714 UZA',
      lastCollectedDriver: 'Jasur Rahimov',
    };
    storageService.saveHousePolygon(updated);
    refreshState();
    setSelectedHouse(updated);
    showToast(`✓ "${house.houseNumber}" chiqindisi olindi va yashil rangga o‘tkazildi!`);
  };

  // Mark full street as cleaned
  const handleMarkStreetCleaned = (streetId: string) => {
    storageService.markStreetCleaned(streetId, '85 714 UZA');
    refreshState();
    const updated = storageService.getStreetNetwork().find((s) => s.id === streetId) || null;
    setSelectedStreet(updated);
    showToast(`✓ "${selectedStreet?.name || 'Ko‘cha'}" to‘liq tozalangan deb belgilandi!`);
  };

  // Auto Generate Houses along Street
  const handleRunAutoGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (genEndNum <= genStartNum) {
      alert('Tugash raqami boshlang‘ich raqamdan katta bo‘lishi kerak!');
      return;
    }
    const generated = storageService.generateStreetHouses(
      genStreetName,
      genStartNum,
      genEndNum,
      genMahalla,
      genType
    );
    refreshState();
    setIsAutoGenerateModalOpen(false);
    showToast(`✓ "${genStreetName}" bo‘ylab ${generated.length} ta xonadon avtomatik joylashtirildi!`);

    if (generated.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(generated[0].center, 16, { duration: 1.2 });
      setSelectedHouse(generated[0]);
    }
  };

  // Bulk CSV Import
  const handleBulkImportCsv = () => {
    if (!bulkCsvText.trim()) {
      alert('Iltimos CSV matnini kiriting yoki demo namunani yuklang!');
      return;
    }

    try {
      const lines = bulkCsvText.trim().split('\n');
      const newHouses: HousePolygon[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 4 && !parts[0].toLowerCase().includes('raqam')) {
          const houseNum = parts[0];
          const streetName = parts[1] || 'G‘alaba shoh ko‘chasi';
          const mahalla = parts[2] || 'Istiqlol MFY';
          const subName = parts[3] || `Abonent ${houseNum}`;
          const phone = parts[4] || '+998 90 123 45 67';
          const residents = Number(parts[5]) || 4;
          const balance = Number(parts[6]) || 0;

          // Place along Navoiy central coordinates with slight offsets
          const baseLat = 40.0844 + (Math.random() * 0.01 - 0.005);
          const baseLng = 65.3792 + (Math.random() * 0.01 - 0.005);
          const dW = 0.00022;

          newHouses.push({
            id: `bulk-h-${Date.now()}-${idx}`,
            code: `XON-NAV-B${String(idx + 1).padStart(3, '0')}`,
            houseNumber: houseNum,
            streetName,
            mahalla,
            regionId: 'reg-nav-1',
            regionName: 'Navoiy shahri',
            latLngs: [
              [baseLat - dW, baseLng - dW],
              [baseLat - dW, baseLng + dW],
              [baseLat + dW, baseLng + dW],
              [baseLat + dW, baseLng - dW],
            ],
            center: [baseLat, baseLng],
            subscriberName: subName,
            phone,
            residentsCount: residents,
            balance,
            lastCollectedTime: 'Bugun 09:30',
            lastCollectedVehicle: '85 714 UZA',
            lastCollectedDriver: 'Jasur Rahimov',
            status: 'Tozalangan',
            type: 'Hovli',
          });
        }
      });

      if (newHouses.length === 0) {
        alert('Hech qanday to‘g‘ri qator topilmadi. Format: UyRaqam, Kocha, Mahalla, Abonent, Telefon');
        return;
      }

      storageService.bulkImportHouses(newHouses);
      refreshState();
      setIsBulkImportModalOpen(false);
      setBulkCsvText('');
      showToast(`✓ ${newHouses.length} ta xonadon muvaffaqiyatli import qilindi!`);
    } catch {
      alert('CSV formatida xatolik yuz berdi');
    }
  };

  const handleLoadDemoDataset = () => {
    setBulkCsvText(`1-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Karimova Shaxnoza, +998 90 111 22 33, 4, 25000
2-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Ergashev Rustam, +998 91 222 33 44, 5, 18000
3-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Valiev Jasur, +998 93 333 44 55, 3, -15000
4-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Ahmedova Dildora, +998 94 444 55 66, 6, 32000
5-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Saidov Ulug‘bek, +998 97 555 66 77, 4, 12000
6-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Shukurova Zuhra, +998 99 666 77 88, 5, -24000
7-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Bekmurodov Mansur, +998 90 777 88 99, 4, 8000
8-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Tursunov Sherzod, +998 91 888 99 00, 7, 45000`);
  };

  // Edit House Passport
  const handleSaveHousePassport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHouse) return;
    storageService.saveHousePolygon(editingHouse);
    refreshState();
    setSelectedHouse(editingHouse);
    setEditingHouse(null);
    showToast(`✓ "${editingHouse.houseNumber}" pasport ma’lumotlari saqlandi!`);
  };

  // Drawing mode finish
  const handleFinishDraw = () => {
    if (drawPoints.length < 3) {
      alert('Poligon hosil qilish uchun kamida 3 ta nuqta bosing!');
      return;
    }
    setIsNewHouseModalOpen(true);
  };

  const handleSaveNewHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseData.houseNumber || !newHouseData.subscriberName) {
      alert('Majburiy maydonlarni to‘ldiring');
      return;
    }

    let latLngs = drawPoints;
    let centerLat = 40.0844;
    let centerLng = 65.3792;

    if (drawPoints.length === 1) {
      centerLat = drawPoints[0][0];
      centerLng = drawPoints[0][1];
      const d = 0.00015; // ~18m x 18m toza uy konturi
      latLngs = [
        [centerLat - d, centerLng - d],
        [centerLat - d, centerLng + d],
        [centerLat + d, centerLng + d],
        [centerLat + d, centerLng - d],
      ];
    } else if (drawPoints.length > 1) {
      centerLat = drawPoints.reduce((acc, p) => acc + p[0], 0) / drawPoints.length;
      centerLng = drawPoints.reduce((acc, p) => acc + p[1], 0) / drawPoints.length;
    }

    const newHouse: HousePolygon = {
      id: `house-nav-${Date.now()}`,
      code: `XON-NAV-${Math.floor(100 + Math.random() * 900)}`,
      houseNumber: newHouseData.houseNumber || '1-uy',
      streetName: newHouseData.streetName || 'G‘alaba shoh ko‘chasi',
      mahalla: newHouseData.mahalla || 'Istiqlol MFY',
      regionId: 'reg-nav-1',
      regionName: 'Navoiy shahri',
      latLngs,
      center: [centerLat, centerLng],
      subscriberName: newHouseData.subscriberName || '',
      phone: newHouseData.phone || '+998 ',
      residentsCount: Number(newHouseData.residentsCount) || 4,
      balance: Number(newHouseData.balance) || 0,
      lastCollectedTime: 'Bugun 08:30',
      lastCollectedVehicle: '85 714 UZA',
      lastCollectedDriver: 'Jasur Rahimov',
      status: (newHouseData.status as HouseStatus) || 'Tozalangan',
      type: (newHouseData.type as any) || 'Hovli',
    };

    storageService.saveHousePolygon(newHouse);
    refreshState();
    setIsNewHouseModalOpen(false);
    setIsDrawMode(false);
    setDrawPoints([]);
    setSelectedHouse(newHouse);
    showToast(`✓ "${newHouse.houseNumber}" xaritaga biriktirildi!`);
  };

  const handleSaveNewChym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChymData.name) {
      alert('Maydoncha nomini kiriting');
      return;
    }
    let camUrl = newChymData.cameraUrl;
    if (chymCameraMode === 'hilook_qr' && hilookParsedInfo) {
      camUrl = `hilook://cloud/${hilookParsedInfo.serial}/${hilookParsedInfo.channel}`;
    }

    const newChym: CHYM = {
      id: `chym-nav-${Date.now()}`,
      code: `CHYM-NAV-${Math.floor(100 + Math.random() * 900)}`,
      name: newChymData.name,
      address: newChymData.address,
      regionId: 'reg-nav-1',
      regionName: 'Navoiy shahri',
      lat: newChymData.lat,
      lng: newChymData.lng,
      containerCount: Number(newChymData.containerCount) || 4,
      cameraStatus: newChymData.hasCamera ? 'ONLINE' : 'OFFLINE',
      cameraUrl: camUrl || (newChymData.hasCamera ? 'rtsp://admin:pass@192.168.1.101:554/live' : undefined),
      lastInspectionTime: 'Bugun 09:00',
      cleanlinessStatus: 'A’lo',
      fillPercentAvg: 20,
    };
    storageService.saveCHYM(newChym);
    refreshState();
    setShowChyms(true);
    setIsNewChymModalOpen(false);
    showToast(`✓ "${newChym.name}" chiqindi maydonchasi xaritaga qo‘shildi (HiLook kamera faol)!`);
  };

  const handleSaveNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleData.plateNumber) {
      alert('Mashina davlat raqamini kiriting');
      return;
    }
    const newVeh: Vehicle = {
      id: `veh-nav-${Date.now()}`,
      plateNumber: newVehicleData.plateNumber.toUpperCase(),
      model: newVehicleData.model,
      year: 2024,
      capacityM3: Number(newVehicleData.capacityM3) || 10,
      capacityTons: 6,
      fuelType: 'Dizel / Metan',
      currentFuelPercent: 85,
      driverName: newVehicleData.driverName || 'Biriktirilmagan',
      gpsImei: newVehicleData.gpsImei || `868${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      status: 'HARAKATDA',
      speedKmH: 30,
      lat: 40.0844 + (Math.random() - 0.5) * 0.015,
      lng: 65.3792 + (Math.random() - 0.5) * 0.015,
      heading: 90,
      lastUpdated: 'Hozirgina',
    };
    storageService.saveVehicle(newVeh);
    refreshState();
    setShowVehicles(true);
    setIsNewVehicleModalOpen(false);
    showToast(`✓ "${newVeh.plateNumber}" maxsus texnikasi GPS tizimiga qo‘shildi!`);
  };

  // Filtered lists
  const filteredHouses = housePolygons.filter((h) => {
    const q = searchQuery.toLowerCase();
    return (
      h.houseNumber.toLowerCase().includes(q) ||
      h.streetName.toLowerCase().includes(q) ||
      h.subscriberName.toLowerCase().includes(q) ||
      h.mahalla.toLowerCase().includes(q)
    );
  });

  const filteredStreets = streetNetwork.filter((s) => {
    if (trackFilter !== 'ALL' && s.status !== trackFilter) return false;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.mahalla.toLowerCase().includes(q);
  });

  // Street network counters
  const greenStreetsCount = streetNetwork.filter((s) => s.status === 'green').length;
  const yellowStreetsCount = streetNetwork.filter((s) => s.status === 'yellow').length;
  const redStreetsCount = streetNetwork.filter((s) => s.status === 'red').length;

  const totalHousesCleaned = housePolygons.filter((h) => h.status === 'Tozalangan').length;
  const totalHousesPending = housePolygons.filter((h) => h.status === 'Kutilmoqda').length;
  const totalHousesOverdue = housePolygons.filter((h) => h.status === 'Muddati o‘tgan' || h.status === 'Qarzdor').length;

  return (
    <div
      className={`transition-all duration-300 ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col h-screen w-screen p-3'
          : 'space-y-4'
      }`}
    >
      {/* Top Header & GIS Command Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Compass className="h-6 w-6 text-emerald-600 animate-spin-slow" />
              Navoiy Viloyati: To‘liq GIS Xarita va Xonadonlar Pasporti
            </h1>
            <Badge variant="success" pulse>
              Jonli GPS
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mashinalar o‘tgan ko‘chalar izi (🟢 &lt;24s, 🟡 24-48s, 🔴 &gt;48s) va har bir xonadonning raqamli pasporti
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* District Quick Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => handleJumpDistrict('navoiy')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                activeDistrict === 'navoiy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Navoiy sh.
            </button>
            <button
              onClick={() => handleJumpDistrict('karmana')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                activeDistrict === 'karmana'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Karmana t.
            </button>
            <button
              onClick={() => handleJumpDistrict('qiziltepa')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                activeDistrict === 'qiziltepa'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Qiziltepa
            </button>
          </div>

          {/* Google Maps Layer Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setMapType('google_hybrid')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                mapType === 'google_hybrid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Google Maps Gibrid: Real sun'iy yo'ldosh va ko'cha nomlari"
            >
              🛰️ Google Yo‘ldosh
            </button>
            <button
              onClick={() => setMapType('google_street')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                mapType === 'google_street'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Google Maps Ko'cha"
            >
              🗺️ Google Ko‘cha
            </button>
            <button
              onClick={() => setMapType('google_satellite')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                mapType === 'google_satellite'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toza sun'iy yo'ldosh"
            >
              📷 Toza Sputnik
            </button>
            <button
              onClick={() => setMapType('dark')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                mapType === 'dark'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tungi GIS"
            >
              🌒 Tun
            </button>
          </div>

          {/* Layer Quick Show/Hide Toggles */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 text-xs font-bold">
            <button
              onClick={() => setShowVehicles(!showVehicles)}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                showVehicles
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Mashinalar GPS qatlamini yoqish/o'chirish"
            >
              🚛 Mashinalar ({vehicles.length})
            </button>
            <button
              onClick={() => setShowChyms(!showChyms)}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                showChyms
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Maydonchalar qatlamini yoqish/o'chirish"
            >
              🗑️ Maydonchalar ({chyms.length})
            </button>
            <button
              onClick={() => setShowHouses(!showHouses)}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                showHouses
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xonadonlar qatlamini yoqish/o'chirish"
            >
              🏠 Xonadonlar ({housePolygons.length})
            </button>
          </div>

          {/* Action: Add Household */}
          <button
            onClick={() => {
              setIsPointAddMode(!isPointAddMode);
              setIsChymAddMode(false);
              setIsDrawMode(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              isPointAddMode
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
            title="Xaritada bino ustiga bosib xonadon qo‘shish"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>{isPointAddMode ? 'Xaritada bosing...' : '📍 Xonadon qo‘shish'}</span>
          </button>

          {/* Action: Add Waste Container Site (CHYM) */}
          <button
            onClick={() => {
              setIsChymAddMode(!isChymAddMode);
              setIsPointAddMode(false);
              setIsDrawMode(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              isChymAddMode
                ? 'bg-blue-600 text-white ring-2 ring-blue-400 animate-pulse'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
            title="Xaritada nuqta belgilab yangi chiqindi maydonchasi (ЧЙМ) qo‘shish"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isChymAddMode ? 'Nuqta bosing...' : '🗑️ Maydoncha qo‘shish'}</span>
          </button>

          {/* Action: Add Vehicle */}
          <button
            onClick={() => setIsNewVehicleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold border border-slate-200 shadow-xs transition-all"
            title="Yangi maxsus texnika va GPS IMEI qo‘shish"
          >
            <Truck className="h-3.5 w-3.5 text-emerald-600" />
            <span>🚛 Texnika qo‘shish</span>
          </button>

          {/* Bulk Import Button */}
          <button
            onClick={() => setIsBulkImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl border border-slate-200 transition-all"
          >
            <Upload className="h-3.5 w-3.5" /> Ommaviy import (CSV)
          </button>

          {/* Full-Screen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
              isFullScreen
                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" /> Oynaga qaytish
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" /> To‘liq ekran GIS
              </>
            )}
          </button>

          {/* Simulator Toggle */}
          <button
            onClick={handleToggleSimulator}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              isSimRunning
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {isSimRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isSimRunning ? 'Simulyator faol' : 'Simulyator'}</span>
          </button>
        </div>
      </div>

      {/* Layer Toggles and 3-Color Stats Overview Bar */}
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Layer Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer font-black text-slate-800">
            <input
              type="checkbox"
              checked={showStreets}
              onChange={(e) => setShowStreets(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>🛣️ Ko‘chalar tarmog‘i ({streetNetwork.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-black text-slate-800">
            <input
              type="checkbox"
              checked={showHouses}
              onChange={(e) => setShowHouses(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>🏠 Xonadonlar ({housePolygons.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600">
            <input
              type="checkbox"
              checked={showHouseLabels}
              onChange={(e) => setShowHouseLabels(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Uy raqamlari</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-black text-slate-800">
            <input
              type="checkbox"
              checked={showVehicles}
              onChange={(e) => setShowVehicles(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>🚚 Texnikalar ({vehicles.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-black text-slate-800">
            <input
              type="checkbox"
              checked={showChyms}
              onChange={(e) => setShowChyms(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>🗑️ Konteyner maydonlari</span>
          </label>
        </div>

        {/* 3-Color Aging Scheme Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-500 text-[11px] px-1">Ko‘chalar holati:</span>
          <button
            onClick={() => setTrackFilter('ALL')}
            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
              trackFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Barchasi ({streetNetwork.length})
          </button>
          <button
            onClick={() => setTrackFilter('green')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
              trackFilter === 'green'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Yashil: &lt;24s ({greenStreetsCount})</span>
          </button>
          <button
            onClick={() => setTrackFilter('yellow')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
              trackFilter === 'yellow'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            <span>Sariq: 24-48s ({yellowStreetsCount})</span>
          </button>
          <button
            onClick={() => setTrackFilter('red')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
              trackFilter === 'red'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span>Qizil: &gt;48s ({redStreetsCount})</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Layout: Left Directory Drawer and Right Leaflet GIS Map */}
      <div
        className={`grid grid-cols-1 ${
          showSidePanel ? 'lg:grid-cols-4' : 'grid-cols-1'
        } gap-4 ${isFullScreen ? 'flex-1 h-full min-h-0' : 'h-[740px]'}`}
      >
        {/* Left Side: Directory of Streets & Houses */}
        {showSidePanel && (
          <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200/80 shadow-xs p-3.5 flex flex-col h-full min-h-0">
            {/* Search Box */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Qidiruv: uy raqami, ko‘cha, abonent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Quick Summary Counts */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Tozalangan</div>
                <div className="font-black text-emerald-600 text-xs">{totalHousesCleaned} ta</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Kutilmoqda</div>
                <div className="font-black text-amber-500 text-xs">{totalHousesPending} ta</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Muddati o‘tgan</div>
                <div className="font-black text-rose-500 text-xs">{totalHousesOverdue} ta</div>
              </div>
            </div>

            {/* Tab Selection: Ko'chalar vs Xonadonlar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Navoiy xonadonlari ({filteredHouses.length})
              </span>
              <span className="text-[10px] text-emerald-600 font-black">Xaritada bosish mumkin</span>
            </div>

            {/* House List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredHouses.slice(0, 50).map((house) => {
                const isSelected = selectedHouse?.id === house.id;
                return (
                  <div
                    key={house.id}
                    onClick={() => handleSelectHouse(house)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-emerald-600" />
                        {house.houseNumber}
                      </span>
                      <Badge
                        size="sm"
                        variant={
                          house.status === 'Tozalangan'
                            ? 'success'
                            : house.status === 'Kutilmoqda'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {house.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                      {house.streetName} ({house.mahalla})
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span className="truncate">{house.subscriberName}</span>
                      <span
                        className={`font-bold shrink-0 ${
                          house.balance < 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {house.balance.toLocaleString('uz-UZ')} so‘m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Active Vehicles Quick Selector */}
            <div className="pt-3 mt-2 border-t border-slate-100 shrink-0">
              <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Harakatdagi mashinalar:</span>
                <span className="text-[10px] text-emerald-600 font-bold">Jonli GPS</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {vehicles.slice(0, 5).map((veh) => (
                  <button
                    key={veh.id}
                    onClick={() => handleSelectVehicle(veh)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-xl border transition-all ${
                      selectedVehicle?.id === veh.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🚛 {veh.plateNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Interactive Leaflet Map Container */}
        <div
          className={`${
            showSidePanel ? 'lg:col-span-3' : 'lg:col-span-4'
          } rounded-3xl bg-white border border-slate-200/80 shadow-xs p-2 h-full min-h-0 relative overflow-hidden flex flex-col`}
        >
          <div ref={mapContainerRef} className="w-full h-full rounded-2xl" />

          {/* Floating Toggle for Side Directory */}
          <button
            onClick={() => setShowSidePanel(!showSidePanel)}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 rounded-2xl shadow-lg border border-slate-200 text-xs font-black transition-all hover:scale-105"
            title={showSidePanel ? 'Katalog panelni yashirish' : 'Katalog panelni ochish'}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>{showSidePanel ? 'Katalogni yashirish' : 'Katalogni ko‘rsatish'}</span>
          </button>

          {/* Point Add Mode floating notification */}
          {isPointAddMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-emerald-600/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-emerald-300 backdrop-blur-md animate-in slide-in-from-top duration-200">
              <MapPin className="h-4 w-4 text-emerald-200 animate-bounce" />
              <span className="text-xs font-black">
                Google Xaritadagi xonadon (uy yoki bino) ustiga bosing
              </span>
              <button
                onClick={() => setIsPointAddMode(false)}
                className="ml-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold"
              >
                Bekor qilish
              </button>
            </div>
          )}

          {/* CHYM Add Mode floating notification */}
          {isChymAddMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-blue-600/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-blue-300 backdrop-blur-md animate-in slide-in-from-top duration-200">
              <Trash2 className="h-4 w-4 text-blue-200 animate-bounce" />
              <span className="text-xs font-black">
                Xaritada yangi maydoncha (ЧЙМ) joyini bosing
              </span>
              <button
                onClick={() => setIsChymAddMode(false)}
                className="ml-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold"
              >
                Bekor qilish
              </button>
            </div>
          )}

          {/* Drawing Mode floating notification */}
          {isDrawMode && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-xl">
              <span className="text-xs font-black">Xaritada uyni burchaklarini bosing ({drawPoints.length} nuqta)</span>
              <button
                onClick={handleFinishDraw}
                disabled={drawPoints.length < 3}
                className="px-3 py-1 bg-white text-blue-800 rounded-xl text-xs font-black disabled:opacity-50"
              >
                Tugatish
              </button>
              <button
                onClick={() => {
                  setIsDrawMode(false);
                  setDrawPoints([]);
                }}
                className="p-1 text-blue-200 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Floating Selected Street Passport */}
          {selectedStreet && (
            <div className="absolute top-3 right-3 bottom-3 w-full md:w-[420px] max-w-[calc(100%-1.5rem)] bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-200 z-30 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-lg ${
                      selectedStreet.status === 'green'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : selectedStreet.status === 'yellow'
                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                        : 'bg-rose-50 border border-rose-200 text-rose-700'
                    }`}
                  >
                    🛣️
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{selectedStreet.name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedStreet.mahalla}, Uzunligi: {selectedStreet.lengthKm} km
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStreet(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Street Status Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Trek holati</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedStreet.status === 'green' ? (
                      <span className="text-emerald-700 font-black">🟢 Bugun tozalangan</span>
                    ) : selectedStreet.status === 'yellow' ? (
                      <span className="text-amber-600 font-black">🟡 1-2 kun oldin o‘tgan</span>
                    ) : (
                      <span className="text-rose-600 font-black">🔴 2 kundan ortiq o‘tilmagan</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{selectedStreet.lastPassedAt}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tozalangan uylar</div>
                  <div className="font-black text-slate-900 mt-0.5">
                    {selectedStreet.cleanedHousesCount} / {selectedStreet.housesCount} xonadon
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    {Math.round((selectedStreet.cleanedHousesCount / (selectedStreet.housesCount || 1)) * 100)}% qamrov
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Oxirgi texnika</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedStreet.vehiclePlate || '85 714 UZA'}
                  </div>
                  <div className="text-[10px] text-slate-500">Haydovchi: Jasur Rahimov</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Kechikish vaqti</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedStreet.ageHours} soat avval</div>
                  <div className="text-[10px] text-slate-500">Muntazam jadval bo‘yicha</div>
                </div>
              </div>

              {/* Action Buttons for Street */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setGenStreetName(selectedStreet.name);
                    setGenMahalla(selectedStreet.mahalla);
                    setIsAutoGenerateModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Uylar qo‘shish
                </button>

                <button
                  onClick={() => handleMarkStreetCleaned(selectedStreet.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all"
                >
                  <Check className="h-4 w-4" /> Ko‘chani tozalash
                </button>
              </div>
            </div>
          )}

          {/* Floating House Digital Passport Drawer */}
          {selectedHouse && (
            <div className="absolute top-3 right-3 bottom-3 w-full md:w-[420px] max-w-[calc(100%-1.5rem)] bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-200 z-30 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xl">
                    🏠
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {selectedHouse.houseNumber} ({selectedHouse.streetName})
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedHouse.mahalla}, {selectedHouse.regionName}
                    </p>
                    {selectedHouse.cadastreNumber && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Kadastr: {selectedHouse.cadastreNumber}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedHouse(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Passport Details Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Abonent</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedHouse.subscriberName}</div>
                  <a
                    href={`tel:${selectedHouse.phone}`}
                    className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5 hover:underline"
                  >
                    <Phone className="h-3 w-3" /> {selectedHouse.phone}
                  </a>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Aholi & Bino turi</div>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" /> {selectedHouse.residentsCount} kishi
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{selectedHouse.type}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Hisob balansi</div>
                  <div
                    className={`font-black text-sm mt-0.5 ${
                      selectedHouse.balance < 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {selectedHouse.balance.toLocaleString('uz-UZ')} so‘m
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedHouse.balance < 0 ? '⚠️ Qarzdorlik mavjud' : '✓ To‘langan'}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Oxirgi tozalash</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedHouse.lastCollectedTime}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    {selectedHouse.lastCollectedVehicle || '85 714 UZA'} ({selectedHouse.lastCollectedDriver || 'Jasur R.'})
                  </div>
                </div>
              </div>

              {/* Action Buttons for House */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingHouse(selectedHouse)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    title="Pasportni tahrirlash"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setQrHouseModal(selectedHouse)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    title="QR Pasport"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`"${selectedHouse.houseNumber}" xaritadan o‘chirilsinmi?`)) {
                        storageService.deleteHousePolygon(selectedHouse.id);
                        refreshState();
                        setSelectedHouse(null);
                        showToast('Xonadon xaritadan o‘chirildi');
                      }
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="O‘chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleMarkHouseCollected(selectedHouse)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all"
                >
                  <Check className="h-4 w-4" /> Chiqindi olindi
                </button>
              </div>
            </div>
          )}

          {/* Floating Selected Vehicle Drawer */}
          {selectedVehicle && (
            <div className="absolute top-3 right-3 bottom-3 w-full md:w-[380px] max-w-[calc(100%-1.5rem)] bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-200 z-30 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">{selectedVehicle.plateNumber}</h3>
                    <Badge variant={selectedVehicle.status === 'OFFLINE' ? 'danger' : 'success'}>
                      {selectedVehicle.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{selectedVehicle.model}</p>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tezlik</div>
                  <div className="font-black text-slate-900 mt-0.5">{selectedVehicle.speedKmH} km/h</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Yoqilg‘i</div>
                  <div className="font-black text-emerald-600 mt-0.5">{selectedVehicle.currentFuelPercent}%</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Sig‘im</div>
                  <div className="font-black text-slate-900 mt-0.5">{selectedVehicle.capacityM3} m³</div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Haydovchi:</span>
                  <span className="font-bold text-slate-900">{selectedVehicle.driverName || 'Biriktirilmagan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS IMEI:</span>
                  <span className="font-mono text-slate-800">{selectedVehicle.gpsImei}</span>
                </div>
              </div>
            </div>
          )}

          {/* Floating Layer Visibility Toggles (Pastki chap burchak) */}
          <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200 text-xs">
            <button
              onClick={() => setShowVehicles(!showVehicles)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                showVehicles
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="40 ta maxsus texnikaning jonli harakatini ko'rsatish/yashirish"
            >
              🚛 Mashinalar ({vehicles.length})
            </button>
            <button
              onClick={() => setShowChyms(!showChyms)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                showChyms
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="300 ta maydoncha va 50 ta kamera nuqtalarini ko'rsatish/yashirish"
            >
              🗑️ 300 ta Maydoncha
            </button>
            <button
              onClick={() => setShowHouses(!showHouses)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                showHouses
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="Xonadonlar pasporti va chegaralarini ko'rsatish/yashirish"
            >
              🏠 Xonadonlar ({housePolygons.length})
            </button>
            <button
              onClick={() => setShowStreets(!showStreets)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                showStreets
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="Mashinalar o'tgan ko'chalar 3-rangli izini ko'rsatish/yashirish"
            >
              🛣️ Ko‘chalar izi
            </button>
          </div>
        </div>
      </div>

      {/* Auto Generate Houses Along Street Modal */}
      <Modal
        isOpen={isAutoGenerateModalOpen}
        onClose={() => setIsAutoGenerateModalOpen(false)}
        title="Ko‘cha bo‘yicha uylarni avtomatik joylashtirish"
        subtitle="Tanlangan ko‘chaning ikki tarafiga (juft va toq) uylar poligonlarini bir zumda terib chiqish"
      >
        <form onSubmit={handleRunAutoGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ko‘chani tanlang *</label>
            <select
              value={genStreetName}
              onChange={(e) => {
                setGenStreetName(e.target.value);
                const s = streetNetwork.find((st) => st.name === e.target.value);
                if (s) setGenMahalla(s.mahalla);
              }}
              className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
            >
              {streetNetwork.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.mahalla}) — {s.lengthKm} km
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Boshlang‘ich uy raqami *</label>
              <input
                type="number"
                min="1"
                required
                value={genStartNum}
                onChange={(e) => setGenStartNum(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tugash uy raqami *</label>
              <input
                type="number"
                min="1"
                required
                value={genEndNum}
                onChange={(e) => setGenEndNum(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mahalla (MFY)</label>
              <input
                type="text"
                value={genMahalla}
                onChange={(e) => setGenMahalla(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bino turi</label>
              <select
                value={genType}
                onChange={(e) => setGenType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
              >
                <option value="Hovli">Hovli (Xususiy sektor)</option>
                <option value="Ko‘p qavatli">Ko‘p qavatli uy</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Avtomatik generatsiya afzalligi:
            </div>
            <div>
              Har bir uy koordinatasi avtomatik hisoblanadi, Navoiy abonentlari F.I.Sh., telefon raqami, aholi soni va chiqindi statusi bilan xaritaga teriladi ({Math.max(0, genEndNum - genStartNum + 1)} ta uy).
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAutoGenerateModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
            >
              Uylarni joylashtirish
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV / Excel Import Modal */}
      <Modal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        title="Xonadonlarni ommaviy yuklash (Excel / CSV)"
        subtitle="Yuzlab xonadonlarni jadval orqali bir vaqtning o‘zida xaritaga joylashtiring"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700">CSV ma’lumotlarini kiriting yoki tashlang:</label>
            <button
              type="button"
              onClick={handleLoadDemoDataset}
              className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Demo ma’lumotlarni yuklash
            </button>
          </div>

          <textarea
            rows={8}
            value={bulkCsvText}
            onChange={(e) => setBulkCsvText(e.target.value)}
            placeholder="UyRaqam, Kocha, Mahalla, Abonent, Telefon, AholiSoni, Balans&#10;1-uy, G‘alaba shoh ko‘chasi, Istiqlol MFY, Karimov Dilshod, +998 90 123 45 67, 5, 20000"
            className="w-full p-3 font-mono text-[11px] border rounded-xl border-slate-200 focus:outline-hidden focus:border-emerald-500"
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px]">
            <strong>Format talabi:</strong> Har bir qatorda quyidagilar vergul bilan ajratilgan bo‘lishi lozim:
            <br />
            <code>Uy raqami, Ko‘cha nomi, Mahalla, Abonent F.I.Sh., Telefon, Aholi soni, Balans</code>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBulkImportModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleBulkImportCsv}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
            >
              Ommaviy import qilish
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit House Passport Modal */}
      {editingHouse && (
        <Modal
          isOpen={!!editingHouse}
          onClose={() => setEditingHouse(null)}
          title={`Xonadon Pasportini Tahrirlash: ${editingHouse.houseNumber}`}
          subtitle={`${editingHouse.streetName}, ${editingHouse.mahalla}`}
        >
          <form onSubmit={handleSaveHousePassport} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Uy raqami *</label>
                <input
                  type="text"
                  required
                  value={editingHouse.houseNumber}
                  onChange={(e) => setEditingHouse({ ...editingHouse, houseNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ko‘cha nomi *</label>
                <input
                  type="text"
                  required
                  value={editingHouse.streetName}
                  onChange={(e) => setEditingHouse({ ...editingHouse, streetName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Abonent F.I.Sh. *</label>
                <input
                  type="text"
                  required
                  value={editingHouse.subscriberName}
                  onChange={(e) => setEditingHouse({ ...editingHouse, subscriberName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefon raqami *</label>
                <input
                  type="text"
                  required
                  value={editingHouse.phone}
                  onChange={(e) => setEditingHouse({ ...editingHouse, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Aholi soni</label>
                <input
                  type="number"
                  min="1"
                  value={editingHouse.residentsCount}
                  onChange={(e) => setEditingHouse({ ...editingHouse, residentsCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hisob balansi (so‘m)</label>
                <input
                  type="number"
                  value={editingHouse.balance}
                  onChange={(e) => setEditingHouse({ ...editingHouse, balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tozalash holati</label>
                <select
                  value={editingHouse.status}
                  onChange={(e) => setEditingHouse({ ...editingHouse, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
                >
                  <option value="Tozalangan">🟢 Tozalangan</option>
                  <option value="Kutilmoqda">🟡 Kutilmoqda</option>
                  <option value="Muddati o‘tgan">🔴 Muddati o‘tgan</option>
                  <option value="Qarzdor">🔴 Qarzdor</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingHouse(null)}
                className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
              >
                Saqlash
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* QR Household Passport Modal */}
      {qrHouseModal && (
        <Modal
          isOpen={!!qrHouseModal}
          onClose={() => setQrHouseModal(null)}
          title="Xonadon Raqamli QR Pasporti"
          subtitle="Abonent va tozalash xizmati uchun rasmiy QR identifikator"
        >
          <div className="p-4 flex flex-col items-center text-center space-y-3">
            <div className="h-44 w-44 bg-slate-50 border-2 border-slate-900 rounded-2xl flex flex-col items-center justify-center p-3 shadow-inner">
              <div className="font-mono text-3xl font-black tracking-widest text-slate-900">QR-CODE</div>
              <div className="font-mono text-[9px] text-slate-500 mt-1">{qrHouseModal.code}</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-2">NAVOIY TOZA HUDUD</div>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg">
                {qrHouseModal.houseNumber} ({qrHouseModal.streetName})
              </h3>
              <p className="text-xs text-slate-600">Abonent: <strong>{qrHouseModal.subscriberName}</strong></p>
              <p className="text-xs text-slate-500">Tel: {qrHouseModal.phone}</p>
              <p className="text-xs font-mono text-slate-400">ID: {qrHouseModal.code}</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Printer className="h-4 w-4" /> Chop etish (PDF)
              </button>
              <button
                onClick={() => setQrHouseModal(null)}
                className="px-4 py-2 border rounded-xl text-slate-600 text-xs font-bold"
              >
                Yopish
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Single New House Manual Creation Modal */}
      <Modal
        isOpen={isNewHouseModalOpen}
        onClose={() => setIsNewHouseModalOpen(false)}
        title="Yangi xonadonni xaritaga biriktirish"
        subtitle="Xaritada chizilgan koordinatalar bo‘yicha xonadon pasportini to‘ldiring"
      >
        <form onSubmit={handleSaveNewHouse} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Uy raqami *</label>
              <input
                type="text"
                required
                value={newHouseData.houseNumber}
                onChange={(e) => setNewHouseData({ ...newHouseData, houseNumber: e.target.value })}
                placeholder="24-uy"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ko‘cha nomi *</label>
              <input
                type="text"
                required
                value={newHouseData.streetName}
                onChange={(e) => setNewHouseData({ ...newHouseData, streetName: e.target.value })}
                placeholder="G‘alaba shoh ko‘chasi"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Abonent F.I.Sh. *</label>
              <input
                type="text"
                required
                value={newHouseData.subscriberName}
                onChange={(e) => setNewHouseData({ ...newHouseData, subscriberName: e.target.value })}
                placeholder="Karimov Dilshod"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefon raqami *</label>
              <input
                type="text"
                required
                value={newHouseData.phone}
                onChange={(e) => setNewHouseData({ ...newHouseData, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewHouseModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
            >
              Xaritaga saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* New CHYM (Chiqindi maydonchasi) Modal */}
      <Modal
        isOpen={isNewChymModalOpen}
        onClose={() => setIsNewChymModalOpen(false)}
        title="Yangi Chiqindi Maydonchasi (ЧЙМ) qo‘shish"
        subtitle="Xaritada tanlangan koordinataga yangi maydoncha va kamera biriktirish"
      >
        <form onSubmit={handleSaveNewChym} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Maydoncha nomi *</label>
              <input
                type="text"
                required
                value={newChymData.name}
                onChange={(e) => setNewChymData({ ...newChymData, name: e.target.value })}
                placeholder="24-sonli ЧЙМ"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Konteynerlar sig‘imi (dona) *</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={newChymData.containerCount}
                onChange={(e) => setNewChymData({ ...newChymData, containerCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Manzil / Mo‘ljal *</label>
              <input
                type="text"
                required
                value={newChymData.address}
                onChange={(e) => setNewChymData({ ...newChymData, address: e.target.value })}
                placeholder="G‘alaba shoh ko‘chasi, 12-uy ro‘parasi"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mahalla (MFY) *</label>
              <input
                type="text"
                required
                value={newChymData.mahalla}
                onChange={(e) => setNewChymData({ ...newChymData, mahalla: e.target.value })}
                placeholder="Istiqlol MFY"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Camera integration checkbox */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newChymData.hasCamera}
                onChange={(e) => setNewChymData({ ...newChymData, hasCamera: e.target.checked })}
                className="rounded text-emerald-600 h-4 w-4"
              />
              <span className="font-bold text-slate-800">Ushbu maydonchaga videokamera o‘rnatilgan</span>
            </label>

            {newChymData.hasCamera && (
              <div className="space-y-3 pt-1 animate-in fade-in">
                {/* Method selector tabs */}
                <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-[11px]">
                  <button
                    type="button"
                    onClick={() => setChymCameraMode('hilook_qr')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                      chymCameraMode === 'hilook_qr'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📱 HiLook QR Kod orqali ulash
                  </button>
                  <button
                    type="button"
                    onClick={() => setChymCameraMode('ip')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                      chymCameraMode === 'ip'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌐 Lokal IP / RTSP orqali
                  </button>
                </div>

                {/* Tab 1: HiLook QR Code Integration */}
                {chymCameraMode === 'hilook_qr' && (
                  <div className="space-y-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-emerald-900 text-[11px]">
                          HiLookVision «Ulashish» (Share) QR kodi:
                        </span>
                        <p className="text-[10px] text-emerald-700 mt-0.5">
                          HiLookVision ilovasida kameraning <strong>«Ulashish / Поделиться»</strong> bo‘limidagi QR kod matnini yoki havolasini kiriting.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleParseHilookQr(
                            'https://www.hik-connect.com/share/device?serial=D98421034&code=K7X9PQ&channel=1'
                          )
                        }
                        className="shrink-0 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs"
                      >
                        ⚡ Namuna QR sinash
                      </button>
                    </div>

                    <input
                      type="text"
                      value={hilookQrInput}
                      onChange={(e) => handleParseHilookQr(e.target.value)}
                      placeholder="HiLook QR matni yoki havolasini joylashtiring (Paste)..."
                      className="w-full px-2.5 py-2 border rounded-lg border-emerald-300 font-mono text-[11px] bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />

                    {/* Detected HiLook Info Badge */}
                    {hilookParsedInfo && (
                      <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-[11px] space-y-1 animate-in zoom-in-95">
                        <div className="flex items-center justify-between text-emerald-800 font-bold">
                          <span>✓ HiLook P2P Ulanish tasdiqlandi</span>
                          <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">
                            ONLINE
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-600 font-mono pt-1">
                          <div>
                            <span className="text-slate-400">Seriya:</span> {hilookParsedInfo.serial}
                          </div>
                          <div>
                            <span className="text-slate-400">Tekshiruv:</span> {hilookParsedInfo.verifyCode}
                          </div>
                          <div>
                            <span className="text-slate-400">Kanal:</span> {hilookParsedInfo.channel}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: IP / RTSP Integration */}
                {chymCameraMode === 'ip' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">HiLook DVR / Kamera IP manzili</label>
                      <input
                        type="text"
                        value={newChymData.cameraIp}
                        onChange={(e) => setNewChymData({ ...newChymData, cameraIp: e.target.value })}
                        placeholder="192.168.1.64 yoki dvr.navoiy.uz"
                        className="w-full px-2.5 py-1.5 border rounded-lg border-slate-200 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Kanal raqami / RTSP Stream</label>
                      <input
                        type="text"
                        value={newChymData.cameraUrl}
                        onChange={(e) => setNewChymData({ ...newChymData, cameraUrl: e.target.value })}
                        placeholder="Kanal 1 (101) yoki rtsp://"
                        className="w-full px-2.5 py-1.5 border rounded-lg border-slate-200 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewChymModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
            >
              Maydonchani saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* New Vehicle (Maxsus texnika) Modal */}
      <Modal
        isOpen={isNewVehicleModalOpen}
        onClose={() => setIsNewVehicleModalOpen(false)}
        title="Yangi Maxsus Texnika va GPS Ulanish"
        subtitle="Chiqindi tashuvchi mashina va uning GPS treker parametrlarini kiritish"
      >
        <form onSubmit={handleSaveNewVehicle} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Davlat raqami *</label>
              <input
                type="text"
                required
                value={newVehicleData.plateNumber}
                onChange={(e) => setNewVehicleData({ ...newVehicleData, plateNumber: e.target.value })}
                placeholder="85 714 UZA"
                className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono uppercase font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Avtomobil modeli *</label>
              <input
                type="text"
                required
                value={newVehicleData.model}
                onChange={(e) => setNewVehicleData({ ...newVehicleData, model: e.target.value })}
                placeholder="Isuzu NPR 75 / KamAZ"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Biriktirilgan haydovchi</label>
              <input
                type="text"
                value={newVehicleData.driverName}
                onChange={(e) => setNewVehicleData({ ...newVehicleData, driverName: e.target.value })}
                placeholder="Jasur Rahimov"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Haydovchi telefoni</label>
              <input
                type="text"
                value={newVehicleData.driverPhone}
                onChange={(e) => setNewVehicleData({ ...newVehicleData, driverPhone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kuzov sig‘imi (m³) *</label>
              <input
                type="number"
                min="3"
                max="30"
                required
                value={newVehicleData.capacityM3}
                onChange={(e) => setNewVehicleData({ ...newVehicleData, capacityM3: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">GPS Tracker IMEI / ID</label>
              <input
                type="text"
                value={newVehicleData.gpsImei}
                onChange={(e) => setNewVehicleData({ ...newVehicleData, gpsImei: e.target.value })}
                placeholder="868123456789012"
                className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewVehicleModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
            >
              Texnikani saqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
