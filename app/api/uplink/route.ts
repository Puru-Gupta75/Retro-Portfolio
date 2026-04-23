import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// --- Rate limiting ---
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

// --- HTML sanitization ---
function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(req: Request) {
  // Resolve IP from headers (works behind proxies / Vercel)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    );
  }

  const { source, node, type, packet } = await req.json();

  if (!source || !packet) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Sanitize all user-supplied values before injecting into HTML
  const safeSource = escapeHtml(source);
  const safeNode   = escapeHtml(node ?? '');
  const safeType   = escapeHtml(type ?? '');
  const safePacket = escapeHtml(packet);

  const packetId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  await resend.emails.send({
    from: 'UPLINK <onboarding@resend.dev>',
    to: process.env.CONTACT_EMAIL ?? 'purugupta557@gmail.com',
    reply_to: node,
    subject: `[UPLINK] ${safeType} :: ${safeSource} :: ${packetId}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0D0D0D;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- SCANLINE HEADER BAR -->
        <tr>
          <td style="background:#FFB000;padding:3px 20px;">
            <span style="font-family:monospace;font-size:9px;color:#0D0D0D;letter-spacing:0.4em;text-transform:uppercase;">
              ▓▓ SECURE_UPLINK_CHANNEL // AES-256 // PACKET_VERIFIED ▓▓
            </span>
          </td>
        </tr>

        <!-- MAIN PANEL -->
        <tr>
          <td style="background:#111111;border:1px solid rgba(255,176,0,0.25);border-top:none;padding:32px;">

            <!-- TITLE -->
            <div style="margin-bottom:24px;">
              <div style="font-family:monospace;font-size:10px;color:rgba(255,176,0,0.4);letter-spacing:0.35em;text-transform:uppercase;margin-bottom:8px;">
                &gt; TRANSMISSION_PACKET_RECEIVED
              </div>
              <div style="font-family:monospace;font-size:28px;font-weight:700;color:#FFB000;letter-spacing:-0.02em;text-transform:uppercase;">
                UPLINK
              </div>
            </div>

            <!-- DIVIDER -->
            <div style="border-top:1px solid rgba(255,176,0,0.15);margin-bottom:24px;"></div>

            <!-- METADATA GRID -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:6px 0;width:40%;">
                  <span style="font-family:monospace;font-size:9px;color:rgba(255,176,0,0.4);letter-spacing:0.25em;text-transform:uppercase;">PACKET_ID</span>
                </td>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:11px;color:#FFB000;">${packetId}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:9px;color:rgba(255,176,0,0.4);letter-spacing:0.25em;text-transform:uppercase;">TIMESTAMP</span>
                </td>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:11px;color:#FFB000;">${timestamp} UTC</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:9px;color:rgba(255,176,0,0.4);letter-spacing:0.25em;text-transform:uppercase;">SOURCE_ID</span>
                </td>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:11px;color:#FFB000;">${safeSource}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:9px;color:rgba(255,176,0,0.4);letter-spacing:0.25em;text-transform:uppercase;">REPLY_NODE</span>
                </td>
                <td style="padding:6px 0;">
                  <a href="mailto:${safeNode}" style="font-family:monospace;font-size:11px;color:#FFB000;text-decoration:none;">${safeNode}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:9px;color:rgba(255,176,0,0.4);letter-spacing:0.25em;text-transform:uppercase;">PACKET_TYPE</span>
                </td>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:11px;background:rgba(255,176,0,0.12);color:#FFB000;padding:2px 10px;border:1px solid rgba(255,176,0,0.3);">${safeType}</span>
                </td>
              </tr>
            </table>

            <!-- DIVIDER -->
            <div style="border-top:1px solid rgba(255,176,0,0.15);margin-bottom:24px;"></div>

            <!-- MESSAGE BLOCK -->
            <div style="margin-bottom:8px;">
              <span style="font-family:monospace;font-size:9px;color:rgba(255,176,0,0.4);letter-spacing:0.25em;text-transform:uppercase;">&gt; PACKET_RAW_DATA</span>
            </div>
            <div style="background:#0D0D0D;border:1px solid rgba(255,176,0,0.15);padding:20px;font-family:monospace;font-size:13px;color:rgba(255,176,0,0.85);line-height:1.7;white-space:pre-wrap;word-break:break-word;">
${safePacket}
            </div>

            <!-- DIVIDER -->
            <div style="border-top:1px solid rgba(255,176,0,0.1);margin-top:32px;margin-bottom:20px;"></div>

            <!-- FOOTER META -->
            <div style="font-family:monospace;font-size:8px;color:rgba(255,176,0,0.2);letter-spacing:0.3em;text-transform:uppercase;text-align:center;">
              _ _ _ SECURE_LINE_NOMINAL // ENCRYPTION_ACTIVE // 2048_BIT_KEY _ _ _
            </div>

          </td>
        </tr>

        <!-- BOTTOM BAR -->
        <tr>
          <td style="background:rgba(255,176,0,0.06);border:1px solid rgba(255,176,0,0.1);border-top:none;padding:10px 20px;text-align:center;">
            <span style="font-family:monospace;font-size:8px;color:rgba(255,176,0,0.25);letter-spacing:0.25em;text-transform:uppercase;">
              [OK] TRANSMISSION_COMMITTED // STATUS: DELIVERED
            </span>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });

  return NextResponse.json({ success: true });
}
