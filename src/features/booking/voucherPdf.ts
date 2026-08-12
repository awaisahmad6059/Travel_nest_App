import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { EncodingType, File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import type { Booking } from "@/types";
import { formatDate, formatPrice } from "@/utils/format";

/** Deterministic QR-ish glyph for the PDF (same seed idea as the on-screen QR). */
function qrGridHtml(token: string, size = 13): string {
  const seed = token
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 997, 7);
  const rand = (i: number) => (seed * (i + 5) + i * 17) % 10 < 5;
  const cells: string[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const finder =
        (row < 3 && col < 3) ||
        (row < 3 && col >= size - 3) ||
        (row >= size - 3 && col < 3);
      const filled = finder ? rand(row * size + col) : rand(row * size + col);
      cells.push(
        `<div style="background:${filled ? "#14181f" : "#ffffff"};aspect-ratio:1;"></div>`,
      );
    }
  }
  return cells.join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function voucherHtml(booking: Booking): string {
  const item = booking.items[0];
  const lead = booking.travelers[0];
  const confirmed = booking.status === "confirmed";
  const badge = confirmed
    ? "INSTANT VOUCHER CONFIRMED"
    : booking.status.toUpperCase();

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #ffffff; padding: 24px; }
  .panel { border: 1px solid #cbd5e1; border-radius: 16px; padding: 32px; background: #ffffff; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 22px; font-weight: 800; color: #0a54d9; }
  .brand small { font-size: 11px; color: #64748b; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; display: block; }
  .ok { width: 56px; height: 56px; border-radius: 50%; background: #d1fae5; color: #059669; font-size: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
  h1 { font-size: 30px; text-align: center; margin-bottom: 6px; }
  .sub { text-align: center; color: #475569; margin-bottom: 28px; font-size: 14px; }
  .ticket { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
  .ticket-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px; gap: 12px; }
  .badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }
  .option { font-size: 20px; font-weight: 700; }
  .lead { font-size: 13px; color: #64748b; margin-top: 4px; }
  .qr-wrap { text-align: center; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; }
  .qr-grid { display: grid; grid-template-columns: repeat(13, 1fr); width: 128px; height: 128px; margin: 0 auto; }
  .qr-code { display: block; font-size: 10px; font-weight: 800; color: #0a54d9; margin-top: 6px; letter-spacing: 0.05em; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px; }
  .grid .label { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  .grid .value { font-weight: 800; color: #0f172a; margin-top: 2px; }
  .grid .value.blue { color: #0a54d9; font-size: 15px; }
  .status { display: inline-block; background: #d1fae5; color: #047857; font-weight: 700; font-size: 12px; padding: 3px 10px; border-radius: 999px; }
  .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 16px; }
</style>
</head>
<body>
  <div class="panel">
    <div class="header">
      <div class="brand">TravelNest <small>Tours · Activities · Experiences</small></div>
      <div style="font-size:11px;color:#64748b;text-align:right;">E-ticket<br/>${escapeHtml(formatDate(booking.activityDate))}</div>
    </div>

    <div class="ok">&#10003;</div>
    <h1>Booking Confirmed!</h1>
    <p class="sub">Your electronic QR ticket voucher has been dispatched to <strong>${escapeHtml(lead?.email ?? "")}</strong>.</p>

    <div class="ticket">
      <div class="ticket-head">
        <div>
          <span class="badge">${badge}</span>
          <div class="option">${escapeHtml(item?.optionName ?? item?.title ?? "")}</div>
          <div class="lead">Lead Guest: <strong>${escapeHtml(lead?.name ?? "")}</strong> (${escapeHtml(lead?.phone ?? "")})</div>
        </div>
        <div class="qr-wrap">
          <div class="qr-grid">${qrGridHtml(booking.qrToken)}</div>
          <span class="qr-code">${escapeHtml(booking.voucherCode)}</span>
        </div>
      </div>

      <div class="grid">
        <div>
          <div class="label">Booking Reference</div>
          <div class="value blue">${escapeHtml(booking.bookingRef)}</div>
        </div>
        <div>
          <div class="label">Total Amount Paid</div>
          <div class="value">${escapeHtml(formatPrice(booking.total))}</div>
        </div>
        <div>
          <div class="label">Guests</div>
          <div class="value">${booking.travelers.length} Travelers</div>
        </div>
        <div>
          <div class="label">Status</div>
          <div><span class="status">${escapeHtml(booking.status.toUpperCase())}</span></div>
        </div>
        <div>
          <div class="label">Activity Date</div>
          <div class="value">${escapeHtml(formatDate(booking.activityDate))}</div>
        </div>
        <div>
          <div class="label">Experience</div>
          <div class="value" style="font-weight:600;font-size:12px;color:#475569;">${escapeHtml(item?.title ?? "")}</div>
        </div>
      </div>
    </div>

    <p style="text-align:center;font-size:12px;color:#475569;margin-top:4px;">
      Show this QR code to the supplier to check in. Voucher is also saved offline in My Bookings.
    </p>

    <div class="footer">Powered by TravelNest · © ${new Date().getFullYear()} TravelNest Tours</div>
  </div>
</body>
</html>`;
}

/**
 * Generates a printable PDF pass for a booking (mirrors the web voucher design)
 * and hands it to the platform share sheet so it can be saved/downloaded.
 */
export async function downloadBookingPdf(booking: Booking): Promise<void> {
  const html = voucherHtml(booking);

  if (Platform.OS === "web") {
    const { uri } = await Print.printToFileAsync({ html });
    const a = document.createElement("a");
    a.href = uri;
    a.download = `${booking.bookingRef}.pdf`;
    a.click();
    return;
  }

  // Android's file-permission service only exposes the app's cacheDir and
  // filesDir. Reading expo-print's cache output is rejected in Expo Go
  // ("Not allowed to read file under given URL"), so instead of copying that
  // file we ask print for the PDF as base64 and write it straight into the
  // document directory — a location expo-sharing is always allowed to read.
  const { base64 } = await Print.printToFileAsync({ html, base64: true });
  if (!base64) {
    throw new Error("Couldn't render the PDF on this device.");
  }
  const dest = new File(Paths.document, `${booking.bookingRef}.pdf`);
  if (dest.exists) dest.delete();
  dest.create();
  dest.write(base64, { encoding: EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest.uri, {
      mimeType: "application/pdf",
      dialogTitle: `Save ${booking.bookingRef} voucher`,
      UTI: "com.adobe.pdf",
    });
  }
}
