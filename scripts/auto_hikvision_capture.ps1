# Avtomatik Hik-Connect / EZVIZ 4G Chiqindi Maydonchalari Kamerasini sinxronizatsiya qilish
param(
    [int]$IntervalSeconds = 600,
    [switch]$Once
)

$accessToken = "at.0wltap9z0nstasgpay32lqlj6cfhmmfg-92qwj1wg64-0j2640g-zybp36ro5"
$captureUrl = "https://isgpopen.ezvizlife.com/api/lapp/device/capture"

# Kameralar ro'yxati (seriya raqamlari)
$cameras = @(
    @{ Serial = "GD0492256"; Name = "12-77 Navruz MFY"; Channel = 1; Output = "camera_gd0492256_live.jpg" }
)

$publicDir = Join-Path $PSScriptRoot "..\public"

function Capture-CameraFeed {
    param($cam)
    $serial = $cam.Serial
    $name = $cam.Name
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] So'rov yuborilmoqda: $name ($serial)..." -ForegroundColor Yellow
    
    $body = @{
        accessToken = $accessToken
        deviceSerial = $serial
        channelNo = $cam.Channel
    }

    try {
        $response = Invoke-RestMethod -Uri $captureUrl -Method Post -Body $body -TimeoutSec 20
        if ($response.code -eq "200" -and $response.data.picUrl) {
            $destFile = Join-Path $publicDir $cam.Output
            Invoke-WebRequest -Uri $response.data.picUrl -OutFile $destFile
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Muvaffaqiyatli saqlandi: $($cam.Output)" -ForegroundColor Green
        } else {
            Write-Warning "Kamera ($serial) javobi: $($response.msg)"
        }
    } catch {
        Write-Warning "Tarmoq xatoligi ($serial): $_"
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   AVTOMATIK 10 DAQIQALIK HIKVISION KAMERA CAPTURE        " -ForegroundColor Cyan
Write-Host "   Oraliq: Har $($IntervalSeconds / 60) daqiqada          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

do {
    foreach ($cam in $cameras) {
        Capture-CameraFeed -cam $cam
    }

    if ($Once) {
        break
    }

    Write-Host "Kutilmoqda... Keyingi kadr $($IntervalSeconds / 60) daqiqadan so'ng olinadi." -ForegroundColor Gray
    Start-Sleep -Seconds $IntervalSeconds
} while ($true)
