export type UserRole =
  | 'SUPER_ADMIN'
  | 'RAHBARIYAT'
  | 'DISPETCHER'
  | 'HUDUD_MASULI'
  | 'BRIGADA_MASULI'
  | 'HAYDOVCHI'
  | 'ABONENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar?: string;
  regionId?: string;
  vehicleId?: string;
  active: boolean;
}

export interface Subscriber {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  address: string;
  regionId: string;
  regionName: string;
  householdNumber: string;
  type: 'Aholi' | 'Yuridik shaxs';
  status: 'Faol' | 'To‘xtatilgan' | 'Qarzdor';
  registeredDate: string;
  balance: number;
  notes?: string;
}

export interface Household {
  id: string;
  code: string;
  address: string;
  regionId: string;
  regionName: string;
  residentsCount: number;
  subscriberId?: string;
  subscriberName?: string;
  chymId: string;
  chymName: string;
  type: 'Ko‘p qavatli' | 'Hovli';
  lat?: number;
  lng?: number;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  fullName?: string;
  inspectorName: string;
  inspectorPhone: string;
  chymCount: number;
  containersCount: number;
  population: number;
  activeVehiclesCount: number;
}

export type ComplaintStatus =
  | 'Yangi'
  | 'Qabul qilindi'
  | 'Mas’ulga biriktirildi'
  | 'Jarayonda'
  | 'Bajarildi'
  | 'Rad etildi';

export type ComplaintCategory =
  | 'Chiqindi o‘z vaqtida olinmadi'
  | 'Konteyner to‘lib ketgan'
  | 'Maydoncha ifloslangan'
  | 'Noqonuniy chiqindi to‘kish'
  | 'Haydovchi / xodim qo‘polligi'
  | 'Boshqa';

export interface Complaint {
  id: string;
  code: string;
  subscriberId: string;
  subscriberName: string;
  phone: string;
  address: string;
  regionId: string;
  regionName: string;
  category: ComplaintCategory;
  description: string;
  photoUrl?: string;
  createdAt: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  status: ComplaintStatus;
  responseNotes?: string;
  completedAt?: string;
  priority: 'Past' | 'O‘rta' | 'Yuqori' | 'Shoshilinch';
}

export type VehicleStatus = 'ONLINE' | 'OFFLINE' | 'HARAKATDA' | 'TO‘XTAGAN' | 'MARSHRUTDA';

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  year: number;
  capacityM3: number;
  capacityTons: number;
  fuelType: string;
  currentFuelPercent: number;
  driverId?: string;
  driverName?: string;
  gpsImei: string;
  status: VehicleStatus;
  speedKmH: number;
  lat: number;
  lng: number;
  heading: number;
  lastUpdated: string;
  currentRouteId?: string;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  vehicleId?: string;
  vehiclePlate?: string;
  rating: number;
  status: 'Faol' | 'Dam olishda' | 'Ta’tilda';
}

export type RouteStatus = 'Rejalashtirilgan' | 'Boshlangan' | 'Jarayonda' | 'Yakunlangan' | 'Bajarilmagan';

export interface RoutePoint {
  id: string;
  chymId: string;
  chymName: string;
  address: string;
  lat: number;
  lng: number;
  order: number;
  status: 'Kutilmoqda' | 'Yetib kelindi' | 'Tozalandi' | 'O‘tkazib yuborildi';
  visitedAt?: string;
  collectedVolumeM3?: number;
  photoUrl?: string;
  notes?: string;
}

export interface Route {
  id: string;
  code: string;
  title: string;
  regionId: string;
  regionName: string;
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  date: string;
  shift: 'Ertalabki (06:00 - 14:00)' | 'Kechki (14:00 - 22:00)';
  status: RouteStatus;
  pointsCount: number;
  completedPointsCount: number;
  startedAt?: string;
  completedAt?: string;
  distanceKm: number;
  estimatedDurationMin: number;
  points: RoutePoint[];
}

export interface CHYM {
  id: string;
  code: string;
  name: string;
  address: string;
  regionId: string;
  regionName: string;
  lat: number;
  lng: number;
  containerCount: number;
  cameraStatus: 'ONLINE' | 'OFFLINE' | 'XATOLIK';
  cameraUrl?: string;
  lastInspectionTime: string;
  cleanlinessStatus: 'A’lo' | 'Yaxshi' | 'Qoniqarsiz';
  fillPercentAvg: number;
}

export type WasteType = 'Aralash' | 'Plastmassa' | 'Qog‘oz' | 'Shisha' | 'Organik';
export type ContainerStatus = 'Normal' | 'Ogohlantirish' | 'Xavfli' | 'To‘lgan';

export interface Container {
  id: string;
  code: string;
  chymId: string;
  chymName: string;
  address: string;
  regionId: string;
  regionName: string;
  fillLevel: number; // 0 - 100
  wasteType: WasteType;
  status: ContainerStatus;
  lastUpdated: string;
  sensorBattery: number;
  lat: number;
  lng: number;
}

export type NotificationType =
  | 'container_full'
  | 'route_failed'
  | 'vehicle_offline'
  | 'new_complaint'
  | 'complaint_status'
  | 'camera_issue'
  | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  level: 'info' | 'warning' | 'danger' | 'success';
  isRead: boolean;
  createdAt: string;
  linkModule?: string;
  targetId?: string;
}

export interface ServiceRating {
  id: string;
  subscriberId: string;
  subscriberName: string;
  phone: string;
  rating: number; // 1 to 5
  comment: string;
  tags: string[];
  createdAt: string;
  driverId?: string;
  driverName?: string;
}

export interface SystemSettings {
  orgName: string;
  hotline: string;
  gpsApiEndpoint: string;
  telegramBotToken: string;
  telegramChatId: string;
  rtspGatewayUrl: string;
  smsApiUrl: string;
  smsApiKey: string;
  autoAlertThreshold: number; // default 80%
}

export type HouseStatus = 'Tozalangan' | 'Kutilmoqda' | 'Muddati o‘tgan' | 'Qarzdor';

export interface HousePolygon {
  id: string;
  code: string;
  houseNumber: string;
  streetName: string;
  mahalla: string;
  regionId: string;
  regionName: string;
  latLngs: [number, number][]; // Polygon boundary coordinates
  center: [number, number];
  subscriberName: string;
  phone: string;
  residentsCount: number;
  balance: number; // so'm (<0 means debt)
  lastCollectedTime: string; // e.g. "Bugun 08:45"
  lastCollectedVehicle?: string; // e.g. "85 714 UZA"
  lastCollectedDriver?: string; // e.g. "Jasur Rahimov"
  status: HouseStatus;
  type: 'Hovli' | 'Ko‘p qavatli';
  notes?: string;
  cadastreNumber?: string;
}

export type TrackColorCategory = 'green' | 'yellow' | 'red';

export interface GpsTrackSegment {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  streetName: string;
  path: [number, number][];
  passedAt: string;
  ageHours: number; // how many hours ago truck passed
  colorCategory: TrackColorCategory; // green < 24h, yellow 24-48h, red > 48h
}

export interface StreetNetworkItem {
  id: string;
  name: string;
  mahalla: string;
  path: [number, number][];
  status: 'green' | 'yellow' | 'red';
  ageHours: number;
  lastPassedAt: string;
  vehiclePlate?: string;
  housesCount: number;
  cleanedHousesCount: number;
  lengthKm: number;
}


