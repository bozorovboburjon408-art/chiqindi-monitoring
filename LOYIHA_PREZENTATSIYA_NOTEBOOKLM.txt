# EcoControl (PokMakon GIS) — Chiqindi Xizmatlarini Boshqarish va GIS Monitoring Tizimi
## NotebookLM va Prezentatsiya Tayyorlash Uchun Loyihaning To‘liq Ma’lumotlar Bazasi

---

## 📌 BO‘LIMLAR RO‘YXATI (MUNDARIJA)

1. **LOYIHA PASPORTI VA UMUMIY TAVSIFI**
2. **MAVJUD MUAMMOLAR VA LOYIHANING DOLZARBLIGI**
3. **⭐ ALOHIDA BO‘LIM: AHOLI MA’LUMOTLARI VA XARITADA USTIGA BOSGANDA ABONENT MA’LUMOTI CHIQISHI (XONADON RAQAMLI PASPORTI)**
4. **⭐ ALOHIDA BO‘LIM: KAMERALAR VA 10 DAQIQALIK SUN’IY INTELLEKT (AI) MONITORINGI**
5. **⭐ ALOHIDA BO‘LIM: MAXSUS TEXNIKALAR BO‘YICHA BARCHA MA’LUMOTLAR (GPS, YOQILG‘I, HAYDOVCHI, TELEMETRIYA)**
6. **⭐ ALOHIDA BO‘LIM: MOBIL ILOVA (HAYDOVCHILAR PLANSHEТI VA AHOLI TELEGRAM WEBAPP / MOBIL KABINETI)**
7. **MARSHRUTLAR VA 3 RANGLI KO‘CHALAR QARISH MONITORINGI**
8. **TAHLILIY DASHBOARD VA RAHBARIYAT PANELI**
9. **TIZIM FOYDALANUVCHILARI VA 6 TA ROL TAQSIMOTI**
10. **TEXNOLOGIYALAR STEKI VA ARXITEKTURA**
11. **IQTISODIY VA IJTIMOIY SAMARADORLIK (ANIQ RAQAMLARDA)**
12. **BOSQICHMA-BOSQICH JORIY ETISH REJASI (ROADMAP)**
13. **NOTEBOOKLM UCHUN 12 TA TAYYOR PREZENTATSIYA SLAYDLARI REJASI (PITCH DECK)**
14. **NOTEBOOKLM UCHUN SAVOL-JAVOBLAR (FAQ VA SPIKER NUTQI)**

---

## 1. LOYIHA PASPORTI VA UMUMIY TAVSIFI

* **Loyiha rasmiy nomi:** «EcoControl» (PokMakon GIS) — Sanitar tozalash, maishiy va qattiq chiqindilarni boshqarish bo‘yicha geoinformatsion (GIS) monitoring tizimi.
* **Loyiha yo‘nalishi:** Sanitar tozalash sohasini raqamlashtirish, ekologik nazorat, sun’iy intellekt (AI) va «Aqlli shahar» (Smart City) texnologiyalari.
* **Birlamchi qamrov hududi:** Navoiy viloyati (Navoiy shahri, Karmana, Qiziltepa, Zarafshon, Konimex, Nurota, Tomdi, Uchquduq, Xatirchi tumanlari) hamda O‘zbekiston Respublikasining boshqa barcha viloyatlariga to‘liq moslashuvchan (masshtablanuvchi) modulli arxitektura.
* **Bosh maqsad:** Chiqindilarni yig‘ish va olib chiqish jarayonlarini yagona raqamli geoaxborot tizimi orqali boshqarish, abonentlar bilan hisob-kitoblarni avtomatlashtirish, maxsus texnikalar harakatini real vaqtda nazorat qilish, chiqindi yig‘ish maydonchalari (ЧЙМ) va konteynerlar to‘lish holatini sun’iy intellekt (AI) kameralari orqali monitoring qilish hamda aholi uchun xizmat sifatini tubdan oshirish.
* **Tizim formati:** Web-platforma (SaaS / Cloud), mobil planshet interfeysi (Haydovchilar uchun), Telegram-bot / WebApp (Aholi uchun) va Situatsion Dispetcherlik Markazi.
* **Amaldagi jonli demo havola:** https://bozorovboburjon408-art.github.io/chiqindi-monitoring/

---

## 2. MAVJUD MUAMMOLAR VA LOYIHANING DOLZARBLIGI

Bugungi kunda sanitar tozalash korxonalari faoliyatida quyidagi jiddiy muammolar kuzatilmoqda:

