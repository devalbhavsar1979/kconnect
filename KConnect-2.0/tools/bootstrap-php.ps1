$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$runtime = Join-Path $root '.runtime'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
$metadata = Invoke-RestMethod 'https://windows.php.net/downloads/releases/releases.json'
$release = $metadata.'8.4'.'nts-vs17-x64'.zip
$archive = Join-Path $runtime $release.path
if (!(Test-Path $archive)) { Invoke-WebRequest ('https://windows.php.net/downloads/releases/' + $release.path) -OutFile $archive -UseBasicParsing }
if ((Get-FileHash -Algorithm SHA256 $archive).Hash.ToLowerInvariant() -ne $release.sha256) { throw 'PHP archive checksum mismatch' }
$phpDir = Join-Path $runtime 'php'
if (!(Test-Path (Join-Path $phpDir 'php.exe'))) { Expand-Archive -LiteralPath $archive -DestinationPath $phpDir }
$ini = @'
extension_dir="ext"
extension=curl
extension=fileinfo
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=pdo_sqlite
extension=sqlite3
extension=zip
extension=intl
memory_limit=512M
date.timezone=UTC
'@
[IO.File]::WriteAllText((Join-Path $phpDir 'php.ini'), $ini)
$installer = Join-Path $runtime 'composer-setup.php'
Invoke-WebRequest 'https://getcomposer.org/installer' -OutFile $installer -UseBasicParsing
$signature = (Invoke-RestMethod 'https://composer.github.io/installer.sig').Trim()
if ((Get-FileHash -Algorithm SHA384 $installer).Hash.ToLowerInvariant() -ne $signature) { throw 'Composer installer checksum mismatch' }
& (Join-Path $phpDir 'php.exe') $installer --install-dir=$runtime --filename=composer.phar
if ($LASTEXITCODE -ne 0) { throw 'Composer install failed' }
& (Join-Path $phpDir 'php.exe') -v
