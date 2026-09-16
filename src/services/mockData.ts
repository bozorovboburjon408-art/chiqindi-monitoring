import {
  User,
  Subscriber,
  Household,
  Region,
  Complaint,
  Vehicle,
  Driver,
  Route,
  CHYM,
  Container,
  AppNotification,
  ServiceRating,
  SystemSettings,
  HousePolygon,
  GpsTrackSegment,
  StreetNetworkItem,
} from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Dilshod Karimov',
    role: 'SUPER_ADMIN',
    email: 'admin@ecocontrol-navoiy.uz',
    phone: '+998 79 220 12 34',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    active: true,
  },
  {
    id: 'usr-2',
    name: 'Nargiza Alimova',
    role: 'RAHBARIYAT',
    email: 'boshliq@navoiy-tozahudud.uz',
    phone: '+998 90 987 65 43',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    active: true,
  },
  {
    id: 'usr-3',
    name: 'Sherzodbek Qodirov',
    role: 'DISPETCHER',
    email: 'dispetcher@navoiy-tozahudud.uz',
    phone: '+998 93 555 11 22',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    active: true,
  },
  {
    id: 'usr-4',
    name: 'Ulug‘bek Rustamov',
    role: 'HUDUD_MASULI',
    email: 'karmana@navoiy-tozahudud.uz',
    phone: '+998 97 700 88 99',
    regionId: 'reg-nav-2',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    active: true,
  },
  {
    id: 'usr-5',
    name: 'Bekzod Tursunov',
    role: 'BRIGADA_MASULI',
    email: 'brigada1@navoiy-tozahudud.uz',
    phone: '+998 91 333 44 55',
    active: true,
  },
  {
    id: 'usr-6',
    name: 'Jasur Rahimov',
    role: 'HAYDOVCHI',
    email: 'jasur.driver@navoiy-tozahudud.uz',
    phone: '+998 94 444 77 88',
    vehicleId: 'veh-1',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    active: true,
  },
  {
    id: 'usr-7',
    name: 'Aziza Madrahimova',
    role: 'ABONENT',
    email: 'aziza.resident@mail.uz',
    phone: '+998 90 321 00 11',
    regionId: 'reg-nav-1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    active: true,
  },
];

// Navoiy viloyati tumanlari va shaharlari
export const initialRegions: Region[] = [
  {
    id: 'reg-nav-1',
    name: 'Navoiy shahri',
    code: 'NAV',
    inspectorName: 'Bobur Mirzayev',
    inspectorPhone: '+998 90 715 00 11',
    chymCount: 48,
    containersCount: 220,
    population: 155000,
    activeVehiclesCount: 8,
  },
  {
    id: 'reg-nav-2',
    name: 'Karmana tumani',
    code: 'KRM',
    inspectorName: 'Ulug‘bek Rustamov',
    inspectorPhone: '+998 97 700 88 99',
    chymCount: 36,
    containersCount: 154,
    population: 135000,
    activeVehiclesCount: 6,
  },
  {
    id: 'reg-nav-3',
    name: 'Qiziltepa tumani',
    code: 'QZT',
    inspectorName: 'Farrux Saidov',
    inspectorPhone: '+998 93 111 22 33',
    chymCount: 32,
    containersCount: 130,
    population: 160000,
    activeVehiclesCount: 5,
  },
  {
    id: 'reg-nav-4',
    name: 'Zarafshon shahri',
    code: 'ZAR',
    inspectorName: 'Sanjar Ergashev',
    inspectorPhone: '+998 99 444 55 66',
    chymCount: 30,
    containersCount: 140,
    population: 86000,
    activeVehiclesCount: 5,
  },
  {
    id: 'reg-nav-5',
    name: 'Xatirchi tumani',
    code: 'XTCH',
    inspectorName: 'Olimjon Xolmatov',
    inspectorPhone: '+998 91 888 99 00',
    chymCount: 28,
    containersCount: 110,
    population: 205000,
    activeVehiclesCount: 4,
  },
];

