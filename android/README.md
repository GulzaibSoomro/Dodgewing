# Dodgewing Android build

This is a small native Android wrapper for the self-contained game. It opens `dodgewing.html` from the app package in a full-screen WebView, so the installed app does not need a network connection to play.

## Build a debug APK

1. Install Android SDK Platform 35 and Build-Tools 35.0.0 in Android Studio.
2. Create `android/local.properties` with your SDK path, for example `sdk.dir=C:\\Users\\you\\AppData\\Local\\Android\\Sdk` on Windows or `sdk.dir=/Users/you/Library/Android/sdk` on macOS.
3. From the project root, run `npm run prepare:android`.
4. Run `cd android && ./gradlew assembleDebug` on macOS/Linux, or `gradlew.bat assembleDebug` on Windows.

The output is `android/app/build/outputs/apk/debug/app-debug.apk`. It is a debug-signed APK for direct testing. Allow installation from your file manager or browser on the Android phone before opening it. Build a release-signed package before publishing to Google Play.
