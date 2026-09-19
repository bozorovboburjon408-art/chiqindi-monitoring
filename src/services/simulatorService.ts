import { storageService } from './storageService';
import { Vehicle, StreetNetworkItem } from '../types';

// Real City Road Waypoints for moving trucks in the 4 Tozamakon districts
// Trucks strictly navigate along city streets and never float across desert or buildings
const VEHICLE_ROAD_PATHS: Record<string, [number, number][]> = {
  // veh-1: Qiziltepa markaziy ko'chalar tarmog'i (Alisher Navoiy -> Bo'ston -> Mustaqillik -> Ibn Sino)
  // veh-1: Qiziltepa markazi — Guliston, Komil Ro'ziyev, Istiqlol va Mustaqillik ko'chalari (OSM haqiqiy yo'l nuqtalari)
  'veh-1': [[40.03535,64.846845],[40.035408,64.846989],[40.035368,64.847166],[40.035353,64.847318],[40.035345,64.847386],[40.035325,64.847557],[40.035305,64.847729],[40.0353,64.847897],[40.035296,64.848064],[40.035291,64.848232],[40.035286,64.8484],[40.035287,64.848522],[40.035304,64.848668],[40.035321,64.848815],[40.035338,64.848961],[40.035377,64.849142],[40.035416,64.849324],[40.035462,64.849455],[40.035509,64.849586],[40.035555,64.849717],[40.035623,64.849887],[40.035691,64.850058],[40.035755,64.850243],[40.035819,64.850429],[40.035883,64.850614],[40.035943,64.850778],[40.03601,64.850932],[40.036077,64.851087],[40.036143,64.851242],[40.03621,64.851396],[40.036282,64.851561],[40.036353,64.851726],[40.036424,64.851891],[40.036496,64.852056],[40.036561,64.852183],[40.036625,64.85231],[40.03669,64.852437],[40.036789,64.852597],[40.036889,64.852757],[40.036988,64.852917],[40.037067,64.853041],[40.037146,64.853166],[40.037225,64.85329],[40.03734,64.8534],[40.037454,64.853511],[40.037575,64.853624],[40.037676,64.853727],[40.037803,64.853822],[40.03793,64.853916],[40.038059,64.854007],[40.038188,64.854097],[40.038317,64.854188],[40.038446,64.854279],[40.038575,64.85437],[40.038703,64.85446],[40.038832,64.854551],[40.038961,64.854642],[40.038961,64.854642],[40.038887,64.854825],[40.038812,64.855009],[40.038738,64.855192],[40.038663,64.855376],[40.038589,64.855559],[40.038547,64.855663],[40.038476,64.855844],[40.038404,64.856025],[40.038333,64.856206],[40.038262,64.856387],[40.03819,64.856568],[40.038119,64.856749],[40.038047,64.85693],[40.037976,64.857111],[40.037942,64.857196],[40.037867,64.857365],[40.037793,64.857533],[40.037718,64.857702],[40.037643,64.85787],[40.037548,64.857957],[40.037453,64.858043],[40.037341,64.858142],[40.03723,64.85824],[40.037118,64.858339],[40.03723,64.85824],[40.037341,64.858142],[40.037453,64.858043],[40.037548,64.857957],[40.037643,64.85787],[40.037718,64.857702],[40.037793,64.857533],[40.037867,64.857365],[40.037942,64.857196],[40.037976,64.857111],[40.038047,64.85693],[40.038119,64.856749],[40.03819,64.856568],[40.038262,64.856387],[40.038333,64.856206],[40.038404,64.856025],[40.038476,64.855844],[40.038547,64.855663],[40.038589,64.855559],[40.038663,64.855376],[40.038738,64.855192],[40.038812,64.855009],[40.038887,64.854825],[40.038961,64.854642],[40.039084,64.854727],[40.039206,64.854812],[40.039329,64.854897],[40.039442,64.854971],[40.039556,64.855045],[40.039669,64.855128],[40.039782,64.855211],[40.039895,64.855293],[40.040008,64.855376],[40.040121,64.855459],[40.040121,64.855459],[40.040053,64.855623],[40.039986,64.855787],[40.039894,64.855938],[40.039803,64.856089],[40.039711,64.856241],[40.03962,64.856392],[40.039528,64.856543],[40.03943,64.856704],[40.039333,64.856865],[40.039235,64.857027],[40.039138,64.857188],[40.03904,64.857349],[40.038943,64.857511],[40.038846,64.857672],[40.038748,64.857833],[40.03865,64.857994],[40.038551,64.858156],[40.038453,64.858317],[40.038355,64.858479],[40.038257,64.85864],[40.038158,64.858802],[40.03806,64.858963],[40.038158,64.858802],[40.038257,64.85864],[40.038355,64.858479],[40.038453,64.858317],[40.038551,64.858156],[40.03865,64.857994],[40.038748,64.857833],[40.038846,64.857672],[40.038943,64.857511],[40.03904,64.857349],[40.039138,64.857188],[40.039235,64.857027],[40.039333,64.856865],[40.03943,64.856704],[40.039528,64.856543],[40.03962,64.856392],[40.039711,64.856241],[40.039803,64.856089],[40.039894,64.855938],[40.039986,64.855787],[40.040053,64.855623],[40.040121,64.855459],[40.040261,64.855559],[40.040402,64.85566],[40.040543,64.85576],[40.040683,64.85586],[40.040683,64.85586],[40.040595,64.85601],[40.040507,64.856161],[40.040419,64.856311],[40.040319,64.856473],[40.040219,64.856636],[40.040119,64.856798],[40.040019,64.85696],[40.039919,64.857122],[40.039819,64.857285],[40.039719,64.857447],[40.039619,64.857609],[40.039519,64.857771],[40.039419,64.857934],[40.039319,64.858096],[40.039219,64.858258],[40.039129,64.858425],[40.039038,64.858591],[40.038947,64.858758],[40.038857,64.858925],[40.038767,64.859091],[40.038676,64.859258],[40.038585,64.859424],[40.038495,64.859591],[40.038585,64.859424],[40.038676,64.859258],[40.038767,64.859091],[40.038857,64.858925],[40.038947,64.858758],[40.039038,64.858591],[40.039129,64.858425],[40.039219,64.858258],[40.039319,64.858096],[40.039419,64.857934],[40.039519,64.857771],[40.039619,64.857609],[40.039719,64.857447],[40.039819,64.857285],[40.039919,64.857122],[40.040019,64.85696],[40.040119,64.856798],[40.040219,64.856636],[40.040319,64.856473],[40.040419,64.856311],[40.040507,64.856161],[40.040595,64.85601],[40.040683,64.85586],[40.040814,64.855955],[40.040945,64.856051],[40.041025,64.856109],[40.041104,64.856163],[40.041241,64.856257],[40.041378,64.856351],[40.041515,64.856445],[40.041652,64.856539],[40.04179,64.856634],[40.041927,64.856728],[40.042064,64.856822],[40.042201,64.856916],[40.042338,64.85701],[40.042475,64.857104],[40.042612,64.857198],[40.042749,64.857292],[40.042886,64.857386],[40.043023,64.85748],[40.043161,64.857575],[40.043298,64.857669],[40.043435,64.857763],[40.043572,64.857857],[40.043709,64.857951],[40.043783,64.858],[40.043857,64.858048],[40.043953,64.858117],[40.04405,64.858187],[40.044146,64.858256],[40.044276,64.858345],[40.044407,64.858433],[40.044537,64.858522],[40.044668,64.858611],[40.044798,64.8587],[40.044928,64.858788],[40.045059,64.858877],[40.045189,64.858966],[40.04532,64.859054],[40.04545,64.859143],[40.045586,64.859236],[40.045723,64.859328],[40.04586,64.859421],[40.045996,64.859514],[40.046132,64.859606],[40.046269,64.859699],[40.046396,64.859786],[40.046522,64.859872],[40.046649,64.859959],[40.046775,64.860045],[40.046902,64.860132],[40.046775,64.860045],[40.046649,64.859959],[40.046522,64.859872],[40.046396,64.859786],[40.046269,64.859699],[40.046132,64.859606],[40.045996,64.859514],[40.04586,64.859421],[40.045723,64.859328],[40.045586,64.859236],[40.04545,64.859143],[40.04532,64.859054],[40.045189,64.858966],[40.045059,64.858877],[40.044928,64.858788],[40.044798,64.8587],[40.044668,64.858611],[40.044537,64.858522],[40.044407,64.858433],[40.044276,64.858345],[40.044146,64.858256],[40.04405,64.858187],[40.043953,64.858117],[40.043857,64.858048],[40.043783,64.858],[40.043709,64.857951],[40.043572,64.857857],[40.043435,64.857763],[40.043298,64.857669],[40.043161,64.857575],[40.043023,64.85748],[40.042886,64.857386],[40.042749,64.857292],[40.042612,64.857198],[40.042475,64.857104],[40.042338,64.85701],[40.042201,64.856916],[40.042064,64.856822],[40.041927,64.856728],[40.04179,64.856634],[40.041652,64.856539],[40.041515,64.856445],[40.041378,64.856351],[40.041241,64.856257],[40.041104,64.856163],[40.041025,64.856109],[40.040945,64.856051],[40.040814,64.855955],[40.040683,64.85586],[40.040543,64.85576],[40.040402,64.85566],[40.040261,64.855559],[40.040121,64.855459],[40.040008,64.855376],[40.039895,64.855293],[40.039782,64.855211],[40.039669,64.855128],[40.039556,64.855045],[40.039442,64.854971],[40.039329,64.854897],[40.039206,64.854812],[40.039084,64.854727],[40.038961,64.854642],[40.038832,64.854551],[40.038703,64.85446],[40.038575,64.85437],[40.038446,64.854279],[40.038317,64.854188],[40.038188,64.854097],[40.038059,64.854007],[40.03793,64.853916],[40.037803,64.853822],[40.037676,64.853727],[40.037575,64.853624],[40.037454,64.853511],[40.03734,64.8534],[40.037225,64.85329],[40.037146,64.853166],[40.037067,64.853041],[40.036988,64.852917],[40.036889,64.852757],[40.036789,64.852597],[40.03669,64.852437],[40.036625,64.85231],[40.036561,64.852183],[40.036496,64.852056],[40.036424,64.851891],[40.036353,64.851726],[40.036282,64.851561],[40.03621,64.851396],[40.036143,64.851242],[40.036077,64.851087],[40.03601,64.850932],[40.035943,64.850778],[40.035883,64.850614],[40.035819,64.850429],[40.035755,64.850243],[40.035691,64.850058],[40.035623,64.849887],[40.035555,64.849717],[40.035509,64.849586],[40.035462,64.849455],[40.035416,64.849324],[40.035377,64.849142],[40.035338,64.848961],[40.035321,64.848815],[40.035304,64.848668],[40.035287,64.848522],[40.035286,64.8484],[40.035291,64.848232],[40.035296,64.848064],[40.0353,64.847897],[40.035305,64.847729],[40.035325,64.847557],[40.035345,64.847386],[40.035353,64.847318],[40.035368,64.847166],[40.035408,64.846989],[40.03535,64.846845]],

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
      const step = 0.00018;
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
        if (veh.trail.length > 150) {
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
