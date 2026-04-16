import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY!

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Legacy Vault <hello@joinlegacyvault.com>',
      to,
      subject,
      html,
    }),
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const { type, to, name, tier } = await req.json()

    if (type === 'waitlist_confirmation') {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#F5F3EF;font-family:'DM Sans',sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:300;color:#1F2E23;margin:0;">Legacy Vault</h1>
            </div>
            <div style="background:#1F2E23;border-radius:10px;padding:40px;text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;margin-bottom:16px;">🔒</div>
              <h2 style="font-family:'Georgia',serif;font-size:28px;font-weight:300;color:#F5F3EF;margin:0 0 12px;">Your vault is locked in.</h2>
              <p style="color:rgba(245,243,239,0.6);font-size:15px;line-height:1.8;margin:0 0 20px;">
                ${name ? `Hi ${name},` : 'Hi there,'} you've secured your <strong style="color:#B89B5E;">${tier || 'founders'}</strong> spot at Legacy Vault — grandfathered pricing, forever.
              </p>
              <p style="color:rgba(245,243,239,0.5);font-size:13px;line-height:1.8;margin:0;">
                We launch on <strong style="color:#B89B5E;">May 15, 2026</strong>. We'll email and text you the moment the doors open.
              </p>
            </div>
            <div style="background:#fff;border-radius:10px;padding:32px;margin-bottom:24px;">
              <h3 style="font-family:'Georgia',serif;font-size:20px;font-weight:400;color:#1F2E23;margin:0 0 16px;">What happens next?</h3>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;gap:12px;align-items:flex-start;">
                  <div style="width:24px;height:24px;background:rgba(184,155,94,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#B89B5E;font-size:12px;flex-shrink:0;">1</div>
                  <p style="margin:0;font-size:14px;color:rgba(31,46,35,0.65);line-height:1.6;">Your founders pricing is locked in — no credit card required now.</p>
                </div>
                <div style="display:flex;gap:12px;align-items:flex-start;">
                  <div style="width:24px;height:24px;background:rgba(184,155,94,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#B89B5E;font-size:12px;flex-shrink:0;">2</div>
                  <p style="margin:0;font-size:14px;color:rgba(31,46,35,0.65);line-height:1.6;">On May 15, 2026, you'll receive an email and SMS with your access link.</p>
                </div>
                <div style="display:flex;gap:12px;align-items:flex-start;">
                  <div style="width:24px;height:24px;background:rgba(184,155,94,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#B89B5E;font-size:12px;flex-shrink:0;">3</div>
                  <p style="margin:0;font-size:14px;color:rgba(31,46,35,0.65);line-height:1.6;">Create your vault, record your first message, and leave your legacy.</p>
                </div>
              </div>
            </div>
            <div style="text-align:center;padding:20px;">
              <a href="https://joinlegacyvault.com" style="display:inline-block;padding:14px 36px;background:#B89B5E;color:#1F2E23;text-decoration:none;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">Visit Legacy Vault</a>
            </div>
            <p style="text-align:center;font-size:12px;color:rgba(31,46,35,0.35);margin-top:24px;">
              © 2026 Legacy Vault · joinlegacyvault.com<br/>
              <a href="https://joinlegacyvault.com/privacy" style="color:rgba(31,46,35,0.35);">Privacy Policy</a> · <a href="https://joinlegacyvault.com/terms" style="color:rgba(31,46,35,0.35);">Terms of Service</a>
            </p>
          </div>
        </body>
        </html>
      `
      const result = await sendEmail(to, '🔒 Your Legacy Vault spot is locked in', html)
      return NextResponse.json(result)
    }

    if (type === 'launch_notification') {
      const html = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#F5F3EF;font-family:'DM Sans',sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="background:#1F2E23;border-radius:10px;padding:40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">🔒</div>
              <h2 style="font-family:'Georgia',serif;font-size:32px;font-weight:300;color:#F5F3EF;margin:0 0 16px;">Legacy Vault is live.</h2>
              <p style="color:rgba(245,243,239,0.6);font-size:16px;line-height:1.8;margin:0 0 28px;">
                ${name ? `${name}, your` : 'Your'} vault is ready. Your founders pricing is locked in. It's time to leave your legacy.
              </p>
              <a href="https://joinlegacyvault.com/sign-up" style="display:inline-block;padding:16px 44px;background:#B89B5E;color:#1F2E23;text-decoration:none;border-radius:4px;font-size:13px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;">Open my vault →</a>
            </div>
          </div>
        </body>
        </html>
      `
      const result = await sendEmail(to, '🔒 Legacy Vault is live — your vault is ready', html)
      return NextResponse.json(result)
    }

    if (type === 'warning') {
      const daysRemaining = req.nextUrl.searchParams.get('days') || '7'
      const html = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#F5F3EF;font-family:'DM Sans',sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="background:#1F2E23;border-radius:10px;padding:40px;text-align:center;">
              <h2 style="font-family:'Georgia',serif;font-size:28px;font-weight:300;color:#F5F3EF;margin:0 0 16px;">Your vault check-in reminder</h2>
              <p style="color:rgba(245,243,239,0.6);font-size:15px;line-height:1.8;margin:0 0 20px;">
                ${name ? `Hi ${name},` : 'Hi,'} your vault is set to deliver in <strong style="color:#B89B5E;">${daysRemaining} days</strong> if you don't check in.
              </p>
              <p style="color:rgba(245,243,239,0.5);font-size:13px;margin:0 0 28px;">If everything is fine, just click below to reset your timer.</p>
              <a href="https://joinlegacyvault.com/dashboard" style="display:inline-block;padding:14px 36px;background:#B89B5E;color:#1F2E23;text-decoration:none;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">I'm here — reset timer</a>
            </div>
          </div>
        </body>
        </html>
      `
      const result = await sendEmail(to, `⚠️ Your Legacy Vault delivers in ${daysRemaining} days`, html)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
