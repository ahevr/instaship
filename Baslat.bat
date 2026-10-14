@echo off
rem Cift tiklayinca uygulamayi baslatir ve tarayicida acar.
cd /d "%~dp0"
where npm >nul 2>nul || (
  echo Node.js bulunamadi. https://nodejs.org adresinden LTS surumunu kurup tekrar dene.
  pause
  exit /b 1
)
if not exist node_modules call npm install
call npm run dev
pause