1. **Nazoratsizlik va shaffoflik yo‘qligi:** Maxsus mashinalar qaysi ko‘chaga qachon kirgani, qaysi xonadondan chiqindi olingani bo‘yicha aniq raqamli dalil yo‘q. Hamma hisob-kitoblar qo‘lda, qog‘oz jurnallarda yuritiladi.
2. **Konteynerlarning to‘lib toshishi (Perepolnenie):** Maydonchalardagi chiqindi qutilari to‘lib, yerga sochilib ketadi. Bu holat antisanitariya, noxush hidlar va aholining ijtimoiy tarmoqlardagi haqli e’tirozlariga sabab bo‘lmoqda.
3. **Yoqilg‘i va resurslarning isrofi:** Haydovchilar rejadan chetga chiqib, tartibsiz harakatlanadi. Oqibatda yoqilg‘i-moylash materiallari (YMM) 25-30% ga ortiqcha sarflanadi, ayrim chekka ko‘chalar esa kunlab tozalanmay qolib ketadi.
4. **Debitor qarzdorlikning yuqoriligi:** Xonadonlarning aniq raqamli pasporti va yashovchilar soni bo‘yicha bazaning yo‘qligi sababli aholidan to‘lovlarni undirish darajasi past.
5. **Murojaatlarning kechikishi:** Aholi shikoyatlari tarqoq tarzda tushadi, mas’ullarga yetib borguncha kunlar o‘tib ketadi va ijrosi nazorat qilinmaydi.

---

## 3. ⭐ ALOHIDA BO‘LIM: AHOLI MA’LUMOTLARI VA XARITADA USTIGA BOSGANDA ABONENT MA’LUMOTI CHIQISHI (XONADON RAQAMLI PASPORTI)

Ushbu modul aholining yagona elektron reyestrini yuritish va xaritada har bir xonadon bilan interaktiv ishlash uchun xizmat qiladi.

### 3.1. Xaritada Xonadon ustiga bosganda nima sodir bo‘ladi?
* Google Maps sun’iy yo‘ldosh (Satellite) qatlamida Navoiy shahrining barcha xususiy hovlilari va ko‘p qavatli binolari aniq ko‘rinib turadi.
* **1 marta bosish (Click on Map):** Dispetcher yoki inspektor xaritadagi istalgan bino ustiga bosganida darhol interaktiv **"Xonadon Raqamli Pasporti"** oynasi (modal kartasi) ochiladi.

### 3.2. Xonadon Raqamli Pasporti ichidagi to‘liq ma’lumotlar tarkibi:
1. **Manzil ma’lumotlari:**
   - Ko‘cha nomi (masalan, G‘alaba shoh ko‘chasi);
   - Uy va xonadon raqami (masalan, 14-uy);
   - Mahalla fuqarolar yig‘ini — MFY (masalan, Istiqlol MFY);
   - Tuman / Shahar (Navoiy shahri).
2. **Abonent shaxsiy ma’lumotlari:**
   - Abonent (uy egasi) F.I.Sh. (masalan, Rahimov Jasur Erkinovich);
   - Pasport seriyasi va JShShIR kodi;
   - Telefon raqami — interfeysdan bitta tugma orqali to‘g‘ridan-to‘g‘ri qo‘ng‘iroq qilish imkoniyati mavjud.
3. **Yashovchilar soni va xonadon turi:**
   - Oila a’zolari (yashovchilar) soni (masalan, 4 kishi) — to‘lovlar aholi jon boshiga hisoblanishi uchun asosiy ko‘rsatkich;
   - Bino turi: Hovli (yakka tartibdagi turar joy), Ko‘p qavatli uy xonadoni yoki Noturar tijorat ob’yekti.
4. **Moliyaviy hisob-kitob va balans:**
   - Joriy hisob balansi (masalan, `+45 000 so‘m` yoki qarzdorlik `-28 000 so‘m`);
   - Oylik belgilangan to‘lov miqdori;
   - Oxirgi to‘lov amalga oshirilgan sana va unikal chek raqami.
5. **Chiqindi xizmati tarixi va joriy holati:**
   - Xonadon tozalik statusi: 🟢 **Tozalangan** yoki 🔴 **Tozalanmagan**;
   - Oxirgi marta chiqindi olib ketilgan aniq vaqt (masalan: `Bugun 09:14`);
   - Ushbu xonadonga xizmat ko‘rsatgan maxsus texnika davlat raqami (masalan: `85 714 UZA`);
   - Mas’ul haydovchi ismi (masalan: Rustam Karimov).

