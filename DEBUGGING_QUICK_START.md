# 🔍 Flipper & React Native Debugging - Quick Start Guide

## Setup Sudah Selesai ✅

Kode debugging sudah terintegrasi di project:

- ✅ `src/utils/debug.ts` - Logging utilities
- ✅ `App.tsx` - Interceptor setup otomatis
- ✅ `src/services/api.ts` - Network logging
- ✅ `index.ts` - Gesture handler side-effect

---

## Mulai Development

```bash
# Terminal 1: Start Expo
npx expo start --clear

# Pilih emulator:
# a = Android emulator
# i = iOS simulator
# w = Web browser
```

---

## 🎯 Opsi Debugging (Pilih Salah Satu)

### Opsi 1: Flipper (Recommended)

```bash
# 1. Install Flipper Desktop (first time only)
brew install flipper

# 2. Buka Flipper (separate window)
open /Applications/Flipper.app

# 3. Expo running, buka di emulator → Flipper auto-detect
```

**Kelihat:**

- Console logs (warna-warna)
- Network calls (API requests/responses)
- App state
- Performance metrics

### Opsi 2: Chrome DevTools (Fastest)

```bash
# Saat Expo running, tekan 'j' di terminal
# Chrome DevTools otomatis buka
# Klik Console untuk melihat logs
```

**Kelihat:**

- Console logs
- Network XHR requests
- JavaScript errors
- React component tree

### Opsi 3: React Native Debugger

```bash
# Install (first time only)
brew install react-native-debugger

# Jalankan
open /Applications/React\ Native\ Debugger.app

# Saat Expo running, tekan 'j' di terminal
```

---

## 🐛 Debugging dalam Kode

### Log Info

```tsx
import { logger } from "./src/utils/debug";

logger.info("User logged in", { userId: 123 });
logger.error("API failed", { status: 404 });
logger.warn("Missing data", { field: "email" });
logger.debug("State changed", authState);
```

### Network Logs (Otomatis)

Semua API calls auto-logged di console dengan:

- HTTP method (GET, POST, etc)
- URL endpoint
- Response status
- Error messages

### Saat API Error

```bash
# Terminal akan menampilkan:
# [ERROR] API Error
# {
#   status: 401,
#   message: "Unauthorized",
#   url: "https://..."
# }
```

---

## 🚀 Common Debugging Scenarios

### 1. App Stuck di Loading

Check console untuk:

```bash
# Terminal output:
[ERROR] Unhandled Promise Rejection
[ERROR] API Error { status: 500, ... }
```

### 2. API Request Tidak Terkirim

Cek di Console / Network tab:

- Authorization header ada?
- URL benar?
- Request body format JSON?

### 3. State Tidak Update

Log state di component:

```tsx
const { user, isAuth } = useAuthStore();
console.log("Auth state:", { user, isAuth });
```

### 4. Navigation Error

React DevTools inspector → lihat navigator tree

---

## ⚡ Hot Tips

### Cepat View Logs

```bash
# Terminal Expo: tekan 'j' untuk Chrome DevTools
# Atau: Tab Console di Flipper
```

### Performance Check

- Flipper → Performance tab
- Lihat frame rate, memory usage

### Clear State

```tsx
// Di console development:
useAuthStore.getState().logout();

// Or clear AsyncStorage:
import AsyncStorage from "@react-native-async-storage/async-storage";
AsyncStorage.clear();
```

### Filter Console Logs

```bash
# Chrome DevTools Console:
# Ketik di console untuk filter
# logger.info() messages only
```

---

## 📊 Monitoring Checklist

Saat development, pastikan:

- ✅ Console tidak ada red errors
- ✅ Network calls semua status 200/201
- ✅ Auth token sent di Authorization header
- ✅ App state (user, isAuth) update correctly
- ✅ Navigation switches between login & home

---

## 🔧 Troubleshooting

| Problem                     | Solution                                       |
| --------------------------- | ---------------------------------------------- |
| App tidak muncul di Flipper | Restart Flipper + emulator                     |
| Logs tidak muncul           | Pastikan `__DEV__` true (check App.tsx)        |
| Network XHR tidak show      | Check Flipper Network plugin active            |
| Chrome DevTools blank       | Tekan 'j' lagi atau reload app                 |
| AsyncStorage error          | Clear app data: `adb shell pm clear <package>` |

---

## 🎓 Next Steps

1. **Run app**: `npx expo start --clear`
2. **Buka Flipper**: `open /Applications/Flipper.app`
3. **Emulator**: Tekan 'a' (Android) atau 'i' (iOS)
4. **Check logs**: Flipper Console tab atau 'j' untuk Chrome
5. **Debug**: Lihat API calls, state, errors dalam real-time

**Happy debugging! 🚀**
