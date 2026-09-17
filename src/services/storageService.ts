import {
  User,
  UserRole,
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
  ComplaintStatus,
  HousePolygon,
  GpsTrackSegment,
  StreetNetworkItem,
} from '../types';

import {
  initialUsers,
  initialRegions,
  initialCHYMs,
  initialVehicles,
  initialDrivers,
  initialContainers,
  initialSubscribers,
  initialHouseholds,
  initialComplaints,
  initialRoutes,
  initialNotifications,
  initialRatings,
  initialSettings,
  initialHousePolygons,
  initialTrackSegments,
  initialStreetNetwork,
} from './mockData';

const STORAGE_KEYS = {
  CURRENT_ROLE: 'ecocontrol_current_role',
  USERS: 'ecocontrol_users',
  REGIONS: 'ecocontrol_regions',
  CHYMS: 'ecocontrol_chyms',
  VEHICLES: 'ecocontrol_vehicles',
  DRIVERS: 'ecocontrol_drivers',
  CONTAINERS: 'ecocontrol_containers',
  SUBSCRIBERS: 'ecocontrol_subscribers',
  HOUSEHOLDS: 'ecocontrol_households',
  COMPLAINTS: 'ecocontrol_complaints',
  ROUTES: 'ecocontrol_routes',
  NOTIFICATIONS: 'ecocontrol_notifications',
  RATINGS: 'ecocontrol_ratings',
  SETTINGS: 'ecocontrol_settings',
  HOUSE_POLYGONS: 'ecocontrol_house_polygons_clean_v5',
  TRACK_SEGMENTS: 'ecocontrol_track_segments_clean_v5',
  STREET_NETWORK: 'ecocontrol_street_network_clean_v5',
  INITIALIZED: 'ecocontrol_clean_v6',
};

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeData();
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifyListeners();
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn());
  }

  public initializeData(forceReset = false): void {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit || forceReset) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, JSON.stringify('SUPER_ADMIN'));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
      localStorage.setItem(STORAGE_KEYS.REGIONS, JSON.stringify(initialRegions));
      localStorage.setItem(STORAGE_KEYS.CHYMS, JSON.stringify(initialCHYMs));
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(initialVehicles));
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(initialDrivers));
      localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(initialContainers));
      localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(initialSubscribers));
      localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(initialHouseholds));
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(initialComplaints));
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(initialRoutes));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
      localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(initialRatings));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
      localStorage.setItem(STORAGE_KEYS.HOUSE_POLYGONS, JSON.stringify(initialHousePolygons));
      localStorage.setItem(STORAGE_KEYS.TRACK_SEGMENTS, JSON.stringify(initialTrackSegments));
      localStorage.setItem(STORAGE_KEYS.STREET_NETWORK, JSON.stringify(initialStreetNetwork));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      this.notifyListeners();
    }
  }

  // --- Auth & Role ---
  public getCurrentRole(): UserRole {
    return this.getItem<UserRole>(STORAGE_KEYS.CURRENT_ROLE, 'SUPER_ADMIN');
  }

  public setCurrentRole(role: UserRole): void {
    this.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  }

  public getCurrentUser(): User {
    const role = this.getCurrentRole();
    const users = this.getUsers();
    return users.find((u) => u.role === role) || users[0];
  }

  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  public saveUser(user: User): void {
    const list = this.getUsers();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx >= 0) list[idx] = user;
    else list.push(user);
    this.setItem(STORAGE_KEYS.USERS, list);
  }

  // --- Subscribers ---
  public getSubscribers(): Subscriber[] {
    return this.getItem<Subscriber[]>(STORAGE_KEYS.SUBSCRIBERS, initialSubscribers);
  }

  public saveSubscriber(sub: Subscriber): void {
    const list = this.getSubscribers();
    const idx = list.findIndex((s) => s.id === sub.id);
    if (idx >= 0) list[idx] = sub;
    else list.unshift(sub);
    this.setItem(STORAGE_KEYS.SUBSCRIBERS, list);
  }

  public deleteSubscriber(id: string): void {
    const list = this.getSubscribers().filter((s) => s.id !== id);
    this.setItem(STORAGE_KEYS.SUBSCRIBERS, list);
  }

  // --- Households ---
  public getHouseholds(): Household[] {
    return this.getItem<Household[]>(STORAGE_KEYS.HOUSEHOLDS, initialHouseholds);
  }

  public saveHousehold(hh: Household): void {
    const list = this.getHouseholds();
    const idx = list.findIndex((h) => h.id === hh.id);
    if (idx >= 0) list[idx] = hh;
    else list.unshift(hh);
    this.setItem(STORAGE_KEYS.HOUSEHOLDS, list);
  }

  public deleteHousehold(id: string): void {
    const list = this.getHouseholds().filter((h) => h.id !== id);
    this.setItem(STORAGE_KEYS.HOUSEHOLDS, list);
  }

  // --- Regions ---
  public getRegions(): Region[] {
    return this.getItem<Region[]>(STORAGE_KEYS.REGIONS, initialRegions);
  }

  // --- CHYM Sites ---
  public getCHYMs(): CHYM[] {
    return this.getItem<CHYM[]>(STORAGE_KEYS.CHYMS, initialCHYMs);
  }

  public saveCHYM(chym: CHYM): void {
    const list = this.getCHYMs();
    const idx = list.findIndex((c) => c.id === chym.id);
    if (idx >= 0) list[idx] = chym;
    else list.push(chym);
    this.setItem(STORAGE_KEYS.CHYMS, list);
  }

  // --- Containers ---
  public getContainers(): Container[] {
    return this.getItem<Container[]>(STORAGE_KEYS.CONTAINERS, initialContainers);
  }

  public saveContainer(cnt: Container): void {
    const list = this.getContainers();
    const idx = list.findIndex((c) => c.id === cnt.id);
    if (idx >= 0) list[idx] = cnt;
    else list.unshift(cnt);
    this.setItem(STORAGE_KEYS.CONTAINERS, list);

    // Update parent CHYM avg
    this.recalculateChymFill(cnt.chymId);
  }

  private recalculateChymFill(chymId: string): void {
    const containers = this.getContainers().filter((c) => c.chymId === chymId);
    if (containers.length === 0) return;
    const avg = Math.round(
      containers.reduce((acc, c) => acc + c.fillLevel, 0) / containers.length
    );
    const chyms = this.getCHYMs();
    const idx = chyms.findIndex((c) => c.id === chymId);
    if (idx >= 0) {
      chyms[idx].fillPercentAvg = avg;
      if (avg >= 90) chyms[idx].cleanlinessStatus = 'Qoniqarsiz';
      this.setItem(STORAGE_KEYS.CHYMS, chyms);
    }
  }

  // --- Complaints ---
  public getComplaints(): Complaint[] {
    return this.getItem<Complaint[]>(STORAGE_KEYS.COMPLAINTS, initialComplaints);
  }

  public saveComplaint(cmp: Complaint): void {
    const list = this.getComplaints();
    const idx = list.findIndex((c) => c.id === cmp.id);
    const isNew = idx < 0;
    if (idx >= 0) list[idx] = cmp;
    else list.unshift(cmp);
    this.setItem(STORAGE_KEYS.COMPLAINTS, list);

    if (isNew) {
      this.addNotification({
        id: 'notif-' + Date.now(),
        title: 'Yangi murojaat kelib tushdi',
        message: `${cmp.regionName}: "${cmp.category}" murojaati qabul qilindi (#${cmp.code})`,
        type: 'new_complaint',
        level: 'info',
        isRead: false,
        createdAt: 'Hozirgina',
        linkModule: 'complaints',
        targetId: cmp.id,
      });
    }
  }

  public updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    notes?: string,
    assignedStaffId?: string,
    assignedStaffName?: string
  ): void {
    const list = this.getComplaints();
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      if (notes) list[idx].responseNotes = notes;
      if (assignedStaffId) list[idx].assignedStaffId = assignedStaffId;
      if (assignedStaffName) list[idx].assignedStaffName = assignedStaffName;
      if (status === 'Bajarildi') {
        list[idx].completedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      }
      this.setItem(STORAGE_KEYS.COMPLAINTS, list);

      this.addNotification({
        id: 'notif-' + Date.now(),
        title: `Murojaat holati yangilandi: ${status}`,
        message: `#${list[idx].code} raqamli murojaat statusi "${status}" ga o‘zgartirildi.`,
        type: 'complaint_status',
        level: status === 'Bajarildi' ? 'success' : 'info',
        isRead: false,
        createdAt: 'Hozirgina',
        linkModule: 'complaints',
        targetId: id,
      });
    }
  }

  // --- Vehicles ---
  public getVehicles(): Vehicle[] {
    return this.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
  }

  public saveVehicle(veh: Vehicle): void {
    const list = this.getVehicles();
    const idx = list.findIndex((v) => v.id === veh.id);
    if (idx >= 0) list[idx] = veh;
    else list.push(veh);
    this.setItem(STORAGE_KEYS.VEHICLES, list);
  }

  // --- Drivers ---
  public getDrivers(): Driver[] {
    return this.getItem<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
  }

  public saveDriver(drv: Driver): void {
    const list = this.getDrivers();
    const idx = list.findIndex((d) => d.id === drv.id);
    if (idx >= 0) list[idx] = drv;
    else list.push(drv);
    this.setItem(STORAGE_KEYS.DRIVERS, list);
  }

  // --- Routes ---
  public getRoutes(): Route[] {
    return this.getItem<Route[]>(STORAGE_KEYS.ROUTES, initialRoutes);
  }

  public saveRoute(route: Route): void {
    const list = this.getRoutes();
    const idx = list.findIndex((r) => r.id === route.id);
    if (idx >= 0) list[idx] = route;
    else list.unshift(route);
    this.setItem(STORAGE_KEYS.ROUTES, list);
  }

  public updateRoutePointStatus(
    routeId: string,
    pointId: string,
    status: 'Tozalandi' | 'Yetib kelindi' | 'O‘tkazib yuborildi',
    notes?: string,
    volume?: number
  ): void {
    const routes = this.getRoutes();
    const rIdx = routes.findIndex((r) => r.id === routeId);
    if (rIdx >= 0) {
      const route = routes[rIdx];
      const pIdx = route.points.findIndex((p) => p.id === pointId);
      if (pIdx >= 0) {
        route.points[pIdx].status = status;
        if (notes) route.points[pIdx].notes = notes;
        if (volume) route.points[pIdx].collectedVolumeM3 = volume;
        route.points[pIdx].visitedAt = new Date().toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
        });

        // If point cleaned, reset its CHYM containers to empty
        if (status === 'Tozalandi') {
          const chymId = route.points[pIdx].chymId;
          const containers = this.getContainers();
          containers.forEach((c) => {
            if (c.chymId === chymId) {
              c.fillLevel = Math.round(5 + Math.random() * 10);
              c.status = 'Normal';
            }
          });
          this.setItem(STORAGE_KEYS.CONTAINERS, containers);
          this.recalculateChymFill(chymId);
        }

        // recalculate route completed points
        const done = route.points.filter((p) => p.status === 'Tozalandi').length;
        route.completedPointsCount = done;
        if (done === route.points.length && done > 0) {
          route.status = 'Yakunlangan';
          route.completedAt = new Date().toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit',
          });
        } else if (done > 0 && route.status === 'Rejalashtirilgan') {
          route.status = 'Jarayonda';
        }
        this.setItem(STORAGE_KEYS.ROUTES, routes);
      }
    }
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    return this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  }

  public addNotification(notif: AppNotification): void {
    const list = this.getNotifications();
    list.unshift(notif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 40));
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const target = list.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  public markAllNotificationsAsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- Ratings ---
  public getRatings(): ServiceRating[] {
    return this.getItem<ServiceRating[]>(STORAGE_KEYS.RATINGS, initialRatings);
  }

  public saveRating(rating: ServiceRating): void {
    const list = this.getRatings();
    list.unshift(rating);
    this.setItem(STORAGE_KEYS.RATINGS, list);
  }

  // --- Settings ---
  public getSettings(): SystemSettings {
    return this.getItem<SystemSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
  }

  public saveSettings(settings: SystemSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // --- House Polygons (GIS) ---
  public getHousePolygons(): HousePolygon[] {
    return this.getItem<HousePolygon[]>(STORAGE_KEYS.HOUSE_POLYGONS, initialHousePolygons);
  }

  public saveHousePolygon(house: HousePolygon): void {
    const list = this.getHousePolygons();
    const idx = list.findIndex((h) => h.id === house.id);
    if (idx >= 0) list[idx] = house;
    else list.unshift(house);
    this.setItem(STORAGE_KEYS.HOUSE_POLYGONS, list);
  }

  public deleteHousePolygon(id: string): void {
    const list = this.getHousePolygons().filter((h) => h.id !== id);
    this.setItem(STORAGE_KEYS.HOUSE_POLYGONS, list);
  }

  // --- GPS Track Segments (3-Color Trails) ---
  public getTrackSegments(): GpsTrackSegment[] {
    return this.getItem<GpsTrackSegment[]>(STORAGE_KEYS.TRACK_SEGMENTS, initialTrackSegments);
  }

  public saveTrackSegment(segment: GpsTrackSegment): void {
    const list = this.getTrackSegments();
    const idx = list.findIndex((s) => s.id === segment.id);
    if (idx >= 0) list[idx] = segment;
    else list.unshift(segment);
    this.setItem(STORAGE_KEYS.TRACK_SEGMENTS, list);
  }

  // --- Street Network (3-Color GIS Corridors) ---
  public getStreetNetwork(): StreetNetworkItem[] {
    return this.getItem<StreetNetworkItem[]>(STORAGE_KEYS.STREET_NETWORK, initialStreetNetwork);
  }

  public saveStreetNetwork(streets: StreetNetworkItem[]): void {
    this.setItem(STORAGE_KEYS.STREET_NETWORK, streets);
  }

  public saveStreetNetworkItem(street: StreetNetworkItem): void {
    const list = this.getStreetNetwork();
    const idx = list.findIndex((s) => s.id === street.id);
    if (idx >= 0) list[idx] = street;
    else list.push(street);
    this.saveStreetNetwork(list);
  }

  public markStreetCleaned(streetId: string, vehiclePlate = '85 714 UZA'): void {
    const streets = this.getStreetNetwork();
    const street = streets.find((s) => s.id === streetId);
    if (!street) return;

    street.status = 'green';
    street.ageHours = 0.1;
    street.lastPassedAt = 'Hozirgina (Bugun)';
    street.vehiclePlate = vehiclePlate;
    street.cleanedHousesCount = street.housesCount;
    this.saveStreetNetwork(streets);

    // Also mark all houses on this street as cleaned
    const houses = this.getHousePolygons();
    let changed = false;
    houses.forEach((h) => {
      if (
        h.streetName.toLowerCase().includes(street.name.toLowerCase()) ||
        street.name.toLowerCase().includes(h.streetName.toLowerCase())
      ) {
        h.status = 'Tozalangan';
        h.lastCollectedTime = 'Hozirgina (Bugun)';
        h.lastCollectedVehicle = vehiclePlate;
        changed = true;
      }
    });
    if (changed) {
      this.setItem(STORAGE_KEYS.HOUSE_POLYGONS, houses);
    }
  }

  public bulkImportHouses(newHouses: HousePolygon[]): void {
    const current = this.getHousePolygons();
    const currentMap = new Map(current.map((h) => [h.id, h]));
    newHouses.forEach((h) => currentMap.set(h.id, h));
    this.setItem(STORAGE_KEYS.HOUSE_POLYGONS, Array.from(currentMap.values()));
  }

  public generateStreetHouses(
    streetName: string,
    startNum: number,
    endNum: number,
    mahalla: string,
    type: 'Hovli' | 'Ko‘p qavatli' = 'Hovli'
  ): HousePolygon[] {
    const streets = this.getStreetNetwork();
    const street =
      streets.find((s) => s.name.toLowerCase().includes(streetName.toLowerCase())) ||
      streets[0];
    if (!street || street.path.length < 2) return [];

    const generated: HousePolygon[] = [];
    const total = Math.max(1, endNum - startNum + 1);

    for (let num = startNum; num <= endNum; num++) {
      const idx = num - startNum;
      const t = (idx + 0.5) / total;
      const side: 1 | -1 = num % 2 === 1 ? 1 : -1;

      const pIdx = Math.min(Math.floor(t * (street.path.length - 1)), street.path.length - 2);
      const p1 = street.path[pIdx];
      const p2 = street.path[pIdx + 1];
      const localT = t * (street.path.length - 1) - pIdx;

      const lat = p1[0] + (p2[0] - p1[0]) * localT;
      const lng = p1[1] + (p2[1] - p1[1]) * localT;

      const dLat = p2[0] - p1[0];
      const dLng = p2[1] - p1[1];
      const len = Math.hypot(dLat, dLng) || 0.001;
      const nLat = (-dLng / len) * 0.00045 * side;
      const nLng = (dLat / len) * 0.00045 * side;

      const cLat = lat + nLat;
      const cLng = lng + nLng;
      const dW = 0.00022;
      const dH = 0.00022;

      const house: HousePolygon = {
        id: `gen-house-${street.id}-${num}-${Date.now()}`,
        code: `XON-NAV-${String(num).padStart(3, '0')}`,
        houseNumber: `${num}-uy`,
        streetName: street.name,
        mahalla: mahalla || street.mahalla,
        regionId: 'reg-nav-1',
        regionName: street.name.includes('Karmana') ? 'Karmana tumani' : 'Navoiy shahri',
        latLngs: [
          [cLat - dW, cLng - dH],
          [cLat - dW, cLng + dH],
          [cLat + dW, cLng + dH],
          [cLat + dW, cLng - dH],
        ],
        center: [cLat, cLng],
        subscriberName: `Abonent #${num} (${street.mahalla})`,
        phone: `+998 90 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
        residentsCount: 4 + (num % 4),
        balance: num % 5 === 0 ? -20000 : 18000,
        lastCollectedTime:
          street.status === 'green'
            ? 'Bugun 09:00'
            : street.status === 'yellow'
            ? 'Kecha 14:00'
            : '3 kun oldin',
        lastCollectedVehicle: street.vehiclePlate || '85 714 UZA',
        lastCollectedDriver: 'Jasur Rahimov',
        status:
          street.status === 'green'
            ? 'Tozalangan'
            : street.status === 'yellow'
            ? 'Kutilmoqda'
            : 'Muddati o‘tgan',
        type,
        cadastreNumber: `16:01:01:0${num}:001`,
      };

      generated.push(house);
    }

    this.bulkImportHouses(generated);
    return generated;
  }

  // --- Export / Backup ---
  public exportFullBackupJSON(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      subscribers: this.getSubscribers(),
      households: this.getHouseholds(),
      regions: this.getRegions(),
      chyms: this.getCHYMs(),
      containers: this.getContainers(),
      complaints: this.getComplaints(),
      vehicles: this.getVehicles(),
      drivers: this.getDrivers(),
      routes: this.getRoutes(),
      ratings: this.getRatings(),
      settings: this.getSettings(),
      housePolygons: this.getHousePolygons(),
      trackSegments: this.getTrackSegments(),
    };
    return JSON.stringify(data, null, 2);
  }
}

export const storageService = new StorageService();

