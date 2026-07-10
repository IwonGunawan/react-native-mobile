import * as Print   from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ReceiptData } from './printer.service';
import { formatRupiah } from '../../utils';

// Render struk sebagai HTML → convert ke PDF → share
const shareReceiptAsPdf = async (data: ReceiptData): Promise<void> => {
  const paidDate = new Date(data.paidDate);
  const dateStr  = paidDate.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const timeStr  = paidDate.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 58mm;
          padding: 4mm;
        }
        .center { text-align: center; }
        .bold   { font-weight: bold; }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .footer { text-align: center; margin-top: 8px; }
        .title  { font-size: 14px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="center title">STRUK PEMBAYARAN AIR</div>
      <div class="center">CIKARET SETRA</div>
      <div class="divider"></div>

      <div class="row">
        <span>No.Ref</span>
        <span>${data.refNumber.slice(0, 8).toUpperCase()}</span>
      </div>
      <div class="row">
        <span>Pelanggan</span>
        <span>${data.prefix} ${data.customerName}</span>
      </div>
      <div class="row">
        <span>Tgl Bayar</span>
        <span>${dateStr}</span>
      </div>
      <div class="row">
        <span>Jam</span>
        <span>${timeStr}</span>
      </div>
      <div class="row">
        <span>Jml Bulan</span>
        <span>${data.monthTotal} bulan</span>
      </div>

      <div class="divider"></div>

      <div class="row">
        <span>Tagihan</span>
        <span>${formatRupiah(data.total)}</span>
      </div>
      <div class="row">
        <span>Tunai</span>
        <span>${formatRupiah(data.cash)}</span>
      </div>
      <div class="row bold">
        <span>Kembalian</span>
        <span>${formatRupiah(data.change)}</span>
      </div>

      ${data.savedAmount > 0 ? `
        <div class="row">
          <span>Disimpan</span>
          <span>${formatRupiah(data.savedAmount)}</span>
        </div>
      ` : ''}

      <div class="divider"></div>
      <div class="footer">${data.textInfo}</div>
      <div class="footer">Terima kasih</div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html, width: 164 }); // 58mm ≈ 164px

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing tidak tersedia di perangkat ini');

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Bagikan Struk',
    UTI: 'com.adobe.pdf',
  });
};

export const shareService = { shareReceiptAsPdf };