#!/usr/bin/env bash
# Linux: uygulamayı başlatır ve tarayıcıda açar. Çalıştırmak için: ./baslat.sh
cd "$(dirname "$0")"
command -v npm >/dev/null || { echo "Node.js bulunamadı. https://nodejs.org adresinden LTS sürümünü kur."; exit 1; }
[ -d node_modules ] || npm install
npm run dev
