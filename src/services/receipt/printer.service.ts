import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatRupiah } from "../../utils";

export interface PrinterDevice {
  deviceName: string;
  innerMacAddress: string;
}

export interface ReceiptData {
  refNumber: string;
  paidDate: string;
  prefix: string;
  customerName: string;
  monthTotal: number;
  total: number;
  textInfo: string;

  // review
  cash: number;
  change: number;
  savedAmount: number;
}

let ThermalPrinter:any;
try {
  ThermalPrinter = require('@conodene/react-native-thermal-receipt-printer-image-qr');
} catch (error) {
  console.warn('ThermalPrinter lib not available', error);
}

const PRINTER_STORAGE_KEY = 'saved_printer';
const CHARS_PER_LINE = 32; // 58mm = 32 chars

/** ============ DEVICE MANAGEMENT ============*/

// liist device pairing
const getPairedDevices = async (): Promise<PrinterDevice[]> => {
  if (!ThermalPrinter) throw new Error('Printer module tidak tersedia');
  const devices = await ThermalPrinter.default.getDeviceList();
  return devices ?? [];
};

// save device to AsyncStorage
const savePrinter = async (device: PrinterDevice): Promise<void> => {
  await AsyncStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(device));
}

// get device from AsynStorage
const getSavedPrinter = async(): Promise<PrinterDevice | null> => {
  const raw = await AsyncStorage.getItem(PRINTER_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// clear saved devices
const clearSavedPrinter = async(): Promise<void> => {
  await AsyncStorage.removeItem(PRINTER_STORAGE_KEY);
}

/** ============ FORMAT HELPER ============*/

// Isi spasi supaya teks kiri + kanan pas 32 char
const formatLine = (left: string, right: string): string => {
  const spaces = CHARS_PER_LINE - left.length - right.length;
  return left + ' '.repeat(Math.max(1, spaces)) + right;
};

// Tengahkan teks
const centerText = (text: string): string => {
  const spaces = Math.floor((CHARS_PER_LINE - text.length) / 2);
  return ' '.repeat(Math.max(0, spaces)) + text;
};

// Garis pemisah
const divider = (char = '-'): string => char.repeat(CHARS_PER_LINE);


/** ============ BUILD RECEIPT TEXT ============*/
const buildReceiptText = (data: ReceiptData): string => {
  const paidDate = new Date(data.paidDate);
  const dateStr  = paidDate.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const timeStr  = paidDate.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  });

  const lines: string[] = [
    centerText('STRUK PEMBAYARAN AIR'),
    centerText('CIKARET SETRA'),
    divider('='),
    formatLine('No.Ref:', data.refNumber.slice(0, 8).toUpperCase()),
    formatLine('Pelanggan:', `${data.prefix} ${data.customerName}`.slice(0, 18)),
    formatLine('Tgl Bayar:', dateStr),
    formatLine('Jam:', timeStr),
    formatLine('Jml Bulan:', `${data.monthTotal} bulan`),
    divider('-'),
    formatLine('Tagihan:', formatRupiah(data.total)),
    formatLine('Tunai:', formatRupiah(data.cash)),
    formatLine('Kembalian:', formatRupiah(data.change)),
  ];

  // Tampilkan baris simpan hanya kalau ada
  if (data.savedAmount > 0) {
    lines.push(formatLine('Disimpan:', formatRupiah(data.savedAmount)));
    lines.push(formatLine('Cash back:', formatRupiah(data.change - data.savedAmount)));
  }

  lines.push(
    divider('='),
    centerText(data.textInfo),
    '',
    centerText('Terima kasih'),
    '',
    '', // extra feed supaya kertas keluar cukup
  );

  return lines.join('\n');
};


/** ============ PRINT ============*/
const printReceipt = async (
  device: PrinterDevice,
  data: ReceiptData,
): Promise<void> => {
  if (!ThermalPrinter) throw new Error('Printer module tidak tersedia');

  await ThermalPrinter.default.connectPrinter(device.innerMacAddress);

  const text = buildReceiptText(data);

  await ThermalPrinter.default.printBill(text);
};

export const printerService = {
  getPairedDevices,
  savePrinter,
  getSavedPrinter,
  clearSavedPrinter,
  buildReceiptText,
  printReceipt,
  CHARS_PER_LINE,
};