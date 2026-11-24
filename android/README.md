# Dodgewing Android build

The app loads the campaign from an offline WebView. The debug variant uses `com.gzsstudio.dodgewing.debug`, separate from the Play installation.

1. Install JDK 17, Android SDK Platform 36 and Android Build Tools. The verified environment had Build Tools 35.0.0 and 36.0.0 installed.
2. Set `ANDROID_HOME` to your SDK, or create a local `android/local.properties` containing its `sdk.dir`.
3. From the repository root, run `npm run prepare:android`.
4. Run `./android/gradlew -p android :app:assembleDebug` or, on Windows, `.\android\gradlew.bat -p android :app:assembleDebug`.

Gradle writes the local debug APK to `android/app/build/outputs/apk/debug/app-debug.apk`. The first build requires network access for any missing dependencies. The debug task uses Android's development signer. The app requires Android 7.0 (API 24) or later and targets API 36.

See the [v2.2 QA report](../V22-PROGRESS.md) for package and gameplay verification.
