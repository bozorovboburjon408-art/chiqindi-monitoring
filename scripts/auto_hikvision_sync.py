"
Avtomatik Hik-Connect / EZVIZ 4G Chiqindi Maydonchalari Kamerasi Sinxronizatori
Ushbu skript har 10 daqiqada barcha kameralarga masofaviy signal yuborib,
eng so'nggi real kadrni oladi va dasturga (public papkaga) joylaydi.
Foydalanuvchi hech narsani bosib o'tirmaydi!
"
import os
import sys
import time
import json
import urllib.request
import urllib.parse
from datetime import datetime

ACCESS_TOKEN = at.0wltap9z0nstasgpay32lqlj6cfhmmfg-92qwj1wg64-0j2640g-zybp36ro5
CAPTURE_URL = https://isgpopen.ezvizlife.com/api/lapp/device/capture

# Kameralar ro'yxati (seriya raqamlari va maydoncha nomlari)
CAMERAS = [
    {serial: GD0492256, name: 12-77 Navruz MFY, channel: 1},
]

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), .., public))

def capture_camera(serial: str, channel: int = 1):
    try:
        data = urllib.parse.urlencode({
            accessToken: ACCESS_TOKEN,
            deviceSerial: serial,
            channelNo: channel
        }).encode(utf-8)

        req = urllib.request.Request(CAPTURE_URL, data=data, method=POST)
        with urllib.request.urlopen(req, timeout=20) as resp:
            res_json = json.loads(resp.read().decode(utf-8))

        if res_json.get(code) == 200 and data in res_json and picUrl in res_json[data]:
            pic_url = res_json[data][picUrl]
            file_name = fcamera_{serial.lower()}_live.jpg
            target_path = os.path.join(OUTPUT_DIR, file_name)

            urllib.request.urlretrieve(pic_url, target_path)
            now_str = datetime.now().strftime(%Y-%m-%d %H:%M:%S)
            print(f[{now_str}] Kamera {serial} ({file_name}) muvaffaqiyatli saqlandi!)
            return True
        else:
            print(fXatolik ({serial}): {res_json.get('msg', 'Nomaʼlum xatolik')})
            return False
    except Exception as e:
        print(fTarmoq xatosi ({serial}): {e})
        return False

def run_loop(interval_seconds=600):
    print(=======================================================)
    print( AVTOMATIK CHIQINDI MONITORING KAMERA XIZMATI )
    print(f Davriylik: Har {interval_seconds // 60} daqiqada yangilanadi)
    print(f Faol kameralar: {len(CAMERAS)} ta)
    print(=======================================================)

    while True:
        print(f\n[{datetime.now().strftime('%H:%M:%S')}] Barcha kameralardan avtomatik yangi kadr olinmoqda...)
        for cam in CAMERAS:
            print(f-> {cam['name']} ({cam['serial']}) so'ralmoqda...)
            capture_camera(cam[serial], cam.get(channel, 1))

        print(fKutilmoqda... Keyingi kadr {interval_seconds // 60} daqiqadan so'ng olinadi.)
        time.sleep(interval_seconds)

if __name__ == __main__:
    if len(sys.argv) > 1 and sys.argv[1] == --once:
        for cam in CAMERAS:
            capture_camera(cam[serial], cam.get(channel, 1))
    else:
        run_loop(interval_seconds=600)
