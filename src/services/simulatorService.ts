import { storageService } from './storageService';
import { Vehicle, StreetNetworkItem } from '../types';

// Real City Road Waypoints for moving trucks in the 4 Tozamakon districts
// Trucks strictly navigate along city streets and never float across desert or buildings
const VEHICLE_ROAD_PATHS: Record<string, [number, number][]> = {
  // veh-1: Qiziltepa markaziy ko'chalar tarmog'i (Alisher Navoiy -> Bo'ston -> Mustaqillik -> Ibn Sino)
  'veh-1': [
    [40.0285, 64.8420],
    [40.0305, 64.8460],
    [40.0331, 64.8512],
    [40.0345, 64.8490],
    [40.0370, 64.8465],
    [40.0400, 64.8435],
    [40.0415, 64.8510],
    [40.0385, 64.8540],
    [40.0355, 64.8565],
    [40.0380, 64.8620],
    [40.0340, 64.8615],
    [40.0315, 64.8575],
    [40.0290, 64.8530],
    [40.0270, 64.8485],
    [40.0240, 64.8515],
    [40.0270, 64.8485],
    [40.0305, 64.8460],
    [40.0331, 64.8512],
  ],

  // veh-2: Zarafshon shahar ko'chalar aylanmasi (Konchilar -> Zarbuland -> Geologlar -> Quruvchilar)
  'veh-2': [
    [41.5680, 64.1950],
    [41.5710, 64.1980],
    [41.5744, 64.2014],
    [41.5765, 64.1980],
    [41.5790, 64.1945],
    [41.5815, 64.1910],
    [41.5810, 64.2090],
    [41.5775, 64.2050],
    [41.5744, 64.2014],
    [41.5710, 64.1980],
    [41.5690, 64.2030],
    [41.5670, 64.2080],
    [41.5650, 64.2130],
    [41.5680, 64.2150],
    [41.5720, 64.2180],
    [41.5744, 64.2014],
  ],

  // veh-3: Uchquduq shahar ko'chalar aylanmasi (Do'stlik -> Navro'z -> Konchilar)
  'veh-3': [
    [42.1520, 63.5510],
    [42.1550, 63.5540],
    [42.1583, 63.5572],
    [42.1605, 63.5535],
    [42.1630, 63.5500],
    [42.1655, 63.5465],
    [42.1615, 63.5605],
    [42.1583, 63.5572],
    [42.1550, 63.5540],
    [42.1530, 63.5590],
    [42.1510, 63.5640],
    [42.1550, 63.5540],
  ],

  // veh-4: Tomdi tuman markazi ko'chalari (Tomdibuloq Markaziy -> Avezov -> Birlik)
  'veh-4': [
    [41.5600, 64.6160],
    [41.5630, 64.6190],
    [41.5658, 64.6228],
    [41.5675, 64.6195],
    [41.5695, 64.6160],
    [41.5715, 64.6125],
    [41.5685, 64.6260],
    [41.5710, 64.6295],
    [41.5658, 64.6228],
    [41.5630, 64.6190],
    [41.5610, 64.6235],
    [41.5590, 64.6280],
    [41.5630, 64.6190],
  ],
};

class SimulatorService {
  private timer: number | null = null;
  private isRunning: boolean = false;
  private tickCount: number = 0;
  private vehicleWaypointIndices: Record<string, number> = {};
  private vehicleLoadingCycles: Record<string, number> = {};
  private onSimEventCb: ((event: { text: string; time: string; vehiclePlate: string; type: 'clean' | 'load' | 'move' }) => void) | null = null;

  public setOnSimEvent(cb: (event: { text: string; time: string; vehiclePlate: string; type: 'clean' | 'load' | 'move' }) => void): void {
    this.onSimEventCb = cb;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = window.setInterval(() => this.tick(), 1000);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  public getStatus(): boolean {
    return this.isRunning;
  }

  private emitEvent(text: string, vehiclePlate: string, type: 'clean' | 'load' | 'move'): void {
    if (this.onSimEventCb) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      this.onSimEventCb({ text, time, vehiclePlate, type });
    }
  }

