# Test Cost Code API

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Cost Code API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Login
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@epc.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "   ✓ Login successful!" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0,30))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ✗ Login failed: $_" -ForegroundColor Red
    exit
}

# 2. Get Projects
Write-Host "2. Getting projects..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $projects = Invoke-RestMethod -Uri "http://localhost:3001/api/projects" -Method Get -Headers $headers
    $projectId = $projects[0].id
    Write-Host "   ✓ Found $($projects.Count) project(s)" -ForegroundColor Green
    Write-Host "   Using Project: $($projects[0].name) (ID: $projectId)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ✗ Failed to get projects: $_" -ForegroundColor Red
    exit
}

# 3. Get existing cost codes
Write-Host "3. Getting existing cost codes..." -ForegroundColor Yellow
try {
    $existingCodes = Invoke-RestMethod -Uri "http://localhost:3001/api/cost/codes?projectId=$projectId" -Method Get -Headers $headers
    Write-Host "   ✓ Found $($existingCodes.Count) existing cost code(s)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ✗ Failed to get cost codes: $_" -ForegroundColor Red
    exit
}

# 4. Create new cost code
Write-Host "4. Creating new cost code..." -ForegroundColor Yellow
$newCostCode = @{
    projectId = $projectId
    code = "TEST-001"
    name = "Test Cost Code"
    description = "This is a test cost code created by automation"
    category = "MATERIAL"
    budget = 50000.00
} | ConvertTo-Json

try {
    $createdCode = Invoke-RestMethod -Uri "http://localhost:3001/api/cost/codes" -Method Post -Body $newCostCode -Headers $headers -ContentType "application/json"
    Write-Host "   ✓ Cost code created successfully!" -ForegroundColor Green
    Write-Host "   ID: $($createdCode.id)" -ForegroundColor Gray
    Write-Host "   Code: $($createdCode.code)" -ForegroundColor Gray
    Write-Host "   Name: $($createdCode.name)" -ForegroundColor Gray
    Write-Host "   Budget: $($createdCode.budget)" -ForegroundColor Gray
    Write-Host ""
    $createdId = $createdCode.id
} catch {
    Write-Host "   ✗ Failed to create cost code: $_" -ForegroundColor Red
    Write-Host ""
}

# 5. Update cost code
if ($createdId) {
    Write-Host "5. Updating cost code..." -ForegroundColor Yellow
    $updateData = @{
        name = "Updated Test Cost Code"
        budget = 75000.00
    } | ConvertTo-Json

    try {
        $updated = Invoke-RestMethod -Uri "http://localhost:3001/api/cost/codes/$createdId" -Method Patch -Body $updateData -Headers $headers -ContentType "application/json"
        Write-Host "   ✓ Cost code updated successfully!" -ForegroundColor Green
        Write-Host "   New name: $($updated.name)" -ForegroundColor Gray
        Write-Host "   New budget: $($updated.budget)" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "   ✗ Failed to update cost code: $_" -ForegroundColor Red
        Write-Host ""
    }
}

# 6. Get all cost codes again
Write-Host "6. Getting all cost codes..." -ForegroundColor Yellow
try {
    $allCodes = Invoke-RestMethod -Uri "http://localhost:3001/api/cost/codes?projectId=$projectId" -Method Get -Headers $headers
    Write-Host "   ✓ Total cost codes: $($allCodes.Count)" -ForegroundColor Green
    foreach ($code in $allCodes) {
        Write-Host "   - $($code.code): $($code.name) ($($code.budget))" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "   ✗ Failed to get cost codes: $_" -ForegroundColor Red
    Write-Host ""
}

# 7. Delete test cost code
if ($createdId) {
    Write-Host "7. Deleting test cost code..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "http://localhost:3001/api/cost/codes/$createdId" -Method Delete -Headers $headers
        Write-Host "   ✓ Cost code deleted successfully!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "   ✗ Failed to delete cost code: $_" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
