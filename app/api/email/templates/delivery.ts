type DeliveryEmailParams = {
  senderName: string
  recipientName: string
  previewText: string
  messageType: 'text' | 'video' | 'audio'
  receiveUrl: string
}

export function buildDeliveryEmail({
  senderName,
  recipientName,
  previewText,
  messageType,
  receiveUrl,
}: DeliveryEmailParams): string {
  const typeLabel =
    messageType === 'video'
      ? 'A video message awaits you'
      : messageType === 'audio'
        ? 'A voice message awaits you'
        : previewText

  const typeIcon =
    messageType === 'video' ? '&#127909;' : messageType === 'audio' ? '&#127897;' : '&#9993;'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You have a message</title>
</head>
<body style="margin:0;padding:0;background:#1F2E23;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Logo / Wordmark -->
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:300;color:#F5F3EF;margin:0;letter-spacing:0.02em;">Legacy Vault</h1>
      <div style="width:40px;height:1px;background:#B89B5E;margin:12px auto 0;"></div>
    </div>

    <!-- Main Card -->
    <div style="background:rgba(245,243,239,0.04);border:1px solid rgba(184,155,94,0.15);border-radius:16px;padding:48px 36px;text-align:center;margin-bottom:32px;">

      <!-- Icon -->
      <div style="font-size:48px;margin-bottom:24px;">${typeIcon}</div>

      <!-- Greeting -->
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(184,155,94,0.6);margin-bottom:16px;">
        A message left for you
      </div>

      <!-- Main Heading -->
      <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:300;color:#F5F3EF;margin:0 0 20px;line-height:1.3;">
        You have a message from ${senderName}
      </h2>

      <!-- Preview Text -->
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:rgba(245,243,239,0.45);line-height:1.7;margin:0 0 32px;max-width:440px;margin-left:auto;margin-right:auto;">
        &ldquo;${typeLabel}&rdquo;
      </div>

      <!-- CTA Button -->
      <a href="${receiveUrl}" style="display:inline-block;padding:16px 44px;background:#B89B5E;color:#1F2E23;text-decoration:none;border-radius:4px;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">
        Open Your Message
      </a>
    </div>

    <!-- Security Note -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:12px;color:rgba(245,243,239,0.25);line-height:1.6;">
        This message was preserved using Legacy Vault and delivered to you, ${recipientName}, at the sender's request.
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(184,155,94,0.08);">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(184,155,94,0.3);margin-bottom:16px;">
        Preserved with Legacy Vault
      </div>
      <div style="font-size:11px;color:rgba(245,243,239,0.15);line-height:1.8;">
        &copy; ${new Date().getFullYear()} Legacy Vault &middot; joinlegacyvault.com<br>
        <a href="https://joinlegacyvault.com/terms" style="color:rgba(245,243,239,0.15);text-decoration:underline;">Terms</a>
        &nbsp;&middot;&nbsp;
        <a href="https://joinlegacyvault.com/about" style="color:rgba(245,243,239,0.15);text-decoration:underline;">About</a>
      </div>
    </div>

  </div>
</body>
</html>`
}