// Navoiy shahridagi Chiqindi Yig‘ish Maydonchalari (ЧЙМ)
export const initialCHYMs: CHYM[] = [
  {
    id: 'chym-1',
    code: 'CHYM-NAV-01',
    name: 'G‘alaba shoh ko‘chasi, 12-uy maydonchasi',
    address: 'Navoiy sh., G‘alaba sh., 12-uy',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    lat: 40.0862,
    lng: 65.3785,
    containerCount: 5,
    cameraStatus: 'ONLINE',
    cameraUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
    lastInspectionTime: '2026-09-16 11:30',
    cleanlinessStatus: 'Yaxshi',
    fillPercentAvg: 75,
  },
  {
    id: 'chym-2',
    code: 'CHYM-NAV-02',
    name: 'Islom Karimov shoh ko‘chasi, 45-uy ro‘parasi',
    address: 'Navoiy sh., I.Karimov sh., 45-uy',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    lat: 40.0895,
    lng: 65.3850,
    containerCount: 4,
    cameraStatus: 'ONLINE',
    cameraUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600',
    lastInspectionTime: '2026-09-16 14:15',
    cleanlinessStatus: 'A’lo',
    fillPercentAvg: 40,
  },
  {
    id: 'chym-3',
    code: 'CHYM-NAV-03',
    name: 'Matonat MFY, Tarobiy ko‘chasi 18-uy',
    address: 'Navoiy sh., Tarobiy ko‘chasi, 18-uy',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    lat: 40.0815,
    lng: 65.3712,
    containerCount: 4,
    cameraStatus: 'ONLINE',
    cameraUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    lastInspectionTime: '2026-09-16 09:00',
    cleanlinessStatus: 'Qoniqarsiz',
    fillPercentAvg: 100, // CRITICAL FULL
  },
  {
    id: 'chym-4',
    code: 'CHYM-NAV-04',
    name: 'Istiqlol MFY, Spitamenn ko‘chasi 7-uy',
    address: 'Navoiy sh., Spitamenn ko‘chasi, 7-uy',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    lat: 40.0841,
    lng: 65.3675,
    containerCount: 4,
    cameraStatus: 'ONLINE',
    lastInspectionTime: '2026-09-16 10:45',
    cleanlinessStatus: 'Yaxshi',
    fillPercentAvg: 88, // DANGER
  },
  {
    id: 'chym-5',
    code: 'CHYM-KRM-01',
    name: 'Karmana markazi, Toshkent yo‘li 22-uy',
    address: 'Karmana t., Toshkent yo‘li, 22-uy',
    regionId: 'reg-nav-2',
    regionName: 'Karmana tumani',
    lat: 40.1345,
    lng: 65.3615,
    containerCount: 5,
    cameraStatus: 'ONLINE',
    lastInspectionTime: '2026-09-16 12:20',
    cleanlinessStatus: 'A’lo',
    fillPercentAvg: 35,
  },
  {
    id: 'chym-6',
    code: 'CHYM-KRM-02',
    name: 'Karmana, Mir Said Bahrom MFY',
    address: 'Karmana t., Mir Said Bahrom ko‘chasi',
    regionId: 'reg-nav-2',
    regionName: 'Karmana tumani',
    lat: 40.1412,
    lng: 65.3680,
    containerCount: 4,
    cameraStatus: 'ONLINE',
    lastInspectionTime: '2026-09-16 13:00',
    cleanlinessStatus: 'Yaxshi',
    fillPercentAvg: 60,
  },
];

// Maxsus chiqindi tashuvchi texnikalar (85 - Navoiy viloyati)
export const initialVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    plateNumber: '85 714 UZA',
    model: 'ISUZU NPR 75L (Kompaktor)',
    year: 2023,
    capacityM3: 10,
    capacityTons: 5.5,
    fuelType: 'Dizel',
    currentFuelPercent: 84,
    driverId: 'drv-1',
    driverName: 'Jasur Rahimov',
    gpsImei: '869402058192019',
    status: 'HARAKATDA',
    speedKmH: 32,
    lat: 40.0855,
    lng: 65.3760,
    heading: 90,
    lastUpdated: 'Hozirgina',
    currentRouteId: 'rt-1',
  },
  {
    id: 'veh-2',
    plateNumber: '85 820 BAA',
    model: 'MAN TGS 26.360',
    year: 2022,
    capacityM3: 18,
    capacityTons: 12.0,
    fuelType: 'Metan gaz',
    currentFuelPercent: 68,
    driverId: 'drv-2',
    driverName: 'Bobur Mirzayev',
    gpsImei: '869402058192020',
    status: 'HARAKATDA',
    speedKmH: 38,
    lat: 40.0890,
    lng: 65.3840,
    heading: 180,
    lastUpdated: '1 daqiqa oldin',
    currentRouteId: 'rt-2',
  },
  {
    id: 'veh-3',
    plateNumber: '85 930 VAA',
    model: 'KamAZ 53605 Ko-440',
    year: 2021,
    capacityM3: 16,
    capacityTons: 10.0,
    fuelType: 'Dizel',
    currentFuelPercent: 45,
    driverId: 'drv-3',
    driverName: 'Alisher Qosimov',
    gpsImei: '869402058192021',
    status: 'TO‘XTAGAN',
    speedKmH: 0,
    lat: 40.0820,
    lng: 65.3725,
    heading: 0,
    lastUpdated: '2 daqiqa oldin',
  },
  {
    id: 'veh-4',
    plateNumber: '85 450 EAA',
    model: 'ISUZU NQR 71 PL',
    year: 2024,
    capacityM3: 8,
    capacityTons: 4.5,
    fuelType: 'Dizel',
    currentFuelPercent: 92,
    driverId: 'drv-4',
    driverName: 'Temur Normatov',
    gpsImei: '869402058192022',
    status: 'HARAKATDA',
    speedKmH: 26,
    lat: 40.1360,
    lng: 65.3630,
    heading: 270,
    lastUpdated: 'Hozirgina',
  },
  {
    id: 'veh-5',
    plateNumber: '85 777 ZAA',
    model: 'MAN TGS 26.360',
    year: 2023,
    capacityM3: 20,
    capacityTons: 14.0,
    fuelType: 'Dizel',
    currentFuelPercent: 55,
    driverId: 'drv-5',
    driverName: 'Ravshan Xolmatov',
    gpsImei: '869402058192024',
    status: 'OFFLINE', // ALERT
    speedKmH: 0,
    lat: 40.0780,
    lng: 65.3650,
    heading: 0,
    lastUpdated: '2 soat oldin',
  },
];

