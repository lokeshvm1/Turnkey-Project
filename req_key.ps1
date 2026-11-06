$body = @{ email = "venkatlokesh101@gmail.com" } | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "https://api.web3forms.com/keys/request" -Method Post -Body $body -ContentType "application/json"
    $res | Format-List
} catch {
    Write-Output "Error: $_"
}