### 3.3. Xonadon pasportidagi boshqaruv amallari va vositalari:
* **"✅ Chiqindi olindi" tugmasi:** Bitta bosish orqali xonadon statusini darhol "Tozalangan" (yashil) holatga o‘tkazadi va vaqtini sekundigacha yangilaydi.
* **"🖨️ QR Pasport" tugmasi:** Har bir xonadon uchun alohida QR-kodli raqamli pasport generatsiya qiladi. Ushbu QR-kod xonadon darvozasiga yopishtirilishi mumkin. Inspektor yoki haydovchi telefon kamerasi bilan QR-kodni skanerlaganda xonadonning barcha ma’lumotlari ochiladi.
* **"✏️ Tahrirlash" tugmasi:** Yashovchilar soni o‘zgarganda, telefon raqami yangilanganda yoki abonent almashganda ma’lumotlarni 5 soniyada yangilash.
* **"📍 Xonadon qo‘shish" vositasi:** Xaritadagi istalgan bo‘sh tom yoki binoga bosib, koordinatasi avtomatik aniqlangan yangi xonadon kartasini yaratish.
* **"Excel / CSV Import":** Minglab xonadonlarni tayyor jadval orqali bir zumda xaritaga yuklash.

---

## 4. ⭐ ALOHIDA BO‘LIM: KAMERALAR VA 10 DAQIQALIK SUN’IY INTELLEKT (AI) MONITORINGI

Chiqindi yig‘ish maydonchalari (ЧЙМ) va konteynerlarni masofadan nazorat qilishning innovatsion intellektual tizimi.

### 4.1. Maydonchalar va Kameralar infratuzilmasi:
* Navoiy viloyatidagi barcha **300+ ta chiqindi yig‘ish maydonchalari** xaritaga tushirilgan.
* Maydonchalarga o‘rnatilgan **50+ ta videokuzatuv kameralari** (mavjud Hikvision DVR/NVR registratorlari va iVMS-4200 tizimi orqali ishlaydi).
* Har bir maydonchaning pasporti: Maydoncha nomi, manzili, mahallasi, konteynerlar sig‘imi, amaldagi qutilar soni, biriktirilgan kamera va kanal raqami.

### 4.2. ⭐ iVMS-4200 VA HIKVISION TIZIMI BILAN 100% INTEGRATSIYA (ENG MUHIM YUTUQ):
Ko‘plab tashkilotlarda kameralar alohida qimmat IP kameralar emas, balki **Hikvision DVR/NVR registratorlari** va ularni boshqaruvchi **iVMS-4200 dasturi** orqali ishlaydi. «EcoControl» tizimi mavjud infratuzilmani bir so‘m ham ortiqcha xarajat qilmasdan to‘liq integratsiya qila oladi:

1. **Mavjud uskunalar saqlab qolinadi (0 so‘m qo‘shimcha xarajat):** Yangi qimmat IP kameralar sotib olish shart emas. Amaldagi analog HD va iVMS-4200 ga ulangan barcha kameralar tizimga to‘g‘ridan-to‘g‘ri ulanadi.
2. **Hikvision ISAPI / HTTP Snapshot protokoli (10 daqiqalik AI tahlil uchun):**
   - Hikvision registratorlarining barchasida ochiq ISAPI protokoli mavjud.
   - Bizning server har 10 daqiqada registratordan to‘g‘ridan-to‘g‘ri rasm so‘raydi:
     `http://admin:parol@<REGISTRATOR_IP>:80/ISAPI/Streaming/channels/<KANAL_RAQAMI>01/picture`
   - Bu orqali iVMS-4200 dasturiga va internet tarmog‘iga deyarli nol yuklama bilan 50 ta kameraning eng so‘nggi suratlari AI tahliliga tortib olinadi.
3. **RTSP Stream va iVMS-4200 Media Server:**
   - Jonli videoni veb-saytda ko‘rish uchun registratorning RTSP kanallari (`rtsp://admin:parol@IP:554/Streaming/Channels/101`) yoki iVMS-4200 o‘rnatilgan kompyuterdagi yengil media-ko‘prik (MediaMTX / WebRTC) orqali brauzerga jonli uzatiladi.
