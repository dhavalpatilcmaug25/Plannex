$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    username = "debugUser6"
    email = "debug6@example.com"
    password = "DebugPass123!"
    role = @("customer")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/register" -Method Post -Headers $headers -Body $body
    Write-Host "Success:"
    Write-Host $response
} catch {
    Write-Host "Error Status:" $_.Exception.Response.StatusCode
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        $errBody | Out-File -FilePath "response.json" -Encoding utf8
        Write-Host "Error saved to response.json"
    }
}
