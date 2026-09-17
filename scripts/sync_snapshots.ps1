# Auto-sync iVMS-4200 snapshots into web monitoring platform
Add-Type -AssemblyName System.Drawing

$captureRoot = "C:\Users\Public\iVMS-4200 Site\UserData\Capture"
$destJpg = Join-Path $PSScriptRoot "..\public\qiziltepa_live_snapshot.jpg"

Write-Host "Monitoring $captureRoot for new snapshots..." -ForegroundColor Green

$lastProcessed = ""

while ($true) {
    $latest = Get-ChildItem -Path $captureRoot -Filter "*.bmp" -Recurse -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending |
              Select-Object -First 1

    if ($latest -and $latest.FullName -ne $lastProcessed) {
        $lastProcessed = $latest.FullName
        try {
            Start-Sleep -Milliseconds 200
            $bmp = [System.Drawing.Bitmap]::FromFile($latest.FullName)
            $bmp.Save($destJpg, [System.Drawing.Imaging.ImageFormat]::Jpeg)
            $bmp.Dispose()
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Yangi kadr yangilandi: $($latest.Name)" -ForegroundColor Cyan
        } catch {
            Write-Warning "Xatolik: $_"
        }
    }
    Start-Sleep -Seconds 3
}
