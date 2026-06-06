# Setup Flipper untuk React Native Debugging

## Opsi 1: Flipper Desktop (Recommended)

### Step 1: Install Flipper Desktop

```bash
# macOS
brew install flipper

# atau download manual dari https://fbflipper.com
```

### Step 2: Konfigurasi untuk Expo

Flipper sudah support React Native apps secara native. Untuk Expo:

1. Buka Flipper Desktop
2. Jalankan Expo: `npx expo start`
3. Buka app di emulator/device
4. Device akan muncul otomatis di Flipper (tab kiri)

### Step 3: Gunakan Built-in Plugins

Flipper sudah include plugins:

- **Logs** - console logs dari app
- **Network** - monitor API calls
- **React DevTools** - component inspector
- **Database** - if using SQLite

---

## Opsi 2: React Native Debugger (Alternative)

Jika Flipper tidak work, gunakan React Native Debugger:

```bash
brew install react-native-debugger

# atau https://github.com/jhen0409/react-native-debugger
```

Jalankan:

```bash
# Terminal 1
npx expo start

# Terminal 2
open "rnd://localhost:8081"
```

---

## Opsi 3: Expo DevTools (Built-in)

Sudah tersedia di Expo tanpa install apapun:

```bash
npx expo start

# Tekan:
# - 'w' untuk web debugger
# - 'j' untuk Hermes debugger (Android)
# - 'i' untuk simulator iOS
```

---

## Troubleshooting

### App tidak muncul di Flipper

1. Pastikan app dalam development mode: `npx expo start --dev-client`
2. Restart Flipper + app
3. Check firewall - pastikan port 8081 terbuka

### Network calls tidak terlihat

- Gunakan Axios interceptor untuk log requests
- Atau gunakan Network tab di Chrome DevTools

### Performance profiling

- Gunakan Expo's built-in performance monitor
- Press 'p' saat app running untuk performance overlay

---

## Setup Code untuk Debugging

Edit `App.tsx`:

```tsx
import { useEffect } from 'react';
import { LogBox } from 'react-native';

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      // Disable warnings di development
      LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
    }
  }, []);

  return (
    // ... app content
  );
}
```

---

## Quick Tips

### 1. Monitor Network Requests

```bash
# Gunakan Axios interceptor
import axios from 'axios';

axios.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### 2. Log Redux State (jika pakai Zustand)

```tsx
import { useAuthStore } from "./stores/auth.store";

// Di component manapun
const state = useAuthStore();
console.log("Auth State:", state);
```

### 3. Enable Remote Debugging

```bash
# Buka Chrome DevTools untuk advanced debugging
# Klik react-native debugger window > Tools > Show React DevTools
```

---

## Recommended Flow

1. **Development**: `npx expo start` + Chrome DevTools
2. **Network Debugging**: Flipper + Network plugin
3. **Component Debugging**: React DevTools tab di Flipper
4. **Performance**: Use Expo Profiler
5. **Production Issues**: Check Sentry/error tracking
