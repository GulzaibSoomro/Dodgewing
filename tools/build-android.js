#!/usr/bin/env node
/* Refresh Android's offline WebView payload and launcher icon from source assets. */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const copy=(from,to)=>{fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to)};
execFileSync(process.execPath,[path.join(__dirname,'build.js')],{stdio:'inherit'});
copy(path.join(root,'dist','dodgewing.html'),path.join(root,'android','app','src','main','assets','www','dodgewing.html'));
copy(path.join(root,'assets','icons','dodgewing-app-icon-512.png'),path.join(root,'android','app','src','main','res','drawable','app_icon.png'));
console.log('prepared Android assets');
