@echo off
setlocal

REM Change to the directory of this script
pushd %~dp0

REM Install dependencies if node_modules is missing
IF NOT EXIST node_modules (
  echo Installing dependencies...
  npm ci --no-audit --no-fund
)

REM Determine starting port (default 8080 or first arg)
set START_PORT=8080
if NOT "%~1"=="" set START_PORT=%~1

REM Find a free port starting from START_PORT using PowerShell Test-NetConnection
for /f "usebackq delims=" %%p in (`powershell -NoProfile -Command "$p=%START_PORT%; while (Test-NetConnection -ComputerName 127.0.0.1 -Port $p -InformationLevel Quiet) { $p++ }; Write-Output $p"`) do set PORT=%%p

echo Starting server on port %PORT% ...
echo URL: http://127.0.0.1:%PORT%/

REM Start the static server and keep this window open while it runs
npx --yes http-server -c-1 -p %PORT%

echo.
echo Server stopped. Exit code: %errorlevel%
echo Press any key to close this window.
pause > nul

popd
endlocal

