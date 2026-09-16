import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { storageService } from './storageService';
import { HousePolygon, Vehicle } from '../types';

export interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  message: string;
}

class SupabaseSyncService {
  private isSyncing = false;
  private realtimeChannels: any[] = [];

  // 1. Ulanishni tekshirish
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase URL yoki Anon Key kiritilmagan' };
    }

    const supabase = getSupabase();
    if (!supabase) return { success: false, message: 'Supabase client yaratib bo‘lmadi' };

    try {
      const { error } = await supabase.from('regions').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          return {
            success: true,
            message: 'Supabase ga ulandi! (Eslatma: supabase/schema.sql jadvallarini yarating)',
          };
        }
        return { success: false, message: `Baza xatosi: ${error.message}` };
      }
      return { success: true, message: 'Supabase PostgreSQL bazasiga muvaffaqiyatli ulandi! 🚀' };
    } catch (err: any) {
      return { success: false, message: `Ulanish xatosi: ${err?.message || 'Noma‘lum xato'}` };
    }
  }

  // 2. Mahalliy ma'lumotlarni Supabase bulutli bazasiga yuklash (Initial Seed / Push)
  public async pushLocalDataToSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase sozlamalari kiritilmagan' };
    }
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: 'Supabase ulanishi mavjud emas' };

    try {
      this.isSyncing = true;

      // A) Hududlarni yuklash
      const regions = storageService.getRegions();
      if (regions.length > 0) {
        await supabase.from('regions').upsert(
          regions.map((r) => ({
            id: r.id,
            name: r.name,
            population: r.population,
            subscribers_count: r.chymCount * 120,
            households_count: r.containersCount * 45,
            coverage_percent: 85.0,
          }))
        );
      }

      // B) Ko'cha tarmoqlarini yuklash
      const streets = storageService.getStreetNetwork();
      if (streets.length > 0) {
        await supabase.from('street_networks').upsert(
          streets.map((s) => ({
            id: s.id,
            name: s.name,
            mahalla: s.mahalla,
            status: s.status,
            age_hours: s.ageHours,
            last_passed_at: s.lastPassedAt,
            vehicle_plate: s.vehiclePlate,
            houses_count: s.housesCount,
            cleaned_houses_count: s.cleanedHousesCount,
            path_coordinates: s.path,
          }))
        );
      }

      // C) Xonadonlarni yuklash
      const houses = storageService.getHousePolygons();
      if (houses.length > 0) {
        const chunkSize = 50;
        for (let i = 0; i < houses.length; i += chunkSize) {
          const chunk = houses.slice(i, i + chunkSize);
          await supabase.from('households').upsert(
            chunk.map((h) => ({
              id: h.id,
              code: h.code,
              house_number: h.houseNumber,
              street_name: h.streetName,
              mahalla: h.mahalla,
              region_name: h.regionName,
              lat: h.center[0],
              lng: h.center[1],
              polygon_latlngs: h.latLngs,
              subscriber_name: h.subscriberName,
              phone: h.phone,
              residents_count: h.residentsCount,
              balance: h.balance,
              last_collected_time: h.lastCollectedTime,
              last_collected_vehicle: h.lastCollectedVehicle,
              last_collected_driver: h.lastCollectedDriver,
              status: h.status,
              type: h.type,
              cadastre_number: h.cadastreNumber,
            }))
          );
        }
      }

      // D) ЧЙМ (Maydonchalarni) yuklash
      const chyms = storageService.getCHYMs();
      if (chyms.length > 0) {
        await supabase.from('chym_sites').upsert(
          chyms.map((c) => ({
            id: c.id,
            name: c.name,
            address: c.address,
            mahalla: c.regionName,
            lat: c.lat,
            lng: c.lng,
            capacity: c.containerCount,
            fill_percent_avg: c.fillPercentAvg,
            cleanliness_status: c.cleanlinessStatus,
            has_camera: c.cameraStatus !== 'OFFLINE',
            rtsp_stream_url: c.cameraUrl || '',
          }))
        );
      }

      // E) Maxsus texnikalarni yuklash
      const vehicles = storageService.getVehicles();
      if (vehicles.length > 0) {
        await supabase.from('vehicles').upsert(
          vehicles.map((v) => ({
            id: v.id,
            plate_number: v.plateNumber,
            model: v.model,
            driver_name: v.driverName || 'Biriktirilmagan',
            lat: v.lat,
            lng: v.lng,
            speed: v.speedKmH,
            fuel_level: v.currentFuelPercent,
            is_active: v.status !== 'OFFLINE',
            status: v.status,
          }))
        );
      }

      this.isSyncing = false;
      return {
        success: true,
        message: `Muvaffaqiyatli yuklandi: ${houses.length} ta xonadon, ${streets.length} ta ko‘cha, ${chyms.length} ta maydoncha, ${vehicles.length} ta mashina.`,
        count: houses.length,
      };
    } catch (err: any) {
      this.isSyncing = false;
      console.error('Supabase push xatosi:', err);
      return { success: false, message: `Yuklashda xatolik: ${err?.message || err}` };
    }
  }

  // 3. Supabase bulutidan ma'lumotlarni tortib olish (Pull)
  public async pullDataFromSupabase(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) return { success: false, message: 'Supabase sozlanmagan' };
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: 'Supabase mavjud emas' };

    try {
      // Xonadonlarni olish
      const { data: remoteHouses, error: houseErr } = await supabase.from('households').select('*');
      if (houseErr) throw houseErr;

      if (remoteHouses && remoteHouses.length > 0) {
        const mappedHouses: HousePolygon[] = remoteHouses.map((h: any) => ({
          id: h.id,
          code: h.code,
          houseNumber: h.house_number,
          streetName: h.street_name,
          mahalla: h.mahalla,
          regionId: h.region_id || 'reg-nav-1',
          regionName: h.region_name || 'Navoiy shahri',
          latLngs: h.polygon_latlngs || [],
          center: [h.lat, h.lng],
          subscriberName: h.subscriber_name,
          phone: h.phone,
          residentsCount: h.residents_count,
          balance: h.balance,
          lastCollectedTime: h.last_collected_time,
          lastCollectedVehicle: h.last_collected_vehicle,
          lastCollectedDriver: h.last_collected_driver,
          status: h.status,
          type: h.type,
          cadastreNumber: h.cadastre_number,
        }));
        storageService.bulkImportHouses(mappedHouses);
      }

      // Texnikalarni olish
      const { data: remoteVehicles } = await supabase.from('vehicles').select('*');
      if (remoteVehicles && remoteVehicles.length > 0) {
        const currentVehicles = storageService.getVehicles();
        remoteVehicles.forEach((v: any) => {
          const match = currentVehicles.find((x) => x.id === v.id || x.plateNumber === v.plate_number);
          if (match) {
            match.lat = v.lat;
            match.lng = v.lng;
            match.speedKmH = v.speed;
            match.currentFuelPercent = v.fuel_level;
            match.status = v.status;
            storageService.saveVehicle(match);
          }
        });
      }

      return { success: true, message: 'Barcha ma‘lumotlar Supabase bazasidan yuklab olindi!' };
    } catch (err: any) {
      return { success: false, message: `Yuklab olishda xatolik: ${err?.message || err}` };
    }
  }

  // 4. Realtime Jonli Yangilanishlar
  public enableRealtimeUpdates(): void {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    this.disableRealtimeUpdates();

    // Mashinalar GPS kuzatuvi
    const vehicleChannel = supabase
      .channel('realtime_vehicles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vehicles' },
        (payload: any) => {
          const v = payload.new;
          if (v) {
            const current = storageService.getVehicles();
            const idx = current.findIndex((x) => x.id === v.id || x.plateNumber === v.plate_number);
            if (idx >= 0) {
              current[idx].lat = v.lat;
              current[idx].lng = v.lng;
              current[idx].speedKmH = v.speed;
              current[idx].currentFuelPercent = v.fuel_level;
              current[idx].status = v.status;
              storageService.saveVehicle(current[idx]);
            }
          }
        }
      )
      .subscribe();

    // Xonadonlar holati
    const houseChannel = supabase
      .channel('realtime_households')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'households' },
        (payload: any) => {
          if (payload.new) {
            const h = payload.new;
            storageService.saveHousePolygon({
              id: h.id,
              code: h.code,
              houseNumber: h.house_number,
              streetName: h.street_name,
              mahalla: h.mahalla,
              regionId: h.region_id || 'reg-nav-1',
              regionName: h.region_name || 'Navoiy shahri',
              latLngs: h.polygon_latlngs || [],
              center: [h.lat, h.lng],
              subscriberName: h.subscriber_name,
              phone: h.phone,
              residentsCount: h.residents_count,
              balance: h.balance,
              lastCollectedTime: h.last_collected_time,
              lastCollectedVehicle: h.last_collected_vehicle,
              lastCollectedDriver: h.last_collected_driver,
              status: h.status,
              type: h.type,
              cadastreNumber: h.cadastre_number,
            });
          }
        }
      )
      .subscribe();

    this.realtimeChannels.push(vehicleChannel, houseChannel);
  }

  public disableRealtimeUpdates(): void {
    const supabase = getSupabase();
    if (supabase && this.realtimeChannels.length > 0) {
      this.realtimeChannels.forEach((ch) => supabase.removeChannel(ch));
      this.realtimeChannels = [];
    }
  }
}

export const supabaseSyncService = new SupabaseSyncService();
