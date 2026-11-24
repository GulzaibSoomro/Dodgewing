// Static integration guard; physical Android/AdMob behavior still needs device QA.
const fs=require('fs'),assert=require('assert');
const s=fs.readFileSync('android/app/src/main/java/com/gulzaibsoomro/dodgewing/MainActivity.java','utf8');
const source=s.slice(s.indexOf('protected void onCreate'),s.indexOf('/** EEA/UK consent'));
assert(source.indexOf('root.addView(bannerHolder')<source.indexOf('root.addView(game'), 'banner occupies the row above the WebView');
assert(source.includes('bannerHolder.setVisibility(View.GONE)'), 'banner starts collapsed');
assert(source.includes('setOnApplyWindowInsetsListener')&&source.includes('WindowInsets.Type.displayCutout()'), 'root applies native system/cutout insets');
const loader=s.slice(s.indexOf('private void loadBanner()'),s.indexOf('private void loadInterstitial()'));
assert(loader.includes('game.getWidth()')&&loader.includes('bannerOrientation == orientation'), 'banner uses actual WebView width and deduplicates size/orientation');
assert(/onAdLoaded\(\)[\s\S]*?bannerLoaded\s*=\s*true/.test(loader), 'loaded banner is retained');
assert(!/onAdLoaded\(\)[\s\S]*?bannerHolder\.setVisibility\(View\.VISIBLE\)/.test(loader), 'load callback does not shift the active layout');
assert(s.includes('boolean visible = bannerLoaded && bannerScreenAllowed() && canLoadAds()')&&s.includes('visible ? View.VISIBLE : View.GONE'), 'banner visibility is consent and screen gated');
assert(s.includes('"menu".equals(name) || "hangar".equals(name) || "settings".equals(name)'), 'gameplay and game-over screens are excluded');
assert(/onAdFailedToLoad\(LoadAdError error\)[\s\S]*?bannerHolder\.setVisibility\(View\.GONE\)/.test(loader), 'failed banner releases space');
assert(loader.includes('retryLater()')&&s.includes('info.canRequestAds()'), 'retry and consent checks retained');
console.log('PASS 9 native banner static integration assertions');