export const initialDrivers: Driver[] = [
  {
    id: 'drv-1',
    fullName: 'Jasur Rahimov',
    phone: '+998 94 444 77 88',
    licenseNumber: 'AA 9845123',
    experienceYears: 7,
    vehicleId: 'veh-1',
    vehiclePlate: '85 714 UZA',
    rating: 4.9,
    status: 'Faol',
  },
  {
    id: 'drv-2',
    fullName: 'Bobur Mirzayev',
    phone: '+998 90 888 12 34',
    licenseNumber: 'AA 7412589',
    experienceYears: 10,
    vehicleId: 'veh-2',
    vehiclePlate: '85 820 BAA',
    rating: 4.8,
    status: 'Faol',
  },
  {
    id: 'drv-3',
    fullName: 'Alisher Qosimov',
    phone: '+998 91 999 44 22',
    licenseNumber: 'AB 6325418',
    experienceYears: 12,
    vehicleId: 'veh-3',
    vehiclePlate: '85 930 VAA',
    rating: 4.7,
    status: 'Faol',
  },
  {
    id: 'drv-4',
    fullName: 'Temur Normatov',
    phone: '+998 97 123 98 76',
    licenseNumber: 'AC 1254789',
    experienceYears: 5,
    vehicleId: 'veh-4',
    vehiclePlate: '85 450 EAA',
    rating: 4.9,
    status: 'Faol',
  },
  {
    id: 'drv-5',
    fullName: 'Ravshan Xolmatov',
    phone: '+998 90 555 77 99',
    licenseNumber: 'AE 8521473',
    experienceYears: 14,
    vehicleId: 'veh-5',
    vehiclePlate: '85 777 ZAA',
    rating: 4.5,
    status: 'Faol',
  },
];

// 1-VAZIFA: GPS MASHINA IZLARI (TREK) - 3 XIL RANGDA
// Yashil: < 24 soat (Bugun o'tgan)
// Sariq: 24 - 48 soat (1-2 kun oldin o'tgan)
// Qizil: > 48 soat (3+ kun oldin o'tgan / muddat o'tgan)
export const initialTrackSegments: GpsTrackSegment[] = [
  // 🟢 Yashil: G'alaba shoh ko'chasi bo'ylab bugun ertalab o'tgan
  {
    id: 'trk-1',
    vehicleId: 'veh-1',
    vehiclePlate: '85 714 UZA',
    streetName: 'G‘alaba shoh ko‘chasi (12-mavze - Istiqlol)',
    path: [
      [40.0885, 65.3720],
      [40.0872, 65.3755],
      [40.0862, 65.3785],
      [40.0850, 65.3820],
      [40.0840, 65.3850],
    ],
    passedAt: 'Bugun 08:30',
    ageHours: 4,
    colorCategory: 'green',
  },
  // 🟢 Yashil: Islom Karimov shoh ko'chasi shimoliy qismi
  {
    id: 'trk-2',
    vehicleId: 'veh-2',
    vehiclePlate: '85 820 BAA',
    streetName: 'Islom Karimov shoh ko‘chasi (Shimoliy)',
    path: [
      [40.0920, 65.3820],
      [40.0905, 65.3840],
      [40.0895, 65.3850],
      [40.0875, 65.3865],
    ],
    passedAt: 'Bugun 09:45',
    ageHours: 3,
    colorCategory: 'green',
  },
  // 🟡 Sariq: Tarobiy ko'chasi (Kecha 16:00 da o'tgan, yaqin vaqtda tozalanishi lozim)
  {
    id: 'trk-3',
    vehicleId: 'veh-1',
    vehiclePlate: '85 714 UZA',
    streetName: 'Tarobiy ko‘chasi (Matonat MFY)',
    path: [
      [40.0835, 65.3690],
      [40.0825, 65.3705],
      [40.0815, 65.3712],
      [40.0805, 65.3730],
      [40.0795, 65.3750],
    ],
    passedAt: 'Kecha 16:15',
    ageHours: 26,
    colorCategory: 'yellow',
  },
  // 🟡 Sariq: Spitamenn ko'chasi
  {
    id: 'trk-4',
    vehicleId: 'veh-3',
    vehiclePlate: '85 930 VAA',
    streetName: 'Spitamenn ko‘chasi (Istiqlol MFY)',
    path: [
      [40.0860, 65.3660],
      [40.0850, 65.3670],
      [40.0841, 65.3675],
      [40.0830, 65.3685],
    ],
    passedAt: 'Kecha 11:20',
    ageHours: 31,
    colorCategory: 'yellow',
  },
  // 🔴 Qizil: Tolstoy va Zarafshon ko'chalari (3 kundan ortiq o'tilmagan / Favqulodda tozalash talab qilinadi)
  {
    id: 'trk-5',
    vehicleId: 'veh-5',
    vehiclePlate: '85 777 ZAA',
    streetName: 'Tolstoy ko‘chasi (Orqa sektor)',
    path: [
      [40.0790, 65.3640],
      [40.0782, 65.3665],
      [40.0775, 65.3690],
      [40.0768, 65.3715],
    ],
    passedAt: '3 kun oldin',
    ageHours: 74,
    colorCategory: 'red',
  },
  // 🔴 Qizil: Ibn Sino ko'chasi
  {
    id: 'trk-6',
    vehicleId: 'veh-4',
    vehiclePlate: '85 450 EAA',
    streetName: 'Ibn Sino ko‘chasi (Sanoat hududiga yaqin)',
    path: [
      [40.0760, 65.3740],
      [40.0750, 65.3770],
      [40.0740, 65.3800],
    ],
    passedAt: '4 kun oldin',
    ageHours: 96,
    colorCategory: 'red',
  },
  // 🟢 Yashil: Karmana Toshkent yo'li markaziy qismi
  {
    id: 'trk-7',
    vehicleId: 'veh-4',
    vehiclePlate: '85 450 EAA',
    streetName: 'Karmana Toshkent yo‘li magistrali',
    path: [
      [40.1310, 65.3580],
      [40.1330, 65.3600],
      [40.1345, 65.3615],
      [40.1370, 65.3640],
    ],
    passedAt: 'Bugun 11:10',
    ageHours: 2,
    colorCategory: 'green',
  },
];

