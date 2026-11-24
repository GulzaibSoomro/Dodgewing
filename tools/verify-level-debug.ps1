$ErrorActionPreference='Stop'
$rootPath=(Get-Location).Path
$built='android/app/build/outputs/apk/debug/app-debug.apk'
$out='Dodgewing-Level-Campaign-v2.2-debug.apk'


$kit=Join-Path $env:LOCALAPPDATA 'Android/Sdk/build-tools/36.0.0'
$manifest=& "$kit/aapt.exe" dump badging $built
if($LASTEXITCODE){throw 'Manifest decode failed'}
$manifest|Set-Content -Encoding utf8 test-results/debug-manifest.log
if(($manifest -join "`n") -notmatch "package: name='com\.gzsstudio\.dodgewing\.debug' versionCode='23' versionName='0\.14\.0-debug'" -or $manifest -notcontains "sdkVersion:'24'" -or $manifest -notcontains "targetSdkVersion:'36'" -or $manifest -notcontains 'application-debuggable'){throw 'Unexpected manifest'}
& "$kit/apksigner.bat" verify --verbose --print-certs $built *> test-results/debug-signature.log
if($LASTEXITCODE){throw 'APK signature failed'}
$signature=Get-Content -Raw test-results/debug-signature.log
if($signature -notmatch 'Verified using v2 scheme .*: true' -or $signature -notmatch '604c9556535a9279f1ef1042a3b3dc7ff360397a2a5941d151dd90a472cace63'){throw 'Unexpected debug signer or signature scheme'}
& "$kit/zipalign.exe" -c -P 16 4 $built
if($LASTEXITCODE){throw 'APK alignment failed'}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[IO.Compression.ZipFile]::OpenRead((Resolve-Path $built))
$sha=[Security.Cryptography.SHA256]::Create()
$files=@{}
foreach($file in (Get-ChildItem js,css,assets -Recurse -File)){$files[$file.FullName.Substring($rootPath.Length+1).Replace('\','/')]=$file.FullName}
$files['dodgewing.html']='index.html'
$files['manifest.webmanifest']='manifest.webmanifest'
$entries=@($zip.Entries|Where-Object {$_.FullName.StartsWith('assets/www/') -and $_.Name})
if($entries.Count -ne $files.Count){throw 'Unexpected WebView file count'}
$seen=@{}
$items=foreach($entry in $entries){
 $name=$entry.FullName.Substring(11)
 if(!$files.ContainsKey($name)){throw "Unexpected WebView path $name"}
 if($seen.ContainsKey($name)){throw "Duplicate $name"};$seen[$name]=$true
 $expected=(Get-FileHash -LiteralPath $files[$name]).Hash.ToLowerInvariant()
 $staged=(Get-FileHash -LiteralPath ("android/app/src/main/assets/www/"+$name)).Hash.ToLowerInvariant()
 $stream=$entry.Open()
 try{$digest=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant()}finally{$stream.Dispose()}
 if($expected -ne $digest -or $staged -ne $digest){throw "Mismatch $name"}
 [PSCustomObject]@{file=$name;sha256=$digest}
}
$zip.Dispose();$sha.Dispose()
$items|ConvertTo-Json|Set-Content -Encoding utf8 test-results/debug-webview.json
Write-Output "PASS $($items.Count) exact source/staged/packaged matches, manifest and signature"
if(!(Test-Path -LiteralPath $out)){Copy-Item -LiteralPath $built -Destination $out}
if((Get-FileHash $out).Hash -ne (Get-FileHash $built).Hash){throw 'Artifact differs'}
Get-FileHash $out