4. **Hik-Connect Cloud P2P integratsiyasi:**
   - Agar chekka maydonchalardagi registratorlarda statik oq IP bo‘lmasa, ular iVMS-4200 da Hik-Connect (bulutli P2P) orqali ishlaydi. Tizimimiz Hikvision Cloud OpenAPI orqali rasmlarni to‘g‘ridan-to‘g‘ri bulutdan qabul qila oladi.

### 4.3. Nega aynan 10 daqiqalik davriy AI Snapshot texnologiyasi?
* **Iqtisodiy va texnik yechim:** 50 ta kameraning 24/7 uzluksiz video oqimini to‘xtovsiz sun’iy intellekt bilan tahlil qilish juda qimmat server quvvatlari, gigant videokartalar (GPU) va katta internet trafigini talab qiladi.
* **Bizning optimallashtirilgan yechimimiz:** Tizim har 10 daqiqada kameradan 1 dona yuqori aniqlikdagi kadrni (snapshot) oladi va uni serverdagi yengil neyrotarmoq (Computer Vision / YOLOv8) modeliga yo‘naltiradi.
* **Natija:** Server va internet trafigiga ketadigan xarajatlar **95% ga qisqaradi**, lekin maydonchaning nazorati 100% ishonchli va aniq bo‘ladi.

### 4.4. Sun’iy Intellekt (AI) kadrda nimalarni aniqlaydi?
1. **Konteynerlarning to‘lish foizi (0% dan 100% gacha):**
   - 🟢 Normal (0–50% to‘lgan) — holat barqaror;
   - 🟡 Diqqat (50–75% to‘lgan) — navbatdagi reja;
   - 🟠 Xavfli (75–90% to‘lgan) — mashina yuborish kerak;
   - 🔴 Kritik to‘lgan (90–100%) — zudlik bilan tozalash shart.
2. **Chiqindilar to‘lib toshishi (Переполнение / Overflow Detection):** Chiqindilar quti chetidan oshib ketganmi yoki yerga to‘kilganmi?
3. **Noqonuniy chiqindixona va yirik gabaritli chiqindilar:** Maydoncha atrofida tashlab ketilgan qurilish qoldiqlari, shox-shabbalar yoki mebellar mavjudligi.

### 4.5. Avtomatik ogohlantirish (Alert System):
* Agar neyrotarmoq maydonchada to‘lish darajasi 80% dan oshganini yoki yerga chiqindi sochilganini aniqlasa:
  1. Dispetcherlik panelida avtomatik **qizil ogohlantirish signali** chalinadi;
  2. Tizim o‘sha paytning o‘zida tahlil qilingan rasm va foiz bilan **Telegram-bot orqali hudud mas’uli va brigadiriga shoshilinch xabar** yuboradi;
  3. Eng yaqin bo‘sh turgan maxsus texnika planshetiga avtomatik navbatdan tashqari tozalash topshirig‘i qo‘shiladi.
* Har bir kadr, sanasi, vaqti va AI aniqlagan foizi bilan arxivda saqlanadi.

---

## 5. ⭐ ALOHIDA BO‘LIM: MAXSUS TEXNIKALAR BO‘YICHA BARCHA MA’LUMOTLAR (GPS, YOQILG‘I, HAYDOVCHI, TELEMETRIYA)

Korxonaning avtoparkidagi barcha chiqindi tashuvchi transport vositalarining harakatini to‘liq shaffof nazorat qilish moduli.

### 5.1. Avtopark va texnikalar parametrlari:
* Navoiy viloyatiga xizmat ko‘rsatuvchi **40+ ta maxsus texnikalar** (Isuzu NPR 75, KamAZ, MAN, GAZon Next).
* Mashina turi: Orqa yuklovchi (kompaktor), yon yuklovchi, konteyner tashuvchi (multilift) va samosvallar.
* Davlat raqami (masalan, `85 714 UZA`), garaj raqami va avtomobil modeli.
* Kuzov sig‘imi: 8 m³ dan 22 m³ gacha / yuk ko‘tarish hajmi (tonna).
* Yangi mashinani tizimga kiritish: GPS IMEI kodi va haydovchi ma’lumotlarini kiritib, 1 daqiqada yangi texnika ulash imkoniyati.