// 1-VAZIFA: NAVOIY VILOYATI VA SHAHRI BO'YICHA 3 XIL RANGDAGI KO'CHALAR TARMOG'I (STREET NETWORK)
// 🟢 Yashil: < 24 soat (Bugun tozalangan)
// 🟡 Sariq: 24-48 soat (1-2 kun oldin o'tgan)
// 🔴 Qizil: > 48 soat (2 kundan ortiq o'tilmagan / Kechikkan)
export const initialStreetNetwork: StreetNetworkItem[] = [
  {
    id: 'str-1',
    name: 'G‘alaba shoh ko‘chasi',
    mahalla: 'Istiqlol MFY',
    status: 'green',
    ageHours: 1.2,
    lastPassedAt: 'Bugun 09:30',
    vehiclePlate: '85 714 UZA',
    housesCount: 18,
    cleanedHousesCount: 18,
    lengthKm: 2.4,
    path: [
      [40.0890, 65.3750],
      [40.0875, 65.3770],
      [40.0855, 65.3795],
      [40.0835, 65.3820],
      [40.0815, 65.3845],
    ],
  },
  {
    id: 'str-2',
    name: 'Islom Karimov shoh ko‘chasi',
    mahalla: 'Zarafshon MFY',
    status: 'green',
    ageHours: 2.0,
    lastPassedAt: 'Bugun 10:15',
    vehiclePlate: '85 820 BAA',
    housesCount: 20,
    cleanedHousesCount: 19,
    lengthKm: 3.1,
    path: [
      [40.0930, 65.3800],
      [40.0910, 65.3830],
      [40.0885, 65.3860],
      [40.0860, 65.3890],
      [40.0835, 65.3920],
    ],
  },
  {
    id: 'str-3',
    name: 'Karmana Toshkent yo‘li magistrali',
    mahalla: 'Karmana markazi',
    status: 'green',
    ageHours: 2.8,
    lastPassedAt: 'Bugun 11:10',
    vehiclePlate: '85 450 EAA',
    housesCount: 16,
    cleanedHousesCount: 16,
    lengthKm: 4.2,
    path: [
      [40.1280, 65.3540],
      [40.1310, 65.3580],
      [40.1330, 65.3600],
      [40.1350, 65.3620],
      [40.1375, 65.3645],
    ],
  },
  {
    id: 'str-4',
    name: 'Al-Beruniy shoh ko‘chasi',
    mahalla: 'Bunyodkor MFY',
    status: 'green',
    ageHours: 3.5,
    lastPassedAt: 'Bugun 08:15',
    vehiclePlate: '85 555 SAA',
    housesCount: 14,
    cleanedHousesCount: 14,
    lengthKm: 1.8,
    path: [
      [40.0895, 65.3710],
      [40.0880, 65.3735],
      [40.0865, 65.3755],
      [40.0845, 65.3775],
    ],
  },
  {
    id: 'str-5',
    name: 'Spitamenn ko‘chasi',
    mahalla: 'Istiqlol MFY',
    status: 'yellow',
    ageHours: 26,
    lastPassedAt: 'Kecha 11:20',
    vehiclePlate: '85 930 VAA',
    housesCount: 14,
    cleanedHousesCount: 9,
    lengthKm: 1.9,
    path: [
      [40.0865, 65.3650],
      [40.0850, 65.3670],
      [40.0835, 65.3685],
      [40.0820, 65.3700],
    ],
  },
  {
    id: 'str-6',
    name: 'Amir Temur shoh ko‘chasi',
    mahalla: 'Kimyogar MFY',
    status: 'yellow',
    ageHours: 31,
    lastPassedAt: 'Kecha 14:40',
    vehiclePlate: '85 101 AAA',
    housesCount: 18,
    cleanedHousesCount: 11,
    lengthKm: 2.8,
    path: [
      [40.0810, 65.3850],
      [40.0800, 65.3875],
      [40.0785, 65.3905],
      [40.0770, 65.3930],
    ],
  },
  {
    id: 'str-7',
    name: 'Ibn Sino ko‘chasi',
    mahalla: 'Sanoat MFY',
    status: 'yellow',
    ageHours: 39,
    lastPassedAt: 'Kecha 08:30',
    vehiclePlate: '85 450 EAA',
    housesCount: 12,
    cleanedHousesCount: 6,
    lengthKm: 1.6,
    path: [
      [40.0760, 65.3740],
      [40.0750, 65.3770],
      [40.0740, 65.3800],
      [40.0730, 65.3830],
    ],
  },
  {
    id: 'str-8',
    name: 'Tarobiy ko‘chasi',
    mahalla: 'Matonat MFY',
    status: 'red',
    ageHours: 54,
    lastPassedAt: '2 kun oldin',
    vehiclePlate: '85 714 UZA',
    housesCount: 16,
    cleanedHousesCount: 3,
    lengthKm: 2.2,
    path: [
      [40.0835, 65.3690],
      [40.0825, 65.3705],
      [40.0815, 65.3712],
      [40.0805, 65.3730],
      [40.0795, 65.3750],
    ],
  },
  {
    id: 'str-9',
    name: 'Tolstoy ko‘chasi',
    mahalla: 'Do‘stlik MFY',
    status: 'red',
    ageHours: 72,
    lastPassedAt: '3 kun oldin',
    vehiclePlate: '85 777 ZAA',
    housesCount: 14,
    cleanedHousesCount: 2,
    lengthKm: 1.7,
    path: [
      [40.0790, 65.3640],
      [40.0782, 65.3665],
      [40.0775, 65.3690],
      [40.0768, 65.3715],
    ],
  },
  {
    id: 'str-10',
    name: 'Mir Said Bahrom ko‘chasi',
    mahalla: 'Bahrom MFY (Karmana)',
    status: 'red',
    ageHours: 92,
    lastPassedAt: '4 kun oldin',
    vehiclePlate: '85 450 EAA',
    housesCount: 15,
    cleanedHousesCount: 1,
    lengthKm: 2.5,
    path: [
      [40.1380, 65.3660],
      [40.1400, 65.3685],
      [40.1420, 65.3710],
      [40.1440, 65.3735],
    ],
  },
];

