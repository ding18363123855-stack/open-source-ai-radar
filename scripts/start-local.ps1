$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$runtimeDirectory = Join-Path $projectRoot '.local'
New-Item -ItemType Directory -Force -Path $runtimeDirectory | Out-Null
$pidFile = Join-Path $runtimeDirectory 'server.pid'
if (Test-Path -LiteralPath $pidFile) {
    $serverPid = [int](Get-Content -LiteralPath $pidFile)
    $running = Get-CimInstance Win32_Process -Filter "ProcessId = $serverPid" -ErrorAction SilentlyContinue
    if ($running -and $running.CommandLine -like ('*http.server*' + $projectRoot + '*dist*')) {
        Write-Output 'Already running: http://127.0.0.1:4321/'
        exit 0
    }
}
$distDirectory = Join-Path $projectRoot 'dist'
if (-not (Test-Path -LiteralPath (Join-Path $distDirectory 'index.html'))) { throw 'Build the website first.' }
$pythonPath = Join-Path $projectRoot '.venv/Scripts/python.exe'
$serverProcess = Start-Process -FilePath $pythonPath -ArgumentList @('-m', 'http.server', '4321', '--bind', '127.0.0.1', '--directory', ('"' + $distDirectory + '"')) -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeDirectory 'server.log') -RedirectStandardError (Join-Path $runtimeDirectory 'server-error.log')
Set-Content -LiteralPath $pidFile -Value $serverProcess.Id
Write-Output ('Started PID ' + $serverProcess.Id + ': http://127.0.0.1:4321/')
