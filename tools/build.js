#!/usr/bin/env node
/* Build dist/dodgewing.html without requiring Python.
 * The original tools/build.py remains available for Python-based environments. */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const data=file=>fs.readFileSync(path.join(root,file)).toString('base64');
let html=read('index.html');
let css=read('css/style.css');
// The standalone HTML and APK redistribute the fonts, so carry their licenses.
css+='\n/* Bundled font licenses\n'+['Oxanium-OFL.txt','BarlowSemiCondensed-OFL.txt'].map(file=>read('assets/fonts/'+file)).join('\n\n').replace(/\*\//g,'* /').replace(/[ \t]+$/gm,'')+'\n*/\n';
css=css.replace(/url\("\.\.\/(assets\/fonts\/[\w\-.]+)"\)/g,(_,file)=>'url("data:font/ttf;base64,'+data(file)+'")');
html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>\n'+css+'\n</style>');
html=html.replace(/href="(assets\/icons\/[^\"]+\.(?:png|ico))"/g,(_,file)=>'href="data:'+(file.endsWith('.ico')?'image/x-icon':'image/png')+';base64,'+data(file)+'"');
html=html.replace(/src="(assets\/splash\/[^\"]+\.svg)"/g,(_,file)=>'src="data:image/svg+xml;base64,'+data(file)+'"');
const sources=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
let js=sources.map(read).join('\n');
js=js.replace(/assets\/planes\/[\w-]+\.png/g,file=>'data:image/png;base64,'+data(file));
js=js.replace(/assets\/missiles\/[\w-]+\.svg/g,file=>'data:image/svg+xml;base64,'+data(file));
js=js.replace(/assets\/bosses\/[\w-]+\.svg/g,file=>'data:image/svg+xml;base64,'+data(file));
js=js.replace(/assets\/missiles\/[\w-]+\.png/g,file=>'data:image/png;base64,'+data(file));
js=js.replace(/assets\/bosses\/[\w-]+\.png/g,file=>'data:image/png;base64,'+data(file));
html=html.replace(/(<script src="[^"]+"><\/script>\s*)+/, '<script>\n'+js+'\n</script>\n');
const out=path.join(root,'dist','dodgewing.html');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,html,'utf8');
console.log('built',out,Math.round(Buffer.byteLength(html)/1024),'KB');
