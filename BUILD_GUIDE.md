# Panduan Build Project React Native - Cikaret Setra Pay

Project ini menggunakan **Expo 56.0.14** dan **React Native 0.85.3**. Berikut adalah panduan lengkap untuk build project ini.

---

## 📋 Prasyarat (Prerequisites)

Sebelum memulai, pastikan sudah install:

### 1. **Node.js & npm**

```bash
node --version  # Minimal v18 atau lebih baru
npm --version   # Minimal v9 atau lebih baru
```

### 2. **Java Development Kit (JDK)**

```bash
java -version   # Minimal JDK 11 atau lebih baru
```

### 3. **Android SDK** (untuk build Android)

- Install Android Studio dari https://developer.android.com/studio
- Atau setup manual: https://docs.expo.dev/bare-workflow/using-gradle/

### 4. **Xcode** (untuk build iOS - macOS only)

```bash
xcode-select --install
```

### 5. **Expo CLI** (optional, bisa menggunakan npx)

```bash
npm install -g expo-cli
```

---

## 🚀 Step 1: Setup Awal

### 1.1 Install Dependencies

```bash
cd path/workspace/project
npm install
```

### 1.2 Verify TypeScript Setup

```bash
npm run type:checking
```

Perintah ini akan mengecek apakah ada error TypeScript.

---

## 🔧 Step 2: Development & Testing

### 2.1 Jalankan Development Server

```bash
npm start
```

Ini akan membuka menu Expo Go dengan opsi untuk menjalankan di Android, iOS, atau Web.

### 2.2 Run di Android (Development)

```bash
npm run android:dev
```

Atau untuk build dan run:

```bash
npm run android:build
```

### 2.3 Run di iOS (Development)

```bash
npm run ios
```

### 2.4 Run di Web (Development)

```bash
npm start -- --web
```

Atau:

```bash
npm run web
```

### 2.5 Development Client (Custom Native Features)

Jika project menggunakan custom native modules:

```bash
npm run android:build-client
```

---

## 📱 Step 3: Build untuk Android

### Option A: Build dengan Expo CLI (Recommended untuk awal)

#### Development Build (with Expo Go):

```bash
expo start --android
```

#### Managed Build:

```bash
eas build --platform android --profile development
```

#### Preview Build (untuk testing):

```bash
eas build --platform android --profile preview
```

#### Production Build:

```bash
eas build --platform android --profile production
```

### Option B: Build Manual dengan Gradle

```bash
cd android
./gradlew clean
./gradlew assembleDebug      # Untuk debug APK
./gradlew assembleRelease    # Untuk release APK
cd ..
```

Output APK akan berada di:

- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### Troubleshooting Android Build:

```bash
# Clear cache
rm -rf android/build
rm -rf node_modules

# Reinstall
npm install
cd android
./gradlew clean

# Build lagi
cd ..
npm run android:build
```

---

## 🍎 Step 4: Build untuk iOS

### Build dengan Expo:

#### Development Build:

```bash
eas build --platform ios --profile development
```

#### Preview Build:

```bash
eas build --platform ios --profile preview
```

#### Production Build:

```bash
eas build --platform ios --profile production
```

### Manual Build dengan Xcode (Advanced):

```bash
npm run ios
```

---

## 🏗️ Step 5: Production Build (Recommended untuk Release)

Project ini sudah dikonfigurasi dengan **EAS (Expo Application Services)** untuk production build.

### 5.1 Setup EAS Account

```bash
eas login
```

Atau jika sudah punya account Expo:

```bash
eas whoami
```

### 5.2 Configure Project

EAS sudah dikonfigurasi di `eas.json`. Cek konfigurasi:

```bash
cat eas.json
```

### 5.3 Build Production untuk Android

```bash
eas build --platform android --profile production
```

### 5.4 Build Production untuk iOS

```bash
eas build --platform ios --profile production
```

### 5.5 Build untuk Kedua Platform Sekaligus

```bash
eas build --platform all --profile production
```

### 5.6 Monitor Build Status

```bash
eas build:list
```

---

## 📦 Step 6: Submitting ke App Store/Play Store

### Android - Google Play Store:

#### 6.1 Generate Release APK atau AAB:

```bash
eas build --platform android --profile production
```

#### 6.2 Upload ke Play Store:

```bash
eas submit --platform android --latest
```

### iOS - Apple App Store:

#### 6.1 Generate IPA:

```bash
eas build --platform ios --profile production
```

#### 6.2 Upload ke App Store:

```bash
eas submit --platform ios --latest
```

---

## 🐛 Step 7: Debugging & Logging

### View Android Logs:

```bash
# Semua logs
npm run logcat:all

# JavaScript errors
npm run logcat:js

# Hanya errors
npm run logcat:errors

# Crash logs
npm run logcat:crash

# Fatal errors
npm run logcat:fatal
```

### View Console Output:

```bash
# Saat development
npm start
# Maka akan melihat logs di terminal
```

---

## ✅ Step 8: Quality Checks

### 8.1 Type Checking

```bash
npm run type:checking
```

### 8.2 Verifikasi Build Artifacts

```bash
# Untuk Android
ls -la android/app/build/outputs/

# Untuk iOS (setelah build)
ls -la ios/
```

---

## 📝 Environment & Configuration

### App Configuration:

- **App Name**: Cikaret Setra Pay
- **App Slug**: cikaret-setra-pay
- **Version**: 2.0.0
- **Package Name (Android)**: com.cikaret.setra.pay
- **Bundle ID (iOS)**: com.cikaret.setra.pay

### Android Requirements:

- Min SDK: 26
- Permissions: Bluetooth, Location, dll (lihat app.json)

---

## 🔄 Workflow Rekomendasi

### Untuk Development:

```bash
npm install
npm start
# Pilih Android atau iOS di menu
```

### Untuk Testing Internal (EAS):

```bash
npm install
npm run type:checking
eas build --platform android --profile preview
# atau
eas build --platform ios --profile preview
```

### Untuk Production Release:

```bash
npm install
npm run type:checking
npm run android:build  # Test local build dulu
eas build --platform all --profile production
eas submit --platform android --latest
eas submit --platform ios --latest
```

---

## 🆘 Troubleshooting Umum

### Issue: "Clear watchman cache"

```bash
watchman watch-del-all
rm -rf node_modules
npm install
```

### Issue: "Metro bundler error"

```bash
npm start --reset-cache
```

### Issue: "Android build fails"

```bash
cd android
./gradlew clean
cd ..
npm run android:build
```

### Issue: "iOS build fails"

```bash
rm -rf ios/Pods
cd ios
pod install
cd ..
npm run ios
```

### Issue: Expo Go app closes immediately

```bash
npm run android:dev
# atau
npm start --dev-client
```

---

## 📚 Resources

- **Expo Documentation**: https://docs.expo.dev/versions/v56.0.0/
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Android Studio Setup**: https://developer.android.com/studio/install
- **Xcode Installation**: https://apps.apple.com/us/app/xcode/id497799835

---

## 📞 Quick Reference Commands

```bash
# Development
npm start                          # Start Expo dev server
npm run android:dev               # Android dev
npm run ios                        # iOS dev
npm run web                        # Web dev

# Building
npm run android:build              # Build Android
npm run ios                         # Build iOS
eas build --platform all           # Build both platforms

# Testing
npm run type:checking              # Type checking
npm run logcat:js                  # View JS logs

# Production
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit --platform android --latest
eas submit --platform ios --latest
```

---

**Last Updated**: 2026-07-11  
**Expo Version**: 56.0.14  
**React Native Version**: 0.85.3
