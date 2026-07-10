# Logcat Setup (Expo SDK 56 / RN 0.85)

Logcat sekarang tertangkap otomatis oleh logger aplikasi — baik error JS,
unhandled promise rejection, maupun jejak error dari sesi sebelumnya
(setelah force close). Setup ini **tanpa native module tambahan** sehingga
aman untuk New Architecture dan bridgeless mode.

## Arsitektur singkat

```
┌──────────────────────────────────────────────────────────┐
│ JS layer (Hermes)                                       │
│   logger.error/warn/info/debug  ─►  console.*           │
│         │                                 │              │
│         │                                 ▼              │
│         │                    Expo CLI forward ke logcat  │
│         │                            tag: ReactNativeJS │
│         ▼                                               │
│   AsyncStorage("crash_log_buffer")                      │
│   — survives force close —                              │
│         │                                               │
│         ▼  di-boot berikutnya                           │
│   logger.dumpCrashBuffer()  ─►  console.log             │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Native layer (Android)                                  │
│   Force close / native crash  ─►  logcat tag AndroidRuntime (FATAL) │
│                                ─►  logcat -b crash buffer        │
└──────────────────────────────────────────────────────────┘
```

## Yang sudah terpasang

- `src/utils/logcat.ts` — logger dengan persistent crash buffer (AsyncStorage)
- `src/utils/debug.ts` — `ErrorUtils.setGlobalHandler`, `unhandledrejection`,
  `uncaughtException`, dan axios interceptors
- `src/components/shared/ErrorBoundary.tsx` — menangkap render error dan
  menulis stack + component stack ke logcat + buffer
- `App.tsx` — install handler di boot, dump buffer sesi sebelumnya ke logcat

## Cara pakai saat debugging

Jalankan salah satu (perlu device/emulator terhubung ke `adb`):

| Command                        | Untuk apa                                 |
| ------------------------------ | ----------------------------------------- |
| `npm run logcat:all`           | Semua log dengan warna                    |
| `npm run logcat:js`            | Hanya log JS (ReactNativeJS + ReactNative)|
| `npm run logcat:errors`        | Semua error native + JS                   |
| `npm run logcat:fatal`         | Hanya fatal / error JS                    |
| `npm run logcat:crash`         | Dump system crash buffer (force close)    |

Atau langsung:
```bash
adb logcat -s ReactNativeJS:V *:E
adb logcat -d -b crash | tail -200
```

## Filter cepat yang berguna

```bash
# hanya error JS + native error
adb logcat *:E ReactNativeJS:V

# filter berdasarkan kata kunci
adb logcat -s ReactNativeJS:V | grep -i "ERROR"

# follow satu proses saja (ganti PID dengan yang muncul dari `adb shell pidof com.cikaret.setra.pay`)
adb logcat --pid=$(adb shell pidof com.cikaret.setra.pay)

# clear buffer sebelum reproduce
adb logcat -c
```

## Crash yang survive dari sesi sebelumnya

Setiap `logger.*` call menulis ke `AsyncStorage["crash_log_buffer"]`
(max 200 entry). Saat aplikasi di-boot ulang, `App.tsx` akan dump isi
buffer ke console — sehingga jejak error dari sesi yang force close akan
muncul di logcat tepat setelah app start.

Untuk dump manual kapan saja (mis. dari DevMenu atau komponen mana saja):
```ts
import { logger } from "./src/utils/logcat";
await logger.dumpCrashBuffer();
```

## Menulis log dari kode aplikasi

```ts
import { logger } from "./src/utils/debug"; // atau "./logcat"

logger.info("User tapped login", { userId: 42 });
logger.warn("Slow network", { ms: 4500 });
logger.error("Order failed", err); // err otomatis di-stringify + stack
logger.debug("State", state);      // hanya muncul di __DEV__
```

## Force close (native crash) — catatan

Force close **tidak bisa dicegat dari JS**, karena JVM-nya sudah mati
sebelum JS sempat jalan. Yang bisa kita lakukan:

1. Lihat log native: `adb logcat -d -b crash` (otomatis berisi Java
   stacktrace + native backtrace untuk SIGSEGV/SIGABRT).
2. Filter `AndroidRuntime` untuk lihat `FATAL EXCEPTION`:
   ```bash
   adb logcat -s AndroidRuntime:E
   ```
3. Hubungkan error native ke alur JS dengan mereproduksi setelah
   `adb logcat -c` dan menjalankan ulang — buffer JS akan otomatis
   tertulis dengan timestamp yang sejajar dengan crash native.

## Verifikasi cepat

Setelah install, jalankan:
```bash
npm run logcat:js
```
Lalu dari aplikasi panggil (mis. tombol test):
```ts
logger.error("TEST", { hello: "logcat" });
```
Seharusnya muncul di terminal:
```
ReactNativeJS [E] TEST { hello: 'logcat' }
```