### 5.2. Haqiqiy vaqt rejimidagi GPS Telemetriya:
* **Jonli joylashuv:** Mashina xaritada qaysi ko‘chada, qaysi uy ro‘parasida turgani sekundma-sekund aks etadi.
* **Harakat tezligi:** Joriy tezlik (km/soat). Aholi punktlarida ruxsat etilgan tezlik (50-60 km/soat) oshirilsa, dispetcherga signal tushadi.
* **Harakat holatlari (Statuslar):**
  - 🟢 **Marshrutda / Harakatda:** Rejali chiqindi yig‘ish jarayonida;
  - 🟡 **To‘xtab turibdi (Idle):** Dvigatel yoniq holatda 10 daqiqadan ortiq turib qolgan holatlar nazorati;
  - 🔵 **Garajda:** Navbatchilikdan tashqari yoki dam olish vaqti;
  - 🔴 **Ta’mirda (Servisda):** Nosozlik tufayli marshrutga chiqmagan mashinalar.
* **Kompaktor va mexanizmlar faolligi:** Chiqindi presslash mexanizmi qaysi nuqtada ishga tushgani datchiklar orqali qayd etiladi (haqiqatda chiqindi olinganini tasdiqlovchi dalil).

### 5.3. Yoqilg‘i sarfi nazorati (DUT — Datchik Urovnya Topliva):
* Har bir mashina bakidagi yoqilg‘i sathi (litrlarda va foizda %);
* Kunlik sarflangan yoqilg‘i miqdori;
* 100 km masofaga yoki 1 soatlik ishga to‘g‘ri kelgan yoqilg‘i sarfi;
* **Yoqilg‘i o‘g‘irlanishi (Sliv)ga qarshi tizim:** Agar bakdagi yonilg‘i keskin pasaysa, tizim darhol koordinatasi va vaqti bilan xavf signali hosil qiladi.

### 5.4. Haydovchi va ekipaj hisobi:
* Har bir mashinaga biriktirilgan asosiy haydovchi (F.I.Sh., aloqa telefoni, toifasi).
* Biriktirilgan yuklovchi ishchilar brigadasi.
* Haydovchining ish vaqti boshlanishi, tugashi va sof marshrutdagi vaqti.
* Bugun bosib o‘tgan masofasi (km) va olib chiqilgan chiqindi hajmi (m³).
* Haydovchining ish unumdorligi va aholi tomonidan qo‘yilgan reytingi.

---

## 6. ⭐ ALOHIDA BO‘LIM: MOBIL ILOVA (HAYDOVCHILAR VA AHOLI INTERFEYSI)

Tizim barcha qatnashchilar uchun qulay, moslashuvchan ikkita mustaqil mobil yechimni taqdim etadi.

### 6.1. Haydovchilar Planshet Ilovasi (Haydovchi Kabineti):
Avtomobil kabinasiga o‘rnatilgan planshet yoki haydovchining smartfonida ishlaydigan professional mobil interfeys:
1. **Ergonomik dizayn:** Mashina boshqarayotganda qulay bo‘lishi uchun katta tugmalar, aniq yozuvlar va yuqori kontrastli interfeys.
2. **Kunlik marshrut topshirig‘i:** Tizim haydovchiga bugun qaysi ko‘chalar va qaysi 15-20 ta chiqindi maydonchasini tozalashi kerakligini ketma-ketlikda ko‘rsatadi.
3. **Aqlli navigatsiya:** Eng qisqa va yoqilg‘i tejamkor yo‘l orqali navbatdagi maydonchaga olib boruvchi yo‘naltirgich.
4. **"Topshiriq bajarildi" tasdiqlash:**
   - Maydonchaga yetib borganda 1 ta tugma orqali "Konteynerlar bo‘shatildi" deb belgilash;
   - Zarur hollarda maydonchaning tozalangan holatini rasmga olib ilovaga yuklash (Photo-Proof).
5. **Offline rejim (Aloqasiz ishlash):** Shahardan tashqarida yoki internet yo‘q joylarda ham ilova to‘xtovsiz ishlaydi, ma’lumotlarni xotiraga yozadi va aloqa paydo bo‘lishi bilan serverga uzatadi.

### 6.2. Aholi Mobil Ilovasi va Telegram WebApp (Abonent Kabineti):
Aholining 90% dan ortig‘i Telegram’dan faol foydalanishini inobatga olib, ortiqcha yuklab olishlarsiz ishlovchi qulay Telegram WebApp va veb-portal:
1. **Shaxsiy xonadon balansi va to‘lovlar:**
   - Fuqaro o‘z xonadoni yoki kvartirasining joriy balansini ko‘radi;
   - Qancha qarzdorlik yoki ortiqcha to‘lov borligi ochiq aks etadi;
   - **Onlayn to‘lov:** Click, Payme, Uzum orqali komissiyasiz, uydan chiqmasdan 1 bosishda chiqindi xizmati uchun to‘lov qilish.
