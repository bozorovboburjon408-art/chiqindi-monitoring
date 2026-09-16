import { storageService } from './storageService';

class SimulatorService {
  private timer: number | null = null;
  private isRunning: boolean = false;
  private tickCount: number = 0;

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = window.setInterval(() => this.tick(), 3000);
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

    // 1. Update vehicle positions and statuses
    vehicles.forEach((veh) => {
      if (veh.status === 'OFFLINE') return;

      if (veh.status === 'HARAKATDA' || veh.status === 'MARSHRUTDA') {
        // Small random movement based on heading
        const rad = (veh.heading * Math.PI) / 180;
        const deltaLat = Math.cos(rad) * 0.00035;
        const deltaLng = Math.sin(rad) * 0.00035;

        veh.lat += deltaLat;
        veh.lng += deltaLng;

        // Keep inside Navoiy bounds approx: lat: 40.070-40.145, lng: 65.350-65.410
        if (veh.lat < 40.070 || veh.lat > 40.145 || veh.lng < 65.350 || veh.lng > 65.410) {
          veh.heading = (veh.heading + 140) % 360;
        } else if (Math.random() < 0.2) {
          veh.heading = (veh.heading + (Math.random() * 60 - 30) + 360) % 360;
        }

        // Varied speed
        veh.speedKmH = Math.round(25 + Math.random() * 20);
        veh.lastUpdated = 'Hozir';
      } else if (veh.status === 'TO‘XTAGAN' && Math.random() < 0.15) {
        veh.status = 'HARAKATDA';
        veh.speedKmH = 30;
      }
    });

    // Save updated telemetry without notifying whole app excessively
    localStorage.setItem('ecocontrol_vehicles', JSON.stringify(vehicles));

    // 2. Every 3 ticks (~9 sec), check vehicle proximity to streets to simulate street cleaning
    if (this.tickCount % 3 === 0) {
      const movingVehicles = vehicles.filter(
        (v) => v.status === 'HARAKATDA' || v.status === 'MARSHRUTDA'
      );
      if (movingVehicles.length > 0) {
        const streets = storageService.getStreetNetwork();
        const randVeh = movingVehicles[Math.floor(Math.random() * movingVehicles.length)];
        
        // Find nearest street that is yellow or red to turn green
        const dueStreet = streets.find((s) => s.status !== 'green');
        if (dueStreet) {
          storageService.markStreetCleaned(dueStreet.id, randVeh.plateNumber);
        }
      }
    }

    // 3. Every 5 ticks (~15 sec), slightly vary one container's fill level or trigger alert
    if (this.tickCount % 5 === 0) {
      const containers = storageService.getContainers();
      const randIdx = Math.floor(Math.random() * containers.length);
      const c = containers[randIdx];
      if (c && c.fillLevel < 100) {
        c.fillLevel = Math.min(100, c.fillLevel + 3);
        if (c.fillLevel >= 100) {
          c.status = 'To‘lgan';
          storageService.addNotification({
            id: 'notif-sim-' + Date.now(),
            title: `Kritik to‘lish: Konteyner #${c.code}`,
            message: `${c.address} manzilidagi konteyner 100% ga to‘ldi. Darhol maxsus texnika biriktirish lozim.`,
            type: 'container_full',
            level: 'danger',
            isRead: false,
            createdAt: 'Hozirgina',
            linkModule: 'containers',
            targetId: c.id,
          });
        } else if (c.fillLevel >= 80) {
          c.status = 'Xavfli';
        }
        storageService.saveContainer(c);
      }
    }

    // Trigger storage listeners
    storageService['notifyListeners']();
  }
}

export const simulatorService = new SimulatorService();
