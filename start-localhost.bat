@echo off
title HustleCraft Local Server
cd /d "%~dp0"
echo Starting HustleCraft at http://localhost:8000
echo Keep this window open while using the website.
echo Press Ctrl+C to stop the server.
py -m http.server 8000
if errorlevel 1 (
  echo Python launcher was not found or server failed. Trying python...
  python -m http.server 8000
)
pause
