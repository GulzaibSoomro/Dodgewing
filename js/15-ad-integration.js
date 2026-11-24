// Keep native earned credits on the real save, including during optional flights.
for(const key of ['nativeRescueCredit','nativeRescueInFlight']){const c=save[key];if(c&&(!(typeof c.id==='string'&&/^[0-9a-f-]{36}$/i.test(c.id))||!Number.isInteger(c.level)||c.level<1||c.level>30))delete save[key]}
const integratedReceiveRescue=receiveNativeRescue;
receiveNativeRescue=function(id,level){if(!modeCampaignSave)return integratedReceiveRescue(id,level);const scratch=save;save=modeCampaignSave;try{return integratedReceiveRescue(id,level)}finally{save=scratch}};
window.receiveNativeRescue=receiveNativeRescue;
const integratedRedeemRescue=redeemNativeRescue;
redeemNativeRescue=function(){if(flightMode)return false;const ok=integratedRedeemRescue();if(ok)ensureBossEntry();return ok};
const integratedRewardRequest=requestRewardedRescue;
requestRewardedRescue=function(){return flightMode?false:integratedRewardRequest()};
const integratedRewardRefresh=refreshRewardedRescue;
refreshRewardedRescue=function(){integratedRewardRefresh();if(flightMode)$('rewarded-rescue').classList.add('hide')};
// A claimed fullscreen decision must still recover if the native callback is lost.
const integratedClaim=window.claimInterstitialDecision;
window.claimInterstitialDecision=function(serial){const ok=integratedClaim(serial);if(ok)adBreakTimer=setTimeout(()=>finishAdBreak(serial),125000);return ok};
const integratedFinishVictory=finishVictory;
finishVictory=function(){delete save.nativeRescueInFlight;integratedFinishVictory()};
const integratedLegacyReward=onRewardedRescueResult;
onRewardedRescueResult=function(earned){integratedLegacyReward(earned);if(earned&&S==='play')ensureBossEntry()};
window.onRewardedRescueResult=onRewardedRescueResult;
