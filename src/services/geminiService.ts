import { storageService } from './storageService';
import { Subscriber, HousePolygon, Vehicle, StreetNetworkItem, Complaint } from '../types';
import { normalizeUzbekSpeech } from './voiceService';

export interface AIAction {
  type: 'OPEN_SUBSCRIBER' | 'OPEN_HOUSE' | 'OPEN_VEHICLE' | 'NAVIGATE' | 'FILTER_DEBTORS' | 'SHOW_MAP_STREET';
  payload?: any;
  label?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actions?: AIAction[];
  dataPreview?: {
    type: 'subscriber' | 'vehicle' | 'house' | 'debtors_list' | 'stats';
    subscriber?: Subscriber;
    house?: HousePolygon;
    vehicle?: Vehicle;
    items?: any[];
  };
}

const DEFAULT_GEMINI_KEY_B64 = 'QVEuQWI4Uk42SmNpNUlvTU81N3F2N015SmVxbUlhLTY0WmR6dEFDR01kdlYxcDM3QkM5WHc=';

function getInitialGeminiKey(): string {
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;
    const local = localStorage.getItem('ecocontrol_gemini_api_key');
    if (local) return local;
    if (typeof atob === 'function') {
      return atob(DEFAULT_GEMINI_KEY_B64);
    }
    return '';
  } catch {
    return '';
  }
}

class GeminiService {
  private apiKey: string = getInitialGeminiKey();
  private models: string[] = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'];

