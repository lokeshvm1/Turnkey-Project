[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
try {
    $body = @{ email = "venkatlokesh101@gmail.com" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "https://api.web3forms.com/register" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
    $res | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
