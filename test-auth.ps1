# Test Authentication Endpoints

$baseUrl = "http://localhost:4000/api/auth"
$accessToken = ""

Write-Host ""
Write-Host "=== Testing Authentication Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Signup
Write-Host "1. Testing Signup..." -ForegroundColor Yellow
$signupBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-WebRequest -Uri "$baseUrl/signup" -Method POST -Body $signupBody -ContentType "application/json" -UseBasicParsing
    $signupData = $signupResponse.Content | ConvertFrom-Json
    Write-Host "Signup Successful!" -ForegroundColor Green
    Write-Host "  User ID: $($signupData.data.user.id)"
    Write-Host "  Email: $($signupData.data.user.email)"
    Write-Host "  Role: $($signupData.data.user.role)"
    $accessToken = $signupData.data.accessToken
    Write-Host "  Access Token: $($accessToken.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "Signup Failed" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Error: $responseBody" -ForegroundColor Red
    } else {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "Login Successful!" -ForegroundColor Green
    Write-Host "  User: $($loginData.data.user.name)"
    Write-Host "  Email: $($loginData.data.user.email)"
    $accessToken = $loginData.data.accessToken
    Write-Host "  Access Token: $($accessToken.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "Login Failed" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Error: $responseBody" -ForegroundColor Red
    } else {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($accessToken) {
    Write-Host ""
    Write-Host "3. Testing /me endpoint (Protected)..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    try {
        $meResponse = Invoke-WebRequest -Uri "$baseUrl/me" -Method GET -Headers $headers -UseBasicParsing
        $meData = $meResponse.Content | ConvertFrom-Json
        Write-Host "Get Me Successful!" -ForegroundColor Green
        Write-Host "  User: $($meData.data.name)"
        Write-Host "  Email: $($meData.data.email)"
        Write-Host "  Role: $($meData.data.role)"
        Write-Host "  Points: $($meData.data.points)"
    } catch {
        Write-Host "Get Me Failed" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Error: $responseBody" -ForegroundColor Red
        } else {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host ""
    Write-Host "Skipping /me test - No access token available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