  public setApiKey(key: string): void {
    this.apiKey = key;
    try {
      localStorage.setItem('ecocontrol_gemini_api_key', key);
    } catch {}
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  private buildSystemContext(): string {
    const subscribers = storageService.getSubscribers();
    const houses = storageService.getHousePolygons();
    const vehicles = storageService.getVehicles();
    const streets = storageService.getStreetNetwork();
    const complaints = storageService.getComplaints();

    const sampleSubs = subscribers.slice(0, 15).map(s => ({
      id: s.id,
      code: s.code,
      name: s.fullName,
      phone: s.phone,
      address: s.address,
      balance: s.balance,
      status: s.status,
      householdNumber: s.householdNumber,
    }));

    const sampleHouses = houses.slice(0, 15).map(h => ({
      id: h.id,
      code: h.code,
      houseNumber: h.houseNumber,
      street: h.streetName,
      mahalla: h.mahalla,
      subscriber: h.subscriberName,
      phone: h.phone,
      balance: h.balance,
      status: h.status,
    }));

    const sampleVehicles = vehicles.map(v => ({
      id: v.id,
      plate: v.plateNumber,
      model: v.model,
      driver: v.driverName,
      phone: v.driverPhone,
      street: v.currentStreetName,
      speed: v.speedKmH,
      fill: v.cargoFillPercent,
      weight: v.cargoWeightTons,
      status: v.status,
    }));

    const streetStats = {
      total: streets.length,
      green: streets.filter(s => s.status === 'green').length,
      yellow: streets.filter(s => s.status === 'yellow').length,
      red: streets.filter(s => s.status === 'red').length,
    };

    return `
Sen "EcoControl" — O'zbekiston maishiy chiqindilarni monitoring qilish va boshqarish tizimining aqlli AI Asistenti / AI Operatorisan.
Tizim Navoiy viloyatining Qiziltepa, Zarafshon, Uchquduq va Tomdi hududlarida faoliyat yuritadi.

Sen foydalanuvchilar (dispetcherlar, operatorlar, rahbarlar)ga tizimdagi abonentlar hisoblarini topish, xonadonlar, mashinalar harakati va chiqindi yig'ish holati bo'yicha yordam berasan.

MAVJUD JONLI MA'LUMOTLAR:
- Jami abonentlar soni: ${subscribers.length} ta. Namuna abonentlar: ${JSON.stringify(sampleSubs)}
- Xonadonlar soni: ${houses.length} ta. Namuna xonadonlar: ${JSON.stringify(sampleHouses)}
- Maxsus texnikalar: ${JSON.stringify(sampleVehicles)}
- Ko'chalar holati: Yashil: ${streetStats.green}, Sariq: ${streetStats.yellow}, Qizil (kechikkan): ${streetStats.red}
- Murojaatlar: Jami ${complaints.length} ta.

QOIDALAR:
1. Agar foydalanuvchi biror odamning ismini aytsa (masalan, "Abdullayev Komiljon", "Komiljon", "Rahimova", "Toshpo'latov" va h.k.), sen bazadagi shu abonentni darhol top, uning to'liq ma'lumotlari (balansi, manzili, telefoni, holati)ni chiroyli va qisqa bayon qil.
2. Javobing doim o'zbek tilida, xushmuomala, professional va tushunarli bo'lsin.
3. Javobingda JSON formatdagi maxsus buyruqni [ACTION:{"type":"...", ...}] ko'rinishida qo'shishing mumkin.
   Mavjud buyruq turlari:
   - [ACTION:{"type":"OPEN_SUBSCRIBER","payload":{"id":"sub-id","name":"Abonent ismi"}}]
   - [ACTION:{"type":"OPEN_HOUSE","payload":{"id":"house-id","subscriberName":"..."}}]
   - [ACTION:{"type":"OPEN_VEHICLE","payload":{"plate":"85 714 UZA"}}]
   - [ACTION:{"type":"NAVIGATE","payload":{"module":"gps"}}]
   - [ACTION:{"type":"FILTER_DEBTORS"}]
`;
  }

  public async sendMessage(
    userText: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
  ): Promise<{ text: string; actions: AIAction[]; dataPreview?: AIMessage['dataPreview'] }> {
    const cleanQuery = normalizeUzbekSpeech(userText);
    const systemInstruction = this.buildSystemContext();

    // 1. Check direct local match for instant fuzzy subscriber lookup
    const localMatch = this.findLocalSubscriberOrEntity(cleanQuery);

    // Build payload for Gemini
    const contents = [
      ...history,
      {
        role: 'user',
        parts: [
          {
            text: `${systemInstruction}\n\nFoydalanuvchi so'rovi (O'zbek tilida): "${cleanQuery}"\n\nIltimos, ravon, sof o'zbek tilida, ovoz bilan o'qishga qulay, aniq javob qaytar. Agar abonent topilgan bo'lsa, mos [ACTION:...] tegini ham qo'sh.`
          }
        ]
      }
    ];

    let replyText = '';
    let usedModel = '';

    // Attempt through models in sequence
    for (const model of this.models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            replyText = data.candidates[0].content.parts[0].text;
            usedModel = model;
            break;
          }
        }
      } catch (err) {
        console.warn(`Model ${model} failed, trying next...`, err);
      }
    }

    // Fallback if network or quota issue
    if (!replyText) {
      if (localMatch.subscriber) {
        const sub = localMatch.subscriber;
        replyText = `🔍 **${sub.fullName}** bo'yicha ma'lumotlar topildi:\n\n` +
          `• **Abonent kodi:** \`${sub.code}\`\n` +
          `• **Telefon:** ${sub.phone}\n` +
          `• **Manzil:** ${sub.address}\n` +
          `• **Hisob balansi:** ${sub.balance >= 0 ? `+${sub.balance.toLocaleString('uz-UZ')} so'm (To'langan)` : `${sub.balance.toLocaleString('uz-UZ')} so'm (🔴 Qarzdor)`}\n` +
          `• **Holati:** ${sub.status}\n\n` +
          `Quyidagi tugma orqali uning profilini to'liq ochishingiz yoki to'lov amalga oshirishingiz mumkin:`;
      } else if (localMatch.vehicle) {
        const veh = localMatch.vehicle;
        replyText = `🚛 **${veh.plateNumber}** maxsus texnikasi haqida ma'lumot:\n\n` +
          `• **Model:** ${veh.model}\n` +
          `• **Haydovchi:** ${veh.driverName || 'Biriktirilmagan'}\n` +
          `• **Hozirgi ko'cha:** ${veh.currentStreetName || 'Qiziltepa markazi'}\n` +
          `• **Tezlik:** ${veh.speedKmH} km/soat\n` +
          `• **Bunker to'lishi:** ${veh.cargoFillPercent || 65}%\n` +
          `• **Holati:** ${veh.status}`;
      } else {
        replyText = `Salom! Men EcoControl tizimi AI operatoriman. Sizga qanday yordam bera olaman? Biror abonent ismi (masalan, **Abdullayev Komiljon**), maxsus texnika raqami yoki qarzdorlar haqida so'rashingiz mumkin.`;
      }
    }

    // Extract actions from [ACTION: {...}] in replyText
    const actions: AIAction[] = [];
    const actionRegex = /\[ACTION:(\{.*?\})\]/g;
    let match;
    while ((match = actionRegex.exec(replyText)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        actions.push(parsed);
      } catch (e) {
        console.error('Error parsing AI action JSON:', e);
      }
    }

    // Clean action tags from user-facing text
    const cleanText = replyText.replace(actionRegex, '').trim();

    // Attach local match actions if none generated
    if (localMatch.subscriber && !actions.some(a => a.type === 'OPEN_SUBSCRIBER')) {
      actions.push({
        type: 'OPEN_SUBSCRIBER',
        payload: { subscriberId: localMatch.subscriber.id, subscriber: localMatch.subscriber },
        label: `👤 ${localMatch.subscriber.fullName} profilini ochish`
      });
    }

    if (localMatch.house && !actions.some(a => a.type === 'OPEN_HOUSE')) {
      actions.push({
        type: 'OPEN_HOUSE',
        payload: { houseId: localMatch.house.id, house: localMatch.house },
        label: `📍 Xaritada uyini ko‘rish (${localMatch.house.houseNumber})`
      });
    }

    if (localMatch.vehicle && !actions.some(a => a.type === 'OPEN_VEHICLE')) {
      actions.push({
        type: 'OPEN_VEHICLE',
        payload: { vehicleId: localMatch.vehicle.id, plate: localMatch.vehicle.plateNumber },
        label: `🚛 ${localMatch.vehicle.plateNumber} GPS trekini ochish`
      });
    }

    return {
      text: cleanText,
      actions,
      dataPreview: localMatch.dataPreview,
    };
  }

  public findLocalSubscriberOrEntity(query: string): {
    subscriber?: Subscriber;
    house?: HousePolygon;
    vehicle?: Vehicle;
    dataPreview?: AIMessage['dataPreview'];
  } {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 2) return {};

    const subscribers = storageService.getSubscribers();
    const houses = storageService.getHousePolygons();
    const vehicles = storageService.getVehicles();

    // 1. Search in subscribers
    const foundSub = subscribers.find(s => {
      const name = s.fullName.toLowerCase();
      const code = s.code.toLowerCase();
      const phone = s.phone.replace(/[^0-9]/g, '');
      const cleanQ = q.replace(/[^a-z0-9а-яё]/gi, '');

      return name.includes(q) ||
        q.includes(name) ||
        name.split(' ').some(part => part.length >= 3 && q.includes(part)) ||
        code.includes(cleanQ) ||
        (cleanQ.length >= 7 && phone.includes(cleanQ));
    });

    // 2. Search in houses
    const foundHouse = houses.find(h => {
      const subName = (h.subscriberName || '').toLowerCase();
      const code = h.code.toLowerCase();
      return subName.includes(q) ||
        q.includes(subName) ||
        subName.split(' ').some(part => part.length >= 3 && q.includes(part)) ||
        code.includes(q);
    });

    // 3. Search in vehicles
    const foundVeh = vehicles.find(v => {
      const plate = v.plateNumber.toLowerCase().replace(/\s+/g, '');
      const qPlate = q.replace(/\s+/g, '');
      const driver = (v.driverName || '').toLowerCase();
      return plate.includes(qPlate) || driver.includes(q);
    });

    if (foundSub) {
      return {
        subscriber: foundSub,
        dataPreview: {
          type: 'subscriber',
          subscriber: foundSub
        }
      };
    }

    if (foundHouse) {
      // Create equivalent subscriber preview if not directly in subscribers
      const subFromHouse: Subscriber = {
        id: foundHouse.id,
        code: foundHouse.code,
        fullName: foundHouse.subscriberName,
        phone: foundHouse.phone,
        address: `${foundHouse.mahalla}, ${foundHouse.streetName}, ${foundHouse.houseNumber}`,
        regionId: foundHouse.regionId,
        regionName: foundHouse.regionName,
        householdNumber: foundHouse.houseNumber,
        type: 'Aholi',
        status: 'Faol',
        balance: foundHouse.balance,
        registeredDate: '2024-01-15',
        lastPaymentDate: foundHouse.lastCollectedTime || 'Bugun',
        tariffPlan: 'Standart (Aholi)',
        rating: 4.8,
      };

      return {
        subscriber: subFromHouse,
        house: foundHouse,
        dataPreview: {
          type: 'subscriber',
          subscriber: subFromHouse,
          house: foundHouse,
        }
      };
    }

    if (foundVeh) {
      return {
        vehicle: foundVeh,
        dataPreview: {
          type: 'vehicle',
          vehicle: foundVeh
        }
      };
    }

    return {};
  }
}

export const geminiService = new GeminiService();
