#!/usr/bin/env node
/* Refresh Android's offline WebView payload and launcher icon from source assets. */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const copy=(from,to)=>{fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to)};
execFileSync(process.execPath,[path.join(__dirname,'build.js')],{stdio:'inherit'});
// Keep the existing URL/localStorage origin, but let WebView cache and decode
// individual assets instead of parsing megabytes of duplicated Base64 strings.
const www=path.join(root,'android','app','src','main','assets','www');
copy(path.join(root,'index.html'),path.join(www,'dodgewing.html'));
for(const dir of ['js','css','assets'])fs.cpSync(path.join(root,dir),path.join(www,dir),{recursive:true});
copy(path.join(root,'manifest.webmanifest'),path.join(www,'manifest.webmanifest'));
copy(path.join(root,'assets','icons','dodgewing-app-icon-512.png'),path.join(root,'android','app','src','main','res','drawable','app_icon.png'));
console.log('prepared Android assets');
