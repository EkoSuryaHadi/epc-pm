# API Health Check Script
# Tests all major API endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API HEALTH CHECK - EPC Project Control" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001/api"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $statusCode = $response.StatusCode
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host " OK ($statusCode)" -ForegroundColor Green
            return @{Name=$Name; Status="✓ PASS"; Code=$statusCode}
        } else {
            Write-Host " WARN ($statusCode)" -ForegroundColor Yellow
            return @{Name=$Name; Status="⚠ WARN"; Code=$statusCode}
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Host " AUTH ($statusCode)" -ForegroundColor Yellow
            return @{Name=$Name; Status="🔒 AUTH"; Code=$statusCode}
        } else {
            Write-Host " FAIL" -ForegroundColor Red
            return @{Name=$Name; Status="✗ FAIL"; Code="Error"}
        }
    }
}

# Test 1: Health Check
$testResults += Test-Endpoint -Name "Health Check" -Method "GET" -Endpoint "/"

# Test 2: Auth - Login (should return 400 or 401 without credentials)
$testResults += Test-Endpoint -Name "Auth Login" -Method "POST" -Endpoint "/auth/login"

# Test 3: Projects (should return 401 without auth)
$testResults += Test-Endpoint -Name "Projects List" -Method "GET" -Endpoint "/projects"

# Test 4: Users (should return 401 without auth)
$testResults += Test-Endpoint -Name "Users List" -Method "GET" -Endpoint "/users"

# Test 5: Check if Swagger docs accessible
$testResults += Test-Endpoint -Name "API Docs" -Method "GET" -Endpoint "/docs"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$testResults | ForEach-Object {
    $status = $_.Status
    $color = switch -Wildcard ($status) {
        "✓*" { "Green" }
        "🔒*" { "Yellow" }
        "⚠*" { "Yellow" }
        default { "Red" }
    }
    
    Write-Host "$($_.Name.PadRight(20)) : $status (Code: $($_.Code))" -ForegroundColor $color
}

$passCount = ($testResults | Where-Object {$_.Status -like "✓*"}).Count
$authCount = ($testResults | Where-Object {$_.Status -like "🔒*"}).Count
$total = $testResults.Count

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Passed: $passCount | Auth Required: $authCount | Total: $total" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($passCount -gt 0) {
    Write-Host "✓ Backend API is responding!" -ForegroundColor Green
} else {
    Write-Host "✗ Backend API may have issues!" -ForegroundColor Red
}