2. **"Chiqindi mashinasi qachon keladi?" grafigi:**
   - Mahallaga mashina haftaning qaysi kunlari soat nechada kelishi aniq jadvali;
   - Maxsus texnikaning xaritadagi jonli yaqinlashib kelayotganini ko‘rish imkoniyati.
3. **1 daqiqada shikoyat va murojaat qoldirish:**
   - Agar chiqindi olinmagan bo‘lsa yoki maydoncha to‘lib ketgan bo‘lsa, fuqaro shunchaki rasmga oladi va botga tashlaydi;
   - Geolokatsiya avtomatik birikadi;
   - Murojaat maqomi real vaqtda ko‘rinadi: `Yuborildi ➔ Dispetcher ko‘rdi ➔ Mashina yuborildi ➔ Bajarildi`.
4. **Xizmat sifatini 5 ballik baholash (Reyting):**
   - Chiqindi olib ketilgandan so‘ng fuqaro telefoniga "Bugungi xizmatimizdan qoniqdingizmi?" so‘rovi keladi;
   - 1 dan 5 yulduzgacha baho qo‘yish va fikr-mulohaza qoldirish imkoniyati.

---

## 7. MARSHRUTLAR VA 3 RANGLI KO‘CHALAR QARISH MONITORINGI

Navoiy viloyatining barcha ko‘chalari (shoh ko‘chalar, ichki mahalla yo‘llari) bo‘yicha tozalik darajasini ranglar bilan ajratuvchi noyob funksiya:

* 🟢 **Yashil ko‘chalar (< 24 soat avval tozalangan):** Oxirgi 24 soat ichida maxsus texnika to‘liq o‘tib, chiqindilari olib chiqilgan toza hududlar.
* 🟡 **Sariq ko‘chalar (24–48 soat avval tozalangan):** 1-2 kun oldin tozalangan, yaqin soatlarda navbatdagi qatnov amalga oshirilishi kerak bo‘lgan ko‘chalar.
* 🔴 **Qizil ko‘chalar (> 48 soat o‘tilmagan / Kechikkan):** 2 kundan ortiq muddat mashina kirmagan, xavfli to‘planish nuqtasiga aylangan, shoshilinch e’tibor talab qiluvchi ko‘chalar.
* Har bir ko‘chani bosganda: ko‘cha nomi, oxirgi o‘tgan texnika raqami, haydovchisi va "✅ Ko‘chani tozalash" tezkor tugmasi mavjud.

---

## 8. TAHLILIY DASHBOARD VA RAHBARIYAT PANELI

Korxona direktori va viloyat hokimligi uchun real vaqt rejimida yangilanuvchi boshqaruv markazi:
* 10 ta asosiy strategik KPI ko‘rsatkichlari (jonli abonentlar soni, qatnovdagi mashinalar, to‘plangan chiqindi tonnaji, kunlik to‘lov tushumi).
* Recharts interaktiv grafiklari:
  - Chiqindi turlari bo‘yicha taqsimot (Organik, Plastmassa, Qog‘oz, Shisha, Maishiy);
  - Haftalik va oylik dinamika;
  - To‘lovlar va qarzdorliklar grafigi.
* Rasmiy hisobotlarni Excel va PDF formatlarida 1 bosishda yuklab olish.

---

## 9. TIZIM FOYDALANUVCHILARI VA 6 TA ROL TAQSIMOTI

1. **Korxona Rahbariyati va Hokimlik:** Strategik tahlil, moliya, tushumlar, umumiy tozalik ko‘rsatkichlari nazorati.
2. **Bosh Dispetcher va Operatorlar:** Jonli GIS xarita nazorati, marshrutlarni boshqarish, texnikalar harakati va xavf signallarini muvofiqlashtirish.
3. **Hudud va Brigada Mas’ullari:** Biriktirilgan mahalla va ko‘chalar tozaligini ta’minlash, murojaatlarni joyiga chiqib hal qilish.
4. **Maxsus Texnika Haydovchilari:** Planshet orqali yo‘nalishlarni bajarish, tozalangan joylarni qayd etish.
5. **Abonentlar (Aholi va Yuridik shaxslar):** Balansni ko‘rish, onlayn to‘lov qilish, xizmat sifatini baholash, murojaat yo‘llash.
6. **Tizim Administratori (IT):** Foydalanuvchilar huquqlari (RBAC), kameralar, GPS trekerlar va baza xavfsizligini ta’minlash.

---