// 2-VAZIFA: NAVOIY SHAHRIDAGI HAR BIR UYNING RAQAMLI POLIGONLARI VA PASPORTI
// Ko‘chalar bo‘ylab 80 dan ortiq xonadonlar (juft va toq tomonlar bo‘yicha to‘liq shakllantirilgan)
const uzbekNames = [
  'Dilshod Karimov', 'Nodira To‘rayeva', 'Alisher Boboyev', 'Feruza Ergasheva',
  'Sardor Rustamov', 'Malika Nazarova', 'Jamshid Valiev', 'Sanjar Po‘latov',
  'Gulnora Karimova', 'Bobur Mirzayev', 'Shohruh Xalilov', 'Shahnoza Usmonova',
  'Jasur Rahimov', 'Ziyoda Yoqubova', 'Anvar Qodirov', 'Dildora Ahmedova',
  'Otabek Normurodov', 'Madina Jo‘rayeva', 'Ulug‘bek Saidov', 'Zuhra Shukurova',
  'Mansur Bekmurodov', 'Gulbahor Alimova', 'Sherzod Tursunov', 'Nafisa Xoliqova',
  'Farrux Rahmatov', 'Saodat Bozorova', 'Ilhom Mahmudov', 'Laylo Ismoilova',
  'Rustam Fayziyev', 'Komila Samadova', 'Javlon Nabiyev', 'Muxabbat Ochilova',
];

const createHousePolygon = (
  id: string,
  houseNum: number,
  street: StreetNetworkItem,
  t: number, // 0 to 1 along street path
  side: 1 | -1 // 1: right side, -1: left side
): HousePolygon => {
  const pIdx = Math.min(Math.floor(t * (street.path.length - 1)), street.path.length - 2);
  const p1 = street.path[pIdx];
  const p2 = street.path[pIdx + 1];
  const localT = (t * (street.path.length - 1)) - pIdx;

  const lat = p1[0] + (p2[0] - p1[0]) * localT;
  const lng = p1[1] + (p2[1] - p1[1]) * localT;

  // Normal vector for street offset
  const dLat = p2[0] - p1[0];
  const dLng = p2[1] - p1[1];
  const len = Math.hypot(dLat, dLng) || 0.001;
  const nLat = (-dLng / len) * 0.00045 * side;
  const nLng = (dLat / len) * 0.00045 * side;

  const cLat = lat + nLat;
  const cLng = lng + nLng;

  // Box polygon coordinates around center
  const dW = 0.00022;
  const dH = 0.00022;
  const latLngs: [number, number][] = [
    [cLat - dW, cLng - dH],
    [cLat - dW, cLng + dH],
    [cLat + dW, cLng + dH],
    [cLat + dW, cLng - dH],
  ];

  const nameIdx = (houseNum + street.name.length) % uzbekNames.length;
  const subscriberName = uzbekNames[nameIdx];
  const residentsCount = ((houseNum * 3) % 5) + 3;
  
  // Status correlates with street status, with some real life variance
  let status: HousePolygon['status'] = 'Tozalangan';
  let balance = 15000 + (houseNum % 7) * 8000;
  let lastTime = 'Bugun 08:35';

  if (street.status === 'red') {
    status = (houseNum % 4 === 0) ? 'Kutilmoqda' : 'Muddati o‘tgan';
    balance = -24000 - (houseNum % 5) * 12000;
    lastTime = '3 kun oldin';
  } else if (street.status === 'yellow') {
    status = (houseNum % 2 === 0) ? 'Kutilmoqda' : 'Tozalangan';
    balance = (houseNum % 3 === 0) ? -16000 : 12000;
    lastTime = 'Kecha 16:20';
  } else {
    // Green street
    status = (houseNum % 8 === 0) ? 'Qarzdor' : 'Tozalangan';
    if (status === 'Qarzdor') balance = -18000;
    lastTime = 'Bugun 09:15';
  }

  const houseType: HousePolygon['type'] = (street.name.includes('shoh') && houseNum % 2 === 0)
    ? 'Ko‘p qavatli'
    : 'Hovli';

  return {
    id,
    code: `XON-NAV-${String(houseNum).padStart(3, '0')}`,
    houseNumber: `${houseNum}-uy`,
    streetName: street.name,
    mahalla: street.mahalla,
    regionId: 'reg-nav-1',
    regionName: street.name.includes('Karmana') ? 'Karmana tumani' : 'Navoiy shahri',
    latLngs,
    center: [cLat, cLng],
    subscriberName,
    phone: `+998 9${(houseNum % 9) + 0} ${Math.floor(100 + (houseNum * 37) % 899)} ${Math.floor(10 + (houseNum * 13) % 89)} ${Math.floor(10 + (houseNum * 29) % 89)}`,
    residentsCount,
    balance,
    lastCollectedTime: lastTime,
    lastCollectedVehicle: street.vehiclePlate || '85 714 UZA',
    lastCollectedDriver: 'Jasur Rahimov',
    status,
    type: houseType,
    cadastreNumber: `16:01:0${(houseNum % 4) + 1}:0${houseNum}:00${(houseNum % 9) + 1}`,
  };
};

