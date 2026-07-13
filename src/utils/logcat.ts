/**
 * Logger dengan output yang muncul di logcat (tag: ReactNativeJS).
 *
 * Expo CLI otomatis meneruskan `console.*` ke native logcat lewat
 * ReactNative bridge (tag `ReactNativeJS`). Setiap baris log kita juga
 * di-persist ke AsyncStorage dengan key "crash_log_buffer" agar jejak
 * error dari sesi sebelumnya (termasuk force close) dapat dibaca saat
 * aplikasi di-boot ulang.
 *
 * Filter logcat yang berguna:
 *   adb logcat -s ReactNativeJS:V            # semua log JS
 *   adb logcat *:E ReactNativeJS:V           # error native + JS
 *   adb logcat -d -b crash                   # native crash dump
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_BUFFER_KEY = 'crash_log_buffer';
const LOG_BUFFER_LIMIT = 200;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LEVEL_TAG: Record<LogLevel, string> = {
  info: 'I',
  warn: 'W',
  error: 'E',
  debug: 'D',
};

function safeStringify(value: unknown): string {
  if (value === undefined) return '';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (value instanceof Error) {
    return `${value.name}: ${value.message}\n${value.stack ?? '(no stack)'}`;
  }
  try {
    return JSON.stringify(
      value,
      (_k, v) => {
        if (v instanceof Error) {
          return { name: v.name, message: v.message, stack: v.stack };
        }
        return v;
      },
      2,
    );
  } catch {
    return String(value);
  }
}

async function appendToBuffer(level: LogLevel, msg: string, data?: unknown) {
  if (level === 'debug' && !__DEV__) return;
  try {
    const raw = await AsyncStorage.getItem(LOG_BUFFER_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const entry = {
      ts: new Date().toISOString(),
      level,
      msg,
      data: data === undefined ? undefined : safeStringify(data),
    };
    list.push(JSON.stringify(entry));
    while (list.length > LOG_BUFFER_LIMIT) list.shift();
    await AsyncStorage.setItem(LOG_BUFFER_KEY, JSON.stringify(list));
  } catch {
    // Buffer write failures should never crash the app.
  }
}

function write(level: LogLevel, msg: string, data?: unknown) {
  const tag = LEVEL_TAG[level];
  // Force everything through console.* so Expo CLI forwards it to logcat
  // under tag `ReactNativeJS`. A `[LEVEL]` prefix lets us filter in adb.
  const line = `[${tag}] ${msg}`;
  if (level === 'error') {
    if (data !== undefined) console.error(line, data);
    else console.error(line);
  } else if (level === 'warn') {
    if (data !== undefined) console.warn(line, data);
    else console.warn(line);
  } else {
    if (data !== undefined) console.log(line, data);
    else console.log(line);
  }
  // Fire-and-forget persistence; awaited internally so we don't block UI.
  void appendToBuffer(level, msg, data);
}

export const logger = {
  info: (msg: string, data?: unknown) => write('info', msg, data),
  warn: (msg: string, data?: unknown) => write('warn', msg, data),
  error: (msg: string, data?: unknown) => write('error', msg, data),
  debug: (msg: string, data?: unknown) => write('debug', msg, data),

  /**
   * Baca buffer crash dari sesi sebelumnya. Berguna setelah force close:
   * panggil di awal boot dan tampilkan ke user / dump ke logcat.
   */
  async readCrashBuffer(): Promise<
    Array<{ ts: string; level: LogLevel; msg: string; data?: string }>
  > {
    try {
      const raw = await AsyncStorage.getItem(LOG_BUFFER_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async clearCrashBuffer() {
    try {
      await AsyncStorage.removeItem(LOG_BUFFER_KEY);
    } catch {
      // ignore
    }
  },

  /**
   * Dump seluruh buffer ke console (dan logcat). Pakai ini untuk debugging
   * setelah force close: panggil sekali di awal boot untuk melihat jejak
   * error dari sesi sebelumnya.
   */
  async dumpCrashBuffer() {
    const entries = await logger.readCrashBuffer();
    console.log(`[CRASH-DUMP] ${entries.length} buffered entries`);
    for (const e of entries) {
      if(e.ts == undefined) continue;
      console.log(
        `[CRASH-DUMP] ${e.ts} [${LEVEL_TAG[e.level]}] ${e.msg}`,
        e.data,
      );
    }
  },
};
