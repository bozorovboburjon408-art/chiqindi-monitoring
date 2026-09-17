# EcoControl (PokMakon GIS) — Chiqindi Xizmatlarini Boshqarish va GIS Monitoring Tizimi
## NotebookLM va Prezentatsiya Tayyorlash Uchun Loyihaning To‘liq Ma’lumotlar Bazasi

---

## 1. LOYIHA PASPORTI VA UMUMIY TAVSIFI

* **Loyiha nomi:** «EcoControl» (PokMakon GIS) — Chiqindi xizmatlarini boshqarish va geoinformatsion (GIS) monitoring tizimi.
* **Loyiha yo‘nalishi:** Sanitar tozalash, maishiy va qattiq chiqindilarni boshqarish sohasini raqamlashtirish, ekologik nazorat va aqlli shahar (Smart City) texnologiyalari.
* **Qamrov hududi:** Navoiy viloyati (Navoiy shahri, Karmana, Qiziltepa, Zarafshon, Konimex, Nurota, Tomdi, Uchquduq, Xatirchi tumanlari) hamda O‘zbekiston Respublikasining boshqa barcha hududlariga masshtablash (modulli arxitektura).
* **Bosh maqsad:** Chiqindilarni yig‘ish va olib chiqish jarayonlarini yagona raqamli geoaxborot tizimi orqali boshqarish, abonentlar bilan ishlashni to‘liq avtomatlashtirish, maxsus texnikalar harakatini real vaqtda nazorat qilish, chiqindi yig‘ish maydonchalari (ЧЙМ) va konteynerlar to‘lish holatini sun’iy intellekt (AI) va masofaviy kameralar orqali monitoring qilish hamda aholiga ko‘rsatilayotgan xizmat sifatini tubdan oshirish.
* **Tizim formati:** Web-platforma (SaaS / Cloud), mobil planshet interfeysi (Haydovchilar uchun), Telegram-bot / WebApp (Aholi uchun) va situatsion Dispetcherlik markazi.
* **Amaldagi demo havola:** https://bozorovboburjon408-art.github.io/chiqindi-monitoring/

---

## 2. MAVJUD MUAMMOLAR VA LOYIHANING DOLZARBLIGI (PROBLEM STATEMENT)

Bugungi kunda maishiy chiqindilarni yig‘ish va tozalash sohasida quyidagi jiddiy muammolar kuzatilmoqda:

1. **Shaffoflikning yo‘qligi:** Maxsus texnikalar qaysi ko‘chadan qachon o‘tgani, qaysi xonadonlarga xizmat ko‘rsatilgani bo‘yicha aniq raqamli hisob yuritilmaydi (faqat qog‘oz jurnallar).
2. **Konteynerlarning to‘lib toshishi (Perepolnenie):** Chiqindi yig‘ish maydonchalari (ЧЙМ) o‘z vaqtida bo‘shatilmagani sababli chiqindilar yerga sochilib, antisanitariya va aholining haqli e’tirozlariga sabab bo‘lmoqda.
3. **Samarasiz logistika va yoqilg‘i isrofi:** Haydovchilar optimal marshrutlarsiz harakatlanadi, buning oqibatida yoqilg‘i-moylash materiallari (YMM) ortiqcha sarflanadi va ba’zi uzoq ko‘chalar kunlab e’tibordan chetda qoladi.
4. **To‘lov intizomi va qarzdorlik:** Aholi va yuridik shaxslarning xonadonlar pasporti elektron bazasi to‘liq emasligi sababli abonentlardan to‘lovlarni undirishda debitor qarzdorlik yuqori bo‘lib qolmoqda.
5. **Murojaatlarni ko‘rib chiqishdagi sustlik:** Aholi tomonidan tushgan shikoyat va arizalar qog‘ozda yoki tarqoq telefon qo‘ng‘iroqlarida qolib ketadi, ularning ijrosi real vaqtda nazorat qilinmaydi.

---

## 3. TAKLIF ETILAYOTGAN YECHIM: «ECOCONTROL» EKOTIZIMI (SOLUTION)

«EcoControl» — yuqoridagi barcha muammolarni bartaraf etuvchi, ma’lumotlarni bir joyga jamlagan integrallashgan raqamli platforma bo‘lib, quyidagi 3 ta asosiy ustunga tayanadi:

1. **Kosmik aniqlikdagi GIS Xarita (Google Maps Satellite + Hybrid):** Har bir xonadon, har bir ko‘cha va har bir chiqindi maydonchasi milliy kadastr koordinatalari asosida raqamlashtirilgan.
2. **Telemetriya va AI Monitoring:** 40+ ta texnikaning GPS trekerlari orqali harakati, 300+ ta maydonchadagi konteynerlar to‘lishi hamda 50+ ta kameralar orqali kompyuter ko‘rish (Computer Vision) tahlili.
3. **Shaffof Aholi va Moliyaviy Nazorat:** Har bir xonadonning QR-kodli raqamli pasporti, oila a’zolari soni, balans va to‘lovlar tarixi hamda xizmat sifatini 1 dan 5 gacha baholash tizimi.

---

## 4. ASOSIY FUNKSIONAL IMKONIYATLAR VA MODULLAR (TEXNIK TOPSHIRIQ ASOSIDA)

Texnik topshiriq (ТЗ)ning 2-bo‘limiga muvofiq ishlab chiqilgan 10 ta asosiy funksional modul:

### 4.1. Abonentlar va Xonadonlar Bazasi (Raqamli Pasport)
* Abonentlar, yakka tartibdagi hovlilar, ko‘p qavatli uylar va yuridik shaxslar bo‘yicha yagona elektron reyestr.
* Har bir xonadonning GPS koordinatasi va bino parametrlari.
* **Xonadon Raqamli Pasporti:** Uy kodi, ko‘chasi, MFY (mahalla), uy egasi F.I.Sh., telefon raqami, yashovchilar soni, hisob balansi, oxirgi marta chiqindi olingan vaqt, xizmat ko‘rsatgan mashina davlat raqami va haydovchisi.
* **QR-kodli kartalar:** Har bir xonadon uchun alohida QR pasport generatsiyasi (joyiga borib skanerlash yoki devoriga yopishtirish uchun).
* Yangi xonadonlarni xaritaga 1 bosishda qo‘shish (One-Click Household Adding) va Excel/CSV fayllardan ommaviy yuklash.

### 4.2. Abonent Murojaatlari va Shikoyatlar Nazorati
* Aholi va tashkilotlarning ariza, taklif va shikoyatlarini elektron qabul qilish (Sayt, Telegram bot, Call-markaz orqali).
* Murojaat turlari: "Chiqindi o‘z vaqtida olinmadi", "Konteyner to‘lib ketgan", "Noqonuniy chiqindixona", "Haydovchi qo‘polligi", "To‘lov bo‘yicha savol".
* Har bir murojaatga fotosurat, aniq geolokatsiya biriktiriladi va unikal raqam beriladi.
* Tizim murojaatni avtomatik ravishda hudud bo‘yicha mas’ul brigadir yoki dispetcherga yo‘naltiradi.
* Bajarilish muddatlari (SLA), holat monitoringi (Yangi ➔ Jarayonda ➔ Bajarildi ➔ Rad etildi) va fuqaroga natijasi bo‘yicha SMS/Telegram javobi.

### 4.3. GPS Monitoring va Texnikalar Telemetriyasi
* Chiqindi tashuvchi barcha maxsus texnikalarning (Isuzu, KamAZ, MAN va boshqalar) real vaqt rejimidagi GPS joylashuvi, yo‘nalishi va tezligi.
* Mashina holati ko‘rsatkichlari: Marshrutda, To‘xtab turibdi, Garajda, Ta’mirda.
* Yoqilg‘i sathi (bak datchigi), kun davomida bosib o‘tilgan masofa (km) va to‘plangan chiqindi hajmi (m³).
* Haydovchining ismi, telefon raqami, mashina davlat raqami va garaj raqami integratsiyasi.
* Xaritada yangi texnikalarni ro‘yxatdan o‘tkazish (GPS IMEI trekeri bilan ulash).

### 4.4. Marshrutlarni Boshqarish va 3 Rangli Ko‘chalar Tarmog‘i
* **Ko‘chalarning 3 xil rangdagi qarish monitoringi:**
  - 🟢 **Yashil ko‘cha (< 24 soat):** Oxirgi 24 soat ichida maxsus texnika o‘tgan, chiqindisi tozalangan toza hudud.
  - 🟡 **Sariq ko‘cha (24–48 soat):** 1-2 kun oldin tozalangan, bugun yoki ertaga olinishi kerak bo‘lgan navbatdagi ko‘cha.
  - 🔴 **Qizil ko‘cha (> 48 soat):** 2 kundan ortiq muddat texnika kirmagan, xavfli to‘planish zonasiga aylangan ko‘chalar.