export const initialHousePolygons: HousePolygon[] = [];

// Populate 85+ realistic houses along Navoiy streets
initialStreetNetwork.forEach((street) => {
  const count = street.housesCount || 14;
  for (let i = 1; i <= count; i++) {
    const t = (i - 0.5) / count;
    const side: 1 | -1 = i % 2 === 1 ? 1 : -1;
    const house = createHousePolygon(`house-${street.id}-${i}`, i, street, t, side);
    initialHousePolygons.push(house);
  }
});


// Konteynerlar (Navoiy shahri maydonchalariga biriktirilgan)
export const initialContainers: Container[] = [];
const wasteTypes: Container['wasteType'][] = ['Aralash', 'Plastmassa', 'Qog‘oz', 'Shisha', 'Organik'];

initialCHYMs.forEach((chym, cIndex) => {
  for (let i = 1; i <= chym.containerCount; i++) {
    const contId = `cnt-nav-${cIndex * 10 + i}`;
    const code = `KNT-NAV-${String(cIndex * 5 + i).padStart(3, '0')}`;
    const wasteType = wasteTypes[(i - 1) % wasteTypes.length];
    
    let fill = Math.round(((cIndex * 19 + i * 27) % 85) + 15);
    if (chym.fillPercentAvg === 100 && i <= 2) fill = 100;
    else if (chym.fillPercentAvg >= 85 && i === 1) fill = 92;

    let status: Container['status'] = 'Normal';
    if (fill === 100) status = 'To‘lgan';
    else if (fill >= 80) status = 'Xavfli';
    else if (fill >= 50) status = 'Ogohlantirish';

    initialContainers.push({
      id: contId,
      code,
      chymId: chym.id,
      chymName: chym.name,
      address: chym.address,
      regionId: chym.regionId,
      regionName: chym.regionName,
      fillLevel: fill,
      wasteType,
      status,
      lastUpdated: '2026-09-16 17:30',
      sensorBattery: Math.round(80 + ((i * 5) % 20)),
      lat: chym.lat + (i * 0.0001 - 0.0002),
      lng: chym.lng + (i * 0.00015 - 0.0003),
    });
  }
});

// 110+ Abonentlar (Navoiy shahri va Karmana tumanlari bo'yicha)
const firstNames = ['Dilshod', 'Jasur', 'Bobur', 'Sardor', 'Ulug‘bek', 'Alisher', 'Sanjar', 'Otabek', 'Nodira', 'Malika', 'Feruza', 'Aziza', 'Zilola', 'Madina', 'Gulnoza', 'Kamola'];
const lastNames = ['Karimov', 'Rahimov', 'Mirzayev', 'Rustamov', 'Qosimov', 'Normatov', 'Xolmatov', 'Po‘latov', 'Ergashev', 'To‘rayeva', 'Nazarov', 'Valiyev', 'Sodiqov', 'Sobirov'];
const navoiyStreets = ['G‘alaba shoh', 'Islom Karimov shoh', 'Tarobiy', 'Spitamenn', 'Tolstoy', 'Ibn Sino', 'Navoiy', 'Karmana Toshkent yo‘li', 'Mir Said Bahrom', 'Zarafshon'];

export const initialSubscribers: Subscriber[] = [];
for (let i = 1; i <= 112; i++) {
  const fName = firstNames[i % firstNames.length];
  const lName = lastNames[(i * 2) % lastNames.length];
  const reg = initialRegions[i % initialRegions.length];
  const street = navoiyStreets[(i * 3) % navoiyStreets.length];
  const houseNum = String((i % 45) + 1);
  const isCompany = i % 14 === 0;
  const isDebtor = i % 9 === 0;

  initialSubscribers.push({
    id: `sub-nav-${i}`,
    code: `AB-NAV-${String(1000 + i)}`,
    fullName: isCompany ? `MChJ "Navoiy ${fName} Servis"` : `${lName} ${fName}`,
    phone: `+998 79 ${String(220 + (i * 3) % 70)} ${String(10 + (i * 5) % 89)} ${String(10 + (i * 7) % 89)}`,
    address: `${reg.name}, ${street} ko‘chasi, ${houseNum}-uy`,
    regionId: reg.id,
    regionName: reg.name,
    householdNumber: `${houseNum}-xonadon`,
    type: isCompany ? 'Yuridik shaxs' : 'Aholi',
    status: isDebtor ? 'Qarzdor' : i % 25 === 0 ? 'To‘xtatilgan' : 'Faol',
    registeredDate: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
    balance: isDebtor ? -(Math.round((i * 12000) % 75000) + 15000) : Math.round((i * 24000) % 110000),
    notes: isCompany ? 'Maxsus shartnoma № ' + (300 + i) : undefined,
  });
}

