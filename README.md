# TozaHududDM — Chiqindi Xizmatlarini Boshqarish va GIS Monitoring Tizimi
### Navoiy viloyati bo‘yicha maishiy chiqindilarni yig‘ish va olib chiqish xizmatlarini raqamlashtirish platformasi

---

## 📌 Loyiha Haqida
**TozaHududDM** — maishiy chiqindilarni yig‘ish, maxsus texnikalar harakatini nazorat qilish, abonentlar bilan hisob-kitoblarni yuritish, chiqindi yig‘ish maydonchalari (ЧЙМ) va konteynerlar to‘lish darajasini real vaqtda kuzatish uchun mo‘ljallangan zamonaviy yagona raqamli platforma.

Tizim ayniqsa **Navoiy viloyati** (Navoiy shahri, Karmana tumani, Zarafshon, Qiziltepa va boshqa hududlar) sharoitiga to‘liq moslashtirilgan bo‘lib, milliy kadastr va geoaxborot standartlari (`open.ngis.uz` andozasi) asosida ishlaydi.

---

## 🚀 Asosiy Imkoniyatlar va Modullar

1. **🗺️ Milliy GIS Xarita va Jonli GPS Monitoring:**
   - **3 xil rangdagi ko‘chalar tarmog‘i:**
     - 🟢 **Yashil (< 24 soat):** Bugun o‘tilgan, tozalangan ko‘chalar;
     - 🟡 **Sariq (24–48 soat):** 1–2 kun oldin o‘tgan, navbatdagi ko‘chalar;
     - 🔴 **Qizil (> 48 soat):** 2 kundan ortiq o‘tilmagan, kechikkan xavfli hududlar.
   - **Xonadonlarning raqamli pasporti:** Har bir xonadonning kadastr poligonlari, abonent ismi, telefon raqami, aholi (yashovchilar) soni, hisob balansi, oxirgi tozalash vaqti va texnikasi.
   - **"Chiqindi olindi" tezkor qayd etish:** Bir bosishda statusni yashilga o‘tkazish.
   - **Avtomatik uylar generatori va Excel/CSV import:** Ko‘chalar bo‘ylab bitta tugma bilan yuzlab uylarni joylashtirish.
   - **Sun’iy yo‘ldosh (ESRI Sputnik / Ortofoto) va To‘liq ekran GIS (Full-Screen) rejimi.**

2. **📊 Operativ Boshqaruv Paneli (Dashboard):**
   - 10 ta asosiy KPI ko‘rsatkichlari (jonli abonentlar, texnikalar qatnovi, to‘lovlar, to‘plangan chiqindi hajmi);
   - Recharts grafiklari: haftalik dinamika, chiqindi turlari bo‘yicha taqsimot, to‘lovlar va qarzdorlik;
   - Real vaqt rejimida avtomatik ogohlantirishlar (kritik to‘lgan konteynerlar, kechikkan marshrutlar).

3. **👥 Abonentlar va Xonadonlar Boshqaruvi:**
   - Jismoniy va yuridik shaxslar reyestri, hisob-kitoblar, QR-kodli xonadon pasportlari;
   - Qarzdorlik monitoringi va to‘lovlar tarixi.

4. **🚛 Maxsus Texnikalar va Marshrutlar:**
   - GPS telemetriyasi: tezlik, yoqilg‘i sarfi, hajm to‘lishi, haydovchi ma’lumotlari;
   - Kunlik qatnov rejalari va marshrut optimallashtirish.

5. **🗑️ Chiqindi Yig‘ish Maydonchalari (ЧЙМ) va Konteynerlar:**
   - IoT sensorlar simulyatsiyasi: konteynerlarning to‘lish foizi (Normal, Ogohlantirish, Xavfli, Kritik);
   - Chiqindilarni saralash turlari (Aralash, Plastmassa, Qog‘oz, Shisha, Organik).

6. **📱 Ko‘p rolli interfeyslar:**
   - Dispetcher / Super Admin boshqaruvi;
   - Haydovchi mobil planshet interfeysi (navigatsiya, marshrut topshiriqlari);
   - Aholi / Abonent shaxsiy kabineti (balans tekshirish, chiqindi grafigi, onlayn to‘lov va murojaat qoldirish).

---

## 🛠️ Texnologiyalar Steki

- **Frontend:** React 19, TypeScript, Vite 8
- **Dizayn & UI:** Tailwind CSS 4, Lucide React Icons
- **Xarita & Geoinformatsiya:** Leaflet GIS 1.9, ESRI World Imagery (Satellite), OpenStreetMap, CartoDB
- **Grafiklar va Statistika:** Recharts 3.10
- **Ma’lumotlar Boshqaruvi:** Reaktiv LocalStorage Store (kelgusida PostgreSQL / Supabase / Backend API bilan integratsiya uchun tayyor model)

---

## 💻 Mahalliy O‘rnatish va Ishga Tushirish

Loyihani o‘z kompyuteringizda ishga tushirish uchun quyidagi buyruqlarni bajaring:

```bash
# 1. Repozitoriyani klonlash
git clone https://github.com/<USERNAME>/ecocontrol-navoiy.git

# 2. Loyiha papkasiga kirish
cd ecocontrol-navoiy

# 3. Kerakli paketlarni o‘rnatish
npm install

# 4. Dasturni rivojlantirish (dev) rejimida ishga tushirish
npm run dev

# Dastur brauzerda ochiladi: http://localhost:3000
```

---

## 📦 Ishlab Chiqarishga (Production) Yig‘ish

```bash
# Loyihani to‘liq tekshirib, yig‘ish
npm run build

# Yig‘ilgan versiyani lokal sinovdan o‘tkazish
npm run preview
```

---

## 🌐 Onlayn Demo & Mijozga Ko‘rsatish (Deployment)

Loyiha quyidagi bepul va tezkor xosting platformalariga bitta tugma bilan joylashtirilishi mumkin:
- **Vercel:** `vercel --prod`
- **Netlify:** `netlify deploy --prod`
- **GitHub Pages**