  private tick(): void {
    this.tickCount++;
    const vehicles = storageService.getVehicles();
    const streets = storageService.getStreetNetwork();
    const chyms = storageService.getCHYMs();
    let streetsChanged = false;

    // 1. Move active vehicles along city street waypoints with real physics
    vehicles.forEach((veh) => {
      if (veh.status === 'OFFLINE') {
        veh.actionStatus = 'TO‘XTAGAN';
        veh.engineStatus = 'STOPPED';
        veh.speedKmH = 0;
        return;
      }

      const roadPath = VEHICLE_ROAD_PATHS[veh.id];
      if (!roadPath || roadPath.length < 2) return;

      // Handle loading cycle pause at waste containers (Chiqindi ortish rejimi)
      const loadCount = this.vehicleLoadingCycles[veh.id] || 0;
      if (loadCount > 0) {
        this.vehicleLoadingCycles[veh.id] = loadCount - 1;
        veh.status = 'YUKLANMOQDA';
        veh.actionStatus = 'YUKLASH';
        veh.speedKmH = 0;
        veh.engineStatus = 'IDLE';

        // Increment cargo slightly while loading
        if (veh.cargoWeightTons && veh.capacityTons) {
          veh.cargoWeightTons = Number(Math.min(veh.capacityTons, veh.cargoWeightTons + 0.08).toFixed(2));
          veh.cargoFillPercent = Math.round((veh.cargoWeightTons / veh.capacityTons) * 100);
        }
        return;
      }

      if (this.vehicleWaypointIndices[veh.id] === undefined) {
        let closestIdx = 0;
        let minDist = Infinity;
        roadPath.forEach((pt, idx) => {
          const d = Math.hypot(pt[0] - veh.lat, pt[1] - veh.lng);
          if (d < minDist) {
            minDist = d;
            closestIdx = idx;
          }
        });
        this.vehicleWaypointIndices[veh.id] = (closestIdx + 1) % roadPath.length;
      }

      let targetIdx = this.vehicleWaypointIndices[veh.id];
      let targetPt = roadPath[targetIdx];
      let dist = Math.hypot(targetPt[0] - veh.lat, targetPt[1] - veh.lng);

      // Advance to next waypoint if close
      if (dist < 0.00025) {
        targetIdx = (targetIdx + 1) % roadPath.length;
        this.vehicleWaypointIndices[veh.id] = targetIdx;
        targetPt = roadPath[targetIdx];
        dist = Math.hypot(targetPt[0] - veh.lat, targetPt[1] - veh.lng);

        // Check if vehicle arrived near a CHYM site to initiate loading stop
        const nearChym = chyms.find((c) => Math.hypot(c.lat - veh.lat, c.lng - veh.lng) < 0.0015);
        if (nearChym && Math.random() < 0.35) {
          this.vehicleLoadingCycles[veh.id] = 3; // Pause for 3 seconds to load
          veh.status = 'YUKLANMOQDA';
          veh.actionStatus = 'YUKLASH';
          veh.speedKmH = 0;
          this.emitEvent(
            `🚛 ${veh.plateNumber} texnikasi "${nearChym.name.split(',')[0]}" maydonchasida chiqindi yuklamoqda`,
            veh.plateNumber,
            'load'
          );
          return;
        }
      }

      // Smooth step towards target along the road (32 - 42 km/h realistic)
      const step = 0.00014;
      const ratio = Math.min(1, step / (dist || 0.0001));
      veh.lat += (targetPt[0] - veh.lat) * ratio;
      veh.lng += (targetPt[1] - veh.lng) * ratio;

      // Heading calculation facing the road
      const angleRad = Math.atan2(targetPt[1] - veh.lng, targetPt[0] - veh.lat);
      const newHeading = Math.round(((angleRad * 180) / Math.PI + 360) % 360);
      veh.heading = newHeading;

      // Real vehicle telemetry
      veh.status = 'HARAKATDA';
      veh.actionStatus = 'HARAKATDA';
      veh.engineStatus = 'RUNNING';
      veh.speedKmH = Math.round(30 + Math.random() * 8);
      veh.todayDistanceKm = Number(((veh.todayDistanceKm || 35) + 0.012).toFixed(2));
      veh.lastUpdated = 'Hozirgina';

      // Record GPS trail history
      if (!veh.trail) veh.trail = [];
      const lastTrailPt = veh.trail[veh.trail.length - 1];
      if (!lastTrailPt || Math.hypot(veh.lat - lastTrailPt[0], veh.lng - lastTrailPt[1]) > 0.00006) {
        veh.trail.push([veh.lat, veh.lng]);
        if (veh.trail.length > 70) {
          veh.trail.shift();
        }
      }

      // 2. Dynamic street & house cleaning
      streets.forEach((str) => {
        if (!str.path || str.path.length === 0) return;
        let isNearStreet = false;
        for (const pt of str.path) {
          if (Math.hypot(pt[0] - veh.lat, pt[1] - veh.lng) < 0.0011) {
            isNearStreet = true;
            break;
          }
        }
        if (isNearStreet) {
          veh.currentStreetName = str.name;
          if (str.status !== 'green' || str.ageHours > 0.3) {
            str.status = 'green';
            str.ageHours = 0.1;
            str.lastPassedAt = 'Hozirgina (Jonli)';
            str.vehiclePlate = veh.plateNumber;
            str.cleanedHousesCount = str.housesCount;
            streetsChanged = true;

            // Mark houses on this street as cleaned
            storageService.markStreetCleaned(str.id, veh.plateNumber);

            this.emitEvent(
              `✓ ${veh.plateNumber} texnikasi "${str.name}" ko‘chasini to‘liq tozaladi (${str.housesCount} ta xonadon)`,
              veh.plateNumber,
              'clean'
            );
          }
        }
      });
    });

    // Save updated telemetry
    storageService.saveVehicles(vehicles);
    if (streetsChanged) {
      storageService.saveStreetNetwork(streets);
    }

    // 3. Occasionally update container fill levels
    if (this.tickCount % 10 === 0) {
      const containers = storageService.getContainers();
      const randIdx = Math.floor(Math.random() * containers.length);
      const c = containers[randIdx];
      if (c && c.fillLevel < 100) {
        c.fillLevel = Math.min(100, c.fillLevel + 3);
        if (c.fillLevel >= 100) c.status = 'To‘lgan';
        else if (c.fillLevel >= 80) c.status = 'Xavfli';
        storageService.saveContainer(c);
      }
    }

    // Notify listeners
    storageService['notifyListeners']();
  }
}

export const simulatorService = new SimulatorService();
