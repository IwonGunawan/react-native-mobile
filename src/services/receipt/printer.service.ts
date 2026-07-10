import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatRupiah } from "../../utils";

export interface PrinterDevice {
  device_name: string;
  inner_mac_address: string;
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

let BLEPrinter: any;
try {
  const ThermalPrinter = require('@conodene/react-native-thermal-receipt-printer-image-qr');
  BLEPrinter = ThermalPrinter.BLEPrinter;
} catch (error) {
  console.warn('ThermalPrinter lib not available', error);
}

const PRINTER_STORAGE_KEY = 'saved_printer';
const CHARS_PER_LINE = 32; // 58mm = 32 chars

/** ============ DEVICE MANAGEMENT ============*/

// liist device pairing
const getPairedDevices = async (): Promise<PrinterDevice[] | undefined> => {
  try {
    if (!BLEPrinter) throw new Error('Bluetooth printer module tidak tersedia');

    await BLEPrinter.init();
    const devices = await BLEPrinter.getDeviceList();
    return devices ?? [];
  } catch (error) {
    console.log('Failed pairing devices', error)
  }
};

// save device to AsyncStorage
const savePrinter = async (device: PrinterDevice): Promise<void> => {
  await AsyncStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(device));
}

// get device from AsynStorage
const getSavedPrinter = async (): Promise<PrinterDevice | null> => {
  try {
    const raw = await AsyncStorage.getItem(PRINTER_STORAGE_KEY);
    console.log('getSavedPrinter', raw);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.inner_mac_address) throw new Error('invalid');
    return parsed;
  } catch {
    await AsyncStorage.removeItem(PRINTER_STORAGE_KEY); // bersihkan data rusak
    return null;
  }
};

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
  console.log('buildReceiptText');
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
    formatLine('Nama:', `${data.prefix} ${data.customerName}`.slice(0, 18)),
    formatLine('Tgl Bayar:', dateStr),
    formatLine('Jam:', timeStr),
    formatLine('Jml Bulan:', `${data.monthTotal} bulan`),
    divider('-'),
    formatLine('Tagihan:', formatRupiah(data.total)),
  ];

  // Tampilkan baris simpan hanya kalau ada
  if (data.savedAmount > 0) {
    lines.push(formatLine('Disimpan:', formatRupiah(data.savedAmount)));
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
  try {
    if (!BLEPrinter) throw new Error('Bluetooth printer module tidak tersedia');

    await BLEPrinter.init();
    await BLEPrinter.connectPrinter(device.inner_mac_address);

    const text = buildReceiptText(data);
    await BLEPrinter.printBill(text);
  } catch (error) {
    console.log('Error printReceipt', error)
  }
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
