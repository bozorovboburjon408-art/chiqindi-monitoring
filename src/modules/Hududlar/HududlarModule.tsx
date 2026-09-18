import React from 'react';
import { MapPin, Users, Phone, Truck, Trash2, Video, ChevronRight, ShieldCheck } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface HududlarProps {
  onSelectRegion?: (regionId: string) => void;
}

export const HududlarModule: React.FC<HududlarProps> = () => {
  const regions = storageService.getRegions();
  const chyms = storageService.getCHYMs();
  const containers = storageService.getContainers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900">Hududlar va Filiallar</h1>
        <p className="text-xs md:text-sm text-slate-500">
          Tozamakon.eco tizimi bo‘yicha 4 ta rasmiy hudud: Tomdi, Uchquduq, Qiziltepa va Zarafshon &quot;Toza Hudud&quot; DK korxonalari, mas’ul inspektorlar va infratuzilma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {regions.map((reg) => {
          const regChyms = chyms.filter((c) => c.regionId === reg.id);
          const regContainers = containers.filter((c) => c.regionId === reg.id);
          const fullCount = regContainers.filter((c) => c.fillLevel >= 80).length;

          return (
            <div
              key={reg.id}
              className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{reg.fullName || reg.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          KOD: {reg.code}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {reg.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspector Info */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{reg.inspectorName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" /> {reg.inspectorPhone}
                    </div>
                  </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Video className="h-3 w-3" /> ЧЙМ Maydonlari
                    </div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {regChyms.length > 0 ? regChyms.length : reg.chymCount} ta
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> Konteynerlar
                    </div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {regContainers.length > 0 ? regContainers.length : reg.containersCount} ta
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Users className="h-3 w-3" /> Aholi soni
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {reg.population.toLocaleString('uz-UZ')}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Faol texnika
                    </div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">
                      {reg.activeVehiclesCount} ta mashina
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer alert info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {fullCount > 0 ? (
                    <span className="text-rose-600 font-bold">⚠️ {fullCount} ta to‘lgan konteyner</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">Holat barqaror</span>
                  )}
                </span>
                <span className="text-slate-400 text-[11px]">Sektor faol</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
