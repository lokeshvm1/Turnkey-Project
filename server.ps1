param(
    [int]$Port = 8080,
    [string]$RecipientEmail = "venkatlokesh101@gmail.com"
)

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
}

$inquiriesFile = Join-Path $root "inquiries.json"
if (-not (Test-Path $inquiriesFile)) {
    "[]" | Set-Content -Path $inquiriesFile -Encoding UTF8
}

$configFile = Join-Path $root "email_config.json"
$lastEmailFile = Join-Path $root "last_email_sent.html"

function Build-LuxuryEmailHtml($entry, $heroCid = "HeroVillaImage") {
    $ref = $entry.refNumber
    $date = $entry.timestamp
    $name = if ($entry.clientName) { $entry.clientName } else { "Valued Client" }
    $phone = if ($entry.contactPhone) { $entry.contactPhone } else { "-" }
    $email = if ($entry.clientEmail) { $entry.clientEmail } else { "-" }
    $loc = if ($entry.siteLocation) { $entry.siteLocation } else { "Regional Atelier" }
    $area = if ($entry.areaSqFt) { $entry.areaSqFt } else { "5,000" }
    $scope = if ($entry.turnkeyScope) { $entry.turnkeyScope } else { "Complete Turnkey Execution" }
    $structure = if ($entry.structure) { $entry.structure } else { "Luxury Residential Villa" }
    $timeline = if ($entry.timeline) { $entry.timeline } else { "Immediate / 1-3 Months" }
    $details = if ($entry.turnkeyDetails) { $entry.turnkeyDetails } else { "Turnkey project specifications registered via web portal." }
    
    $cleanPhone = ($phone -replace '[^\d+]', '')

    return @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FORMA ARCHITECTS - Turnkey Specification Brief</title>
</head>
<body style="margin: 0; padding: 0; background-color: #c5bbb0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #c5bbb0; padding: 30px 10px 50px;">
    <tr>
      <td align="center">
        
        <!-- Header Tag -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-bottom: 18px;">
          <tr>
            <td align="center">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 4px; color: #4a453f; text-transform: uppercase;">REAL ESTATE &amp; ARCHITECTURAL TURNKEY</span>
              <h1 style="font-size: 26px; font-weight: 500; letter-spacing: 2px; color: #1a1816; text-transform: uppercase; margin: 6px 0 0; font-family: Georgia, 'Times New Roman', serif;">NEW INQUIRY SPECIFICATION BRIEF</h1>
            </td>
          </tr>
        </table>

        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #090a0d; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.35); border: 1px solid #23252b;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #0e1014; padding: 22px 28px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 16px; font-weight: 700; letter-spacing: 4px; color: #ffffff; text-transform: uppercase; font-family: Georgia, serif;">FORMA ARCHITECTS</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 5px 12px; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; background-color: #c5a880; color: #08090b; border-radius: 3px;">TURNKEY BRIEF</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Image Banner -->
          <tr>
            <td style="position: relative; background-color: #050506; text-align: center;">
              <img src="cid:$heroCid" alt="Architectural Turnkey Estate" width="600" style="width: 100%; max-width: 600px; height: auto; display: block;" />
            </td>
          </tr>

          <!-- Hero Headline Banner -->
          <tr>
            <td style="background: linear-gradient(180deg, #0e1014 0%, #090a0d 100%); padding: 22px 28px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #c5a880; text-transform: uppercase; margin-bottom: 6px;">EXCLUSIVE SPECIFICATION</span>
              <h2 style="font-size: 24px; font-weight: 600; letter-spacing: 1px; color: #ffffff; text-transform: uppercase; margin: 0 0 6px; font-family: Georgia, serif;">$structure</h2>
              <div style="font-size: 13px; font-weight: 600; letter-spacing: 2px; color: #c5a880; text-transform: uppercase;">$loc &bull; $area SQ FT</div>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 24px 28px;">
              
              <!-- Reference Pill -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #14171d; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 22px;">
                <tr>
                  <td style="padding: 12px 18px; font-size: 12px; letter-spacing: 1.5px; color: #c2c6cf; text-transform: uppercase;">
                    REFERENCE: <strong style="color: #ffffff;">#$ref</strong>
                  </td>
                  <td align="right" style="padding: 12px 18px; font-size: 12px; letter-spacing: 1px; color: #8c93a0;">
                    $date
                  </td>
                </tr>
              </table>

              <!-- Highlights Title -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 14px; padding-bottom: 8px;">
                <tr>
                  <td>
                    <span style="font-size: 13px; font-weight: 700; letter-spacing: 3px; color: #c5a880; text-transform: uppercase; font-family: Georgia, serif;">THE DETAILS &amp; HIGHLIGHTS</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; letter-spacing: 1.5px; color: #7b8290; text-transform: uppercase;">TURNKEY PARAMETERS</span>
                  </td>
                </tr>
              </table>

              <!-- Specification Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #11141a; border-radius: 8px; border: 1px solid rgba(255,255,255,0.07); margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 13px 18px; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #8c93a0; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); width: 38%;">CLIENT NAME</td>
                  <td style="padding: 13px 18px; font-size: 13px; font-weight: 600; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.05);">$name</td>
                </tr>
                <tr>
                  <td style="padding: 13px 18px; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #8c93a0; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05);">CONTACT PHONE</td>
                  <td style="padding: 13px 18px; font-size: 13px; font-weight: 700; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <a href="tel:$cleanPhone" style="color: #ffffff; text-decoration: underline;">$phone</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 13px 18px; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #8c93a0; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05);">CLIENT EMAIL</td>
                  <td style="padding: 13px 18px; font-size: 13px; font-weight: 500; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <a href="mailto:$email" style="color: #ffffff; text-decoration: underline;">$email</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 13px 18px; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #8c93a0; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05);">SITE LOCATION</td>
                  <td style="padding: 13px 18px; font-size: 13px; font-weight: 600; color: #e5c89c; border-bottom: 1px solid rgba(255,255,255,0.05);">$loc</td>
                </tr>
                <tr>
                  <td style="padding: 13px 18px; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #8c93a0; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05);">PLOT / BUILT-UP</td>
                  <td style="padding: 13px 18px; font-size: 13px; font-weight: 600; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.05);">$area SQ FT</td>
                </tr>
                <tr>
                  <td style="padding: 13px 18px; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #8c93a0; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05);">TURNKEY SCOPE</td>
                  <td style="padding: 13px 18px; font-size: 13px; font-weight: 600; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.05);">$scope</td>
                </tr>
                <tr>
                  <td style="padding: 13px 18px; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #8c93a0; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05);">STRUCTURE TYPE</td>
                  <td style="padding: 13px 18px; font-size: 13px; font-weight: 600; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.05);">$structure</td>
                </tr>
                <tr>
                  <td style="padding: 13px 18px; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #8c93a0; text-transform: uppercase;">START TIMELINE</td>
                  <td style="padding: 13px 18px; font-size: 13px; font-weight: 600; color: #ffffff;">$timeline</td>
                </tr>
              </table>

              <!-- Requirements Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #11141a; border-left: 3px solid #c5a880; border-radius: 6px; border: 1px solid rgba(255,255,255,0.07); margin-bottom: 26px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 2.5px; color: #c5a880; text-transform: uppercase; margin-bottom: 8px;">PROJECT REQUIREMENTS &amp; SCOPE NOTES</div>
                    <div style="font-size: 13px; line-height: 1.6; color: #d1d5db;">$details</div>
                  </td>
                </tr>
              </table>

              <!-- Action Call Buttons (Matching Canva Pill style) -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center; margin-bottom: 10px;">
                <tr>
                  <td align="center">
                    <a href="tel:$cleanPhone" style="display: inline-block; background-color: #ffffff; color: #08090b !important; padding: 14px 34px; border-radius: 999px; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(255,255,255,0.2);">
                      CALL CLIENT DIRECTLY
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Studio Footer Signature -->
          <tr>
            <td style="background-color: #060709; padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 13px; font-weight: 700; letter-spacing: 4px; color: #ffffff; text-transform: uppercase; font-family: Georgia, serif; margin-bottom: 6px;">FORMA ARCHITECTS</div>
              <div style="font-size: 11px; font-weight: 500; letter-spacing: 2px; color: #8c93a0; margin-bottom: 10px;">CHENNAI &bull; COIMBATORE &bull; BENGALURU</div>
              <div style="font-size: 10px; letter-spacing: 1px; color: #555b66;">Confidential Turnkey Architectural Specification Brief &bull; Dispatched to venkatlokesh101@gmail.com</div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
"@
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "[ERROR] Could not start listener on $prefix : $_"
    exit 1
}

