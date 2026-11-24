# JS bridge methods must keep their names so the WebView can call them.
-keepclassmembers class com.gulzaibsoomro.dodgewing.MainActivity$AdBridge {
    @android.webkit.JavascriptInterface <methods>;
}