* Har bir ko‘cha uchun oxirgi o‘tilgan sana, vaqt va texnika qayd etiladi.
* Dispetcher tomonidan kunlik qatnov jadvallari va marshrut varaqlari shakllantiriladi, bajarilgan va bajarilmagan qismlar avtomatik hisoblanadi.

### 4.5. Chiqindi Yig‘ish Maydonchalari (ЧЙМ) Monitoringi
* Navoiy viloyatidagi barcha mavjud chiqindi to‘plash maydonchalari (300+ ta ob’yekt)ning yagona interaktiv xaritasi.
* Har bir maydonchaning parametrlari: nomi, manzili, mahallasi, konteynerlar sig‘imi, amaldagi konteynerlar soni, tozalik holati.
* Xaritaga yangi maydonchalarni 1 bosishda qo‘shish imkoniyati.

### 4.6. Konteynerlarning To‘lishi va Avtomatik Ogohlantirishlar
* Konteynerlarning to‘lish darajasini foizlarda (% 0 dan 100 gacha) kuzatish.
* Statuslar toifasi:
  - 🟢 Normal (0–50%)
  - 🟡 Diqqat (50–75%)
  - 🟠 Xavfli (75–90%)
  - 🔴 Kritik to‘lgan (90–100%)
* Konteyner to‘lish darajasi belgilangan kritik ko‘rsatkichga (masalan, 80% dan yuqori) yetganda dispetcher monitorida signal chalish va hudud haydovchisiga avtomatik marshrut topshirig‘i yuborish.

### 4.7. Masofaviy Kameralar va AI Snapshot Tahlili
* Chiqindi maydonchalariga o‘rnatilgan 50+ ta videokuzatuv kameralarining RTSP/HLS jonli oqimlari.
* **10 daqiqalik davriy AI Snapshotlar:** Tizim har 10 daqiqada kameradan kadr olib, kompyuter ko‘rish (AI/Computer Vision) neyrotarmog‘i orqali tahlil qiladi:
  - Maydonchada konteynerlar to‘lib toshganmi (perepolnenie)?
  - Chiqindi qutilari atrofida noqonuniy sochilib yotgan chiqindilar bormi?
  - Xavf aniqlansa, darhol tahlil jurnali yoziladi va Telegram bot orqali mas’ul xodimga rasm bilan signal jo‘natiladi.

### 4.8. Abonent Mobil Ilovasi / Telegram Bot
* Aholi uchun qulay, o‘rnatishni talab qilmaydigan Telegram-bot va WebApp:
  - O‘z xonadoni balansini tekshirish;
  - Mahallaga chiqindi mashinasi qachon kelishini (onlayn grafik va xaritasini) ko‘rish;
  - 1 daqiqada rasm va geolokatsiya bilan murojaat qoldirish;
  - Kommunal to‘lovlarni Click / Payme orqali onlayn to‘lash.

### 4.9. Xizmat Sifatini Baholash (Rating & Feedback)
* Ko‘rsatilgan tozalash xizmati bo‘yicha fuqarolarning bevosita fikrini o‘rganish.
* Aholi har bir tozalash jarayonini 1 dan 5 yulduzgacha baholashi va izoh qoldirishi mumkin.
* Haydovchilar, brigadalar va hududlarning xizmat sifati reytingi (NPS / CSI indeksi) avtomatik yuritiladi. Past baholangan xizmatlar bo‘yicha alohida tekshiruv belgilanadi.

### 4.10. Tahliliy Dashboard va Rahbariyat Paneli
* Korxona rahbariyati va viloyat hokimligi uchun real vaqt rejimida yangilanuvchi boshqaruv ekrani.
* Asosiy KPI ko‘rsatkichlari:
  - Bugungi jami olib chiqilgan chiqindi hajmi (tonna / m³);
  - Marshrutdagi va navbatchilikdagi texnikalar soni;
  - O‘z vaqtida tozalangan ko‘chalar va kechikkan nuqtalar ulushi;
  - Kunlik kelib tushgan va ijobiy hal etilgan murojaatlar nisbati;
  - To‘lovlar tushumi, umumiy qarzdorlik miqdori;
  - Chiqindi turlari bo‘yicha tahlil (Organik, Plastik, Qog‘oz, Shisha, Maishiy).