Write-Host "=================================================="
Write-Host "FORMA ARCHITECTS Server Running on $prefix"
Write-Host "Primary Recipient: $RecipientEmail"
Write-Host "Email Template Preview: ${prefix}email-preview.html"
Write-Host "API Route: POST ${prefix}api/send-inquiry [ACTIVE]"
Write-Host "API Route: GET  ${prefix}api/inquiries   [ACTIVE]"
Write-Host "=================================================="

# Generate initial last_email_sent.html from most recent inquiry if present
try {
    $existingInquiries = Get-Content -Path $inquiriesFile -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($existingInquiries -and $existingInquiries.Count -gt 0) {
        $lastOne = $existingInquiries[-1]
        $initialHtml = Build-LuxuryEmailHtml $lastOne "/image/clean_frames/frame_0119.jpg"
        $initialHtml | Set-Content -Path $lastEmailFile -Encoding UTF8
    }
} catch {}

while ($listener.IsListening) {
    $context = $null
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $rawUrl = $request.Url.AbsolutePath

        # GET /api/inquiries - View recorded inquiries
        if ($rawUrl -eq "/api/inquiries" -and $request.HttpMethod -eq "GET") {
            $content = if (Test-Path $inquiriesFile) { Get-Content -Path $inquiriesFile -Raw -Encoding UTF8 } else { "[]" }
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.StatusCode = 200
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        # POST /api/send-inquiry - Process form submission
        if ($rawUrl -eq "/api/send-inquiry" -and $request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $jsonString = $reader.ReadToEnd()
            $reader.Close()

            $data = $null
            try {
                $data = $jsonString | ConvertFrom-Json
            } catch {
                Write-Host "[WARN] Invalid JSON received"
            }

            if (-not $data) {
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":false,"error":"Invalid JSON"}')
                $response.StatusCode = 400
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                $response.Close()
                continue
            }

            $refId = "FORMA-TK-" + (Get-Random -Minimum 1000 -Maximum 9999)
            $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

            $cName = if ($data.name) { [string]$data.name } else { "Client" }
            $cPhone = if ($data.phone) { [string]$data.phone } else { "-" }
            $cEmail = if ($data.email) { [string]$data.email } else { "-" }
            $cLoc = if ($data.location) { [string]$data.location } else { "-" }
            $cArea = if ($data.area) { [string]$data.area } else { "-" }
            $cScope = if ($data.turnkey_scope) { [string]$data.turnkey_scope } else { "Complete Turnkey" }
            $cStruct = if ($data.structure) { [string]$data.structure } else { "Luxury Residential Villa" }
            $cTime = if ($data.timeline) { [string]$data.timeline } else { "1-3 Months" }
            $cDetails = if ($data.turnkey_details) { [string]$data.turnkey_details } else { "-" }

            $entry = [ordered]@{
                refNumber       = $refId
                timestamp       = $timestamp
                recipient       = $RecipientEmail
                clientName      = $cName
                contactPhone    = $cPhone
                clientEmail     = $cEmail
                siteLocation    = $cLoc
                areaSqFt        = $cArea
                turnkeyScope    = $cScope
                structure       = $cStruct
                timeline        = $cTime
                turnkeyDetails  = $cDetails
            }

            try {
                $existing = Get-Content -Path $inquiriesFile -Raw -Encoding UTF8 | ConvertFrom-Json
                if (-not $existing) { $existing = @() }
                $updated = @($existing) + $entry
                $updated | ConvertTo-Json -Depth 5 | Set-Content -Path $inquiriesFile -Encoding UTF8
            } catch {
                Write-Host "[WARN] Could not update inquiries.json"
            }

            Write-Host "[NEW INQUIRY RECORDED] Ref: $refId | Client: $cName | Phone: $cPhone"

            # Always save high-end HTML email for inspection
            $emailHtmlForWeb = Build-LuxuryEmailHtml $entry "/image/clean_frames/frame_0119.jpg"
            $emailHtmlForWeb | Set-Content -Path $lastEmailFile -Encoding UTF8

            # Check for credentials in email_config.json or environment
            $smtpUser = $env:SMTP_USER
            $smtpPass = $env:SMTP_PASS
            $targetEmail = $RecipientEmail
            $smtpHost = "smtp.gmail.com"
            $smtpPort = 587

            if (Test-Path $configFile) {
                try {
                    $cfg = Get-Content -Path $configFile -Raw -Encoding UTF8 | ConvertFrom-Json
                    if ($cfg.smtp_user) { $smtpUser = [string]$cfg.smtp_user }
                    if ($cfg.smtp_pass) { $smtpPass = [string]$cfg.smtp_pass }
                    if ($cfg.recipient_email) { $targetEmail = [string]$cfg.recipient_email }
                    if ($cfg.smtp_host) { $smtpHost = [string]$cfg.smtp_host }
                    if ($cfg.smtp_port) { $smtpPort = [int]$cfg.smtp_port }
                } catch {
                    Write-Host "[WARN] Could not parse email_config.json"
                }
            }

            $emailDispatched = $false
            $emailNote = ""

            if ($smtpUser -and $smtpPass) {
                try {
                    $smtp = New-Object System.Net.Mail.SmtpClient($smtpHost, $smtpPort)
                    $smtp.EnableSsl = $true
                    $smtp.Credentials = New-Object System.Net.NetworkCredential($smtpUser, $smtpPass)

                    $mail = New-Object System.Net.Mail.MailMessage
                    $mail.From = New-Object System.Net.Mail.MailAddress($smtpUser, "FORMA Architects")
                    $mail.To.Add($targetEmail)
                    $mail.Subject = "[$refId] Turnkey Specification Brief: $cName ($cArea Sq Ft, $cLoc)"
                    $mail.IsBodyHtml = $true

                    # Build email HTML with embedded CID Hero Image
                    $heroImgPath = Join-Path $root "image\clean_frames\frame_0119.jpg"
                    if (Test-Path $heroImgPath) {
                        $htmlWithCid = Build-LuxuryEmailHtml $entry "HeroVillaImage"
                        $altView = [System.Net.Mail.AlternateView]::CreateAlternateViewFromString($htmlWithCid, [System.Text.Encoding]::UTF8, "text/html")
                        $lr = New-Object System.Net.Mail.LinkedResource($heroImgPath, "image/jpeg")
                        $lr.ContentId = "HeroVillaImage"
                        $altView.LinkedResources.Add($lr)
                        $mail.AlternateViews.Add($altView)
                    } else {
                        $mail.Body = $emailHtmlForWeb
                    }

                    $smtp.Send($mail)
                    $emailDispatched = $true
                    Write-Host "[LUXURY EMAIL SENT] Dispatched HTML brief to $targetEmail via $smtpHost"
                } catch {
                    $emailNote = $_.Exception.Message
                    Write-Host "[SMTP ERROR] Could not dispatch email via SMTP: $emailNote"
                }
            } else {
                Write-Host "[SMTP NOTICE] Luxury HTML email generated in last_email_sent.html. Waiting for App Password in email_config.json."
            }

            $respObj = @{
                success         = $true
                ref             = $refId
                recipient       = $targetEmail
                emailDispatched = $emailDispatched
                emailNote       = $emailNote
                previewUrl      = "http://localhost:$Port/last_email_sent.html"
                message         = "Inquiry recorded and luxury email prepared for $targetEmail"
            }
            $respJson = $respObj | ConvertTo-Json
            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)

            $response.StatusCode = 200
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $respBytes.Length
            $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
            $response.Close()
            continue
        }

        # Static files
        $localPath = $rawUrl.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "index.html"
        }
        $localPath = [System.Uri]::UnescapeDataString($localPath).Replace('/', '\')
        $filePath = Join-Path $root $localPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.StatusCode = 200
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawUrl")
            $response.StatusCode = 404
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.Close()
    } catch {
        Write-Host "[SERVER EXCEPTION]: $_"
        if ($context -and $context.Response) {
            try { $context.Response.Close() } catch {}
        }
    }
}