## 10. TEXNOLOGIYALAR STEKI VA ARXITEKTURA

* **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS (zamonaviy, ultra tezkor, to‘liq responsiv UI).
* **Xarita va Geoinformatsiya:** Leaflet GIS 1.9, Google Maps Hybrid Satellite (o‘ta yuqori aniqlikdagi kosmik suratlar va ko‘cha to‘rlari), ESRI World Imagery, OpenStreetMap.
* **Backend va Ma’lumotlar Bazasi:** PostgreSQL + PostGIS (geofazoviy ma’lumotlar, poligonlar), Supabase Realtime (sekundiga minglab telemetriya signallarini uzatish).
* **Sun’iy Intellekt (AI):** YOLOv8 / OpenCV neyrotarmoq modellari (konteyner to‘lishi va chiqindi toshishini aniqlash).
* **Integratsiyalar:** Wialon / Teltonika GPS protokollari, RTSP/ONVIF IP-kameralar, Telegram Bot API, Click / Payme to‘lov shlyuzlari.

---

## 11. IQTISODIY VA IJTIMOIY SAMARADORLIK (ANIQ RAQAMLARDA)

| Ko‘rsatkich nomi | Tizim joriy etilishidan oldin | EcoControl joriy etilgandan keyin | Aniq iqtisodiy va ijtimoiy samara |
| :--- | :--- | :--- | :--- |
| **Yoqilg‘i-moylash sarfi (YMM)** | Nazoratsiz, samarasiz qatnovlar | Optimal marshrut va doimiy GPS nazorat | **25% – 30% yoqilg‘i tejalishi** |
| **Ko‘chalarning tozalik qamrovi** | 60–70% (chekka ko‘chalar qolib ketgan) | 3 rangli xarita orqali 100% nazorat | **98% dan ortiq hudud to‘liq qamrab olinadi** |
| **Konteynerlar to‘lib toshishi** | Doimiy antisanitariya va shikoyatlar | 10 daqiqalik AI ogohlantirish | **Perepolnenie holatlari 85% ga kamayadi** |
| **Murojaatlarni hal etish vaqti** | 3 kundan 7 kungacha | 2 soatdan 24 soatgacha | **Ijro tezligi 4 barobar oshadi** |
| **Abonentlardan to‘lov yig‘imi** | Past to‘lov intizomi, debitorlik yuqori | Raqamli pasport va oson onlayn to‘lov | **Moliyaviy tushumlar 35% – 40% ga oshadi** |
| **Aholi qoniqish darajasi** | 45–50% atrofida | Shaffof xizmat va 5 yulduzli qayta aloqa | **85% dan yuqori ijobiy baho** |

---

## 12. BOSQICHMA-BOSQICH JORIY ETISH REJASI (ROADMAP)

* **1-bosqich: Talablarni tahlil qilish va tizim arxitekturasini ishlab chiqish (Bajarildi)**
* **2-bosqich: Abonentlar va hududlar bazasini shakllantirish, xonadon pasportlarini yaratish (Bajarildi)**
* **3-bosqich: GPS monitoring va marshrut nazoratini ishga tushirish (Bajarildi)**
* **4-bosqich: ЧЙМ kameralari va 10 daqiqalik AI snapshot tahlilini integratsiya qilish (Hozirgi bosqich)**
* **5-bosqich: Murojaatlar moduli, aholi Telegram boti va haydovchilar planshet ilovasini to‘liq joriy etish**
* **6-bosqich: Sinovdan o‘tkazish (Pilot), xodimlarni o‘qitish va to‘liq sanoat ekspluatatsiyasiga topshirish**

---

## 13. NOTEBOOKLM UCHUN 12 TA TAYYOR PREZENTATSIYA SLAYDLARI REJASI (PITCH DECK)

NotebookLM ushbu reja asosida prezentatsiya slaydlarini to‘liq shakllantiradi:

* **1-slayd: Muqova (Title):** «EcoControl (PokMakon GIS) — Chiqindi xizmatlarini boshqarish va GIS monitoring tizimi». Navoiy viloyatida sanitar tozalash sohasini raqamlashtirish.
* **2-slayd: Mavjud muammolar (Pain Points):** To‘lib ketgan konteynerlar, yoqilg‘i isrofi, nazoratsiz marshrutlar va aholi qarzdorligi.
* **3-slayd: Bizning yechim (EcoControl Platformasi):** Kosmik xarita, GPS telemetriya, AI kameralar va raqamli pasportning yagona integratsiyasi.
* **4-slayd: Xonadon Raqamli Pasporti va Xaritadagi Interaktivlik:** Xaritada uyni bosganda abonent ismi, telefoni, balansi, aholi soni va oxirgi tozalash vaqti chiqishi. QR pasport kartalari.
* **5-slayd: 3 rangli ko‘chalar qarish monitoringi:** Yashil (<24h), Sariq (24-48h) va Qizil (>48h) ko‘chalar orqali 100% tozalik nazorati.
* **6-slayd: 40+ ta Maxsus texnika GPS nazorati:** Real vaqtda tezlik, joylashuv, yoqilg‘i sarfi va haydovchilar samaradorligi.
* **7-slayd: 300 ta Maydoncha, iVMS-4200 / Hikvision va 50 ta AI Kamera nazorati:** Mavjud uskunalarni almashtirmasdan (0 so‘m sarflab) iVMS-4200 orqali integratsiya qilish. 10 daqiqalik snapshotlar orqali konteyner to‘lishi va yerga chiqindi sochilishini sun’iy intellekt aniqlashi.
* **8-slayd: Haydovchilar Planshet Ilovasi:** Navigatsiya, kunlik topshiriqlar va bajarilgan ishni fototasdiqlash.
* **9-slayd: Aholi Mobil Kabineti va Telegram WebApp:** 1 daqiqada ariza yuborish, onlayn to‘lov (Click/Payme) va xizmatni 1-5 ballik baholash.
* **10-slayd: Rahbariyat Tahliliy Dashboardi:** Asosiy KPIlar, davlat hisobotlari, tonnaj va moliyaviy oqimlar.
* **11-slayd: Iqtisodiy va ijtimoiy samara:** 30% yoqilg‘i tejalishi, 85% kamaygan perepolnenie, to‘lov tushumining 35% ga oshishi.
* **12-slayd: Xulosa va takliflar:** Navoiy viloyatida tizimni to‘liq joriy etish va butun respublika bo‘yicha kengaytirish.

---

## 14. NOTEBOOKLM UCHUN SAVOL-JAVOBLAR (FAQ VA SPIKER NUTQI)

* **Savol 1: Xaritadagi uy ustiga bosilganda aynan qanday ma’lumotlar ko‘rinadi?**
  * *Javob:* Uy manzili, uy egasining F.I.Sh. va telefoni, yashovchilar soni, hisob balansi, oxirgi chiqindi qaysi soatda, qaysi mashina va haydovchi tomonidan olib ketilgani to‘liq ko‘rinadi. Bitta tugma bilan xonadon QR pasportini chop etish mumkin.
* **Savol 2: Tashkilotda IP kamera emas, iVMS-4200 ilovasi va oddiy Hikvision registratorlari bo‘lsa tizim ishlaydimi?**
  * *Javob:* Albatta! Bu EcoControl tizimining ulkan ustunligidir. Biz yangi qimmat kameralar sotib olishni talab qilmaymiz. Hikvision DVR/NVR registratorlaridagi ochiq ISAPI va RTSP protokollari orqali iVMS-4200 tarmog‘idagi barcha kameralar to‘g‘ridan-to‘g‘ri integratsiya qilinadi va davlat/korxona byudjeti to‘liq tejaladi.
* **Savol 3: Nega kameralarda uzluksiz video emas, 10 daqiqalik AI tahlil qo‘llanilgan?**
  * *Javob:* Bu server va aloqa xarajatlarini 95% ga tejaydi. 10 daqiqa chiqindining to‘lish dinamikasini aniqlash uchun ayni muddao bo‘lib, to‘lib toshishning oldini olishga 100% yetarlidir.
* **Savol 4: Mashinalarning yoqilg‘isi qanday nazorat qilinadi?**
  * *Javob:* Bakka o‘rnatilgan raqamli yonilg‘i datchigi (DUT) GPS treker bilan bog‘langan. U soatlik va masofaviy sarfni hisoblab boradi va ruxsatsiz yoqilg‘i quyish yoki to‘kish (sliv) sodir bo‘lsa, darhol signal beradi.
* **Savol 5: Aholi uchun alohida og‘ir ilovani yuklab olish shartmi?**
  * *Javob:* Yo‘q. Tizim qulay Telegram WebApp formatida ishlaydi. Fuqaro telefoniga ortiqcha dastur o‘rnatmasdan Telegram ichida balansini ko‘radi, to‘lov qiladi va rasm bilan murojaat yubora oladi.