* Excel va PDF formatlarida rasmiy davlat hisobotlarini 1 bosishda yuklab olish.

---

## 5. TIZIM FOYDALANUVCHILARI VA ROLLAR TAQSIMOTI

Tizimda xavfsizlik va vakolatlar doirasini aniq belgilash uchun 6 xil asosiy rol mavjud:

1. **Korxona Rahbariyati / Hokimlik (Super Admin / Viewer):**
   - Barcha hududlar bo‘yicha umumiy holatni kuzatadi;
   - Strategik dashboard, moliyaviy tushumlar, aholi qoniqish reytinglari va tahliliy hisobotlarni ko‘radi;
   - Qarorlar qabul qilish uchun operativ ma’lumotlarga ega bo‘ladi.

2. **Bosh Dispetcherlar va Operatorlar:**
   - GIS xaritani to‘liq rejimda doimiy kuzatib boradi;
   - Mashinalar qatnovi, yo‘nalishdan chetga chiqishlar va tezlik buzilishlarini nazorat qiladi;
   - Favqulodda vaziyatlarda marshrutlarni qayta taqsimlaydi;
   - Murojaatlarni qabul qilib, tegishli mas’ullarga topshiriq biriktiradi.

3. **Hudud va Brigada Mas’ullari (Master / Nazoratchi):**
   - O‘z tuman yoki mahallasiga biriktirilgan ko‘chalar tozaligiga javob beradi;
   - Xonadonlar ro‘yxatini, yangi qo‘shilgan uylarni tekshiradi va tasdiqlaydi;
   - Aholi arizalari bo‘yicha joyiga chiqib muammoni bartaraf etadi.

4. **Maxsus Texnika Haydovchilari:**
   - Maxsus planshet yoki mobil telefon orqali tizimga kiradi;
   - Kunlik marshrut topshirig‘ini oladi, xarita orqali navigatsiya qiladi;
   - Chiqindi yig‘ib bo‘lingan maydoncha yoki ko‘chani "Bajarildi" deb belgilaydi.

5. **Abonentlar (Aholi va Tashkilotlar):**
   - O‘z xonadoni va shartnoma hisob-kitoblarini ko‘radi;
   - Tozalash xizmati sifatini baholaydi;
   - Taklif va shikoyatlarini yuboradi.

6. **Tizim Administratori (IT / DevOps):**
   - Foydalanuvchilar akkauntlarini va kirish huquqlarini boshqaradi;
   - Baza zaxira nusxalarini (Backup) nazorat qiladi;
   - GPS trekerlar, API va videokameralar integratsiyasini sozlaydi.

---

## 6. TEXNOLOGIYALAR STEKI VA ARXITEKTURA

Tizim xalqaro yuqori yuklamali (high-load) standartlar va zamonaviy veb-arxitektura asosida qurilgan:

* **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS (zamonaviy, ultra tezkor, planshet va smartfonlarga to‘liq moslashuvchan responsiv interfeys).
* **Xarita va Geoinformatsiya (GIS):** Leaflet GIS 1.9, Google Maps Hybrid Satellite (kosmik suratlar va aniq ko‘cha to‘ri), ESRI World Imagery, OpenStreetMap.
* **Ma’lumotlar Bazasi va Backend:** PostgreSQL + PostGIS (geografik poligonlar va marshrutlarni saqlash), Supabase Realtime (sekundiga minglab GPS signallarini kechikishsiz uzatish).
* **AI va Kompyuter Ko‘rish (Computer Vision):** OpenCV / YOLO asosidagi konteynerlar to‘lishi va chiqindilar sochilishini aniqlovchi yengil neyrotarmoq moduli.
* **Integratsiyalar:** Wialon / Teltonika GPS trekerlari protokollari, RTSP/ONVIF IP-kameralar, Telegram Bot API, Click / Payme to‘lov shlyuzlari.
* **Xavfsizlik va Zaxiralash:** Role-Based Access Control (RBAC), ma’lumotlarni shifrlash, avtomatik kunlik bulutli zaxiralash (Cloud Backup).

---

## 7. KUTILAYOTGAN NATIJALAR VA IQTISODIY-IJTIMOIY SAMARADORLIK

«EcoControl» tizimining joriy etilishi natijasida kutilayotgan aniq iqtisodiy va boshqaruv natijalari:

| Ko‘rsatkich nomi | Tizim joriy etilishidan oldin | Tizim joriy etilgandan keyin | Kutilayotgan samara |
| :--- | :--- | :--- | :--- |
| **Yoqilg‘i-moylash sarfi (YMM)** | Marshrutlar nazoratsiz, samarasiz qatnov | Optimal AI marshrutlar, qat’iy GPS nazorat | **25% – 30% yoqilg‘i tejalishi** |
| **Ko‘chalarning tozalik qamrovi** | 60–70% (uzoq ko‘chalar qolib ketgan) | 3 rangli xarita orqali 100% nazorat | **98% dan ortiq to‘liq qamrov** |
| **Konteynerlar to‘lib toshishi** | Tez-tez antisanitariya holatlari | 10 daqiqalik AI ogohlantirish | **Perepolnenie holatlari 85% ga kamayadi** |
| **Murojaatlarni hal etish vaqti** | 3 kundan 7 kungacha | 2 soatdan 24 soatgacha | **Ijro tezligi 4 barobar oshadi** |
| **Debitor qarzdorlikni undirish** | Noaniq abonentlar bazasi, past to‘lov | Raqamli pasport va onlayn to‘lov | **Tushumlar 35% – 40% ga oshadi** |
| **Aholi qoniqish darajasi** | 45–50% atrofida | Shaffof xizmat va qayta aloqa | **85% dan yuqori ijobiy baho** |

---

## 8. BOSQICHMA-BOSQICH JORIY ETISH REJASI (ROADMAP)

Loyiha 6 ta aniq bosqichda to‘liq hayotga tatbiq etiladi:

* **1-bosqich: Talablarni tahlil qilish va tizim arxitekturasini ishlab chiqish (Bajarildi)**
  - Texnik topshiriq (ТЗ)ni tasdiqlash, ma’lumotlar bazasi sxemalarini yaratish, dizayn prototiplari.
* **2-bosqich: Abonentlar va hududlar bazasini shakllantirish (Bajarildi)**
  - Navoiy viloyati ko‘chalari, mahallalari va xonadonlar reyestrini xaritaga tushirish, xonadon raqamli pasportlarini joriy etish.
* **3-bosqich: GPS monitoring va marshrut nazoratini ishga tushirish (Bajarildi)**
  - Maxsus texnikalarni tizimga ulash, 3 rangli ko‘chalar tarmog‘ini avtomatlashtirish, dispetcherlik interfeysini sozlash.
* **4-bosqich: ЧЙМ kameralari va konteyner holati monitoringini integratsiya qilish (Hozirgi bosqich)**
  - 300 ta maydoncha bazasi, 50 ta kamera oqimlarini ulash, 10 daqiqalik AI snapshot tahlili.
* **5-bosqich: Murojaatlar moduli, mobil ilova / Telegram bot va baholashni joriy etish**
  - Fuqarolar uchun Telegram bot va shaxsiy kabinetni ishga tushirish, haydovchilar planshet ilovasi.
* **6-bosqich: Sinovdan o‘tkazish (Pilot), xodimlarni o‘qitish va to‘liq sanoat ekspluatatsiyasi**
  - Dispetcherlar va haydovchilarni o‘qitish, davlat organlari va jamoatchilikka rasmiy taqdimot qilish.

---

## 9. NOTEBOOKLM UCHUN PREZENTATSIYA SLAYDLAR REJASI (SLIDE-BY-SLIDE PITCH DECK)

NotebookLM ushbu reja asosida avtomatik ravishda taqdimot slaydlari yaratishi mumkin:

* **1-slayd: Muqova (Title)**
  - Sarlavha: «EcoControl (PokMakon GIS) — Chiqindi xizmatlarini boshqarish va GIS monitoring tizimi»
  - Taglavha: Sanitar tozalash sohasini raqamlashtirish, GPS monitoring, xonadonlar pasporti va sun’iy intellekt nazorati (Navoiy viloyati tajribasi).
* **2-slayd: Sohadagi muammolar (Pain Points)**
  - Texnikalar harakatining shaffof emasligi, yoqilg‘i isrofi, to‘lib ketgan konteynerlar, qarzdorlik va uzoq vaqt ko‘rib chiqiladigan fuqarolar shikoyatlari.
