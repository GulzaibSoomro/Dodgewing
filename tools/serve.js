#!/usr/bin/env node
// Minimal dependency-free local server for source-mode play and browser tests.
const fs=require('fs');
const http=require('http');
const path=require('path');
const root=path.resolve(__dirname,'..');
const port=Number(process.env.PORT)||5500;
const types={'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.ttf':'font/ttf','.pdf':'application/pdf'};
http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404).end('Not found');return}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  });
}).listen(port,()=>console.log('Dodgewing source server: http://localhost:'+port));