// 50+ Xonadonlar
export const initialHouseholds: Household[] = [];
for (let i = 1; i <= 55; i++) {
  const reg = initialRegions[i % initialRegions.length];
  const street = navoiyStreets[(i * 2) % navoiyStreets.length];
  const chym = initialCHYMs[i % initialCHYMs.length];
  const sub = initialSubscribers[i % initialSubscribers.length];
  const isMulti = i % 3 !== 0;

  initialHouseholds.push({
    id: `hh-nav-${i}`,
    code: `XON-NAV-${String(500 + i)}`,
    address: `${reg.name}, ${street} ko‘chasi, ${Math.round((i % 30) + 1)}-uy`,
    regionId: reg.id,
    regionName: reg.name,
    residentsCount: (i % 5) + 3,
    subscriberId: sub.id,
    subscriberName: sub.fullName,
    chymId: chym.id,
    chymName: chym.name,
    type: isMulti ? 'Ko‘p qavatli' : 'Hovli',
  });
}

// Murojaatlar (Navoiy shahri va Karmana bo'yicha)
export const initialComplaints: Complaint[] = [
  {
    id: 'cmp-1',
    code: 'MUR-NAV-001',
    subscriberId: 'sub-nav-3',
    subscriberName: 'Alisher Boboyev',
    phone: '+998 93 456 12 34',
    address: 'Navoiy sh., Tarobiy ko‘chasi, 18-uy oldi',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    category: 'Konteyner to‘lib ketgan',
    description: 'Chiqindi idishlari 2 kundan buyon to‘lib turibdi, Tarobiy ko‘chasiga mashina kelmadi.',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
    createdAt: '2026-09-16 08:24',
    status: 'Yangi',
    priority: 'Shoshilinch',
  },
  {
    id: 'cmp-2',
    code: 'MUR-NAV-002',
    subscriberId: 'sub-nav-8',
    subscriberName: 'Sanjar Po‘latov',
    phone: '+998 93 222 11 00',
    address: 'Navoiy sh., Tolstoy ko‘chasi, 15-uy',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    category: 'Chiqindi o‘z vaqtida olinmadi',
    description: 'Grafik bo‘yicha har 2 kunda olinishi kerak edi, 3 kundan oshdi mashina yo‘q.',
    createdAt: '2026-09-16 09:15',
    status: 'Qabul qilindi',
    assignedStaffId: 'usr-3',
    assignedStaffName: 'Sherzodbek Qodirov (Dispetcher)',
    priority: 'Yuqori',
  },
  {
    id: 'cmp-3',
    code: 'MUR-NAV-003',
    subscriberId: 'sub-nav-14',
    subscriberName: 'Feruza Ergasheva',
    phone: '+998 97 789 65 43',
    address: 'Navoiy sh., G‘alaba shoh ko‘chasi, 12-uy',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    category: 'Maydoncha ifloslangan',
    description: 'Konteynerlar bo‘shatilgan, lekin atrof supurilmagan.',
    createdAt: '2026-09-16 10:05',
    status: 'Mas’ulga biriktirildi',
    assignedStaffId: 'drv-1',
    assignedStaffName: 'Jasur Rahimov (Haydovchi)',
    priority: 'O‘rta',
  },
  {
    id: 'cmp-4',
    code: 'MUR-NAV-004',
    subscriberId: 'sub-nav-21',
    subscriberName: 'Jamshid Valiev',
    phone: '+998 99 888 77 66',
    address: 'Navoiy sh., Islom Karimov sh., 47-uy',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    category: 'Boshqa',
    description: 'Konteyner qopqog‘i singan, almashtirish lozim.',
    createdAt: '2026-09-16 11:40',
    status: 'Bajarildi',
    assignedStaffId: 'drv-2',
    assignedStaffName: 'Bobur Mirzayev (Haydovchi)',
    responseNotes: 'Konteyner yangisiga almashtirildi.',
    completedAt: '2026-09-16 14:00',
    priority: 'Past',
  },
];

// Marshrutlar
export const initialRoutes: Route[] = [
  {
    id: 'rt-1',
    code: 'MR-NAV-01',
    title: 'G‘alaba va Tarobiy ko‘chalari tongi tozalash',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    vehicleId: 'veh-1',
    vehiclePlate: '85 714 UZA',
    driverId: 'drv-1',
    driverName: 'Jasur Rahimov',
    date: '2026-09-16',
    shift: 'Ertalabki (06:00 - 14:00)',
    status: 'Jarayonda',
    pointsCount: 3,
    completedPointsCount: 2,
    startedAt: '06:30',
    distanceKm: 14.2,
    estimatedDurationMin: 140,
    points: [
      {
        id: 'rp-1-1',
        chymId: 'chym-1',
        chymName: 'G‘alaba shoh ko‘chasi, 12-uy maydonchasi',
        address: 'Navoiy sh., G‘alaba sh., 12-uy',
        lat: 40.0862,
        lng: 65.3785,
        order: 1,
        status: 'Tozalandi',
        visitedAt: '08:35',
        collectedVolumeM3: 4.8,
      },
      {
        id: 'rp-1-2',
        chymId: 'chym-4',
        chymName: 'Istiqlol MFY, Spitamenn ko‘chasi 7-uy',
        address: 'Navoiy sh., Spitamenn ko‘chasi, 7-uy',
        lat: 40.0841,
        lng: 65.3675,
        order: 2,
        status: 'Tozalandi',
        visitedAt: '09:15',
        collectedVolumeM3: 3.5,
      },
      {
        id: 'rp-1-3',
        chymId: 'chym-3',
        chymName: 'Matonat MFY, Tarobiy ko‘chasi 18-uy',
        address: 'Navoiy sh., Tarobiy ko‘chasi, 18-uy',
        lat: 40.0815,
        lng: 65.3712,
        order: 3,
        status: 'Kutilmoqda',
      },
    ],
  },
  {
    id: 'rt-2',
    code: 'MR-NAV-02',
    title: 'Islom Karimov shoh ko‘chasi va Zarafshon MFY',
    regionId: 'reg-nav-1',
    regionName: 'Navoiy shahri',
    vehicleId: 'veh-2',
    vehiclePlate: '85 820 BAA',
    driverId: 'drv-2',
    driverName: 'Bobur Mirzayev',
    date: '2026-09-16',
    shift: 'Ertalabki (06:00 - 14:00)',
    status: 'Jarayonda',
    pointsCount: 2,
    completedPointsCount: 1,
    startedAt: '07:00',
    distanceKm: 16.5,
    estimatedDurationMin: 160,
    points: [
      {
        id: 'rp-2-1',
        chymId: 'chym-2',
        chymName: 'Islom Karimov shoh ko‘chasi, 45-uy ro‘parasi',
        address: 'Navoiy sh., I.Karimov sh., 45-uy',
        lat: 40.0895,
        lng: 65.3850,
        order: 1,
        status: 'Tozalandi',
        visitedAt: '09:50',
        collectedVolumeM3: 5.2,
      },
    ],
  },
];

