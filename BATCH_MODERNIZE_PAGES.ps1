# Batch modernize remaining pages
$pages = @("cost", "schedule", "progress", "documents", "risks")

foreach ($page in $pages) {
    $oldFile = "E:\Project\epc\frontend\src\app\dashboard\$page\page.tsx"
    $backupFile = "E:\Project\epc\frontend\src\app\dashboard\$page\page.old.backup.tsx"
    
    if (Test-Path $oldFile) {
        Write-Host "Backing up $page page..." -ForegroundColor Yellow
        Copy-Item -Path $oldFile -Destination $backupFile -Force
        Write-Host "✅ Backed up: $backupFile" -ForegroundColor Green
    }
}

Write-Host "`n✅ All pages backed up successfully!" -ForegroundColor Green
Write-Host "Ready for modernization..." -ForegroundColor Cyan