* **3-slayd: Bizning yechim: EcoControl ekotizimi**
  - Barcha jarayonlarni yagona raqamli geoaxborot platformasida birlashtirish (Google Maps Satellite, GPS telemetriya, AI kameralar, Raqamli pasport).
* **4-slayd: Google Maps Satellite asosidagi Milliy GIS Xarita**
  - Har bir bino va ko‘chaning kosmik aniqlikdagi xaritasi, 1 bosishda yangi xonadon, maydoncha va texnika qo‘shish imkoniyati.
* **5-slayd: 3 rangli ko‘chalar tarmog‘i (Smart Route Aging)**
  - Yashil (<24h), Sariq (24-48h) va Qizil (>48h) ko‘chalar. Qaysi ko‘cha qachon tozalangani bo‘yicha 100% shaffof nazorat.
* **6-slayd: Xonadonlarning raqamli pasporti va QR kodlar**
  - Har bir abonentning hisob balansi, oxirgi tozalash vaqti, aholi soni va raqamli kadastr ma’lumotlari.
* **7-slayd: 40+ ta Maxsus texnika GPS telemetriyasi**
  - Real vaqtda tezlik, marshrut, yoqilg‘i sarfi va haydovchi ish unumdorligi ko‘rsatkichlari.
* **8-slayd: ЧЙМ va AI Kamera nazorati (Smart Containers)**
  - 300 ta maydoncha, 50 ta videokamera va har 10 daqiqada konteynerlar to‘lishini aniqlovchi sun’iy intellekt (Computer Vision) tahlili.
* **9-slayd: Aholi portali va Telegram bot**
  - 1 daqiqada rasm bilan shikoyat yoki taklif yuborish, to‘lovlarni onlayn amalga oshirish va xizmat sifatini 1-5 ballik baholash.
* **10-slayd: Rahbariyat Tahliliy Dashboardi (Executive Analytics)**
  - Asosiy KPIlar, davlat hisobotlari (Excel/PDF), kunlik chiqindi hajmi va moliyaviy oqimlar.
* **11-slayd: Iqtisodiy va ijtimoiy samara (Impact & ROI)**
  - 30% yoqilg‘i tejalishi, to‘lovlar tushumi 35% oshishi, murojaatlar ko‘rib chiqilishi 4 barobar tezlashishi.
* **12-slayd: Xulosa va istiqbolli rejalar (Next Steps)**
  - Loyihaning Navoiy viloyatida to‘liq amaliyotga kiritilishi va butun respublika miqyosida joriy etishga tayyorligi.

---

## 10. NOTEBOOKLM UCHUN TAVSIYA ETILGAN SAVOL-JAVOBLAR (FAQ & BRIEFING)

* **Savol 1: EcoControl tizimi oddiy GPS trekerlaridan nimasi bilan farq qiladi?**
  * *Javob:* Oddiy trekerlar faqat mashina koordinatasini ko‘rsatadi. EcoControl esa transport vositasi, 3 rangli ko‘chalar tozalanish tarixi, xonadonlarning raqamli pasporti, konteynerlar to‘lishi va AI videokameralarni yagona zanjirga bog‘lagan to‘liq sohaviy ERP/GIS platformadir.
* **Savol 2: Internet vaqtincha uzilib qolsa tizim qanday ishlaydi?**
  * *Javob:* Haydovchilar planshetidagi ilova va GPS trekerlar «Offline-first» tamoyilida ishlaydi. Aloqa uzilganda ma’lumotlar ichki xotiraga yoziladi va aloqa tiklanishi bilan avtomatik ravishda serverga sinxronlanadi.
* **Savol 3: Xonadon pasporti aholi uchun nima beradi?**
  * *Javob:* Har bir xonadonga berilgan QR pasport orqali fuqaro o‘z balansini bilib boradi, chiqindi qachon olib ketilganini ko‘radi, asossiz qarzdorlik yozilishining oldi olinadi va xizmat sifatini baholash imkoniga ega bo‘ladi.
* **Savol 4: Kameralardagi AI snapshot tahlili nega har 10 daqiqada amalga oshiriladi?**
  * *Javob:* Doimiy video oqimni 24/7 rejimida serverga yuklash qimmat server quvvatlari va katta internet trafigini talab qiladi. Har 10 daqiqada bitta yuqori aniqlikdagi kadrni (snapshot) tahlil qilish esa 99% tejamkorlik bilan 100% aniq natijani kafolatlaydi.