// Bildirishnomalar
export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Konteyner to‘lib qoldi (100%)',
    message: 'Navoiy sh. Matonat MFY (CHYM-NAV-03) maydonchasidagi konteyner 100% ga to‘ldi. Favqulodda reys talab qilinadi!',
    type: 'container_full',
    level: 'danger',
    isRead: false,
    createdAt: '10 daqiqa oldin',
    linkModule: 'containers',
    targetId: 'cnt-nav-31',
  },
  {
    id: 'notif-2',
    title: 'Maxsus texnika aloqadan uzildi',
    message: 'MAN TGS (85 777 ZAA) 2 soatdan buyon GPS serveriga signal yubormayapti. Haydovchi: Ravshan Xolmatov.',
    type: 'vehicle_offline',
    level: 'danger',
    isRead: false,
    createdAt: '45 daqiqa oldin',
    linkModule: 'gps',
    targetId: 'veh-5',
  },
  {
    id: 'notif-3',
    title: 'Ko‘cha tozalash muddati o‘tib ketdi',
    message: 'Tolstoy ko‘chasi bo‘ylab 3 kundan ortiq maxsus texnika harakatlanmadi (Qizil zona).',
    type: 'route_failed',
    level: 'warning',
    isRead: false,
    createdAt: '1 soat oldin',
    linkModule: 'gps',
  },
  {
    id: 'notif-4',
    title: 'Yangi ariza kelib tushdi',
    message: 'Tarobiy ko‘chasi 18-uy bo‘yicha aholi shikoyati qabul qilindi.',
    type: 'new_complaint',
    level: 'info',
    isRead: false,
    createdAt: '2 soat oldin',
    linkModule: 'complaints',
  },
];

// Baholar
export const initialRatings: ServiceRating[] = [
  {
    id: 'rat-1',
    subscriberId: 'sub-nav-1',
    subscriberName: 'Dilshod Karimov',
    phone: '+998 90 123 45 67',
    rating: 5,
    comment: 'Navoiy shahrida xizmat sifati ancha yaxshilandi. Har kuni ertalab soat 08:30 da aniq kelib tozalashadi.',
    tags: ['O‘z vaqtida', 'Toza va ozoda', 'Xushmuomala'],
    createdAt: '2026-09-16 09:10',
    driverName: 'Jasur Rahimov',
  },
  {
    id: 'rat-2',
    subscriberId: 'sub-nav-2',
    subscriberName: 'Nodira To‘rayeva',
    phone: '+998 91 333 88 99',
    rating: 5,
    comment: 'G‘alaba shoh ko‘chasida konteynerlar atrofi ham toza qilib ketildi. Rahmat!',
    tags: ['Toza va ozoda', 'O‘z vaqtida'],
    createdAt: '2026-09-16 10:20',
    driverName: 'Jasur Rahimov',
  },
  {
    id: 'rat-3',
    subscriberId: 'sub-nav-3',
    subscriberName: 'Alisher Boboyev',
    phone: '+998 93 456 12 34',
    rating: 2,
    comment: 'Tarobiy ko‘chasida konteynerlar to‘lib ketmoqda, 2 kunda 1 marta emas har kuni kelinsa yaxshi bo‘lardi.',
    tags: ['Kechikish bor'],
    createdAt: '2026-09-15 17:45',
  },
];

export const initialSettings: SystemSettings = {
  orgName: '“Toza Hudud” DUK — Navoiy viloyati boshqarmasi',
  hotline: '1157 / +998 79 220 12 34',
  gpsApiEndpoint: 'https://api.gps-navoiy.ecocontrol.uz/v1/telemetry',
  telegramBotToken: '7392184912:AAH9K12..._navoiy_bot',
  telegramChatId: '@ecocontrol_navoiy_alerts',
  rtspGatewayUrl: 'rtsp://cam.navoiy-tozahudud.uz:8554/live',
  smsApiUrl: 'https://notify.eskiz.uz/api/message/sms/send',
  smsApiKey: 'sk_live_navoiy_ecocontrol_8501',
  autoAlertThreshold: 80,
};
