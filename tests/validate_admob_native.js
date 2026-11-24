// Source-level checks complement browser tests; real SDK and Activity lifecycle require Android device QA.
const fs=require('fs'),assert=require('assert');
const s=fs.readFileSync('android/app/src/main/java/com/gulzaibsoomro/dodgewing/MainActivity.java','utf8');
const p=fs.readFileSync('android/app/src/main/java/com/gulzaibsoomro/dodgewing/AdPolicy.java','utf8');
const ids=fs.readFileSync('android/app/src/release/res/values/ads.xml','utf8');
const check=(v,m)=>{assert(v,m);console.log('PASS '+m)};
check(s.includes('getPrivacyOptionsRequirementStatus()')&&s.includes('UserMessagingPlatform.showPrivacyOptionsForm('),'UMP privacy requirement and official form wired');
check(s.includes('clearAdInventory();\n            handleConsentReady();')&&s.includes('generation != consentGeneration'),'privacy changes invalidate preloaded and in-flight ads');
check(s.includes('screen.serial == serial && "over".equals(screen.name)')&&s.includes('current.serial != serial')&&s.includes('claimInterstitialDecision'),'interstitial checks screen and guarded decision before show');
check(s.includes('getLong("last_interstitial_shown", -1)')&&s.includes('putLong("last_interstitial_shown", lastInterstitialShown).commit()')&&s.includes('System.currentTimeMillis()'),'shown interstitial timestamp survives Activity recreation');
check(p.includes('EVERY_ELIGIBLE_RUNS = 3')&&p.includes('MIN_RUN_SECONDS = 30')&&p.includes('MIN_INTERVAL_MS = 120_000L'),'original frequency limits retained');
const reward=s.slice(s.indexOf('private void showRewardedRescue('),s.indexOf('/** Called from the local game'));
check(reward.includes('reward -> {')&&reward.includes('earned.compareAndSet(false, true)')&&reward.includes('putString("earned_rescue_id"')&&reward.includes('putInt("earned_rescue_level"'),'earned callback persists one rescue credit');
check(reward.includes('finished.get()) notifyCurrentRescue()')&&s.includes('window.receiveNativeRescue')&&s.includes('id.equals(prefs.getString("earned_rescue_id", ""))'),'late callback and acknowledged durable delivery supported');
check(!ids.includes('ca-app-pub-3940256099942544')&&['~3768372423','/5819820697','/5129555550','/1775624742'].every(id=>ids.includes('ca-app-pub-5426938423910801'+id)),'production ad identifiers unchanged');
console.log('TOTAL 8 passed');
