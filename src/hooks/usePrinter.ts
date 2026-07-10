import { useState, useCallback }         from 'react';
import { Alert, PermissionsAndroid, Platform }                         from 'react-native';
import { printerService, PrinterDevice, ReceiptData } from '../services/receipt/printer.service';
import { shareService }                  from '../services/receipt/share.service';

type PrinterStatus = 'idle' | 'connecting' | 'printing' | 'success' | 'error';

export function usePrinter() {
  const [status,          setStatus]          = useState<PrinterStatus>('idle');
  const [savedPrinter,    setSavedPrinter]    = useState<PrinterDevice | null>(null);
  const [showSelector,    setShowSelector]    = useState(false);
  const [pendingData,     setPendingData]     = useState<ReceiptData | null>(null);
  const [error,           setError]           = useState<string | null>(null);

  // Load saved printer dari AsyncStorage
  const loadSavedPrinter = useCallback(async () => {
    const device = await printerService.getSavedPrinter();
    setSavedPrinter(device);
    return device;
  }, []);

  // Print — cek saved printer dulu
  const print = useCallback(async (data: ReceiptData) => {
    setError(null);
    await ensureBluetoothPermission();
    const device = await printerService.getSavedPrinter();
    

    if (device) {
      // Sudah ada printer tersimpan → langsung print
      await executePrint(device, data);
    } else {
      // Belum ada → tampilkan selector
      setPendingData(data);
      setShowSelector(true);
    }
  }, []);

  // di usePrinter.print, sebelum panggil getSavedPrinter

async function ensureBluetoothPermission() {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version < 31) return true; // pre-Android 12

  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  ]);
  return (
    granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
    granted['android.permission.BLUETOOTH_SCAN'] === 'granted'
  );
}

  // Dipanggil setelah user pilih printer dari selector
  const onPrinterSelected = useCallback(async (device: PrinterDevice) => {
    setShowSelector(false);

    // Simpan pilihan untuk next time
    await printerService.savePrinter(device);
    setSavedPrinter(device);

    if (pendingData) {
      await executePrint(device, pendingData);
      setPendingData(null);
    }
  }, [pendingData]);

  // Core print function
  const executePrint = async (device: PrinterDevice, data: ReceiptData) => {
    setStatus('connecting');
    try {
      setStatus('printing');
      await printerService.printReceipt(device, data);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.message ?? 'Gagal print');

      // Tawarkan share PDF sebagai fallback
      Alert.alert(
        'Gagal Print',
        `${err.message ?? 'Koneksi printer gagal'}.\n\nIngin share struk sebagai PDF?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Share PDF',
            onPress: () => shareAsPdf(data),
          },
          {
            text: 'Ganti Printer',
            onPress: async () => {
              await printerService.clearSavedPrinter();
              setSavedPrinter(null);
              setPendingData(data);
              setShowSelector(true);
            },
          },
        ],
      );
    }
  };

  // Share PDF — bisa dipanggil langsung dari receipt screen
  const shareAsPdf = useCallback(async (data: ReceiptData) => {
    setStatus('printing');
    try {
      await shareService.shareReceiptAsPdf(data);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.message ?? 'Gagal share PDF');
      Alert.alert('Error', err.message ?? 'Gagal share PDF');
    }
  }, []);

  // Reset printer tersimpan — dipanggil dari settings atau kalau user mau ganti
  const changePrinter = useCallback(async (data: ReceiptData) => {
    await printerService.clearSavedPrinter();
    setSavedPrinter(null);
    setPendingData(data);
    setShowSelector(true);
  }, []);

  return {
    status,
    savedPrinter,
    showSelector,
    error,
    isPrinting: status === 'connecting' || status === 'printing',
    loadSavedPrinter,
    print,
    shareAsPdf,
    changePrinter,
    onPrinterSelected,
    closeSelector: () => setShowSelector(false),
  };
}