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

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = window.setInterval(() => this.tick(), 2500);
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

  private tick(): void {
    this.tickCount++;
    const vehicles = storageService.getVehicles();
    const streets = storageService.getStreetNetwork();
    let streetsChanged = false;

    // 1. Move active vehicles strictly along mapped city street waypoints
    vehicles.forEach((veh) => {
      if (veh.status === 'OFFLINE') return;

      const roadPath = VEHICLE_ROAD_PATHS[veh.id];
      if (!roadPath || roadPath.length < 2) return;

      if (this.vehicleWaypointIndices[veh.id] === undefined) {
        // Find closest point on road to start
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

      // If reached current waypoint, advance to next
      if (dist < 0.00035) {
        targetIdx = (targetIdx + 1) % roadPath.length;
        this.vehicleWaypointIndices[veh.id] = targetIdx;
        targetPt = roadPath[targetIdx];
        dist = Math.hypot(targetPt[0] - veh.lat, targetPt[1] - veh.lng);
      }

      // Step towards target along the road segment
      const step = 0.00028; // Realistic speed (~30 km/h)
      const ratio = Math.min(1, step / (dist || 0.0001));
      veh.lat += (targetPt[0] - veh.lat) * ratio;
      veh.lng += (targetPt[1] - veh.lng) * ratio;

      // Heading calculation facing the direction of the road
      const angleRad = Math.atan2(targetPt[1] - veh.lng, targetPt[0] - veh.lat);
      veh.heading = Math.round(((angleRad * 180) / Math.PI + 360) % 360);
      veh.status = 'HARAKATDA';
      veh.speedKmH = Math.round(28 + Math.random() * 8);
      veh.lastUpdated = 'Hozirgina';

      // Record GPS trail (iz qoldirish)
      if (!veh.trail) veh.trail = [];
      const lastTrailPt = veh.trail[veh.trail.length - 1];
      if (!lastTrailPt || Math.hypot(veh.lat - lastTrailPt[0], veh.lng - lastTrailPt[1]) > 0.00008) {
        veh.trail.push([veh.lat, veh.lng]);
        // Keep trail of last 50 coordinates
        if (veh.trail.length > 50) {
          veh.trail.shift();
        }
      }

      // 2. Dynamic street cleaning: Mark street as Green when vehicle drives along it
      streets.forEach((str) => {
        if (!str.path || str.path.length === 0) return;
        let isNearStreet = false;
        for (const pt of str.path) {
          if (Math.hypot(pt[0] - veh.lat, pt[1] - veh.lng) < 0.0012) {
            isNearStreet = true;
            break;
          }
        }
        if (isNearStreet) {
          if (str.status !== 'green' || str.ageHours > 0.5) {
            str.status = 'green';
            str.ageHours = 0.1;
            str.lastPassedAt = 'Hozirgina';
            str.vehiclePlate = veh.plateNumber;
            str.cleanedHousesCount = str.housesCount;
            streetsChanged = true;
          }
        }
      });
    });

    // Save updated vehicles and streets
    storageService.saveVehicles(vehicles);
    if (streetsChanged) {
      storageService.saveStreetNetwork(streets);
    }

    // 3. Every 8 ticks, slightly adjust a container level
    if (this.tickCount % 8 === 0) {
      const containers = storageService.getContainers();
      const randIdx = Math.floor(Math.random() * containers.length);
      const c = containers[randIdx];
      if (c && c.fillLevel < 100) {
        c.fillLevel = Math.min(100, c.fillLevel + 4);
        if (c.fillLevel >= 100) {
          c.status = 'To‘lgan';
        } else if (c.fillLevel >= 80) {
          c.status = 'Xavfli';
        }
        storageService.saveContainer(c);
      }
    }

    // Notify listeners
    storageService['notifyListeners']();
  }
}

export const simulatorService = new SimulatorService();
